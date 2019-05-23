import React, { Component } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { API_URL } from 'react-native-dotenv';
import * as Keychain from 'react-native-keychain';
import PushNotification from 'react-native-push-notification';
import SplashScreen from 'react-native-splash-screen';

import { FetchDataAuthJson, PostDataAuthJson } from '../util/FetchData';
import BrightButton from '../components/BrightButton';
import LoadingSpinner from '../components/LoadingSpinner';
import NotifService from '../util/NotifService';

import Matches from '../components/Profile/Matches';
import Pending from '../components/Profile/Pending';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null, // user has not logged in yet
      refreshing: false,

      matchesEditable: false,
      pendingEditable: false,
    };

    this.notif = new NotifService(this.handleNotificationOnRegister.bind(this),
                                  this.handleNotificationOnNotification.bind(this));
  }

  componentDidMount = async () => { 
    this.fetchUser();
  };

  fetchUser = async (callback) => {
    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();
      const component = this;

      FetchDataAuthJson(`${API_URL}/user`, credentials)
        .then((json) => {
          SplashScreen.hide();
          component.setState({
            user: json.data.user,
          }, () => {
            if (callback != null) {
              callback();
            }
          });
        })
        .catch(async (error) => {
          // This fails when there is no authorisation, so go navigate to login
          //   (unless there are other fail conditions... look into that ^^")
          await Keychain.resetGenericPassword();
          if (error) {
            component.props.navigation.navigate('Login');
          }
        });
    } catch (error) {
      await Keychain.resetGenericPassword();
      console.log('Keychain couldn\'t be accessed!', error);
    }
  }

  goToMatch = async () => {
    this.props.navigation.navigate('Match');
  }

  handleCheckin = async (targetId, gymName, timeSlot) => {
    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();

      const data = {
        gym: gymName,
        timeSlot: timeSlot,
        user_id: targetId,
      }

      this.setState({
        user: null,
        matchesEditable: false,
        pendingEditable: false
      }, () => {
        PostDataAuthJson(`${API_URL}/checkin`, credentials, data)
          .then(() => {
              this.fetchUser();
            })
          .catch(async () => {
              this.fetchUser();
            });
      });
    } catch (error) {
      await Keychain.resetGenericPassword();
      console.log('Keychain couldn\'t be accessed!', error);
    }
  }

  handleRefresh = () => {
    this.setState({ refreshing: true }, () => {
      this.fetchUser(() => {
        this.setState({ refreshing: false });
      });
    });
  }

  handleNotificationOnRegister = async (tokenObj) => {
    const data = {
      token: tokenObj.token
    };

    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();

      PostDataAuthJson(`${API_URL}/checkin/register`, credentials, data)
        .then((json) => {
          console.log(json);
          // if (json.success === false) {
          //   await Keychain.resetGenericPassword();
          //   component.props.navigation.navigate('Login');
          // }
        })
        .catch(async (error) => {
          console.log(error);
          // This fails when there is no authorisation, so go navigate to login
          //   (unless there are other fail conditions... look into that ^^")
          // if (error) {
          //   await Keychain.resetGenericPassword();
          //   component.props.navigation.navigate('Login');
          // }
        });
    } catch (error) {
      await Keychain.resetGenericPassword();
      console.log('Keychain couldn\'t be accessed!', error);
    }
  }

  handleNotificationOnNotification = (notification) => {
    console.log(notification);

    if (notification.notif_type != null) {
      if (notification.notif_type === 'checkin') {
        PushNotification.localNotification({
          message: `${notification.name} has checked in to ${notification.gym} at the gym entrance!`
        });
      } else if (notification.notif_type === 'match_accept') {
        PushNotification.localNotification({
          message: `${notification.name} has accepted your spot request!`
        });
      } else if (notification.notif_type === 'spotter_req') {
        PushNotification.localNotification({
          message:`${notification.name} has send you a friend request!`
        });
      } else if (notification.notif_type === 'spotter_accept') {
        PushNotification.localNotification({
          message: `${notification.name} has accepted your friend request!`
        });
      }
    }
  }

  handleMatchDelete = (index) => {
    const { user } = this.state;
    user.accepted.splice(index, 1);
    this.setState({ user: user });
  }

  handlePendingDelete = (index) => {
    const { user } = this.state;
    user.pending.splice(index, 1);
    this.setState({ user: user });
  }

  submitInfo = async () => {
    const { user } = this.state;

    const timeSlots = user.timeSlots;

    // Convert the Moment objects from the time slots into date objects
    // May not actually be Moment objects as we don't always refresh the user
    //   (because a successful update means that there's no discrepancy between
    //   the server and the client)
    for (var i = 0; i < timeSlots.length; i++) {
      if (timeSlots[i].start.toDate != null) {
        timeSlots[i].start = timeSlots[i].start.toDate();
      }
      if (timeSlots[i].start.toDate != null) {
        timeSlots[i].end = timeSlots[i].end.toDate();
      }
    }

    const data = {
      favouriteGym: user.favouriteGym,
      timeSlots: user.timeSlots,
      gymList: user.gymList,
      accepted: user.accepted,
      pending: user.pending,
      gender: user.gender,
      sexPref: user.sexPref,
      exercisePref: user.exercisePref,
      avgTime: user.avgTime,
      deadlift: user.deadlift,
      benchpress: user.benchpress,
      squat: user.squat,
      warmUp: user.warmUp,
      coolDown: user.coolDown,
      sexPref: user.sexPref,
    }

    // Retrieve the credentials
    const credentials = await Keychain.getGenericPassword();
    const component = this;

    this.setState({ user: null }, () => {
      PostDataAuthJson(`${API_URL}/user/update`, credentials, data)
        .then((json) => {
          // If failed to submit, there's mismatch between server and client,
          //   so show prompt to reload
          if (json.success !== true) {
            component.setState({ modalVisible: true });
          } else {
            component.fetchUser();
          }
        })
        .catch(() => {
            if (json.success !== true) {
              component.setState({ modalVisible: true });
            }
          });
    })
  }

  toggleEditable = (type) => {
    const editable = this.state[type];
    const { user } = this.state;

    if (editable === true) {
      console.log(user.pending);
      this.submitInfo();
    }

    this.setState({
      [type]: !editable
    });
  }


  render() {
    const { matchesEditable, pendingEditable, refreshing, user } = this.state;
    return (
      <View style={styles.container}>
        {
          user == null &&
          <LoadingSpinner />
        }
        {
          user != null &&
          <ScrollView
            refreshControl={
              <RefreshControl
                colors={['#00D383']}
                onRefresh={this.handleRefresh}
                refreshing={refreshing}
                tintColor={'#00D383'}
              />
            }
          >
            <View style={styles.content}>
              <BrightButton
                name={'account-circle'}
                onPress={this.goToMatch}
                style={{ margin: 16 }}
              >
                FIND A MATCH
              </BrightButton>
            </View>
            <Matches
              handleCheckin={this.handleCheckin}
              handleMatchDelete={this.handleMatchDelete}
              goToMatch={this.goToMatch}
              matchesEditable={matchesEditable}
              navigation={this.props.navigation}
              toggleEditable={this.toggleEditable}
              user={user}
            />
            <Pending
              handlePendingDelete={this.handlePendingDelete}
              goToMatch={this.goToMatch}
              pendingEditable={pendingEditable}
              navigation={this.props.navigation}
              toggleEditable={this.toggleEditable}
              user={user}
            />
          </ScrollView>
        }
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#073942',
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  avatar: {
    margin: 20,
  },
  avatarImage: {
    borderRadius: 50,
    height: 100,
    width: 100,
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  text: {
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
  },
  buttons: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    margin: 20,
    marginBottom: 30,
  },
});




