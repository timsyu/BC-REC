class CertificateRequestTools {
    constructor(web3, account, privateKey, config) {
        this.web3 = web3;
        this.account = account;
        this.privateKey = privateKey;
        this.config = config;
    }
    
    #checkPowerExist = async (plantId, powerIds) => {
        const plant = this.config.plant;
        let plantContract = new this.web3.eth.Contract(plant.abi, plantId);

        if (powerIds.length == 0) {
            return false;
        }
        let allExist = true;
        let oriValueMap = new Map();
        for (let i = 0; i < powerIds.length; i++) {
            let exist = false;
            await plantContract.getPastEvents('RecordEvent', {
                filter: {powerId: powerIds[i]},
                fromBlock: 0
            }, function(error, events){
                if (!error && events.length > 0) {
                    let event = events[0];
                    // console.log(event);
                    exist = true;
                    let v = event.returnValues.value;
                    oriValueMap.set(powerIds[i], v);
                }
            }); 
            if (!exist) {
                allExist = false;
                break;
            }
        }
        if (allExist) {
            return {'allExist': true, 'oriValueMap': oriValueMap};
        } else {
            return {'allExist': false, 'oriValueMap': []};
        }
    }
    
    #checkPowerOveruse = async(certificateRequest, oriValueMap) => {
        const issuer = this.config.issuer;
        const issuerContract = new this.web3.eth.Contract(issuer.abi, issuer.address);

        let number = certificateRequest.number;
        let powerIds = certificateRequest.powerIds;
        // let values = certificateRequest.values;
        let values = certificateRequest[5];
        let plantId = certificateRequest.plantId;
        // console.log(certificateRequest);
        for (let i = 0; i < number; i++) {
            let pIds = powerIds[i];
            let vs = values[i];
            for (let j = 0; j < pIds.length; j++) {
                let pId = pIds[j];
                let v = vs[j];
                await issuerContract.getPastEvents('PowerReqCertEvent', {
                    filter: {plantId: plantId, powerId: pId},
                    fromBlock: 0
                }, function(error, events){
                    if (!error && events.length > 0) {
                        // console.log(events)
                        let event = events[0];
                        let value = event.returnValues.value;
                        let remain = parseInt(oriValueMap.get(pId)) - value;
                        oriValueMap.set(pId, remain);
                    }
                });
                if (parseInt(oriValueMap.get(pId)) < v) {
                    return true;
                }
            }
        }
        return false;
    }
    
    #checkPowerEnough = (number, values) => {
        const target = 1000;
        for(let i = 0; i < number; i++) {
            let vs = values[i];
            let total = 0;
            for(let j = 0; j < vs.length; j++) {
                total += parseInt(vs[j]);
            }
            if(target != total) {
                return false;
            }
        }
        return true;
    }
    
    #approveCertificateRequest = async(requestId, valid) => {
        const issuer = this.config.issuer;
        const issuerContract = new this.web3.eth.Contract(issuer.abi, issuer.address);
        
        const dataAbi = issuerContract.methods.approveCertificateRequest(requestId, valid).encodeABI();
        let gasPrice = await this.web3.eth.getGasPrice();
        let nonce = await this.web3.eth.getTransactionCount(this.account);

        let tx = await this.web3.eth.accounts.signTransaction({
            nonce: `0x${new this.web3.utils.BN(nonce).toString(16)}`,
            value: `0x0`,
            to:  issuer.address,
            data: dataAbi,
            gasLimit: `0x${new this.web3.utils.BN("2000000").toString(16)}`,
            gasPrice: `0x${new this.web3.utils.BN(gasPrice).toString(16)}`
        },  this.privateKey);

        var rawTx = tx.rawTransaction;
        let receipt = await  this.web3.eth.sendSignedTransaction(rawTx);

        let gasUsed = receipt.gasUsed;
        return {'txHash': receipt.transactionHash,'gasUsed': gasUsed};
    }

    #singalValidate = async(request) => {
        
        let number = request.number;
        let plantId = request.plantId;
        
        let allPowerIds = [];
        for (let i = 0; i < number; i++) {
            let powerIds = request.powerIds[i];
            for (let j = 0; j < powerIds.length; j++) {
                allPowerIds.push(powerIds[j]);
            }
        }
        // filiter duplicate power id
        let filteredAllPowerIds = allPowerIds.filter(function(ele, pos) {
            return allPowerIds.indexOf(ele) == pos;
        });

        let { allExist, oriValueMap } = await this.#checkPowerExist(plantId, filteredAllPowerIds);
        let valid = false;
        if (allExist) {
            let overuse = await this.#checkPowerOveruse(request, oriValueMap);
            if (!overuse) {
                // let values = request.values;
                let values = request[5];
                let enough = this.#checkPowerEnough(number, values);
                if(enough) {
                    valid = true;
                }
            }
        }
        return valid;
    }

    
    validate = async() => {
        const issuer = this.config.issuer;
        // listen device request
        const issuerContract = new this.web3.eth.Contract(issuer.abi, issuer.address);
        let requests = await issuerContract.methods.getAllCertificateRequest().call();
        for (let i = 0; i < requests.length; i++) {
            let request = requests[i];
            let requestId = request.id;
            let number = request.number;
            let orgId = request.orgId;
            let plantId = request.plantId;
            let powerIds = request.powerIds;
            let values = request[5];
            let metadataUri = request.metadataUri;
            console.log("requestId: ",requestId);
            console.log("orgId: ",orgId);
            console.log("number: ",number);
            console.log("plantId: ",plantId);
            console.log("powerIds: ",powerIds);
            console.log("values: ",values);
            console.log("metadataUri: ",metadataUri);
            try {
                let valid = await this.#singalValidate(request);
                console.log("valid: ", valid);
                console.log("sending tx");
                let {txHash, gasUsed} = await this.#approveCertificateRequest(requestId, valid);
                console.log("txHash: ", txHash);
                console.log("gasUsed: ", gasUsed);
            } catch (error) {
                console.log(error);
            } 
        }
    }
}

module.exports = CertificateRequestTools;