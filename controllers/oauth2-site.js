//TODO Document all of this

var passport = require('passport');

exports.index = function (req, res) {
    res.render('oauth2/index');
};

exports.loginForm = function (req, res) {
    res.render('oauth2/login');
};

exports.login = [
    passport.authenticate('local', {successReturnToOrRedirect: '/api', failureRedirect: 'login'})
];
