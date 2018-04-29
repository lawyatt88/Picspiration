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
import { Button, ButtonGroup } from 'react-native-elements'
import { WebBrowser, ImagePicker } from 'expo';
import Share from 'react-native-share'
import { RNS3 } from 'react-native-aws3';
import axios from 'axios'
import { StackNavigator } from 'react-navigation';
import styles from '../constants/Styles'
import models from '../constants/Models'

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
        selectedTags: this.props.navigation.state.params.tags,
        tagSynonyms: [],
        relevantQuotes: [],
      }
      this._removeTag = this._removeTag.bind(this)
    }
  
    render(){
      const { selectedModels, image } = this.props.navigation.state.params
      const tags = this.state.selectedTags
      const { relevantQuotes } = this.state
      let thisModel
      
      return (
        <View style={styles.container}>
          <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.welcomeContainer}>
              <View style={{ padding: 10 }}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <View>
                        {selectedModels && tags && relevantQuotes.length === 0 &&
                          selectedModels.map(selectedModel => {
                          thisModel = models.find(model => {
                            return model.id === selectedModel
                          })
  
                          return tags[thisModel.id].map((tag, i) => {
                            return <Button
                              raised
                              icon={{name: 'close'}}
                              key = {i}
                              title={tag}
                              onPress={(evt) => this._removeTag(evt, thisModel.id, tag)}
                            />
                          })
                        })}
                        {selectedModels && tags && relevantQuotes.length === 0 &&
                        <Button
                          title='Get Quote'
                          onPress={(evt) => this._findQuote(evt, thisModel.id)}
                        />
                        }
                        <View>
                        
                        {relevantQuotes && relevantQuotes.length > 0 &&
                          <View>
                            <Image source={{ uri: image.uri }} style={{ width: 300, height: 300 }} />
                            {relevantQuotes.map( (quote, i) => <Text key={i}>{quote}</Text>)}
                          </View>
                        }
                        </View>
                      </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      )
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