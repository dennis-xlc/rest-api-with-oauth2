var CryptoJS = require("crypto-js/");
var config = require('../config');
var utils = require('../utils');

var applications = {};
var applicationId = 10000;

exports.update = function (appId, application, done) {
  applications[appId].name = application.name;
  applications[appId].url = application.url;
  applications[appId].callback = application.callback;
  applications[appId].description = application.description;

  return done(null, applications[appId]);
};

exports.save = function (username, application, done) {
  //console.log("save application: ", application);

  applicationId++;

  var clientId = utils.uid(config.client.clientIdLength);

  //var clientSecretHash = CryptoJS.SHA3(username+application.name+application.callback,
  //      {outputLength : config.client.clientSecretLength});

  //var clientSecret = clientSecretHash.toString(CryptoJS.enc.Base64);

  var clientSecret = utils.uid(config.client.clientSecretLength);

  //var client = {clientId : clientId, clientSecret : clientSecret};

  applications[applicationId] = {id : applicationId, name : application.name, url : application.url,
              callback : application.callback, description : application.description,
              clientId : clientId, clientSecret : clientSecret, developer : username};

  console.log("save application: ", applications[applicationId]);


  return done(null, applicationId);
};

exports.loadApplications = function (username, done) {
  console.log("load applications for developer: ", username);
  var apps = [];
  for(var applicationId in applications) {
    var application = applications[applicationId];
    if (application.developer === username) {
      console.log("find application: ", application);
      apps.push(application);
    }
  }

  return done(null, apps);
};

exports.removeApplication = function (applicationId, done) {
  console.log("remove application: ", applicationId);
  var application = applications[applicationId];

  if (application) {
    console.log("find application: ", application);
    delete applications[applicationId];
    return done(null);
  }

  return done(true);

};

exports.findApplication = function (applicationId, done) {
  var application = applications[applicationId];

  if (application) {
    console.log("find application: ", application);
    return done(null, application);
  }

  return done(true, null);

};

exports.revokeTokens = function (applicationId, done) {
  console.log("revoke tokens for application: ", applicationId);
  return done(null);
};

exports.restSecret = function (applicationId, done) {
  console.log("reset secret for application: ", applicationId);

  var clientSecret = utils.uid(config.client.clientSecretLength);
  console.log("old secret : ", applications[applicationId].clientSecret);

  applications[applicationId].clientSecret = clientSecret;
  console.log("new secret : ", applications[applicationId].clientSecret);

  return done(null);
};
