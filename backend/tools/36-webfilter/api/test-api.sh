#!/bin/bash

# WebFilter API Test Script
echo "🧪 Testing WebFilter API..."

# Wait for server to start
sleep 5

# Test health endpoint
echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:4025/health)
if [[ $HEALTH_RESPONSE == *"200"* ]]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi

# Test API info endpoint
echo "Testing API info endpoint..."
INFO_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:4025/api/v1/webfilter)
if [[ $INFO_RESPONSE == *"200"* ]]; then
    echo "✅ API info endpoint passed"
else
    echo "❌ API info endpoint failed"
fi

echo "🎉 WebFilter API tests completed!"