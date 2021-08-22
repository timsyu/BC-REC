const Web3 = require("web3");
const { orgAbi } = require("./resourse/org");

async function main() {
    const web3 = new Web3(Web3.givenProvider ||'https://ropsten.infura.io/v3/4d6cbd5116f74b6eb0f688f165b87286');
    const accounts = await web3.eth.getAccounts();
	console.log(accounts);
}

main();