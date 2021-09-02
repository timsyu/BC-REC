import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";

class UnloginHome extends Component {
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

    handleSubmit(event) {
        
    }
    componentDidMount() {
        
        // this.loadBlockChain();
    }

    render() {
        let isLogin = localStorage.getItem('isLogin');
        if (isLogin === 'true') {
            return (<Redirect to={{
                pathname: '/home'
            }} />);
        } else {
            return(
                <div>
                    <nav>
                        <Link to={{
                            pathname: '/'
                        }} style={{marginLeft:"20px"}}>首頁</Link>
                        <Link to={{
                            pathname: '/login'
                        }} style={{marginLeft:"20px"}}>登入</Link>
                        {/* <Link to={{
                            pathname: '/register'
                        }} style={{marginLeft:"20px"}}>註冊</Link> */}
                    </nav> 
                    <p>未登入首頁</p>
                    <div className="input-group mb-3">
                        <button className="btn btn-secondary" type="button" onClick = {this.handleSubmit}>Create</button>
                    </div>
                </div>
            );
        }
    }
}

export default UnloginHome;