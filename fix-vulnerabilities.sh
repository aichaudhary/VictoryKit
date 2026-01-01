#!/bin/bash

# VictoryKit Security Vulnerability Fix Script
# Fixes npm audit issues across all packages

set -e

echo "🔧 VictoryKit Security Vulnerability Fix"
echo "========================================"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

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

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to fix vulnerabilities in a directory
fix_vulnerabilities() {
    local dir=$1
    local name=$2

    if [ ! -d "$dir" ]; then
        log_warning "Directory $dir not found - skipping"
        return 0
    fi

    if [ ! -f "$dir/package.json" ]; then
        log_warning "No package.json in $dir - skipping"
        return 0
    fi

    log_info "Fixing vulnerabilities in $name..."

    cd "$dir"

    # Run npm audit fix
    if npm audit fix --audit-level=moderate; then
        log_success "Audit fix completed for $name"
    else
        log_warning "Audit fix failed for $name - continuing..."
    fi

    # Update dependencies
    log_info "Updating dependencies for $name..."
    if npm update; then
        log_success "Dependencies updated for $name"
    else
        log_warning "Dependency update failed for $name"
    fi

    cd "$PROJECT_ROOT"
}

# Main dashboard
fix_vulnerabilities "frontend/main-dashboard" "Main Dashboard"

# Tool frontends
log_info "Processing tool frontends..."
for tool_dir in frontend/tools/*/; do
    if [ -d "$tool_dir" ]; then
        tool_name=$(basename "$tool_dir")
        fix_vulnerabilities "$tool_dir" "Tool: $tool_name"
    fi
done

# Backend shared
fix_vulnerabilities "backend/shared" "Backend Shared"

# Backend tools
log_info "Processing backend tools..."
for tool_dir in backend/tools/*/; do
    if [ -d "$tool_dir" ]; then
        tool_name=$(basename "$tool_dir")
        # Check for different service types
        if [ -d "$tool_dir/api" ]; then
            fix_vulnerabilities "$tool_dir/api" "Backend API: $tool_name"
        fi
        if [ -d "$tool_dir/ai-assistant" ]; then
            fix_vulnerabilities "$tool_dir/ai-assistant" "AI Assistant: $tool_name"
        fi
        if [ -d "$tool_dir/ml-engine" ]; then
            fix_vulnerabilities "$tool_dir/ml-engine" "ML Engine: $tool_name"
        fi
    fi
done

# Final audit check
log_info "Running final security audit..."
if npm audit --audit-level=high; then
    log_success "Security audit passed!"
else
    log_warning "Some vulnerabilities remain - manual review recommended"
fi

log_success "🎉 Vulnerability fix process completed!"
log_info "Remember to test your application thoroughly after these updates."