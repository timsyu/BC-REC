import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";
import Web3 from 'web3';
// import { OrgAbi } from '../resource/abi/org';
// import { PlantAbi } from '../resource/abi/plant';
import Org from '../resource/org.json';
import Plant from '../resource/plant.json';

class Power extends Component {
    constructor(props) {
        super(props);
        let isLogin = localStorage.getItem('isLogin');
        // test
        let orgAddress = localStorage.getItem('orgAddress');
        
        this.state = {
            isLogin: isLogin,
            orgAddress: orgAddress,
            data: [],
            certData: [],
            plantIds: [],
            plantId: '',
            number: ''
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
                let certData = this.calcertNum(data);
                that.setState({certData: certData});
            })
            
        } else if(name === "request") {
            const plantId = this.state.plantId;
            const number = this.state.number;
            // const powers = await this.getPlantAllPower(plantId);
            const allPlantPowers = await this.getAllPower(orgAddress);
            const powerMap = allPlantPowers.get(plantId);
            const powers = [...powerMap.entries()];
            const { powerIds, values } = this.calculate(powers, number);
            console.log(powerIds);
            console.log(values);
            let metadataUri = "metadata_uri";
            this.requestCertificate(orgAddress, number, plantId, powerIds, values, metadataUri);
        }
    }
    
    calcertNum(data) {
        let certNumList = [];
        data.forEach((powers, plantId) => {
            let total = 0;
            powers.forEach((power, powerId) => {
                total += power.remainValue;
            });
            let certNum = Math.floor(total / 1000);
            let info = {
                'plantId': plantId,
                'certNum': certNum,
                'totalPower': total
            };
            certNumList.push(info);
        });
        return certNumList;
    }

    async getAllPower(orgAddress) {
        const web3 = new Web3(Web3.givenProvider);
        const org = new web3.eth.Contract(Org.abi, orgAddress);
        let plantIds = await org.methods.getAllPlant().call();
        this.setState({plantIds: plantIds});
        let plantMap = new Map();
        for(let i = 0; i < plantIds.length; i++) {
            let powers = await this.getPlantAllPower(plantIds[i]);
            plantMap.set(plantIds[i], powers);
        }
        let requests = await this.getAllCertificateRequest(orgAddress);
        for (let i = 0; i < requests.length; i++) {
            let request = requests[i];
            let number = request.number;
            let plantId = request.plantId;
            let powerIds = request.powerIds;
            let values = request[5];
            let powers = plantMap.get(plantId);
            for (let j = 0; j < number; j++) {
                let pIds = powerIds[j];
                let vs = values[j];
                for (let k = 0; k < pIds.length; k++) {
                    let powerId = pIds[k];
                    let value = parseInt(vs[k]);
                    let power = powers.get(powerId);
                    let v = power.remainValue;
                    power.remainValue = v - value
                    // powers.set(powerId, power);
                    if (power.remainValue === 0) {
                        powers.delete(powerId);
                    }
                }
            }
            // plantMap.set(plantId, powers);
        }
        return plantMap;
    }

    async getPlantAllPower(plantId) {
        const web3 = new Web3(Web3.givenProvider);
        let plant = new web3.eth.Contract(Plant.abi, plantId);
        let powers = await plant.methods.getAllPower().call();
        let powerMap = new Map();
        for(let i = 0; i < powers.length; i++) {
            let power = powers[i];
            let info = {
                'id': parseInt(power.id),
                'deviceId': power.deviceId,
                'date': power.date,
                'value': parseInt(power.value),
                'remainValue': parseInt(power.remainValue),
                'txHash': power.txHash
            };
            powerMap.set(power.id, info);
        }
        return powerMap;
    }

    // powers: powers of plant
    // number: cert. number
    calculate(powers, number) {
        number = parseInt(number);
        let powerIds = [];
        let values = [];
        let currentNumber = 0;
        for (let i = 0;i < number;i++) {
            let iPowerIds = [];
            let iValues = [];
            let target = 1000;
            let count = 0;
            for (let j = 0;j < powers.length;j++) {
                let p = powers[j][1];
                if (p.remainValue != 0) {
                    iPowerIds[count] = p.id;
                    if (target > p.remainValue) {
                        target -= p.remainValue;
                        iValues[count] = p.remainValue;
                        count++;
                        p.remainValue = 0;
                    } else { // generate a cert.
                        p.remainValue -= target;
                        iValues[count] = target;
                        count++;
                        currentNumber++;
                        target = 0;
                        break;
                    }
                }
            }
            powerIds[i] = iPowerIds;
            values[i] = iValues;
        }
        
        if (currentNumber == number ) {
            return {'powerIds': powerIds, 'values': values};
        } else {
            return {'powerIds': [], 'values': []};
        }
    }

    async requestCertificate(orgAddress, number, plantId, powerIds, values, metadataUri) {
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
            
            org.methods.requestCertificate(number, plantId, powerIds, values, metadataUri)
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

    async getAllCertificateRequest(orgAddress) {
        const web3 = new Web3(Web3.givenProvider);
        const org = new web3.eth.Contract(Org.abi, orgAddress);
        let requests = await org.methods.getAllCertificateRequest().call();
        // console.log(requests);
        return requests;
    }

    componentDidMount(){
        // store this
        let that = this;
        let orgAddress = localStorage.getItem('orgAddress');
        this.getAllPower(orgAddress).then(data => {
            // console.log(data);
            that.setState({data: data});
            let certData = this.calcertNum(data);
            that.setState({certData: certData});
        });
    }
    
    getPowerElements() {
        const elements = [];
        this.state.data.forEach((powers, plantId) => {
            let list = [];
            powers.forEach((power, powerId) => {
                list.push(
                    <div className="card" key={powerId}>
                        <div className="card-body">
                            <p>powerId: {power.id}</p>
                            <p>deviceId: {power.deviceId}</p>
                            <p>date: {power.date}</p>
                            <p>value: {power.value}</p>
                            <p>remain value: {power.remainValue}</p>
                            <p>tx hash: {power.txHash}</p>
                        </div>
                    </div>
                );
            })
            elements.push(
                <div className="card" key={plantId}>
                    <p>plantId: {plantId}</p>
                    <div className="card-body">
                    {list}
                    </div>
                </div>
            );
        });
        return elements;
    }

    render() {
        let isLogin = localStorage.getItem('isLogin');
        if (isLogin === 'true') {
            let elements = this.getPowerElements();
            let certNumlist = this.state.certData.map((plant, i) => 
                <div className="card" key={i}>
                    <p>plantId: {plant.plantId}</p>
                    <div className="card-body">
                        <p>cert. number: {plant.certNum}</p>
                        <p>total power: {plant.totalPower}</p>
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
                    <h1 style={{textAlign: "center"}}>請求憑證</h1>
                    <div className="input-group mb-3" style={{marginTop:"10px"}}>
                        <input type="text" className="form-control" placeholder="plantId" name="plantId" onChange={this.handleChange}/>
                        <input type="text" className="form-control" placeholder="number" name="number" onChange={this.handleChange}/>
                        <button className="btn btn-secondary" type="button" name="request" onClick = {this.handleSubmit}>Request</button>
                    </div>
                    <br />
                    <br />
                    <h1 style={{textAlign: "center"}}>可申請憑證張數</h1>
                    <div>
                        {certNumlist}
                    </div>
                    <br />
                    <br />
                    <h1 style={{textAlign: "center"}}>發電量資訊</h1>
                    <div>
                        {elements}
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