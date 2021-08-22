import React, { Component } from 'react';
import Web3 from 'web3';
import CreateOrgFrom from './components/createOrgFrom';
import {orgManagerAbi} from './resource/abi/orgManager';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      web3: '',
      accounts: [],
      account: '',
      privateKey: '',
      orgManagerAddress: '0x1a1040B5870879b849eD3b379ac3380c3934A198',
      orgManagerAbi: orgManagerAbi
    }
  }

  componentDidMount() {
    this.loadBlockChain()
  }

  async loadBlockChain() {
    // const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/4d6cbd5116f74b6eb0f688f165b87286'));
    if (typeof window.ethereum == 'undefined') {
      console.log('MetaMask is not installed!');
    } else {
      console.log('MetaMask is installed!');
      await window.ethereum.send('eth_requestAccounts');
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      console.log(accounts);
      this.setState({account: accounts[0]});
    }
    const web3 = new Web3(Web3.givenProvider);
    this.setState({web3: web3});
    const network = await web3.eth.net.getNetworkType();
    console.log("network: ", network);
    
    // const accounts = await web3.eth.getAccounts();
    // console.log("accounts: ", accounts);
    // this.setState({accounts: accounts});
    // this.setState({account: accounts[0]});
    // const wallet = await web3.eth.accounts.create();
    // console.log(wallet);
    // this.setState({account: wallet.address});
    // this.setState({privateKey: wallet.privateKey});
  }

  render() {
    return (
      <div>
        {/* {this.state.accounts.map((i, idx) => (
          <p key={idx}>帳號{idx}: {i} </p>
        ))} */}
         <p>account: {this.state.account} </p>
         {/* <p>privateKey: {this.state.privateKey} </p> */}
        <CreateOrgFrom web3={this.state.web3} account={this.state.account}
          orgManagerAddress={this.state.orgManagerAddress} orgManagerAbi={this.state.orgManagerAbi}/>
      </div>
    );
  }
}

export default App;
