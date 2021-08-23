import React, { Component } from 'react';
import Web3 from 'web3';
import { Redirect } from "react-router-dom";

class LoginFrom extends Component {
    constructor(props) {
        super(props);
        console.log("LoginFrom constructor");
        this.state = {isLogin: false, web3: '', account: '', privateKey: ''};
        
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        const target = event.target;
        const name = target.name;
        const value = target.value;
        this.setState({[name]: value});
    }

    handleSubmit(event) {
        const target = event.target;
        const name = target.name;
        if(name === "metamask") {
            this.metamaskLogin();
        } else if (name === "without_metamask") {
            this.login();
        }
    }

    async metamaskLogin() {
        const web3 = new Web3(Web3.givenProvider);
        this.setState({web3: web3});
        const network = await web3.eth.net.getNetworkType();
        console.log("network: ", network);
        if (typeof window.ethereum == 'undefined') {
            console.log('MetaMask is not installed!');
        } else {
            console.log('MetaMask is installed!');
            // await window.ethereum.send('eth_requestAccounts');
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            // console.log(accounts);
            this.setState({account: accounts[0]});
            // set login state
            this.setState({isLogin: true});
        }
        
    }

    async login() {
        const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/4d6cbd5116f74b6eb0f688f165b87286'));
        this.setState({web3: web3});
        const network = await web3.eth.net.getNetworkType();
        console.log("network: ", network);
    }

    render() {
        if(this.state.isLogin){
            return (<Redirect to={{
                pathname: '/',
                state: { isLogin: true }
            }} />);
        } else {
            return(
                <div>
                    <button className="btn btn-secondary" type="button" name="metamask" onClick = {this.handleSubmit}>metamask login</button>
                    {/* <div className="input-group mb-3">
                        <input type="text" className="form-control" placeholder="account" name="account" value={this.state.account} onChange={this.handleChange}/>
                        <input type="text" className="form-control" placeholder="privateKey" name="privateKey" value={this.state.privateKey} onChange={this.handleChange}/>
                        <button className="btn btn-secondary" type="button" name="without_metamask" onClick = {this.handleSubmit}>login</button>
                    </div> */}
                </div>
            );
        }
    }
}

export default LoginFrom;