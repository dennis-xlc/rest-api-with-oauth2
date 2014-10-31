//var path = require('path');
//var templatesDir = path.resolve(__dirname, '..', 'views/mail-templates');
//var emailTemplates = require('email-templates');
var nodemailer = require('nodemailer');


exports.sendMail = function (email, token) {
  /*emailTemplates(templatesDir, function(err, template) {
    if (err) {
      console.log(err);
    } else {*/
      var transport = nodemailer.createTransport();
      //template('reset-passwd', token, function(err, html, text) {
      //  if (err) {
      //    console.log(err);
      //  } else {
          transport.sendMail({
            from: 'Shinify <noreply@shinify.com>',
            to: email,
            subject: '[Shinify] Please reset your password',
            html: "<p>Hello, world!</p>",
            // generateTextFromHTML: true,
            text: "Hello, world!"
            }, function(err, responseStatus) {
              if (err) {
                console.log(err);
              } else {
                console.log(responseStatus.message);
              }
          });
      /*  }
      });
    }
  });*/
};
