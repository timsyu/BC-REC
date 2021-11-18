#! /bin/bash

dir=$(dirname "$0")
namespace=$3
# create k8s namespace
kubectl create namespace $namespace

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

filename=$1
count=$(jq -r '.count' $filename)
echo $count

echo "create org Pod and Org Service"
for (( i=0; i<$count; i++))
do
    data=$(jq -r .data["${i}"] $filename)
    # echo $data
    name=org$(jq -r '.name' <<< $data)
    num=$(jq -r '.num' <<< $data)
    echo $name
    echo $num
    bash "${dir}"/org/start.sh $name $num $namespace
    # sleep 1.5
done
sleep 2

filename2=$2
count=$(jq -r '.count' $filename2)
echo $count
echo "create device Pod"
for (( i=0; i<$count; i++))
do
    data=$(jq -r .data["${i}"] $filename2)
    # echo $data
    name=device$(jq -r '.name' <<< $data)
    orgId=$(jq -r '.orgId' <<< $data)
    echo $name
    echo $orgId
    bash "${dir}"/device/start.sh $name $orgId $namespace
    # sleep 1.5
done

echo "create issuer Pod"
bash "${dir}"/issuer/start.sh $namespace