import React, { Component } from 'react';
import BigNumber from 'bignumber.js';
// import { signtx } from './sign';

class CreateOrgFrom extends Component {
    constructor(props) {
        super(props);
        this.state = {orgName: '', orgDescription: ''};

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
        this.createOrg();
    }

    async createOrg() {
        const web3 = this.props.web3;
        const orgManagerAddress = this.props.orgManagerAddress;
        const orgManagerAbi = this.props.orgManagerAbi;
        const orgManager = new web3.eth.Contract(orgManagerAbi, orgManagerAddress);
        // const userwallet = this.props.userwallet;

        // let dateTime = new Date().getTime();
        // const date = Math.floor(dateTime / 1000);
        // let data = orgManager.methods.createOrg(this.state.orgName, date, this.state.orgDescription).encodeABI();
        // const nonce = await web3.eth.getTransactionCount(userwallet.address);
        // web3.eth.accounts.signTransaction({
        //     nonce: `0x${new BigNumber(nonce).toString(16)}`,
        //     value: `0x0`,
        //     to: contractAddress,
        //     data: data_abi,
        //     gasLimit: `0x${new BigNumber("2000000").toString(16)}`,
        //     gasPrice: `0x0`
        // }, userwallet.privateKey)
        // const rawtx = await signtx(tx_object, this.state.userwallet.privateKey)
        // const txResult = await web3.eth.sendSignedTransaction(rawtx)
        // if(txResult.transactionHash){
        //     console.log("----------\nYour TransactionHash :" + txResult.transactionHash,"\n----------")        
        // }
    }

    render() {
        return(
            <div className="input-group mb-3">
                <input type="text" className="form-control" placeholder="org name" name="orgName" value={this.state.orgName} onChange={this.handleChange}/>
                <input type="text" className="form-control" placeholder="description" name="orgDescription" value={this.state.orgDescription} onChange={this.handleChange}/>
                <button className="btn btn-secondary" type="button" onClick = {this.handleSubmit}>Upload</button>
            </div>
        );
    }
}

export default CreateOrgFrom;