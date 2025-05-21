#!/bin/bash

# Inputs
# 1. Stack name -- the name of the Pulumi stack to use
# 2. AWS profile -- the AWS profile to use
# 3. AWS region -- the AWS region to use
# 4. API server URL -- the URL of the API server to use. If not provided, the API server URL will be retrieved from the stack
# if stack name is not provided, all available stacks will be listed.
# you can set the stack name to "default" which will not use the specific stack but then the API server URL is required
# this script will send unauthenticated requests to the API server and then filter the CloudWatch logs for 401 responses to /api

STACK_NAME=${1}
AWS_PROFILE=${2}
AWS_REGION=${3}
API_SERVER_URL=${4}
LOG_GROUP_NAME="/aws/eks/wiz-challenge-cluster/cluster"

usage() {
    echo -e "\n$(tput setaf 3)Usage: $0 <stack-name> <aws-profile> <aws-region>$(tput sgr0)"
    exit 1
}

section() {
    echo -e "\n$(tput setaf 6)[INFO] $1$(tput sgr0)"
}

error() {
    echo -e "$(tput setaf 1)[ERROR] $1$(tput sgr0)"
}

if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
    section "Listing available Pulumi stacks:"
    pulumi stack ls -a --json | jq -r '.[].name'
    usage
fi

if [ -z "$API_SERVER_URL" ]; then
    section "Getting API server URL from Pulumi stack: $STACK_NAME"
    API_SERVER_URL=$(pulumi stack -s "$STACK_NAME" output apiServerUrl)
fi

if [ -z "$API_SERVER_URL" ]; then
    error "Failed to retrieve API server URL from Pulumi stack."
    exit 1
fi

echo "$(tput setaf 2)API_SERVER_URL: $API_SERVER_URL$(tput sgr0)"

START_TIME=$(date +%s000)
section "Sending unauthenticated requests to $API_SERVER_URL/api"
for i in {1..5}; do
    printf "Request #%d: " "$i"
    curl -k -sq "$API_SERVER_URL/api" | jq -c '.' || echo "No response"
    sleep 1
done
END_TIME=$(date +%s000)

section "Fetching latest audit log stream from CloudWatch"
LOG_STREAM_NAME=$(aws logs describe-log-streams \
    --log-group-name "$LOG_GROUP_NAME" \
    --order-by "LastEventTime" \
    --descending \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    | jq -r '[.logStreams[] | select(.logStreamName | contains("audit"))][0].logStreamName')

if [ -z "$LOG_STREAM_NAME" ]; then
    error "Could not find an audit log stream."
    exit 1
fi

echo "$(tput setaf 2)LOG_STREAM_NAME: $LOG_STREAM_NAME$(tput sgr0)"

section "Filtering CloudWatch logs for 401 responses to /api"
sleep 5
aws logs filter-log-events \
    --log-stream-names "$LOG_STREAM_NAME" \
    --log-group-name "$LOG_GROUP_NAME" \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --start-time "$START_TIME" \
    --end-time "$END_TIME" \
    --filter-pattern '{ ($.responseStatus.code = 401) && ($.requestURI = "/api") }' \
    | jq -r '.events[] | .message' | jq
