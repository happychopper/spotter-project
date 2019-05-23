
module.exports = (app, db, passport) => {

  app.get('/scoreboard', passport.authenticate('jwt', { session: false }), (req, res) => {
    var gym = req.query.gym;

    if (req.user.gymList == null || req.user.gymList.length == 0) {
      return res.json({ success: false, err: 1, message: "No gyms"});
    }

    if (gym == null) {

      if (req.user.favouriteGym != null && req.user.favouriteGym != 'N/A') {
        gym = req.user.favouriteGym;
      } else {
        gym = req.user.gymList[0];
      }
    }
        
    db.collection('users').find({ 
      gymList: gym
    }).toArray().then((others, err) => {
      if (others == null) {
        return res.json({ success: false, err: 2, message: "No other users"});
      }

      scores = others.map((x) => {
        return {
          name: x.name,
          score: x.score ? x.score : 0,
          friend: req.user.spotters.includes(x._id.toString()),
          isMe: x._id.equals(req.user._id)
        };
      }).sort((x, y) => { return x.score < y.score });

      return res.json({ success: true, data: { gymList: req.user.gymList, gym: gym, scores: scores } });
    })

  });

}