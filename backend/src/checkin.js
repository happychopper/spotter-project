module.exports = (app, db, passport, messenger) => {

  app.post('/checkin', passport.authenticate('jwt', { session: false }), (req, res) => {
    var { gym, timeSlot, user_id } = req.body;

    timeSlot.start = new Date(timeSlot.start);
    timeSlot.end = new Date(timeSlot.end);

    if (gym == null || user_id == null) {
      return res.json({ success: false, error: 'No gym specified' });
    }

    db.collection('users').updateOne(
      {
        _id: req.user._id,
        'accepted.gym': gym,
        'accepted._id': user_id,
        'accepted.timeSlot.start': timeSlot.start,
        'accepted.timeSlot.end': timeSlot.end,
      },
      {
        $inc: { score: 1 },
        "$set": { "accepted.$.checkedIn": true }
      }, () => {

      messenger.send(user_id, {
          gym: gym,
          name: req.user.name,
          notif_type: 'checkin'
        }, (success) => {
          return res.json(success);
      });
      
    });
  });

}