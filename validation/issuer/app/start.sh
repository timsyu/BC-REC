#! /bin/bash

echo "--------------------------------------------------------------------------------"
echo "init wallet"
wallet=( $(node main.js wallet --init) )
account=${wallet[0]}
privateKey=${wallet[1]}
balance=${wallet[2]}
echo account: $account
echo privateKey: $privateKey
echo balance: $balance ethers
echo "--------------------------------------------------------------------------------"

echo "--------------------------------------------------------------------------------"
echo "verify start"
echo "run in background"
echo "write console to out/verify.txt"
nohup node main.js verify --account $account --privatekey $privateKey &> out/verify.txt &
echo "you can type 'tail -f out/verify.txt'"
echo "--------------------------------------------------------------------------------"

echo "--------------------------------------------------------------------------------"
echo "validate start"
echo "run in background"
echo "write console to out/validate.txt"
nohup node main.js validate --account $account --privatekey $privateKey &> out/validate.txt &
echo "you can type 'tail -f out/validate.txt'"
echo "--------------------------------------------------------------------------------"
echo "tail validate.txt start"
tail -f out/validate.txt