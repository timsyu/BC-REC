import React, { Component } from 'react';
import Web3 from 'web3';
import CreateOrgFrom from './components/createOrgFrom';
import LoginFrom from './components/loginForm';
import RegisterFrom from './components/registerFrom';
import Home from './components/home';
import UnloginHome from './components/unloginHome';
import {orgManagerAbi} from './resource/abi/orgManager';
import { BrowserRouter, HashRouter, Route, Switch, Link, Redirect } from "react-router-dom";

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      web3: '',
      accounts: [],
      account: '',
      privateKey: '',
      orgManagerAddress: '0x593B77c68a94c264Ae5643F29357f6B965dEDD57',
      orgManagerAbi: orgManagerAbi
    }
    
  }

  componentDidMount() {
    console.log("componentDidMount");
    // this.loadBlockChain();
  }

  async loadBlockChain() {
    
  }

  render() {
      return (
        <HashRouter>
          <Switch>
          <Route
              exact
              path="/"
              component={UnloginHome}
              // render={() => {
              //     return (
              //       this.state.isLogin ?
              //       <Redirect to="/home" /> :
              //       <Redirect to="/unloginHome" /> 
              //     )
              // }}
            />
            <Route exact path="/home" component={Home}/>
            <Route exact path="/unloginHome" component={UnloginHome}/>
            <Route exact path="/login" component={LoginFrom}/>
            <Route exact path="/createOrg" component={CreateOrgFrom}/>
            <Route path="/register" component={RegisterFrom}/>
          </Switch>
        </HashRouter>
      );
  }
}

export default App;
