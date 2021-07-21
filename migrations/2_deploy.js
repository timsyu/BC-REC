const OrgManager = artifacts.require('OrgManager');


module.exports = async function (deployer) {
//   await deployer.deploy(Box);
  await deployer.deploy(OrgManager);
};