import React, { Component } from 'react';
import { Linking, Button, View, StyleSheet, TextInput, Text } from 'react-native';
import { ImagePicker } from 'expo';

export default class PicPicker extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Button title="Open camera roll" onPress={this._openCameraRoll} />
        <TextInput
        style={{ height: 40 }}
        placeholder="Enter a word to search for images"
        onChangeText={(text) => this.setState({ text })}
      />
      <Text style={{ padding: 10, fontSize: 42 }}>
        {//this.state.text.split(' ').map((word) => word && '🍕').join(' ')}
        }
      </Text>
      </View>
    );
  }

  _openCameraRoll = async () => {
    let image = await ImagePicker.launchImageLibraryAsync();
    let { origURL } = image;
    console.log('i am origURL', origURL)
    let encodedURL = encodeURIComponent(origURL);
    console.log('i am origURL', encodedURL)
    let instagramURL = `instagram://library?AssetPath=${encodedURL}`;
    Linking.openURL(instagramURL);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
  },
});