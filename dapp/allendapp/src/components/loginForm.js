import React, { Component } from 'react';

class LoginFrom extends Component {
    constructor(props) {
        super(props);
        this.state = {account: '', privateKey: ''};
        console.log(props.match.params.id);
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
        this.login();
    }

    async login() {
        
    }

    render() {
        return(
            <div className="input-group mb-3">
                <input type="text" className="form-control" placeholder="account" name="account" value={this.state.account} onChange={this.handleChange}/>
                <input type="text" className="form-control" placeholder="privateKey" name="privateKey" value={this.state.privateKey} onChange={this.handleChange}/>
                <button className="btn btn-secondary" type="button" onClick = {this.handleSubmit}>login</button>
            </div>
        );
    }
}

export default LoginFrom;