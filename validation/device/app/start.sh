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
echo "Ask org address and plant address"
host_var=ORG${TARGET_ORG}_DAPP_SERVICE_SERVICE_HOST
host="${!host_var}"
port_var=ORG${TARGET_ORG}_DAPP_SERVICE_SERVICE_PORT_DISCOVERY_TCP
port="${!port_var}"
echo $host
echo $port
while true
do
    result=`curl -s http://$host:$port/ask/register/address`
    success=$(jq -r '.success' <<< $result)
    echo success: $success
    if [[ $success == true ]];
    then
        orgAddress=$(jq -r '.orgAddress' <<< $result)
        plantAddress=$(jq -r '.plantAddress' <<< $result)
        echo orgAddress: $orgAddress
        echo plantAddress: $plantAddress
        break
    fi
    sleep 5
done
echo "--------------------------------------------------------------------------------"

echo "--------------------------------------------------------------------------------"
echo "device register"
result=( $(node main.js register --account $account --privatekey $privateKey --org $orgAddress --plant $plantAddress) )
isRegistered=${result[0]}
txHash=${result[1]}
echo isRegistered: $isRegistered
echo txHash: $txHash
echo "--------------------------------------------------------------------------------"

echo "--------------------------------------------------------------------------------"
echo "device record"
echo "run in the background"
echo "write console to out/record.txt"
nohup node main.js record --account $account --privatekey $privateKey --plant $plantAddress &> out/record.txt &
echo "you can type 'tail -f out/record.txt'"
echo "--------------------------------------------------------------------------------"
tail -f normalStdout.txt