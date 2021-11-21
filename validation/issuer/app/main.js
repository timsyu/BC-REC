const Web3 = require("web3");
const WalletTools = require("./walletTools");
const DeviceVerificationTools = require("./deviceVerificationTools");
const CertificateRequestTools = require("./certificateRequestTools");
const ConfigTools = require("./configTools");
const yargs = require('yargs');
const schedule = require('node-schedule');

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
    stdout: fs.createWriteStream("normalStdout.txt"),
    stderr: fs.createWriteStream("errStdErr.txt"),
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
    .command('wallet', 'init wallet', {
        init: {
            description: 'init wallet and return account and privateKey',
            alias: 'i',
            type: 'boolean',
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
        const web3 = new Web3(config.provider.twcc_besu);
        const network = await web3.eth.net.getNetworkType();
        console.log(network);
    }
    if (argv._.includes('verify')) {
        let account = argv.account;
        let privateKey = argv.privatekey;
        if (account && privateKey) {
            const web3 = new Web3(config.provider.twcc_besu);
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
            const web3 = new Web3(config.provider.twcc_besu);
            let rule = new schedule.RecurrenceRule();
            rule.second = [0, 30]; // when sec is at 0, 30,...
            let job = schedule.scheduleJob(rule, () => {
                validate(web3, account, privateKey, config);
            });
        }
    } else if (argv._.includes('wallet')) {
        let init = argv.init;
        if (init) {
            // init wallet, account
            const walletTools = new WalletTools();
            const wallet = await walletTools.init();
            const account = wallet.address;
            const privateKey = wallet.privateKey;
            console.log(account);
            console.log(privateKey);
            // get balance
            const web3 = new Web3(config.provider.twcc_besu);
            let balance = await web3.eth.getBalance(account);
            balance = web3.utils.fromWei(balance, 'ether');
            console.log(balance);
            myLogger.log(new Date(), "account: ", account);
            myLogger.log(new Date(), "privateKey: ", privateKey);
            myLogger.log(new Date(), "balance: ", balance);
        }
    }
}

main(argv);
