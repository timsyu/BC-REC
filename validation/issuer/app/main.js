const Web3 = require("web3");
// const WalletTools = require("./walletTools");
const DeviceVerificationTools = require(`${__dirname}/deviceVerificationTools`);
const CertificateRequestTools = require(`${__dirname}/certificateRequestTools`);
const DeployContractTools = require(`${__dirname}/deployContractTools`);
const ConfigTools = require(`${__dirname}/configTools`);
const yargs = require('yargs');
const schedule = require('node-schedule');
const keythereum = require("keythereum");
const { Console } = require("console");
const fs = require("fs");
const colors = require('colors/safe');

// set theme
colors.setTheme({
    text: 'grey',
    out: 'cyan',
    info: 'green',
    action: 'yellow',
    debug: ['blue', 'underline'],
    error: 'red'
});

// make a new logger
const myLogger = new Console({
    stdout: fs.createWriteStream(`${__dirname}/out/normalStdout.txt`),
    stderr: fs.createWriteStream(`${__dirname}/out/errStdErr.txt`),
});

// Approve all device verification
verify = async(web3, account, privateKey, config) => {
    console.log("---verify Device start---");
    const deviceVerificationTools = new DeviceVerificationTools(web3, account, privateKey, config);
    let result = await deviceVerificationTools.verify();
    for (let i = 0; i < result.length; i++) {
        let info = result[i];
        let requestId = info.requestId;
        let orgAddress = info.orgAddress;
        let deviceId = info.deviceId;
        let approve = info.approve;
        let txHash = info.txHash;
        myLogger.log(new Date(), colors.action("validate "), "requestId: ", colors.out(requestId), "orgAddress: ", colors.out(orgAddress),
            "deviceId: ", colors.out(deviceId), "approve: ", colors.out(approve), "txHash: ", colors.out(txHash));
    }
}

// Validate and Approve certificate request
validate = async(web3, account, privateKey, config) => {
    console.log("---Certificate validation listener start---");
    const certificateRequestTools = new CertificateRequestTools(web3, account, privateKey, config);
    let result = await certificateRequestTools.validate();
    for (let i = 0; i < result.length; i++) {
        let info = result[i];
        let requestId = info.requestId;
        let number = info.number;
        let valid = info.valid;
        let txHash = info.txHash;
        let gasUsed = info.gasUsed;
        myLogger.log(new Date(), colors.action("validate "), "requestId: ", colors.out(requestId), "number: ", colors.out(number),
            "valid: ", colors.out(valid), "txHash: ", colors.out(txHash), "gasUsed: ", colors.out(gasUsed));
    }
}

// deploy orgManager, issuer(include nft) contract
deploy = async(web3, account, privateKey, config) => {
    // console.log("---deploy smart contracts---");
    const deployContractTools = new DeployContractTools(web3, account, privateKey, config);
    let {success, orgManagerAddress, issuerAddress, nftAddress} = await deployContractTools.deploy();
    myLogger.log(new Date(), "deploy contracts", success);
    if(success) {
        myLogger.log(new Date(), "deploy orgManager contract:", orgManagerAddress);
        myLogger.log(new Date(), "deploy issuer contract:", issuerAddress);
        myLogger.log(new Date(), "deploy nft contract:", nftAddress);
    }
    console.log(success);
    console.log(orgManagerAddress);
    console.log(issuerAddress);
    console.log(nftAddress);
}

const argv = yargs
    .command('verify', 'register device', {
        account: {
            description: 'account address',
            alias: 'a',
            type: 'string',
        },
        privatekey: {
            description: 'account private key',
            alias: 'pvtkey',
            type: 'string',
        }
    })
    .command('validate', 'record power', {
        account: {
            description: 'account address',
            alias: 'a',
            type: 'string',
        },
        privatekey: {
            description: 'account private key',
            alias: 'pvtkey',
            type: 'string',
        }
    })
    .command('deploy', 'deploy smart contract', {
        account: {
            description: 'account address',
            alias: 'a',
            type: 'string',
        },
        privatekey: {
            description: 'account private key',
            alias: 'pvtkey',
            type: 'string',
        }
    })
    .command('wallet', 'init wallet', {
        init: {
            description: 'init wallet and return account and privateKey',
            alias: 'i',
            type: 'boolean',
        },
        datadir: {
            description: 'datadir',
            type: 'string',
        },
        address: {
            description: 'account address',
            type: 'string',
        },
        password: {
            description: 'account password',
            type: 'string',
        }
    })
    .option('network', {
        description: 'show blockchain network',
        alias: 'n',
        type: 'boolean'
    })
    .help()
    .alias('help', 'h')
    .argv;

main = async(argv) => {
    const config = new ConfigTools();
    if (argv.network) {
        const web3 = new Web3(config.provider.rpc);
        const network = await web3.eth.net.getNetworkType();
        console.log(network);
    }
    if (argv._.includes('verify')) {
        let account = argv.account;
        let privateKey = argv.privatekey;
        if (account && privateKey) {
            const web3 = new Web3(config.provider.rpc);
            let rule = new schedule.RecurrenceRule();
            rule.second = [0, 30]; // when sec is at 0, 10, 20, 30, 40 , 50,...
            let job = schedule.scheduleJob(rule, () => {
                verify(web3, account, privateKey, config);
            });
        }
    } else if (argv._.includes('validate')) {
        let account = argv.account;
        let privateKey = argv.privatekey;
        if (account && privateKey) {
            const web3 = new Web3(config.provider.rpc);
            let rule = new schedule.RecurrenceRule();
            rule.second = [0, 30]; // when sec is at 0, 30,...
            let job = schedule.scheduleJob(rule, () => {
                validate(web3, account, privateKey, config);
            });
        }
    } else if (argv._.includes('deploy')) {
        let account = argv.account;
        let privateKey = argv.privatekey;
        if (account && privateKey) {
            const web3 = new Web3(config.provider.rpc);
            deploy(web3, account, privateKey, config);
        }
    }
    // else if (argv._.includes('wallet')) {
    //     let init = argv.init;
    //     if (init) {
    //         // init wallet, account
    //         const walletTools = new WalletTools();
    //         const wallet = await walletTools.init();
    //         const account = wallet.address;
    //         const privateKey = wallet.privateKey;
    //         console.log(account);
    //         console.log(privateKey);
    //         // get balance
    //         const web3 = new Web3(config.provider.rpc);
    //         let balance = await web3.eth.getBalance(account);
    //         balance = web3.utils.fromWei(balance, 'ether');
    //         console.log(balance);
    //         myLogger.log(new Date(), "account: ", account);
    //         myLogger.log(new Date(), "privateKey: ", privateKey);
    //         myLogger.log(new Date(), "balance: ", balance);
    //     }
    // }
    else if (argv._.includes('wallet')) {
        let datadir = argv.datadir;
        let address = argv.address;
        let password = argv.password;
        if (datadir && address && password) {
            // generate account pvt
            try {
                let keyObject = keythereum.importFromFile(address, datadir);
                let privateKey = keythereum.recover(password, keyObject);
                console.log(address);
                console.log('0x'+privateKey.toString('hex'));
            } catch(err) {
                myLogger.error(new Date(), err);
            }

            
        }
    }
}

main(argv);
