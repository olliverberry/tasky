#!/bin/bash

STACK_NAME=${1}

usage() {
    echo "Usage: $0 <stack-name>"
    exit 1
}

if [ -z "${STACK_NAME}" ]; then
    usage
fi

S3_BUCKET_URL=$(pulumi stack -s ${STACK_NAME} output s3Url)

echo "S3_BUCKET_URL: ${S3_BUCKET_URL}"
echo "Listing contents of the bucket:"

# list the contents of the bucket
RES=$(curl -s "$S3_BUCKET_URL")
echo "$RES" | xmllint --format -
