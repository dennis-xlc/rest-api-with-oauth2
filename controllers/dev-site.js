var passport = require('passport');

exports.index = function (req, res) {
    res.render('index');
};

exports.loginForm = function (req, res) {
    res.render('login');
};

exports.joinForm = function (req, res) {
    res.render('join');
};

exports.login = [
    passport.authenticate('local', {successReturnToOrRedirect: '/', failureRedirect: 'login'})
];
