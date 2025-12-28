#!/bin/bash

# ===================================
# MAULA.AI - Phase 1 Setup Script
# ===================================

echo "🚀 Starting MAULA.AI Phase 1 Setup..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install Auth Service dependencies
echo "📦 Installing Auth Service dependencies..."
cd /workspaces/VictoryKit/backend/shared-services/auth-service
npm install
if [ $? -eq 0 ]; then
    echo "✅ Auth Service dependencies installed"
else
    echo "❌ Failed to install Auth Service dependencies"
    exit 1
fi
echo ""

# Install API Gateway dependencies
echo "📦 Installing API Gateway dependencies..."
cd /workspaces/VictoryKit/backend/shared-services/api-gateway
npm install
if [ $? -eq 0 ]; then
    echo "✅ API Gateway dependencies installed"
else
    echo "❌ Failed to install API Gateway dependencies"
    exit 1
fi
echo ""

# Install Main Dashboard dependencies
echo "📦 Installing Main Dashboard dependencies..."
cd /workspaces/VictoryKit/frontend/main-dashboard
npm install
if [ $? -eq 0 ]; then
    echo "✅ Main Dashboard dependencies installed"
else
    echo "❌ Failed to install Main Dashboard dependencies"
    exit 1
fi
echo ""

echo "✅ All dependencies installed successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Make sure MongoDB is running (or use MongoDB Atlas)"
echo "2. Update .env files with your configuration"
echo "3. Start services:"
echo ""
echo "   # Start Auth Service"
echo "   cd backend/shared-services/auth-service && npm run dev"
echo ""
echo "   # Start API Gateway (in new terminal)"
echo "   cd backend/shared-services/api-gateway && npm run dev"
echo ""
echo "   # Start Main Dashboard (in new terminal)"
echo "   cd frontend/main-dashboard && npm run dev"
echo ""
echo "4. Test endpoints:"
echo "   curl http://localhost:5000/health  # Auth Service"
echo "   curl http://localhost:4000/health  # API Gateway"
echo ""
echo "🚀 Happy coding!"
