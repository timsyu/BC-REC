#! /bin/bash
dir=$(dirname "$0")

# install jq, yq
apt-get update
apt-get install jq
snap install yq

# install python lib
pip install -r $dir/requirements.txt