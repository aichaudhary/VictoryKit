#!/bin/bash
REPO_DIR="/var/www/maula.ai/repo"
TOOLS_DIR="/var/www/tools"

TOOLS=(
    "21-wafmanager:wafmanager"
    "22-apiguard:apiguard"
    "23-botdefender:botdefender"
    "24-ddosshield:ddosshield"
    "25-sslmonitor:sslmonitor"
    "26-blueteamai:blueteamai"
    "27-siemcommander:siemcommander"
    "28-soarengine:soarengine"
    "29-riskscoreai:riskscoreai"
    "30-policyengine:policyengine"
    "31-audittracker:audittracker"
    "32-zerotrustai:zerotrustai"
    "33-passwordvault:passwordvault"
    "34-biometricai:biometricai"
    "35-emailguard:emailguard"
    "36-webfilter:webfilter"
    "37-dnsshield:dnsshield"
    "38-firewallai:firewallai"
    "39-vpnguardian:vpnguardian"
    "40-wirelesswatch:wirelesswatch"
    "41-datalossprevention:datalossprevention"
    "42-iotsecure:iotsecure"
    "43-mobiledefend:mobiledefend"
    "44-backupguard:backupguard"
    "45-drplan:drplan"
    "46-privacyshield:privacyshield"
    "47-gdprcompliance:gdprcompliance"
    "48-hipaaguard:hipaaguard"
    "49-pcidsscheck:pcidsscheck"
    "50-bugbountyai:bugbountyai"
)

for tool in "${TOOLS[@]}"; do
    IFS=':' read -r dir subdomain <<< "$tool"
    echo "=========================================="
    echo "Building $dir -> $subdomain"
    echo "=========================================="
    
    cd "$REPO_DIR/frontend/tools/$dir" || { echo "Directory not found: $dir"; continue; }
    
    npm install --legacy-peer-deps 2>/dev/null
    npm install axios @google/genai --legacy-peer-deps 2>/dev/null || true
    
    if grep -q '"tsc' package.json; then
        sed -i 's/"build": "tsc.*vite build"/"build": "vite build"/g' package.json
        sed -i 's/"build": "tsc -b && vite build"/"build": "vite build"/g' package.json
        sed -i 's/"build": "tsc && vite build"/"build": "vite build"/g' package.json
    fi
    
    if npm run build 2>&1; then
        sudo mkdir -p "$TOOLS_DIR/$subdomain"
        sudo cp -r dist/* "$TOOLS_DIR/$subdomain/"
        echo "SUCCESS: $subdomain deployed"
    else
        echo "FAILED: $subdomain build failed"
    fi
done
echo "Done! Deployed tools:"
ls "$TOOLS_DIR"
