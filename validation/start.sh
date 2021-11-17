#! /bin/bash

dir=$(dirname "$0")

# read config
# distribution
result=( $(python "${dir}"/main.py) )
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
    sudo bash "${dir}"/org/start.sh $name $num
done

# read config
# distribution
result2=( $(python "${dir}"/main.py --filename org_device_distri.json) )
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
    num=$(jq -r '.num' <<< $data)
    echo $name
    echo $num
    sudo bash "${dir}"/device/start.sh $name $num
done