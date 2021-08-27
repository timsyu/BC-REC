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
            data: [],
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
            })
        } else if(name === "calculate") {
            const plantId = this.state.plantId;
            const number = this.state.number;
            const powers = await this.getPlantAllPower(plantId);
            const { powerIds, values } = this.calculate(powers, number);
            console.log(powerIds);
            console.log(values);
        }
    }

    async getAllPower(orgAddress) {
        const web3 = new Web3(Web3.givenProvider);
        const orgAbi = OrgAbi;
        const org = new web3.eth.Contract(orgAbi, orgAddress);
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
        const plantAbi = PlantAbi;
        let plant = new web3.eth.Contract(plantAbi, plantId);
        let powers = await plant.methods.getAllPower().call();
        let powerList = [];
        for(let i = 0; i < powers.length; i++) {
            let power = powers[i];
            let info = {
                'deviceId': power.deviceId,
                'date': power.date,
                'value': power.value,
                'remainValue': power.remainValue,
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
            let target = 333;
            let count = 0;
            for (let j = 0;j < powers.length;j++) {
                let p = powers[j];
                if (p.remainValue != 0) {
                    iPowerIds[count] = j;
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

    componentDidMount(){
        // store this
        let that = this;
        let orgAddress = localStorage.getItem('orgAddress');
        this.getAllPower(orgAddress).then(data => {
            // console.log(data);
            that.setState({data: data});
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
                    <h1 style={{textAlign: "center"}}>發電量資訊</h1>
                    <div>
                        {list}
                    </div>
                    <div className="input-group mb-3" style={{marginTop:"10px"}}>
                        <input type="text" className="form-control" placeholder="plantId" name="plantId" value={this.state.plantId} onChange={this.handleChange}/>
                        <input type="text" className="form-control" placeholder="number" name="number" value={this.state.number} onChange={this.handleChange}/>
                        <button className="btn btn-secondary" type="button" name="calculate" onClick = {this.handleSubmit}>Calculate</button>
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