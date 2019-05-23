import React, { Component } from 'react';
import { Dimensions, View } from "react-native";
import MDIcon from 'react-native-vector-icons/MaterialIcons';

export default class BrightButton extends Component {
  render() {
    const { buttonStyle, name, onPress, style } = this.props;

    return (
      <View style={[buttonContainer, style]}>
        <MDIcon.Button
          name={name}
          onPress={onPress}
          style={buttonStyle}
          {...buttonStyles}
        >
          {this.props.children}
        </MDIcon.Button>
      </View>
    );
  }
}

let buttonContainer = {
  alignSelf: 'stretch'
};

const buttonStyles = {
  alignItems: 'center',
  alignSelf: 'stretch',
  backgroundColor: '#00D383',
  borderRadius: 10,
  color: '#286268',
  justifyContent: 'center',
  paddingHorizontal: 16,
  paddingVertical: 16,
};
