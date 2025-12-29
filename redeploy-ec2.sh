#!/bin/bash
# Complete redeployment script for VictoryKit
# Run from codespace: bash redeploy-ec2.sh

set -e

EC2_HOST="ubuntu@ec2-18-140-156-40.ap-southeast-1.compute.amazonaws.com"
EC2_DIR="~/victorykit"
PEM_FILE="victorykit.pem"

echo "🚀 VictoryKit Complete Redeployment"
echo "==================================="

# Check if pem file exists
if [ ! -f "$PEM_FILE" ]; then
    echo "❌ Error: $PEM_FILE not found in current directory"
    echo "   Please ensure victorykit.pem is in /workspaces/VictoryKit/"
    exit 1
fi

chmod 400 "$PEM_FILE"

echo ""
echo "📦 Step 1: Syncing backend files to EC2..."

# Sync the backend folder (excluding node_modules)
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '*.log' \
    --exclude '.env.local' \
    -e "ssh -i $PEM_FILE -o StrictHostKeyChecking=no" \
    backend/ \
    $EC2_HOST:$EC2_DIR/backend/

echo ""
echo "📦 Step 2: Syncing root .env file..."
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no .env $EC2_HOST:$EC2_DIR/

echo ""
echo "⚙️  Step 3: Installing dependencies on EC2..."

ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no $EC2_HOST << 'REMOTE_SCRIPT'
cd ~/victorykit

echo "Installing shared dependencies..."
cd backend/shared && npm install --production && cd ../..

echo "Installing tool dependencies..."
for tool in 04-malwarehunter 05-phishguard 06-vulnscan 07-pentestai 08-securecode 09-compliancecheck 10-dataguardian; do
    if [ -d "backend/tools/$tool/api" ]; then
        echo "  → Installing $tool dependencies..."
        cd backend/tools/$tool/api && npm install --production && cd ../../../..
    fi
done

echo ""
echo "🔄 Restarting PM2 services..."
pm2 restart all

echo ""
echo "⏳ Waiting 5 seconds for services to start..."
sleep 5

echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🔍 Testing health endpoints..."
echo "MalwareHunter (4004): $(curl -s http://localhost:4004/health 2>/dev/null || echo 'FAILED')"
echo "PhishGuard (4005): $(curl -s http://localhost:4005/health 2>/dev/null || echo 'FAILED')"
echo "VulnScan (4006): $(curl -s http://localhost:4006/health 2>/dev/null || echo 'FAILED')"
echo "PenTestAI (4007): $(curl -s http://localhost:4007/health 2>/dev/null || echo 'FAILED')"
echo "SecureCode (4008): $(curl -s http://localhost:4008/health 2>/dev/null || echo 'FAILED')"
echo "ComplianceCheck (4009): $(curl -s http://localhost:4009/health 2>/dev/null || echo 'FAILED')"
echo "DataGuardian (4010): $(curl -s http://localhost:4010/health 2>/dev/null || echo 'FAILED')"

echo ""
echo "📋 Checking for errors in logs..."
pm2 logs --nostream --lines 5 2>/dev/null | grep -i error || echo "No recent errors found"

REMOTE_SCRIPT

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Test from outside:"
echo "   curl http://18.140.156.40:4004/health"
echo "   curl http://api.fyzo.xyz/health (if nginx configured)"
