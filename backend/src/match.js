const Moment      = require('moment');
const MomentRange = require('moment-range');
const ObjectID    = require('mongodb').ObjectID;

function deepCloneMatch(match) {
  var deepClone = JSON.parse(JSON.stringify(match));
  deepClone.timeSlot.start = new Date(deepClone.timeSlot.start);
  deepClone.timeSlot.end = new Date(deepClone.timeSlot.end);
  return deepClone;
}

function intersect(a, b) {
  var d = {};
  var results = [];
  for (var i = 0; i < b.length; i++) {
    d[b[i]] = true;
  }
  for (var j = 0; j < a.length; j++) {
    if (d[a[j]]) {
      results.push(a[j]);
    }
  }
  return results;
}

function testExist(arr, cond) {
  var exists_f = false;
  for (var i = 0; i < arr.length; i++) {
    if (cond(arr[i])) {
      exists_f = true;
      break;
    }
  }
  
  return exists_f;
}

function matchViewCreate(user, randomUser, timeSlots, gymList) {
  var timeslotArr = timeSlots.map((x) => ({
    start: x[0],
    end: x[1]
  }));

  // Pick a single timeslot and gym to use
  // Pick a timeslot randomly
  // Prefer an overlapping favourite gym
  // If that fails, prefer the user's favourite gym
  // If that fails, prefer the randomUser's favouriteGym
  // If that fails, just select any random overlapping gym
  var timeSlot = timeslotArr[Math.floor(Math.random() * timeslotArr.length)];
  var gym = null;

  if (user.favouriteGym === randomUser.favouriteGym && user.favouriteGym !== 'N/A') {
    gym = user.favouriteGym;
  } else if (user.favouriteGym !== 'N/A' && gymList.includes(user.favouriteGym)) {
    gym = user.favouriteGym;
  } else if (randomUser.favouriteGym !== 'N/A' && gymList.includes(randomUser.favouriteGym)) {
    gym = randomUser.favouriteGym;
  } else {
    gym = gymList[Math.floor(Math.random() * gymList.length)];
  }

  console.log(randomUser);

  return {
    _id: randomUser._id.toString(),
    name: randomUser.name,
    favouriteGym: randomUser.favouriteGym,
    score: randomUser.score,
    numSpotters: randomUser.spotters != null ? randomUser.spotters.length : 0,
    weights: randomUser.weights,
    exercisePref: randomUser.exercisePref,
    avgTime: randomUser.avgTime,
    deadlift: randomUser.deadlift,
    benchpress: randomUser.benchpress,
    squat: randomUser.squat,
    coolDown: randomUser.coolDown,
    warmUp: randomUser.warmUp,
    score: randomUser.score,
    gym: gym,
    timeSlot: timeSlot,
  }
}

function matchListCreate(result, acceptedUsers, pendingUsers, user) {
  acceptedUsers = acceptedUsers.map((x) => x.toString())
  pendingUsers = pendingUsers.map((x) => x.toString())

  const getInitiator = (_id) => {
    for (var i = 0; i < user.pending.length; i++) {
      if (user.pending[i]._id == _id) {
        if (user.pending[i].initiator) {
          return true;
        } else {
          return false;
        }
      }
    }

    return undefined;
  }

  var accepted = [];
  var pending = [];
  for (var i = 0; i < result.length; i++) {
    var x = result[i];
    if (acceptedUsers.includes(x._id.toString())) {
      accepted.push({
        _id: x._id.toString(),
        name: x.name
      });
    } else {
      pending.push({
        _id: x._id.toString(),
        name: x.name,
        initiator: getInitiator(x._id.toString())
      });
    }
  }

  return {
    'accepted': accepted,
    'pending': pending
  };
}

module.exports = (app, db, passport, messenger) => {
  app.get('/match', passport.authenticate('jwt', { session: false }), (req, res) => {
    const user = req.user;

    // check if there's a pending match where they're not an initiator
    // if there is, send that one
    for (var i = 0; i < user.pending.length; i++) {
      var currPending = user.pending[i];
      if (currPending.initiator === false) {
        return db.collection('users').findOne({ _id: new ObjectID(currPending._id) })
                                     .then((user, err) => {
          return res.json({
            data: {
              _id: currPending._id.toString(),
              name: user.name,
              favouriteGym: user.favouriteGym,
              score: user.score,
              numSpotters: user.spotters != null ? user.spotters.length : 0,
              weights: user.weights,
              exercisePref: user.exercisePref,
              avgTime: user.avgTime,
              deadlift: user.deadlift,
              benchpress: user.benchpress,
              squat: user.squat,
              coolDown: user.coolDown,
              warmUp: user.warmUp,
              gym: currPending.gym,
              timeSlot: currPending.timeSlot,
            },
            success: true,
          });
        });
      }
    }

    // select user based on weighting
    var newTimeslotsUser = user.timeSlots.map(x => MomentRange.range(x.start, x.end))
    
    var preferenceFilter = {
      $or: [
        {
          gender: user.gender,
        }
      ]
    }

    if (user.sexPref === 'Any') {
      preferenceFilter.$or.push({ sexPref: 'Any' });
    }

    var pipeline = [
      {
        $match: preferenceFilter
      },
      {
        $project: {
          _id: 1, name: 1,  google: 1,  favouriteGym: 1,  gymList: 1, 
          timeSlots: 1,  weights: 1,  exercisePref: 1,  avgTime: 1,
          deadlift: 1,  benchpress: 1,  squat: 1,  warmup: 1,  cooldown: 1,
          blocked: 1,  accepted: 1,  coolDown: 1, warmUp: 1,  pending: 1,
          spotters: 1, pendingSpotters: 1,  requestSpotters: 1,  matchHistory: 1,
          sexPref: 1,  gender: 1, score: 1,
          weightExercisePref: {
            $cond: [{ $eq: [ '$exercisePref', user.exercisePref ]}, 10, 0]
          },
          weightWarmup: { $cond: [{ $eq: [ '$warmUp', user.warmUp ]}, 10, 0] },
          weightCooldown: { $cond: [{ $eq: [ '$coolDown', user.coolDown ] }, 10, 0] },
          weightWeights: {
            $cond: [
              {
                $and: [
                  { $gte: [ '$weights', user.weights - 5 ] },
                  { $lte: [ '$weights', user.weights + 5 ] }
                ]
              }, 10, 0]
          },
          weightAvgTime: {
            $cond: [
              {
                $and: [
                  { $gte: [ '$avgTime', user.avgTime - 5 ] },
                  { $lte: [ '$avgTime', user.avgTime + 5  ] },
                ]
              }, 10, 0]
          },
          weightDeadlift: {
            $cond: [
              {
                $and: [
                  { $gte: [ '$deadlift', user.deadlift - 5 ] },
                  { $lte: [ '$deadlift', user.deadlift + 5 ] },
                ]
              }, 10, 0]
          },
          weightBenchPress: {
            $cond: [
              {
                $and: [
                  { $gte: [ '$benchpress', user.benchpress - 5] },
                  { $lte: [ '$benchpress', user.benchpress + 5 ] },
                ]
              }, 10, 0]
          },
          weightSquat: {
            $cond: [
              {
                $and: [
                  { $gte: [ '$squat', user.squat - 5 ] },
                  { $lte: [ '$squat', user.squat + 5 ] },
                ]
              }, 10, 0]
            }
          }
        }, 
        {
          $project: { 
            _id: 1, name: 1,  google: 1,  favouriteGym: 1,  gymList: 1, 
            timeSlots: 1,  weights: 1,  exercisePref: 1,  avgTime: 1,
            deadlift: 1,  benchpress: 1,  squat: 1,  warmup: 1,  cooldown: 1,
            blocked: 1,  accepted: 1,  coolDown: 1, warmUp: 1,  pending: 1,
            spotters: 1, pendingSpotters: 1,  requestSpotters: 1,  matchHistory: 1,
            sexPref: 1,  gender: 1, score: 1,
            overallWeight: {
              $sum: [
                '$weightExercisePref', '$weightWarmup', '$weightWarmup',
                '$weightCooldown','$weightWeights','$weightAvgTime',
                '$weightDeadlift','$weightBenchPress', '$weightSquat'
              ]
            }
          }
        },
        {
          $sort: {
            overallWeight: -1
          }
        }
      ];

    db.collection('users').aggregate(pipeline).toArray((err, rUsers) => {
      // console.log(rUsers);

      for (var x = 0; x < rUsers.length; x++) {
        var randomUser = rUsers[x];

        var r_id = randomUser._id.toString();
        if (randomUser._id.equals(user._id) ||
            (user.blocked != null && user.blocked.includes(r_id)) ||
            (randomUser.blocked != null && randomUser.blocked.includes(req.user._id.toString()))) {
          continue;
        }

        // convert timeslots into intervals
        var newTimeslotsRandom = randomUser.timeSlots.map(x => MomentRange.range(x.start, x.end)) ;

        var timeslots = [];
        for (var i = 0; i < newTimeslotsRandom.length; i++) {
          for (var j = 0; j < newTimeslotsUser.length; j++) {
            if (newTimeslotsUser[j].overlaps(newTimeslotsRandom[i])) {

              var targetTimeslot = newTimeslotsUser[j].intersect(newTimeslotsRandom[i]);

              if (user.accepted != null && testExist(user.accepted, (x) => {
                return targetTimeslot.overlaps(MomentRange.range(x.timeSlot.start, x.timeSlot.end))
              })) {
                continue;
              }

              if (user.pending != null && testExist(user.pending, (x) => {
                return targetTimeslot.overlaps(MomentRange.range(x.timeSlot.start, x.timeSlot.end))
              })) {
                continue;
              }

              timeslots.push(targetTimeslot.toDate());

              break;
            }
          }
        }

        // get overlapping gymList
        var gymList = intersect(user.gymList, randomUser.gymList);

        if (timeslots.length !== 0 && gymList.length !== 0) {
          var matchView = matchViewCreate(user, randomUser, timeslots, gymList);

          // db.collection('users').updateOne(
          //   { _id : req.user._id },
          //   { $addToSet: { matchesSentToClient: matchView } }
          // )

          return res.json({
            data: matchView,
            success: true,
          });
        }
      }
      
      return res.json({ success: false });
    })
  });

  app.post('/match/deny', passport.authenticate('jwt', { session: false }), (req, res) => {
    var targetID = req.body._id;
    var targetGym = req.body.gym;
    var targetName = req.body.name;
    var targetTimeSlot = {
      start: new Date(req.body.timeSlot.start),
      end: new Date(req.body.timeSlot.end),
    };
    
    if (targetID == null || targetGym == null || targetTimeSlot == null ) {
      return res.json({ success: false, error: 'No target \'_id\'' });
    }

    var target = {
      _id: targetID.toString(),
      gym: targetGym,
      name: targetName,
      timeSlot: targetTimeSlot
    };

    // check if targetID has been blocked already
    db.collection('users').findOne({
      _id: req.user._id,
      pending: { $elemMatch: target }
    }).then((user, err) => {
      // if user has not been blocked (reject match from algorithm)
      if (user == null) {
        db.collection('users').updateOne(
          { _id : req.user._id },
          { $push: { blocked: targetID } }
        ).then(() => {
          return res.json({ success: true, message: "User blocked" })
        })
      // currUser reject match from targetID request
      } else {
        var deepClone = deepCloneMatch(target);

        db.collection('users').updateOne(
          { _id: new ObjectID(targetID) },
          { $pull: { pending: Object.assign(deepClone, { _id: req.user._id.toString(), name: req.user.name, initiator: true }) } }
        ).then(() => {
          var deepClone = deepCloneMatch(target);

          db.collection('users').updateOne(
            { _id: req.user._id },
            { 
              $push: { blocked: targetID },
              $pull: { pending: Object.assign(deepClone, { initiator: false }) }
            }
          ).then(() => {
            return res.json({ success: true, message: "Request deleted and user blocked" })
          })
        })
      }
    })
  });

  app.post('/match/accept', passport.authenticate('jwt', { session: false }), (req, res) => {
    var targetID = req.body._id;
    var targetGym = req.body.gym;
    var targetName = req.body.name;
    var targetTimeSlot = {
      start: Moment(req.body.timeSlot.start).toDate(),
      end: Moment(req.body.timeSlot.end).toDate(),
    };

    if (targetID == null || targetGym == null || targetTimeSlot == null ) {
      return res.json({ success: false, error: 'No target \'_id\'' });
    }

    var target = {
      _id: targetID.toString(),
      gym: targetGym,
      name: targetName,
      timeSlot: targetTimeSlot,
    };

    db.collection('users').findOne({
      _id: req.user._id, 
      pending: { $elemMatch: target }
    }, {
      projection: {
        _id: 1,
        pending: { $elemMatch: target }
    }}).then((user, err) => {
      if (user != null) {
        // target user sent the request
        if (user.pending != null && user.pending[0].initiator === true) {
          return res.json({ success: false, message: "Request already pending" });
        } else {
          var deepCloneA = deepCloneMatch(target);
          var deepCloneB = deepCloneMatch(target);

          db.collection('users').updateOne(
            { _id: new ObjectID(targetID) },
            {
              $push: {
                accepted: Object.assign(deepCloneA, { _id: req.user._id.toString(), name: req.user.name }),
                matchHistory: req.user._id.toString(),
              },
              $pull: { pending: Object.assign(deepCloneB, { _id: req.user._id.toString(), name: req.user.name, initiator: true }) }
            },
          ).then(() => {
            var deepClone = deepCloneMatch(target);

            // Remove target user from current user's pending array
            db.collection('users').updateOne(
              { _id: req.user._id },
              {
                $push: {
                  accepted: target,
                  matchHistory: targetID.toString(),
                },
                $pull: { pending: Object.assign(deepClone, { initiator: false }) }
              },
            ).then(() => {
              messenger.send( req.user._id.toString(), { name: targetName, notif_type: 'match_accept' }, () => {            
              messenger.send(targetID, { name: req.user.name, notif_type: 'match_accept' }, () => {
                return res.json({ success: true, message: "Request accepted" });
              })
            })
            })
          })
        }
      } else {
        // Attempt to add current user to target user's pending array
        var deepClone = deepCloneMatch(target);
        db.collection('users').updateOne(
          { _id: new ObjectID(targetID) },
          { $push: { pending: Object.assign(deepClone, { _id: req.user._id.toString(), name: req.user.name, initiator: false }) } }
        ).then(() => {
          // Add target user to current user's pending array
          var deepClone = deepCloneMatch(target);
          db.collection('users').updateOne(
            { _id: req.user._id },
            { $push: { pending: Object.assign(deepClone, { initiator: true }) } }
          ).then(() => {
            return res.json({ success: true, message: "Request sent" }) 
          })
        }).catch((err) => { 
          return res.json({ success: false, error: err })
        })
      }
    });
  });

  app.get('/match/list', passport.authenticate('jwt', { session: false }), (req, res) => {
    const filter = {
      _id: new ObjectID(req.user._id)
    };

    db.collection('users').findOne(filter, (err, user) => {
      var acceptedUsers = [];
      var pendingUsers = [];
      for (var i = 0; i < user.accepted.length; i++) {
        acceptedUsers.push(new ObjectID(user.accepted[i]._id));
      }
      for (var i = 0; i < user.accepted.length; i++) {
        pendingUsers.push(new ObjectID(user.pending[i]._id));
      }
      db.collection('users').find({ _id: { $in: acceptedUsers.concat(pendingUsers) } }).toArray((req, result) => {
        return res.json({
          data: matchListCreate(result, acceptedUsers, pendingUsers, user),
          success: true,
        });
      })
    });
  });
}

/*

timeslots = []
    '2015-01-17T09:50:00+03:00/2015-04-17T08:29:55-04:00', 
    '2015-01-17T09:50:00+03:00/2015-04-17T08:29:55-04:00',
    '2015-01-17T09:50:00+03:00/2015-04-17T08:29:55-04:00',
]

timeslots = {
    mon: [ '2015-01-17T09:50:00+03:00/2015-04-17T08:29:55-04:00', '2015-01-17T09:50:00+03:00/2015-04-17T08:29:55-04:00' ],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [ '2015-01-17T09:50:00+03:00/2015-04-17T08:29:55-04:00' ],
    sun: []
}

1. get user object

db.collection('users').findOne( {_id: _id}, function{...} )

2. select random user 

db.collection('users').aggregate( { $sample: 1 } ) // get 1 random object

3. test for existance on rejected list/self

if ( randomUser._id == User._id || user.blocked.contains(randomUser._id) )

4. convert timeslots into intervals

moment.range(user.timeSlots[i].start, user.timeSlots[i].end)  // for each time slot

5. compare every timeslot (yes, its n^2 but we'll fix it up later)

if (timeslot1.overlaps(timeslot2))

5. return user _id and profile

res.send(json_data)

{
    success: true,
    data: [
        {
            _id: 12345,
            name: "Bob"
        }
    ]
}


*/