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
genesis=$dir/pow/pow.json
chmod +r $genesis
content=$(jq '.' $genesis)

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
    serviceName=miner$i-service
    # Deployment
    name=$deploymentName yq e -i '
        . | select(.kind == "Deployment") |=
        .metadata.name = strenv(name)
    ' $dir/pow/node.yaml
    namespace=$namespace yq e -i '
        . | select(.kind == "Deployment") |=
        .metadata.namespace = strenv(namespace)
    ' $dir/pow/node.yaml

    name=$deploymentName yq e -i '
        . | select(.kind == "Deployment") |=
        .spec.template.spec.containers[0].name = strenv(name)
    ' $dir/pow/node.yaml

    name=$serviceName yq e -i '
        . | select(.kind == "Deployment") |=
        .spec.selector.matchLabels.app = strenv(name)
    ' $dir/pow/node.yaml

    name=$serviceName yq e -i '
        . | select(.kind == "Deployment") |=
        .spec.template.metadata.labels.app = strenv(name)
    ' $dir/pow/node.yaml

    # Service
    name=$serviceName yq e -i '
        . | select(.kind == "Service") |=
        .metadata.name = strenv(name)
    ' $dir/pow/node.yaml
    namespace=$namespace yq e -i '
        . | select(.kind == "Service") |=
        .metadata.namespace = strenv(namespace)
    ' $dir/pow/node.yaml
    name=$serviceName yq e -i '
        . | select(.kind == "Service") |=
        .spec.selector.app = strenv(name)
    ' $dir/pow/node.yaml
    # create pod
    kubectl apply -f $dir/pow/node.yaml
done

