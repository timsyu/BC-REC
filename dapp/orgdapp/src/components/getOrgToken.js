import React, { Component } from 'react';
import Web3 from 'web3';
import Token from '../resource/token.json';
import Issuer from '../resource/issuer.json';

class GetOrgToken extends Component {
    constructor(props) {
        super(props);
        let isLogin = localStorage.getItem('isLogin');
        // test
        let orgAddress = localStorage.getItem('orgAddress');
        
        this.state = {
            isLogin: isLogin,
            orgAddress: orgAddress,
            data: [],
        };

        // this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(index, event) {
        const target = event.target;
        const name = target.name;
        const value = target.value;
        this.setState({[name]:{ [index]: value}});
    }

    handleSubmit(event) {
        const target = event.target;
        const name = target.name;
    }

    componentDidMount(){
        let orgAddress = localStorage.getItem('orgAddress');
        this.getOrgToken(orgAddress).then( data => {
            this.setState({data: data});
        });
    }

    async getOrgToken(orgAddress) {
        const web3 = new Web3(Web3.givenProvider);
        const token = new web3.eth.Contract(Token.abi, Token.address);
        let totalTokenList = [];
        let orgAddressList = [];
        await token.getPastEvents('TransferBatch', {
            filter: {operator: Issuer.address},
            fromBlock: 0
        }, function(error, event){
            if (!error) {
                for (let i = 0; i < event.length; i++) {
                    let ids = event[i].returnValues.ids;
                    for (let j = 0; j < ids.length; j++) {
                        const id = ids[j];
                        totalTokenList.push(id);
                        orgAddressList.push(orgAddress);
                    }
                }
            }
        });
        // console.log(totalTokenList);
        let myTokenList = [];
        let data = await token.methods.balanceOfBatch(orgAddressList, totalTokenList).call();
        for (let i = 0; i < data.length; i++) {
            if (parseInt(data[i]) > 0) {
                let tokenId = totalTokenList[i];
                let isClaim = await this.getTokenClaimState(tokenId);
                let info = {
                    'tokenId': tokenId,
                    'isClaim': isClaim + ""
                };
                myTokenList.push(info);
            }
        }
        // console.log(myTokenList);
        return myTokenList;
    }

    async getTokenClaimState(tokenId) {
        const web3 = new Web3(Web3.givenProvider);
        const token = new web3.eth.Contract(Token.abi, Token.address);
        let isClaim = await token.methods.getClaim(tokenId).call();
        // console.log(isClaim);
        return isClaim;
    }

    render() {
        let list = this.state.data.map((info, index) =>
            <div className="card" key={index}>
                <div className="card-body">
                    <p>token id: {info.tokenId}</p>
                    <p>claim: {info.isClaim}</p>  
                </div>
            </div>
        )
        return(
            <div>
                <h1 style={{textAlign: "center"}}>擁有的Certificate</h1>
                {list}
            </div>
        );
    }
}

export default GetOrgToken;