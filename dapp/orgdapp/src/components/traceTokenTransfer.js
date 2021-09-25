import React, { Component } from 'react';
import Web3 from 'web3';
import Token from '../resource/token.json';

class TraceTokenTransfer extends Component {
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
        const target = event.target;
        const name = target.name;
        if (name === "trace") {
            const tokenId = this.state.tokenId;
            const infoList = await this.traceTokenTransfer(tokenId);
            this.setState({data: infoList});
            this.setState({isTrace: true});
        }
    }

    componentDidMount(){

    }

    async traceTokenTransfer(tokenId) {
        const web3 = new Web3(Web3.givenProvider);
        const token = new web3.eth.Contract(Token.abi, Token.address);
        let infoList = [];
        await token.getPastEvents('TransferBatch', {
            fromBlock: 0
        }, function(error, event){
            if (!error) {
                for (let i = 0; i < event.length; i++) {
                    let result = event[i].returnValues;
                    let ids = result.ids;
                    for (let j = 0; j < ids.length; j++) {
                        if(ids[j] == tokenId) {
                            let info = {
                                'from': result.from,
                                'to': result.to
                            };
                            infoList.push(info);
                        }
                    }
                }
            }
        });
        // console.log(infoList);
        return infoList;
    }

    getDOM() {
        const tokenId = this.state.tokenId;
        const data = this.state.data;

        let infoList = data.map((info, i) => 
            <div className="card" key={i}>
                <div className="card-body">
                    <p>from: {info.from}</p>
                    <p>to: {info.to}</p>
                </div>
            </div>
        )

        return(
            <div className="card">
                <p>tokenId: {tokenId}</p>
                <h1 style={{textAlign: "center"}}>Token Transfer Trace</h1>
                <div className="card-body">
                { infoList }
                </div>
            </div>
        );
    }

    render() {
        return(
            <div>
                <h1 style={{textAlign: "center"}}>Certificate Transfer Trace</h1>
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

export default TraceTokenTransfer;