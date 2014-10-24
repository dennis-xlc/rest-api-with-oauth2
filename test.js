var identicon = require('./util/identicon');
var fs = require('fs');

// Asynchronous API (base_string, size, callback)
identicon.generate('ajido', 150, function(err, buffer) {
    if (err) throw err;

    // buffer is identicon of the PNG format
    fs.writeFileSync(__dirname + '/identicon.png', buffer);
});

// Synchronous API (base_string, size)
var buffer = identicon.generateSync('ajido', 40);
