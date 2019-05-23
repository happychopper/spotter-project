'use strict';

// Require all that is required (heh)
const assert          = require('assert');
const bodyParser      = require('body-parser');
const compression     = require('compression');
const cookieParser    = require('cookie-parser');
const dotenv          = require('dotenv').load();
const express         = require('express');
const expressSession  = require('express-session');
const MongoStore      = require('connect-mongo')(expressSession);
const mongoClient     = require('mongodb').MongoClient;
const passport        = require('passport');

const middleware      = require('./middleware');
const Messenger       = require('./messenger');

// .env variables
const mongo_user      = process.env.MONGO_USER;
const mongo_pwd       = process.env.MONGO_PWD;
const port            = process.env.PORT;

// Express variables
const app             = express();

// MongoDB variables
const url             = `mongodb://${mongo_user}:${mongo_pwd}@ds133762.mlab.com:33762/spotter`
var db                = null;
var messenger         = null;
const dbName          = 'spotter';

// Connect to the DB
mongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
  assert.equal(null, err);
  console.log("Successfully connected to the spotter database");

  db = client.db(dbName);
  messenger = Messenger(db);

  app.use(middleware(app, db, passport).passportAuth);
  app.use(middleware(app, db, passport).cleanUp);
  messenger.initiateMessenger();

  require('./passport')(passport, db, url);
  require('./auth')(app, db, passport);
  require('./profile')(app, db, passport);
  require('./match')(app, db, passport, messenger);
  require('./otherUser')(app, db, passport, messenger);
  require('./messaging')(app, db, passport);
  require('./checkin')(app, db, passport, messenger);
  require('./scoreboard')(app, db, passport);

  // Listen to the port
  app.listen(port);
  console.log(`Starting Spotter API on ${port}`);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());
app.use(expressSession({
  secret: 'spotter_3141',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({ url: url })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/static', express.static('public'));
