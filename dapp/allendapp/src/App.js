import React, { Component } from 'react';
import Web3 from 'web3';
import CreateOrgFrom from './component/orgManager';
import {orgManagerAbi} from './resource/abi/orgManager';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      web3: '',
      accounts: [],
      userwallet: {
        address: '',
        privateKey: ''
      },
      orgManagerAddress: '0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B',
      orgManagerAbi: orgManagerAbi
    }
  }

  componentDidMount() {
    this.loadBlockChain()
  }

  async loadBlockChain() {
    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
    this.setState({web3: web3});
    const network = await web3.eth.net.getNetworkType();
    console.log("network: ", network);
    // const accounts = await web3.eth.getAccounts();
    // console.log("accounts: ", accounts);
    // this.setState({accounts: accounts});
    // this.setState({account: accounts[0]});
    const wallet = await web3.eth.accounts.create();
    console.log(wallet);
    // this.setState({userwallet: {
    //   address: wallet.address,
    //   privateKey: wallet.privateKey
    // }});
    this.setState({userwallet: {
      address: wallet.address,
      privateKey: wallet.privateKey
    }});
  }

  render() {
    return (
      <div>
        {/* {this.state.accounts.map((i, idx) => (
          <p key={idx}>帳號{idx}: {i} </p>
        ))} */}
         <p>帳號{this.state.web3}: {this.state.userwallet.privateKey} </p>
        <CreateOrgFrom web3={this.state.web3} userwallet={this.state.userwallet} 
          orgManagerAddress={this.state.orgManagerAddress} orgManagerAbi={this.state.orgManagerAbi}/>
      </div>
    );
  }
}

export default App;
