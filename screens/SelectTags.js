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
  FlatList
} from 'react-native';
import CheckBox from 'react-native-checkbox';
import { Button, ButtonGroup, List, ListItem, FormLabel, FormInput } from 'react-native-elements'
import { WebBrowser, ImagePicker } from 'expo';
import Share from 'react-native-share'
import { RNS3 } from 'react-native-aws3';
import axios from 'axios'
import { StackNavigator } from 'react-navigation';
import styles from '../constants/Styles'
import Models from '../constants/Models'

const quotes = [
    'Nothing is impossible, the word itself says “I’m possible”!',
    'Give me such shows — give me the streets of Manhattan! Walt Whitman',
    'New York is the meeting place of the peoples, the only city where you can hardly find a typical American. Djuna Barnes',
    'New York was a city where you could be frozen to death in the midst of a busy street and nobody would notice. Bob Dylan',
    'Make your mark in New York and you are a made man. Mark Twain',
    'Whether you think you can or you think you can’t, you’re right.'
]

export default class SelectTags extends Component {
    static navigationOptions = {
      title: 'Tag It!',
    }
    
    constructor(props) {
      super(props);
      this.state = {
        selectedModels: [],
        selectedIndex: 0,
        possibleTags: {},
        tagSynonyms: [],
        relevantQuotes: [],
        newTags: '',
        checkedTags: {},
        allTags: []
      }
      this._addTag = this._addTag.bind(this)
      this._removeTag = this._removeTag.bind(this)
      this._addTags = this._addTags.bind(this)
    }

    componentDidMount() {
      console.log('i am the current state:', this.state)
      let { possibleTags, selectedModels } = this.props.navigation.state.params
      let checkedTags = {}, allTags = []
      selectedModels.forEach(selectedModel => {
        let tags = {}
        let currentTags = possibleTags[selectedModel].map(tag => {
          return {name: tag, model: selectedModel}
        })
        allTags = [...allTags, ...currentTags]

        possibleTags[selectedModel].forEach( tag => {
          tags[tag] = false
        })
        checkedTags[selectedModel] = tags
      })

      this.setState({checkedTags, possibleTags, selectedModels, allTags})
    }
  
    updateIndex (selectedIndex) {
      if (selectedIndex === this.state.selectedIndex) {
        this.setState({buttonGroupDisplay: {}, selectedIndex: null})
      } else {
        this.setState({selectedIndex})
      }
    }
  
    render(){
      const { selectedModels, image, possibleTags } = this.props.navigation.state.params
      const { relevantQuotes, selectedIndex, checkedTags, allTags } = this.state
      let thisModel
      console.log('the state:', this.state)

    //   if (Object.keys(checkedTags).length) {
    //     console.log('im here!!!!!!!')
    //     selectedModels.forEach(selectedModel => {
    //     let currentTags = possibleTags[selectedModel].map((tag, i) =>
    //     <CheckBox
    //       key={i}
    //       label={tag}
    //       checked={checkedTags[selectedModel][tag]}
    //       onChange={(checked) => {
    //         let newCheckedState = {...this.state.checkedTags}
    //         newCheckedState[selectedModel][tag] = !this.state.checkedTags[selectedModel][tag]
    //         this.setState({checkedTags: newCheckedState})
    //       }}
    //       labelStyle={{
    //         color: "rgba(36, 155, 192, 1)"
    //       }}
    //       containerStyle={{
    //         backgroundColor: "rgba(237, 228, 236, 1)",
    //         borderColor: "rgba(36, 155, 192, 1)",
    //         borderWidth: 1,
    //         margin: 5,
    //         padding: 5
    //       }}
    //     />)
    //     allTags = [...allTags, ...currentTags]
    //     console.log('all tags in forEach', allTags)
    //   })
    // }
      console.log('all tags', allTags)
      return (
        <View style={styles.blueContainer}>
            {image && 
              <Image source={{ uri: image.uri }} style={styles.screenWidth} />
            }
            <View style={{flexDirection:'row', justifyContent: 'center' }}>
              <Button 
                onPress={() => this.updateIndex(0)}
                title="Found Tags"
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
          {selectedIndex === 0 && selectedModels.length && 
            <ScrollView 
              horizontal
              contentContainerStyle={{
                  flexDirection: 'column',
                  flexWrap: 'wrap',
                  height: 100
              }}>
              {allTags.map((tag, i) => 
                <CheckBox
                  key={i}
                  label={tag.name}
                  checked={checkedTags[tag.model][tag.name]}
                  onChange={(checked) => {
                    let newCheckedState = {...this.state.checkedTags}
                    newCheckedState[tag.model][tag.name] = !this.state.checkedTags[tag.model][tag.name]
                    this.setState({checkedTags: newCheckedState})
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
              )}
            </ScrollView>
          }
          {selectedIndex === 1 && 
            <View style={{flex: 1}}>
              <FormLabel>Add Tags</FormLabel>
              <FormInput 
                onChangeText={newTags => this.setState({newTags})}
                value={this.state.newTags}
              />
              <Button
                title="Add Tags!"
                onPress={this._addTags}
              />
            </View>
          }
          {selectedModels && possibleTags && relevantQuotes.length === 0 &&
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
              onPress={() => this._findQuote(evt, thisModel.id) }
            >
              <Image
                style={styles.tagit}
                source={require('../assets/images/tagit.png')}
              />
            </TouchableOpacity>
          </View>
          }  
          {relevantQuotes && relevantQuotes.length > 0 &&
            <View>
              <Image source={{ uri: image.uri }} style={{ width: 300, height: 300 }} />
              {relevantQuotes.map( (quote, i) => <Text key={i}>{quote}</Text>)}
            </View>
          }
        </View>
      )
    }
  
    _addTag = (evt, model, selectedTag) => {
      evt.preventDefault()
      let newTagState = {...this.state.selectedTags}
      newTagState[model].push(selectedTag)
      this.setState({ selectedTags: newTagState });
    }

    _removeTag = (evt, model, selectedTag) => {
      evt.preventDefault()
      let updatedSelection = this.state.selectedTags[model].filter(tag => {
        return tag !== selectedTag
      })
      let newTagState = {}
      newTagState[model] = updatedSelection
      this.setState({ selectedTags: newTagState });
    }

    _addTags = () => {
      const { newTags, selectedTags } = this.state
      const newTagsArr = newTags.split(',')
      this.setState({selectedTags: [...selectedTags, ...newTagsArr], selectedIndex: 0, newTags: ''})
    }
  
    _getSynonyms = (selectedTag) => {
      let config = {
        headers: {
          "X-Mashape-Key": "S7A4PTHfUgmshp7UdWLBIhoHjTYSp1uyGtZjsnVy9YSmOsVUmS",
          "X-Mashape-Host": "wordsapiv1.p.mashape.com"
        }
      };
  
      return axios.get(`https://wordsapiv1.p.mashape.com/words/${selectedTag}/synonyms`, config)
      .then((result) => {
        console.log('i am the SYNONYMS!!!!!', result.data.synonyms);
        let tagSynonyms = [...this.state.tagSynonyms, ...result.data.synonyms]
        this.setState({ tagSynonyms })
      });
    }
  
    _findQuote = (evt, model) => {
      this.state.selectedTags[model].forEach(tag => {
        return this._getSynonyms(tag)
      })
  
      let theQuote = quotes.map(quote => {
        if (this.state.selectedTags[model].some(tag => {
          return quote.toLowerCase().includes(tag.toLowerCase())
        })) return quote
      })
  
      this.setState({relevantQuotes: theQuote})
    }
  }