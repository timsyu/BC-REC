const ethers = require('ethers');
const fs = require('fs');

class WalletTools {
    constructor() {
        this.path = 'wallet_secrets.json';
    }

    async read () {
        const data = await fs.promises.readFile(this.path);
        let obj = JSON.parse(data);
        return obj.signingKey;
    }

    async checkExist () {
    
        if (fs.existsSync(this.path)) {
            // console.log("file exists");
            const wallet = await this.read();
            // const mnemonic = wallet.mnemonic;
            const address = wallet.address;
            // const publicKey = wallet.publicKey;
            const privateKey = wallet.privateKey;
            if (address && privateKey) {
                return true;
            } else {
                return false;
            }
        }
    }
    
    async create () {
        const mnemonic = await ethers.utils.HDNode.entropyToMnemonic(ethers.utils.randomBytes(16));
        const wallet = ethers.Wallet.fromMnemonic(mnemonic);
        // console.log(mnemonic);
        // console.log(wallet);
        let data = JSON.stringify(wallet, null, 2);
    
        await fs.promises.writeFile(this.path, data);
        // console.log('Data written to file');
    }
    
    async init () {
        let exist = await this.checkExist();
        if(!exist){
            await this.create();
        }
        let data = await this.read();
        return data;
    }

    get filePath() {
        return this.path;
    }
}


module.exports = WalletTools;