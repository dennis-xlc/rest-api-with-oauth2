var fs = require('fs');
var crypto = require('crypto');
var Legicon = require('../utils/legicon-custom');


var Developer = require('../mongodb/developers.js').Developer;


exports.findOneByName = function (username, done) {
  Developer.findOne({name : username}, function (err, developer) {
  	if (err) {
  		console.log("no developer found : ", username);
  		return done("There were problems checking user name.", null);
  	} else if (developer) {
  		console.log("found developer: ", developer);
  		return done(null, developer);
  	}

  	return done(null, null);
  });
};


exports.findOneByEmail = function (email, done) {
  Developer.findOne({email : email}, function (err, developer) {
  	if (err) {
  		console.log("no developer found by email: ", email);
  		return done("There were problems checking user email.", null);
  	} else if (developer) {
  		console.log("found developer: ", developer);
  		return done(null, developer);
  	}

  	return done(null, null);
  });
};

exports.findOneByNameAndPassword = function (username, password, done) {

  var encryptPasswd = genEncryptPassword(password);
  Developer.findOne({name : username, password : encryptPasswd}, function (err, developer) {
  	if (err) {
  		console.log("no developer found by email: ", email);
  		return done("There were problems checking user email.", null);
  	} else if (developer) {
  		console.log("found developer: ", developer);
  		return done(null, developer);
  	}

  	return done(null, null);
  });
};


/*
exports.updateProfile = function (username, profile, done) {
  console.log("update profile for developer: ", username);
  console.log("profile: ", profile);

  profiles[username].fullName = profile.name;
  profiles[username].company = profile.company;
  profiles[username].url = profile.url;
  profiles[username].location = profile.location;

  console.log("after profile: ", profiles[username]);

  var info = loadDeveloperInfo(username);

  return done(null, info);

};
*/

/*
exports.updatePassword = function (username, password, done) {
  developers[username].password = password;
  return done(null);
};
*/


exports.remove = function (username, done) {
  console.log("delete user: ", username);

  Developer.findOneAndRemove({name : username}, function (err, developer) {
  	if (err) {
  		console.log("no developer found : ", err);
  		done(err);
  	} else {
  		console.log("success to remove developer : ", username);
  		done(null);
  	}
  });
};


exports.save = function (user, done) {
  console.log("try to add developer: ", user);

  var encryptPasswd = genEncryptPassword(user.password);
  var avatarImg = genAvatar(user.name);

  var developer = new Developer({
  	name : user.name,
  	email : user.email,
  	password : encryptPasswd,
  	profile : {
  		avatarImg : avatarImg
  	}
  });

  developer.save(function (err) {
  	if (err) {
  		console.log("fail to add developer: ", err);
  		done(err);
  	} else {
  		console.log("success adding developer: ", developer);
  		done(null);
  	}
  });
};

function genAvatar(username) {
  var avatarImg = username +'_default.png';
  var userAvatar = Legicon(username);
  var stream = userAvatar.pngStream();
  var out = fs.createWriteStream(__dirname + '/../public/avatars/' + avatarImg);

  stream.on('data', function(chunk){
  	out.write(chunk);
  });

  stream.on('end', function(){
  	console.log('saved png');
  });

  return avatarImg;
}

function genEncryptPassword(password) {
	var pem = fs.readFileSync(__dirname + '/../certs/server.pem');
	var key = pem.toString('ascii');
	var hmac = crypto.createHmac('sha1', key);
	hmac.update(password);
	return hmac.digest('hex');
}
