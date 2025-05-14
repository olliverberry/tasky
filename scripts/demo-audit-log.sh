#!/bin/bash

STACK_NAME=${1}
AWS_PROFILE=${2}
AWS_REGION=${3}
LOG_GROUP_NAME="/aws/eks/wiz-challenge-cluster/cluster"

API_SERVER_URL=$(pulumi stack -s $STACK_NAME output apiServerUrl)

echo "API_SERVER_URL: $API_SERVER_URL"

# make a few requests to the API server triggering 401 responses
for i in {1..10}; do
    curl -k -sq $API_SERVER_URL/api | jq
    sleep 1
done

LOG_STREAM_NAME=$(aws logs describe-log-streams \
    --log-group-name "$LOG_GROUP_NAME" \
    --order-by "LastEventTime" \
    --descending \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    | jq -r '[.logStreams[] | select(.logStreamName | contains("audit"))][0].logStreamName')

echo "LOG_STREAM_NAME: $LOG_STREAM_NAME"

aws logs filter-log-events \
    --log-stream-names "$LOG_STREAM_NAME" \
    --log-group-name "$LOG_GROUP_NAME" \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION" \
    --filter-pattern '{ ($.responseStatus.code = 401) && ($.requestURI = "/api") }' \
    | jq