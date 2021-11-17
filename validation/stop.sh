#! /bin/bash

dir=$(dirname "$0")

# chmod +x $dir/org/stop.sh
# chmod +x $dir/issuer/stop.sh
# chmod +x $dir/device/stop.sh

# $dir/org/stop.sh
# $dir/device/stop.sh
# $dir/issuer/stop.sh

#  namespace: recval
 kubectl delete deploy -n recval --all