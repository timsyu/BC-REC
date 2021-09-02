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
            const powers = await this.getPlantAllPower(plantId);
            const { powerIds, values } = this.calculate(powers, number);
            console.log(powerIds);
            console.log(values);
            let metadataUri = "metadata_uri";
            this.requestCertificate(orgAddress, number, plantId, powerIds, values, metadataUri);
        } else if(name === "reduce") {
            const plantId = this.state.plantId;
            const number = this.state.number;
            const powers = await this.getPlantAllPower(plantId);
            const { powerIds, values } = this.calculate(powers, number);
            console.log(powerIds);
            console.log(values);
            console.log(JSON.stringify(powerIds));
            console.log(JSON.stringify(values));
            this.reducePower(orgAddress, plantId, powerIds, values);
        }
    }
    
    calcertNum(data) {
        let certNumList = [];
        for (let i = 0; i < data.length; i++) {
            let plantId = data[i].plantId;
            let powers = data[i].powers;
            let total = 0;
            for (let i = 0; i < powers.length; i++) {
                total += powers[i].remainValue;
            }
            let certNum = Math.floor(total / 111);
            let info = {
                'plantId': plantId,
                'certNum': certNum
            };
            certNumList.push(info);
        }
        return certNumList;
    }

    async getAllPower(orgAddress) {
        const web3 = new Web3(Web3.givenProvider);
        const org = new web3.eth.Contract(Org.abi, orgAddress);
        let plantIds = await org.methods.getAllPlant().call();
        this.setState({plantIds: plantIds});
        let plantList = [];
        for(let i = 0; i < plantIds.length; i++) {
            let powers = await this.getPlantAllPower(plantIds[i]);
            let info = {
                'plantId': plantIds[i],
                'powers': powers
            };
            plantList.push(info);
        }
        return plantList;
    }

    async getPlantAllPower(plantId) {
        const web3 = new Web3(Web3.givenProvider);
        let plant = new web3.eth.Contract(Plant.abi, plantId);
        let powers = await plant.methods.getAllPower().call();
        let powerList = [];
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
            powerList.push(info);
        }
        return powerList;
    }

    // powers: powers of plant
    // number: cert. number
    calculate(powers, number) {
        let powerIds = [];
        let values = [];
        let currentNumber = 0;
        for (let i = 0;i < number;i++) {
            let iPowerIds = [];
            let iValues = [];
            let target = 111;
            let count = 0;
            for (let j = 0;j < powers.length;j++) {
                let p = powers[j];
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
    
    render() {
        let isLogin = localStorage.getItem('isLogin');
        if (isLogin === 'true') {
            let list = this.state.data.map((plant, i) => 
                <div className="card" key={i}>
                    <p>plantId: {plant.plantId}</p>
                    <div className="card-body">
                    {
                        plant.powers.map((power, j) =>
                            <div className="card" key={j}>
                                <div className="card-body">
                                    <p>powerId: {power.id}</p>
                                    <p>deviceId: {power.deviceId}</p>
                                    <p>date: {power.date}</p>
                                    <p>value: {power.value}</p>
                                    <p>remain value: {power.remainValue}</p>
                                    <p>tx hash: {power.txHash}</p>
                                </div>
                            </div>
                        )
                    }
                    </div>
                </div>
            )
            let certNumlist = this.state.certData.map((plant, i) => 
                <div className="card" key={i}>
                    <p>plantId: {plant.plantId}</p>
                    <div className="card-body">
                        <p>certNum: {plant.certNum}</p>
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