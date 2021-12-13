#! /bin/bash

# install jq, yq
apt-get update
apt-get install jq
snap install yq

# install python lib
pip install -r requirements.txt