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
  Dimensions,
  Linking,
  Picker,
  NavigatorIOS,
  CheckBox
} from 'react-native';
import { Button } from 'react-native-elements'
import { WebBrowser, ImagePicker } from 'expo';
import Share from 'react-native-share'
import { RNS3 } from 'react-native-aws3';
import axios from 'axios'

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
      selectedModels: [],
      index: null,
      tags: {}
    }
  }

  render() {
    console.log('!!!!!!!!', this.state)
    let image = this.state.image.uri;
    const models = [
      {id: Clarifai.GENERAL_MODEL,
      name: 'General'},
      {id: Clarifai.FOOD_MODEL,
      name: 'Food'},
      {id: Clarifai.NSFW_MODEL,
      name: 'NSFW'},
      {id: Clarifai.TRAVEL_MODEL,
      name: 'Travel'},
      {id: Clarifai.WEDDING_MODEL,
      name: 'Wedding'},
      {id: Clarifai.COLOR_MODEL,
      name: 'Color'}
    ]

    const { selectedModels } = this.state;
      
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.welcomeContainer}>
            <View style={{ padding: 10 }}>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Button
                  title="Pick an image from camera roll"
                  onPress={ this._pickImage }
                />
                {image &&
                    <View style={{ margin: 5 }}>
                      <Image source={{ uri: image }} style={{ width: 300, height: 300 }} />
                      <Picker onValueChange = {this.onSelectedModelsChange}>
                        <Picker.Item label='Find Tags By Category' value='0' key='0' />
                        {models.map(model => {
                          return <Picker.Item label = {model.name} value = {model.id} key = {model.id} />
                        })}
                      </Picker>
                      <View>
                        <Text style={{ padding: 10, fontSize: 42 }}>
                          {"Categories"}
                        </Text>
                        {this.state.selectedModels.map(selectedModel => {
                          let thisModel = models.find(model => {
                            return model.id === selectedModel
                          })
                          
                          return <Button
                            raised
                            icon={{name: 'close'}}
                            key = {thisModel.id}
                            title={thisModel.name}
                            onPress={(evt) => this.removeModel(evt, thisModel.id)}
                          />
                        })}
                      </View>
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
    )
  }

  

  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      base64: true
    });

    if (!result.cancelled) {
      this.setState({ 
        image: { 
          uri: result.uri,
          base64: result.base64,
          url: ''
        } 
      });
    } 
  };

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

  onSelectedModelsChange = selectedModel => {
    if(this.state.selectedModels.indexOf(selectedModel) === -1 && selectedModel !== '0') {
      this._getData(selectedModel)
      let updatedSelection = [...this.state.selectedModels, selectedModel]
      this.setState({ selectedModels: updatedSelection });
    }
  };

  removeModel = (evt, selectedModel) => {
    this._removeData(selectedModel)
    let updatedSelection = this.state.selectedModels.filter(model => {
      return model !== selectedModel
    })
    this.setState({ selectedModels: updatedSelection });
  };
    
  _getData = (selectedModel) => {
    let { image } = this.state
    app.models.predict(selectedModel, {base64: image.base64})
    .then( res => {
      //add conditional for colors
      console.log('Clarifai response = ', res.rawData)
      let newTags = {};
      newTags[selectedModel] = []
      for (let i = 0; i<res.rawData.outputs[0].data.concepts.length; i++) {
        newTags[selectedModel].push(res.rawData.outputs[0].data.concepts[i].name);
      }
      console.log('these are the NEW tags', newTags)
      let tags = {...this.state.tags, ...newTags}
      this.setState({ tags });
      return newTags[selectedModel]
      },
      function(err) {
        console.log(err)
      }
    )
    .then(tags => {
      this._getSynonyms(tags[0])
    })
  }

  _removeData = (selectedModel) => {
    delete this.state.tags[selectedModel]
  }

  _addData = () => {app.inputs.create({
    base64: result.base64,
    concepts: [
      {
        id: "shrimp",
        value: true,
        metadata: {id: 'id001', type: 'food'}
      }
    ]
  })
  .then(
    function(res) {
      console.log('input response', res)
    },
    function(err) {
      console.log(err)
    }
  )}
  
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

  _getSynonyms = (selectedTag) => {
    console.log('the TAG!!!!!', selectedTag)
    let config = {
      headers: {
        "X-Mashape-Key": "S7A4PTHfUgmshp7UdWLBIhoHjTYSp1uyGtZjsnVy9YSmOsVUmS",
        "X-Mashape-Host": "wordsapiv1.p.mashape.com"
      }
    };

    return axios.get(`https://wordsapiv1.p.mashape.com/words/${selectedTag}/synonyms`, config)
    .then((result) => {
      console.log('i am the SYNONYMS!!!!!', result.data.synonyms);
    });
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
    alignItems: 'center',
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

