#!/bin/bash

STACK_NAME=${1}

usage() {
    echo "Usage: $0 <stack-name>"
    exit 1
}

if [ -z "${STACK_NAME}" ]; then
    usage
fi

MONGO_PUBLIC_DNS=$(pulumi stack -s ${STACK_NAME} output mongoPublicDns)

echo "Mongo Public DNS: ${MONGO_PUBLIC_DNS}"

echo "Checking SSH connectivity to MongoDB on port 22. This should succeed due to Security Group rules."
nc -z -v -G 10 ${MONGO_PUBLIC_DNS} 22

echo "Checking MongoDB connectivity on port 27017. This should fail due to Security Group rules."
nc -z -v -G 10 ${MONGO_PUBLIC_DNS} 27017
