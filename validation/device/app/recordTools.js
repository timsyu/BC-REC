class RecordTools {
    constructor(web3, account, privateKey, config) {
        this.web3 = web3;
        this.account = account;
        this.privateKey = privateKey;
        this.config = config;
    }

    checkDeviceVerifiedByIssuer = async(plantAddress) => {
        const web3 = this.web3;
        const plant = this.config.plant;

        const plantContract = new web3.eth.Contract(plant.abi, plantAddress);
        const device = await plantContract.methods.getDevice(this.account).call();
        let state = device.state;  // 0 -> none, 1 -> Idel, 2 -> pending, 3 -> approve, 4 -> disapprove
        if (state == 3) {
            return {'isVerified': true, 'state': state};
        }
        return {'isVerified': false, 'state': state};
    }

    #singalRecord = async (plantAddress, date, value) => {
        const web3 = this.web3;
        const BN = web3.utils.BN;
        const plant = this.config.plant;

        const plantContract = new web3.eth.Contract(plant.abi, plantAddress);
        const dataAbi = plantContract.methods.record(date, value).encodeABI();
        let gasPrice = await web3.eth.getGasPrice();
        let nonce = await web3.eth.getTransactionCount(this.account);
        let tx = await web3.eth.accounts.signTransaction({
            nonce: `0x${new BN(nonce).toString(16)}`,
            value: `0x0`,
            to: plantAddress,
            data: dataAbi,
            gasLimit: `0x${new BN("2000000").toString(16)}`,
            gasPrice: `0x${new BN(gasPrice).toString(16)}`
        }, this.privateKey);

        var rawTx = tx.rawTransaction;
        let powerId = '';
        let txHash = '';
        let success = false;
        try {
            let receipt = await web3.eth.sendSignedTransaction(rawTx);
            const topic = receipt.logs[0].topics[1];
            powerId = web3.eth.abi.decodeParameter('uint', topic);
            txHash = receipt.transactionHash;
            success = true;
        } catch (error) {
            console.log(error);
        }
        
        return {'recordResult': success, 'powerId': powerId,'txHash': txHash};
    }

    #bindPowerAndTxHash = async(plantAddress, powerId, txHash) => {
        const web3 = this.web3;
        const BN = web3.utils.BN;
        const plant = this.config.plant;

        const plantContract = new web3.eth.Contract(plant.abi, plantAddress);
        const dataAbi = plantContract.methods.bindPowerAndTxHash(powerId, txHash).encodeABI();
        let gasPrice = await web3.eth.getGasPrice();

        let nonce = await web3.eth.getTransactionCount(this.account);
        let tx = await web3.eth.accounts.signTransaction({
            nonce: `0x${new BN(nonce).toString(16)}`,
            value: `0x0`,
            to: plantAddress,
            data: dataAbi,
            gasLimit: `0x${new BN("2000000").toString(16)}`,
            gasPrice: `0x${new BN(gasPrice).toString(16)}`
        }, this.privateKey);

        var rawTx = tx.rawTransaction;
        let bindTxHash = '';
        let success = false;
        try {
            let receipt = await web3.eth.sendSignedTransaction(rawTx);
            bindTxHash = receipt.transactionHash;
            success = true;
        } catch (error) {
            console.log(error);
        }
        
        return {'bindResult': success,'bindTxHash': bindTxHash};
    }

    record = async(plantAddress, date, value) => {
        const {recordResult, powerId, txHash} = await this.#singalRecord(plantAddress, date, value);
        let txHash2 = '';
        if (recordResult) {
            const {bindResult, bindTxHash} = await this.#bindPowerAndTxHash(plantAddress, powerId, txHash);
            txHash2 = bindTxHash;
        }
        return { "recordResult": recordResult, "powerId": powerId, "recordTxHash": txHash, "bindTxHash": txHash2};
    }
}

module.exports = RecordTools;