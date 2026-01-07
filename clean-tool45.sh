#!/bin/bash
# Clean ALL legacy files from Tool #45 DRPlan

cd /workspaces/VictoryKit/frontend/tools/45-drplan

echo "🧹 Cleaning Tool #45 DRPlan legacy files..."

# Delete ALL legacy config files
rm -f fraudguard-config.json
rm -f BlueTeamOps-config.json
rm -f gdprcompliance-config.json

# Delete neural-link-interface folder
rm -rf neural-link-interface/

echo "✅ Tool #45 DRPlan cleaned!"
echo ""
echo "Remaining files:"
ls -la

echo ""
echo "🎯 Verifying no legacy references..."
grep -r "fraudguard\|fguard\|BlueTeamOps\|gdprcompliance" . --exclude-dir=node_modules --exclude-dir=dist || echo "✅ No legacy references found!"
