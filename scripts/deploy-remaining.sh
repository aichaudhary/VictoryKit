#!/bin/bash
REPO_DIR="/var/www/maula.ai/repo"
TOOLS_DIR="/var/www/tools"

TOOLS=(
    "21-wafmanager:wafmanager"
    "22-apishield:apishield"
    "23-botmitigation:botmitigation"
    "24-ddosdefender:ddosdefender"
    "25-sslmonitor:sslmonitor"
    "26-blueteamai:blueteamai"
    "27-siemcommander:siemcommander"
    "28-soarengine:soarengine"
    "29-behavioranalytics:behavioranalytics"
    "30-policyengine:policyengine"
    "31-cloudposture:cloudposture"
    "32-zerotrust:zerotrust"
    "33-kubearmor:kubearmor"
    "34-containerscan:containerscan"
    "35-emaildefender:emaildefender"
    "36-browserisolation:browserisolation"
    "37-dnsfirewall:dnsfirewall"
    "38-firewallai:firewallai"
    "39-vpnanalyzer:vpnanalyzer"
    "40-wirelesshunter:wirelesshunter"
    "41-dlpadvanced:dlpadvanced"
    "42-iotsentinel:iotsentinel"
    "43-mobileshield:mobileshield"
    "44-supplychainai:supplychainai"
    "45-drplan:drplan"
    "46-privacyshield:privacyshield"
    "47-gdprcompliance:gdprcompliance"
    "48-hipaaguard:hipaaguard"
    "49-soc2automator:soc2automator"
    "50-iso27001:iso27001"
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
