#! /bin/bash

dir=$(dirname "$0")

# read config
# distribution
# python3 main.py --filename distri.json --mode plant  --mean 3 --sigma 1 --size 10 --imagename distri.png --seed 4
# total org number 10
# total plant number 30

# result=( $(python3 "${dir}"/main.py  --filename distri.json --mode plant  --mean 3 --sigma 1 --size 10 --imagename distri.png --seed 4) )
# filename=${result[0]}
# echo filename: $filename

# read config
# distribution
# python3 main.py --filename org_device_distri.json --mode device --mean 6 --sigma 2 --size 10 --imagename org_device_distri.png --seed 9
# total org number 10
# total device number 50

# result2=( $(python3 "${dir}"/main.py --filename org_device_distri.json --mode device --mean 6 --sigma 2 --size 10 --imagename org_device_distri.png --seed 9) )
# filename2=${result2[0]}
# echo filename2: $filename2

filename=distri.json
filename2=org_device_distri.json
chmod +rw $dir/start.sh
bash $dir/start.sh $filename $filename2