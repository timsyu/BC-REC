const Web3 = require("web3");
const WalletTools = require("./walletTools");
const OrgTools = require("./orgTools");
const ConfigTools = require("./configTools");
const CertificateTools = require("./certificateTools")
const yargs = require('yargs');
const schedule = require('node-schedule');

createOrg = async(web3, account, privateKey, config, orgName, orgDescriptsion) => {
    try {
        // init org tools
        let orgTools = new OrgTools(web3, account, privateKey, config);
        // create Org
        let result = await orgTools.createOrg(orgName, orgDescriptsion);
        console.log(result.txHash);
        console.log(result.orgAddress);
    } catch (err) {
        console.error(err);
    }
}

createPlant = async(web3, account, privateKey, config, orgAddress, plantName, plantDescriptsion) => {
    try {
        // init org tools
        let orgTools = new OrgTools(web3, account, privateKey, config);
        // create Plant
        result = await orgTools.createPlant(orgAddress, plantName, plantDescriptsion);
        console.log(result.txHash);
        console.log(result.plantAddress);
    } catch (err) {
        console.error(err);
    }
}

approveDeviceRegister = async(web3, account, privateKey, config, orgAddress) => {
    try {
        // init org tools
        let orgTools = new OrgTools(web3, account, privateKey, config);
        // approve device
        console.log("---Get Device Register Requests---");
        let requestList = await orgTools.getAllDeviceRegisterRequest(orgAddress);
        for (let i = 0; i < requestList.length; i++) {
            let request = requestList[i];
            console.log("---Approve Device Register Request---");
            let requestId = request.id;
            let deviceId = request.deviceId;
            let capacity = 999;
            let location = deviceId + "'s location";
            let imageUrl = deviceId + "'s imageUrl";
            let txHash = await orgTools.approveDeviceRegister(orgAddress, requestId, capacity, location, imageUrl);
            console.log("txHash", txHash);
        }
    } catch (err) {
        console.error(err);
    }
}

requestDeviceVerification = async(web3, account, privateKey, config, orgAddress) => {
    try {
        // init org tools
        let orgTools = new OrgTools(web3, account, privateKey, config);
        // request device issuer
        console.log("---Get All Idel Device in each Plant contract---");
        let plantList = await orgTools.getAllIdelDeviceFromPlants(orgAddress);
        for (let i = 0; i < plantList.length; i++) {
            let plant = plantList[i];
            let plantId = plant.plantAddress;
            let deviceList = plant.devices;
            for (let j = 0; j < deviceList.length; j++) {
                let device = deviceList[j];
                console.log("---Request Device Verify to Issuer---");
                let deviceId = device.deviceId;
                let deviceLocation = device.location;
                console.log("deviceId:", deviceId);
                console.log("deviceLocation:", deviceLocation);
                let txHash = await orgTools.requestDeviceVerification(orgAddress, plantId, deviceId, deviceLocation);
                console.log("txHash", txHash);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

requestCertificate = async(web3, account, privateKey, config, orgAddress, metadataUri) => {
    try {
        // init org tools
        let orgTools = new OrgTools(web3, account, privateKey, config);
        // init certificate tools
        let certificateTools = new CertificateTools(web3, account, privateKey, config);
        console.log("---Calculate All Certificate in each Plant contract---");
        let certList = await certificateTools.calcertNum(orgAddress);
        for (let i = 0; i < certList.length; i++) {
            let cert = certList[i];
            let plantId = cert.plantId;
            let certNum = cert.certNum;
            let totalPower = cert.totalPower;
            console.log("plantId", plantId);
            console.log("certNum", certNum);
            console.log("totalPower", totalPower);
            if (certNum > 0) {
                console.log("---Generate All Certificate Power Info in each Plant contract---");
                let { powerIds, values } = await certificateTools.generatePowerInfo(orgAddress, plantId, certNum);
                console.log("powerIds", powerIds);
                console.log("values", values);
                let txHash = await orgTools.requestCertificate(orgAddress, certNum, plantId, powerIds, values, metadataUri);
                console.log("txHash", txHash);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

reducePower = async(web3, account, privateKey, config, orgAddress) => {
    try {
        // init org tools
        let orgTools = new OrgTools(web3, account, privateKey, config);
        console.log("---Reduce The Power Requested Cert. in each Plant contract---");
        orgTools.reducePowerListener(orgAddress);
    } catch (err) {
        console.error(err);
    }
}

const argv = yargs
    .command('createorg', 'create org contract', {
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
        name: {
            description: 'org name',
            alias: 'name',
            type: 'string',
        },
        description: {
            description: 'org description',
            alias: 'desc',
            type: 'string',
        }
    })
    .command('createplant', 'create plant contract', {
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
            description: 'org contract address',
            alias: 'o',
            type: 'string',
        },
        name: {
            description: 'plant name',
            alias: 'name',
            type: 'string',
        },
        description: {
            description: 'plant description',
            alias: 'desc',
            type: 'string',
        }
    })
    .command('autoapprove', 'auto approve device register', {
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
            description: 'org contract address',
            alias: 'o',
            type: 'string',
        }
    })
    .command('autoreqdevice', 'auto request all device verification', {
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
            description: 'org contract address',
            alias: 'o',
            type: 'string',
        }
    })
    .command('autoreqcert', 'auto request all certificate', {
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
            description: 'org contract address',
            alias: 'o',
            type: 'string',
        }
    })
    .command('autoreducepower', 'auto reduce the power requested certificate', {
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
            description: 'org contract address',
            alias: 'o',
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
    if (argv.network) {
        const web3 = new Web3(config.provider.twcc_besu);
        const network = await web3.eth.net.getNetworkType();
        console.log(network);
    }
    if (argv._.includes('createorg')) { // createOrg
        let account = argv.account;
        let privateKey = argv.privatekey;
        let orgName = argv.name;
        let orgDescriptsion = argv.desc;
        if (account && privateKey && orgName && orgDescriptsion) {
            const web3 = new Web3(config.provider.twcc_besu);
            createOrg(web3, account, privateKey, config, orgName, orgDescriptsion);
        }
    } else if (argv._.includes('createplant')) { // createPlant
        let account = argv.account;
        let privateKey = argv.privatekey;
        let orgAddress = argv.org;
        let plantName = argv.name;
        let plantDescriptsion = argv.desc;
        if (account && privateKey && orgAddress && plantName && plantDescriptsion) {
            const web3 = new Web3(config.provider.twcc_besu);
            createPlant(web3, account, privateKey, config, orgAddress, plantName, plantDescriptsion);
        }
    } else if (argv._.includes('autoapprove')) { // approveDeviceRegister
        let account = argv.account;
        let privateKey = argv.privatekey;
        let orgAddress = argv.org;
        if (account && privateKey && orgAddress) {
            const web3 = new Web3(config.provider.twcc_besu);
            let rule = new schedule.RecurrenceRule();
            rule.second = [0, 30]; // when sec is at 0, 30,...
            let job = schedule.scheduleJob(rule, () => {
                console.log(new Date(),"autoapprove");
                approveDeviceRegister(web3, account, privateKey, config, orgAddress);
            });
        }
    } else if (argv._.includes('autoreqdevice')) { // requestDeviceVerification
        let account = argv.account;
        let privateKey = argv.privatekey;
        let orgAddress = argv.org;
        if (account && privateKey && orgAddress) {
            const web3 = new Web3(config.provider.twcc_besu);
            let rule = new schedule.RecurrenceRule();
            rule.second = [0, 10, 20 ,30, 40, 50]; // when sec is at 0, 30,...
            let job = schedule.scheduleJob(rule, () => {
                console.log(new Date(),"autoreqdevice");
                requestDeviceVerification(web3, account, privateKey, config, orgAddress);
            });
        }
    } else if (argv._.includes('autoreqcert')) { // requestCertificate
        let account = argv.account;
        let privateKey = argv.privatekey;
        let orgAddress = argv.org;
        if (account && privateKey && orgAddress) {
            const web3 = new Web3(config.provider.twcc_besu);
            // define rule
            let rule = new schedule.RecurrenceRule();
            rule.second = [50]; // when sec is at 50,...
            let job = schedule.scheduleJob(rule, () => {
                // console.log(new Date());
                let metadataUri = "metadataUri";
                requestCertificate(web3, account, privateKey, config, orgAddress, metadataUri);
            });
        }
    } else if (argv._.includes('autoreducepower')) { // reducePower
        let account = argv.account;
        let privateKey = argv.privatekey;
        let orgAddress = argv.org;
        if (account && privateKey && orgAddress) {
            const web3 = new Web3(config.provider.ws_twcc_besu);
            // define rule
            // let rule = new schedule.RecurrenceRule();
            // rule.second = [50]; // when sec is at 50,...
            // let job = schedule.scheduleJob(rule, () => {
                // console.log(new Date());
            reducePower(web3, account, privateKey, config, orgAddress);
            // });
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