#! /bin/bash

dir=$(dirname "$0")

# init org device file and permissions
# create files
touch $dir/org/orglist.txt
touch $dir/org/servicelist.txt
touch $dir/device/devicelist.txt
# edit file permissions
chmod +rw $dir/org/orglist.txt
chmod +rw $dir/org/servicelist.txt
chmod +rw $dir/device/devicelist.txt

chmod +rw $dir/org/start.sh
chmod +rw $dir/iusser/start.sh
chmod +rw $dir/device/start.sh

chmod +rw $dir/org/stop.sh
chmod +rw $dir/iusser/stop.sh
chmod +rw $dir/device/stop.sh

# empty file
true > $dir/org/orglist.txt
true > $dir/org/servicelist.txt
true > $dir/device/devicelist.txt

# read config
# distribution
result=( $(python3 "${dir}"/main.py --mode plant) )
filename=${result[0]}
echo filename: $filename
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
    bash "${dir}"/org/start.sh $name $num
    # sleep 1.5
done
sleep 2
# read config
# distribution
result2=( $(python3 "${dir}"/main.py --filename org_device_distri.json --mode device) )
filename2=${result2[0]}
echo filename2: $filename2
count=$(jq -r '.count' $filename2)
# counts=$(jq -r '.counts[]' <<<$json)
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
    bash "${dir}"/device/start.sh $name $orgId
    # sleep 1.5
done