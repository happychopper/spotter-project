import React, { Component } from 'react';
import { Text, View } from 'react-native';

import Moment from 'moment';
import MDIcon from 'react-native-vector-icons/MaterialIcons';
import Swipeout from 'react-native-swipeout';

import BrightButton from '../BrightButton';

export default class Test extends Component {
  render() {
    const { handleCheckin, handleMatchDelete, goToMatch, matchesEditable,
            navigation, toggleEditable, user } = this.props;

    return (
      <View style={infoCard}>
        <View style={infoCardTitleContainer}>
          { 
            matchesEditable === true &&
            <MDIcon.Button
              iconStyle={infoCardEditButtonIcon}
              style={infoCardEditButton}
              onPress={goToMatch}
              name='add'
              size={22}
            />
          }
          <Text style={matchesEditable ? infoCardTitleTwoButton : infoCardTitle}>
            Spots
          </Text>
          <MDIcon.Button
            iconStyle={infoCardEditButtonIcon}
            style={infoCardEditButton}
            onPress={() => { toggleEditable('matchesEditable') }}
            name={matchesEditable ? 'done' : 'edit'}
            size={22}
          />
        </View>
        {
          (user.accepted != null &&
           user.accepted.length !== 0) &&
          user.accepted.map((accepted, index) => {
            var startTime = Moment(accepted.timeSlot.start).format("h:mm a, D MMM");
            var endTime = Moment(accepted.timeSlot.end).format("h:mm a, D MMM");

            var swipeoutBtns = [
              {
                text: 'Delete',
                backgroundColor: 'red',
                onPress: () => handleMatchDelete(index, accepted.id)
              }
            ]
            return (
              <Swipeout
                autoClose={true}
                disabled={!matchesEditable}
                key={`swipeout-${index}`}
                right={swipeoutBtns}
                close={!matchesEditable}
                backgroundColor={'white'}
              >
                <Text
                  onPress={() => {
                    if (!matchesEditable) {
                      navigation.navigate('OtherProfileHome', { otherId: accepted._id, name: accepted.name });
                    }
                  }}
                  style={infoCardText}
                >
                  {Moment().isAfter(accepted.timeSlot.end) ? 'Previously matched with \n': ''}
                  {accepted.name} at {accepted.gym}{'\n'}
                  {`${startTime} - ${endTime}`}
                </Text>
                {
                  Moment().isAfter(Moment(accepted.timeSlot.start).subtract(5, 'minutes')) &&
                  Moment().isBefore(accepted.timeSlot.end) &&
                  (accepted.checkedIn == null || accepted.checkedIn === false) &&
                  <BrightButton
                    name={'check'}
                    onPress={() => handleCheckin(accepted._id, accepted.gym, accepted.timeSlot)}
                    style={{ marginBottom: 16, marginHorizontal: 16 }}
                  >
                    CHECK IN
                  </BrightButton>
                }
                {
                  Moment().isAfter(Moment(accepted.timeSlot.start).subtract(5, 'minutes')) &&
                  Moment().isBefore(accepted.timeSlot.end) &&
                  accepted.checkedIn != null && accepted.checkedIn === true &&
                  <BrightButton
                    buttonStyle={{ backgroundColor: '#efefef' }}
                    name={'check'}
                    style={{ marginBottom: 16, marginHorizontal: 16 }}
                  >
                    CHECKED IN
                  </BrightButton>
                }
              </Swipeout>
            );
          })
        }
        {
          (user.accepted != null &&
           user.accepted.length === 0) &&
          <Text style={infoCardText}>
            Currently no spots
          </Text>
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
  flexDirection: 'row',
};

const infoCardTitle = {
  color: '#073942',
  flex: 1,
  fontSize: 20,
  fontWeight: 'bold',
  left: 32,
  padding: 16,
  textAlign: 'center'
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


const infoCardEditButton = {
  backgroundColor: '#00D383',
  flex: 1,
  margin: 0,
  paddingLeft: 16,
  paddingRight: 8
};

const infoCardEditButtonIcon = {
  color: '#073942',
  margin: 0
};

const infoCardText = {
  color: '#073942',
  fontSize: 15,
  padding: 16,
  textAlign: 'center',
};
