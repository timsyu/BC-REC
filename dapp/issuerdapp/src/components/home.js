import React, { Component } from 'react';
import DeviceRequestList from './deviceRequestList';

class Home extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <DeviceRequestList />
    );
  }
}

export default Home;
