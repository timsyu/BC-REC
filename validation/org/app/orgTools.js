class OrgTools {
    constructor(web3, account, privateKey, config) {
        this.web3 = web3;
        this.account = account;
        this.privateKey = privateKey;
        this.config = config;
    }
    
    createOrg = async(orgName, orgDescription) => {
        const web3 = this.web3;
        const BN = web3.utils.BN;
        const orgManager = this.config.orgManager;
        const issuer = this.config.issuer;
        const token = this.config.token;
        const orgManagerContract = new web3.eth.Contract(orgManager.abi, orgManager.address);

        let dateTime = new Date().getTime();
        const date = Math.floor(dateTime / 1000);
        const dataAbi = orgManagerContract.methods.createOrg(orgName, date, orgDescription, issuer.address, token.address).encodeABI();
        let gasPrice = await web3.eth.getGasPrice();

        let nonce = await web3.eth.getTransactionCount(this.account);
        let tx = await web3.eth.accounts.signTransaction({
            nonce: `0x${new BN(nonce).toString(16)}`,
            value: `0x0`,
            to: orgManager.address,
            data: dataAbi,
            gasLimit: `0x${new BN("4700000").toString(16)}`,
            gasPrice: `0x${new BN(gasPrice).toString(16)}`
        }, this.privateKey);

        var rawTx = tx.rawTransaction;
        let receipt = await web3.eth.sendSignedTransaction(rawTx);
        let txHash = receipt.transactionHash;
        // console.log(receipt);
        const result = receipt.logs[1].data;
        let orgAddress = web3.eth.abi.decodeParameter('address', result);
        return {'txHash': txHash, 'orgAddress': orgAddress};
    }

    createPlant = async(orgAddress, plantName, plantDescription) => {
        const web3 = this.web3;
        const org = this.config.org;
        const BN = web3.utils.BN;

        const orgContract = new web3.eth.Contract(org.abi, orgAddress);
        const dataAbi = orgContract.methods.createPlant(plantName, plantDescription).encodeABI();
        let gasPrice = await web3.eth.getGasPrice();
        let nonce = await web3.eth.getTransactionCount(this.account);
        let tx = await web3.eth.accounts.signTransaction({
            nonce: `0x${new BN(nonce).toString(16)}`,
            value: `0x0`,
            to: orgAddress,
            data: dataAbi,
            gasLimit: `0x${new BN("4700000").toString(16)}`,
            gasPrice: `0x${new BN(gasPrice).toString(16)}`
        }, this.privateKey);

        var rawTx = tx.rawTransaction;
        let receipt = await web3.eth.sendSignedTransaction(rawTx);
        let txHash = receipt.transactionHash;
        // console.log(receipt);
        const result = receipt.logs[0].data;
        let plantAddress = web3.eth.abi.decodeParameter('address', result);
        return {'txHash': txHash, 'plantAddress': plantAddress};
    }

    getAllDeviceRegisterRequest = async(orgAddress) => {
        const web3 = this.web3;
        const org = this.config.org;

        const orgContract = new web3.eth.Contract(org.abi, orgAddress);
        const result = await orgContract.methods.getAllDeviceRegisterRequest().call();
        return result;
    }

    approveDeviceRegister = async(orgAddress, requestId, capacity, location, imageUrl) => {
        const web3 = this.web3;
        const org = this.config.org;
        const BN = web3.utils.BN;

        let dateTime = new Date().getTime();
        const date = Math.floor(dateTime / 1000);
        const orgContract = new web3.eth.Contract(org.abi, orgAddress);
        const dataAbi = orgContract.methods.approveDeviceRequest(requestId, date, capacity, location, imageUrl).encodeABI();
        let gasPrice = await web3.eth.getGasPrice();
        let nonce = await web3.eth.getTransactionCount(this.account);
        let tx = await web3.eth.accounts.signTransaction({
            nonce: `0x${new BN(nonce).toString(16)}`,
            value: `0x0`,
            to: orgAddress,
            data: dataAbi,
            gasLimit: `0x${new BN("4700000").toString(16)}`,
            gasPrice: `0x${new BN(gasPrice).toString(16)}`
        }, this.privateKey);

        var rawTx = tx.rawTransaction;
        let receipt = await web3.eth.sendSignedTransaction(rawTx);

        return receipt.transactionHash;
    }
    
    getAllPlant = async(orgAddress) => {
        const web3 = this.web3;
        const org = this.config.org;

        const orgContract = new web3.eth.Contract(org.abi, orgAddress);
        const result = await orgContract.methods.getAllPlant().call();
        return result;
    }

    getAllDeviceFromPlant = async(plantAddress) => {
        const web3 = this.web3;
        const plant = this.config.plant;

        let plantContract = new web3.eth.Contract(plant.abi, plantAddress);
        const result = await plantContract.methods.getAllDevice().call();
        return result;
    }

    getAllIdelDeviceFromPlants = async(orgAddress) => {
        const web3 = this.web3;
        const plant = this.config.plant;
        let result = [];
        let allPlantAddress = await this.getAllPlant(orgAddress);
        for (let i = 0; i < allPlantAddress.length; i++) {
            let plantAddress = allPlantAddress[i];
            let devices = await this.getAllDeviceFromPlant(plantAddress);
            let plant = [];
            for (let j = 0; j < devices.length; j++) {
                let device = devices[j];
                let state = device.state;
                if (state == 1) { // Idel
                    let info = {
                        deviceId: device.device,
                        date: device.date,
                        capacity: device.capacity,
                        state: device.state,
                        location: device.location,
                        image: device.image,
                        index: device.index
                    }
                    plant.push(info);
                }
            }
            let plantInfo = {
                plantAddress: plantAddress,
                devices: plant
            }
            result.push(plantInfo);
        }

        return result;
    }

    getAllPowerFromPlant = async(plantAddress) => {
        const web3 = this.web3;
        const plant = this.config.plant;

        let plantContract = new web3.eth.Contract(plant.abi, plantAddress);
        const result = await plantContract.methods.getAllPower().call();
        return result;
    }

    getAllPowerFromPlants = async(orgAddress) => {
        const web3 = this.web3;
        const plant = this.config.plant;
        let result = [];
        let allPlantAddress = await this.getAllPlant(orgAddress);
        for (let i = 0; i < allPlantAddress.length; i++) {
            let plantAddress = allPlantAddress[i];
            let powers = await this.getAllPowerFromPlant(plantAddress);
            let plant = [];
            for (let j = 0; j < powers.length; j++) {
                let power = powers[j];
                let info = {
                    id: power.id,
                    deviceId: power.deviceId,
                    date: power.date,
                    value: power.value,
                    remainValue: power.remainValue,
                    txHash: power.txHash
                }
                plant.push(info);
            }
            let plantInfo = {
                plantAddress: plantAddress,
                powers: plant
            }
            result.push(plantInfo);
        }

        return result;
    }

    requestDeviceVerification = async(orgAddress, plantId, deviceId, deviceLocation) => {
        
        const web3 = this.web3;
        const org = this.config.org;
        const BN = web3.utils.BN;
        const orgContract = new web3.eth.Contract(org.abi, orgAddress);
        const dataAbi = orgContract.methods.requestApproveDevice(plantId, deviceId, deviceLocation).encodeABI();
        let gasPrice = await web3.eth.getGasPrice();

        let nonce = await web3.eth.getTransactionCount(this.account);
        let tx = await web3.eth.accounts.signTransaction({
            nonce: `0x${new BN(nonce).toString(16)}`,
            value: `0x0`,
            to: orgAddress,
            data: dataAbi,
            gasLimit: `0x${new BN("4700000").toString(16)}`,
            gasPrice: `0x${new BN(gasPrice).toString(16)}`
        }, this.privateKey);

        var rawTx = tx.rawTransaction;
        let receipt = await web3.eth.sendSignedTransaction(rawTx);

        return receipt.transactionHash;
    }
    
    #deleteCertificateRequestInOrg = async(orgAddress, requestId) => {
        const web3 = this.web3;
        const org = this.config.org;
        const BN = web3.utils.BN;

        const orgContract = new web3.eth.Contract(org.abi, orgAddress);
        const dataAbi = orgContract.methods.deleteRequestCertificate(requestId).encodeABI();
        let gasPrice = await web3.eth.getGasPrice();

        let nonce = await web3.eth.getTransactionCount(this.account);
        let tx = await web3.eth.accounts.signTransaction({
            nonce: `0x${new BN(nonce).toString(16)}`,
            value: `0x0`,
            to: orgAddress,
            data: dataAbi,
            gasLimit: `0x${new BN("4700000").toString(16)}`,
            gasPrice: `0x${new BN(gasPrice).toString(16)}`
        }, this.privateKey);

        var rawTx = tx.rawTransaction;
        let receipt = await web3.eth.sendSignedTransaction(rawTx);

        return receipt.transactionHash;
    }
    
    requestCertificate = async(orgAddress, number, plantId, powerIds, values, metadataUri) => {
        const web3 = this.web3;
        const org = this.config.org;
        const BN = web3.utils.BN;

        const orgContract = new web3.eth.Contract(org.abi, orgAddress);
        const dataAbi = orgContract.methods.requestCertificate(number, plantId, powerIds, values, metadataUri).encodeABI();
        let gasPrice = await web3.eth.getGasPrice();

        let nonce = await web3.eth.getTransactionCount(this.account);
        let tx = await web3.eth.accounts.signTransaction({
            nonce: `0x${new BN(nonce).toString(16)}`,
            value: `0x0`,
            to: orgAddress,
            data: dataAbi,
            gasLimit: `0x${new BN("4700000").toString(16)}`,
            gasPrice: `0x${new BN(gasPrice).toString(16)}`
        }, this.privateKey);

        var rawTx = tx.rawTransaction;
        let receipt = await web3.eth.sendSignedTransaction(rawTx);
        let txHash = receipt.transactionHash;
        const logs = receipt.logs;
        let requestId = '';
        let tokenIds = [];
        let topicHash = web3.utils.keccak256("CertificateEvent(uint256,uint256,address,address,uint256[],uint256[])");
        for (let i = 0; i < logs.length; i++) {
            let topics = logs[i].topics;
            if (topics[0] == topicHash) {
                requestId = web3.eth.abi.decodeParameter('uint256', topics[1]);
                let tokenId = web3.eth.abi.decodeParameter('uint256', topics[2]);
                tokenIds.push(tokenId);
            }
        }

        return {
            'txHash': txHash,
            'requestId': requestId,
            'tokenIds': tokenIds,
        };
    }

    #reducePower = async(orgAddress, requestId) => {
        const web3 = this.web3;
        const org = this.config.org;
        const BN = web3.utils.BN;
        const orgContract = new web3.eth.Contract(org.abi, orgAddress);
        const dataAbi = orgContract.methods.reducePower(requestId).encodeABI();
        let gasPrice = await web3.eth.getGasPrice();

        let nonce = await web3.eth.getTransactionCount(this.account);
        let tx = await web3.eth.accounts.signTransaction({
            nonce: `0x${new BN(nonce).toString(16)}`,
            value: `0x0`,
            to: orgAddress,
            data: dataAbi,
            gasLimit: `0x${new BN("4700000").toString(16)}`,
            gasPrice: `0x${new BN(gasPrice).toString(16)}`
        }, this.privateKey);

        var rawTx = tx.rawTransaction;
        let receipt = await web3.eth.sendSignedTransaction(rawTx);

        return receipt.transactionHash;
    }

    reducePowerListener = (orgAddress) => {
        const web3 = this.web3;
        const org = this.config.org;
        const issuer = this.config.issuer;
        // listen certificate request
        const orgContract = new web3.eth.Contract(org.abi, orgAddress);
        const issuerContract = new web3.eth.Contract(issuer.abi, issuer.address);
        let that = this;
        console.log("---listening certificate request---");
        issuerContract.events.CertificateRequestApprovedEvent({
            fromBlock: 0
        })
        .on("connected", function(subscriptionId){
            console.log("subscriptionId: ",subscriptionId);
        })
        .on('data', async function(event){
            
            try {
                let requestId = event.returnValues.requestId;
                let approve = event.returnValues.approve;
                let data = await orgContract.methods.getAllCertificateRequest().call();
                for (let i = 0; i < data.length; i++) {
                    const request = data[i];
                    let id = request.id;
                    if (requestId == id) {
                        console.log("approve: ", approve);
                        if (approve) {
                            console.log("reduce power");
                            let txHash = await that.#reducePower(orgAddress, requestId);
                            console.log("txHash: ", txHash);
                        } else {
                            console.log("delete certificate reqest in org contract");
                            let txHash = await that.#deleteCertificateRequestInOrg(orgAddress, requestId);
                            console.log("txHash: ", txHash);
                        }
                    }
                }
                
            } catch (error) {
                console.log(error);
            } 
        })
        .on('changed', function(event){
            // remove event from local database
        })
        .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            console.log(error);
        });
    }

    getCertificate = async(tokenId) => {
        let web3 = new Web3(config.provider.twcc_besu); 
        const token = this.config.token;
        // listen certificate request
        const tokenContract = new web3.eth.Contract(token.abi, token.address);
        let certInfo = await tokenContract.methods.getCertificate(tokenId).call();
        return {
            tokenId: certInfo[0],
            orgId: certInfo[1],
            plantId: certInfo[2],
            isClaim: certInfo[3],
            metadataUri: certInfo[4],
            powerIds: certInfo[5],
            values: certInfo[6]
        };
    }
}

module.exports = OrgTools;

