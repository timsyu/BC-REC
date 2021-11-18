#! /bin/bash

dir=$(dirname "$0")

#  namespace: testrecval
#  delete all pods and services in namespace
kubectl delete deploy -n testrecval --all
kubectl delete services -n testrecval --all 
#  delete namespace
kubectl delete namespaces testrecval