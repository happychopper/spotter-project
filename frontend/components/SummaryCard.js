import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

export default class SummaryCard extends Component {
  render() {
    const { personal, user } = this.props;
    return (
      <View style={styles.matchingCard}>
        <View style={styles.matchingCardTitleContainer}>
          <Text style={styles.matchingCardTitle}>
            {user.name}
          </Text>
        </View>
        {
          personal == null &&
          <View style={styles.matchingCardTopFeatures}>
            <Text style={styles.matchingCardTopFeaturesInfo}>
              {user.favouriteGym}
            </Text>
            <Text style={styles.matchingCardTopFeaturesHighlight}>
              Favourite Gym
            </Text>
          </View>
        }
        <View style={styles.matchingCardTopFeaturesContainer}>
          <View style={styles.matchingCardTopFeaturesFill}>
            <Text style={styles.matchingCardTopFeaturesInfo}>
              {user.score}
            </Text>
            <Text style={styles.matchingCardTopFeaturesHighlight}>
              Points
            </Text>
          </View>
          <View style={styles.matchingCardTopFeaturesFill}>
            <Text style={styles.matchingCardTopFeaturesInfo}>
              {user.spotters != null ? user.spotters.length : (user.numSpotters != null ? user.numSpotters : 0)}
            </Text>
            <Text style={styles.matchingCardTopFeaturesHighlight}>
              Spotters
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  matchingCard: {
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    margin: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 2,
    },
  },
  matchingCardTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchingCardTitle: {
    color: '#073942',
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
  },
  matchingCardTopFeaturesContainer: {
    alignContent: 'space-around',
    flexDirection: 'row',
  },
  matchingCardTopFeatures: {
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  matchingCardTopFeaturesFill: {
    alignItems: 'center',
    flex: 1,
    marginBottom: 16,
  },
  matchingCardTopFeaturesInfo: {
    color: '#073942',
    fontSize: 20
  },
  matchingCardTopFeaturesHighlight: {
    color: '#00D383',
    fontSize: 16
  }
});