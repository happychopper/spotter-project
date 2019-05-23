import React from 'react';
import { View, Text } from 'react-native';
import {
  createBottomTabNavigator,
  createStackNavigator,
  createSwitchNavigator
} from 'react-navigation';

import MDIcon from 'react-native-vector-icons/MaterialIcons';

import Home from './screens/Home';
import Leaderboard from './screens/Leaderboard';
import Login from './screens/Login';
import Match from './screens/Match';
import OtherProfile from './screens/OtherProfile';
import Profile from './screens/Profile';
import Gym from './screens/Gym';
import Checkin from './screens/Checkin';

const RootStack = createSwitchNavigator({
  Login: {
    screen: Login,
    path: 'login',
  },
  Main: {
    screen: createBottomTabNavigator({
      HomeTab: {
        screen: createStackNavigator({
          Home: {
            screen: Home,
            path: 'home',
          },
          OtherProfileHome: {
            screen: OtherProfile,
            path: 'otherProfileHome',
          }
        },
        {
          initialRouteName: 'Home',
          navigationOptions: ({ navigation }) => {
            var title = navigation.state.routeName;

            if (title === 'OtherProfileHome') {
              title = navigation.state.params.name;
            }

            return {
              headerTitleStyle: headerTitleStyle,
              title: title
            }
          },
        }),
        path: 'homeTab'
      },
      MatchTab: {
        screen: createStackNavigator({
          Match: {
            screen: Match,
            path: 'match',
          }
        },
        {
          initialRouteName: 'Match',
          navigationOptions: ({ navigation }) => {
            return {
              headerTitleStyle: headerTitleStyle,
              title: `${navigation.state.routeName}`
            }
          },
        }),
        path: 'matchTab'
      },
      LeaderboardTab: {
        screen: createStackNavigator({
          Leaderboard: {
            screen: Leaderboard,
            path: 'leaderboard',
            navigationOptions: ({ navigation }) => {
              return {
                headerTitleStyle: headerTitleStyle,
                title: `${navigation.state.routeName}`
              }
            }
          }
        }),
        path: 'leaderboardTab'
      },
      ProfileTab: {
        screen: createStackNavigator({
          Profile: {
            screen: Profile,
            path: 'profile',
          },
          OtherProfile: {
            screen: OtherProfile,
            path: 'otherProfile',
          }
        },
        {
          initialRouteName: 'Profile',
          navigationOptions: ({ navigation }) => {
            var title = navigation.state.routeName;

            console.log(title);

            if (title === 'OtherProfile') {
              title = navigation.state.params.name;
            } else if (title === 'Profile') {
              title = 'My Profile';
            }

            return {
              headerTitleStyle: headerTitleStyle,
              title: title
            }
          },
        }),
        path: 'profileTab'
      }
    },
    {
      initialRouteName: 'HomeTab',
      navigationOptions: ({ navigation }) => ({
        tabBarIcon: ({ focused, tintColor }) => {
          const { routeName } = navigation.state;
          let iconName;
          if (routeName === 'HomeTab') {
            iconName = 'home';
          } else if (routeName === 'MatchTab') {
            iconName = 'person-add';
          } else if (routeName === 'ProfileTab') {
            iconName = 'account-circle';
          } else if (routeName === 'LeaderboardTab') {
            iconName = 'format-list-numbered';
          }

          return <MDIcon name={iconName} size={24} color={tintColor} />;
        },
      }),
      tabBarOptions: {
        activeTintColor: '#00D383',
        inactiveTintColor: 'gray',
        showLabel: false,
      },
    }),
    path: 'main'
  }
},
{
  initialRouteName: 'Main',
});

const headerTitleStyle = {
  color: '#073942',
  fontSize: 18,
  fontWeight: 'bold',
}

export default class App extends React.Component {
  render() {
    return <RootStack />;
  }
}
