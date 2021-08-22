const ethers = require('ethers');
const fs = require('fs');
const path = 'wallet_secrets.json';

async function checkExist () {
    
    if (fs.existsSync(path)) {
        console.log("file exists");
        const data = await fs.promises.readFile(path);
        let obj = JSON.parse(data);
        // console.log(obj);
        const wallet = obj.signingKey;
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

async function create () {
    const mnemonic = await ethers.utils.HDNode.entropyToMnemonic(ethers.utils.randomBytes(16));
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    // console.log(mnemonic);
    console.log(wallet);
    let data = JSON.stringify(wallet, null, 2);

    await fs.promises.writeFile(path, data);
    console.log('Data written to file');
}

async function main () {
    try {
        let exist = await checkExist();
        if(!exist){
            await create();
        }
    } catch (err) {
        console.error(err);
    }
}

main();
