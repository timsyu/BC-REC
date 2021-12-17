#! /bin/bash
dir=$(dirname "$0")

datadir=$1
account=$2
password=$3
echo $datadir
echo $account
echo $password
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

echo "--------------------------------------------------------------------------------"
echo "Ask org address and plant address"
host_var=ORG${TARGET_ORG}_DAPP_SERVICE_SERVICE_HOST
host="${!host_var}"
port_var=ORG${TARGET_ORG}_DAPP_SERVICE_SERVICE_PORT_MY_SERVER_TCP
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
echo "device register"
result=( $(node $dir/main.js register --account $account --privatekey $privateKey --org $orgAddress --plant $plantAddress) )
isRegistered=${result[0]}
txHash=${result[1]}
echo isRegistered: $isRegistered
echo txHash: $txHash
echo "--------------------------------------------------------------------------------"

echo "--------------------------------------------------------------------------------"
echo "device record"
echo "run in the background"
echo "write console to $dir/out/record.txt"
nohup node $dir/main.js record --account $account --privatekey $privateKey --plant $plantAddress &> $dir/out/record.txt &
echo "you can type 'tail -f $dir/out/record.txt'"
echo "--------------------------------------------------------------------------------"
echo "'tail -f $dir/out/normalStdout.txt'"
tail -f $dir/out/normalStdout.txt