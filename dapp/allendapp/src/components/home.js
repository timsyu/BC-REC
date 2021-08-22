import React, { Component } from 'react';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {load: false};

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

    render() {
        return(
            <div>
                <p>首頁</p>
                <div className="input-group mb-3">
                    <button className="btn btn-secondary" type="button" onClick = {this.handleSubmit}>Create</button>
                </div>
            </div>
        );
    }
}

export default Home;