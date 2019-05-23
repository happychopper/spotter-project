import React, { Component } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { API_URL } from 'react-native-dotenv';
import Moment from 'moment';
import MDIcon from 'react-native-vector-icons/MaterialIcons';
import * as Keychain from 'react-native-keychain';

import { FetchDataAuthJson, PostDataAuthJson } from '../util/FetchData';
import PopupBox from '../components/PopupBox';
import LoadingSpinner from '../components/LoadingSpinner';
import SummaryCard from '../components/SummaryCard';
import WorkoutPref from '../components/Profile/WorkoutPref';

export default class Match extends Component {
  state = {
    user: null,

    suggestedMatch: null,
    suggestedMatchLoaded: false,

    refreshing: false,
  };

  componentDidMount = async () => {
    this.navSub = this.props.navigation.addListener(
      'didFocus',
      this.retrieveSuggestion
    );

    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();

      FetchDataAuthJson(`${API_URL}/user`, credentials)
        .then((json) => {
          this.setState({
            user: json.data.user,
          });
        })
        .catch((error) => {
          // This fails when there is no authorisation, so go navigate to login
          //   (unless there are other fail conditions... look into that ^^")
          if (error) {
            this.props.navigation.navigate('Login');
          }
        });
      
      this.retrieveSuggestion();
    } catch (error) {
      console.log('Keychain couldn\'t be accessed!', error);
    }
  };

  approveSuggestion = async () => {
    const { suggestedMatch } = this.state;

    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();
      const component = this;

      this.setState({ suggestedMatch: null, suggestedMatchLoaded: false }, () => {
        PostDataAuthJson(`${API_URL}/match/accept`, credentials, suggestedMatch)
          .then((json) => {
            console.log(json);

            // Get a new suggestion
            component.retrieveSuggestion();
          })
          .catch((error) => {
          });
      })
    } catch (error) {
      console.log('Keychain couldn\'t be accessed!', error);
    }
  }

  disproveSuggestion = async () => {
    const { suggestedMatch } = this.state;

    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();
      const component = this;

      this.setState({ suggestedMatch: null, suggestedMatchLoaded: false }, () => {
        PostDataAuthJson(`${API_URL}/match/deny`, credentials, suggestedMatch)
          .then((json) => {
            // Get a new suggestion
            component.retrieveSuggestion();
          })
          .catch((error) => {
          });
      });
    } catch (error) {
      console.log('Keychain couldn\'t be accessed!', error);
    }
  }

  handleRefresh = () => {
    this.setState({
      refreshing: true,
    }, () => {
      this.retrieveSuggestion(() => {
        this.setState({ refreshing: false });
      });
    });
  }

  retrieveSuggestion = (callback) => {
    // Reset everything first
    if (this.refs['gyms'] != null) {
      this.refs['gyms'].select(-1);
    }
    if (this.refs['timeslots'] != null) {
      this.refs['timeslots'].select(-1);
    }

    this.setState({
      suggestedMatch: null,
      suggestedMatchLoaded: false,
    }, async () => {
      try {
        // Retrieve the credentials
        const credentials = await Keychain.getGenericPassword();

        // Now fetch the new suggested match
        FetchDataAuthJson(`${API_URL}/match`, credentials)
          .then((json) => {
            // If successful, just set it
            // If not successful, show alternative UI
            if (json.success === true) {
              console.log(json.data)
              this.setState({
                suggestedMatch: json.data,
                suggestedMatchLoaded: true,
              }, () => {
                if (callback != null && callback &&
                    {}.toString.call(callback) === '[object Function]') {
                  callback();
                }
              });
            } else {
              this.setState({
                suggestedMatchLoaded: true,
              }, () => {
                if (callback != null && callback &&
                    {}.toString.call(callback) === '[object Function]') {
                  callback();
                }
              });
            }
          })
          .catch((error) => {
          });
      } catch (error) {
        console.log('Keychain couldn\'t be accessed!', error);
      }
    });
  }

  render() {
    const { refreshing, suggestedMatch, suggestedMatchLoaded, user } = this.state;

    var startTime = '';
    var endTime = '';
    if (suggestedMatchLoaded === true && suggestedMatch != null) {
      startTime = Moment(suggestedMatch.timeSlot.start).format("h:mm a, D MMM");
      endTime = Moment(suggestedMatch.timeSlot.end).format("h:mm a, D MMM");
    }

    const popUpBoxButtons = [
      {
        iconName: 'edit',
        message: 'ADJUST PREFERENCES',
        onPress: () => { this.props.navigation.navigate('Profile') },
      },
      {
        iconName: 'refresh',
        message: 'REFRESH',
        onPress: () => { this.retrieveSuggestion(null) }
      }
    ]

    return (
      <View style={styles.container}>
        {
          (user == null || suggestedMatchLoaded === false) &&
          <LoadingSpinner />
        }
        {
          (user != null && suggestedMatchLoaded === true) &&
          <View style={styles.content}>
            {
              suggestedMatch == null &&
              <PopupBox
                buttons={popUpBoxButtons}
                message={'You don\'t have any more matches'}
              />
            }
            {
              suggestedMatch != null &&
              <ScrollView
                refreshControl={
                  <RefreshControl
                    colors={['#00D383']}
                    onRefresh={this.handleRefresh}
                    refreshing={refreshing}
                    tintColor={'#00D383'}
                  />
                }
                style={{ alignSelf: 'stretch' }}
              >
                <SummaryCard user={suggestedMatch} />
                <View style={infoCard}>
                  <View style={{ alignSelf: 'stretch', flexDirection: 'row' }}>
                    <View style={prependLight}>
                      <Text style={prependText}>
                        Gym:
                      </Text>
                    </View>
                    <Text style={infoCardText}>
                      {suggestedMatch.gym}
                    </Text>
                  </View>
                  <View style={{ alignSelf: 'stretch', flexDirection: 'row' }}>
                    <View style={prependDarker}>
                      <Text style={prependText}>
                        Time Slot:
                      </Text>
                    </View>
                    <Text style={infoCardText}>
                      {startTime}{' - \n'}
                      {endTime}
                    </Text>
                  </View>
                </View>
                <WorkoutPref otherProfile user={suggestedMatch} />
                <View style={approveDisproveButtons}>
                  <View style={approveButtonContainer}>
                    <MDIcon.Button
                      name={'check'}
                      iconStyle={approveDisproveButtonIcon}
                      onPress={this.approveSuggestion}
                      size={32}
                      {...approveButton}
                    />
                  </View>
                  <View style={disproveButtonContainer}>
                    <MDIcon.Button
                      name={'close'}
                      iconStyle={approveDisproveButtonIcon}
                      onPress={this.disproveSuggestion}
                      size={32}
                      {...disproveButton}
                    />
                  </View>
                </View>
              </ScrollView>
            }
          </View>
        }
      </View>
    );
  }
}

const approveDisproveButtons = {
  alignSelf: 'stretch',
  flexDirection: 'row',
  height: 64,
  marginBottom: 16,
  marginHorizontal: 16,
}

const approveButtonContainer = {
  flex: 1,
  marginRight: 8,
};

const disproveButtonContainer = {
  flex: 1,
  marginLeft: 8,
};

const approveButton = {
  alignItems: 'center',
  backgroundColor: '#00D383',
  borderRadius: 10,
  color: '#286268',
  justifyContent: 'center',
  paddingHorizontal: 16,
  paddingVertical: 16,
};

const disproveButton = Object.assign(JSON.parse(JSON.stringify(approveButton)), { backgroundColor: '#DD4B39' } );

const approveDisproveButtonIcon = {
  marginLeft: 10,
  marginRight: 10
};

const infoCard = {
  alignSelf: 'stretch',
  backgroundColor: '#FFFFFF',
  borderRadius: 10,
  marginBottom: 16,
  marginLeft: 16,
  marginRight: 16,
  overflow: 'hidden',
  shadowColor: 'rgba(0, 0, 0, 0.12)',
  shadowOpacity: 0.8,
  shadowRadius: 2,
  shadowOffset: {
    height: 1,
    width: 2,
  },
};

const prependLight = {
  alignItems: 'center',
  backgroundColor: '#00B36B',
  justifyContent: 'center',
  flex: 1,
  paddingLeft: 16,
  paddingRight: 16,
};

const prependDarker = {
  alignItems: 'center',
  backgroundColor: '#009455',
  justifyContent: 'center',
  flex: 1,
  paddingLeft: 16,
  paddingRight: 16,
};

const prependText = {
  color: '#073942',
  fontSize: 15,
  fontWeight: 'bold',
  textAlign: 'center',
};


const infoCardText = {
  color: '#073942',
  flex: 3,
  fontSize: 15,
  padding: 16,
  textAlign: 'center',
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#073942',
    flex: 1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
});