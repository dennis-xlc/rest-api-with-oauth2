var models = require('../../models');
var accountVerification = require('../../utils/accountVerification');

/**
  Handle 'GET' request for '/join'
**/
exports.accountCreationForm = function (req, res) {
  var result = new accountVerification.JoinVerifyResult();
    res.render('dev/join', {title : "Join us · Shinify", verifyResult : result,
      developer : {name : "", email : ""}});
};



/**
  Handle 'POST' request for '/join'
**/
exports.createAccount = function (req, res) {
  console.log("user: ", req.body.user);

  var user = req.body.user;
  var source = req.body.source_label;

  var verifyResult = new accountVerification.JoinVerifyResult();

  // check the user name
  accountVerification.checkUserName(user.name, function (err, result) {
    if (err) {
      verifyResult.error = true;
      verifyResult.errMsg = err;
    } else {
      verifyResult.error = result.error;
      verifyResult.nameErr = result.msg;
    }

    // check the email
    accountVerification.checkEmail(user.email, function (err, result) {
      if (err) {
        verifyResult.error = true;
        verifyResult.errMsg = err;
      } else {
        verifyResult.error = result.error;
        verifyResult.emailErr = result.msg;
      }

      // check the user password
      accountVerification.checkPassword(user.password, 
        user.password_confirmation, source, function (err, result) {
        if (err) {
          verifyResult.error = true;
          verifyResult.errMsg = err;
        } else {
          verifyResult.error = result.error;
          verifyResult.passwordErr = result.msg;
        }

        if (verifyResult.error) {
            res.render('dev/join', {title : "Join us · Shinify", verifyResult : verifyResult,
              developer : {name : user.name, email : user.email}});
        } else {

          models.developers.save(user, function (err) {
            if (err) {
                res.render('dev/join', {title : "Join us · Shinify", verifyResult : verifyResult,
              developer : {name : user.name, email : user.email}});
            } else {
              req.session.username = user.name;
              req.session.login = true;
              res.redirect('/home');
            }
          });
        }
      });
    });
  });
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
      models.developers.remove(username, function(err) {
        if (err) {
          error = true;
          errMsg = "Cannot delete account due to internal error!";
        }
      });
    }

    if (error) {
      models.developers.getDeveloperInfo(username, function(err, developer){
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
