#! /bin/bash
dir=$(dirname "$0")
# edit org label
orgName=$1
plantNum=$2
# Deployment
deploymentName=$orgName-dapp-deployname
serviceName=$orgName-dapp-service
name=$deploymentName yq e -i '
    . | select(.kind == "Deployment") |=
    .metadata.name = strenv(name)
' "${dir}"/k8s.yaml
name=$serviceName yq e -i '
    . | select(.kind == "Deployment") |=
    .spec.selector.matchLabels.app = strenv(name)
' "${dir}"/k8s.yaml
name=$serviceName yq e -i '
    . | select(.kind == "Deployment") |=
    .spec.template.metadata.labels.app = strenv(name)
' "${dir}"/k8s.yaml

# set PLANT_NUM
name=$orgName-name yq e -i '
    . | select(.kind == "Deployment") |=
    .spec.template.spec.containers[0].env[0].value = strenv(name)
' "${dir}"/k8s.yaml
desc=$orgName-desc yq e -i '
    . | select(.kind == "Deployment") |=
    .spec.template.spec.containers[0].env[1].value = strenv(desc)
' "${dir}"/k8s.yaml
value=$plantNum yq e -i '
    . | select(.kind == "Deployment") |=
    .spec.template.spec.containers[0].env[2].value = strenv(value)
' "${dir}"/k8s.yaml



# Service
name=$serviceName yq e -i '
    . | select(.kind == "Service") |=
    .metadata.name = strenv(name)
' "${dir}"/k8s.yaml
name=$serviceName yq e -i '
    . | select(.kind == "Service") |=
    .spec.selector.app = strenv(name)
' "${dir}"/k8s.yaml

# save deploymentName to file
echo $deploymentName >> $dir/orglist.txt
# save serviceName to file
echo $serviceName >> $dir/servicelist.txt


# build pod
kubectl apply -f "${dir}"/k8s.yaml

