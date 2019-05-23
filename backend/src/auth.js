
const jwt         = require('jsonwebtoken');
const jwtSecret   = process.env.JWT_SECRET;

module.exports = (app, db, passport) => {
  /**
   * Route for Google auth
   */
  app.get('/auth/google',
    passport.authenticate('google', { session: false, scope: ['profile'] }));

  /**
   * Callback route for Google auth
   */
  app.get('/auth/google/callback', (req, res) => {
    passport.authenticate('google', { failureRedirect: '/auth/google', session: false }, (err, user, info) => {
      if (err || !user) {
        return res.redirect(`Spotter://login?error=Google login failed. Please try again.`);
      }

      req.login(user, { session: false }, (err) => {
        if (err) {
          return res.redirect(`Spotter://login?error=Google login failed. Please try again.`);
        }

        // Generate a signed JWT with the contents of user object and return it in the response
        const token = jwt.sign(user.toJSON(), jwtSecret);
        return res.redirect(`Spotter://login?jwt=${token}`);
      });
    })(req, res);
  });

  app.get('/logout', (req, res) => {
    // Blacklist the JWT
    var rawJwt = req.headers.authorization.replace(/^Bearer /, '');
    db.collection("jwtBlacklist").insertOne({ jwt: rawJwt }, (err, result) => {
      return res.json({ success: true });
    });
  });


  /**
   * Test route
   */
  app.get('/test', passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.send("This is a locked page")
  });

  app.get('/', (req, res) => {
    return res.send("hello")
  });
}