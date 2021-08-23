import React, { Component } from 'react';
import CreateOrgFrom from './components/createOrgFrom';
import LoginFrom from './components/loginForm';
import RegisterFrom from './components/registerFrom';
import Home from './components/home';
import UnloginHome from './components/unloginHome';
import { HashRouter, Route, Switch } from "react-router-dom";

class App extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      web3: '',
      accounts: [],
      account: '',
      privateKey: ''
    }
    
  }

  componentDidMount() {
    // console.log("componentDidMount");
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
