var config = require('../../config');
var db = require('../../' + config.db.type);


/**
  Handle 'GET' request for '/login'
**/
exports.loginForm = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;

    var title = "Shinify · " + username;
    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/');
      } else {
        res.redirect('/home');
      }
    });

  } else {
    res.render('dev/login', {title : "Sign in · Shinify", error : false, username : ""});
  }

};


/**
  Handle 'POST' request for '/login'
**/
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


/**
  Handle 'POST' request for '/logout'
**/
exports.logout = function (req, res) {
  console.log("trying logout user: ", req.session.username);
    req.session.destroy();
    res.redirect('/login');
};
