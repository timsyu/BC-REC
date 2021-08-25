import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";
import Web3 from 'web3';
import { OrgAbi } from '../resource/abi/org';
import { PlantAbi } from '../resource/abi/plant';

class Power extends Component {
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

    async handleSubmit(event) {
        const target = event.target;
        const name = target.name;
        let orgAddress = localStorage.getItem('orgAddress');
        if(name === "update") {
            // store this
            let that = this;
            this.getAllPower(orgAddress)
            .then(data => {
                // console.log(data);
                that.setState({data: data});
            })
        }
    }

    async getAllPower(orgAddress) {
        const web3 = new Web3(Web3.givenProvider);
        const orgAbi = OrgAbi;
        const plantAbi = PlantAbi;
        const org = new web3.eth.Contract(orgAbi, orgAddress);
        let plantIds = await org.methods.getAllPlant().call();
        let plantList = [];
        let info = {
            'plantId': '',
            'deviceId': '',
            'date': '',
            'value': '',
            'remainValue': '',
            'txHash': ''
        };
        for(let i = 0; i < plantIds.length; i++) {
            let plant = new web3.eth.Contract(plantAbi, plantIds[i]);
            let powers = await plant.methods.getAllPower().call();
            let powerList = [];
            for(let i = 0; i < powers.length; i++) {
                let power = powers[i];
                info.plantId = plantIds[i];
                info.deviceId = power.deviceId;
                info.date = this.getTime(power.date);
                info.value = power.value;
                info.remainValue = power.remainValue;
                info.txHash = power.txHash;
                powerList.push(info);
            }
            plantList.push(powerList);
        }
        return plantList;
    }

    getTime(d) {
        let date = new Date(+d);
        let year = date.getFullYear();
        let month = ("0" + (date.getMonth() + 1)).substr(-2);
        let day = ("0" + date.getDate()).substr(-2);
        let hour = ("0" + date.getHours()).substr(-2);
        let minutes = ("0" + date.getMinutes()).substr(-2);
        let seconds = ("0" + date.getSeconds()).substr(-2);
      
        return year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds;
    }

    render() {
        let isLogin = localStorage.getItem('isLogin');
        if (isLogin === 'true') {
            let list = this.state.data.map((plant, i) =>
                plant.map((power, j) =>
                    <div className="card" key={j}>
                        <div className="card-body">
                            <p>plantId: {power.plantId}</p>
                            <p>deviceId: {power.deviceId}</p>
                            <p>date: {power.date}</p>
                            <p>value: {power.value}</p>
                            <p>remain value: {power.remainValue}</p>
                            <p>tx hash: {power.txHash}</p>
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

export default Power;