#! /bin/bash
dir=$(dirname "$0")

datadir=$1
account=$2
password=$3
echo "--------------------------------------------------------------------------------"
echo "init wallet"
wallet=( $(node $dir/main.js wallet --datadir $datadir --address $account --password $password) )
account=${wallet[0]}
privateKey=${wallet[1]}
echo account: $account
echo privateKey: $privateKey
echo "--------------------------------------------------------------------------------"

false > $dir/out/verify.txt
echo "--------------------------------------------------------------------------------"
echo "verify start"
echo "run in background"
echo "write console to out/verify.txt"
nohup node main.js verify --account $account --privatekey $privateKey &> $dir/out/verify.txt &
echo "you can type 'tail -f out/verify.txt'"
echo "--------------------------------------------------------------------------------"

# echo "--------------------------------------------------------------------------------"
# echo "validate start"
# echo "run in background"
# echo "write console to out/validate.txt"
# nohup node main.js validate --account $account --privatekey $privateKey &> out/validate.txt &
# echo "you can type 'tail -f out/validate.txt'"
# echo "--------------------------------------------------------------------------------"
tail -f normalStdout.txt