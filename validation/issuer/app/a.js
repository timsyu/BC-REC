const Web3 = require("web3");
const OrgManager = require(`${__dirname}/resource/orgManager.json`);
const Issuer = require(`${__dirname}/resource/issuer.json`);
const NFT = require(`${__dirname}/resource/nft.json`);
const fs = require('fs');

deployOrgManager = async() => {
    const web3 = new Web3('http://localhost:56651/');
    let orgManager = OrgManager;
    // const orgManagerContract = new web3.eth.Contract(orgManager.abi);

    // const dataAbi = orgManagerContract.deploy({
    //     data: orgManager.bytecode,
    //     arguments: []
    // }).encodeABI();
    
    // let gasPrice = await web3.eth.getGasPrice();

    // let nonce = await web3.eth.getTransactionCount('0x547e41cfCdD3664388D1a4D59F994D75738d5069');
    // console.log(nonce);
    // console.log(gasPrice);
    // let tx = await web3.eth.accounts.signTransaction({
    //     nonce: `0x${new web3.utils.BN(nonce).toString(16)}`,
    //     value: `0x0`,
    //     data: dataAbi,
    //     gasLimit: `0x${new web3.utils.BN("4700000").toString(16)}`,
    //     gasPrice: `0x${new web3.utils.BN(gasPrice).toString(16)}`
    // }, '0xd2c9a69e731b05567293290e9c86b6ec27e67c9759bc1ae0fd10c6adf0ee4c34');
    
    // var rawTx = tx.rawTransaction;
    // let receipt = await web3.eth.sendSignedTransaction(rawTx);
    const txHash = "receipt.transactionHash";
    const orgManagerAddress = "receipt.asdas";
    const gasUsed = "receipt.gasUsed";

    orgManager.address = orgManagerAddress;
    let data = JSON.stringify(orgManager, null, 2);

    fs.writeFileSync(`${__dirname}/resource/OAO.json`, data);

    return {txHash,orgManagerAddress,gasUsed};
}

getNFTAddress = async() => {
    const web3 = new Web3('http://localhost:8545/');
    let issuer = Issuer;
    let nft = NFT;
    const issuerContract = new web3.eth.Contract(issuer.abi, issuer.address);

    const nftAddress = issuerContract.methods.getNFTContract().call();
    
    // nft.address = nftAddress;
    // let data = JSON.stringify(nft, null, 2);
    // console.log(nftAddress);
    // this code maybe move to bash
    // fs.writeFileSync(`${__dirname}/resource/nft.json`, data);

    return nftAddress;
}

main = async() => {
    try {
        let data = await getNFTAddress();
        console.log(data);
    } catch (error) {
        console.log(error);
    }

}
main()