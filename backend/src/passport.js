const mongoose        = require('mongoose');
const GoogleStrategy  = require('passport-google-oauth20').Strategy;
const passportJWT     = require("passport-jwt");
const JWTStrategy     = passportJWT.Strategy;
const ExtractJWT      = passportJWT.ExtractJwt;

// Google OAuth related variables
const googleID          = process.env.GOOGLE_CLIENT_ID;
const googleSecret      = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL;
const jwtSecret         = process.env.JWT_SECRET;

const Schema            = mongoose.Schema;

module.exports = (passport, db, url) => {
  var db = mongoose.createConnection(url, { useNewUrlParser: true });

  // Create schema for Spotter user
  const UserSchema = new Schema({
    name: String,
    google: {
      id: Number,
      name: String,
      photo: String,
    },
    favouriteGym: {
      type: String,
      default: 'N/A'
    },
    gymList: Array,
    score: {
      type: Number,
      default: 0
    },
    timeSlots: Array,
    weights: {
      type: Number,
      default: 0
    },
    gender: {
      type: String,
      default: 'Other'
    },
    sexPref: {
      type: String,
      default: 'Any'
    },
    exercisePref: {
      type: String,
      default: ''
    },
    avgTime: {
      type: Number,
      default: 0
    },
    deadlift: {
      type: Number,
      default: 0
    },
    benchpress: {
      type: Number,
      default: 0
    },
    squat: {
      type: Number,
      default: 0
    },
    warmUp: {
      type: Boolean,
      default: false
    },
    coolDown: {
      type: Boolean,
      default: false
    },
    accepted: Array,
    blocked: Array,
    pending: Array,
    matchHistory: Array,
    spotters: Array,
    pendingSpotters: Array, // list of users that a user has a pending request for
    requestSpotters: Array, // list of users that a user has received requests from
    // matchesSentToClient: Array,
  });

  const User = db.model('users', UserSchema);

  // Set up passport to use Google account authentication via OAuth2.0
  passport.use('google', new GoogleStrategy({
    clientID: googleID,
    clientSecret: googleSecret,
    callbackURL: googleCallbackUrl,
  }, (accessToken, refreshToken, profile, cb) => {
    User.findOne({ 'google.id': profile.id }, (err, user) => {
      // MongoDB seems to have errored out, so return the error
      if (err) {
        return cb(err);
      }

      // Two possibilities:
      //   - Successful Google auth, with user found => log them in
      //   - Successful Google auth, but no user found => create a user
      if (!user) {
        user = new User();
      }

      user.name = profile.displayName;

      user.google.id = profile.id;
      user.google.name = profile.displayName;
      user.google.photo = profile.photos[0].value;

      user.save((err) => {
        if (err) {
          return cb(err);
        }

        return cb(null, user);
      });
    });
  }));

  passport.use('jwt', new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    passReqToCallback: true,
    secretOrKey: jwtSecret
  }, (req, jwtPayload, cb) => {
    // Check if the JWT has been blacklisted
    var rawJwt = req.headers.authorization.replace(/^Bearer /, '');
    db.collection("jwtBlacklist").findOne({ 'jwt': rawJwt }, (err, res) => {
      if (res != null) {
        return cb('JWT invalid');
      } else {
        User.findOne({ '_id': jwtPayload._id }, (err, user) => {
          if (err) {
            return cb(err);
          }
          
          return cb(null, user);
        });
      }
    });
  }));

  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser((id, cb) => {
    User.findById(id, (err, user) => {
      cb(err, user);
    });
  });
}