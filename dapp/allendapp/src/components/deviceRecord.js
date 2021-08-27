import React, { Component } from 'react';
import Web3 from 'web3';
import { PlantAbi } from '../resource/abi/plant';

class DeviceRecord extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      plantId: '',
      deviceId: '',
      date: '',
      value: '',
      powerId: '',
      recordTxHash: '',
      contractAddress: '',
      userwallet: {
        address: "0xdF8F0e43F20f3c2079cb57Bc868fC169EEC196C1", // maybe use sk later, how to transform
        privateKey: "bf1b7a1b3d2ca43669172d21abd1b0db75838a99929e1af1bc763b3dd0fc6b42" // maybe use sk later
      },
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const name = target.name;
    const value = target.value;
    this.setState({[name]: value});
  }

  onRecord = async (event) => {
    event.preventDefault();
    const web3 = new Web3(Web3.givenProvider || 'https://ropsten.infura.io/v3/4d6cbd5116f74b6eb0f688f165b87286');
    const balance = await web3.eth.getBalance(this.state.userwallet.address); 
    console.log(balance);
    const targetContract = new web3.eth.Contract(PlantAbi, this.state.plantId);
    const date = Date.now();
    var that = this;
    await targetContract.methods.record(this.state.deviceId,date,this.state.value).send({from: this.state.userwallet.address})
    .then(function(txResult){
      that.setState({recordTxHash: txResult.transactionHash})
      const powerId = web3.eth.abi.decodeParameter('uint', txResult.events.RecordEvent.raw.topics[1]);
      that.setState({powerId: powerId});
    });
    await targetContract.methods.bindPowerAndTxHash(this.state.deviceId,this.state.powerId,this.state.recordTxHash).send({from: this.state.userwallet.address})
    .then(function(txResult){
      console.log(txResult);
      console.log('successful')
    });
  };

  render() {
    return (
      <div style={{textAlign: "center"}} >
        <hr/>
        <h1>Device Record</h1>
        <hr/>
        <h3> Input deviceId, value</h3>
        <form onSubmit={this.onRecord}>
            <p>
              <span>PlantId: </span><input type = "text" name="plantId" onChange = {this.handleChange}/>
            </p>
            <p>
              <span>DeviceId: </span><input type = "text" name="deviceId" onChange = {this.handleChange}/>
            </p>
            <p>
              <span>Value: </span><input type = "text" name="value" onChange = {this.handleChange}/>
            </p>
            <p>
              <button type="submit">Record</button>
            </p>
        </form>
        <hr/>
        <p>PowerId: {this.state.powerId}</p>
        <p>storeRecordTxHash: {this.state.recordTxHash}</p>
      </div>
    );
  }
  
}

export default DeviceRecord;