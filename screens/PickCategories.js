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
  Alert
} from 'react-native'
import CheckBox from 'react-native-checkbox';
import { Button, ButtonGroup, List, ListItem, FormLabel, FormInput } from 'react-native-elements'
import Icon from 'react-native-vector-icons/Ionicons'
import { WebBrowser, ImagePicker } from 'expo';
import Share from 'react-native-share'
import { RNS3 } from 'react-native-aws3';
import axios from 'axios'
import styles from '../constants/Styles'
import Models from '../constants/Models'

const Clarifai = require('clarifai');

const app = new Clarifai.App({
  apiKey: 'f2080085df114d3b98fd4593ed22d073'
 });

process.nextTick = setImmediate;

export default class PickCategories extends Component {
  static navigationOptions = {
    title: 'Categorize It!',
  }

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      text: '',
      selectedIndex: 0,
      models: Models,
      image: props.navigation.state.params.image,
      selectedModels: [],
      index: null,
      tags: {},
      selectedTags: [],
      tagSynonyms: [],
      buttonGroupDisplay: {},
      newCategory: '',
      checked: {}
    }

    this.updateIndex = this.updateIndex.bind(this)
  }

  componentDidMount() {
    let checked = {}
    this.state.models.forEach(model => checked[model.id] = false)
    this.setState({checked, models: Models})
  }

  updateIndex (selectedIndex) {
    if (selectedIndex === this.state.selectedIndex) {
      this.setState({buttonGroupDisplay: {}, selectedIndex: null})
    } else {
      this.setState({selectedIndex})
    }
  }

  handleSubmit = () => {
    //take that category and create a new model with it? to Train?
    //add to selectedModel array for now, but it needs a model id to be added to that array
    //must do an axios request to create a new model for training

    // app.models.add
    const {newCategory, models } = this.state
    const newCategoryId = newCategory.toLowerCase().replace(/[^a-z ]/ig, '').replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (ltr, idx) => idx === 0 ? ltr.toLowerCase() : ltr.toUpperCase()).replace(/\s+/g, '');
    app.models.create(newCategoryId)
      .then( res => console.log('newly created category:', res))
      .then(() => {
        let newModel = {id: newCategoryId, name: newCategory}
        this.setState({models: [...models, newModal], newCategory: '', selectedIndex: null})
       })
      .catch(console.error(err))

    this.onSelectedModelsChange(newCategory)
  }

  render() {
    const { selectedModels, selectedIndex, models } = this.state
    let image = this.state.image.uri
    console.log('state:', this.state)

    return (
      <View style={styles.blueContainer}>
        <ScrollView >
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: "rgba(223, 234, 241, 1)"  }}>
            {image &&
                <View>
                  <Image source={{ uri: image }} style={styles.screenWidth} />
                  <View style={{flex: 1, flexDirection:'row', justifyContent: 'center' }}>
                    <Button 
                      onPress={() => this.updateIndex(0)}
                      title="Pick Categories"
                      buttonStyle={{height: 50, flexGrow: 5}}
                      backgroundColor="rgba(154, 72, 155, 1)" 
                    />
                    <Button 
                      onPress={() => this.updateIndex(1)}
                      title={null} 
                      icon={{name: 'add', style: { marginRight: 0 } }}
                      buttonStyle={{width: 50, height: 50, flexGrow: 1}}
                      backgroundColor="rgba(154, 72, 155, 1)"
                    />
                  </View>
                  {selectedIndex === 0 && models.length &&
                    <View style={{ flex: 1, flexDirection:'row', flexWrap:'wrap', alignItems: 'center', justifyContent: 'center' }}>
                    {models.map(model => {
                        return <CheckBox
                          key={model.id}
                          label={model.name}
                          checked={this.state.checked[model.id]}
                          onChange={(checked) => {
                            let newCheckedState = {...this.state.checked}
                            newCheckedState[model.id] = !this.state.checked[model.id]
                            if (newCheckedState[model.id]) this.setState({selectedModels: [...this.state.selectedModels, model.id]})
                            else this.removeModelTags(model.id)
                            this.setState({checked: newCheckedState})
                          }}
                          labelStyle={{
                            color: "rgba(36, 155, 192, 1)"
                          }}
                          containerStyle={{
                            backgroundColor: "rgba(237, 228, 236, 1)",
                            borderColor: "rgba(36, 155, 192, 1)",
                            borderWidth: 1,
                            margin: 5,
                            padding: 5
                          }}
                        />
                    })}
                    </View>
                  }
                  {selectedIndex === 1 && 
                    <View style={{flex: 1}}>
                      <FormLabel>Add A New Category</FormLabel>
                      <FormInput 
                        onChangeText={(newCategory) => this.setState({newCategory})}
                        value={this.state.newCategory}
                      />
                      <Button
                        title="Add Category!"
                        onPress={this.handleSubmit}
                      />
                    </View>
                  }
                  <View style={{ 
                    flex:1,
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'}}
                    >
                    <TouchableOpacity 
                      activeOpacity = { .5 }
                      onPress={
                        () => this.findTags
                        .then(() => this.props.navigation.navigate('SelectTags', {
                          image: this.state.image,
                          possibleTags: this.state.tags,
                          selectedModels: this.state.selectedModels
                          }),
                          (err) => console.log(err)
                        )
                      }
                    >
                      <Image
                        style={styles.tagit}
                        source={require('../assets/images/tagit.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              }
          </View>
        </ScrollView>
      </View>
    )
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

  findTags = () => {
    let tagPromises = this.state.selectedModels.map( selectedModel => this._getData(selectedModel))
    return Promise.all(tagPromises)
  };

  removeModelTags = selectedModel => {
    this._removeData(selectedModel)
    let updatedSelection = this.state.selectedModels.filter(model => {
      return model !== selectedModel
    })
    this.setState({selectedModels: updatedSelection})
  };
    
  _getData = (selectedModel) => {
    let { image } = this.state
    return app.models.predict(selectedModel, {base64: image.base64})
    .then( res => {
      console.log('Clarifai response = ', res.rawData)
      let newTags = {};
      newTags[selectedModel] = []
      for (let i = 0; i<res.rawData.outputs[0].data.concepts.length; i++) {
        newTags[selectedModel].push(res.rawData.outputs[0].data.concepts[i].name);
      }
      let tags = {...this.state.tags, ...newTags}
      this.setState({ tags });
      return newTags[selectedModel]
      },
      (err) => console.log(err)
    )
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
}


