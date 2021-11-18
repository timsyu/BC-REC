#! /bin/bash

dir=$(dirname "$0")

# total org number 3
# total plant number 5
# total device number 5
filename=$dir/test/distri.json
filename2=$dir/test/org_device_distri.json
namespace=testrecval
kubectl create namespace $namespace
chmod +rw $dir/start.sh
bash $dir/start.sh $filename $filename2 $namespace