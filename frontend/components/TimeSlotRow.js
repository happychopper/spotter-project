import React, { Component } from 'react';
import { Text, View } from 'react-native';

import DatePicker from 'react-native-navybits-date-time-picker';
import Moment from 'moment';
import Swipeout from 'react-native-swipeout';

export default class TimeSlotRow extends Component {
  /**
   * Converts a JS Date object into a Moment object, then uses Moment's format
   *   to get the desired date output
   */
  getDateStr = (date) => {
    const moment = Moment(date);
    return moment.format("MMM D YYYY");
  }

  /**
   * Converts a JS Date object into a Moment object, then uses Moment's format
   *   to get the desired time output
   */
  getTimeStr = (date) => {
    const moment = Moment(date);
    return moment.format("h:mm a");
  }

  render() {
    const { handleDateTimeChange, handleTimeSlotDelete, index, timeSlot,
            timeSlotEditable } = this.props;

    var swipeoutBtns = [
      {
        text: 'Delete',
        backgroundColor: 'red',
        onPress: () => handleTimeSlotDelete(index)
      }
    ]

    return (
      <Swipeout
        autoClose={true}
        close={!timeSlotEditable}
        disabled={!timeSlotEditable}
        right={swipeoutBtns}
      >
        <View style={infoCardTimeRow}>
          <View style={index % 2 === 0 ? infoCardTimeRowStartEndTextContainerLighter : infoCardTimeRowStartEndTextContainerDarker}>
            <Text style={infoCardTimeRowStartEndText}>
              Start:
            </Text>
          </View>
          <DatePicker
            accentColor={'#FFFFFF'}
            okColor={'#00D383'}
            date={timeSlot.start}
            disabled={!timeSlotEditable}
            mode="time"
            placeholder="Select time"
            okText="Confirm"
            cancelText="Cancel"
            customStyles={datePickerCustom}
            style={datePicker}
            showIcon={false}
            onConfirm={(date) => {
              handleDateTimeChange(date, index, 'start', 'time');
            }}
            minuteInterval={30}
            getDateStr={this.getTimeStr}
          />
          <DatePicker
            accentColor={'#FFFFFF'}
            okColor={'#00D383'}
            date={timeSlot.start}
            disabled={!timeSlotEditable}
            mode="date"
            placeholder="Select date"
            okText="Confirm"
            cancelText="Cancel"
            customStyles={datePickerCustom}
            style={datePicker}
            showIcon={false}
            onConfirm={(date) => {
              handleDateTimeChange(date, index, 'start', 'date');
            }}
            getDateStr={this.getDateStr}
          />
        </View>
        <View style={infoCardTimeRow}>
          <View style={index % 2 === 0 ? infoCardTimeRowStartEndTextContainerLighter : infoCardTimeRowStartEndTextContainerDarker}>
            <Text style={infoCardTimeRowStartEndText}>
              End:
            </Text>
          </View>
          <DatePicker
            accentColor={'#FFFFFF'}
            okColor={'#00D383'}
            date={timeSlot.end}
            disabled={!timeSlotEditable}
            mode="time"
            placeholder="Select time"
            okText="Confirm"
            cancelText="Cancel"
            customStyles={datePickerCustom}
            style={datePicker}
            showIcon={false}
            onConfirm={(date) => {
              handleDateTimeChange(date, index, 'end', 'time');
            }}
            minuteInterval={30}
            getDateStr={this.getTimeStr}
          />
          <DatePicker
            accentColor={'#FFFFFF'}
            okColor={'#00D383'}
            date={timeSlot.end}
            disabled={!timeSlotEditable}
            mode="date"
            placeholder="Select date"
            okText="Confirm"
            cancelText="Cancel"
            customStyles={datePickerCustom}
            style={datePicker}
            showIcon={false}
            onConfirm={(date) => {
              handleDateTimeChange(date, index, 'end', 'date');
            }}
            getDateStr={this.getDateStr}
          />
        </View>
      </Swipeout>
    );
  }
}

const infoCardTimeRow = {
  alignSelf: 'stretch',
  flexDirection: 'row',
};

const infoCardTimeRowStartEndTextContainerLighter = {
  alignItems: 'center',
  backgroundColor: '#00B36B',
  justifyContent: 'center',
  flex: 1,
  paddingLeft: 16,
  paddingRight: 16,
};

const infoCardTimeRowStartEndTextContainerDarker = {
  alignItems: 'center',
  backgroundColor: '#009455',
  justifyContent: 'center',
  flex: 1,
  paddingLeft: 16,
  paddingRight: 16,
};

const infoCardTimeRowStartEndText = {
  color: '#073942',
  fontSize: 15,
  fontWeight: 'bold',
  textAlign: 'center',
};

const datePicker = {
  backgroundColor: '#FFFFFF',
  flex: 2,
  width: 100
};

const datePickerCustom = {
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
  },
  dateText: {
    color: '#073942',
    fontSize: 15,
  },
  disabled: {
    backgroundColor: '#FFFFFF',
  }
};