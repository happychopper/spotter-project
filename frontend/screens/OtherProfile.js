import React, { Component } from 'react';
import { Modal, Text, View, Image, ScrollView, RefreshControl } from 'react-native';

import { API_URL } from 'react-native-dotenv';
import * as Keychain from 'react-native-keychain';
import MDIcon from 'react-native-vector-icons/MaterialIcons';

import { FetchDataAuthJson, PostDataAuthJson } from '../util/FetchData';
import LoadingSpinner from '../components/LoadingSpinner';
import SummaryCard from '../components/SummaryCard';
import StyleSheet from '../util/StyleSheet';
import WorkoutPref from '../components/Profile/WorkoutPref';
import BrightButton from '../components/BrightButton';

export default class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null, // this needs to include the rest of the details themselves later

      refreshing: false,
    };
  }

  componentDidMount = async () => {
    this.fetchUser();
  };

  fetchUser = async (callback) => {
    const otherId = this.props.navigation.getParam('otherId');

    console.log('run fetchUser');

    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();

      FetchDataAuthJson(`${API_URL}/otherUser?_id=${otherId}`, credentials)
        .then((json) => {
          console.log(json);
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

  handleRefresh = () => {
    this.setState({ refreshing: true }, () => {
      this.fetchUser(() => {
        this.setState({ refreshing: false });
      });
    });
  }

  addSpotter = async () => {
    const { user } = this.state;

    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();
      const component = this;

      const data = {
        _id: user._id,
      }

      this.setState({ user: null }, () => {
        PostDataAuthJson(`${API_URL}/otherUser/spotter/add`, credentials, data)
          .then((json) => {
            console.log(json);
            // Get a new suggestion
            component.fetchUser();
          })
          .catch((error) => {
          });
      });
    } catch (error) {
      console.log('Keychain couldn\'t be accessed!', error);
    }
  }

  denySpotter = async () => {
    const { user } = this.state;

    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();
      const component = this;

      const data = {
        _id: user._id,
      }

      this.setState({ user: null }, () => {
        PostDataAuthJson(`${API_URL}/otherUser/spotter/deny`, credentials, data)
          .then((json) => {
            // Get a new suggestion
            component.fetchUser();
          })
          .catch((error) => {
          });
      });
    } catch (error) {
      console.log('Keychain couldn\'t be accessed!', error);
    }
  }

  deleteSpotter = async () => {
    const { user } = this.state;

    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();
      const component = this;

      const data = {
        _id: user._id,
      }

      this.setState({ user: null }, () => {
        PostDataAuthJson(`${API_URL}/otherUser/spotter/delete`, credentials, data)
          .then((json) => {
            // Get a new suggestion
            component.fetchUser();
          })
          .catch((error) => {
          });
      });
    } catch (error) {
      console.log('Keychain couldn\'t be accessed!', error);
    }
  }

  blockUser = async () => {
    const { user } = this.state;

    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();
      const component = this;

      const data = {
        _id: user._id,
      }

      this.setState({ user: null }, () => {
        PostDataAuthJson(`${API_URL}/otherUser/spotter/block`, credentials, data)
          .then((json) => {
            // Get a new suggestion
            component.fetchUser();
          })
          .catch((error) => {
          });
      });
    } catch (error) {
      console.log('Keychain couldn\'t be accessed!', error);
    }
  }

  unblockUser = async () => {
    const { user } = this.state;

    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();
      const component = this;

      const data = {
        _id: user._id,
      }

      this.setState({ user: null }, () => {
        PostDataAuthJson(`${API_URL}/otherUser/spotter/unblock`, credentials, data)
          .then((json) => {
            // Get a new suggestion
            component.fetchUser();
          })
          .catch((error) => {
          });
      });
    } catch (error) {
      console.log('Keychain couldn\'t be accessed!', error);
    }
  }

  render() {
    const { user, refreshing } = this.state;

    return (
      <React.Fragment>
        <View style={StyleSheet.container}>
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
              <View style={StyleSheet.content}>
                <SummaryCard user={user} />
                {
                  user.spotterStatus !== 'blockedByOther' &&
                  <React.Fragment>
                    {
                      user.spotterStatus === 'no' &&
                      <BrightButton
                        name={'add'}
                        onPress={this.addSpotter}
                        style={largeApproveDisproveButton}
                      >
                        ADD SPOTTER
                        </BrightButton>
                    }
                    {
                      user.spotterStatus === 'requested' &&
                      <View style={approveDisproveButtons}>
                        <View style={approveButtonContainer}>
                          <MDIcon.Button
                            name={'check'}
                            onPress={this.addSpotter}
                            {...approveButton}
                          >
                            ACCEPT SPOT
                            </MDIcon.Button>
                        </View>
                        <View style={disproveButtonContainer}>
                          <MDIcon.Button
                            name={'close'}
                            onPress={this.denySpotter}
                            {...disproveButton}
                          >
                            DENY SPOT
                            </MDIcon.Button>
                        </View>
                      </View>
                    }
                    {
                      (user.spotterStatus === 'pending' ||
                        user.spotterStatus === 'yes') &&
                      <BrightButton
                        buttonStyle={{ backgroundColor: '#DD4B39' }}
                        name={'close'}
                        onPress={this.deleteSpotter}
                        style={[largeApproveDisproveButton]}
                      >
                        {user.spotterStatus === 'pending' ? 'CANCEL SPOTTER' : 'DELETE SPOTTER'}
                      </BrightButton>
                    }
                    <BrightButton
                      buttonStyle={{ backgroundColor: '#DD4B39' }}
                      name={'close'}
                      onPress={user.spotterStatus === 'blocked' ? this.unblockUser : this.blockUser}
                      style={[largeApproveDisproveButton]}
                    >
                      {user.spotterStatus === 'blocked' ? 'UNBLOCK USER' : 'BLOCK USER'}
                    </BrightButton>
                  </React.Fragment>
                }
                {/* List of Gyms */}
                <View style={infoCard}>
                  <View style={infoCardTitleContainer}>
                    <Text style={infoCardTitleTwoButton}>
                      Gym List
                    </Text>
                  </View>
                  {
                    (user.gymList != null &&
                      user.gymList.length !== 0) &&
                    user.gymList.map((gym, index) => {
                      return (
                        <Text key={`gym-${index}`} style={infoCardText}>
                          {gym}
                        </Text>
                      );
                    })
                  }
                  {
                    (user.gymList == null ||
                     user.gymList.length === 0) &&
                    <Text style={infoCardText}>
                      Currently no gyms
                    </Text>
                  }
                </View>
                <WorkoutPref
                  otherProfile
                  user={user}
                />
              </View>
            </ScrollView>
          }
        </View>
      </React.Fragment>
    );
  }
}

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

const infoCardTitleContainer = {
  alignSelf: 'stretch',
  backgroundColor: '#00D383',
};

const infoCardTitleTwoButton = {
  color: '#073942',
  flex: 1,
  fontSize: 20,
  fontWeight: 'bold',
  left: 4,
  padding: 16,
  textAlign: 'center'
};

const infoCardText = {
  color: '#073942',
  fontSize: 15,
  left: 4,
  padding: 16,
  textAlign: 'center',
};

const approveDisproveButtons = {
  alignSelf: 'stretch',
  flexDirection: 'row',
  marginBottom: 16,
  marginHorizontal: 16,
}

const largeApproveDisproveButton = {
  marginHorizontal: 16,
  marginBottom: 16,
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

const disproveButton = Object.assign(JSON.parse(JSON.stringify(approveButton)), { backgroundColor: '#DD4B39' });
