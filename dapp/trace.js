const Web3 = require("web3");
const { abi } = require("./resource/orgManager");

async function main () {
	try {
		web3 = new Web3()
		const eventProvider = new Web3.providers.WebsocketProvider('ws://localhost:8545');
		web3.setProvider(eventProvider);
		// const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
		//Test Showing Accounts
		const accounts = await web3.eth.getAccounts();
		console.log(accounts);
		// init account, contract address
		const account = accounts[0];
		const orgManagerAddress = '0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B';

		// Set up a Truffle contract, representing our deployed Box instance
		// const OrgManager = artifacts.require('OrgManager');
		// const orgManager = await OrgManager.deployed();
		const orgManager = new web3.eth.Contract(abi, orgManagerAddress, {
			from: account, // default from addess
			gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
		});

		//Test Contract calling
		// const orgId = web3.utils.toBN(0);
		const orgId = 5;
		console.log(orgId);
		// var result = await orgManager.methods.getAllOrgInfo().call();
		// console.log(result);
		// const allEventsA = await orgManager.getPastEvents('CreateOrgEvent', {filter: {orgId: orgId}},{fromBlock: 0, toBlock: 'latest'});
		// console.log(allEventsA);

		orgManager.events.CreateOrgEvent({
			// filter: {orgId: orgId},
			fromBlock: 0,
		})
		.on("connected", function(subscriptionId){
			console.log("connected");
			console.log(subscriptionId);
		})
		.on('data', function(event){
			console.log("data"); // same results as the optional callback above
			console.log(event);
			console.log("org id: ",event.returnValues['orgId']);
			console.log("org orgAddress: ",event.returnValues['orgAddress']);
			console.log("org description: ",event.returnValues['description']);
		})
		.on('changed', function(event){
			// remove event from local database
			console.log("changed");
		})
		.on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
			console.log("error");
			console.log(error);
		});

	} catch (error) {
		console.error(error);
	}
};

main();