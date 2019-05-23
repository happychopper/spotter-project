import React, { Component } from 'react';
import { Text, View } from 'react-native';

import Moment from 'moment';
import MDIcon from 'react-native-vector-icons/MaterialIcons';
import Swipeout from 'react-native-swipeout';

export default class Test extends Component {
  render() {
    const { handlePendingDelete, goToMatch, pendingEditable, navigation,
            toggleEditable, user } = this.props;
    
    var noneInitiated = 0;

    return (
      <View style={infoCard}>
        <View style={infoCardTitleContainer}>
          { 
            pendingEditable === true &&
            <MDIcon.Button
              iconStyle={infoCardEditButtonIcon}
              style={infoCardEditButton}
              onPress={goToMatch}
              name='add'
              size={22}
            />
          }
          <Text style={pendingEditable ? infoCardTitleTwoButton : infoCardTitle}>
            Pending Spots
          </Text>
          <MDIcon.Button
            iconStyle={infoCardEditButtonIcon}
            style={infoCardEditButton}
            onPress={() => { toggleEditable('pendingEditable') }}
            name={pendingEditable ? 'done' : 'edit'}
            size={22}
          />
        </View>
        {
          (user.pending != null &&
           user.pending.length !== 0) &&
          user.pending.map((pending, index) => {
            if (user.pending[index].initiator === true) {
              //var noneInitiated = false;
              var startTime = Moment(pending.timeSlot.start).format("h:mm a, D MMM");
              var endTime = Moment(pending.timeSlot.end).format("h:mm a, D MMM");

              var swipeoutBtns = [
                {
                  text: 'Delete',
                  backgroundColor: 'red',
                  onPress: () => handlePendingDelete(index, pending.id)
                }
              ]
              return (
                <Swipeout
                  autoClose={true}
                  disabled={!pendingEditable}
                  key={`swipeout-${index}`}
                  right={swipeoutBtns}
                  close={!pendingEditable}
                  backgroundColor={'white'}
                >
                  <Text
                    onPress={() => {
                      if (!pendingEditable) {
                        navigation.navigate('OtherProfileHome', { otherId: pending._id, name: pending.name });
                      }
                    }}
                    style={infoCardText}
                  >
                    {pending.name} at {pending.gym}{'\n'}
                    {startTime} - {endTime}
                  </Text>
                </Swipeout>
              );
            } else {
              noneInitiated = noneInitiated + 1;
            }

            if (noneInitiated == user.pending.length) {
              return (
                <Text style={infoCardText}>
                  Currently no pending spots
                </Text>
              );
            }
          })
        }
        {
          (user.pending != null &&
           user.pending.length === 0) &&
          <Text style={infoCardText}>
            Currently no pending spots
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
