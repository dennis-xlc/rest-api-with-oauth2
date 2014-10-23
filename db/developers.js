

var developers = {};

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

exports.find = function (username, done) {
  console.log("find developer: ", username);
  console.log("in  developers: ", developers);
    var developer = developers[username];
    return done(null, developer);
};

exports.save = function (developer, done) {
  console.log("add developer: ", developer);
    developers[developer.name] = { userName: developer.name, email: developer.email, password: developer.password };
    return done(null);
};
