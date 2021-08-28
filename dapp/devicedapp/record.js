const Web3 = require("web3");
const { OrgAbi } = require("./resourse/abi/org");
const { PlantAbi } = require("./resourse/abi/plant");
const { OrgAddress, PlantAddress} = require("./resourse/address/contractAddress");
const WalletTools = require("./walletTools");

async function main() {
    // const web3 = new Web3(Web3.givenProvider ||'https://ropsten.infura.io/v3/4d6cbd5116f74b6eb0f688f165b87286');
    const web3 = new Web3(Web3.givenProvider ||'https://besu-allen-704319b4e1-node-2aae4c9e.baas.twcc.ai');
    const network = await web3.eth.net.getNetworkType();
    console.log("network: ", network);
    const walletTools = new WalletTools();
    try {
        const BN = web3.utils.BN;
        // init wallet, account
        // const account = '0xdF8F0e43F20f3c2079cb57Bc868fC169EEC196C1';
        // const privateKey = 'bf1b7a1b3d2ca43669172d21abd1b0db75838a99929e1af1bc763b3dd0fc6b42';
        const wallet = await walletTools.init();
        const account = wallet.address;
        const privateKey = wallet.privateKey;
        console.log("account: ", account);
        console.log("privateKey: ", privateKey);
        // get balance
        var balance = await web3.eth.getBalance(account);
        balance = web3.utils.fromWei(balance, 'ether');
        console.log("balance: ", balance," ether");
        // init plant contract
        const plantAddress = PlantAddress;
        // test power value
        let value = 333;
        const plant = new web3.eth.Contract(PlantAbi, plantAddress);
        // Device record power
        let dateTime = new Date().getTime();
        const date = Math.floor(dateTime / 1000);

        const data_abi = plant.methods.record(date, value).encodeABI();
        let gasPrice = await web3.eth.getGasPrice();
        // gasPrice = parseInt(gasPrice) * 1.50;
        // console.log("gasPrice: ", gasPrice, "wei");
        // console.log("gasLimit: ", 2000000, "wei");
        let powerId = '';
        let txHash = '';
        await web3.eth.getTransactionCount(account).then( nonce => {
            web3.eth.accounts.signTransaction({
                nonce: `0x${new BN(nonce).toString(16)}`,
                value: `0x0`,
                to: plantAddress,
                data: data_abi,
                gasLimit: `0x${new BN("2000000").toString(16)}`,
                gasPrice: `0x${new BN(gasPrice).toString(16)}`
            }, privateKey)
            .then(tx => {
                var rawTx = tx.rawTransaction;
                // console.log(rawTx);
                web3.eth.sendSignedTransaction(rawTx)
                .on('sending', function(confirmationNumber, receipt){
                    console.log('sending');
                })
                .on('receipt', function(receipt){
                    // console.log(receipt);
                    txHash = receipt.transactionHash;
                    console.log("transactionHash: ", txHash);
                    const topic = receipt.logs[0].topics[1];
                    powerId = web3.eth.abi.decodeParameter('uint', topic);
                    console.log("powerId: ", powerId);
                })
                .on('error', function(error, receipt) {
                    console.log(error);
                });
            });    
        });

        const dataAbi = plant.methods.bindPowerAndTxHash(powerId, txHash).encodeABI();
        let gasPrice2 = await web3.eth.getGasPrice();
        await web3.eth.getTransactionCount(account).then( nonce => {
            web3.eth.accounts.signTransaction({
                nonce: `0x${new BN(nonce).toString(16)}`,
                value: `0x0`,
                to: plantAddress,
                data: dataAbi,
                gasLimit: `0x${new BN("2000000").toString(16)}`,
                gasPrice: `0x${new BN(gasPrice2).toString(16)}`
            }, privateKey)
            .then(tx => {
                var rawTx = tx.rawTransaction;
                // console.log(rawTx);
                web3.eth.sendSignedTransaction(rawTx)
                .on('sending', function(confirmationNumber, receipt){
                    console.log('sending');
                })
                .on('receipt', function(receipt){
                    // console.log(receipt);
                    const txHash = receipt.transactionHash;
                    console.log("transactionHash: ", txHash);
                })
                .on('error', function(error, receipt) {
                    console.log(error);
                });
            });    
        });
    } catch (err) {
        console.error(err);
    }
}

main();