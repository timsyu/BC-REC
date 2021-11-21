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