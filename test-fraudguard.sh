#!/bin/bash

# Test FraudGuard Build and Neural Link Integration
# Run this locally before deployment

set -e

echo "🧪 Testing FraudGuard Build & Neural Link Integration"
echo "====================================================="

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

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test fraudguard build
test_fraudguard_build() {
    log_info "Testing FraudGuard frontend build..."

    cd "frontend/tools/01-fraudguard"

    # Install dependencies
    log_info "Installing dependencies..."
    if npm install; then
        log_success "Dependencies installed"
    else
        log_error "Failed to install dependencies"
        return 1
    fi

    # Build the project
    log_info "Building frontend..."
    if npm run build; then
        log_success "Frontend built successfully"
    else
        log_error "Frontend build failed"
        return 1
    fi

    # Check if dist exists
    if [ -d "dist" ]; then
        log_success "Build output found in dist/"
        ls -la dist/ | head -10
    else
        log_error "No dist directory found"
        return 1
    fi

    cd "$PROJECT_ROOT"
}

# Test neural link interface
test_neural_link() {
    log_info "Testing Neural Link Interface..."

    NEURAL_DIR="frontend/tools/01-fraudguard/neural-link-interface"

    # Check if directory exists
    if [ ! -d "$NEURAL_DIR" ]; then
        log_error "Neural link interface directory not found"
        return 1
    fi

    # Check package.json
    if [ ! -f "$NEURAL_DIR/package.json" ]; then
        log_error "Neural link package.json not found"
        return 1
    fi

    # Check key files
    if [ ! -f "$NEURAL_DIR/services/geminiService.ts" ]; then
        log_error "VictoryKitAIService not found"
        return 1
    fi

    if [ ! -f "$NEURAL_DIR/types.ts" ]; then
        log_error "Types file not found"
        return 1
    fi

    log_success "Neural link interface structure verified"
}

# Test backend AI assistant
test_backend_ai() {
    log_info "Testing Backend AI Assistant..."

    AI_DIR="backend/tools/01-fraudguard/ai-assistant"

    if [ ! -d "$AI_DIR" ]; then
        log_error "AI assistant directory not found"
        return 1
    fi

    cd "$AI_DIR"

    # Check if we can install dependencies
    if npm install --dry-run > /dev/null 2>&1; then
        log_success "AI assistant dependencies check passed"
    else
        log_warning "AI assistant dependencies may have issues"
    fi

    # Check key files
    if [ ! -f "src/server.ts" ]; then
        log_error "AI server file not found"
        return 1
    fi

    if [ ! -f "src/functions/fraudguardFunctions.ts" ]; then
        log_error "FraudGuard functions not found"
        return 1
    fi

    log_success "Backend AI assistant structure verified"
    cd "$PROJECT_ROOT"
}

# Test configuration
test_config() {
    log_info "Testing Configuration Files..."

    # Check neural-config.json
    if [ ! -f "frontend/tools/01-fraudguard/neural-config.json" ]; then
        log_error "neural-config.json not found"
        return 1
    fi

    # Check wsUrl in config
    if grep -q '"wsUrl"' "frontend/tools/01-fraudguard/neural-config.json"; then
        log_success "WebSocket URL configured"
    else
        log_error "WebSocket URL not found in config"
        return 1
    fi

    # Check deploy config
    if [ ! -f "deploy-config.sh" ]; then
        log_error "deploy-config.sh not found"
        return 1
    fi

    log_success "Configuration files verified"
}

# Main test function
main() {
    log_info "Starting FraudGuard integration tests..."

    local tests_passed=0
    local total_tests=4

    if test_config; then
        ((tests_passed++))
    fi

    if test_neural_link; then
        ((tests_passed++))
    fi

    if test_backend_ai; then
        ((tests_passed++))
    fi

    if test_fraudguard_build; then
        ((tests_passed++))
    fi

    echo
    log_info "Test Results: $tests_passed/$total_tests tests passed"

    if [ $tests_passed -eq $total_tests ]; then
        log_success "🎉 All tests passed! Ready for deployment."
        echo
        log_info "Next steps:"
        echo "1. Run: ./fix-vulnerabilities.sh"
        echo "2. Fix SSH key issues (see DEPLOYMENT-FIX.md)"
        echo "3. Run: ./deploy-production.sh"
    else
        log_error "❌ Some tests failed. Please fix issues before deployment."
        return 1
    fi
}

# Run main function
main "$@"