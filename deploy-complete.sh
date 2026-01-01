#!/bin/bash

# VictoryKit Complete Deployment Script
# Run this after fixing SSH key permissions

set -e

echo "🚀 VictoryKit Complete Deployment"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Step 1: Set SSH key permissions
log_info "Setting SSH key permissions..."
chmod 400 /workspaces/VictoryKit/victorykit.pem

# Step 2: Test SSH connection
log_info "Testing SSH connection..."
if ssh -i /workspaces/VictoryKit/victorykit.pem -o StrictHostKeyChecking=no -o ConnectTimeout=10 ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com "echo 'SSH test successful'" 2>/dev/null; then
    log_success "SSH connection working"
else
    log_error "SSH connection failed - check your key and EC2 instance"
    exit 1
fi

# Step 3: Fix vulnerabilities
log_info "Fixing security vulnerabilities..."
if [ -f "fix-vulnerabilities.sh" ]; then
    chmod +x fix-vulnerabilities.sh
    ./fix-vulnerabilities.sh
else
    log_warning "fix-vulnerabilities.sh not found - skipping vulnerability fixes"
fi

# Step 4: Test fraudguard build
log_info "Testing FraudGuard build..."
if [ -f "test-fraudguard.sh" ]; then
    chmod +x test-fraudguard.sh
    if ./test-fraudguard.sh; then
        log_success "FraudGuard tests passed"
    else
        log_error "FraudGuard tests failed - fix issues before deployment"
        exit 1
    fi
else
    log_warning "test-fraudguard.sh not found - skipping tests"
fi

# Step 5: Git commit and push
log_info "Committing and pushing changes..."
git add .
git commit -m "Deploy $(date +"%Y%m%d_%H%M%S") - Neural Link VictoryKit Integration" || log_warning "No changes to commit"
git push origin main

# Step 6: Deploy
log_info "Starting production deployment..."
if [ -f "deploy-production.sh" ]; then
    chmod +x deploy-production.sh
    ./deploy-production.sh
else
    log_error "deploy-production.sh not found"
    exit 1
fi

log_success "🎉 Deployment completed successfully!"
log_info "Access your application at: https://fguard.fyzo.xyz"
log_info "Test the Neural Link interface - it should now connect to VictoryKit AI backend!"