import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";

class Home extends Component {
    constructor(props) {
        super(props);
        let isLogin = localStorage.getItem('isLogin');
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
            
            return(
                <div>
                    <nav>
                        <Link to={{
                            pathname: '/'
                        }} style={{marginLeft:"20px"}}>首頁</Link>
                        <Link to={{
                            pathname: '/createOrg'
                        }} style={{marginLeft:"20px"}}>創建組織/案廠</Link>
                        <Link to={{
                            pathname: '/deviceRegisterRequestList'
                        }} style={{marginLeft:"20px"}}>裝置註冊請求列表</Link>
                        <Link to={{
                            pathname: '/requestApproveDeviceForm'
                        }} style={{marginLeft:"20px"}}>裝置審核請求</Link>
                        <Link to={{
                            pathname: '/issuer'
                        }} style={{marginLeft:"20px"}}>Issuer介面</Link>
                        <Link to={{
                            pathname: '/power'
                        }} style={{marginLeft:"20px"}}>電量列表</Link>
                        <button className="btn btn-secondary" type="button" name="logout" onClick = {this.handleSubmit}>登出</button>
                    </nav> 
                    <p>Home</p>
                    
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