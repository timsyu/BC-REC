#! /bin/bash
dir=$(dirname "$0")

datadir=$1
account=$2
password=$3
false > $dir/out/normalStdout.txt
echo "--------------------------------------------------------------------------------"
echo "init wallet"
wallet=( $(node $dir/main.js wallet --datadir $datadir --address $account --password $password) )
account=${wallet[0]}
privateKey=${wallet[1]}
echo account: $account
echo privateKey: $privateKey
echo "--------------------------------------------------------------------------------"

echo "--------------------------------------------------------------------------------"
echo "start service"
nohup node $dir/server.js &> $dir/out/server.txt &
echo "--------------------------------------------------------------------------------"

while true
do
    block=$(geth attach http://127.0.0.1:8545 -exec "eth.getBlock('2')");
    if [[ $block != null ]];
    then 
        echo "maybe interact with blockchain";
        break
    fi
done

echo "--------------------------------------------------------------------------------"
echo "deploy contracts"
result=( $(node $dir/main.js deploy --account $account --privatekey $privateKey) )
success=${result[0]}
orgManager=${result[1]}
issuer=${result[2]}
nft=${result[3]}
echo "deploy contracts: " success
echo "--------------------------------------------------------------------------------"
if [[ $success == true ]];
then
    echo "deploy orgManager contract: " $orgManager
    echo "deploy issuer contract: " $issuer
    echo "deploy nft contract: " $nft
    # save address to file
    v=$(jq ".address=\"$orgManager\"" $dir/resource/orgManager.json)
    echo $v > $dir/resource/orgManager.json
    v=$(jq ".address=\"$issuer\"" $dir/resource/issuer.json)
    echo $v > $dir/resource/issuer.json
    v=$(jq ".address=\"$nft\"" $dir/resource/nft.json)
    echo $v > $dir/resource/nft.json

    echo "--------------------------------------------------------------------------------"
    echo "verify start"
    echo "run in background"
    echo "write console to out/verify.txt"
    nohup node $dir/main.js verify --account $account --privatekey $privateKey &> $dir/out/verify.txt &
    echo "you can type 'tail -f out/verify.txt'"
    echo "--------------------------------------------------------------------------------"

    # echo "--------------------------------------------------------------------------------"
    # echo "validate start"
    # echo "run in background"
    # echo "write console to out/validate.txt"
    # nohup node $dir/main.js validate --account $account --privatekey $privateKey &> $dir/out/validate.txt &
    # echo "you can type 'tail -f out/validate.txt'"
    # echo "--------------------------------------------------------------------------------"
    echo "you can type 'tail -f $dir/out/normalStdout.txt'"
    tail -f $dir/out/normalStdout.txt
fi
