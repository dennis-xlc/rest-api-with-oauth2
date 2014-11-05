var config = require('../../config');
var db = require('../../' + config.db.type);

exports.updateApplication = function (req, res) {
  if (req.session && req.session.login) {
    console.log("request body: ", req.body);

    var username = req.session.username;
    var appId = req.params.app_id;
    var application = req.body.application;
    application.id = appId;

    var result = new ApplicationVerifyResult();

    // check the app name
    checkAppName(application.name, function (err) {
      if (err) {
        result.error = true;
        result.nameErr = err;
      }
    });

    // check the app url
    checkAppUrl(application.url, function (err) {
      if (err) {
        result.error = true;
        result.urlErr = err;
      }
    });

    // check the app callback
    checkAppCallback(application.callback, function (err) {
      if (err) {
        result.error = true;
        result.callbackErr = err;
      }
    });

    var developerInfo;
    var applicationId;
    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/');
      } else {
        developerInfo = developer;
        if (!result.error) {

          db.applications.update(appId, application, function (err, appDetail) {
            if (err) {
              result.error = true;
            } else {
              application = appDetail;
            }

          });
        }

      }
    });


    res.render('dev/application-detail', {title : "OAuth2 Application · Shinify",
        developer : developerInfo, appDetail : application, verifyResult : result});


  } else {
    res.redirect('/');
  }
};

exports.revokeTokens = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;
    var appId = req.params.app_id;

    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/home');
      } else {
        db.applications.revokeTokens(appId, function(err) {
          if (err) {
            res.redirect('/home');
          } else {
            res.redirect('/settings/applications/'+appId);
          }
        });
      }
    });
  } else {
    res.redirect('/');
  }
};

exports.restSecret = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;
    var appId = req.params.app_id;

    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/home');
      } else {
        db.applications.restSecret(appId, function(err) {
          if (err) {
            res.redirect('/home');
          } else {
            res.redirect('/settings/applications/'+appId);
          }
        });
      }
    });
  } else {
    res.redirect('/');
  }
};

exports.applications = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;

    console.log("load applications page :", username);

    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/home');
      } else {

        db.applications.loadApplications(username, function(err, applications) {
          if (err) {
            res.redirect('/home');
          } else {
            console.log("loadApplications :", applications);
            res.render('dev/applications', {title : "Authorized Applications · Shinify",
                developer : developer, applications : applications});
          }
        });

      }
    });
  } else {
    res.redirect('/');
  }
};

exports.applicationForm = function (req, res) {
  if (req.session && req.session.login) {

    var username = req.session.username;
    var application = {name : "", url : "", callback : "", description : ""};

    var result = new ApplicationVerifyResult();
    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/');
      } else {
        res.render('dev/application-new', {title : "New OAuth2 Application · Shinify",
          developer : developer, application : application, verifyResult : result});
      }
    });
  } else {
    res.redirect('/');
  }
};

exports.removeApplication = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;
    var appId = req.params.app_id;
    console.log("remove app: ", appId);

    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/home');
      } else {
        db.applications.removeApplication(appId, function(err) {
          if (err) {
            res.redirect('/home');
          } else {
            res.redirect('/settings/applications');
          }
        });
      }
    });
  } else {
    res.redirect('/');
  }
};

exports.applicationDetail = function (req, res) {
  if (req.session && req.session.login) {
    var username = req.session.username;
    var appId = req.params.app_id;
    console.log("get app: ", appId);

    var result = new ApplicationVerifyResult();

    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/home');
      } else {
        db.applications.findApplication(appId, function(err, application) {
          if (err) {
            res.redirect('/home');
          } else {
            res.render('dev/application-detail', {title : "OAuth2 Application · Shinify",
              developer : developer, appDetail : application, verifyResult : result});
          }
        });
      }
    });
  } else {
    res.redirect('/');
  }
};


exports.createApplication = function (req, res) {
  if (req.session && req.session.login) {
    console.log("request body: ", req.body);

    var username = req.session.username;
    var application = req.body.application;

    var result = new ApplicationVerifyResult();

    // check the app name
    checkAppName(application.name, function (err) {
      if (err) {
        result.error = true;
        result.nameErr = err;
      }
    });

    // check the app url
    checkAppUrl(application.url, function (err) {
      if (err) {
        result.error = true;
        result.urlErr = err;
      }
    });

    // check the app callback
    checkAppCallback(application.callback, function (err) {
      if (err) {
        result.error = true;
        result.callbackErr = err;
      }
    });

    var developerInfo;
    var applicationId;
    db.developers.getDeveloperInfo(username, function(err, developer){
      if (err) {
        res.redirect('/');
      } else {
        developerInfo = developer;
        if (!result.error) {

          db.applications.save(username, application, function (err, appId) {
            if (err) {
              result.error = true;
              result.callbackErr = "Cannot save application, please try again later!";
            } else {
              applicationId = appId;
            }

          });
        }

      }
    });

    if (result.error) {
      res.render('dev/application-new', {title : "New OAuth2 Application · Shinify",
                developer : developerInfo, application : application, verifyResult : result});
    } else {
      res.redirect('/settings/applications/'+applicationId);
    }

  } else {
    res.redirect('/');
  }
};
