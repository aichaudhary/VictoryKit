#!/bin/bash

# ===========================================
# 🛡️  VictoryKit Tool Duplicate Checker
# ===========================================
# This script checks for duplicate tool numbers
# Run this before committing any tool changes
# ===========================================

echo "🛡️  Checking for duplicate tools..."
echo "=================================="

cd "$(dirname "$0")/../backend/tools"

# Check for duplicate numbers
DUPLICATES=$(ls -1 | grep "^[0-9][0-9]-" | cut -d'-' -f1 | sort | uniq -d)

if [ -n "$DUPLICATES" ]; then
    echo "❌ FOUND DUPLICATE TOOL NUMBERS:"
    echo "$DUPLICATES"
    echo ""
    echo "🚫 VIOLATION: Multiple tools with same number detected!"
    echo "📋 Check docs/TOOLS-MASTER-INVENTORY.md for correct names"
    echo "🗑️  Remove duplicates immediately"
    echo ""
    echo "Recent cleanup removed: 31-cloudsecure, 32-apishield"
    exit 1
else
    TOTAL_TOOLS=$(ls -1 | grep "^[0-9][0-9]-" | wc -l)
    echo "✅ No duplicate tool numbers found"
    echo "📊 Total tools: $TOTAL_TOOLS (expected: 50)"
    echo ""
    echo "🎉 All tools are properly numbered!"
fi

echo "=================================="
echo "⚠️  REMEMBER: NO NEW TOOLS ALLOWED"
echo "🔍 Always check docs/TOOLS-MASTER-INVENTORY.md"