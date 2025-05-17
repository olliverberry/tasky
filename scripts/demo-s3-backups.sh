#!/bin/bash

STACK_NAME=${1}

_usage() {
    echo "Usage: $0 <stack-name> <aws-profile> <aws-region>"
    exit 1
}


S3_BUCKET_URL=$(pulumi stack -s ${STACK_NAME} output s3Url)

echo "S3_BUCKET_URL: ${S3_BUCKET_URL}"
echo ""
echo "Listing contents of the bucket:"

# list the contents of the bucket
RES=$(curl -s "$S3_BUCKET_URL")
echo "$RES" | xmllint --format -
