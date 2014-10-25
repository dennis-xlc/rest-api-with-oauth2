var date_util = require('../utils/date_util');
var fs = require('fs');
var Legicon = require('legicon');

var developers = {};
var profiles = {};

exports.updateProfile = function (username, profile, done) {
  console.log("update profile for developer: ", username);
  console.log("profile: ", profile);

  profiles[username] = {name : profile.name, company : profile.company,
                url : profile.url, location : profile.location};

  return done(null);

}

exports.checkUserNameExist = function (username) {
  return developers[username];
}

exports.checkEmailExist = function (email) {
	for (var i = 0, len = developers.length; i < len; i++) {
		var developer = developers[i];
		if (developer.email === email) {
			return true;
		}
	}
  return false;
}

exports.verifyPassword = function (username, password, done) {
  console.log("verify developer: ", username);
  var developer = developers[username];
  if (developer && developer.password === password) {
    return done(null);
  }

  return done("Incorrect username or password.");
}

exports.find = function (username, done) {
  console.log("find developer: ", username);
  console.log("in  developers: ", developers);
    var developer = developers[username];
    return done(null, developer);
};

exports.save = function (developer, done) {
  console.log("add developer: ", developer);
  var currentDate = new Date();
  var joinDate = date_util.getEngDateString(currentDate);

  gen_avatar(developer.name);

    developers[developer.name] = { userName: developer.name, email: developer.email, password: developer.password, joinDate : joinDate };
    console.log("new developer: ", developers[developer.name]);
    return done(null);
};

function gen_avatar(username) {
  var userAvatar = Legicon(username);
  var stream = userAvatar.pngStream();
  var out = fs.createWriteStream(__dirname + '/../public/avatars/' + username +'.png');

  stream.on('data', function(chunk){
  out.write(chunk);
});

stream.on('end', function(){
  console.log('saved png');
});

}
