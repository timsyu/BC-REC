async function main (callback) {
    const ethers = require('ethers');
    const mnemonic = await ethers.utils.HDNode.entropyToMnemonic(ethers.utils.randomBytes(16));
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    console.log(mnemonic);
    console.log(wallet);
}

main();
