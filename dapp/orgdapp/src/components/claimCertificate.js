import React, { Component } from 'react';
import Web3 from 'web3';
import Org from '../resource/org.json';

class ClaimCertificate extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            tokenId: '',
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
        const web3 = new Web3(Web3.givenProvider);
        const target = event.target;
        const name = target.name;
        let orgAddress = localStorage.getItem('orgAddress');
        if (name === "claim") {
            const tokenId = this.state.tokenId;
            this.claimCertificate(orgAddress, tokenId);
        }
    }

    componentDidMount(){

    }

    async claimCertificate(orgAddress, id) {
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
            
            org.methods.claimCertificate(id)
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
        return(
            <div>
                <h1 style={{textAlign: "center"}}>Claim Certificate</h1>
                <input type="text" className="form-control" placeholder="token id" name="tokenId" onChange={this.handleChange}/>
                <button className="btn btn-secondary" type="button" name="claim" onClick = {this.handleSubmit}>Claim</button>
            </div>
        );
    }
}

export default ClaimCertificate;