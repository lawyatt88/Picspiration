import React from 'react';
import { Text } from 'react-native';

export default class QuoteBank extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            text: '',
            image: {},
            index: null
        }
    }

  render() {
    return <Text {...this.props} style={[this.props.style, { fontFamily: 'space-mono' }]} />;
  }
}
