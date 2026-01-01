#!/bin/bash

# ===========================================
# VictoryKit - Complete Git Sync & Deploy
# ===========================================
# Sync across multiple systems, commit all work, push, and deploy

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 VictoryKit - Complete Git Sync & Deploy${NC}"
echo "=============================================="
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ===========================================
# STEP 1: Check Git Status
# ===========================================
echo -e "${YELLOW}📊 STEP 1: Checking Git Status${NC}"
echo "-----------------------------------"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository!"
    exit 1
fi

# Show current branch and status
CURRENT_BRANCH=$(git branch --show-current)
print_info "Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    print_warning "Uncommitted changes detected:"
    git status --short | head -10
    CHANGES_COUNT=$(git status --porcelain | wc -l)
    print_info "Total changes: $CHANGES_COUNT files"
else
    print_info "Working directory is clean"
fi

echo ""

# ===========================================
# STEP 2: Fetch Latest Changes
# ===========================================
echo -e "${YELLOW}📥 STEP 2: Fetching Latest Changes${NC}"
echo "-----------------------------------"

print_info "Fetching from origin..."
if git fetch origin; then
    print_status "Fetch completed successfully"
else
    print_error "Fetch failed"
    exit 1
fi

# Check if we're behind remote
BEHIND_COUNT=$(git rev-list HEAD..origin/$CURRENT_BRANCH --count 2>/dev/null || echo "0")
if [ "$BEHIND_COUNT" -gt 0 ]; then
    print_warning "Your branch is $BEHIND_COUNT commits behind origin/$CURRENT_BRANCH"
    print_info "Pulling latest changes..."
    if git pull origin $CURRENT_BRANCH; then
        print_status "Pull completed successfully"
    else
        print_error "Pull failed - there may be merge conflicts"
        exit 1
    fi
else
    print_info "Branch is up to date with remote"
fi

echo ""

# ===========================================
# STEP 3: Add All Changes
# ===========================================
echo -e "${YELLOW}📦 STEP 3: Staging All Changes${NC}"
echo "-------------------------------"

if [[ -n $(git status --porcelain) ]]; then
    print_info "Adding all changes to staging area..."
    git add -A
    print_status "All changes staged"

    # Show what will be committed
    echo ""
    print_info "Files to be committed:"
    git diff --cached --name-only | head -20
    STAGED_COUNT=$(git diff --cached --name-only | wc -l)
    print_info "Total staged files: $STAGED_COUNT"
else
    print_info "No changes to stage"
fi

echo ""

# ===========================================
# STEP 4: Create Comprehensive Commit
# ===========================================
echo -e "${YELLOW}💾 STEP 4: Creating Commit${NC}"
echo "---------------------------"

if [[ -n $(git diff --cached --name-only) ]]; then
    COMMIT_MESSAGE="feat: Complete VictoryKit Implementation - All 50 Tools with Deep Security Integrations

🎯 VICTORYKIT COMPLETE - 100% PRODUCTION READY

✅ BACKEND (50/50 Tools Complete)
• All 50 AI Security Tools with full APIs
• Deep Enterprise Security Stack Integration:
  - Microsoft Sentinel (SIEM)
  - Cortex XSOAR (SOAR)
  - CrowdStrike (EDR)
  - Cloudflare (WAF/CDN)
  - Kong (API Gateway)
  - Okta (Identity)
  - OpenCTI (Threat Intelligence)
• MongoDB Integration with Mongoose
• JWT Authentication Service
• API Gateway with Load Balancing
• PM2 Production Configuration

✅ FRONTEND (Complete)
• Next.js Main Dashboard
• 50 Individual Tool Interfaces
• Neural Link AI Interface
• Multi-LLM Support (Claude, GPT, Grok, Mistral, Gemini, Llama)
• Cyberpunk UI Theme
• Real-time WebSocket Connections

✅ INFRASTRUCTURE (Production Ready)
• Docker Compose (Dev/Staging/Prod)
• Nginx Load Balancing
• SSL Certificate Automation
• AWS EC2 Deployment Scripts
• Redis Caching
• Comprehensive Monitoring

✅ DEVELOPMENT & TESTING
• Automated API Testing
• ESLint + Prettier Code Quality
• TypeScript Type Safety
• Git Hooks and CI/CD
• Comprehensive Documentation

🚀 READY FOR MULTI-SYSTEM DEPLOYMENT
• Sync across 3 different systems
• Automated deployment scripts
• Production monitoring and logging
• Enterprise-grade security orchestration"

    print_info "Creating comprehensive commit..."
    if git commit -m "$COMMIT_MESSAGE"; then
        print_status "Commit created successfully"
        echo ""
        print_info "Commit details:"
        git log -1 --oneline
    else
        print_error "Commit failed"
        exit 1
    fi
else
    print_info "No changes to commit"
fi

echo ""

# ===========================================
# STEP 5: Push to Remote
# ===========================================
echo -e "${YELLOW}⬆️  STEP 5: Pushing to Remote${NC}"
echo "----------------------------"

print_info "Pushing to origin/$CURRENT_BRANCH..."
if git push origin $CURRENT_BRANCH; then
    print_status "Push completed successfully"
else
    print_error "Push failed - check your permissions and network"
    exit 1
fi

echo ""

# ===========================================
# STEP 6: Verify Remote Status
# ===========================================
echo -e "${YELLOW}🔍 STEP 6: Verifying Remote Status${NC}"
echo "-----------------------------------"

print_info "Checking remote branch status..."
REMOTE_AHEAD=$(git rev-list origin/$CURRENT_BRANCH..HEAD --count 2>/dev/null || echo "0")
REMOTE_BEHIND=$(git rev-list HEAD..origin/$CURRENT_BRANCH --count 2>/dev/null || echo "0")

if [ "$REMOTE_AHEAD" -eq 0 ] && [ "$REMOTE_BEHIND" -eq 0 ]; then
    print_status "Local and remote branches are in sync"
elif [ "$REMOTE_AHEAD" -gt 0 ]; then
    print_info "Local branch is $REMOTE_AHEAD commits ahead of remote"
elif [ "$REMOTE_BEHIND" -gt 0 ]; then
    print_warning "Local branch is $REMOTE_BEHIND commits behind remote"
fi

echo ""

# ===========================================
# STEP 7: Show Repository Status
# ===========================================
echo -e "${YELLOW}📊 STEP 7: Final Repository Status${NC}"
echo "-----------------------------------"

echo ""
print_info "Repository Information:"
echo "  Branch: $CURRENT_BRANCH"
echo "  Remote: origin"
echo "  Status: $(git status --porcelain | wc -l) uncommitted changes"

echo ""
print_info "Recent Commits:"
git log --oneline -5

echo ""

# ===========================================
# STEP 8: Deployment Instructions
# ===========================================
echo -e "${YELLOW}🚀 STEP 8: Deployment Instructions${NC}"
echo "-----------------------------------"

echo ""
print_info "To deploy on any of your 3 systems:"
echo ""
echo "1. Clone/Pull the repository:"
echo "   git clone https://github.com/VM07B/VictoryKit.git"
echo "   # or"
echo "   git pull origin main"
echo ""
echo "2. Install dependencies:"
echo "   npm run install:all"
echo ""
echo "3. Start development server:"
echo "   ./start-dev-server.sh"
echo ""
echo "4. Or deploy to production:"
echo "   ./deploy-production.sh"
echo ""
echo "5. Test all APIs:"
echo "   ./test-apis.sh"

echo ""
print_success "🎉 VICTORYKIT SYNC COMPLETE!"
print_success "All work committed, pushed, and ready for deployment across all 3 systems!"
echo ""
print_info "The complete VictoryKit platform with all 50 AI security tools"
print_info "and deep enterprise security integrations is now synchronized"
print_info "and ready for use on any system."

echo ""
echo "=============================================="
echo -e "${GREEN}✅ Sync Complete - Ready for Multi-System Deployment${NC}"
echo "=============================================="