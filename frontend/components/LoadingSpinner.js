import React, { Component } from 'react';
import * as Progress from 'react-native-progress';
import { Platform, View } from 'react-native';
import { UIActivityIndicator } from 'react-native-indicators';

export default class LoadingSpinner extends Component {
  render() {
    return (
      <React.Fragment>
        {
          Platform.OS === 'android' &&
          <View style={contentAndroid}>
            <View
              style={{
                alignItems: 'center',
                borderRadius: 25,
                backgroundColor: '#FFFFFF',
                height: 40,
                justifyContent: 'center',
                width: 40
              }}
            >
              <Progress.CircleSnail
                color='#00D383'
                duration={800}
                spinDuration={1600}
                strokeCap={'square'}
                thickness={2.5}
                size={24}
              />
            </View>
          </View>
        }
        {
          Platform.OS === 'ios' &&
          <View style={content}>
            <UIActivityIndicator
              color='#00D383'
              size={28}
              style={{ justifyContent: 'flex-start' }}
            />
          </View>
        }
      </React.Fragment>
    );
  }
}

const contentAndroid = {
  alignItems: 'center',
  marginTop: 24,
};

const content = {
  alignItems: 'center',
  marginTop: 16,
};