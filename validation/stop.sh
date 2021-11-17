#! /bin/bash

dir=$(dirname "$0")

$dir/org/stop.sh
$dir/device/stop.sh
$dir/issuer/stop.sh

