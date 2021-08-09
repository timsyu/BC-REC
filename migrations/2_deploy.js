const User = artifacts.require('User');
const OrgManager = artifacts.require('OrgManager');
const NFT = artifacts.require('NFT721Demo');
const Issuer = artifacts.require('Issuer');



module.exports = async function (deployer) {

  // 1. deploy User contract
  await deployer.deploy(User);
  const userInstance = await User.deployed();
  const userAddress = userInstance.address;
  // 2. deploy OrgManager contract
  await deployer.deploy(OrgManager, userAddress);
  const orgManagerInstance = await OrgManager.deployed();
  const orgManagerAddress = orgManagerInstance.address;
  // 3. deploy NFT contract
  await deployer.deploy(NFT,"testToken","TK");
  const nftInstance = await NFT.deployed();
  const nftAddress = nftInstance.address;
  // 4. deploy Issuer contract
  await deployer.deploy(Issuer, orgManagerAddress, nftAddress)
};