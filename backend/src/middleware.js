module.exports = (app, db, passport) => {
  return {
    cleanUp: (req, res, next) => {
      if (req.user != null) {
        var currTime = new Date();
        var update = {
          $pull: {
            pending: {
              'timeSlot.end': { $lte: currTime }
            },
            timeSlots: {
              end: { $lte: currTime }
            }
          }
        };
    
        db.collection('users').updateMany({}, update, () => {
          next();
        });
      } else {
        next();
      }
    },
    passportAuth: (req, res, next) => {
      var nonAuthRoutes = [
        '/auth/google',
        '/auth/google/callback',
        '/logout',
        '/'
      ];

      if (nonAuthRoutes.includes(req.path)) {
        return next();
      } else {
        return passport.authenticate('jwt', { session: false })(req, res, next);
      }
    }
  }
}