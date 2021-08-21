window.addEventListener("load", start);

async function start() {
    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
    // init contract address
    const orgManagerAddress = '0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B';
    // init contract abi
    
    // init wallet, create account
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    // init account, contract address
    const account = accounts[0];
    // const account = web3.eth.accounts.create(web3.utils.randomHex(32));
    // const wallet = web3.eth.accounts.wallet.add(account);
    // const keystore = wallet.encrypt(web3.utils.randomHex(32));
    // console.log({
    //     account: account,
    //     wallet: wallet,
    //     keystore: keystore
    // });
    // create Org
    let name = "Org Name";
    let date = getNowTimestamp();
    let description = "Org Description";
    
    const orgManager = new web3.eth.Contract(abi, orgManagerAddress);
    // const orgManager = new web3.eth.Contract(abi, orgManagerAddress, {
    //     from: account, // default from addess
    //     gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
    // });

    orgManager.methods.createOrg(name, date, description)
    .send({from: account})
    .on('sending', function(confirmationNumber, receipt){
       console.log('sending');
    })
    .on('receipt', function(receipt){
        console.log('receipt');
    })
    .on('error', function(error, receipt) {
        console.log(errorc);
    });
}

function getNowTimestamp() {
    let dateTime = new Date().getTime();
    return Math.floor(dateTime / 1000);
}

function traceCreateOrgEvent() {
    let dateTime = new Date().getTime();
    return Math.floor(dateTime / 1000);
}