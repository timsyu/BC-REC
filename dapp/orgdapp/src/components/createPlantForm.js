import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";
import Web3 from 'web3';
// import { OrgAbi } from '../resource/abi/org';
import Org from '../resource/org.json';

class CreatePlantForm extends Component {
    constructor(props) {
        super(props);
        let isLogin = localStorage.getItem('isLogin');

        this.state = {
            isLogin: isLogin,
            orgName: '',
            orgDescription: '',
            orgAddress: '',
            plantName: '',
            plantDescription: '',
            plantAddress: ''
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
        } else if(name === "createPlant") {
            let orgAddress = localStorage.getItem('orgAddress');
            this.createPlant(orgAddress);
        }
        
    }

    async createPlant(orgAddress) {
        const web3 = new Web3(Web3.givenProvider);
        const org = new web3.eth.Contract(Org.abi, orgAddress);
        
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
            org.methods.createPlant(this.state.plantName, this.state.plantDescription)
            .send({from: account})
            .on('sending', function(confirmationNumber, receipt){
                console.log('sending');
            })
            .on('receipt', function(receipt){
                console.log('receipt');
                // console.log(receipt);
                let plantAddress = receipt.events.CreatePlantEvent.returnValues.plantContract;
                // console.log(orgAddress);
                // store orgAddress in localStorage
                localStorage.setItem('plantAddress', plantAddress);
                // store orgAddress in state
                that.setState({plantAddress: plantAddress});
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
                    <br />
                    <br />
                    <h1 style={{textAlign: "center"}}>創建案廠</h1>
                    <div className="card">
                        <div className="input-group mb-3" style={{marginTop:"10px"}}>
                            <input type="text" className="form-control" placeholder="plant name" name="plantName" value={this.state.plantName} onChange={this.handleChange}/>
                            <input type="text" className="form-control" placeholder="description" name="plantDescription" value={this.state.plantDescription} onChange={this.handleChange}/>
                            <button className="btn btn-secondary" type="button" name="createPlant" onClick = {this.handleSubmit}>Create</button>
                        </div>
                        <div className="card-body">
                            <p>plant contract address: {this.state.plantAddress}</p>
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

export default CreatePlantForm;