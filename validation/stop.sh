#! /bin/bash

dir=$(dirname "$0")

#  namespace: recval
#  delete all pods in namespace
kubectl delete deploy -n recval --all
kubectl delete services -n recval --all
#  delete namespace
kubectl delete namespaces recval
