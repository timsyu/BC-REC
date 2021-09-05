import React, { Component } from 'react';
import Web3 from 'web3';
// import OrgManager from '../resource/orgManager.json';
// import Issuer from '../resource/issuer.json';
// import Org from '../resource/org.json';
import Plant from '../resource/plant.json';
import Token from '../resource/token.json';

class TraceToken extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            tokenId: '',
            data: [],
            isTrace: false
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
        const web3 = new Web3(Web3.givenProvider);
        const target = event.target;
        const name = target.name;
        if (name === "trace") {
            const tokenId = this.state.tokenId;
            const cert = await this.getCertBy(tokenId);
            if (cert) {
                // console.log(cert);
                const requestId = cert.requestId;
                const plantId = cert.plantId;
                const powerIds = cert.powerIds;
                const usedValues = cert.values;
                let oriPowers = [];
                let usedPowers = [];
                for (let i = 0; i < powerIds.length; i++) {
                    
                    let powerId = powerIds[i];
                    let txHash = await this.getRecordTxHashBy(plantId, powerId);
                    let data = await this.getRecordTxBy(txHash);
                    let input = data.input;
                    // get only data without function selector
                    let inputData = '0x' + input.slice(10);
                    // value, date => uint256,'uint256
                    let params = web3.eth.abi.decodeParameters(['uint256', 'uint256'], inputData);
                    // console.log(params);
                    let date = params[0];
                    let value = params[1];
                    
                    let oriPower = {
                        'txHash': txHash,
                        'powerId': powerId,
                        'value': value,
                        'date': date
                    };
    
                    let usedPower = {
                        'powerId': powerId,
                        'value': usedValues[i],
                    };
                    
                    oriPowers.push(oriPower);
                    usedPowers.push(usedPower);
                }
                let result = {
                    'tokenId': tokenId,
                    'requestId': requestId,
                    'plantId': plantId,
                    'oriPowers': oriPowers,
                    'usedPowers': usedPowers
                };
                this.setState({data: result});
                this.setState({isTrace: true});
            }
        }
    }

    componentDidMount(){

    }

    async getCertBy(tokenId) {
        const web3 = new Web3(Web3.givenProvider);
        const token = new web3.eth.Contract(Token.abi, Token.address);
        let info;
        await token.getPastEvents('CertificateEvent', {
            filter: {tokenId: tokenId},
            fromBlock: 0
        }, function(error, event){
            if (!error && event.length > 0) {
                let returnValues = event[0].returnValues;
                info = {
                    'requestId': returnValues.requestId,
                    'tokenId': tokenId,
                    'orgId': returnValues.orgId,
                    'plantId': returnValues.plantId,
                    'powerIds': returnValues.powerIds,
                    'values': returnValues.values
                };
            }
        });
        return info;
    }

    async getRecordTxHashBy(plantId, powerId) {
        const web3 = new Web3(Web3.givenProvider);
        const plant = new web3.eth.Contract(Plant.abi, plantId);
        let txHash = '';
        await plant.getPastEvents('RecordTxHashEvent', {
            filter: {powerId: powerId},
            fromBlock: 0
        }, function(error, event){
            if (!error && event.length > 0) {
                txHash = event[0].returnValues.txHash;
            }
        });
        return txHash;
    }

    async getRecordTxBy(txHash) {
        const web3 = new Web3(Web3.givenProvider);
        let data = await web3.eth.getTransaction(txHash);
        return data;
    }

    getDOM() {
        // this.setState({isTrace: false});
        let tokenId = this.state.data.tokenId;
        let requestId = this.state.data.requestId;
        let plantId = this.state.data.plantId;
        let oriPowers = this.state.data.oriPowers;
        let usedPowers = this.state.data.usedPowers;
        
        let oriPowerlist = oriPowers.map((oriPower, i) => 
            <div className="card" key={i}>
                <div className="card-body">
                    <p>txHash: {oriPower.txHash}</p>
                    <p>powerId: {oriPower.powerId}</p>
                    <p>value: {oriPower.value}</p>
                    <p>date: {oriPower.date}</p>
                </div>
            </div>
        )
            
        let usedPowerlist = usedPowers.map((usedPower, i) => 
            <div className="card" key={i}>
                <div className="card-body">
                    <p>powerId: {usedPower.powerId}</p>
                    <p>value: {usedPower.value}</p>
                </div>
            </div>
        )

        return(
            <div className="card">
                <p>tokenId: {tokenId}</p>
                <p>requestId: {requestId}</p>
                <p>plantId: {plantId}</p>
                <h1 style={{textAlign: "center"}}>申請憑證之發電量</h1>
                <div className="card-body">
                { usedPowerlist }
                </div>
                <h1 style={{textAlign: "center"}}>原始發電量</h1>
                <div className="card-body">
                { oriPowerlist }
                </div>
            </div>
        );
    }

    render() {
        return(
            <div>
                <h1 style={{textAlign: "center"}}>Token Trace</h1>
                <input type="text" className="form-control" placeholder="token id" name="tokenId" onChange={this.handleChange}/>
                <button className="btn btn-secondary" type="button" name="trace" onClick = {this.handleSubmit}>Trace</button>
                {
                    (this.state.isTrace)
                    ?  this.getDOM()
                    : null
                }
            </div>
        );
    }
}

export default TraceToken;