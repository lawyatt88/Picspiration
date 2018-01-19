import React, { Component } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Button,
  Dimensions
} from 'react-native';
import { WebBrowser, ImagePicker } from 'expo';
import Share from 'react-native-share'
import { RNS3 } from 'react-native-aws3';
const Clarifai = require('clarifai');

const app = new Clarifai.App({
  apiKey: 'f2080085df114d3b98fd4593ed22d073'
 });

process.nextTick = setImmediate;

  const { width } = Dimensions.get('window')
  
  export default class NewHomeScreen extends Component {
    constructor(props) {
      super(props);
      this.state = {
        modalVisible: false,
        text: '',
        image: {},
      index: null
    }
  }

  toggleModal = () => {
    this.setState({ modalVisible: !this.state.modalVisible });
  }

  navigate = () => {
    const { navigate } = this.props.navigation
    navigate('ImageBrowser')
  }

  share = () => {
    const {uri} = this.state.image
    const name = uri.slice(uri.lastIndexOf('/'))
    const image = { 
      // `uri` can also be a file system path (i.e. file://)
        uri: this.state.image.uri,
        name: name,
        type: "image/jpg"
      }

      const options = {
        keyPrefix: "uploads/",
        bucket: "picspiration",
        region: "us-east-2",
        accessKey: "AKIAIM5GMSSFDVEWPCVQ",
        secretKey: "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",
        successActionStatus: 201
      }

      if (image !== null) {
        RNS3.put(image, options)
        .then(res => {
          if (res.status !== 201)
          throw new Error("Failed to upload image to S3");
          console.log(res.body);
          return res
        })
        .then(res => {
          console.log('i am postResponse', res.body.postResponse)
          this.setState({ 
            image: { 
              uri: this.state.image.uri,
              url: res.body.postResponse.location
            } 
          });
        })
        
        .then(() => {
          let shareOptions = {
            title: "React Native Share Example",
            message: "Check out this photo!",
            url: this.state.image.url,
            subject: "Check out this photo!"
          }
          console.log(this.state)
          Share.open(shareOptions)
            .then((res) => console.log('res:', res))
            .catch(err => console.log('err', err))
        })
      }
  }

  render() {
    let image = this.state.image.uri;

    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.welcomeContainer}>

            <View style={{ padding: 10 }}>
              <TextInput
                style={{ height: 40 }}
                placeholder="Enter a word to search for images"
                onChangeText={(text) => this.setState({ text })}
              />
              <Text style={{ padding: 10, fontSize: 42 }}>
                {this.state.text.split(' ').map((word) => word && '🍕').join(' ')}
              </Text>

              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Button
                  title="Pick an image from camera roll"
                  onPress={this._pickImage}
                />
                {image &&
                    <View style={styles.shareButton}>
                      <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
                      <Button
                          title='Share'
                          onPress={this.share}
                        />
                    </View>
                  }

              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      base64: true
    });

    console.log(result);

    app.models.predict(Clarifai.GENERAL_MODEL, {base64: result.base64}).then(
      function(res) {
        console.log(res)
      },
      function(err) {
        console.log(err)
      }
    );



    if (!result.cancelled) {
      this.setState({ 
        image: { 
          uri: result.uri,
          url: ''
        } 
      });
    }
      
  };
  
  _getWords = () => {
    app.models.predict(Clarifai.GENERAL_MODEL, {base64: "G7p3m95uAl..."}).then(
      function(response) {
        // do something with response
      },
      function(err) {
        // there was an error
      }
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
  modalContainer: {
    paddingTop: 20,
    flex: 1
  },
  scrollView: {
    flexWrap: 'wrap',
    flexDirection: 'row'
  },
  shareButton: {
    position: 'absolute',
    width,
    padding: 10,
    bottom: 0,
    left: 0
  }
});

