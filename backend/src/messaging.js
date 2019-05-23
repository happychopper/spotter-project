module.exports = (app, db, passport) => {  
    app.post('/checkin/register', passport.authenticate('jwt', { session: false }), (req, res) => {
      var token = req.body.token;
      if (token == null) {
        return res.json({ success: false, error: 'No token' });
      }
  
      db.collection('gcm').findOne({
        token: token
      }, (err, token_pair) => {
        if (token_pair != null && token_pair.user_id == req.user._id.toString()) {
          return res.json({ success: true, message: "User already registered with current token" })
        } else {
          db.collection('gcm').updateOne({ user_id: req.user._id.toString() }, {
            $set: { token: token} 
          }, { upsert: true }, () => {
            return res.json({ success: true, message: "New user registered to push service" });
          });
        }
      })
    });
  
    app.get('/checkin/unregister', passport.authenticate('jwt', { session: false }), (req, res) => {
      db.collection('gcm').deleteOne({
        user_id: req.user._id.toString()
      }, (err, result) => {
        if (result.deletedCount != 1)
          return res.json({ success: false, message: "User was not registered" });
        else
          return res.json({ success: true })
      })
    });
}