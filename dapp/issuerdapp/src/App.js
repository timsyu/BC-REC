import React, { Component } from 'react';
import Home from './components/home';
import { HashRouter, Route, Switch } from "react-router-dom";

class App extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <HashRouter>
        <Switch>
          <Route
                exact
                path="/"
                component={Home}
              />
        </Switch>
      </HashRouter>
    );
  }
}

export default App;
