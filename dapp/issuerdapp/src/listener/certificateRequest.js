const Web3 = require("web3");
const WalletTools = require("./walletTools");

// const web3 = new Web3('https://besu-allen-704319b4e1-node-2aae4c9e.baas.twcc.ai');
const web3 = new Web3('wss://besu-allen-704319b4e1-node-2aae4c9e.baas.twcc.ai/json-rpc/ws');
const BN = web3.utils.BN;
const Issuer = require('../resource/issuer.json');
const Plant = require('../resource/plant.json');

async function checkPowerExist(plant, powerIds) {
    if (powerIds.length == 0) {
        return false;
    }
    let allExist = true;
    let oriValueMap = new Map();
    for (let i = 0; i < powerIds.length; i++) {
        let exist = false;
        await plant.getPastEvents('RecordEvent', {
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

async function checkPowerOveruse(issuer, certificateRequest, oriValueMap) {
    // let overuse = false;
    let number = certificateRequest.number;
    let powerIds = certificateRequest.powerIds;
    // let values = certificateRequest.values;
    let values = certificateRequest[5];
    // console.log(values);
    for (let i = 0; i < number; i++) {
        let pIds = powerIds[i];
        let vs = values[i];
        for (let j = 0; j < pIds.length; j++) {
            let pId = pIds[j];
            let v = vs[j];
            await issuer.getPastEvents('PowerReqCertEvent', {
                filter: {powerId: pId},
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
                // overuse = true;
                return true;
            }
        }
    }
    return false;
}

function checkPowerEnough(number, values) {

    const target = 111;
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

async function approveCertificateRequest(issuer, issuerAddress, account, privateKey, requestId, valid) {
    const dataAbi = issuer.methods.approveCertificateRequest(requestId, valid).encodeABI();
    let gasPrice = await web3.eth.getGasPrice();
    // gasPrice = parseInt(gasPrice) * 1.50;
    // console.log("gasPrice: ", gasPrice, "wei");
    // console.log("gasLimit: ", 2000000, "wei");
    let nonce = await web3.eth.getTransactionCount(account);
    // console.log(nonce);
    let tx = await web3.eth.accounts.signTransaction({
        nonce: `0x${new BN(nonce).toString(16)}`,
        value: `0x0`,
        to: issuerAddress,
        data: dataAbi,
        gasLimit: `0x${new BN("2000000").toString(16)}`,
        gasPrice: `0x${new BN(gasPrice).toString(16)}`
    }, privateKey);
    // console.log(tx);
    var rawTx = tx.rawTransaction;
    let receipt = await web3.eth.sendSignedTransaction(rawTx);
    // console.log(receipt);
    return receipt.transactionHash;
}

async function main() {
    
    const network = await web3.eth.net.getNetworkType();
    console.log("network: ", network);
    const walletTools = new WalletTools();
    try {
        // init wallet, account
        const wallet = await walletTools.init();
        const account = wallet.address;
        const privateKey = wallet.privateKey;
        console.log("account: ", account);
        console.log("privateKey: ", privateKey);
        // get balance
        var balance = await web3.eth.getBalance(account);
        balance = web3.utils.fromWei(balance, 'ether');
        console.log("balance: ", balance," ether");
        
        // listen certificate request
        const issuer = new web3.eth.Contract(Issuer.abi, Issuer.address);
        console.log("---listening certificate request---");
        issuer.events.CertificateRequestEvent({
            fromBlock: 0
        }, function(error, event){ console.log("event"); })
        issuer.events.CertificateRequestEvent({
            fromBlock: 0
        }, function(error, event){ console.log("event"); })
        .on("connected", function(subscriptionId){
            console.log("subscriptionId: ",subscriptionId);
        })
        .on('data', async function(event){
            // console.log(event); // same results as the optional callback above
            let requestId = event.returnValues.requestId;
            try {
                let certificateRequest = await issuer.methods.getCertificateRequest(requestId).call();
                let number = certificateRequest.number;
                let plantId = certificateRequest.plantId;
                let plant = new web3.eth.Contract(Plant.abi, plantId);
                let allPowerIds = [];
                for (let i = 0; i < number; i++) {
                    let powerIds = certificateRequest.powerIds[i];
                    for (let j = 0; j < powerIds.length; j++) {
                        allPowerIds.push(powerIds[j]);
                    }
                }
                // filiter duplicate power id
                let filteredAllPowerIds = allPowerIds.filter(function(ele, pos) {
                    return allPowerIds.indexOf(ele) == pos;
                });
    
                let { allExist, oriValueMap } = await checkPowerExist(plant, filteredAllPowerIds);
                let valid = false;
                // console.log(allExist);
                // console.log(oriValueMap);
                if (allExist) {
                    // console.log(certificateRequest);
                    let overuse = await checkPowerOveruse(issuer, certificateRequest, oriValueMap);
                    // console.log(overuse);
                    if (!overuse) {
                        // let values = certificateRequest.values;
                        let values = certificateRequest[5];
                        let enough = checkPowerEnough(number, values);
                        if(enough) {
                            valid = true;
                        }
                    }
                }
                console.log("valid:", valid);
                console.log("sending");
                let txHash = await approveCertificateRequest(issuer, Issuer.address, account, privateKey, requestId, valid);
                console.log("txHash:", txHash);
            } catch (error) {
                console.log("Certificate Request id", requestId, "is not in storage");
            } 
        })
        .on('changed', function(event){
            // remove event from local database
        })
        .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            console.log(error);
        });
    } catch (err) {
        console.error(err);
    }
}

main();