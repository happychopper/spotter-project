const Fuse        = require('fuse.js');
const Moment      = require('moment');
const ObjectID    = require('mongodb').ObjectID;

// Deletes all accepted and pending matches that involve the current user
// Returns the two promises for the updates
function deleteMatches(db, user, removedGyms, removedTimeSlots, removedMatches,
                       removedPending) {
  // Build out lists of timeSlots to remove (to fit the format for a match)
  var toBeRemoved = [];
  var toBeRemovedOthers = [];

  // Iterate over the time slots, and build out the the timeslots to match on
  //   (both current user and others, as both are affected and use similar method)
  for (var i = 0; i < removedTimeSlots.length; i++) {
    toBeRemoved.push({
      'timeSlot.start': removedTimeSlots[i].start,
      'timeSlot.end': removedTimeSlots[i].end,
    })
    toBeRemovedOthers.push({
      _id: user._id.toString(),
      'timeSlot.start': removedTimeSlots[i].start,
      'timeSlot.end': removedTimeSlots[i].end,
    })
  }

  // Iterate over the gyms, and build out the timeslots to match on (just
  //   for others, as for the current user, can use $in)
  for (var i = 0; i < removedGyms.length; i++) {
    toBeRemovedOthers.push({
      _id: user._id.toString(),
      gym: removedGyms[i]
    })
  }

  // Iterate over the matches, and build out the matches to match on (just
  //   for others, as for the current user, removed matches are directly
  //   removed in the /user/update route)
  for (var i = 0; i < removedMatches.length; i++) {
    removedMatches[i]._id = user._id.toString();
    delete removedMatches[i].name;

    toBeRemovedOthers.push(removedMatches[i]);
  }

  // Iterate over the matches, and build out the pending matches to match on (just
  //   for others, as for the current user, removed matches are directly
  //   removed in the /user/update route)
  for (var i = 0; i < removedPending.length; i++) {
    removedPending[i]._id = user._id.toString();
    delete removedPending[i].name;
    delete removedPending[i].initiator;

    toBeRemovedOthers.push(removedPending[i]);
  }


  // Add in the removed gyms for the user
  toBeRemoved.push({ gym: { $in: removedGyms } });
  toBeRemoved.push({ gym: { $in: removedGyms } });

  // Remove all accepted or pending matches from the user that have a removed
  //   gym, or a removed time slot
  // Removed matches are directly removed in the /user/update route
  var updateUser = {
    $pull: {
      accepted: {
        $or: toBeRemoved
      },
      pending: {
        $or: toBeRemoved
      },
    }
  }

  console.log(updateUser);

  if (toBeRemovedOthers.length === 0) {
    return [
      db.collection('users').updateOne({ _id: user._id }, updateUser)
    ]
  } else {
    var updateOthers = {
      $pull: {
        accepted: {
          $or: toBeRemovedOthers
        },
        pending: {
          $or: toBeRemovedOthers
        },
      }
    };
  
    console.log(updateOthers);
    
    return [
      db.collection('users').updateOne({ _id: user._id }, updateUser),
      db.collection('users').updateMany({}, updateOthers)
    ]
  }
}

module.exports = (app, db, passport) => {
  var fuseOptions = {
    shouldSort: true,
    tokenize: true,
    includeMatches: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      "title"
    ]
  };

  app.get('/gyms', passport.authenticate('jwt', { session: false }), (req, res) => {
    var queryText = req.query.queryText;
    db.collection('users').distinct('gymList', {}, (err, gyms) => {
      var formattedGyms = gyms.map((gym) => {
        return { title: gym }
      });

      var fuse = new Fuse(formattedGyms, fuseOptions);
      var result = fuse.search(queryText);

      result = result.slice(0, 3);

      return res.json({ gyms: result });
    });
  });

  app.get('/user', passport.authenticate('jwt', { session: false }), (req, res) => {
    for (var i = 0; i < req.user.blocked.length; i++) {
      req.user.blocked[i] = new ObjectID(req.user.blocked[i]);
    }

    db.collection('users').find({ _id: { $in: req.user.blocked } }).toArray((err, blocked) => {
      for (var i = 0; i < blocked.length; i++) {
        blocked[i] = {
          _id: blocked[i]._id.toString(),
          name: blocked[i].name,
        }
      }

      req.user.blocked = blocked;
      
      return res.json({
        data: {
          user: req.user
        },
        success: true
      });
    })
  });

  app.post('/user/update', passport.authenticate('jwt', { session: false }), (req, res) => {
    var { favouriteGym, gymList, timeSlots, gender, sexPref, exercisePref, avgTime, deadlift,
          benchpress, squat, warmUp, coolDown, accepted, pending } = req.body;
    var update = { $set: {} };

    const filter = {
      _id: new ObjectID(req.user._id)
    };

    var removedGyms = [];
    var removedTimeSlots = [];
    var removedAccepted = [];
    var removedPending = [];

    if (favouriteGym != null) {
      // Verify that the favourite gym is a string
      if (Object.prototype.toString.call(favouriteGym) !== '[object String]') {
        return res.status(400).json({
          data: {
            message: 'The favourite gym is invalid. Please send a string.'
          },
          success: false
        });
      }

      update.$set.favouriteGym = favouriteGym;
    }

    // Gender Update
    if (gender != null) {
      // Verify that the favourite gym is a string
      if (Object.prototype.toString.call(gender) !== '[object String]') {
        return res.status(400).json({
          data: {
            message: 'The gender is invalid. Please send a string.'
          },
          success: false
        });
      }

      update.$set.gender = gender;
    }

    // Sex Preference Update
    if (sexPref != null) {
      // Verify that the favourite gym is a string
      if (Object.prototype.toString.call(sexPref) !== '[object String]') {
        return res.status(400).json({
          data: {
            message: 'The sex preference is invalid. Please send a string.'
          },
          success: false
        });
      }

      update.$set.sexPref = sexPref;
    }

    if (exercisePref != null) {
      // Verify that the favourite gym is a string
      if (Object.prototype.toString.call(exercisePref) !== '[object String]') {
        return res.status(400).json({
          data: {
            message: 'The exercise preference is invalid. Please send a string.'
          },
          success: false
        });
      }

      update.$set.exercisePref = exercisePref;
    }

    if (avgTime != null) {
      if (avgTime === '') { // Convert empty string to 0
        avgTime = '0';
      }

      const avgTimeInt = parseInt(avgTime, 10);
      if (isNaN(avgTimeInt)) {
        return res.status(400).json({
          data: {
            message: 'The average time is invalid. Please send an integer.'
          },
          success: false
        });
      }
      update.$set.avgTime = avgTimeInt;
    }

    if (deadlift != null) {
      if (deadlift === '') { // Convert empty string to 0
        deadlift = '0';
      }

      const deadliftInt = parseInt(deadlift, 10);
      if (isNaN(deadliftInt)) {
        return res.status(400).json({
          data: {
            message: 'The deadlift weight is invalid. Please send an integer.'
          },
          success: false
        });
      }

      update.$set.deadlift = deadliftInt;
    }

    if (benchpress != null) {
      if (benchpress === '') { // Convert empty string to 0
        benchpress = '0';
      }

      const benchpressInt = parseInt(benchpress, 10);
      if (isNaN(benchpressInt)) {
        return res.status(400).json({
          data: {
            message: 'The benchpress weight is invalid. Please send an integer.'
          },
          success: false
        });
      }

      update.$set.benchpress = benchpressInt;
    }

    if (squat != null) {
      if (squat === '') { // Convert empty string to 0
        squat = '0';
      }

      const squatInt = parseInt(squat, 10);
      if (isNaN(squatInt)) {
        console.log("Squat weight is not an int. \n")
        return res.status(400).json({
          data: {
            message: 'The squat weight is invalid. Please send an integer.'
          },
          success: false
        });
      }
      update.$set.squat = squatInt;
    }

    if (warmUp != null) {
      update.$set.warmUp = warmUp;
    }

    if (coolDown != null) {
      update.$set.coolDown = coolDown;
    }

    if (gymList != null) {
      if (Array.isArray(gymList) === false) {
        return res.status(400).json({
          data: {
            message: 'The gym list is invalid. Please send an array of strings.'
          },
          success: false
        });
      }

      for (var i = 0; i < gymList.length; i++) {
        if (Object.prototype.toString.call(gymList[i]) !== '[object String]') {
          return res.status(400).json({
            data: {
              message: 'The gym list is invalid. Please send an array of strings.'
            },
            success: false
          });
        }
      }

      update.$set.gymList = gymList;

      removedGyms = req.user.gymList.filter((gym) => {
        return !gymList.includes(gym)
      });
    }

    if (timeSlots != null) {
      // Verify all the timeslots are in an array, with each of them being JS
      //   Date object strings
      if (Array.isArray(timeSlots) === false) {
        return res.status(400).json({
          data: {
            message: 'The timeslots are invalid. Please send an array of start/end Date object strings that are at least 30 minutes apart.'
          },
          success: false
        });
      }

      for (var i = 0; i < timeSlots.length; i++) {
        timeSlots[i].start = Moment(new Date(timeSlots[i].start)).seconds(0).milliseconds(0).toDate();
        timeSlots[i].end = Moment(new Date(timeSlots[i].end)).seconds(0).milliseconds(0).toDate();

        // Check that they're valid date objects
        if (Object.prototype.toString.call(timeSlots[i].start) !== '[object Date]' ||
            Object.prototype.toString.call(timeSlots[i].end) !== '[object Date]') {
          return res.status(400).json({
            data: {
              message: 'The timeslots are invalid. Please send an array of start/end Date object strings that are at least 30 minutes apart.'
            },
            success: false
          });
        }

        const startMoment = Moment(timeSlots[i].start);
        const endMoment = Moment(timeSlots[i].end);
        const minutes = Moment.duration(startMoment.diff(endMoment)).asMinutes();

        // Check that time differences are at least 30 minutes (if they don't
        //   use an alternate client, this should never be an issue)
        if (minutes > -30) {
          return res.status(400).json({
            data: {
              message: 'The timeslots are invalid. Please send an array of start/end Date object strings that are at least 30 minutes apart.'
            },
            success: false
          });
        }
      }

      update.$set.timeSlots = timeSlots;

      removedTimeSlots = req.user.timeSlots.filter((timeSlot) => {
        for (var i = 0; i < timeSlots.length; i++) {
          if (timeSlot.start.toString() === timeSlots[i].start.toString() &&
              timeSlot.end.toString() === timeSlots[i].end.toString()) {
            return false;
          }
        }

        return true;
      });
    }

    if (accepted != null) {
      // Verify all the accepted are in an array, with each of them being objects
      if (Array.isArray(accepted) === false) {
        return res.status(400).json({
          data: {
            message: 'The accepted are invalid. Please send an array of objects.'
          },
          success: false
        });
      }

      console.log(accepted);

      for (var i = 0; i < accepted.length; i++) {
        accepted[i].timeSlot.start = Moment(new Date(accepted[i].timeSlot.start)).seconds(0).milliseconds(0).toDate();
        accepted[i].timeSlot.end = Moment(new Date(accepted[i].timeSlot.end)).seconds(0).milliseconds(0).toDate();

        // Check that they're valid date objects
        if (Object.prototype.toString.call(accepted[i].timeSlot.start) !== '[object Date]' ||
            Object.prototype.toString.call(accepted[i].timeSlot.end) !== '[object Date]') {
          return res.status(400).json({
            data: {
              message: 'The accepted are invalid. Please send an array of objects.'
            },
            success: false
          });
        }
      }

      update.$set.accepted = accepted;

      removedAccepted = req.user.accepted.filter((acceptedItem) => {
        for (var i = 0; i < accepted.length; i++) {
          if (acceptedItem.timeSlot.start.toString() === accepted[i].timeSlot.start.toString() &&
              acceptedItem.timeSlot.end.toString() === accepted[i].timeSlot.end.toString() &&
              acceptedItem._id === accepted[i]._id &&
              acceptedItem.gym === accepted[i].gym &&
              acceptedItem.name === accepted[i].name) {
            return false;
          }
        }

        return true;
      });
    }

    if (pending != null) {
      // Verify all the pending are in an array, with each of them being objects
      if (Array.isArray(pending) === false) {
        return res.status(400).json({
          data: {
            message: 'The pending are invalid. Please send an array of objects.'
          },
          success: false
        });
      }

      console.log(pending);

      for (var i = 0; i < pending.length; i++) {
        pending[i].timeSlot.start = Moment(new Date(pending[i].timeSlot.start)).seconds(0).milliseconds(0).toDate();
        pending[i].timeSlot.end = Moment(new Date(pending[i].timeSlot.end)).seconds(0).milliseconds(0).toDate();

        // Check that they're valid date objects
        if (Object.prototype.toString.call(pending[i].timeSlot.start) !== '[object Date]' ||
            Object.prototype.toString.call(pending[i].timeSlot.end) !== '[object Date]') {
          return res.status(400).json({
            data: {
              message: 'The pending are invalid. Please send an array of objects.'
            },
            success: false
          });
        }
      }

      update.$set.pending = pending;

      removedPending = req.user.pending.filter((pendingItem) => {
        for (var i = 0; i < pending.length; i++) {
          if (pendingItem.timeSlot.start.toString() === pending[i].timeSlot.start.toString() &&
              pendingItem.timeSlot.end.toString() === pending[i].timeSlot.end.toString() &&
              pendingItem._id === pending[i]._id &&
              pendingItem.gym === pending[i].gym &&
              pendingItem.name === pending[i].name) {
            return false;
          }
        }

        return true;
      });
    }

    db.collection('users').updateOne(filter, update, (err, result) => {
      if (err) {
        return res.status(500).json({
          data: {
            message: 'Something went wrong when updating the user. Please try again.'
          },
          success: false
        });
      } else {
        var deletePromises = deleteMatches(db, req.user, removedGyms,
                                           removedTimeSlots, removedAccepted,
                                           removedPending);
        
        Promise.all(deletePromises).then((values) => {
          return res.json({ success: true });
        });
      }
    });
  })
}