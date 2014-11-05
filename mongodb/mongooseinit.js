var config = require('../config');
var mongoose = require('mongoose');

// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.
var dburl = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL ||
					'mongodb://127.0.0.1:27017/ShinifyMongoose';

exports.connect = function(callback) {
	console.log('Trying to connect to mongodb : ', dburl);
    mongoose.connect(dburl, callback);
}

exports.disconnect = function(callback) {
    mongoose.disconnect(callback);
}

exports.mongodb = mongoose;
