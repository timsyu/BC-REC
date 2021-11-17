#! /bin/bash

dir=$(dirname "$0")
deviceName=$1
targetOrg=$2
# edit org address and plant address
# Deployment
name=$deviceName-dapp yq e -i '
    .metadata.name = strenv(name)
' $dir/k8s.yaml
name=$deviceName-dapp yq e -i '
    .spec.selector.matchLabels.app = strenv(name) |
    .spec.template.metadata.labels.app = strenv(name)
' $dir/k8s.yaml
value=$targetOrg yq e -i '
    .spec.template.spec.containers[0].env[0].value = strenv(value)
' $dir/k8s.yaml

# build pod
# kubectl apply -f $dir/k8s.yaml