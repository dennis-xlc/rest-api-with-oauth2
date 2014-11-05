var config = require('../../config');
var db = require('../../' + config.db.type);

/**
  Handle 'GET' request for '/join'
**/
exports.accountCreationForm = function (req, res) {
  var result = new JoinVerifyResult();
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
