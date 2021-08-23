import React, { Component } from 'react';
import BigNumber from 'bignumber.js';

class CreatePlantForm extends Component {
    
    constructor(props) {
        super(props);
        this.state = {plantName: '', 
        plantLocation: '',
        plantAddress:'',
        plants: []
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

    handleSubmit(event) {
        // console.log(event);
         this.createPlant();
    }

    async createPlant() {
        const web3 = this.props.web3;
        var that = this;
        // const orgManagerAddress = this.props.orgManagerAddress;
        // const orgManagerAbi = this.props.orgManagerAbi;
        // const orgManager = new web3.eth.Contract(orgManagerAbi, orgManagerAddress);
        const orgAddress = this.props.orgAddress;
        const orgAbi = this.props.orgAbi;
        const org = new web3.eth.Contract(orgAbi, orgAddress);
        const account = this.props.account;
        // const privateKey = this.props.privateKey;
        // const account = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';
        // const privateKey = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';
        var balance = await web3.eth.getBalance(account);
        balance = web3.utils.fromWei(balance, 'ether');
        console.log("balance", balance," ether");
        // let dateTime = new Date().getTime();
        // const date = Math.floor(dateTime / 1000);
        org.methods.createPlant(this.state.plantName, this.state.plantLocation)
        .send({from: account})
        .on('sending', function(confirmationNumber, receipt){
            console.log('sending');
        })
        .on('receipt', function(receipt){
            console.log('receipt');
            console.log(receipt);
            
            console.log(receipt.events.CreatePlantEvent.returnValues.plantContract);
            // return(receipt.events.CreatePlantEvent.returnValues.plantContract);

            that.setState({plantAddress: receipt.events.CreatePlantEvent.returnValues.plantContract});
            // this.props.callback(this.state.plantAddress);
        })
        .on('error', function(error, receipt) {
            console.log(error);
        });
        // let data_abi = orgManager.methods.createOrg(this.state.orgName, date, this.state.orgDescription).encodeABI();
        // const nonce = await web3.eth.getTransactionCount(account);
        // // sign with private key
        // let tx = await web3.eth.accounts.signTransaction({
        //     nonce: `0x${new BigNumber(nonce).toString(16)}`,
        //     value: `0x09184e72a000`,
        //     to: orgManagerAddress,
        //     data: data_abi,
        //     gasLimit: `0x${new BigNumber("2000000").toString(16)}`,
        //     gasPrice: `0x0`
        // }, privateKey);
        // // console.log(tx);
        // var rawTx = tx.rawTransaction;
        // // console.log(rawTx)
        // const txResult = await web3.eth.sendSignedTransaction(rawTx);
        // if(txResult.transactionHash){
        //     console.log("----------\nYour TransactionHash :" + txResult.transactionHash,"\n----------");      
        // }
        // let data = await orgManager.methods.getAllOrgInfo().call();
        // console.log(data);
    }

    render() {
        return(
            <form className="row g-3">
            <div className="input-group">
                
                <input type="text" className="form-control" placeholder="輸入案場名稱" name="plantName" value={this.state.plantName} onChange={this.handleChange}/>
                <input type="text" className="form-control" placeholder="輸入案場地址" name="plantLocation" value={this.state.plantLocation} onChange={this.handleChange}/>
                <button className="btn btn-info" type="button" onClick = {this.handleSubmit}>上傳</button>
                <br></br>
                
            </div>
            <p>new Plant address:{this.state.plantAddress}</p>
            </form>
        );
    }
}

export default CreatePlantForm;