const Web3 = require("web3");
const WalletTools = require("./walletTools");
const DeviceVerificationTools = require("./deviceVerificationTools");
const CertificateRequestTools = require("./certificateRequestTools");
const ConfigTools = require("./configTools");
const yargs = require('yargs');
const schedule = require('node-schedule');


// Approve all device verification
verify = async(web3, account, privateKey, config) => {
    console.log("---verify Device start---");
    const deviceVerificationTools = new DeviceVerificationTools(web3, account, privateKey, config);
    await deviceVerificationTools.verify();
}

// Validate and Approve certificate request
validate = (web3, account, privateKey, config) => {
    console.log("---Certificate validation listener start---");
    const certificateRequestTools = new CertificateRequestTools(web3, account, privateKey, config);
    certificateRequestTools.validate();
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
            rule.second = [0, 30]; // when sec is at 0, 30,...
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
        }
    }
}

main(argv);
