const Web3 = require("web3");
const WalletTools = require("./walletTools");
const RecordTools = require("./recordTools");
const RegisterTools = require("./registerTools");
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

register = async(web3, account, privateKey, config, orgAddress, plantAddress) => {
    try {
        // device register request
        const registerTools = new RegisterTools(web3, account, privateKey, config);
        // console.log("---check Device already register---");
        const isRegistered = await registerTools.checkRegister(orgAddress, plantAddress);
        console.log(isRegistered);
        let registerTxHash = "None"
        if (isRegistered == false) {
            // console.log("---device register start---");
            registerTxHash = await registerTools.register(orgAddress, plantAddress);
            console.log(registerTxHash);
            // console.log("---device register end---");
        }
        myLogger.log(new Date(), colors.action("register "), "isRegistered: ", colors.out(isRegistered), "orgAddress: ", colors.out(orgAddress),
            "plantAddress: ", colors.out(plantAddress), "txHash: ", colors.out(registerTxHash));
        // else {
        //     console.log("This device is already registered(ing)!!");
        // }
    } catch (err) {
        console.error(err);
    }
}

record = async(web3, account, privateKey, config, plantAddress, value) => {
    try {
        // device record power &&
        // bind device record power and txHash
        // test power value, date
        const recordTools = new RecordTools(web3, account, privateKey, config);
        console.log("---check Device Verified By Issuer---");
        const {isVerified, state} = await recordTools.checkDeviceVerifiedByIssuer(plantAddress);
        console.log("isVerified: ", isVerified);
        if(isVerified) {
            console.log("---device record & bind power start---");
            let dateTime = new Date().getTime();
            const date = Math.floor(dateTime / 1000);
            const { recordResult, powerId, recordTxHash , bindTxHash} = await recordTools.record(plantAddress, date, value);
            console.log("recordResult: ", recordResult);
            console.log("powerId: ", powerId);
            console.log("recordTxHash: ", recordTxHash);
            console.log("bindTxHash: ", bindTxHash);
            console.log("---device record & bind power end---");
            myLogger.log(new Date(), colors.action("record "), "recordResult: ", colors.out(recordResult), "powerId: ", colors.out(powerId),
                "recordTxHash: ", colors.out(recordTxHash), "bindTxHash: ", colors.out(bindTxHash));
        } else {
            let stateLog = "None";
            if (state == 1) { // Idel
                stateLog = "This device is not approved by org admin!!"
                console.log(stateLog);
            } else if (state == 2) { // pending
                stateLog = "This device is not approved by Issuer!!"
                console.log(stateLog);
            } else if (state == 4) { // disapproved
                stateLog = "This device is disapproved by Issuer!!"
                console.log(stateLog);
            }
            myLogger.log(new Date(), colors.action("record "), "isVerified: ", colors.out(isVerified), "stateLog: ", colors.out(stateLog));
        }
    } catch (err) {
        console.error(err);
    }
}

const argv = yargs
    .command('register', 'register device', {
        account: {
            description: 'account address',
            alias: 'a',
            type: 'string',
        },
        privatekey: {
            description: 'account private key',
            alias: 'pvtkey',
            type: 'string',
        },
        org: {
            description: 'register org contract address',
            alias: 'o',
            type: 'string',
        },
        plant: {
            description: 'register plant contract address',
            alias: 'p',
            type: 'string',
        }
    })
    .command('record', 'record power', {
        account: {
            description: 'account address',
            alias: 'a',
            type: 'string',
        },
        privatekey: {
            description: 'account private key',
            alias: 'pvtkey',
            type: 'string',
        },
        plant: {
            description: 'register plant contract address',
            alias: 'p',
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
        alias: 'net',
        type: 'boolean'
    })
    .help()
    .alias('help', 'h')
    .argv;

main = async(argv) => {
    const config = new ConfigTools();
    const web3 = new Web3(config.provider.twcc_besu);
    if (argv.network) {
        const network = await web3.eth.net.getNetworkType();
        console.log(network);
    }
    if (argv._.includes('register')) {
        let account = argv.account;
        let privateKey = argv.privatekey;
        let orgAddress = argv.org;
        let plantAddress = argv.plant;
        if (account && privateKey && orgAddress && plantAddress) {
            register(web3, account, privateKey, config, orgAddress, plantAddress);
        }
    } else if (argv._.includes('record')) {
        let account = argv.account;
        let privateKey = argv.privatekey;
        let plantAddress = argv.plant;
        if (account && privateKey && plantAddress) {
            let value = Math.floor(Math.random() * 100) + 234;
            // define rule
            let rule = new schedule.RecurrenceRule();
            rule.second = [0, 30]; // when sec is at 0, 30,...
            let job = schedule.scheduleJob(rule, () => {
                // console.log(new Date());
                record(web3, account, privateKey, config, plantAddress, value);
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