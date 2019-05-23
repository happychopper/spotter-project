import React, { Component } from 'react';
import { Text, View } from 'react-native';

export default class Test extends Component {
  render() {
    const { navigation, user } = this.props;

    return (
      <View style={infoCard}>
        <View style={infoCardTitleContainer}>
          <Text style={infoCardTitleTwoButton}>
            Blocked Spots
          </Text>
        </View>
        {
          (user.blocked != null &&
           user.blocked.length !== 0) &&
          user.blocked.map((blocked) => {
            return (
              <Text
                onPress={() => {
                  navigation.navigate('OtherProfile', { otherId: blocked._id, name: blocked.name });
                }}
                style={infoCardText}
              >
                {blocked.name}
              </Text>
            );
          })
        }
        {
          (user.blocked != null &&
           user.blocked.length === 0) &&
          <Text style={infoCardText}>
            Currently no blocked spots
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
  padding: 16,
  textAlign: 'center',
};
