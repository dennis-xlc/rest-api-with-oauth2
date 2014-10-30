var CryptoJS = require("crypto-js/");
var config = require('../config');
var utils = require('../utils');

var applications = {};
var applicationId = 10000;

exports.save = function (username, application, done) {
  //console.log("save application: ", application);

  applicationId++;

  var clientId = utils.uid(config.client.clientIdLength);

  var clientSecretHash = CryptoJS.SHA3(username+application.name+application.callback,
        {outputLength : config.client.clientSecretLength});

  var clientSecret = clientSecretHash.toString(CryptoJS.enc.Base64);

  var client = {clientId : clientId, clientSecret : clientSecret};

  applications[applicationId] = {id : applicationId, name : application.name, url : application.url,
              callback : application.callback, description : application.description,
              clientId : clientId, clientSecret : clientSecret};

  console.log("save application: ", applications[applicationId]);


  return done(null, applicationId);
};

exports.findApplication = function (applicationId, done) {
  var application = applications[applicationId];
  done(null, application);
};
