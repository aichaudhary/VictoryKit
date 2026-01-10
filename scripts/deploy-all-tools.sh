#!/bin/bash
# Deploy all tools script
set -e

TOOLS=(
  "01-fraudguard:fraudguard"
  "02-darkwebmonitor:darkwebmonitor"
  "03-zerodaydetect:zerodaydetect"
  "04-ransomshield:ransomshield"
  "05-phishnetai:phishnetai"
  "06-vulnscan:vulnscan"
  "07-pentestai:pentestai"
  "08-codesentinel:codesentinel"
  "09-runtimeguard:runtimeguard"
  "10-dataguardian:dataguardian"
  "11-incidentresponse:incidentresponse"
  "12-xdrplatform:xdrplatform"
  "13-identityforge:identityforge"
  "14-secretvault:secretvault"
  "15-privilegeguard:privilegeguard"
  "16-networkforensics:networkforensics"
  "17-audittrailpropro:audittrailpro"
  "18-threatmodel:threatmodel"
  "19-riskquantify:riskquantify"
  "20-securitydashboard:securitydashboard"
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
  "41-dlpadvanced:dlp"
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

REPO_DIR="/var/www/maula.ai/repo"
TOOLS_DIR="/var/www/tools"

for item in "${TOOLS[@]}"; do
  dir="${item%%:*}"
  subdomain="${item##*:}"
  
  echo "=========================================="
  echo "Building $dir -> $subdomain"
  echo "=========================================="
  
  TOOL_PATH="$REPO_DIR/frontend/tools/$dir"
  
  if [ -d "$TOOL_PATH" ]; then
    cd "$TOOL_PATH"
    
    # Install dependencies
    npm install --silent 2>/dev/null || npm install
    npm install @google/genai --silent 2>/dev/null || true
    
    # Build
    if npm run build; then
      # Deploy
      sudo mkdir -p "$TOOLS_DIR/$subdomain"
      sudo cp -r dist/* "$TOOLS_DIR/$subdomain/"
      echo "✓ $subdomain deployed successfully"
    else
      echo "✗ $subdomain build failed"
    fi
  else
    echo "✗ Directory not found: $TOOL_PATH"
  fi
done

echo ""
echo "=========================================="
echo "All tools deployed!"
echo "=========================================="
ls -la $TOOLS_DIR/
