var config = require('../config');
var utils = require('../utils');

var tokens = {};

exports.generate = function (username, email, done) {
	var tokenId = utils.uid(config.token.passwdResetTokenLength);
	var expiredDate = config.token.passwdResetTokenExpirationDate();

	tokens[tokenId] = {username : username, email : email, id : tokenId, expiredDate : expiredDate};

	console.log("add token : ", tokens[tokenId]);

	return done(null, tokenId);
};

exports.find = function (tokenId, done) {
	var token = tokens[tokenId];
	if (token) {
		return done(null, token);
	}

	return done("Invalid token id", null);
};

exports.removeExpired = function(done) {
    var tokensToDelete = [];
    for (var key in tokens) {
        if (tokens.hasOwnProperty(key)) {
            var token = tokens[key];
            if(new Date() > token.expirationDate) {
                tokensToDelete.push(key);
            }
        }
    }


    for(var i = 0; i < tokensToDelete.length; ++i) {
        console.log("Deleting token:" + key);
        delete tokens[tokensToDelete[i]];
    }
    return done(null);
};