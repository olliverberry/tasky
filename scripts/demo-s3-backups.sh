#!/bin/bash

# Inputs
# 1. Stack name -- the name of the Pulumi stack to use
# 2. S3 bucket URL -- the URL of the S3 bucket to use
# if stack name is not provided, list all available stacks.
# you can set the stack name to "default" which will not use the specific stack but then the s3 bucket URL is required
# this script will list the contents of the S3 bucket and allow you to download a file from the bucket

STACK_NAME=${1}
S3_BUCKET_URL=${2}

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
    echo -e "\n$(tput setaf 3)Usage: $0 <stack-name> <s3-bucket-url>$(tput sgr0)"
    exit 1
}

# Input validation
if [ -z "$STACK_NAME" ]; then
    section "No stack name provided. Listing available Pulumi stacks:"
    pulumi stack ls -a --json | jq -r '.[].name'
    usage
fi

# Fetch S3 bucket URL from Pulumi stack
if [ -z "$S3_BUCKET_URL" ]; then
    section "Fetching s3Url from Pulumi stack: $STACK_NAME"
    S3_BUCKET_URL=$(pulumi stack -s "$STACK_NAME" output s3Url)
fi

success "Retrieved S3 bucket URL: $S3_BUCKET_URL"

# List S3 contents
section "Listing contents of the S3 bucket"
RES=$(curl -s "$S3_BUCKET_URL")

if [ -z "$RES" ]; then
    fail "Failed to retrieve or empty response from: $S3_BUCKET_URL"
    exit 1
fi

echo "$RES" | xmllint --format - 2>/dev/null || {
    fail "Failed to parse S3 XML response. Is xmllint installed?"
    echo "$RES"
}

echo -e "\nEnter the full key of the file you want to download:"
read -r SELECTED_KEY

if [[ -z "$SELECTED_KEY" ]]; then
    fail "No key entered. Aborting download."
    exit 1
fi

DOWNLOAD_URL="${S3_BUCKET_URL}/${SELECTED_KEY}"
section "Downloading: $SELECTED_KEY"
curl -O "$DOWNLOAD_URL" && success "File downloaded successfully: $SELECTED_KEY" || fail "Download failed"