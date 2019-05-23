import React, { Component } from 'react';
import { Dimensions, Text, View } from 'react-native';

import MDIcon from 'react-native-vector-icons/MaterialIcons';
import ModalDropdown from 'react-native-modal-dropdown';

export default class SexPref extends Component {
  render() {
    const { handleGenderSelect, handleSexPrefSelect, sexEditable, toggleEditable,
            user } = this.props;

    return (
      <View style={infoCard}>
        <View style={infoCardTitleContainer}>
          <Text style={infoCardTitle}>
            Sex Preferences
          </Text>
          <MDIcon.Button
            iconStyle={infoCardEditButtonIcon}
            style={infoCardEditButton}
            onPress={() => { toggleEditable('sexEditable') }}
            name={sexEditable ? 'done' : 'edit'}
            size={22}
            {...infoCardEditButton}
          />
        </View>
        <View style={infoCardRow}>
          <Text style={infoCardPrefTopSubtitle}>
            Gender
            </Text>
          <ModalDropdown
            adjustFrame={(frame) => {
              var width = Dimensions.get('window').width - 16 * 2;
              return {
                right: 16,
                height: frame.height - 16,
                width: width / 2,
                top: frame.top + 16
              }
            }}
            options={['Male', 'Female', 'Other']}
            disabled={!sexEditable}
            defaultValue={user.gender}
            dropdownStyle={selectionDropdown}
            dropdownTextStyle={selectionDropdownText}
            dropdownTextHighlightStyle={selectionDropdownTextHighlight}
            onSelect={handleGenderSelect}
            showsVerticalScrollIndicator={true}
            style={selection}
            textStyle={selectionText}
          >
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 2 }}></View>
              <Text style={[selectionDropdownText, { flex: 10}]}>
                {user.gender}
              </Text>
              <MDIcon
                iconStyle={infoCardEditButtonIcon}
                name='arrow-drop-down'
                size={22}
                style={{ flex: 2, opacity: sexEditable ? 100 : 0 }}
              />
            </View>
          </ModalDropdown>
        </View>
        <View style={infoCardRow}>
          <Text style={infoCardPrefTopSubtitle}>
            Match Preference
          </Text>
          <ModalDropdown
            adjustFrame={(frame) => {
              var width = Dimensions.get('window').width - 16 * 2;
              return {
                right: 16,
                height: frame.height - 16,
                width: width / 2,
                top: frame.top + 16
              }
            }}
            options={['Same', 'Any']}
            disabled={!sexEditable}
            defaultValue={user.sexPref}
            dropdownStyle={selectionDropdown}
            dropdownTextStyle={selectionDropdownText}
            dropdownTextHighlightStyle={selectionDropdownTextHighlight}
            onSelect={handleSexPrefSelect}
            showsVerticalScrollIndicator={true}
            style={selection}
            textStyle={selectionText}
          >
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 2 }}></View>
              <Text style={[selectionDropdownText, { flex: 10 }]}>
                {user.sexPref}
              </Text>
              <MDIcon
                iconStyle={infoCardEditButtonIcon}
                name='arrow-drop-down'
                size={22}
                style={{ flex: 2, opacity: sexEditable ? 100 : 0 }}
              />
            </View>
          </ModalDropdown>
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

const selection = {
  alignSelf: 'stretch',
  backgroundColor: '#FFFFFF',
  flex: 1,
  margin: 16,
};

const selectionText = {
  color: '#073942',
  fontSize: 16,
  textAlign: 'center'
};

const selectionDropdown = {
  backgroundColor: '#FFFFFF',
  borderRadius: 10,
  overflow: 'hidden',
};

const selectionDropdownText = {
  color: '#073942',
  fontSize: 16,
  // padding: 16,
  textAlign: 'center',
};

const selectionDropdownTextHighlight = {
  color: '#00D383',
  fontSize: 16,
  textAlign: 'center'
};

const infoCardRow = {
  alignItems: 'flex-start',
  alignSelf: 'stretch',
  flexDirection: 'row',
  flex: 1,
};

const infoCardPrefTopSubtitle = {
  alignSelf: 'stretch',
  color: '#073942',
  flex: 1,
  fontSize: 15,
  margin: 16,
  textAlign: 'center',
};