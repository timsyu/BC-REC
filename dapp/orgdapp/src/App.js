import React, { Component } from 'react';
import CreateOrgForm from './components/createOrgForm';
import CreatePlantForm from './components/createPlantForm';
import LoginForm from './components/loginForm';
// import RegisterForm from './components/registerForm';
import RequestApproveDeviceForm from './components/requestApproveDeviceForm';
import Home from './components/home';
import OrgPage from './components/orgPage';
import UnloginHome from './components/unloginHome';
import DeviceRegisterRequestList from './components/deviceRegisterRequestList';
import Power from './components/power';
import ReducePower from './components/reducePower';
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
            <Route exact path="/login" component={LoginForm}/>
            <Route exact path="/createOrg" component={CreateOrgForm}/>
            <Route exact path="/createPlant" component={CreatePlantForm}/>
            <Route exact path="/orgPage" component={OrgPage}/>
            <Route exact path="/deviceRegisterRequestList" component={DeviceRegisterRequestList}/>
            <Route exact path="/requestApproveDeviceForm" component={RequestApproveDeviceForm}/>
            <Route exact path="/power" component={Power}/>
            <Route exact path="/reducePower" component={ReducePower}/>
            {/* <Route path="/register" component={RegisterForm}/> */}
          </Switch>
        </HashRouter>
      );
  }
}

export default App;
