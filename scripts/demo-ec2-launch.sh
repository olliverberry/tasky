#!/usr/bin/env bash
set -euo pipefail

# Inputs with defaults
REGION=${1:-us-east-1}
PROFILE=${2:-wiz-demo-user}
SECURITY_GROUP_ID=${3:-sg-0154428bd2f6843f1}
SUBNET_ID=${4:-subnet-057870262b7a69ca5}
UNAPPROVED_AMI_ID=${5:-ami-000cbb57a216254e2}
INSTANCE_TYPE=${6:-t2.micro}
KEY_NAME=${7:-wiz-challenge-key-pair}
APPROVED_AMI_ID=${8:-ami-055744c75048d8296}

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

# Unapproved AMI test (should be blocked)
section "Attempting to launch EC2 with UNAPPROVED AMI ($UNAPPROVED_AMI_ID)"
if aws ec2 run-instances \
    --region "$REGION" \
    --profile "$PROFILE" \
    --image-id "$UNAPPROVED_AMI_ID" \
    --instance-type "$INSTANCE_TYPE" \
    --key-name "$KEY_NAME" \
    --security-group-ids "$SECURITY_GROUP_ID" \
    --subnet-id "$SUBNET_ID" \
    --count 1 \
    --associate-public-ip-address 2> /tmp/deny.log; then
    fail "Launch with unapproved AMI unexpectedly succeeded"
    exit 1
else
    success "Launch correctly denied for unapproved AMI"
    echo -e "\n$(tput setaf 3)[AWS Deny Response]$(tput sgr0)"
    cat /tmp/deny.log
fi

# Approved AMI test (should succeed)
section "Attempting to launch EC2 with APPROVED AMI ($APPROVED_AMI_ID)"
LAUNCH_OUTPUT=$(aws ec2 run-instances \
    --region "$REGION" \
    --profile "$PROFILE" \
    --image-id "$APPROVED_AMI_ID" \
    --instance-type "$INSTANCE_TYPE" \
    --key-name "$KEY_NAME" \
    --security-group-ids "$SECURITY_GROUP_ID" \
    --subnet-id "$SUBNET_ID" \
    --count 1 \
    --associate-public-ip-address \
    --output json)

INSTANCE_ID=$(echo "$LAUNCH_OUTPUT" | jq -r '.Instances[0].InstanceId')

if [ -z "$INSTANCE_ID" ]; then
    fail "Launch succeeded but no Instance ID was returned"
    exit 1
fi

success "Launch with approved AMI succeeded (Instance ID: $INSTANCE_ID)"

# Wait for instance to be running
section "Waiting for instance to enter 'running' state"
aws ec2 wait instance-running \
    --instance-ids "$INSTANCE_ID" \
    --region "$REGION" \
    --profile "$PROFILE"
success "Instance is now running"

# Cleanup
section "Terminating instance to avoid ongoing charges"
aws ec2 terminate-instances \
    --instance-ids "$INSTANCE_ID" \
    --region "$REGION" \
    --profile "$PROFILE" > /dev/null

success "Instance $INSTANCE_ID scheduled for termination"
