class DeployContractTools {
    constructor(web3, account, privateKey, config) {
        this.web3 = web3;
        this.account = account;
        this.privateKey = privateKey;
        this.config = config;
    }

    #deployOrgManager = async() => {
        const web3 = this.web3;
        let orgManager = this.config.orgManager;
        const orgManagerContract = new web3.eth.Contract(orgManager.abi);
    
        const dataAbi = orgManagerContract.deploy({
            data: orgManager.bytecode,
            arguments: []
        }).encodeABI();
        
        let gasPrice = await web3.eth.getGasPrice();
        
        let nonce = await web3.eth.getTransactionCount(this.account);
        let tx = await web3.eth.accounts.signTransaction({
            nonce: `0x${new web3.utils.BN(nonce).toString(16)}`,
            value: `0x0`,
            data: dataAbi,
            gasLimit: `0x${new web3.utils.BN("4700000").toString(16)}`,
            gasPrice: `0x${new web3.utils.BN(gasPrice).toString(16)}`
        }, this.privateKey);
        
        var rawTx = tx.rawTransaction;
        let receipt = await web3.eth.sendSignedTransaction(rawTx);
        const txHash = receipt.transactionHash;
        const orgManagerAddress = receipt.contractAddress;
        const gasUsed = receipt.gasUsed;
    
        return {txHash,orgManagerAddress,gasUsed};
    }

    #deployIssuer = async(orgManagerAddress) => {
        const web3 = this.web3;
        let issuer = this.config.issuer;
        const issuerContract = new web3.eth.Contract(issuer.abi);
    
        const dataAbi = issuerContract.deploy({
            data: issuer.bytecode,
            arguments: [orgManagerAddress]
        }).encodeABI();
        
        let gasPrice = await web3.eth.getGasPrice();
        
        let nonce = await web3.eth.getTransactionCount(this.account);
        let tx = await web3.eth.accounts.signTransaction({
            nonce: `0x${new web3.utils.BN(nonce).toString(16)}`,
            value: `0x0`,
            data: dataAbi,
            gasLimit: `0x${new web3.utils.BN("4700000").toString(16)}`,
            gasPrice: `0x${new web3.utils.BN(gasPrice).toString(16)}`
        }, this.privateKey);
        
        var rawTx = tx.rawTransaction;
        let receipt = await web3.eth.sendSignedTransaction(rawTx);
        const txHash = receipt.transactionHash;
        const issuerAddress = receipt.contractAddress;
        const gasUsed = receipt.gasUsed;

        return {txHash,issuerAddress,gasUsed};
    }


    #getNFTAddress = async(issuerAddress) => {
        const web3 = this.web3;
        let issuer = this.config.issuer;
        let nft = this.config.nft;
        const issuerContract = new web3.eth.Contract(issuer.abi, issuerAddress);
    
        const nftAddress = issuerContract.methods.getNFTContract().call();

        return nftAddress;
    }

    deploy = async() => {
        let data =  await this.#deployOrgManager();
        let orgManagerAddress = data.orgManagerAddress;
        let issuerAddress;
        let nftAddress;
        let success = false;
        if (orgManagerAddress) {
            let data2 =  await this.#deployIssuer(orgManagerAddress);
            issuerAddress = data2.issuerAddress;
            if (issuerAddress) {
                nftAddress = await this.#getNFTAddress(issuerAddress);
                if (nftAddress) {
                    success = true;
                }
            }
        }
        return {success, orgManagerAddress, issuerAddress, nftAddress};
    }
}

module.exports = DeployContractTools;