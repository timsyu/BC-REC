#! /bin/bash

dir=$(dirname "$0")
namespace=$3
orgIsMiner=$4

# create org device file and permissions
# create files
touch $dir/org/orglist.txt
touch $dir/org/servicelist.txt
touch $dir/device/devicelist.txt
# edit file permissions
chmod +rw $dir/org/orglist.txt
chmod +rw $dir/org/servicelist.txt
chmod +rw $dir/device/devicelist.txt

chmod +x $dir/org/start.sh
chmod +x $dir/issuer/start.sh
chmod +x $dir/device/start.sh

# empty file
true > $dir/org/orglist.txt
true > $dir/org/servicelist.txt
true > $dir/device/devicelist.txt
# ------------------------------
echo "create 1 issuer Pod"
bash "${dir}"/issuer/start.sh $namespace
# ------------------------------
filename=$1
count=$(jq -r '.count' $filename)
echo $count
echo "create $count org Pods and Org Services"
for (( i=0; i<$count; i++))
do
    data=$(jq -r .data["${i}"] $filename)
    # echo $data
    name=org$(jq -r '.name' <<< $data)
    num=$(jq -r '.num' <<< $data)
    # echo $name
    # echo $num
    bash "${dir}"/org/start.sh $name $num $namespace $orgIsMiner
    # sleep 1.5
done
sleep 2

# ------------------------------
filename2=$2
count=$(jq -r '.count' $filename2)
echo $count
echo "create $count device Pods"
for (( i=0; i<$count; i++))
do
    data=$(jq -r .data["${i}"] $filename2)
    # echo $data
    name=device$(jq -r '.name' <<< $data)
    orgId=$(jq -r '.orgId' <<< $data)
    # echo $name
    # echo $orgId
    bash "${dir}"/device/start.sh $name $orgId $namespace
    # sleep 1.5
done

# ------------------------------
echo "create 1 monitor Pod"

# set distri config
chmod +rw $dir/distribution-config.yaml
orgDeviceFile=$filename2
orgPlantFile=$filename
chmod +r $orgDeviceFile
chmod +r $orgPlantFile
orgDeviceContent=$(jq '.' $orgDeviceFile)
orgPlantContent=$(jq '.' $orgPlantFile)

namespace=$namespace yq e -i '
        .metadata."namespace" = strenv(namespace)
' $dir/distribution-config.yaml
content=$orgDeviceContent yq e -i --prettyPrint '
        .data."org_device_distribution.json" = strenv(content)
' $dir/distribution-config.yaml
content=$orgPlantContent yq e -i --prettyPrint '
        .data."org_plant_distribution.json" = strenv(content)
' $dir/distribution-config.yaml

# build distri config
kubectl apply -f "${dir}"/distribution-config.yaml

# build monitor Pod
bash "${dir}"/monitor/start.sh $namespace