import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";
import Web3 from 'web3';
import Issuer from '../resource/issuer.json';
import Org from '../resource/org.json';

class ReducePower extends Component {
    constructor(props) {
        super(props);
        let isLogin = localStorage.getItem('isLogin');
        // test
        let orgAddress = localStorage.getItem('orgAddress');
        
        this.state = {
            isLogin: isLogin,
            orgAddress: orgAddress,
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

    handleRequestButton(i, name) {
        const requestId = this.state.data[i].id;
        let orgAddress = localStorage.getItem('orgAddress');
        // console.log(requestId);
        if (name === "Approved") {
            this.reducePower(orgAddress, requestId);
        } else if (name === "DisApproved") {
            this.deleteRequestCertificate(orgAddress, requestId);
        }
    }

    async handleSubmit(event) {
        const target = event.target;
        const name = target.name;
        let orgAddress = localStorage.getItem('orgAddress');
        if(name === "update") {
            // store this
            let that = this;
            this.getAllApprovedCertificateRequest(orgAddress)
            .then(data => {
                // console.log(data);
                that.setState({data: data});
            })
        }
    }

    async getAllApprovedCertificateRequest(orgAddress) {
        let requestList = [];
        const web3 = new Web3(Web3.givenProvider);
        let org = new web3.eth.Contract(Org.abi, orgAddress);
        let data = await org.methods.getAllCertificateRequest().call();
        for (let i = 0; i < data.length; i++) {
            const request = data[i];
            let id = request.id;
            let number = request.number;
            let plantId = request.plantId;
            let state = await this.getCertRequestApprovedEvent(id);
            let info = {
                'id': id,
                'state': state,
                'number': number,
                'plantId': plantId
            };
            requestList.push(info);
        }
        // console.log(requestList);
        return requestList;
    }

    async getCertRequestApprovedEvent(requestId) {
        const web3 = new Web3(Web3.givenProvider);
        const issuer = new web3.eth.Contract(Issuer.abi, Issuer.address);
        let state = '';
        await issuer.getPastEvents('CertificateRequestApprovedEvent', {
            filter: {requestId: requestId},
            fromBlock: 0
        }, function(error, event){
            // console.log(event)
            if(!error) {
                if (event.length > 0) {
                    let returnValues = event[0].returnValues;
                    state = (returnValues.approve) ? 'Approved' : 'DisApproved';
                } else {
                    state = 'Pending';
                }
            }
        });
        return state;
    }

    async getCertificateEvent(requestId) {
        const web3 = new Web3(Web3.givenProvider);
        const issuer = new web3.eth.Contract(Issuer.abi, Issuer.address);
        let approve = false;
        await issuer.getPastEvents('CertificateRequestApprovedEvent', {
            filter: {requestId: requestId},
            fromBlock: 0
        }, function(error, event){
            // console.log(event)
            if(!error && event.length > 0) {
                let returnValues = event[0].returnValues;
                approve = returnValues.approved
            }
        });
        return approve;
    }

    async reducePower(orgAddress, requestId) {
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
            
            org.methods.reducePower(requestId)
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

    async deleteRequestCertificate(orgAddress, requestId) {
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
            
            org.methods.deleteRequestCertificate(requestId)
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

    componentDidMount(){
        // store this
        let that = this;
        let orgAddress = localStorage.getItem('orgAddress');
        this.getAllApprovedCertificateRequest(orgAddress).then(data => {
            // console.log(data);
            that.setState({data: data});
        });
    }
    
    renderButtons(requestState, i) {
        switch (requestState) {
            case "Approved":
                return <button className="btn btn-secondary" type="button" onClick = {() => this.handleRequestButton(i, requestState)}>Reduce</button>;
            case "DisApproved":
                return <button className="btn btn-secondary" type="button" onClick = {() => this.handleRequestButton(i, requestState)}>Delete Request</button>;
            default:
                return null;
        }
    }

    render() {
        let isLogin = localStorage.getItem('isLogin');
        if (isLogin === 'true') {
            let list = this.state.data.map((request, i) => 
                <div className="card" key={i}>
                    <div className="card-body">
                        <p>requestId: {request.id}</p>
                        <p>state: {request.state}</p>
                        <p>plantId: {request.plantId}</p>
                        {this.renderButtons(request.state, i)}
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
                    <br />
                    <br />
                    <h1 style={{textAlign: "center"}}>申請憑證之請求列表</h1>
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

export default ReducePower;