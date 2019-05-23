import React, { Component } from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Platform,
  Text,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default class LoginButton extends Component {
  render() {
    const { login, name } = this.props;

    return (
      <Icon.Button
        name={name}
        onPress={() => login(name)}
        {...buttonStyles}
      >
        {this.props.children}
      </Icon.Button>
    );
  }
}

const buttonStyles = {
  backgroundColor: '#009455',
  borderRadius: 10,
  paddingHorizontal: 16,
  paddingVertical: 16
};
