#!/bin/bash

IMAGE_NAME=${1}

# Output formatting
section() {
    echo -e "\n$(tput setaf 6)[INFO] $1$(tput sgr0)"
}

success() {
    echo -e "\n$(tput setaf 2)✔️ $1$(tput sgr0)"
}

fail() {
    echo -e "\n$(tput setaf 1)❌ $1$(tput sgr0)"
}

usage() {
    echo -e "$(tput setaf 3)Usage: $0 <image-name>$(tput sgr0)"
    exit 1
}

# Input validation
if [ -z "$IMAGE_NAME" ]; then
    usage
fi

section "Inspecting contents of /app in Docker image: $IMAGE_NAME"

docker run --rm --entrypoint sh "$IMAGE_NAME" -c '
echo "📁 Listing /app directory contents:"
ls -la /app

echo ""
echo "📄 Reading wizexercise.txt:"
cat /app/wizexercise.txt 2>/dev/null || echo "File not found."
echo ""
' || {
    fail "Failed to inspect Docker image: $IMAGE_NAME"
    exit 1
}

success "Docker image inspection complete."
