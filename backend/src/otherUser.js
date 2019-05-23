
const ObjectID    = require('mongodb').ObjectID;

module.exports = (app, db, passport, messenger) => {
  app.get('/otherUser', passport.authenticate('jwt', { session: false }), (req, res) => {
    var otherId = req.query._id;
    var spotterStatus = 'no';
    
    if (req.user.blocked != null && req.user.blocked.includes(otherId)) {
      spotterStatus = 'blocked';
    } else if (req.user.pendingSpotters != null && req.user.pendingSpotters.includes(otherId)) {
      spotterStatus = 'pending';
    } else if (req.user.requestSpotters != null && req.user.requestSpotters.includes(otherId)) {
      spotterStatus = 'requested';
    } else if (req.user.spotters != null && req.user.spotters.includes(otherId)) {
      spotterStatus = 'yes';
    }

    otherId = new ObjectID(req.query._id);

    db.collection('users').findOne({ _id: otherId }, (err, user) => {
      if (err || user == null) {
        return res.status(400).json({
          data: {
            message: 'Invalid user.'
          },
          success: false
        });
      }

      if (user.blocked != null && user.blocked.includes(req.user._id.toString())) {
        spotterStatus = 'blockedByOther';
      }

      var returnedUser = {
        _id: user._id,
        name: user.name,
        favouriteGym: user.favouriteGym,
        score: user.score,
        numSpotters: user.spotters != null ? user.spotters.length : 0,
        gymList: user.gymList,
        weights: user.weights,
        exercisePref: user.exercisePref,
        avgTime: user.avgTime,
        deadlift: user.deadlift,
        benchpress: user.benchpress,
        squat: user.squat,
        warmUp: user.warmUp,
        coolDown: user.coolDown,
        spotterStatus: spotterStatus,
      };

      return res.json({
        data: {
          user: returnedUser
        },
        success: true
      });
    })
  });

  app.post('/otherUser/spotter/add', passport.authenticate('jwt', { session: false }), (req, res) => {
    var otherId = new ObjectID(req.body._id);

    db.collection('users').findOne({ _id: otherId }, (err, user) => {
      if (err || user == null) {
        return res.status(400).json({
          data: {
            message: 'Invalid user.'
          },
          success: false
        });                                                  
      }

      // Is either:
      // Someone had received a request from another, and is accepting; or
      // Sending an initial request to another
      if (req.user.requestSpotters != null && req.user.requestSpotters.includes(otherId.toString())) {
        db.collection('users').updateOne(
          { _id : req.user._id },
          {
            $addToSet: { spotters: otherId.toString() },
            $pull: { requestSpotters: otherId.toString() }
          },
        ).then(() => {
          db.collection('users').updateOne(
            { _id : otherId },
            {
              $addToSet: { spotters: req.user._id.toString() },
              $pull: { pendingSpotters: req.user._id.toString() }
            },
          ).then(() => {
            messenger.send(req.body._id, { name: req.user.name, notif_type: 'spotter_accept' }, () => {
              return res.json({ success: true, message: "Request accepted" });
            })
          })
        })
      } else {
        db.collection('users').updateOne(
          { _id : req.user._id },
          { $addToSet: { pendingSpotters: otherId.toString() } },
        ).then(() => {
          db.collection('users').updateOne(
            { _id : otherId },
            { $addToSet: { requestSpotters: req.user._id.toString() } },
          ).then(() => {
            messenger.send(req.body._id, { name: req.user.name, notif_type: 'spotter_req' }, () => {
              return res.json({ success: true, message: "Request sent" });
            })
          })
        })
      }
    })
  });

  app.post('/otherUser/spotter/deny', passport.authenticate('jwt', { session: false }), (req, res) => {
    var otherId = new ObjectID(req.body._id);

    db.collection('users').findOne({ _id: otherId }, (err, user) => {
      if (err || user == null) {
        return res.status(400).json({
          data: {
            message: 'Invalid user.'
          },
          success: false
        });                                                  
      }

      // Only case is if someone had received a request from another, and is denying
      if (req.user.requestSpotters != null && req.user.requestSpotters.includes(otherId.toString())) {
        db.collection('users').updateOne(
          { _id : req.user._id },
          { $pull: { requestSpotters: otherId.toString() } },
        ).then(() => {
          db.collection('users').updateOne(
            { _id : otherId },
            { $pull: { pendingSpotters: req.user._id.toString() } },
          ).then(() => {
            return res.json({ success: true, message: "Request denied" });
          })
        })
      }
    })
  });

  app.post('/otherUser/spotter/delete', passport.authenticate('jwt', { session: false }), (req, res) => {
    var otherId = new ObjectID(req.body._id);

    console.log(otherId);

    db.collection('users').findOne({ _id: otherId }, (err, user) => {
      if (err || user == null) {
        return res.status(400).json({
          data: {
            message: 'Invalid user.'
          },
          success: false
        });                                                  
      }

      // Only one case of just deleting everything from both users
      db.collection('users').updateOne(
        { _id : req.user._id },
        {
          $pull: {
            pendingSpotters: { $in: [ otherId.toString(), req.user._id.toString() ] },
            requestSpotters: { $in: [ otherId.toString(), req.user._id.toString() ] },
            spotters: { $in: [ otherId.toString(), req.user._id.toString() ] },
          }
        },
      ).then(() => {
        db.collection('users').updateOne(
          { _id : otherId },
          {
            $pull: {
              pendingSpotters: { $in: [ otherId.toString(), req.user._id.toString() ] },
              requestSpotters: { $in: [ otherId.toString(), req.user._id.toString() ] },
              spotters: { $in: [ otherId.toString(), req.user._id.toString() ] },
            }
          },
        ).then(() => {
          return res.json({ success: true, message: "Spotter deleted" });
        })
      })
    })
  });

  app.post('/otherUser/spotter/block', passport.authenticate('jwt', { session: false }), (req, res) => {
    var otherId = new ObjectID(req.body._id);

    db.collection('users').findOne({ _id: otherId }, (err, user) => {
      if (err || user == null) {
        return res.status(400).json({
          data: {
            message: 'Invalid user.'
          },
          success: false
        });                                                  
      }

      db.collection('users').updateOne(
        { _id : req.user._id },
        {
          $push: {
            blocked: otherId.toString()
          },
          $pull: {
            accepted: { _id: otherId.toString() },
            pending: { _id: otherId.toString() },
            pendingSpotters: { $in: [ otherId.toString(), req.user._id.toString() ] },
            requestSpotters: { $in: [ otherId.toString(), req.user._id.toString() ] },
            spotters: { $in: [ otherId.toString(), req.user._id.toString() ] },
          }
        },
      ).then(() => {
        db.collection('users').updateOne(
          { _id : otherId },
          {
            $pull: {
              accepted: { _id: req.user._id.toString() },
              pending: { _id: req.user._id.toString() },
              pendingSpotters: { $in: [ otherId.toString(), req.user._id.toString() ] },
              requestSpotters: { $in: [ otherId.toString(), req.user._id.toString() ] },
              spotters: { $in: [ otherId.toString(), req.user._id.toString() ] },
            }
          },
        ).then(() => {
          return res.json({ success: true, message: "Spotter blocked" });
        })
      })
    })
  });

  app.post('/otherUser/spotter/unblock', passport.authenticate('jwt', { session: false }), (req, res) => {
    var otherId = new ObjectID(req.body._id);

    db.collection('users').findOne({ _id: otherId }, (err, user) => {
      if (err || user == null) {
        return res.status(400).json({
          data: {
            message: 'Invalid user.'
          },
          success: false
        });                                                  
      }

      db.collection('users').updateOne(
        { _id : req.user._id },
        {
          $pull: {
            blocked: otherId.toString()
          }
        },
      ).then(() => {
        return res.json({ success: true, message: "Spotter unblocked" });
      })
    })
  });
}