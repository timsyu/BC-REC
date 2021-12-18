#! /bin/bash
dir=$(dirname "$0")

namespace=$1

# set yaml
namespace=$namespace yq e -i '
    . | select(.kind == "Deployment") |=
    .metadata.namespace = strenv(namespace)
' "${dir}"/monitor.yaml

# build pod
kubectl apply -f "${dir}"/monitor.yaml