var passport = require('passport');
var config = require('../config');
var db = require('../' + config.db.type);

exports.index = function (req, res) {
    res.render('index');
};

exports.loginForm = function (req, res) {
    res.render('login');
};

exports.joinForm = function (req, res) {
    res.render('join', {errMsg : null});
};

exports.login = [

    passport.authenticate('dev_local', {successReturnToOrRedirect: '/', failureRedirect: 'login'})
];

exports.join = function (req, res) {
  console.log("user: ", req.body.user);

  var errMsg = {};

  // check the user name
  checkUserName(req.body.user.name, function (err) {
    if (err) {
      errMsg.nameErr = err;
    }
  });



  db.developers.save(req.body.user, function (err) {

    if (err) {
        return done(err);
    }

    if (errMsg) {
      res.render('join', {errMsg : errMsg});
    } else {
      res.redirect('login');
    }

  });

function checkUserName(username, done) {
  if (db.developers.checkUserNameExist(username)) {
    return done("username is already exist!");
  }

  return done(null);
}

};
