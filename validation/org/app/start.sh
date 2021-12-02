#! /bin/bash
dir=$(dirname "$0")

datadir=$1
account=$2
password=$3
# echo $datadir
# echo $account
# echo $password
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
echo "Ask issuer Pod orgManager, issuer, nht contract address"
host_var=ISSUER_DAPP_SERVICE_SERVICE_HOST
host="${!host_var}"
port_var=ISSUER_DAPP_SERVICE_SERVICE_PORT_DISCOVERY_TCP
port="${!port_var}"
echo $host
echo $port
while true
do
    result=`curl -s http://$host:$port/ask/contract/address`
    success=$(jq -r '.success' <<< $result)
    echo success: $success
    if [[ $success == true ]];
    then
        orgManager=$(jq -r '.orgManager' <<< $result)
        issuer=$(jq -r '.issuer' <<< $result)
        nft=$(jq -r '.nft' <<< $result)
        echo orgManager address: $orgManager
        echo issuer address: $issuer
        echo nft address: $nft
        # save json
        v=$(jq ".address=\"$orgManager\"" $dir/resource/orgManager.json)
        echo $v > $dir/resource/orgManager.json
        v=$(jq ".address=\"$issuer\"" $dir/resource/issuer.json)
        echo $v > $dir/resource/issuer.json
        v=$(jq ".address=\"$nft\"" $dir/resource/token.json)
        echo $v > $dir/resource/token.json
        break
    fi
    sleep 5
done
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
echo "create org"
orgName=$ORG_NAME
orgDesc=$ORG_DESC
results=( $(node $dir/main.js createorg --account $account --privatekey $privateKey --name $orgName --description $orgDesc) )
txHash=${results[0]}
orgAddress=${results[1]}
echo txHash: $txHash
echo orgAddress: $orgAddress
echo $orgAddress > $dir/out/org.txt
echo "--------------------------------------------------------------------------------"

echo "--------------------------------------------------------------------------------"
echo "start service"
nohup node $dir/server.js &> $dir/out/server.txt &
echo "--------------------------------------------------------------------------------"

echo "--------------------------------------------------------------------------------"
echo "create $PLANT_NUM plants..."
for ((i=1;i<=$PLANT_NUM;i++))
do
    echo "-------------------"
    echo "create plant_$i"
    plantName="plant_$i"
    plantDesc="This is plant_$i"
    echo plantName: $plantName
    echo plantDesc: $plantDesc
    results=( $(node $dir/main.js createplant --account $account --privatekey $privateKey --org $orgAddress --name $plantName --description $plantDesc) )
    txHash=${results[0]}
    plantAddress=${results[1]}
    echo plant_$i txHash: $txHash
    echo plant_$i plantAddress: $plantAddress
    echo $plantAddress >> $dir/out/plants.txt
    echo "-------------------"
done
echo "--------------------------------------------------------------------------------"

echo "--------------------------------------------------------------------------------"
echo "auto approve device register"
echo "run in the background"
echo "write console to out/autoapprove.txt"
nohup node $dir/main.js autoapprove --account $account --privatekey $privateKey --org $orgAddress &> $dir/out/autoapprove.txt &
echo "you can type 'tail -f $dir/out/autoapprove.txt'"
echo "--------------------------------------------------------------------------------"

echo "--------------------------------------------------------------------------------"
echo "auto request device verify to issuer"
echo "run in the background"
echo "write console to $dir/out/autoreqdevice.txt"
nohup node $dir/main.js autoreqdevice --account $account --privatekey $privateKey --org $orgAddress &> $dir/out/autoreqdevice.txt &
echo "you can type 'tail -f $dir/out/autoreqdevice.txt'"
echo "--------------------------------------------------------------------------------"

echo "--------------------------------------------------------------------------------"
echo "auto request certificate to issuer"
echo "run in the background"
echo "write console to $dir/out/autoreqcert.txt"
nohup node $dir/main.js autoreqcert --account $account --privatekey $privateKey --org $orgAddress &> $dir/out/autoreqcert.txt &
echo "you can type 'tail -f $dir/out/autoreqcert.txt'"
echo "--------------------------------------------------------------------------------"

# echo "--------------------------------------------------------------------------------"
# echo "auto reduce power in plants"
# echo "run in the background"
# echo "write console to $dir/out/autoreducepower.txt"
# nohup node $dir/main.js autoreducepower --account $account --privatekey $privateKey --org $orgAddress &> $dir/out/autoreducepower.txt &
# echo "you can type 'tail -f $dir/out/autoreducepower.txt'"
# echo "--------------------------------------------------------------------------------"
echo "'tail -f $dir/out/autoreducepower.txt'"
tail -f $dir/out/normalStdout.txt
# tail -f $dir/out/autoreqcert.txt