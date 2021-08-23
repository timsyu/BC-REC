import React, { Component } from 'react';
import { Link, Redirect } from "react-router-dom";

class Home extends Component {
    constructor(props) {
        super(props);
        console.log("Home constructor");
        this.state = {auth: false};
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
            this.setState({isLogin: false});
        }
    }
    componentDidMount() {
        // this.loadBlockChain();
    }

    render() {
        if(this.props.location.state) {
            let isLogin = this.props.location.state.isLogin;
            console.log("Home-render", isLogin);
            if (isLogin) {
                return(
                    <div>
                        <nav>
                            <Link to={{
                                pathname: '/',
                                state: { isLogin: true }
                            }} style={{marginLeft:"20px"}}>首頁</Link>
                            <Link to={{
                                pathname: '/createOrg',
                                state: { isLogin: true }
                            }} style={{marginLeft:"20px"}}>創建組織</Link>
                            <button className="btn btn-secondary" type="button" name="logout" onClick = {this.handleSubmit}>登出</button>
                        </nav> 
                        <p>首頁</p>
                        <div className="input-group mb-3">
                            <button className="btn btn-secondary" type="button" onClick = {this.handleSubmit}>Create</button>
                        </div>
                    </div>
                );
            } else {
                return (<Redirect to={{
                    pathname: '/unloginHome',
                    state: { isLogin: false }
                }} />);
            }
        }
    }
}

export default Home;