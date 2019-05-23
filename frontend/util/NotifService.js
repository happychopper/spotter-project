import PushNotification from 'react-native-push-notification';

export default class NotifService {
  constructor(onRegister, onNotification) {
    this.configure(onRegister, onNotification);

    this.lastId = 0;
  }

  configure(onRegister, onNotification) {
    PushNotification.configure({
      onRegister: onRegister,
      onNotification: onNotification,
      senderID: '709478859702',
    });
  }
}
