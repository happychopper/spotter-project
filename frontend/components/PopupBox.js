import React, { Component } from 'react';
import { Text, View } from 'react-native';

import BrightButton from './BrightButton';

export default class PopupBox extends Component {
  render() {
    const { buttons, message } = this.props;

    return (
      <View style={infoCard}>
        <View style={infoCardTitleContainer}>
          <Text style={infoCardTitleNoOffset}>
            {message}
          </Text>
        </View>
        {
          buttons.map((button, index) => {
            return (
              <BrightButton
                key={`PopupBox-BrightButton-${index}`}
                name={button.iconName}
                onPress={button.onPress}
                style={{ paddingBottom: 16, paddingHorizontal: 16 }}
              >
                {button.message}
              </BrightButton>
            )
          })
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
  flexDirection: 'row',
};

const infoCardTitleNoOffset = {
  color: '#073942',
  flex: 1,
  fontSize: 20,
  fontWeight: 'bold',
  padding: 16,
  textAlign: 'center'
};