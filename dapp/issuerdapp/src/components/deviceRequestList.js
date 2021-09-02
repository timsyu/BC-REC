import React, { Component } from 'react';
import { Link } from "react-router-dom";
import Web3 from 'web3';
import Issuer  from '../resource/issuer.json';

class DeviceRequestList extends Component {
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
            const index = target.id;
            const requestId = this.state.data[index].id;
            const approve = true;
            this.approveDeviceRequest(requestId, approve);
        }
    }

    componentDidMount(){
        // store this
        let that = this;
        this.getAllDeviceRequest()
        .then(data => {
            // console.log(data);
            that.setState({data: data});
        })
    }

    async getAllDeviceRequest() {
        const web3 = new Web3(Web3.givenProvider);
        const issuer = new web3.eth.Contract(Issuer.abi,Issuer.address);
        let data = await issuer.methods.getAllDeviceRequest().call();
        let result = [];
        for(let i = 0; i < data.length; i++) {
            result.push(data[i]);
        }
        return result;
    }

    async approveDeviceRequest(requestId, approve) {
        const web3 = new Web3(Web3.givenProvider);
        const issuer = new web3.eth.Contract(Issuer.abi,Issuer.address);
        
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
        // let isLogin = localStorage.getItem('isLogin');
        // if (isLogin === 'true') {
        let list = this.state.data.map((request, i) =>
            <div className="card" key={i}>
                <div className="card-body">
                    <p>request id: {request.id}</p>
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
                <div className="input-group mb-3" style={{marginTop:"10px"}}>
                    <button className="btn btn-secondary" type="button" name="update" onClick = {this.handleSubmit}>Update</button>
                </div>
                <h1 style={{textAlign: "center"}}>裝置審查請求列表</h1>
                <div>
                    {list}
                </div>
            </div>
        );
        // } else {
        //     return (<Redirect to={{
        //         pathname: '/'
        //     }} />);
        // }
    }
}

export default DeviceRequestList;