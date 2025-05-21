#!/bin/bash

# Inputs
# 1. Stack name -- the name of the Pulumi stack to use
# 2. Mongo public DNS -- the public DNS of the MongoDB instance
# if stack name is not provided, list all available stacks.
# if mongo public DNS is not provided, get it from the stack. 
# you can set the stack name to "default" which will not use the specific stack but then the mongo public DNS is required
# this script will check the connectivity to the MongoDB instance
# it will check the SSH connectivity and then the MongoDB connectivity

STACK_NAME=${1}
MONGO_PUBLIC_DNS=${2}

usage() {
    echo -e "\n$(tput setaf 3)Usage: $0 <stack-name> <mongo-public-dns>$(tput sgr0)"
    exit 1
}

section() {
    echo -e "\n$(tput setaf 6)[INFO] $1$(tput sgr0)"
}

success() {
    echo -e "$(tput setaf 2)✔️ $1$(tput sgr0)"
}

fail() {
    echo -e "$(tput setaf 1)❌ $1$(tput sgr0)"
}

if [ -z "${STACK_NAME}" ]; then
    section "No stack name provided. Listing available stacks:"
    pulumi stack ls -a --json | jq -r '.[].name'
    usage
fi

if [ -z "${MONGO_PUBLIC_DNS}" ]; then
    section "Fetching MongoDB Public DNS from Pulumi stack: ${STACK_NAME}"
    MONGO_PUBLIC_DNS=$(pulumi stack -s "${STACK_NAME}" output mongoPublicDns)
fi

echo "$(tput setaf 2)Mongo Public DNS: $MONGO_PUBLIC_DNS$(tput sgr0)"

# SSH check (port 22)
section "Checking SSH connectivity to MongoDB (should succeed)"
nc -z -v -G 10 "${MONGO_PUBLIC_DNS}" 22 &>/dev/null
if [ $? -eq 0 ]; then
    success "Port 22 (SSH) is open - connectivity successful."
else
    fail "Port 22 (SSH) is not reachable -expected to be open."
fi

# Mongo check (port 27017)
section "Checking MongoDB connectivity (should fail)"
nc -z -v -G 10 "${MONGO_PUBLIC_DNS}" 27017 &>/dev/null
if [ $? -ne 0 ]; then
    success "Port 27017 (MongoDB) is closed - expected behavior."
else
    fail "Port 27017 (MongoDB) is open - this may be a misconfiguration."
fi
