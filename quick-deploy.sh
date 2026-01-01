#!/bin/bash

# Quick Deploy Script - Run after SSH is confirmed working

echo "🚀 Quick VictoryKit Deployment"
echo "============================="

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Fix vulnerabilities first
log_info "Fixing security vulnerabilities..."
chmod +x fix-vulnerabilities.sh
./fix-vulnerabilities.sh

# Test build
log_info "Testing FraudGuard build..."
chmod +x test-fraudguard.sh
./test-fraudguard.sh

# Git push
log_info "Pushing changes to GitHub..."
git add .
git commit -m "Deploy $(date +"%Y%m%d_%H%M%S") - Neural Link VictoryKit Integration" || echo "No changes to commit"
git push origin main

# Deploy
log_info "Starting production deployment..."
chmod +x deploy-production.sh
./deploy-production.sh

log_success "🎉 Deployment completed!"
echo ""
echo "🌐 Access your app at: https://fguard.fyzo.xyz"
echo "🤖 Test the Neural Link AI assistant!"
echo "📊 Check backend services on EC2 instance"