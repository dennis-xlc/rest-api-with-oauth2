var passport = require('passport');
var config = require('../config');
var db = require('../' + config.db.type);



exports.redirectControl = function (req, res) {
  res.redirect('/');
};

exports.settings = function (req, res) {
  if (req.session && req.session.login) {
    res.redirect('/settings/profile');
  } else {
    res.redirect('/');
  }
};

exports.applicationForm = function (req, res) {
  if (req.session && req.session.login) {

    var username = req.session.username;
    var application = {name : "", url : "", callback : "", description : ""};

    var result = new ApplicationVerifyResult();
    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/');
      } else {
        res.render('dev/application-new', {title : "New OAuth2 Application · Shinify", 
          developer : developer, application : application, verifyResult : result});
      }
    });
  } else {
    res.redirect('/');
  }
};

exports.createApplication = function (req, res) {
  if (req.session && req.session.login) {
    console.log("request body: ", req.body);

    var username = req.session.username;
    var application = req.body.application;

    var result = new ApplicationVerifyResult();

    // check the app name
    checkAppName(application.name, function (err) {
      if (err) {
        result.error = true;
        result.nameErr = err;
      }
    });

    // check the app url
    checkAppUrl(application.url, function (err) {
      if (err) {
        result.error = true;
        result.urlErr = err;
      }
    });

    // check the app callback
    checkAppCallback(application.callback, function (err) {
      if (err) {
        result.error = true;
        result.callbackErr = err;
      }
    });

    
    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/');
      } else {
        if (result.error) {
          res.render('dev/application-new', {title : "New OAuth2 Application · Shinify", 
                developer : developer, application : application, verifyResult : result});
        } else {
          db.developers.saveApplication(username, application, function (err) {
            res.redirect('/settings/applications');
          });
        }
        
      }
    });

  } else {
    res.redirect('/');
  }
};

exports.removeAccount = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;
    var error = false;
    var errMsg;
    if (req.body.username != username) {
      error = true;
      errMsg = "Cannot delete account due to invalid user name!";
    } else {
      db.developers.remove(username, function(err) {
        if (err) {
          error = true;
          errMsg = "Cannot delete account due to internal error!";
        }
      });
    }

    if (error) {
      db.developers.getDeveloperInfo(username, function(err, developer){
        if (err) {
          res.redirect('/home');
        } else {
          res.render('dev/admin', {title : "Account Settings · Shinify",
              successUpdate : false, error : true, errMsg : errMsg, developer : developer});
        }
      });
    } else {
      req.session.destroy();
      res.redirect('/');
    }


  } else {
    res.redirect('/');
  }
};

exports.resetPassword = function (req, res) {
  if (req.session && req.session.login) {
  } else {
    res.redirect('/');
  }
};

exports.changePassword = function (req, res) {
  if (req.session && req.session.login) {

    var username = req.session.username;
    var user = req.body.user;

    var error = false;
    var errMsg;

    db.developers.verifyPassword(username, user.old_password, function(err) {
      if (err) {
        error = true;
        errMsg = "Old password is invalid!";
      }
      else {
        // check the user password
        checkPassword(user.password, user.password_confirmation, "Detail", function (err) {
          if (err) {
            error = true;
            errMsg = err;
          } else {
            db.developers.updatePassword(username, user.password, function (err) {
              if (err) {
                error = true;
                errMsg = "Error when updating passwrod, please try again later!";
              }
            });
          }
        });
      }
    });

    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/home');
      } else {
        res.render('dev/admin', {title : "Account Settings · Shinify",
            successUpdate : !error, error : error, errMsg : errMsg, developer : developer});
      }
    });

  } else {
    res.redirect('/');
  }
};

exports.profile = function (req, res) {
  if (req.session && req.session.login) {

    var username = req.session.username;

    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/home');
      } else {
        res.render('dev/profile', {title : "Your Profile · Shinify",
              successUpdate : false, error : false, developer : developer});
      }
    });

  } else {
    res.redirect('/');
  }
};

exports.updateProfile = function (req, res) {
  if (req.session && req.session.login) {

    var username = req.session.username;
    var profile = req.body.profile;

    console.log("trying update profile for user: ", username);
    console.log("profile: ", profile);

    db.developers.updateProfile(username, profile, function(err, developer){
      if (err) {
        //res.redirect('/settings/profile');
      }

      res.render('dev/profile', {title : "Your Profile · Shinify",
            successUpdate : true, error : false, developer : developer});

    });


  } else {
    res.redirect('/');
  }
};

exports.avatarPolicy = function (req, res) {
  if (req.session && req.session.login) {

    console.log("request avatar policy: ", req.body);

    var username = req.session.username;

    var fileName = req.body.name;
    var fileSize = parseInt(req.body.size);
    var contentType = req.body.content_type;

    var policy = {};

    policy.upload_url = "https://10.249.210.108:3000/upload/avatar";
    policy.header = {Accept : "application/json; charset=utf-8"};
    policy.asset = {size : fileSize, content_type : contentType};
    policy.form = {size : fileSize, content_type : contentType};

    res.setHeader("Status", "201 Created");
    res.setHeader("Vary", "X-PJAX");
    res.status(201).json(policy);

  } else {
    res.json({message : 'Need Login'});
  }
};

exports.uploadAvatar = function (req, res) {
  if (req.session && req.session.login) {

    console.log("upload avatar : ", req);

  } else {
    res.json({message : 'Need Login'});
  }
};

exports.admin = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;

    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/home');
      } else {
        res.render('dev/admin', {title : "Account Settings · Shinify",
          successUpdate : false, error : false, developer : developer});
      }
    });

  } else {
    res.redirect('/');
  }
};

exports.applications = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;

    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/home');
      } else {
        res.render('dev/applications', {title : "Authorized Applications · Shinify",
          successUpdate : false, error : false, developer : developer});
      }
    });
  } else {
    res.redirect('/');
  }
};


exports.index = function (req, res) {

  if (req.session && req.session.login) {
    res.redirect('/home');
  } else {
    res.render('dev/index', {title : "Shinify · Build your own client quickly."});
  }
};

exports.home = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;

    var title = "Shinify · " + username;
    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/');
      } else {
        res.render('dev/home', {title : title, developer : developer});
      }
    });

  } else {
    res.redirect('/');
  }
};

exports.loginForm = function (req, res) {
    res.render('dev/login', {title : "Sign in · Shinify", error : false, username : ""});
};

exports.joinForm = function (req, res) {
  var result = new JoinVerifyResult();
    res.render('dev/join', {title : "Join us · Shinify", verifyResult : result,
      developer : {name : "", email : ""}});
};

exports.logout = function (req, res) {
  console.log("trying logout user: ", req.session.username);
    req.session.destroy();
    res.redirect('/login');
};

exports.login = function (req, res) {
  console.log("trying login user: ", req.body.user);

  var username = req.body.user.username;
  var password = req.body.user.password;

  db.developers.verifyPassword(username, password, function(err) {
    if (err) {
      res.render('dev/login', {title : "Sign in · Shinify", error : true, username : username});
    }
    else {
      req.session.username = username;
      req.session.login = true;
      res.redirect('/home');
    }
  });
};


exports.join = function (req, res) {
  console.log("user: ", req.body.user);

  var user = req.body.user;
  var source = req.body.source_label;

  var result = new JoinVerifyResult();

  // check the user name
  checkUserName(user.name, function (err) {
    if (err) {
      result.error = true;
      result.nameErr = err;
    }
  });

  // check the email
  checkEmail(user.email, function (err) {
    if (err) {
      result.error = true;
      result.emailErr = err;
    }
  });

  // check the user password
  checkPassword(user.password, user.password_confirmation, source, function (err) {
    if (err) {
      result.error = true;
      result.passwordErr = err;
    }
  });


  if (result.error) {
      res.render('dev/join', {title : "Join us · Shinify", verifyResult : result,
        developer : {name : user.name, email : user.email}});
  } else {

    db.developers.save(user, function (err) {
      if (err) {
          res.render('dev/join', {title : "Join us · Shinify", verifyResult : result,
        developer : {name : user.name, email : user.email}});
      } else {
        req.session.username = user.name;
        req.session.login = true;
        res.redirect('/home');
      }
    });


  }


};

function JoinVerifyResult () {
  this.error = false;
  this.nameErr = null;
  this.emailErr = null;
  this.passwordErr = null;
};

function checkUserName(username, done) {

  if (username === "") {
    console.log("Username must not be blank!");
    return done("Username must not be blank!");
  }

  var pattern = /^([a-zA-Z])([a-zA-Z0-9-])+/;
  if (!pattern.test(username)) {
    console.log("Username may only contain alphanumeric characters or dashes(-) and cannot begin with a dash!");
    return done("Username may only contain alphanumeric characters or dashes(-) and cannot begin with a dash!");
  }

  if (db.developers.checkUserNameExist(username)) {
    console.log("Username is already taken!");
    return done("Username is already taken!");
  }

  return done(null);
};

function checkEmail(email, done) {

  if (email === "") {
    console.log("Email must not be empty!");
    return done("Email must not be empty!");
  }

  var pattern = /^([\.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
  if (!pattern.test(email)) {
    console.log("Email is invalid!");
    return done("Email is invalid");
  }

  if (db.developers.checkEmailExist(email)) {
    console.log("Email is already exist!");
    return done("Email is already exist!");
  }

  return done(null);
};


function checkPassword(passwd, verifyPasswd, source, done) {
  if (passwd === "") {
    console.log("Password must not be empty!");
    return done("Password must not be empty!");
  }

  var lowercaseLetterPattern = /[a-z]/;
  var numberPattern = /[0-9]/;
  if (passwd.length < 8 ) {
    if (!lowercaseLetterPattern.test(passwd)) {
      console.log("Password is too short (minimum is 7 characters) and needs at least one lowercase letter!");
      return done("Password is too short (minimum is 7 characters) and needs at least one lowercase letter!");
    } else if (!numberPattern.test(passwd)) {
      console.log("Password is too short (minimum is 7 characters) and needs at least one number!");
      return done("Password is too short (minimum is 7 characters) and needs at least one number!");
    } else {
      console.log("Password is too short (minimum is 7 characters)!");
      return done("Password is too short (minimum is 7 characters)!");
    }
  } else  {
    if (!lowercaseLetterPattern.test(passwd)) {
      console.log("Password needs at least one lowercase letter!");
      return done("Password needs at least one lowercase letter!");
    } else if (!numberPattern.test(passwd)) {
      console.log("Password needs at least one number!");
      return done("Password needs at least one number!");
    }
  }

  // if the request is from Detail page, then check confirmation password
  // otherwise, bypass this check
  if (source === "Detail") {
    if (verifyPasswd != passwd) {
      console.log("Password doesn't match the confirmation!");
      return done("Password doesn't match the confirmation!");
    }
  }


  return done(null);

};

function ApplicationVerifyResult () {
  this.error = false;
  this.nameErr = null;
  this.urlErr = null;
  this.callbackErr = null;
};

function checkAppName(name, done) {

  if (name === "") {
    console.log("Application name must not be blank!");
    return done("Application name must not be blank!");
  }

  return done(null);
};

function checkAppUrl(url, done) {

  if (url === "") {
    console.log("Homepage URL must not be blank!");
    return done("Homepage URL must not be blank!");
  }

  var pattern = /^http:\/\/([a-zA-Z0-9-_.\/])+/;
  if (!pattern.test(url)) {
    console.log("Homepage URL is invalid and must start with \"http://\"!");
    return done("Homepage URL is invalid and must start with \"http://\"!");
  }

  return done(null);
};

function checkAppCallback(callback, done) {

  if (callback === "") {
    console.log("Callback Url must not be blank!");
    return done("Callback Url must not be blank!");
  }

  var pattern = /^http:\/\/([a-zA-Z0-9-_.\/])+/;
  if (!pattern.test(callback)) {
    console.log("Callback Url is invalid and must start with \"http://\"!");
    return done("Callback Url is invalid and must start with \"http://\"!");
  }

  return done(null);
};
