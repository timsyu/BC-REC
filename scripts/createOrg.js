
module.exports = async function main (callback) {
	try {
		// Showing Accounts
		const accounts = await web3.eth.getAccounts();
		console.log(accounts);
		
		// // Set up a Truffle contract, representing our deployed Box instance
		// const OrgManager = artifacts.require('OrgManager');
		// const orgManager = await OrgManager.deployed();
		// //Test Contract calling
		// // Send a transaction to createOrg()
		// var result = await orgManager.createOrg(12345555, "MOMO");
		// // console.log(result.logs);
		// console.log(result.logs[0].args);
		// // result = await orgManager.getAllOrgInfo();
		// // console.log(result);
		
		callback(0);
	} catch (error) {
		console.error(error);
		callback(1);
	}
};