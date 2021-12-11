#! /bin/bash

dir=$(dirname "$0")
namespace=recval
# create k8s namespace
kubectl create namespace $namespace

# read config
configPath=$dir/config.json

# blockchain
blockchain=$(jq -r '.blockchain' $configPath)
platform=$(jq -r '.platform' <<< $blockchain)
consensus=$(jq -r '.consensus' <<< $blockchain)
orgIsMiner=$(jq -r '.orgIsMiner' <<< $blockchain)
miner=$(jq -r '.miner' <<< $blockchain)
minerNum=$(jq -r '.num' <<< $miner)
echo consensus: $consensus
echo orgIsMiner: $orgIsMiner
if [[ $consensus == "pow" ]];
then
    chmod +rw $dir/blockchain/startpow.sh
    bash $dir/blockchain/startpow.sh $minerNum $namespace
elif [[ $consensus == "poa" ]];
then
    chmod +rw $dir/blockchain/startpoa.sh
    bash $dir/blockchain/startpoa.sh $minerNum $namespace
fi

# ------------------------------------

distribution=$(jq -r '.distribution' $configPath)
orgNum=$(jq -r '.orgNum' <<< $distribution)

org2plant=$(jq -r '.org2plant' <<< $distribution)
org2plant_methods=$(jq -r '.methods' <<< $org2plant)
org2plant_meau=$(jq -r '.meau' <<< $org2plant)
org2plant_sigma=$(jq -r '.sigma' <<< $org2plant)
org2plant_seed=$(jq -r '.seed' <<< $org2plant)
# echo $org2plant_methods
# echo $org2plant_meau
# echo $org2plant_sigma
org2device=$(jq -r '.org2device' <<< $distribution)
org2device_methods=$(jq -r '.methods' <<< $org2device)
org2device_meau=$(jq -r '.meau' <<< $org2device)
org2device_sigma=$(jq -r '.sigma' <<< $org2device)
org2device_seed=$(jq -r '.seed' <<< $org2device)
# echo $org2device_methods
# echo $org2device_meau
# echo $org2device_sigma


# distribution
result=( $(python3 "${dir}"/main.py  --filename distri.json --mode plant  --mean $org2plant_meau --sigma $org2plant_sigma --size $orgNum --imagename distri.png --seed $org2plant_seed) )
filename=${result[0]}
total_org_num=${result[1]}
total_plant_num=${result[2]}
echo filename: $filename
echo total org number: $total_org_num
echo total plant number: $total_plant_num


result2=( $(python3 "${dir}"/main.py --filename org_device_distri.json --mode device --mean $org2device_meau --sigma $org2device_sigma --size $orgNum --imagename org_device_distri.png --seed $org2device_seed) )
filename2=${result2[0]}
total_org_num=${result2[1]}
total_device_num=${result2[2]}
echo filename2: $filename2
echo total org number: $total_org_num
echo total deivce number: $total_device_num

# filename=distri.json
# filename2=org_device_distri.json

chmod +rw $dir/start.sh
bash $dir/start.sh $filename $filename2 $namespace $orgIsMiner

