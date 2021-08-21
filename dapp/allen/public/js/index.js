window.addEventListener("load", start);

async function start() {
    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
    // init contract address
    const orgManagerAddress = '0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B';
    // init wallet, create account
    const account = web3.eth.accounts.create(web3.utils.randomHex(32));
    const wallet = web3.eth.accounts.wallet.add(account);
    const keystore = wallet.encrypt(web3.utils.randomHex(32));
    console.log({
        account: account,
        wallet: wallet,
        keystore: keystore
    });
    // create Org
    let name = "Org Name";
    let date = getNowTimestamp();
    let description = "Org Description";
    
    const orgManager = new web3.eth.Contract(abi, orgManagerAddress, {
        from: account, // default from addess
        gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
    });
    // get Org address from orgManager.createOrg() return value
    const orgAddress = await orgManager.methods.createOrg(name, date, description);
    // get Org address from orgManager.createOrg()
    const orgAddress = await orgManager.methods.createOrg(name, date, description);

    const org = new web3.eth.Contract(abi, orgAddress, {
        from: account, // default from addess
        gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
    });
}

function getNowTimestamp() {
    let dateTime = new Date().getTime();
    return Math.floor(dateTime / 1000);
}

function trace() {
    let dateTime = new Date().getTime();
    return Math.floor(dateTime / 1000);
}