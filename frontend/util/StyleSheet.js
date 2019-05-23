import {
    Image,
    Linking,
    StyleSheet,
    Platform,
    Text,
    View
  } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: '#073942',
    flex: 1,
  },
  wordContainer:{
    alignSelf: 'stretch',
    flexDirection: 'row',
    borderColor:'blue',
    borderWidth: 1,
    marginTop: 1,
    //justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    margin: 20,
  },
  avatarImage: {
    borderRadius: 50,
    height: 100,
    width: 100,
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  text: {
    textAlign: 'center',
    color: '#333',
    marginBottom: 5,
  },
  buttons: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    margin: 20,
    marginBottom: 30,
  },
  profileInput: {
    margin:5

  },
  row: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    backgroundColor: "blue",
    justifyContent: 'space-between',
  },
  box: {
    textAlign: 'center',
    width: 100,
  },
  label: {
    textAlign: 'center',
    alignItems: 'center',
    margin: 10,
  },
  profileBox: {
    width: 100,
    height: 100,
    backgroundColor: '#333',
    marginTop: 10,
  }
});