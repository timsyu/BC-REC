#!/bin/bash
dir=$(dirname "$0")

minerNum=$1
namespace=$2

# secret
kubectl apply -f $dir/bootnode/bootkey-secret.yaml
kubectl apply -f $dir/password-secret.yaml

# bootnode
kubectl apply -f $dir/bootnode/bootnode.yaml

# genesis
chmod +rw $dir/genesis-config.yaml
extradata="0x0000000000000000000000000000000000000000000000000000000000000000"
alloc='{"alloc":{}}'
for (( i=1; i<=$minerNum; i++))
do
    name=keystore$i yq e -i '
        .metadata.name = strenv(name)
    ' $dir/keystore.yaml
    namespace=$namespace yq e -i '
        .metadata.namespace = strenv(namespace)
    ' $dir/keystore.yaml
    # new nodes account
    mkdir $dir/miner/tmp
    tmpfilepath=$dir/miner/tmp
    geth --datadir $tmpfilepath account new --password $dir/password.txt
    keyfilename=$(basename $tmpfilepath/keystore/*)
    content=$(cat $tmpfilepath/keystore/$keyfilename)
    contentbase64=$(echo $content | base64)
    content=$contentbase64 yq e -i '
        .data = null |
        .data."'"$keyfilename"'" = strenv(content)
    ' $dir/keystore.yaml
    rm -r $tmpfilepath
    # genesis extradata
    account=$(jq -r '.address' <<< $content)
    accountbase64=$(echo 0x$account | base64)
    account=$accountbase64 yq e -i '
        .data.account = strenv(account)
    ' $dir/keystore.yaml
    # create secret
    kubectl apply -f $dir/keystore.yaml
    extradata+="$account"
    alloc=$(jq --arg account "$account" '.alloc[$account] += {"balance":"0x200000000000000000000000000000000000000000000000000000000000000"}' <<< $alloc)
done
post="0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
extradata+="$post"

genesis=$dir/poa/poa.json
chmod +r $genesis
alloc=$(jq '.alloc' <<< $alloc)
content=$(jq ".alloc = $alloc" $genesis)
content=$(jq --arg key1 "$extradata" '.extraData = $key1' <<< $content)
echo $content | jq '.' > $dir/genesis.json

networkid=$(jq -r '.config.chainId' <<< $content)
namespace=$namespace yq e -i '
        .metadata."namespace" = strenv(namespace)
' $dir/genesis-config.yaml
networkid=$networkid yq e -i '
        .data."networkid" = strenv(networkid)
' $dir/genesis-config.yaml
name=$content yq e -i --prettyPrint '
        .data."genesis.json" = strenv(name)
' $dir/genesis-config.yaml
# create configmap
kubectl apply -f $dir/genesis-config.yaml

# miners
for (( i=1; i<=$minerNum; i++))
do
    deploymentName=eth-testnet-miner$i
    name=$deploymentName yq e -i '
        .metadata.name = strenv(name)
    ' $dir/poa/miner.yaml
    namespace=$namespace yq e -i '
        .metadata.namespace = strenv(namespace)
    ' $dir/poa/miner.yaml

    name=$deploymentName yq e -i '
        .spec.template.spec.containers[0].name = strenv(name)
    ' $dir/poa/miner.yaml

    secretName=keystore$i
    name=$secretName yq e -i '
        .spec.template.spec.containers[0].env[1].valueFrom.secretKeyRef.name = strenv(name)
    ' $dir/poa/miner.yaml
    secretName=$secretName yq e -i '
        .spec.template.spec.volumes[2].secret.secretName = strenv(secretName)
    ' $dir/poa/miner.yaml
    # create pod
    kubectl apply -f $dir/poa/miner.yaml
done

