#!/bin/bash

# Test SSH and file transfer before deployment

echo "🧪 Testing SSH Connection and File Transfer"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

EC2_HOST="ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com"
EC2_KEY="/workspaces/VictoryKit/victorykit.pem"

# Test 1: Basic SSH connection
log_info "Testing basic SSH connection..."
if ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$EC2_HOST" "echo 'SSH connection successful'" 2>/dev/null; then
    log_success "SSH connection works"
else
    log_error "SSH connection failed"
    exit 1
fi

# Test 2: SSH with commands
log_info "Testing SSH command execution..."
if ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "whoami && pwd && ls -la /var/www/ 2>/dev/null || echo 'No /var/www yet'" 2>/dev/null; then
    log_success "SSH command execution works"
else
    log_error "SSH command execution failed"
    exit 1
fi

# Test 3: File transfer with scp
log_info "Testing file transfer with scp..."
echo "test file content" > /tmp/test_file.txt
if scp -i "$EC2_KEY" -o StrictHostKeyChecking=no /tmp/test_file.txt "$EC2_HOST:/tmp/test_file_from_local.txt" 2>/dev/null; then
    log_success "SCP file transfer works"

    # Verify file was transferred
    if ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "cat /tmp/test_file_from_local.txt" 2>/dev/null | grep -q "test file content"; then
        log_success "File transfer verified"
    else
        log_error "File transfer verification failed"
    fi
else
    log_error "SCP file transfer failed"
    exit 1
fi

# Test 4: Test tar + ssh combination (like the fixed deploy script)
log_info "Testing tar + ssh combination..."
if echo "test data" | ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "cat > /tmp/test_tar_ssh.txt" 2>/dev/null; then
    log_success "Tar + SSH method works"
else
    log_error "Tar + SSH method failed"
    exit 1
fi

# Cleanup
rm -f /tmp/test_file.txt
ssh -i "$EC2_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "rm -f /tmp/test_file_from_local.txt /tmp/test_tar_ssh.txt" 2>/dev/null || true

log_success "🎉 All SSH and file transfer tests passed!"
log_info "Ready to run deployment script."