const Web3 = require("web3");
const Plant = require('../resource/plant.json');
const WalletTools = require("./walletTools");
// const web3 = new Web3(Web3.givenProvider ||'https://ropsten.infura.io/v3/4d6cbd5116f74b6eb0f688f165b87286');
const web3 = new Web3(Web3.givenProvider ||'https://besu-allen-704319b4e1-node-2aae4c9e.baas.twcc.ai');
const BN = web3.utils.BN;

async function record(account, privateKey, date, value) {
    const plant = new web3.eth.Contract(Plant.abi, Plant.address);
    const dataAbi = plant.methods.record(date, value).encodeABI();
    let gasPrice = await web3.eth.getGasPrice();
    // gasPrice = parseInt(gasPrice) * 1.50;
    // console.log("gasPrice: ", gasPrice, "wei");
    // console.log("gasLimit: ", 2000000, "wei");
    let nonce = await web3.eth.getTransactionCount(account);
    // console.log(nonce);
    let tx = await web3.eth.accounts.signTransaction({
        nonce: `0x${new BN(nonce).toString(16)}`,
        value: `0x0`,
        to: Plant.address,
        data: dataAbi,
        gasLimit: `0x${new BN("2000000").toString(16)}`,
        gasPrice: `0x${new BN(gasPrice).toString(16)}`
    }, privateKey);
    // console.log(tx);
    var rawTx = tx.rawTransaction;
    let receipt = await web3.eth.sendSignedTransaction(rawTx);
    const topic = receipt.logs[0].topics[1];
    let powerId = web3.eth.abi.decodeParameter('uint', topic);
    let txHash = receipt.transactionHash;
    
    return {'powerId': powerId,'txHash': txHash};
}

async function bindPowerAndTxHash(account, privateKey, powerId, txHash) {
    const plant = new web3.eth.Contract(Plant.abi, Plant.address);
    const dataAbi = plant.methods.bindPowerAndTxHash(powerId, txHash).encodeABI();
    let gasPrice = await web3.eth.getGasPrice();
    // gasPrice = parseInt(gasPrice) * 1.50;
    // console.log("gasPrice: ", gasPrice, "wei");
    // console.log("gasLimit: ", 2000000, "wei");
    let nonce = await web3.eth.getTransactionCount(account);
    // console.log(nonce);
    let tx = await web3.eth.accounts.signTransaction({
        nonce: `0x${new BN(nonce).toString(16)}`,
        value: `0x0`,
        to: Plant.address,
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
        
        // device record power
        // test power value, date
        console.log("---device record power---");
        let value = Math.floor(Math.random() * 100) + 66;
        let dateTime = new Date().getTime();
        const date = Math.floor(dateTime / 1000);
        const { powerId, txHash } = await record(account, privateKey, date, value);
        console.log("transactionHash: ", txHash);
        console.log("powerId: ", powerId);
        // bind device record power and txHash
        console.log("---bind device record power and txHash---");
        const txHash2 = await bindPowerAndTxHash(account, privateKey, powerId, txHash);
        console.log("transactionHash: ", txHash2);
    } catch (err) {
        console.error(err);
    }
}

main();