#! /bin/bash

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
        break
    fi
    sleep 5
done
echo "--------------------------------------------------------------------------------"

echo "--------------------------------------------------------------------------------"
echo "create org"
orgName=$ORG_NAME
orgDesc=$ORG_DESC
results=( $(node main.js createorg --account $account --privatekey $privateKey --name $orgName --description $orgDesc) )
txHash=${results[0]}
orgAddress=${results[1]}
echo txHash: $txHash
echo orgAddress: $orgAddress
echo $orgAddress > out/org.txt
echo "--------------------------------------------------------------------------------"

echo "--------------------------------------------------------------------------------"
echo "start service"
nohup node server.js &> out/server.txt &
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
    results=( $(node main.js createplant --account $account --privatekey $privateKey --org $orgAddress --name $plantName --description $plantDesc) )
    txHash=${results[0]}
    plantAddress=${results[1]}
    echo plant_$i txHash: $txHash
    echo plant_$i plantAddress: $plantAddress
    echo $plantAddress >> out/plants.txt
    echo "-------------------"
done
echo "--------------------------------------------------------------------------------"

echo "--------------------------------------------------------------------------------"
echo "auto approve device register"
echo "run in the background"
echo "write console to out/autoapprove.txt"
nohup node main.js autoapprove --account $account --privatekey $privateKey --org $orgAddress &> out/autoapprove.txt &
echo "you can type 'tail -f out/autoapprove.txt'"
echo "--------------------------------------------------------------------------------"

echo "--------------------------------------------------------------------------------"
echo "auto request device verify to issuer"
echo "run in the background"
echo "write console to out/autoreqdevice.txt"
nohup node main.js autoreqdevice --account $account --privatekey $privateKey --org $orgAddress &> out/autoreqdevice.txt &
echo "you can type 'tail -f out/autoreqdevice.txt'"
echo "--------------------------------------------------------------------------------"

echo "--------------------------------------------------------------------------------"
echo "auto request certificate to issuer"
echo "run in the background"
echo "write console to out/autoreqcert.txt"
nohup node main.js autoreqcert --account $account --privatekey $privateKey --org $orgAddress &> out/autoreqcert.txt &
echo "you can type 'tail -f out/autoreqcert.txt'"
echo "--------------------------------------------------------------------------------"

# echo "--------------------------------------------------------------------------------"
# echo "auto reduce power in plants"
# echo "run in the background"
# echo "write console to out/autoreducepower.txt"
# nohup node main.js autoreducepower --account $account --privatekey $privateKey --org $orgAddress &> out/autoreducepower.txt &
# echo "you can type 'tail -f out/autoreducepower.txt'"
# echo "--------------------------------------------------------------------------------"
tail -f normalStdout.txt
# tail -f out/autoreqcert.txt