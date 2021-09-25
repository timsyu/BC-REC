const Web3 = require("web3");
const Org = require('./resource/org.json');
const Plant = require('./resource/plant.json');
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
        const wallet = await walletTools.init();
        const account = wallet.address;
        const privateKey = wallet.privateKey;
        console.log("account: ", account);
        console.log("privateKey: ", privateKey);
        // get balance
        var balance = await web3.eth.getBalance(account);
        balance = web3.utils.fromWei(balance, 'ether');
        console.log("balance: ", balance," ether");
        // init org contract
        const org = new web3.eth.Contract(Org.abi, Org.address);
        // request Org register Device
        const data_abi = org.methods.registerDevice(Plant.address).encodeABI();
        let gasPrice = await web3.eth.getGasPrice();
        // gasPrice = parseInt(gasPrice) * 1.50;
        // console.log("gasPrice: ", gasPrice, "wei");
        // console.log("gasLimit: ", 2000000, "wei");

        web3.eth.getTransactionCount(account).then( nonce => {
            web3.eth.accounts.signTransaction({
                nonce: `0x${new BN(nonce).toString(16)}`,
                value: `0x0`,
                to: Org.address,
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