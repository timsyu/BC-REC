class DeviceVerificationTools {
    constructor(web3, account, privateKey,config) {
        this.web3 = web3;
        this.account = account;
        this.privateKey = privateKey;
        this.config = config;
    }

    #approveDeviceRequest = async(requestId, approve) => {
        const issuer = this.config.issuer;
        const issuerContract = new this.web3.eth.Contract(issuer.abi, issuer.address);
        const dataAbi = issuerContract.methods.approveDeviceRequest(requestId, approve).encodeABI();
        let gasPrice = await this.web3.eth.getGasPrice();

        let nonce = await this.web3.eth.getTransactionCount(this.account);
        let tx = await this.web3.eth.accounts.signTransaction({
            nonce: `0x${new this.web3.utils.BN(nonce).toString(16)}`,
            value: `0x0`,
            to: issuer.address,
            data: dataAbi,
            gasLimit: `0x${new this.web3.utils.BN("2000000").toString(16)}`,
            gasPrice: `0x${new this.web3.utils.BN(gasPrice).toString(16)}`
        }, this.privateKey);
        
        var rawTx = tx.rawTransaction;
        let receipt = await this.web3.eth.sendSignedTransaction(rawTx);

        return receipt.transactionHash;
    }

    // approve all device verification request
    verify = async() => {
        const issuer = this.config.issuer;
        // listen device request
        const issuerContract = new this.web3.eth.Contract(issuer.abi, issuer.address);
        let requests = await issuerContract.methods.getAllDeviceRequest().call();
        for (let i = 0; i < requests.length; i++) {
            let request = requests[i];
            let requestId = request.id;
            let orgAddress = request.orgContract;
            let deviceId = request.deviceAccount;
            let location = request.deviceLocation;
            console.log("requestId: ",requestId);
            console.log("orgAddress: ",orgAddress);
            console.log("deviceId: ",deviceId);
            console.log("location: ",location);
            try {
                let approve = true;
                let txHash = await this.#approveDeviceRequest(requestId, approve);
                console.log("approve: ", approve);
                console.log("txHash: ", txHash);
            } catch (error) {
                console.log(error);
            } 
        }
    }
}

module.exports = DeviceVerificationTools;