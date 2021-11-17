#! /bin/bash

dir=$(dirname "$0")

chmod +e $dir/org/stop.sh
chmod +e $dir/issuer/stop.sh
chmod +e $dir/device/stop.sh

$dir/org/stop.sh
$dir/device/stop.sh
$dir/issuer/stop.sh

