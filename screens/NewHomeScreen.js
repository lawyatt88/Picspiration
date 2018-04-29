import React, { Component } from 'react'
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Linking,
  Picker,
  NavigatorIOS,
  CheckBox
} from 'react-native'
import { Button } from 'react-native-elements'
import Icon from 'react-native-vector-icons/Ionicons'
import { WebBrowser, ImagePicker } from 'expo'
import Share from 'react-native-share'
import { RNS3 } from 'react-native-aws3'
import axios from 'axios'
import styles, { width } from '../constants/Styles'
import models from '../constants/Models'

process.nextTick = setImmediate

export default class NewHomeScreen extends Component {
  static navigationOptions = {
    title: 'Picspiration'
  }

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.welcomeContainer}>
            <View style={{ padding: 10 }}>
              <View style={{ 
                flex:1,
                alignItems: 'center', 
                justifyContent: 'center', 
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'}}>
                <Image
                  style={styles.picYourPick}
                  source={require('../assets/images/pickyourpic.png')}
                />
                <Button
                  style={{
                    width: width * .8,
                    marginTop: 20,
                    marginBottom: 20,
                  }}
                  title="Camera Roll"
                  onPress={ this._pickImage }
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }

  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      base64: true
    })

    if (!result.cancelled) {
      this.props.navigation.navigate('PickCategories', {
        image: { 
          uri: result.uri,
          base64: result.base64,
          url: ''
        }
      })
    }
  }
}

