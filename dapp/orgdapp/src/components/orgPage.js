import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";
import TraceToken from "./traceToken";
import GetOrgToken from "./getOrgToken";
import TokenTransfer from "./tokenTransfer";
import TraceTokenTransfer from "./traceTokenTransfer";
import ClaimCertificate from './claimCertificate';

class Home extends Component {
    constructor(props) {
        super(props);
        let isLogin = localStorage.getItem('isLogin');
        if(props.location.state) {
            let orgAddress = props.location.state.orgAddress;
            if (orgAddress) {
                localStorage.setItem('orgAddress', orgAddress);
            }
        }
        this.state = {isLogin: isLogin};
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
        if(name === "logout") {
            // set isLogin in localStorage
            localStorage.setItem('isLogin', false);
            this.setState({isLogin: false});
        }
    }

    componentDidMount() {
        // this.loadBlockChain();
    }

    render() {
        let isLogin = localStorage.getItem('isLogin');
        if (isLogin === 'true') {
            let orgAddress = localStorage.getItem('orgAddress');
            return(
                <div>
                    <nav>
                        <Link to={{
                            pathname: '/'
                        }} style={{marginLeft:"20px", fontSize:"25px"}}>首頁</Link>
                        <Link to={{
                            pathname: '/createPlant'
                        }} style={{marginLeft:"20px", fontSize:"25px"}}>創建案廠</Link>
                        <Link to={{
                            pathname: '/deviceRegisterRequestList'
                        }} style={{marginLeft:"20px", fontSize:"25px"}}>裝置註冊請求列表</Link>
                        <Link to={{
                            pathname: '/requestApproveDeviceForm'
                        }} style={{marginLeft:"20px", fontSize:"25px"}}>裝置審核請求/列表</Link>
                        <Link to={{
                            pathname: '/power'
                        }} style={{marginLeft:"20px", fontSize:"25px"}}>電量列表</Link>
                        <Link to={{
                            pathname: '/reducePower'
                        }} style={{marginLeft:"20px", fontSize:"25px"}}>申請憑證請求列表</Link>
                        <br />
                        <br />
                        <button className="btn btn-secondary" type="button" name="logout" onClick = {this.handleSubmit}>登出</button>
                    </nav>
                    <h1 style={{textAlign: "center"}}>Org Address: {orgAddress}</h1>
                    <br />
                    <br />
                    <GetOrgToken />
                    <br />
                    <br />
                    <ClaimCertificate />
                    <br />
                    <br />
                    <TokenTransfer />
                    <br />
                    <br />
                    <TraceToken />
                    <br />
                    <br />
                    <TraceTokenTransfer />
                </div>
            );
        } else {
            return (<Redirect to={{
                pathname: '/unloginHome'
            }} />);
        }
    }
}

export default Home;