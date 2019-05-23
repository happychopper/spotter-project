import React, { Component } from 'react';
import { Dimensions, Text, View, TextInput } from 'react-native';

import { CheckBox } from 'react-native-elements';
import ModalDropdown from 'react-native-modal-dropdown';
import MDIcon from 'react-native-vector-icons/MaterialIcons';

export default class WorkoutPref extends Component {
  render() {
    const { detailsEditable, handlePrefSelect, handleTextInput, otherProfile,
            toggleDetailCheckbox, toggleEditable, user } = this.props;

   //console.log(detailsEditable != null && detailsEditable && otherProfile == null);

    return (
      <View style={infoCard}>
        <View style={infoCardTitleContainer}>
          <Text style={otherProfile == null ? infoCardTitle : infoCardTitleTwoButton}>
            Workout Preferences
          </Text>
          {
            otherProfile == null &&
            <MDIcon.Button
              iconStyle={infoCardEditButtonIcon}
              style={infoCardEditButton}
              onPress={() => { toggleEditable('detailsEditable') }}
              name={detailsEditable ? 'done' : 'edit'}
              size={22}
            />
          }
        </View>
        <View style={infoCardRow}>
          <Text style={infoCardPrefTopSubtitle}>
            Exercise Pref.
          </Text>
          <ModalDropdown
            adjustFrame={(frame) => {
              var width = Dimensions.get('window').width - 16 * 2;
              return {
                right: 16,
                height: frame.height - 16,
                width: width/2,
                top: frame.top + 16
              }
            }}
            options={[
              'Cardio', 'Weightlifting', 'Strength Training',
              'Core Workouts'
            ]}
            disabled={!detailsEditable}
            defaultValue={user.exercisePref == null ? 'N/A' : user.exercisePref}
            dropdownStyle={selectionDropdown}
            dropdownTextStyle={selectionDropdownText}
            dropdownTextHighlightStyle={selectionDropdownTextHighlight}
            onSelect={handlePrefSelect}
            showsVerticalScrollIndicator={true}
            style={selection}
            textStyle={selectionText}
            width={200}
          
          >
            <View style={{ flexDirection: 'row' }}>
              <Text style={[selectionText, { flex: 10}]}>
                { console.log(user.exercisePref) }
                {user.exercisePref == '' ? 'N/A' : user.exercisePref}
              </Text>
              <MDIcon
                iconStyle={[infoCardEditButtonIcon]}
                name='arrow-drop-down'
                size={22}
                style={{ flex: 2, opacity: detailsEditable ? 100 : 0 }}
              />
            </View>
          </ModalDropdown>
        </View>
        <View style={infoCardRow}>
          <View style={infoCardPref}>
            <TextInput
              style={infoCardPrefTextInput}
              editable={detailsEditable != null && detailsEditable && otherProfile == null}
              placeholder={'0'}
              onChangeText={(text) => {
                if (otherProfile == null) {
                  handleTextInput(text, 'avgTime');
                }
              }}
              keyboardType='numeric'
              value={String(user.avgTime)}
              maxLength={3}
            />
            <Text style={infoCardPrefSubtitle}>
              Avg Time
            </Text>
            <Text style={infoCardPrefSubtitle}>
              (mins)
            </Text>
          </View>
          <View style={infoCardPref}>
            <TextInput
              style={infoCardPrefTextInput}
              editable={detailsEditable != null && detailsEditable && otherProfile == null}
              placeholder={'0'}
              onChangeText={(text) => {
                if (otherProfile == null) {
                  handleTextInput(text, 'deadlift');
                }
              }}
              keyboardType='numeric'
              value={String(user.deadlift)}
              maxLength={3}
            />
            <Text style={infoCardPrefSubtitle}>
              Deadlift
            </Text>
            <Text style={infoCardPrefSubtitle}>
              (kg)
            </Text>
          </View>
          <View style={infoCardPref}>
            <TextInput
              style={infoCardPrefTextInput}
              editable={detailsEditable != null && detailsEditable && otherProfile == null}
              placeholder={'0'}
              onChangeText={(text) => {
                if (otherProfile == null) {
                  handleTextInput(text, 'benchpress');
                }
              }}
              keyboardType='numeric'
              value={String(user.benchpress)}
              maxLength={3}
            />
            <Text style={infoCardPrefSubtitle}>
              Benchpress
            </Text>
            <Text style={infoCardPrefSubtitle}>
              (kg)
            </Text>
          </View>
        </View>
        <View style={infoCardRow}>
          <View style={infoCardPref}>
            <TextInput
              editable={detailsEditable != null && detailsEditable && otherProfile == null}
              placeholder={'0'}
              style={infoCardPrefTextInput}
              onChangeText={(text) => handleTextInput(text, 'squat')}
              keyboardType='numeric'
              value={String(user.squat)}
              maxLength={3}
            />
            <Text style={infoCardPrefSubtitle}>
              Squat
            </Text>
            <Text style={infoCardPrefSubtitle}>
              (kg)
            </Text>
          </View>
          <View style={infoCardPref}>
            <CheckBox
              center
              checked={user.warmUp}
              checkedColor='#00D383'
              checkedIcon='check-box'
              uncheckedIcon='check-box-outline-blank'
              containerStyle={infoCardPrefCheckbox}
              iconType='material'
              onPress={() => {
                if (otherProfile == null) {
                  toggleDetailCheckbox('warmUp');
                }
              }}
              size={26}
            />
            <Text style={infoCardPrefSubtitle}>
              Warm Up
            </Text>
          </View>
          <View style={infoCardPref}>
            <CheckBox
              center
              checked={user.coolDown}
              checkedColor='#00D383'
              checkedIcon='check-box'
              uncheckedIcon='check-box-outline-blank'
              containerStyle={infoCardPrefCheckbox}
              iconType='material'
              onPress={() => {
                if (otherProfile == null) {
                  toggleDetailCheckbox('coolDown');
                }
              }}
              size={26}
            />
            <Text style={infoCardPrefSubtitle}>
              Cool Down
            </Text>
          </View>
        </View>
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

const infoCardPrefTextInput = {
  alignSelf: 'stretch',
  color: '#073942',
  flex: 1,
  fontSize: 15,
  margin: 0,
  padding: 0, 
  textAlign: 'center',
  // width: 110,
}

const infoCardPrefSubtitle = {
  alignSelf: 'stretch',
  color: '#073942',
  fontSize: 15,
  textAlign: 'center',
  // width: 110,
}

const infoCardPrefTopSubtitle = {
  alignSelf: 'stretch',
  color: '#073942',
  flex: 1,
  fontSize: 15,
  margin: 16,
  textAlign: 'center',
}

const infoCardRow = {
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  flexDirection: 'row',
  flex: 1,
}

const selection = {
  alignSelf: 'stretch',
  backgroundColor: '#FFFFFF',
  borderRadius: 10,
  flex: 1,
  margin: 16,
};

const selectionText = {
  color: '#073942',
  fontSize: 15,
  textAlign: 'center'
};

const selectionDropdown = {
  borderRadius: 10,
  overflow: 'hidden',
};

const selectionDropdownText = {
  color: '#073942',
  fontSize: 15,
  paddingHorizontal: 24,
  paddingVertical: 16,
  textAlign: 'center',
};

const selectionDropdownTextHighlight = {
  color: '#00D383',
  fontSize: 15,
  textAlign: 'center'
};

const infoCardPref = {
  flex: 1,
  flexDirection: 'column',
  marginBottom: 16,
};

const infoCardPrefCheckbox = {
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  borderWidth: 0,
  flexDirection: 'column',
  justifyContent: 'center',
  marginBottom: 2.5,
  marginLeft: 'auto',
  marginRight: 'auto',
  marginTop: 0,
  padding: 0,
}