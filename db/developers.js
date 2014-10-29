var fs = require('fs');
var Legicon = require('../utils/legicon-custom');
var config = require('../config');
var utils = require('../utils');
var date_util = require('../utils/date_util');
var CryptoJS = require("crypto-js/");

var developers = {};
var profiles = {};
var applications = {};
var clients = {};
var applicationId = 10000;

exports.saveApplication = function (username, application, done) {
  //console.log("save application: ", application);

  var password = developers[username].password;
  var appId = applicationId++;
  var clientId = utils.uid(config.client.clientIdLength);
  
  var clientSecretHash = CryptoJS.SHA3(username+password+application.name+application.callback,
        {outputLength : config.client.clientSecretLength});

  var clientSecret = clientSecretHash.toString(CryptoJS.enc.Base64);

  applications[username] = {id : appId, name : application.name, url : application.url,
              callback : application.callback, description : application.description};

  console.log("save application: ", applications[username]);

  clients[appId] = {clientId : clientId, clientSecret : clientSecret};
  console.log("save client: ", clients[appId]);


  return done(null);
};

function Developer () {
  this.name = "";
  this.email = "";
  this.joinDate = "";
  this.avatarImg = "";
  this.fullName = "";
  this.location = "";
  this.company = "";
  this.url = "";
};

function loadDeveloperInfo (username) {
  var developer = developers[username];
  var profile = profiles[username];

  var info = {};
  info.name = developer.userName;
  info.email = developer.email;
  info.joinDate = developer.joinDate;
  info.avatarImg = profile.avatarImg;
  info.fullName = profile.fullName;
  info.location = profile.location;
  info.company = profile.company;
  info.url = profile.url;

  return info;
};

exports.getDeveloperInfo = function (username, done) {
  console.log("get info for developer: ", username);
  var info = loadDeveloperInfo(username);

  return done(null, info);
};

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

exports.checkUserNameExist = function (username) {
  return developers[username];
};

exports.checkEmailExist = function (email) {
	for (var i = 0, len = developers.length; i < len; i++) {
		var developer = developers[i];
		if (developer.email === email) {
			return true;
		}
	}
  return false;
};

exports.updatePassword = function (username, password, done) {
  developers[username].password = password;
  return done(null);
};


exports.verifyPassword = function (username, password, done) {
  console.log("verify developer: ", username);
  var developer = developers[username];
  if (developer && developer.password === password) {
    return done(null);
  }

  return done(true);
};

exports.find = function (username, done) {
  console.log("find developer: ", username);
  console.log("in  developers: ", developers);
    var developer = developers[username];
    return done(null, developer);
};

exports.remove = function (username, done) {
  console.log("delete user: ", username);
  delete profiles[username];
  delete developers[username];
  return done(null);
};

exports.save = function (developer, done) {
  console.log("add developer: ", developer);
  var currentDate = new Date();
  var joinDate = date_util.getEngDateString(currentDate);

  var avatarImg = gen_avatar(developer.name);

    developers[developer.name] = { userName: developer.name, email: developer.email,
      password: developer.password, joinDate : joinDate };

    console.log("new developer: ", developers[developer.name]);

    profiles[developer.name] = {avatarImg : avatarImg};

    return done(null);
};

function gen_avatar(username) {
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
