var config = require('../../config');
var db = require('../../' + config.db.type);



exports.profile = function (req, res) {
  if (req.session && req.session.login) {

    var username = req.session.username;

    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/home');
      } else {
        res.render('dev/profile', {title : "Your Profile · Shinify",
              successUpdate : false, error : false, developer : developer});
      }
    });

  } else {
    res.redirect('/');
  }
};

exports.updateProfile = function (req, res) {
  if (req.session && req.session.login) {

    var username = req.session.username;
    var profile = req.body.profile;

    console.log("trying update profile for user: ", username);
    console.log("profile: ", profile);

    db.developers.updateProfile(username, profile, function(err, developer){
      if (err) {
        //res.redirect('/settings/profile');
      }

      res.render('dev/profile', {title : "Your Profile · Shinify",
            successUpdate : true, error : false, developer : developer});

    });


  } else {
    res.redirect('/');
  }
};

exports.avatarPolicy = function (req, res) {
  if (req.session && req.session.login) {

    console.log("request avatar policy: ", req.body);

    var username = req.session.username;

    var fileName = req.body.name;
    var fileSize = parseInt(req.body.size);
    var contentType = req.body.content_type;

    var policy = {};

    policy.upload_url = "https://10.249.210.108:3000/upload/avatar";
    policy.header = {Accept : "application/json; charset=utf-8"};
    policy.asset = {size : fileSize, content_type : contentType};
    policy.form = {size : fileSize, content_type : contentType};

    res.setHeader("Status", "201 Created");
    res.setHeader("Vary", "X-PJAX");
    res.status(201).json(policy);

  } else {
    res.json({message : 'Need Login'});
  }
};

exports.uploadAvatar = function (req, res) {
  if (req.session && req.session.login) {

    console.log("upload avatar : ", req);

  } else {
    res.json({message : 'Need Login'});
  }
};
