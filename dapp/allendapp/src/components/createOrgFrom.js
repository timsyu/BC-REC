import React, { Component } from 'react';

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
        const account = this.props.account;

        var balance = await web3.eth.getBalance(account);
        balance = web3.utils.fromWei(balance, 'ether');
        console.log("balance", balance," ether");
        let dateTime = new Date().getTime();
        const date = Math.floor(dateTime / 1000);
        orgManager.methods.createOrg(this.state.orgName, date, this.state.orgDescription)
        .send({from: account})
        .on('sending', function(confirmationNumber, receipt){
            console.log('sending');
        })
        .on('receipt', function(receipt){
            console.log('receipt');
            console.log(receipt);
        })
        .on('error', function(error, receipt) {
            console.log(error);
        });
    }

    render() {
        return(
            <div className="input-group mb-3">
                <input type="text" className="form-control" placeholder="org name" name="orgName" value={this.state.orgName} onChange={this.handleChange}/>
                <input type="text" className="form-control" placeholder="description" name="orgDescription" value={this.state.orgDescription} onChange={this.handleChange}/>
                <button className="btn btn-secondary" type="button" onClick = {this.handleSubmit}>Create</button>
            </div>
        );
    }
}

export default CreateOrgFrom;