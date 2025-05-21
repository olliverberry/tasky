#!/bin/bash

# Inputs
# 1. Cluster name -- the name of the EKS cluster to use
# 2. Profile -- the AWS profile to use
# 3. Region -- the AWS region to use
# this script will execute the 'kube-proxy -h' command 20 times inside the kube-proxy pod
CLUSTER_NAME=${1}
PROFILE=${2}
REGION=${3}
KUBECONFIG_FILE=./kubeconfig.yaml

# Output formatting
section() {
    echo -e "\n$(tput setaf 6)[INFO] $1$(tput sgr0)"
}

success() {
    echo -e "$(tput setaf 2)✔️ $1$(tput sgr0)"
}

fail() {
    echo -e "$(tput setaf 1)❌ $1$(tput sgr0)"
}

usage() {
    echo -e "$(tput setaf 3)Usage: $0 <cluster-name> <profile> <region>$(tput sgr0)"
    exit 1
}

# Input check
if [ -z "$CLUSTER_NAME" ] || [ -z "$PROFILE" ] || [ -z "$REGION" ]; then
    usage
fi

section "Writing kubeconfig for cluster: $CLUSTER_NAME"
eksctl utils write-kubeconfig \
    --cluster "$CLUSTER_NAME" \
    --kubeconfig "$KUBECONFIG_FILE" \
    --profile "$PROFILE" \
    --region "$REGION"

success "Kubeconfig written to $KUBECONFIG_FILE"

section "Executing 'kube-proxy -h' inside kube-proxy pod 20 times"
for i in {1..20}; do
    printf "[%02d] " "$i"
    if KUBECONFIG="$KUBECONFIG_FILE" kubectl exec -n kube-system \
        $(KUBECONFIG="$KUBECONFIG_FILE" kubectl get pods -n kube-system | awk '{if ($1 ~ /kube-proxy/) print $1}' | head -n 1) \
        -- kube-proxy -h &>/dev/null; then
        echo "$(tput setaf 2)Success$(tput sgr0)"
    else
        echo "$(tput setaf 1)Failed$(tput sgr0)"
    fi
    sleep 1
done
