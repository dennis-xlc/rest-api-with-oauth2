var config = require('../../config');
var db = require('../../' + config.db.type);
var sendMailUtils = require('../../utils/send-mail');


exports.resetPasswdEmailForm = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;
    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/home');
      } else {
        res.render('dev/passwd-reset-request', {title : "Forget Your Password? · Shinify",
              login : true, error : false, developer : developer});
      }
    });
  } else {
    res.render('dev/passwd-reset-request', {title : "Forget Your Password? · Shinify",
          login : false, error : false, email : ""});
  }
};

exports.resetPasswordEmailRequest = function (req, res) {
  var email = req.body.email;
  console.log("trying to reset password for email: ", email);

  var loggedIn = (req.session && req.session.login);
  var devInfo;
  if (loggedIn) {
    var username = req.session.username;
    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/home');
      } else {
        devInfo = developer;
      }
    });
  }

  db.developers.getDeveloperByEmail(email, function (err, developer) {
    if (err) {
      if (loggedIn) {
        res.render('dev/passwd-reset-request', {title : "Forget Your Password? · Shinify",
              login : loggedIn, error : true, errMsg : err, developer : devInfo});
      } else {
        res.render('dev/passwd-reset-request', {title : "Forget Your Password? · Shinify",
              login : loggedIn, error : true, errMsg : err, email : email});
      }

    } else {
      db.passwdresettokens.generate(developer.name, email, function (err, tokenId) {
        if (err) {
          res.redirect('/');
        } else {
          var recevier;
          if (developer.fullName) {
            recevier = developer.fullName + " <" + developer.email + ">";
          } else {
            recevier = developer.name + " <" + developer.email + ">";
          }


          console.log("try to send reset mail to : ", recevier);
          sendMailUtils.sendResetPasswdRequestMail(recevier, tokenId, function (err) {
            if (err) {
              console.log("err : ", err);
              res.redirect('/');
            } else {
              if (loggedIn) {
                res.render('dev/passwd-reset-confirm', {title : "Password Sent! · Shinify", login : loggedIn, developer : devInfo});
              } else {
                res.render('dev/passwd-reset-confirm', {title : "Password Sent! · Shinify", login : loggedIn});
              }
            }
          });
        }
      });
    }
  });
};

exports.resetPasswordForm = function (req, res) {
  var loggedIn = (req.session && req.session.login);
  var tokenId = req.params.token_id;

  var devInfo;
  if (loggedIn) {
    var username = req.session.username;
    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/home');
      } else {
        devInfo = developer;
      }
    });
  }

  db.passwdresettokens.find(tokenId, function (err, token) {
    var errMsg;
    var tokenId;
    if (err) {
      errMsg = "It looks like you clicked on an invalid password reset link. Please try again.";
    } else {
      var now = new Date().getTime();
      if (token.expiredDate < now) {
        errMsg = "It looks like you clicked on an expired password reset link. Please try again.";
      }

      tokenId = token.id;
    }

    if (errMsg) {
      if (loggedIn) {
        res.render('dev/passwd-reset-request', {title : "Forget Your Password? · Shinify",
              login : loggedIn, error : true, errMsg : errMsg, developer : devInfo});
      } else {
        res.render('dev/passwd-reset-request', {title : "Forget Your Password? · Shinify",
              login : loggedIn, error : true, errMsg : errMsg, email : ""});
      }
    } else {
      if (loggedIn) {
        res.render('dev/passwd-reset', {title : "Change your password · Shinify",
              login : loggedIn, error : false, errMsg : errMsg, developer : devInfo, token_id : tokenId});
      } else {
        res.render('dev/passwd-reset', {title : "Change your password · Shinify",
              login : loggedIn, error : false, errMsg : errMsg, token_id : tokenId});
      }
    }
  });
};

exports.resetPassword = function (req, res) {

  var password = req.body.password;
  var password_confirmation = req.body.password_confirmation;

  var loggedIn = (req.session && req.session.login);
  var tokenId = req.params.token_id;

  var devInfo;
  if (loggedIn) {
    var username = req.session.username;
    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/home');
      } else {
        devInfo = developer;
      }
    });
  }

  db.passwdresettokens.find(tokenId, function (err, token) {
    var errMsg;
    if (err) {
      errMsg = "It looks like you clicked on an invalid password reset link. Please try again.";
    } else {
      var now = new Date().getTime();
      if (token.expiredDate < now) {
        errMsg = "It looks like you clicked on an expired password reset link. Please try again.";
      }
    }

    if (errMsg) {
      if (loggedIn) {
        res.render('dev/passwd-reset', {title : "Change your password · Shinify",
              login : loggedIn, error : true, errMsg : errMsg, developer : devInfo, token_id : tokenId});
      } else {
        res.render('dev/passwd-reset', {title : "Change your password · Shinify",
              login : loggedIn, error : true, errMsg : errMsg, token_id : tokenId});
      }
    } else {

      var errMsg;
      // check the user password
      checkPassword(password, password_confirmation, "Detail", function (err) {
        if (err) {
          errMsg = err;
        } else {
          db.developers.updatePassword(token.username, password, function (err) {
            if (err) {
              errMsg = "Error when updating passwrod, please try again later!";
            } else {
              console.log("try to send reset mail to : ", token.email);
              sendMailUtils.sendResetPasswdConfirmMail(token.username, token.email, function (err) {
                if (err) {
                  console.log("err : ", err);
                }
              });
            }
          });
        }
      });

      if (errMsg) {
        if (loggedIn) {
          res.render('dev/passwd-reset', {title : "Change your password · Shinify",
              login : loggedIn, error : true, errMsg : errMsg, developer : devInfo, token_id : tokenId});
        } else {
          res.render('dev/passwd-reset', {title : "Change your password · Shinify",
              login : loggedIn, error : true, errMsg : errMsg, token_id : tokenId});
        }
      } else {
        if (loggedIn) {
          res.redirect('/home');
        } else {
          res.redirect('/login');
        }
      }
    }

  });




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
