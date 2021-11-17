#! /bin/bash

dir=$(dirname "$0")

while read deploymentName;
do
    echo $deploymentName;
    kubectl delete deployment $deploymentName
done < $dir/devicelist.txt