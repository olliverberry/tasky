#!/bin/bash

# grab input variables
AWS_PROFILE=${1}
AWS_REGION=${2}

eksctl utils write-kubeconfig \
    --cluster "wiz-challenge-cluster" \
    --kubeconfig ./kubeconfig.yaml \
    --profile $AWS_PROFILE \
    --region $AWS_REGION

KUBECONFIG=./kubeconfig.yaml kubectl get pods
