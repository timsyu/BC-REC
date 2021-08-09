
module.exports = async function main (callback) {
	try {
		// Showing Accounts
		const accounts = await web3.eth.getAccounts();
		console.log(accounts);
		
		// init Org contract address
		const ORG_ADDRESS = "";

		// Set up a Truffle contract, representing our deployed Box instance
		const Org = artifacts.require('Org');
		const org = await Org.at(ORG_ADDRESS);
		//Test Contract calling
		var result = await orgManager.createOrg(12345555, "MOMO");
		console.log(result);
		result = await orgManager.getAllOrgInfo();
		console.log(result);
		
		callback(0);
	} catch (error) {
		console.error(error);
		callback(1);
	}
};