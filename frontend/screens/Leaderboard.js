import React, { Component } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { API_URL } from 'react-native-dotenv';
import * as Keychain from 'react-native-keychain';
import MDIcon from 'react-native-vector-icons/MaterialIcons';
import ModalDropdown from 'react-native-modal-dropdown';

import { FetchDataAuthJson } from '../util/FetchData';
import PopupBox from '../components/PopupBox';
import LoadingSpinner from '../components/LoadingSpinner';

export default class Match extends Component {
  state = {
    gym: null,
    gymList: null,
    scores: null,

    scoresLoaded: false,
    refreshing: false
  };

  componentDidMount = async () => {
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
      
      this.fetchLeaderboard();
    } catch (error) {
      console.log('Keychain couldn\'t be accessed!', error);
    }
  };

  fetchLeaderboard = (gym, callback) => { 
    this.setState({
      gym: null,
      gymList: null,
      scores: null,

      scoresLoaded: false,
    }, async () => {
      try {
        // Retrieve the credentials
        const credentials = await Keychain.getGenericPassword();

        // Now fetch the new suggested match
        FetchDataAuthJson(`${API_URL}/scoreboard${gym != null ? `?gym=${gym}` : ''}`, credentials)
          .then((json) => {
            console.log(json);
            this.setState({
              gym: json.data.gym,
              gymList: json.data.gymList,
              scores: json.data.scores,

              scoresLoaded: true,         
            }, () => {
              if (callback != null) {
                callback();
              }
            })
          })
          .catch(() => {
            });
      } catch (error) {
        console.log('Keychain couldn\'t be accessed!', error);
      }
    });
  }

  handleGymSelect = (index, option) => {
    const { gym } = this.state;

    if (gym !== option) {
      this.fetchLeaderboard(option);
    }
  }

  handleRefresh = () => {
    this.setState({ refreshing: true }, () => {
      this.fetchLeaderboard(null, () => {
        this.setState({ refreshing: false });
      });
    });
  }

  render() {
    const { gym, gymList, refreshing, scores, scoresLoaded } = this.state;

    const popUpBoxButtons = [
      {
        iconName: 'refresh',
        message: 'REFRESH',
        onPress: this.fetchLeaderboard
      }
    ]

    return (
      <View style={styles.container}>
        {
          (scoresLoaded == false) &&
          <LoadingSpinner />
        }
        {
          (scoresLoaded == true) &&
          <View style={styles.content}>
            {
              (gymList == null || scores == null) &&
              <PopupBox
                buttons={popUpBoxButtons}
                message={'You don\'t have any relevant scoreboards'}
              />
            }
            {
              gymList != null && scores != null &&
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

                <View style={infoCard}>
                  <View style={infoCardTitleContainer}>
                    <ModalDropdown
                      adjustFrame={(frame) => {
                        var width = Dimensions.get('window').width - 16 * 2;
                        return {
                          left: 16,
                          height: frame.height - 16,
                          width: width,
                          top: frame.top + 16
                        }
                      }}
                      options={gymList}
                      defaultValue={gym}
                      dropdownStyle={selectionDropdown}
                      dropdownTextStyle={selectionDropdownText}
                      dropdownTextHighlightStyle={selectionDropdownTextHighlight}
                      onSelect={this.handleGymSelect}
                      showsVerticalScrollIndicator={true}
                      style={selection}
                      textStyle={selectionText}
                      ref={(component) => this.favouriteGymModal = component}
                    >
                      <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}></View>
                        <Text style={[selectionText, { flex: 10}]}>
                          {gym}
                        </Text>
                        <MDIcon
                          iconStyle={{ color: '#073942' }}
                          name='arrow-drop-down'
                          size={22}
                          style={{ flex: 1 }}
                        />
                      </View>
                    </ModalDropdown>
                  </View>
                  {
                    scores.map((item, index) => {
                      return (
                        <View key={`${item.name} - ${index}`} style={{ flexDirection: 'row' }}>
                          <View style={[posNumber, index % 2 === 0 ? posNumberLight : posNumberDark]}>
                            <Text style={infoCardText}>
                              # {index + 1}
                            </Text>
                          </View>
                          <View style={name}>
                            <Text style={infoCardText}>
                              {item.name}{'  '}
                              {
                                item.isMe === true || item.friend === true ? 
                                  <MDIcon name={ item.isMe === true ? 'person' : 'fitness-center' } /> :
                                  null
                              }
                            </Text>
                          </View>
                          <View style={scoreNum}>
                            <Text style={infoCardText}>
                              {item.score}{'\n'}{ item.score === 1 ? 'pt' : 'pts'}
                            </Text>
                          </View>
                        </View>
                      )
                    })
                  }
                </View>
              </ScrollView>
            }
          </View>
        }
      </View>
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
  marginTop: 16,
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

const infoCardText = {
  color: '#073942',
  fontSize: 15,
  padding: 16,
  textAlign: 'center',
};

const posNumber = {
  alignItems: 'center',
  flex: 2,
  justifyContent: 'center',
}

const posNumberLight = {
  backgroundColor: '#00B36B',
};

const posNumberDark = {
  backgroundColor: '#009455',
};

const name = {
  alignItems: 'center',
  flex: 8,
  justifyContent: 'center',
}

const scoreNum = {
  alignItems: 'center',
  flex: 2,
  justifyContent: 'center',
}

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

const selection = {
  alignSelf: 'stretch',
  flex: 1,
  margin: 16,
};

const selectionText = {
  color: '#073942',
  fontSize: 20,
  fontWeight: 'bold',
  textAlign: 'center',
};

const selectionDropdown = {
  backgroundColor: '#FFFFFF',
  borderRadius: 10,
  overflow: 'hidden',
};

const selectionDropdownText = {
  color: '#073942',
  fontSize: 16,
  padding: 16,
  textAlign: 'center',
};

const selectionDropdownTextHighlight = {
  color: '#00D383',
  fontSize: 16,
  textAlign: 'center'
};