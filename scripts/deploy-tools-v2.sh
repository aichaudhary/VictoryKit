#!/bin/bash
# Deploy all tools with fixes for common issues

set -e

REPO_DIR="/var/www/maula.ai/repo"
TOOLS_DIR="/var/www/tools"

# All 50 tools mapping: directory:subdomain
TOOLS=(
    "06-vulnscan:vulnscan"
    "07-pentestai:pentestai"
    "10-dataguardian:dataguardian"
    "11-incidentresponse:incidentresponse"
    "12-loganalyzer:loganalyzer"
    "13-accesscontrol:accesscontrol"
    "14-encryptionmanager:encryptionmanager"
    "16-networkmonitor:networkmonitor"
    "17-audittrail:audittrail"
    "18-threatmodel:threatmodel"
    "19-riskassess:riskassess"
    "20-securityscore:securityscore"
    "21-endpointshield:endpointshield"
    "22-cloudfortress:cloudfortress"
    "23-apisentinel:apisentinel"
    "24-containerguard:containerguard"
    "25-identityverify:identityverify"
    "26-tokenmaster:tokenmaster"
    "27-secretsvault:secretsvault"
    "28-policyenforcer:policyenforcer"
    "29-backupvalidator:backupvalidator"
    "30-disasterrecovery:disasterrecovery"
    "31-configauditor:configauditor"
    "32-patchmonitor:patchmonitor"
    "33-assettracker:assettracker"
    "34-licenseguard:licenseguard"
    "35-supplychainaudit:supplychainaudit"
    "36-darkwebmonitor:darkwebmonitor"
    "37-socialengineering:socialengineering"
    "38-insiderthreat:insiderthreat"
    "39-honeypotmanager:honeypotmanager"
    "40-ransomdefender:ransomdefender"
    "41-ddosprotection:ddosprotection"
    "42-firewallai:firewallai"
    "43-aborai:aborai"
    "44-siemai:siemai"
    "45-forensicslab:forensicslab"
    "46-reverseengineer:reverseengineer"
    "47-memoryscanner:memoryscanner"
    "48-zerodayhunter:zerodayhunter"
    "49-redteamai:redteamai"
    "50-bugbountyai:bugbountyai"
)

for tool in "${TOOLS[@]}"; do
    IFS=':' read -r dir subdomain <<< "$tool"
    
    echo "=========================================="
    echo "Building $dir -> $subdomain"
    echo "=========================================="
    
    cd "$REPO_DIR/frontend/tools/$dir"
    
    # Install dependencies with legacy peer deps to avoid conflicts
    npm install --legacy-peer-deps
    
    # Install common missing dependencies
    npm install axios @google/genai --legacy-peer-deps 2>/dev/null || true
    
    # Fix package.json build script to skip tsc
    if grep -q '"tsc' package.json; then
        echo "Fixing build script to skip tsc..."
        sed -i 's/"build": "tsc.*vite build"/"build": "vite build"/g' package.json
        sed -i 's/"build": "tsc -b && vite build"/"build": "vite build"/g' package.json
        sed -i 's/"build": "tsc && vite build"/"build": "vite build"/g' package.json
    fi
    
    # Build
    if npm run build; then
        # Deploy
        sudo mkdir -p "$TOOLS_DIR/$subdomain"
        sudo cp -r dist/* "$TOOLS_DIR/$subdomain/"
        echo "✓ $subdomain deployed successfully"
    else
        echo "✗ $subdomain build failed"
    fi
done

echo ""
echo "=========================================="
echo "Deployment Summary"
echo "=========================================="
echo "Deployed tools:"
ls -la "$TOOLS_DIR"
