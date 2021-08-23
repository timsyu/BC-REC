import React, { Component } from 'react';
import { HashRouter , Link, Redirect } from "react-router-dom";

class UnloginHome extends Component {
    constructor(props) {
        super(props);
        let isLogin = false;
        console.log("UnloginHome constructor");
        if(this.props.location.state) {
            console.log("UnloginHome isLogin");
            isLogin = this.props.location.state.isLogin;
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

    handleSubmit(event) {
        // console.log(event);
        // this.setState({
        //     load: true
        // }, () => {
        //     // this.props.actions.getItemsFromThirtParty(input)
        //     this.setState({ load: false })
        // })
    }
    componentDidMount() {
        if(this.props.location.state) {
            this.setState({isLogin: this.props.location.state.isLogin});
        }
        
        // this.loadBlockChain();
    }

    render() {
        console.log("UnloginHome-render: ",this.state.isLogin);
        if (this.state.isLogin) {
            return (<Redirect to={{
                pathname: '/home',
                state: { isLogin: true }
            }} />);
        } else {
            return(
                <div>
                    <nav>
                        <Link to={{
                            pathname: '/',
                            state: { isLogin: false }
                        }} style={{marginLeft:"20px"}}>首頁</Link>
                        <Link to={{
                            pathname: '/login',
                            state: { isLogin: false }
                        }} style={{marginLeft:"20px"}}>登入</Link>
                        <Link to={{
                            pathname: '/register',
                            state: { isLogin: false }
                        }} style={{marginLeft:"20px"}}>註冊</Link>
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