import React, { Component } from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Platform,
  Text,
  View,
} from 'react-native';
import SafariView from 'react-native-safari-view';

import {
  CustomTabs,
  ANIMATIONS_SLIDE,
  ANIMATIONS_FADE
} from 'react-native-custom-tabs';

import { API_URL } from 'react-native-dotenv';
import * as Keychain from 'react-native-keychain';
import SplashScreen from 'react-native-splash-screen';

import { FetchDataAuthJson } from '../util/FetchData';
import LoginButton from '../components/LoginButton';
import Logo from '../assets/Logo.png';

export default class App extends Component {
  state = {
    authType: null,
  };

  // Set up Linking
  async componentDidMount() {
    SplashScreen.hide();
 
    Linking.getInitialURL()
      .then((url) => {
        this.handleOpenURL({ url });
      })
      .catch((err) => {
        console.warn('Deeplinking error', err)
      })

    Linking.addEventListener('url', e => {
      this.handleOpenURL({ url: e.url });
    })
  };

  componentWillUnmount() {
    // Remove event listener
    Linking.removeEventListener('url', this.handleOpenURL);
  };

  handleOpenURL = async ({ url }) => {
    console.log(url);
    
    // Extract JWT from the URL
    var [, jwt] = url.match(/jwt=(.+)/);
    if (jwt != null) {
      jwt = jwt.replace(/#$/, ''); // For some dumb reason, the JWT received on Android
                                   //   has a # (hash) symbol at the end that breaks
                                   //   it, so /kill it

      console.log(jwt);

      // Need to check here to see if the token actually works, as on Android, the
      //   deep linking URL doesn't seem to clear out, so it keeps trying to use
      //   the same JWT and infinite loops (f*cking Android)
      FetchDataAuthJson(`${API_URL}/user`, { password: jwt })
        .then(async (json) => {
          console.log(json);
          if (json.success !== false) {
            // Store the credentials
            await Keychain.setGenericPassword('jwt', jwt);

            if (Platform.OS === 'ios') {
              SafariView.dismiss();
            }

            // Navigate to Home
            this.props.navigation.navigate('Home');
          }
        });
    }
  };

  // Handle login
  login = (type) => {
    if (type === 'google') {
      this.setState({ authType: type }, this.openURL(`${API_URL}/auth/google`));
    }
  };

  // Open URL in a browser
  openURL = (url) => {
    if (Platform.OS === 'ios') {  // Use SafariView on iOS
      SafariView.show({
        url: url,
        fromBottom: true,
      });
    } else {                      // Or CustomTabs on Android
      CustomTabs.openURL(url, {
        toolbarColor: '#073942',
        enableUrlBarHiding: true,
        showPageTitle: true,
        enableDefaultShare: true,
        // Specify full animation resource identifier(package:anim/name)
        // or only resource name(in case of animation bundled with app).
        animations: {
          startEnter: 'slide_in_bottom',
          startExit: 'slide_out_bottom',
          endEnter: 'slide_in_bottom',
          endExit: 'slide_out_bottom',
        },
        // And supports SLIDE and FADE as default animation.
        // animations: ANIMATIONS_SLIDE or ANIMATIONS_FADE.
        // headers: {
        //   'my-custom-header': 'my custom header value'
        // },
        forceCloseOnRedirection: true,
      }).then((launched) => {
        console.log(`Launched custom tabs: ${launched}`);
      }).catch((err) => {
        console.error(err);
      });
    }
  };

  render() {
    return (
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.content}>
          <Image source={Logo} style={styles.logo}/>
          <Text style={styles.header}>
            SPOTTER
          </Text>
        </View>
        {/* Login buttons */}
        <View style={styles.buttons}>
          <LoginButton login={this.login} name={'google'}>
            Login with Google
          </LoginButton>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#073942',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    height: 100,
    width: 100,
  },
  header: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  logo: {
    height: 160,
    width: 160
  },
  text: {
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
  },
  buttons: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: 20,
    marginBottom: 30,
  },
});
