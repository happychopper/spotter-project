import React, { Component } from 'react';
import { Modal, RefreshControl, ScrollView, View } from 'react-native';

import { API_URL } from 'react-native-dotenv';
import { debounce } from "throttle-debounce";
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import MDIcon from 'react-native-vector-icons/MaterialIcons';
import Moment from 'moment';

import { FetchDataAuthJson, PostDataAuthJson } from '../util/FetchData';
import GymList from '../components/Profile/GymList';
import LoadingSpinner from '../components/LoadingSpinner';
import PopupBox from '../components/PopupBox';
import SexPref from '../components/Profile/SexPref';
import SummaryCard from '../components/SummaryCard';
import StyleSheet from '../util/StyleSheet';
import TimeSlots from '../components/Profile/TimeSlots';
import WorkoutPref from '../components/Profile/WorkoutPref';
import Blocked from '../components/Profile/Blocked';

export default class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null, // this needs to include the rest of the details themselves later
      
      queryText: '',
      suggestedGyms: [],
      loadedSuggestedGyms: true,

      favouriteGymEditable: false,
      gymListEditable: false,
      detailsEditable: false,
      timeSlotEditable: false,
      sexEditable: false,

      refreshing: false,

      modalVisible: false,
    };
  }

  componentDidMount = async () => {
    this.fetchUser();
  };

  fetchGymSuggestions = async (queryText) => {
    var component = this;

    this.setState({
      queryText: queryText,
      suggestedGyms: [],
      loadedSuggestedGyms: false
    }, debounce(500, async () => {
      try {
        // Retrieve the credentials
        const credentials = await Keychain.getGenericPassword();
  
        // Cancel the previous request
        if (component._cancelTokenSource != null) {
          component._cancelTokenSource.cancel('Operation canceled due to new request.')
        }
  
        component._cancelTokenSource = axios.CancelToken.source();
  
        axios.get(`${API_URL}/gyms?queryText=${queryText}`, {
          cancelToken: component._cancelTokenSource.token,
          headers: {
            'Authorization': `Bearer ${credentials.password}`,
          },
        }).then((response) => {
          var jsonData = response.data;
  
          console.log(jsonData);

          if (queryText !== '') {
            jsonData.gyms.unshift({ item: { title: queryText }, isNew: true })
          }
  
          component.setState({
            suggestedGyms: jsonData.gyms,
            loadedSuggestedGyms: true,
          });
        }).catch((error) => {
          if (axios.isCancel(error)) {
            console.log('Request canceled', error.message);
          } else {
            // do nothing lol
          }
        });
      } catch (error) {
        console.log('Keychain couldn\'t be accessed!', error);
      }
    }));
  };

  fetchUser = async (callback) => {
    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();

      FetchDataAuthJson(`${API_URL}/user`, credentials)
        .then((json) => {
          console.log(json);

          const timeSlots = json.data.user.timeSlots;

          // Convert the date objects from the time slots into moment objects
          for (var i = 0; i < timeSlots.length; i++) {
            timeSlots[i].start = Moment(timeSlots[i].start);
            timeSlots[i].end = Moment(timeSlots[i].end);
          }

          this.setState({
            user: json.data.user,
          }, () => {
            if (callback != null) {
              callback();
            }
          });
        })
        .catch((error) => {
          // This fails when there is no authorisation, so go navigate to login
          //   (unless there are other fail conditions... look into that ^^")
          if (error) {
            this.props.navigation.navigate('Login');
          }
        });
    } catch (error) {
      console.log('Keychain couldn\'t be accessed!', error);
    }
  }

  handleGenderSelect = (index, option) => {
    const { user } = this.state;
    user["gender"] = option;
    this.setState({ user: user })
  }

  handleSexPrefSelect = (index, option) => {
    const { user } = this.state;
    user["sexPref"] = option;
    this.setState({ user: user })
  }

  handlePrefSelect = (index, option) => {
    const { user } = this.state;
    user["exercisePref"] = option;
    this.setState({ user: user })
  }


  toggleEditable = (type) => {
    const editable = this.state[type];

    if (editable === true) {
      this.submitInfo();
    }

    this.setState({
      [type]: !editable
    });
  }

  toggleDetailCheckbox = (type) => {
    const { detailsEditable, user } = this.state;

    if (detailsEditable === true) {
      user[type] = !user[type];

      this.setState({
        user:user
      })
    }
  }
  
 toggleSexCheckbox = (pref) => {
    const { sexEditable, user } = this.state;

    if (sexEditable ===  true) {
      if (pref == 'same')
        user['sexPref'] = true;
      else
        user['sexPref'] = false;
      
      this.setState({
        user:user
      })
    }
  }

  handleFavouriteGym = (gym) => {
    const { user, gymListEditable } = this.state;

    if (gymListEditable === true) {
      user["favouriteGym"] = gym;
      this.setState({ user: user })
    }
  }    

  handleTextInput = (text, field) => {
    const { user } = this.state;
    user[field] = text;
    this.setState({ user: user })
  }
  
  handleGymAdd = (item) => {
    const { user } = this.state;
    
    user.gymList.push(item.item.title);

    if (user.gymList.length === 1) {
      user.favouriteGym = item.item.title;
    }
  
    this.setState({ user: user, queryText: '', suggestedGyms: [] });
  }

  handleDateTimeChange = (date, index, startOrEnd, type) => {
    const { user } = this.state;
    var oldTimeSlot = user.timeSlots[index][startOrEnd];
    var newTimeSlot = Moment(date);

    // Set the time from the old one into the new one, as when you set date, it
    //   defaults to time 00:00
    if (type === 'date') {
      newTimeSlot.hour(oldTimeSlot.hour());
      newTimeSlot.minute(oldTimeSlot.minute());
    }

    user.timeSlots[index][startOrEnd] = newTimeSlot;

    const currStart = user.timeSlots[index].start;
    const currEnd = user.timeSlots[index].end;

    // Calculate the difference between start and end
    var duration = Moment.duration(currEnd.diff(currStart));
    var minutes = duration.asMinutes();

    // If the difference is less than 30 minutes, then alter appropriately
    if (minutes < 30) { // Difference is less than 30 minutes
      if (startOrEnd === 'start') { // Ensure the end is at least 30 min after start
        user.timeSlots[index].end = Moment(currStart).add(30, 'minutes');
      } else {                      // Ensure the start is at least 30 min before end
        user.timeSlots[index].start = Moment(currEnd).subtract(30, 'minutes');
      }
    }

    this.setState({ user: user });
  }

  handleTimeSlotAdd = () => {
    const { user } = this.state;

    var start = Moment();
    const pastThirty = start.minute() % 30;

    if (pastThirty > 15) {
      start = Moment(start).add(30 - pastThirty, "minutes");
    } else {
      start = Moment(start).subtract(pastThirty, "minutes");
    }

    const end = Moment(start).add(1, 'hours');

    const newTimeslot = {
      start: start,
      end: end
    }

    user.timeSlots.push(newTimeslot);

    this.setState({ user: user });
  }

  handleTimeSlotDelete = (index) => {
    const { user } = this.state;
    user.timeSlots.splice(index, 1);
    
    this.setState({ user: user });
  }

  handleMatchDelete = (index) => {
    const { user } = this.state;
    user.accepted.splice(index, 1);
    this.setState({ user: user });
  }

  handleGymDelete = (gym, index) => {
    const { user } = this.state;
    user.gymList.splice(index, 1);

    if (gym === user.favouriteGym) {
      user.favouriteGym = 'N/A';
      if (user.gymList.length > 0) {
        user.favouriteGym = user.gymList[0];
      }
    }

    this.setState({ user: user });
  }

  goToMatch = async () => {
    this.props.navigation.navigate('Match');
  }

  handleRefresh = () => {
    this.setState({
      favouriteGymEditable: false,
      gymListEditable: false,
      detailsEditable: false,
      timeSlotEditable: false,
      sexEditable: false,

      refreshing: true,
    }, () => {
      this.fetchUser(() => {
        this.setState({ refreshing: false });
      });
    });
  }

  handleModalClose = () => {
    this.setState({ modalVisible: false, user: null }, this.fetchUser);
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

    this.setState({
      user: null,

      queryText: '',
      suggestedGyms: [],

      favouriteGymEditable: false,
      gymListEditable: false,
      detailsEditable: false,
      timeSlotEditable: false,
      sexEditable: false,
    }, () => {
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

  logout = async () => {
    console.log('logging out');

    // Retrieve the credentials, and logout
    // Specifically don't erase them here; erasing them here breaks Android, as
    //   do many other things (f*ck Android)
    try {
      const credentials = await Keychain.getGenericPassword();
      await Keychain.resetGenericPassword();
      
      FetchDataAuthJson(`${API_URL}/checkin/unregister`, credentials)
        .then((json) => {
          console.log(json);

          FetchDataAuthJson(`${API_URL}/logout`, credentials)
            .then(() => {
                // Navigate back to login, and wipe password
                this.props.navigation.navigate('Login');
              });
        })
        .catch(async (error) => {
          console.log(error);
        });
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    const { detailsEditable, gymListEditable, loadedSuggestedGyms, modalVisible,
            queryText, refreshing, sexEditable, suggestedGyms, timeSlotEditable,
            user } = this.state;

    const popUpBoxButtons = [
      {
        iconName: 'refresh',
        message: 'REFRESH TO CONTINUE',
        onPress: this.handleModalClose,
      }
    ]

    return (
      <React.Fragment>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={this.handleModalClose}
        >
          <View style={modalBacking}>
            <PopupBox
              buttons={popUpBoxButtons}
              message={'Something appears to\nhave gone wrong'}
            />
          </View>
        </Modal>
        <View style={StyleSheet.container}>
          {
            user == null &&
            <LoadingSpinner />
          }
          {
            user != null &&
            <ScrollView
              keyboardShouldPersistTaps='always'
              refreshControl={
                <RefreshControl
                  colors={['#00D383']}
                  onRefresh={this.handleRefresh}
                  refreshing={refreshing}
                  tintColor={'#00D383'}
                />
              }
            >
              <View style={StyleSheet.content}>
                <SummaryCard personal user={user} />

                <GymList
                  fetchGymSuggestions={this.fetchGymSuggestions}
                  gymListEditable={gymListEditable}
                  handleFavouriteGym={this.handleFavouriteGym}
                  handleGymAdd={this.handleGymAdd}
                  handleGymDelete={this.handleGymDelete}
                  loadedSuggestedGyms={loadedSuggestedGyms}
                  queryText={queryText}
                  suggestedGyms={suggestedGyms}
                  toggleEditable={this.toggleEditable}
                  user={user}
                />

                <TimeSlots
                  handleTimeSlotAdd={this.handleTimeSlotAdd}
                  handleDateTimeChange={this.handleDateTimeChange}
                  handleTimeSlotDelete={this.handleTimeSlotDelete}
                  timeSlotEditable={timeSlotEditable}
                  toggleEditable={this.toggleEditable}
                  user={user}
                />

                <SexPref
                  handleGenderSelect={this.handleGenderSelect}
                  handleSexPrefSelect={this.handleSexPrefSelect}
                  sexEditable={sexEditable}
                  toggleEditable={this.toggleEditable}
                  user={user}
                />

                <WorkoutPref
                  detailsEditable={detailsEditable}
                  handlePrefSelect={this.handlePrefSelect}
                  handleTextInput={this.handleTextInput}
                  toggleDetailCheckbox={this.toggleDetailCheckbox}
                  toggleEditable={this.toggleEditable}
                  user={user}
                />

                <Blocked
                  goToMatch = {this.goToMatch}
                  navigation = {this.props.navigation}
                  user = {user}
                />

                <View style={logoutButtonContainer}>
                  <MDIcon.Button
                    name="exit-to-app"
                    backgroundColor="#DD4B39"
                    onPress={this.logout}
                    {...logoutButton}
                  >
                    LOGOUT
                  </MDIcon.Button>
                </View>
              </View>
            </ScrollView>
          }
        </View>
      </React.Fragment>
    );  
  }
}

const logoutButtonContainer = {
  alignSelf: 'stretch',
  marginBottom: 16,
  marginLeft: 16,
  marginRight: 16,
};

const logoutButton = {
  alignItems: 'center',
  alignSelf: 'stretch',
  backgroundColor: '#DD4B39',
  borderRadius: 10,
  justifyContent: 'center',
  paddingHorizontal: 16,
  paddingVertical: 16,
};

const modalBacking = {
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'center',
};