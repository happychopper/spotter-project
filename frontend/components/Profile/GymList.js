import React, { Component } from 'react';
import {
  ActivityIndicator, Text, TouchableOpacity, View
} from 'react-native';

import Autocomplete from 'react-native-autocomplete-input';
import MDIcon from 'react-native-vector-icons/MaterialIcons';
import Swipeout from 'react-native-swipeout';

export default class GymList extends Component {
  render() {
    const { fetchGymSuggestions, gymListEditable, handleFavouriteGym,
            handleGymAdd, handleGymDelete, loadedSuggestedGyms, queryText,
            suggestedGyms, toggleEditable, user } = this.props;

    return (
      <View style={infoCardNoOverflowHidden}>
        <View style={infoCardTitleContainer}>
          <Text style={infoCardTitle}>
            Gyms
          </Text>
          <MDIcon.Button
            iconStyle={infoCardEditButtonIcon}
            style={infoCardEditButton}
            onPress={() => { toggleEditable('gymListEditable') }}
            name={gymListEditable ? 'done' : 'edit'}
            size={22}
            {...infoCardEditButton}
          />
        </View>
        {
          gymListEditable === true &&
          <Autocomplete
            containerStyle={autocompleteContainer}
            data={suggestedGyms}
            defaultValue={queryText}
            listStyle={autocompleteList}
            inputContainerStyle={{ borderWidth: 0 }}
            onChangeText={fetchGymSuggestions}
            renderItem={(item) => {
              return (
                <TouchableOpacity
                  onPress={() => handleGymAdd(item)}
                >
                  <Text style={infoCardText}>
                    {item.isNew ? `Use '${item.item.title}'` : item.item.title}{' '}
                    {item.isNew ? null : <MDIcon color="#00D383" name='add' />}
                  </Text>
                </TouchableOpacity>
              )
            }}
            style={[infoCardTextInputWide, (queryText === '' || (queryText !== '' && loadedSuggestedGyms === false) ? { borderBottomLeftRadius: 10, borderBottomRightRadius: 10,} : null)]}
          />
        }
        {
          queryText !== '' &&
          loadedSuggestedGyms === false &&
          <ActivityIndicator color='#00D383' style={{ marginBottom: 16 }}/>
        }
        {
          (user.gymList != null &&
           user.gymList.length !== 0) &&
          user.gymList.map((gym, index) => {
            var swipeoutBtns = [
              {
                text: 'Delete',
                backgroundColor: 'red',
                onPress: () => handleGymDelete(gym, index)
              }
            ]
            return (
              <Swipeout
                autoClose={true}
                disabled={!gymListEditable}
                key={`swipeout-${index}`}
                right={swipeoutBtns}
                close={!gymListEditable}
                backgroundColor={'white'}
                style={[
                  (index === user.gymList.length - 1 ? gymSwipeoutLast : null),
                  (index === 0 && gymListEditable ? gymSwipeoutFirst : null),
                ]}
              >
                <View style={infoCardGym}>
                  <View style={favouriteButtonContainer}>
                    <MDIcon.Button
                      name={user.favouriteGym == gym ? 'star' : 'star-border'}
                      iconStyle={{
                        color: '#073942',
                        opacity: !gymListEditable && user.favouriteGym != gym ? 0 : 100,
                      }}
                      onPress={() => {handleFavouriteGym(gym)}}
                      style={favouriteButton}
                    />
                  </View>
                  <Text style={[infoCardText, gymText]}>
                    {gym}
                  </Text>
                  <View style={favouriteButtonBalance}></View>
                </View>
              </Swipeout>
            );
          })
        }
        {
          (user.gymList == null ||
           user.gymList.length === 0) &&
          <Swipeout
            backgroundColor={'white'}
            style={[gymListEditable ? gymSwipeoutFirst : null, gymSwipeoutLast]}
          >
            <Text style={infoCardText}>
              Currently no gyms
            </Text>
          </Swipeout>
        }
      </View>
    );  
  }
}

const autocompleteContainer = {
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  borderWidth: 0,
  flex: 1,
  marginBottom: 16,
};

const autocompleteList = {
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  borderWidth: 0,
  flex: 1,
  left: 0,
  // marginBottom: 16,
  // marginLeft: 0,
  // marginRight: 0,
  // marginTop: 0,
  margin: 0,
  position: 'relative',
  right: 0,
  top: 0,
};

const gymSwipeoutFirst = {
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10
};
const gymSwipeoutLast = {
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10
};


const infoCardNoOverflowHidden = {
  alignSelf: 'stretch',
  // backgroundColor: '#FFFFFF',
  borderRadius: 10,
  marginBottom: 16,
  marginLeft: 16,
  marginRight: 16,
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

const infoCardTextInputWide = {
  alignSelf: 'stretch',
  backgroundColor: '#FFFFFF',
  borderWidth: 0,
  color: '#073942',
  padding: 16,
  textAlign: 'center',
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

const infoCardGym = {
  alignSelf: 'stretch',
  flexDirection: 'row',
  color: '#073942',
  fontSize: 15,
  textAlign: 'center',
};

const infoCardText = {
  alignSelf: 'stretch',
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  color: '#073942',
  fontSize: 15,
  margin: 16,
  textAlign: 'center',
};

const favouriteButtonContainer = {
  alignItems: 'center',
  flex: 3,
  justifyContent: 'center',
};

const favouriteButton = {
  backgroundColor: '#FFFFFF',
  borderRadius: 0,
  margin: 0,
  paddingLeft: 16,
  paddingRight: 8,
  underlayColor: '#FFFFFF',
};

const favouriteButtonBalance = {
  flex: 3,
};

const gymText = {
  flex: 9,
  left: 4,
};
