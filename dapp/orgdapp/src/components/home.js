import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";
import TraceOrgEvent from "./traceOrgEvent";

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
                        }} style={{marginLeft:"20px", fontSize:"25px"}}>首頁</Link>
                        <Link to={{
                            pathname: '/createOrg'
                        }} style={{marginLeft:"20px", fontSize:"25px"}}>創建組織</Link>
                        <br />
                        <br />
                        <button className="btn btn-secondary" type="button" name="logout" onClick = {this.handleSubmit}>登出</button>
                    </nav>
                    <br />
                    <div>
                        <h1 style={{textAlign: "center"}}>組織列表</h1>
                        <TraceOrgEvent />
                    </div>
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