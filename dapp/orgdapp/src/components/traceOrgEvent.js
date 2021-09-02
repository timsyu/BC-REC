import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";
import Web3 from 'web3';
// import { OrgAbi } from '../resource/abi/org';
// import { OrgManagerAbi } from '../resource/abi/orgManager';
// import { OrgManagerAddress } from '../resource/address/contractAddress';
import OrgManager from '../resource/orgManager.json';
import Org from '../resource/org.json';

class TraceOrgEvent extends Component {
    constructor(props) {
        super(props);
        let isLogin = localStorage.getItem('isLogin');
        // test
        let orgAddress = localStorage.getItem('orgAddress');
        
        this.state = {
            isLogin: isLogin,
            orgAddress: orgAddress,
            data: [],
            capacity: [],
            location: [],
            imageUrl: []
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
        if(name === "update") {
            this.getCreateOrg().then( data => {
                this.setState({data: data});
            });
        } else if(name == "select") {

        }
        
    }

    componentDidMount(){
        this.getCreateOrg().then( data => {
            this.setState({data: data});
        });
    }

    async getCreateOrg() {
        const web3 = new Web3(Web3.givenProvider);
        const orgManager = new web3.eth.Contract(OrgManager.abi, OrgManager.address);
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        let orgAddressList = [];
        await orgManager.getPastEvents('CreateOrgEvent', {
            filter: {owner: accounts[0]},
            fromBlock: 0
        }, function(error, event){
            for (let i = 0; i < event.length; i++) {
                let orgAddress = event[i].returnValues.orgContract
                orgAddressList.push(orgAddress);
            }
        });

        let orgList = [];
        for (let i = 0; i < orgAddressList.length; i++) {
            const orgAddress = orgAddressList[i];
            let org = new web3.eth.Contract(Org.abi, orgAddress);
            let data = await org.methods.getOrgInfo().call();
            let info = {
                'address': orgAddress,
                'owner': data.owner,
                'name': data.name,
                'date': data.date,
                'description': data.description
            };
            orgList.push(info);
        }
        // console.log(orgList);
        return orgList;
    }

    render() {
        let list = this.state.data.map((data, index) =>
            <div className="card" key={index}>
                <div className="card-body">
                    <p>address: {data.address}</p>
                    <p>owner: {data.owner}</p>
                    <p>name: {data.name}</p>
                    <p>date: {data.date}</p>
                    <p>description: {data.description}</p>
                    <Link to={{
                        pathname: '/orgPage',
                        state: { orgAddress: data.address}
                    }} style={{marginLeft:"20px", fontSize:"25px"}}>Select</Link>
                </div>
            </div>
        )
        return(
            <div>
                {list}
            </div>
        );
    }
}

export default TraceOrgEvent;