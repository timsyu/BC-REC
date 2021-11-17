class RegisterTools {
    constructor(web3, account, privateKey, config) {
        this.web3 = web3;
        this.account = account;
        this.privateKey = privateKey;
        this.config = config;
    }

    // in register queue or registered
    checkRegister = async(orgAddress, plantAddress) => {
        const web3 = this.web3;
        const org = this.config.org;
        const plant = this.config.plant;

        const orgContract = new web3.eth.Contract(org.abi, orgAddress);
        const plantContract = new web3.eth.Contract(plant.abi, plantAddress);

        const allDeviceRegisterRequest = await orgContract.methods.getAllDeviceRegisterRequest().call();
        for (let i = 0; i < allDeviceRegisterRequest.length; i++) {
            let request = allDeviceRegisterRequest[i];
            let deviceId = request.deviceId;
            if (deviceId == this.account) {
                return true;
            }
        }

        const device = await plantContract.methods.getDevice(this.account).call();
        let state = device.state; // 0 -> none, 1 -> pending, 2 -> approve, 3 -> disapprove
        if (state != 0) {
            return true;
        }
        return false;
    }

    register = async(orgAddress, plantAddress) => {
        const web3 = this.web3;
        const BN = web3.utils.BN;
        const org = this.config.org;
        // init org contract
        const orgContract = new web3.eth.Contract(org.abi, orgAddress);
        // request Org register Device
        const dataAbi = orgContract.methods.registerDevice(plantAddress).encodeABI();
        let gasPrice = await web3.eth.getGasPrice();

        let nonce = await web3.eth.getTransactionCount(this.account);
        let tx = await web3.eth.accounts.signTransaction({
            nonce: `0x${new BN(nonce).toString(16)}`,
            value: `0x0`,
            to: orgAddress,
            data: dataAbi,
            gasLimit: `0x${new BN("2000000").toString(16)}`,
            gasPrice: `0x${new BN(gasPrice).toString(16)}`
        }, this.privateKey);

        var rawTx = tx.rawTransaction;
        let receipt = await web3.eth.sendSignedTransaction(rawTx);

        return receipt.transactionHash;
    }

}

module.exports = RegisterTools;