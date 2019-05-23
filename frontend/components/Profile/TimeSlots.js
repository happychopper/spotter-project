import React, { Component } from 'react';
import {
  Text, View
} from 'react-native';

import MDIcon from 'react-native-vector-icons/MaterialIcons';

import TimeSlotRow from '../TimeSlotRow';

export default class TimeSlots extends Component {
  render() {
    const { handleTimeSlotAdd, handleDateTimeChange, handleTimeSlotDelete,
            timeSlotEditable, toggleEditable, user } = this.props;

    return (
      <View style={infoCard}>
        <View style={infoCardTitleContainer}>
          {
            timeSlotEditable === true &&
            <MDIcon.Button
              iconStyle={infoCardEditButtonIcon}
              style={infoCardEditButton}
              onPress={handleTimeSlotAdd}
              name='add'
              size={22}
              {...infoCardEditButton}
            />
          }
          <Text style={timeSlotEditable ? infoCardTitleTwoButton : infoCardTitle}>
            Time Slots
            </Text>
          <MDIcon.Button
            iconStyle={infoCardEditButtonIcon}
            style={infoCardEditButton}
            onPress={() => { toggleEditable('timeSlotEditable') }}
            name={timeSlotEditable ? 'done' : 'edit'}
            size={22}
            {...infoCardEditButton}
          />
        </View>
        {
          (user.timeSlots != null &&
           user.timeSlots.length !== 0) &&
          user.timeSlots.map((timeSlot, index) => {
            return (
              <TimeSlotRow
                handleDateTimeChange={handleDateTimeChange}
                handleTimeSlotDelete={handleTimeSlotDelete}
                index={index}
                key={`timeSlot-${index}`}
                timeSlot={timeSlot}
                timeSlotEditable={timeSlotEditable}
              />
            );
          })
        }
        {
          (user.timeSlots == null ||
            user.timeSlots.length === 0) &&
            <Text style={infoCardText}>
            Currently no time slots
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

const infoCardText = {
  alignSelf: 'stretch',
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  color: '#073942',
  fontSize: 15,
  margin: 16,
  textAlign: 'center',
};

const infoCardTitleContainer = {
  alignSelf: 'stretch',
  backgroundColor: '#00D383',
  flexDirection: 'row',
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
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
  borderRadius: 10,
  flex: 1,
  margin: 0,
  paddingLeft: 16,
  paddingRight: 8
};

const infoCardEditButtonIcon = {
  color: '#073942',
  margin: 0
};