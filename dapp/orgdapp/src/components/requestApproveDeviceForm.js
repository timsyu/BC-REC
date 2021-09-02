import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";
import Web3 from 'web3';
import { OrgAbi } from '../resource/abi/org';
import { PlantAbi } from '../resource/abi/plant';
// import DeviceRecord from './deviceRecord';
import Org from '../resource/org.json';
import Plant from '../resource/plant.json';

class RequestApproveDeviceForm extends Component {
    constructor(props) {
        super(props);
        let isLogin = localStorage.getItem('isLogin');
        // test
        let orgAddress = localStorage.getItem('orgAddress');
        
        this.state = {
            isLogin: isLogin,
            orgAddress: orgAddress,
            plantId: '',
            deviceId: '',
            deviceLocation: '',
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
        let orgAddress = localStorage.getItem('orgAddress');
        if(name === "request") {
            const plantId = this.state.plantId;
            const deviceId = this.state.deviceId;
            const deviceLocation = this.state.deviceLocation;
            this.requestApproveDevice(orgAddress, plantId, deviceId, deviceLocation);
        } else if(name === "update") {
            // store this
            let that = this;
            this.getAllDevice(orgAddress)
            .then(data => {
                // console.log(data);
                that.setState({data: data});
            })
        }
    }
    
    componentDidMount(){
        // store this
        let that = this;
        let orgAddress = localStorage.getItem('orgAddress');
        this.getAllDevice(orgAddress).then(data => {
            // console.log(data);
            that.setState({data: data});
        });
    }

    async getAllDevice(orgAddress) {
        const web3 = new Web3(Web3.givenProvider);
        const org = new web3.eth.Contract(Org.bi, orgAddress);
        let plantIds = await org.methods.getAllPlant().call();
        let plantList = [];
        for(let i = 0; i < plantIds.length; i++) {
            let plant = new web3.eth.Contract(Plant.abi, plantIds[i]);
            let devices = await plant.methods.getAllDevice().call();
            let deviceList = [];
            for(let j = 0; j < devices.length; j++) {
                let device = devices[j];
                let state = '';
                if (device.state === "1") {
                    state = "Idle";
                } else if (device.state === "2") {
                    state = "Pending";
                } else if (device.state === "3") {
                    state = "Approve";
                } else if (device.state === "4") {
                    state = "DisApprove";
                }
                let info = {
                    'plantId': plantIds[i],
                    'deviceId': device.device,
                    'capacity': device.capacity,
                    'state': state,
                    'location': device.location,
                    'image': device.image
                };
                deviceList.push(info);
            }
            plantList.push(deviceList);
        }
        return plantList;
    }

    async requestApproveDevice(orgAddress, plantId, deviceId, deviceLocation) {
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
            
            org.methods.requestApproveDevice(plantId, deviceId, deviceLocation)
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
            let list = this.state.data.map((plant, i) =>
                plant.map((device, j) =>
                    <div className="card" key={j}>
                        <div className="card-body">
                            <p>plantId: {device.plantId}</p>
                            <p>deviceId: {device.deviceId}</p>
                            <p>capacity: {device.capacity}</p>
                            <p>state: {device.state}</p>
                            <p>location: {device.location}</p>
                            <p>image: {device.image}</p>
                        </div>
                    </div>
                )
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
                    <h1 style={{textAlign: "center"}}>案廠裝置列表</h1>
                    <div>
                        {list}
                    </div>
                    <br />
                    <br />
                    <h1 style={{textAlign: "center"}}>發送裝置審查請求</h1>
                    <div className="input-group mb-3">
                        <input type="text" className="form-control" placeholder="plantId" name="plantId" value={this.state.plantId} onChange={this.handleChange}/>
                        <input type="text" className="form-control" placeholder="deviceId" name="deviceId" value={this.state.deviceId} onChange={this.handleChange}/>
                        <input type="text" className="form-control" placeholder="deviceLocation" name="deviceLocation" value={this.state.deviceLocation} onChange={this.handleChange}/>
                        <button className="btn btn-secondary" type="button" name="request" onClick = {this.handleSubmit}>request</button>
                    </div>
                    {/* <DeviceRecord /> */}
                </div>
            );
        } else {
            return (<Redirect to={{
                pathname: '/'
            }} />);
        }
    }
}

export default RequestApproveDeviceForm;