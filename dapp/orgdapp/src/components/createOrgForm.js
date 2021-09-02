import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";
import Web3 from 'web3';
// import { OrgManagerAddress, IssuerAddress } from '../resource/address/contractAddress';
// import { OrgManagerAbi } from '../resource/abi/orgManager';
import OrgManager from '../resource/orgManager.json';
import Issuer from '../resource/issuer.json';

class CreateOrgForm extends Component {
    constructor(props) {
        super(props);
        let isLogin = localStorage.getItem('isLogin');

        this.state = {
            isLogin: isLogin,
            orgName: '',
            orgDescription: '',
            orgAddress: ''
        };

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
        if(name === "logout") {
            // set isLogin in localStorage
            localStorage.setItem('isLogin', false);
            this.setState({isLogin: false});
        } else if(name === "createOrg") {
            this.createOrgAndSetIssuer();
        }
    }

    async createOrgAndSetIssuer() {
        const web3 = new Web3(Web3.givenProvider);
        const orgManager = new web3.eth.Contract(OrgManager.abi, OrgManager.address);
        
        if (typeof window.ethereum == 'undefined') {
            console.log('MetaMask is not installed!');
        } else {
            console.log('MetaMask is installed!');
            // await window.ethereum.send('eth_requestAccounts');
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const account = accounts[0];
            // store this
            var that = this;
            let dateTime = new Date().getTime();
            const date = Math.floor(dateTime / 1000);
            orgManager.methods.createOrg(this.state.orgName, date, this.state.orgDescription, Issuer.address)
            .send({from: account})
            .on('sending', function(confirmationNumber, receipt){
                console.log('sending');
            })
            .on('receipt', function(receipt){
                console.log('receipt');
                // console.log(receipt);
                let orgAddress = receipt.events.CreateOrgEvent.returnValues.orgContract;
                // console.log(orgAddress);
                // store orgAddress in localStorage
                localStorage.setItem('orgAddress', orgAddress);
                // store orgAddress in state
                that.setState({orgAddress: orgAddress});
            })
            .on('error', function(error, receipt) {
                console.log(error);
            });
        }
    }

    render() {
        let isLogin = localStorage.getItem('isLogin');
        if (isLogin === 'true') {
            return(
                <div>
                    <nav>
                        <Link to={{
                            pathname: '/'
                        }} style={{marginLeft:"20px", fontSize:"25px"}}>首頁</Link>
                        <br />
                        <br />
                        <button className="btn btn-secondary" type="button" name="logout" onClick = {this.handleSubmit}>登出</button>
                    </nav> 
                    <h1 style={{textAlign: "center"}}>創建組織</h1>
                    <div className="card">
                        <div className="input-group mb-3" style={{marginTop:"10px"}}>
                            <input type="text" className="form-control" placeholder="org name" name="orgName" value={this.state.orgName} onChange={this.handleChange}/>
                            <input type="text" className="form-control" placeholder="description" name="orgDescription" value={this.state.orgDescription} onChange={this.handleChange}/>
                            <button className="btn btn-secondary" type="button" name="createOrg" onClick = {this.handleSubmit}>Create</button>
                        </div>
                        <div className="card-body">
                            <p>org contract address: {this.state.orgAddress}</p>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (<Redirect to={{
                pathname: '/'
            }} />);
        }
    }
}

export default CreateOrgForm;