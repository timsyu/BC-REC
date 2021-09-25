import React, { Component } from 'react';
import Web3 from 'web3';
import Org from '../resource/org.json';

class TokenTransfer extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            tokenId: '',
            to: '',
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
        if (name === "transfer") {
            const tokenId = this.state.tokenId;
            const to = this.state.to;
            let tokenIds = [];
            tokenIds.push(tokenId);
            let amounts = [];
            amounts.push(1);
            this.transferToken(orgAddress, to, tokenIds, amounts);
        }
    }

    componentDidMount(){

    }

    async transferToken(orgAddress, to, ids, amounts) {
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
            
            org.methods.transferToken(to, ids, amounts)
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
                <h1 style={{textAlign: "center"}}>Certificate Transfer</h1>
                <input type="text" className="form-control" placeholder="token id" name="tokenId" onChange={this.handleChange}/>
                <input type="text" className="form-control" placeholder="to" name="to" onChange={this.handleChange}/>
                <button className="btn btn-secondary" type="button" name="transfer" onClick = {this.handleSubmit}>Transfer</button>
                {}
            </div>
        );
    }
}

export default TokenTransfer;