var config = require('../config');
var utils = require('../utils');

var tokens = [];

exports.generate = function (username, email, done) {
	var tokenId = utils.uid(config.token.passwdResetTokenLength);
	var expiredDate = config.token.passwdResetTokenExpirationDate();

	var token = {username : username, email : email, id : tokenId, expiredDate : expiredDate};
	console.log("add token : ", token);
	tokens.push(token);

	return done(null, tokenId);
};

exports.find = function (tokenId, done) {
	for( var idx in tokens) {
		var token = tokens[idx];
		if (token.id === tokenId) {
			return done(null, token);
		}
	}

	return done("Invalid token id", null);
};