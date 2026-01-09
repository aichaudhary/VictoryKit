#!/bin/bash
# Deploy all tools script
set -e

TOOLS=(
  "01-fraudguard:fraudguard"
  "02-intelliscout:intelliscout"
  "03-threatradar:threatradar"
  "04-malwarehunter:malwarehunter"
  "05-phishguard:phishguard"
  "06-vulnscan:vulnscan"
  "07-pentestai:pentestai"
  "08-securecode:securecode"
  "09-compliancecheck:compliancecheck"
  "10-dataguardian:dataguardian"
  "11-incidentresponse:incidentresponse"
  "12-loganalyzer:loganalyzer"
  "13-accesscontrol:accesscontrol"
  "14-encryptionmanager:encryptionmanager"
  "15-cryptovault:cryptovault"
  "16-networkmonitor:networkmonitor"
  "17-audittrail:audittrail"
  "18-threatmodel:threatmodel"
  "19-riskassess:riskassess"
  "20-securityscore:securityscore"
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
  "41-datalossprevention:dlp"
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
