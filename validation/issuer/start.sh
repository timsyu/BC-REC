#! /bin/bash
dir=$(dirname "$0")

# edit namespace
namespace=$1

namespace=$namespace yq e -i '
    .metadata.namespace = strenv(namespace)
' $dir/k8s.yaml

# build pod
kubectl apply -f "${dir}"/k8s.yaml