#!/bin/bash
# Clean ALL legacy files from Tool #44 BackupGuard

cd /workspaces/VictoryKit/frontend/tools/44-backupguard

echo "🧹 Cleaning Tool #44 BackupGuard legacy files..."

# Delete legacy config files
rm -f fraudguard-config.json
rm -f RedTeamSim-config.json
rm -f privacyshield-config.json

# Delete neural-link-interface folder
rm -rf neural-link-interface/

echo "✅ Tool #44 BackupGuard cleaned!"
echo ""
echo "Remaining files:"
ls -la

echo ""
echo "🎯 Verifying no legacy references..."
grep -r "fraudguard\|fguard\|RedTeamSim\|privacyshield" . --exclude-dir=node_modules --exclude-dir=dist || echo "✅ No legacy references found!"
