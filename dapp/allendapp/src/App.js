import React, { Component } from 'react';
import Web3 from 'web3';
import CreateOrgFrom from './components/createOrgFrom';
import LoginFrom from './components/loginForm';
import Home from './components/home';
import {orgManagerAbi} from './resource/abi/orgManager';
import { BrowserRouter, HashRouter, Route, Switch, Link } from "react-router-dom";

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
    
  }

  render() {
    return (
      // <div>
      //   {/* {this.state.accounts.map((i, idx) => (
      //     <p key={idx}>帳號{idx}: {i} </p>
      //   ))} */}
      //    <p>account: {this.state.account} </p>
      //    {/* <p>privateKey: {this.state.privateKey} </p> */}
      //   <CreateOrgFrom web3={this.state.web3} account={this.state.account}
      //     orgManagerAddress={this.state.orgManagerAddress} orgManagerAbi={this.state.orgManagerAbi}/>
      // </div>
      <div>
        <HashRouter>
        <nav>
          <Link to="/" style={{marginLeft:"20px"}}>首頁</Link>
          <Link to="/login" style={{marginLeft:"20px"}}>登入</Link>
          <Link to="/createOrg" style={{marginLeft:"20px"}}>註冊組織</Link>
        </nav> 
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route exact path="/login" component={LoginFrom}/>
            <Route path="/createOrg" component={CreateOrgFrom}/>
          </Switch>
        </HashRouter>
      </div>
      
    );
  }
}

export default App;
