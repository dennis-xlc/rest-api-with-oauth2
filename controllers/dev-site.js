var passport = require('passport');
var config = require('../config');
var db = require('../' + config.db.type);

function VerifyResult () {
  this.error = false;
  this.nameErr = null;
  this.emailErr = null;
  this.passwordErr = null;
}

function Developer () {
  this.name = "";
  this.email = "";
}

exports.index = function (req, res) {
    res.render('index');
};

exports.loginForm = function (req, res) {
    res.render('login');
};

exports.joinForm = function (req, res) {
  var result = new VerifyResult();
    res.render('join', {verifyResult : result, 
      developer : {name : "", email : ""}});
};

exports.login = [

    passport.authenticate('dev_local', {successReturnToOrRedirect: '/', failureRedirect: 'login'})
];

exports.join = function (req, res) {
  console.log("user: ", req.body.user);

  var user = req.body.user;

  var result = new VerifyResult();

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
  checkPassword(user.password, user.password_confirmation, function (err) {
    if (err) {
      result.error = true;
      result.passwordErr = err;
    }
  });


  if (result.error) {
      res.render('join', {verifyResult : result, 
        developer : {name : user.name, email : user.email}});
  } else {

    db.developers.save(user, function (err) {
      if (err) {
          return done(err);
      }
      res.redirect('login');
    });

      
  }

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
}

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
}

function checkPassword(passwd, verifyPasswd, done) {
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


  if (verifyPasswd != passwd) {
    console.log("Password doesn't match the confirmation!");
    return done("Password doesn't match the confirmation!");
  }

  return done(null);

}

};
