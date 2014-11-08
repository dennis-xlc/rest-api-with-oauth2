var express = require('express');
var router = express.Router();


router.route('/').get(function(req, res) {
  console.log("Cookies: ", req.cookies);
  res.json({ message: 'You are reaching the REST API for fudan bbs!' });
});

exports.router = router;