//TODO Document all of this

var passport = require('passport');

exports.index = function (req, res) {
    res.render('index');
};

exports.loginForm = function (req, res) {
    res.render('login');
};

exports.login = [
    passport.authenticate('local', {successReturnToOrRedirect: '/', failureRedirect: '/login'})
];
