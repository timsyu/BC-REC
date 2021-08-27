import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";
import Web3 from 'web3';
import { OrgAbi } from '../resource/abi/org';

class DeviceRequestList extends Component {
    constructor(props) {
        super(props);
        let isLogin = localStorage.getItem('isLogin');
        // test
        let orgAddress = localStorage.getItem('orgAddress');
        
        this.state = {
            isLogin: isLogin,
            orgAddress: orgAddress,
            data: [],
            capacity: [],
            location: [],
            imageUrl: []
        };

        // this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(index, event) {
        const target = event.target;
        const name = target.name;
        const value = target.value;
        this.setState({[name]:{ [index]: value}});
    }

    async handleSubmit(event) {
        const target = event.target;
        const name = target.name;
        let orgAddress = localStorage.getItem('orgAddress');
        if(name === "update") {
            let data = await this.getAllDeviceRegisterRequest(orgAddress);
            this.setState({data: data});
        } else if (name === "approve") {
            const requestId = target.id;
            let dateTime = new Date().getTime();
            const date = Math.floor(dateTime / 1000);
            const capacity = this.state.capacity[requestId];
            const location = this.state.location[requestId];
            const imageUrl = this.state.imageUrl[requestId];
            this.approveDeviceRequest(orgAddress, requestId, date, capacity, location, imageUrl);
        }
        
    }

    componentDidMount(){
        // store this
        let that = this;
        let orgAddress = localStorage.getItem('orgAddress');
        this.getAllDeviceRegisterRequest(orgAddress).then(data => {
            // console.log(data);
            that.setState({data: data});
        });
    }

    async getAllDeviceRegisterRequest(orgAddress) {
        const web3 = new Web3(Web3.givenProvider);
        const orgAbi = OrgAbi;
        const org = new web3.eth.Contract(orgAbi, orgAddress);
        let data = await org.methods.getAllDeviceRegisterRequest().call();
        // test
        let result = [];
        for(let i = 0; i < data.length; i++) {
            if (data[i].deviceId !== '0x0000000000000000000000000000000000000000') {
                result.push(data[i]);
            }
        }
        return result;
    }

    async approveDeviceRequest(orgAddress, requestId, date, capacity, location, imageUrl) {
        const web3 = new Web3(Web3.givenProvider);
        const orgAbi = OrgAbi;
        const org = new web3.eth.Contract(orgAbi, orgAddress);
        
        if (typeof window.ethereum == 'undefined') {
            console.log('MetaMask is not installed!');
        } else {
            console.log('MetaMask is installed!');
            // await window.ethereum.send('eth_requestAccounts');
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const account = accounts[0];
            
            org.methods.approveDeviceRequest(requestId, date, capacity, location, imageUrl)
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
            let list = this.state.data.map((data, index) =>
                <div className="card" key={index}>
                    <div className="card-body">
                        <p>deviceId: {data.deviceId}</p>
                        <p>plantId: {data.plantId}</p>
                        <input type="text" className="form-control" placeholder="capacity" name="capacity" onChange={this.handleChange.bind(this, index)}/>
                        <input type="text" className="form-control" placeholder="location" name="location" onChange={this.handleChange.bind(this, index)}/>
                        <input type="text" className="form-control" placeholder="image url" name="imageUrl" onChange={this.handleChange.bind(this, index)}/>
                        <button className="btn btn-secondary" type="button" name="approve" id={index} onClick = {this.handleSubmit}>Approve</button>
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
                    <h1 style={{textAlign: "center"}}>裝置註冊請求列表</h1>
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

export default DeviceRequestList;