import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";
import Web3 from 'web3';
import { IssuerAbi } from '../resource/abi/issuer';
import { IssuerAddress } from '../resource/address/contractAddress';

class Issuer extends Component {
    constructor(props) {
        super(props);
        let isLogin = localStorage.getItem('isLogin');
        
        
        this.state = {
            isLogin: isLogin,
            data: []
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

    async handleSubmit(event) {
        const target = event.target;
        const name = target.name;
        if(name === "update") {
            // store this
            let that = this;
            this.getAllDeviceRequest()
            .then(data => {
                // console.log(data);
                that.setState({data: data});
            })
        } else if(name === "approve") {
            const requestId = target.id;
            const approve = true;
            this.approveDeviceRequest(requestId, approve);
        }
    }

    async getAllDeviceRequest() {
        const web3 = new Web3(Web3.givenProvider);
        const issuer = new web3.eth.Contract(IssuerAbi,IssuerAddress);
        let data = await issuer.methods.getAllDeviceRequest().call();
        let result = [];
        for(let i = 0; i < data.length; i++) {
            if (data[i].orgContract !== '0x0000000000000000000000000000000000000000') {
                result.push(data[i]);
            }
        }
        return result;
    }

    async approveDeviceRequest(requestId, approve) {
        const web3 = new Web3(Web3.givenProvider);
        const issuer = new web3.eth.Contract(IssuerAbi,IssuerAddress);
        
        if (typeof window.ethereum == 'undefined') {
            console.log('MetaMask is not installed!');
        } else {
            console.log('MetaMask is installed!');
            // await window.ethereum.send('eth_requestAccounts');
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const account = accounts[0];
            
            issuer.methods.approveDeviceRequest(requestId, approve)
            .send({from: account})
            .on('sending', function(confirmationNumber, receipt){
                console.log('sending');
            })
            .on('receipt', function(receipt){
                console.log('receipt');
                // console.log(receipt);
            })
            .on('error', function(error, receipt) {
                console.log(error);
            });
        }
    }

    render() {
        let isLogin = localStorage.getItem('isLogin');
        if (isLogin === 'true') {
            let list = this.state.data.map((request, i) =>
                <div className="card" key={i}>
                    <div className="card-body">
                        <p>org id: {request.orgContract}</p>
                        <p>plant id: {request.plantContract}</p>
                        <p>device id: {request.deviceAccount}</p>
                        <p>device location: {request.deviceLocation}</p>
                        <button className="btn btn-secondary" type="button" name="approve" id={i} onClick = {this.handleSubmit}>approve</button>
                    </div>
                </div>
            )
            return(
                <div>
                    <nav>
                        <Link to={{
                            pathname: '/'
                        }} style={{marginLeft:"20px"}}>首頁</Link>
                        <button className="btn btn-secondary" type="button" name="logout" onClick = {this.handleSubmit}>登出</button>
                    </nav> 
                    <div className="input-group mb-3" style={{marginTop:"10px"}}>
                        <button className="btn btn-secondary" type="button" name="update" onClick = {this.handleSubmit}>Update</button>
                    </div>
                    <h1 style={{textAlign: "center"}}>裝置審查請求列表</h1>
                    <div>
                        {list}
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

export default Issuer;