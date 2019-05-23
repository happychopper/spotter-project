const GCM        = require('node-gcm');

module.exports = (db) => {
  var sender = null;

  return {
    initiateMessenger: () => {
      sender = new GCM.Sender(process.env.GCM_KEY);
    },

    send: (user_id, payload, cb) => {
      if (sender == null) {
        if (cb != null)
          cb({ success: false, message: "Sender not initialised" });
        else
          return;
      }

      if (user_id == null || payload == null) {
        if (cb != null)
          cb({ success: false, message: "No user or payload" });
        else
          return;
      }

      db.collection('gcm').findOne({ user_id: user_id }, (err, token_pair) => {
        if (token_pair == null || token_pair.token == null) {
          if (cb != null)
            cb({ success: false, message: "User not registered" });
          else
            return;
        }

        var msg = new GCM.Message({
          data: payload
        });

        sender.send(msg, { registrationTokens: [ token_pair.token ] }, function (err, response) {
          if (cb == null)
            return;
          if (err)
            cb({ success: false, message: err });
          else
            cb({ success: true });
        })
      });
    }
  }
}