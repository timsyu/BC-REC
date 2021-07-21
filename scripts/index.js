// scripts/index.js
module.exports = async function main (callback) {
    try {
      //Test Showing Accounts
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);
      //Test Our codes
      // Set up a Truffle contract, representing our deployed Box instance
      const OrgManager = artifacts.require('OrgManager');
      const orgManager = await OrgManager.deployed();
      //Test Contract calling
      // Send a transaction to createOrg()
      await orgManager.createOrg(12345555, "MOMO");
      console.log(orgManager.getAllOrgInfo())
    //   const show = orgManager.getAllOrgInfo();
    //   console.log(typeof show);
    //   console.log(Object.keys(show));
      
      callback(0);
    } catch (error) {
      console.error(error);
      callback(1);
    }
  };