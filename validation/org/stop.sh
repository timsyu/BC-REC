#! /bin/bash

dir=$(dirname "$0")

# delete org deployment
while read deploymentName;
do
    echo $deploymentName;
    kubectl delete deployment $deploymentName
done < $dir/orglist.txt

# delete org service
while read serviceName;
do
    echo $serviceName;
    kubectl delete service $serviceName
done < $dir/servicelist.txt