const Web3 = require("web3");
const { abi } = require("./resource/allenOrg");

async function main () {
	try {
		web3 = new Web3();
		const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
        // init contract address
		const orgAddress = '0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B';
        const plantAddress = '0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B';
        // init wallet, create account
		let account = web3.eth.accounts.create(web3.utils.randomHex(32));
		let wallet = web3.eth.accounts.wallet.add(account);
		let keystore = wallet.encrypt(web3.utils.randomHex(32));
		console.log({
			account: account,
			wallet: wallet,
			keystore: keystore
		});
		// test contract
		const org = new web3.eth.Contract(abi, orgAddress, {
			from: account, // default from addess
			gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
		});

        // request Org register Device
		await org.methods.const Web3 = require("web3");
const { abi } = require("./resource/allenOrg");

async function main () {
	try {
		web3 = new Web3();
		const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
        // init contract address
		const orgAddress = '0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B';
        const plantAddress = '0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B';
        // init wallet, create account
		let account = web3.eth.accounts.create(web3.utils.randomHex(32));
		let wallet = web3.eth.accounts.wallet.add(account);
		let keystore = wallet.encrypt(web3.utils.randomHex(32));
		console.log({
			account: account,
			wallet: wallet,
			keystore: keystore
		});
		// test contract
		const org = new web3.eth.Contract(abi, orgAddress, {
			from: account, // default from addess
			gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
		});

        // request Org register Device
		await org.methods.approveDeviceRequest(plantAddress);

	} catch (error) {
		console.error(error);
	}
};

main();(plantAddress);

	} catch (error) {
		console.error(error);
	}
};

main();