# BC-REC


First Install Node by [here](https://nodejs.org/en/download/)

Then install node v12.16.3

```bash
$ node --version  
v12.16.3

#ifneeded
$ nvm use v12.16.3
```

Install Truffle, Ganache and other packages in our project directory.

```bash
$ npm install
```

Start Ganache in deterministic mode

```bash
$ npx ganache-cli --deterministic
```

Ganache will print out a list of available accounts and their private keys, along with some blockchain configuration values. Most importantly, it will display its address, which we’ll use to connect to it. By default, this will be `127.0.0.1:8545`

Using migrate command, we can deploy the `OrgManager` contract to the development network(Ganache)

```bash
$ npx truffle migrate --network development

Compiling your contracts...
===========================
> Compiling ./contracts/Migrations.sol
> Artifacts written to /Users/timsyu/NCTU/Research/TREC/BC-REC/build/contracts
> Compiled successfully using:
   - solc: 0.8.4+commit.c7e474f2.Emscripten.clang

Starting migrations...
======================
> Network name:    'development'
> Network id:      1626870535280
> Block gas limit: 6721975 (0x6691b7)

1_initial_migration.js
======================

   Deploying 'Migrations'
   ----------------------
   > transaction hash:    0x0817b7527e8973d9cb7419ef968e136f181e982d737f012fd39709cae1ac4041
   > Blocks: 0            Seconds: 0
   > contract address:    0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab
   > block number:        1
   > block timestamp:     1626870731
   > account:             0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
   > balance:             99.99506216
   > gas used:            246892 (0x3c46c)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.00493784 ETH

   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:          0.00493784 ETH

2_deploy.js
===========

   Deploying 'OrgManager'
   ----------------------
   > transaction hash:    0xe9a37adfebdfc559cf3427d5ece6d78c52763f1e7b5cd88811602a7bf69eb39c
   > Blocks: 0            Seconds: 0
   > contract address:    0xCfEB869F69431e42cdB54A4F4f105C19C080A601
   > block number:        3
   > block timestamp:     1626870731
   > account:             0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
   > balance:             99.9188769
   > gas used:            3766750 (0x3979de)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.075335 ETH

   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:            0.075335 ETH

Summary
=======
> Total deployments:   2
> Final cost:          0.08027284 ETH
```

## 2 ways to interact the contract

### Interacting from the console

```bash
$ npx truffle console --network development

truffle(development)> const OrgManager = await OrgManager.deployed();
# Sending Transactions
truffle(development)> await OrgManager.createOrg(12345555, "Fucl");
# Querying state
truffle(development)> await OrgManager.getAllOrgInfo();
```

### Interacting programmatically

check out `script/index.js`

then run the code above using `truffle exec`

```bash
npx truffle exec --network development ./scripts/index.js
```
