// load the packages as needed
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var connectMongo =  require('connect-mongo');
var morgan = require('morgan');
var fs = require('fs');
var path = require('path');
var https = require('https');
var passport = require('passport');
var config = require('./config');

var devSiteController = require('./controllers/dev-site');
var oauth2SiteController = require('./controllers/oauth2-site');
var oauth2Controller = require('./controllers/oauth2');
var authController = require('./controllers/auth');

//Pull in the mongo store if we're configured to use it
//else pull in MemoryStore for the session configuration
var sessionStorage;
if (config.session.type === 'MongoStore') {
    var MongoStore = connectMongo(express);
    console.log('Using MongoDB for the Session');
    sessionStorage = new MongoStore({
        db: config.session.dbName
    });
} else if(config.session.type === 'MemoryStore') {
    var MemoryStore = session.MemoryStore;
    console.log('Using MemoryStore for the Session');
    sessionStorage = new MemoryStore();
} else {
    //We have no idea here
    throw new Error("Within config/index.js the session.type is unknown: " + config.session.type )
}

//Pull in the mongo store if we're configured to use it
//else pull in MemoryStore for the database configuration
var db = require('./' + config.db.type);
if(config.db.type === 'mongodb') {
    console.log('Using MongoDB for the data store');
} else if(config.db.type === 'db') {
    console.log('Using MemoryStore for the data store');
} else {
    //We have no idea here
    throw new Error("Within config/index.js the db.type is unknown: " + config.db.type );
}


// Create our Express server
var server = express();

// Use environment defined port or 3000
server.set('port', (process.env.PORT || 3000));
server.set('view engine', 'ejs');

//static resources for stylesheets, images, javascript files
server.use(express.static(path.join(__dirname, 'public')));
server.use(cookieParser());


//Session Configuration
server.use(session({
    secret: config.session.secret,
    store: sessionStorage,
    key: "authorization.sid",
    saveUninitialized: true,
    resave: true,
    cookie: {maxAge: config.session.maxAge }
}));

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'});

// setup the logger
server.use(morgan('combined', {stream: accessLogStream}));


// Use the body-parser package in our application
server.use(bodyParser.urlencoded({
  extended: true
}));

server.use(passport.initialize());
server.use(passport.session());


// Create our Express router
var baseRouter = express.Router();
var oauth2Router = express.Router();
var apiRouter = express.Router();


baseRouter.get('/', devSiteController.index);
baseRouter.get('/login', devSiteController.loginForm);

// Initial dummy route for testing
// https://localhost:3000/api
apiRouter.get('/', function(req, res) {
  console.log("Cookies: ", req.cookies);
  res.json({ message: 'You are reaching the REST API for fudan bbs!' });
});

apiRouter.get('/posts/top', authController.isAuthenticated,
    function(req, res) {
      console.log("Cookies: ", req.cookies);
      res.json({ message: 'You are reaching the REST API for fudan bbs!' });
    });


// configure the site controller for oauth2 server
oauth2Router.get('/', oauth2SiteController.index);
oauth2Router.get('/login', oauth2SiteController.loginForm);
oauth2Router.post('/login', oauth2SiteController.login);

oauth2Router.get('/authorize', oauth2Controller.authorization);
oauth2Router.post('/authorize/decision', oauth2Controller.decision);
oauth2Router.post('/token', oauth2Controller.token);

// Register all our routes
server.use('/', baseRouter);
server.use('/api', apiRouter);
server.use('/oauth2', oauth2Router);


console.log(process.env);

// check if run on heroku
if (process.env.NODE_ENV === 'production') {
    /* express */
    server.listen(server.get("port"), function () {
      console.log("Express server listening on port " + server.get('port'));
    });
} else {
  //TODO: Change these for your own certificates.  This was generated
  //through the commands:
  //openssl genrsa -out privatekey.pem 1024
  //openssl req -new -key privatekey.pem -out certrequest.csr
  //openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
  var options = {
      key: fs.readFileSync('certs/privatekey.pem'),
      cert: fs.readFileSync('certs/certificate.pem')
  };

  //This setting is so that our certificates will work although they are all self signed
  //TODO Remove this if you are NOT using self signed certs
  https.globalAgent.options.rejectUnauthorized = false;

  // Create our HTTPS server listening on port 3000.
  https.createServer(options, server).listen(server.get("port"));
}

console.log("OAuth 2.0 Authorization Server started on port " + server.get("port"));
