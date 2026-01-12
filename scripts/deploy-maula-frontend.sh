#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
# MAULA FRONTEND DEPLOYMENT SCRIPT
# ═══════════════════════════════════════════════════════════════════════════════
# Deploys the Vite React frontend to https://maula.ai
#
# IMPORTANT PATHS:
#   Local:  /Users/onelastai/Documents/VictoryKit/frontend/maula-frontend/
#   Server: /var/www/maula.ai/live/  ← CORRECT PATH (nginx root)
#
# DO NOT deploy to /var/www/maula.ai/ - that's the parent directory!
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Configuration
EC2_HOST="ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com"
EC2_KEY="/Users/onelastai/Documents/VictoryKit/victorykit.pem"
LOCAL_DIR="/Users/onelastai/Documents/VictoryKit/frontend/maula-frontend"
REMOTE_DIR="/var/www/maula.ai/live" # ← CORRECT! Nginx serves from /live

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  MAULA FRONTEND DEPLOYMENT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${YELLOW}Local:${NC}  $LOCAL_DIR"
echo -e "  ${YELLOW}Server:${NC} $REMOTE_DIR"
echo -e "  ${YELLOW}URL:${NC}    https://maula.ai"
echo ""

# Check if SSH key exists
if [ ! -f "$EC2_KEY" ]; then
	echo -e "${RED}❌ SSH key not found: $EC2_KEY${NC}"
	exit 1
fi

# Check if local directory exists
if [ ! -d "$LOCAL_DIR" ]; then
	echo -e "${RED}❌ Local directory not found: $LOCAL_DIR${NC}"
	exit 1
fi

# Step 1: Build
echo -e "${YELLOW}📦 Step 1: Building frontend...${NC}"
cd "$LOCAL_DIR"
npm run build

# Verify build output
if [ ! -d "dist" ]; then
	echo -e "${RED}❌ Build failed - dist/ directory not found${NC}"
	exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Step 2: Deploy
echo -e "${YELLOW}🚀 Step 2: Deploying to server...${NC}"
echo -e "   Destination: ${BLUE}$REMOTE_DIR${NC}"

scp -i "$EC2_KEY" -r "$LOCAL_DIR/dist/"* "$EC2_HOST:$REMOTE_DIR/"

echo -e "${GREEN}✅ Files uploaded${NC}"
echo ""

# Step 3: Verify
echo -e "${YELLOW}🔍 Step 3: Verifying deployment...${NC}"
ssh -i "$EC2_KEY" "$EC2_HOST" "ls -la $REMOTE_DIR/"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ DEPLOYMENT COMPLETE${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BLUE}Live URL:${NC} https://maula.ai"
echo -e "  ${YELLOW}Hard refresh with:${NC} Cmd+Shift+R"
echo ""
