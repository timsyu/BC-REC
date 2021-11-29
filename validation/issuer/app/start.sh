#! /bin/bash
dir=$(dirname "$0")

echo "--------------------------------------------------------------------------------"
echo "init wallet"
wallet=( $(node $dir/main.js wallet --init) )
account=${wallet[0]}
privateKey=${wallet[1]}
balance=${wallet[2]}
echo account: $account
echo privateKey: $privateKey
echo balance: $balance ethers
echo "--------------------------------------------------------------------------------"

privateKey=$(echo $privateKey | sed 's/^0x//')
echo "--------------------------------------------------------------------------------"
echo $privateKey > $dir/key.prv
geth account import --datadir $dir/miner/data --password $dir/password.txt $dir/key.prv
geth --datadir $dir/miner/data init genesis.json
echo "--------------------------------------------------------------------------------"

echo "--------------------------------------------------------------------------------"
echo "verify start"
echo "run in background"
echo "write console to out/verify.txt"
# nohup node main.js verify --account $account --privatekey $privateKey &> out/verify.txt &
echo "you can type 'tail -f out/verify.txt'"
echo "--------------------------------------------------------------------------------"

# echo "--------------------------------------------------------------------------------"
# echo "validate start"
# echo "run in background"
# echo "write console to out/validate.txt"
# nohup node main.js validate --account $account --privatekey $privateKey &> out/validate.txt &
# echo "you can type 'tail -f out/validate.txt'"
# echo "--------------------------------------------------------------------------------"
# tail -f normalStdout.txt