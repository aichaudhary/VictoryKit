#!/bin/bash
# ============================================================================
# VICTORYKIT 2026 REBRANDING SCRIPT
# Renames all tools from old names to new trending 2026 security names
# ============================================================================

REPO_ROOT="/Users/onelastai/Documents/VictoryKit"
cd "$REPO_ROOT"

echo "🚀 VICTORYKIT COMPLETE REBRANDING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Directory renames (old:new format)
DIR_RENAMES="
02-intelliscout:02-darkwebmonitor
03-threatradar:03-zerodaydetect
04-malwarehunter:04-ransomshield
05-phishguard:05-phishnetai
08-securecode:08-codesentinel
09-compliancecheck:09-runtimeguard
12-loganalyzer:12-xdrplatform
13-accesscontrol:13-identityforge
14-encryptionmanager:14-secretvault
15-cryptovault:15-privilegeguard
16-networkmonitor:16-networkforensics
17-audittrail:17-audittrailpro
19-riskassess:19-riskquantify
20-securityscore:20-securitydashboard
22-apiguard:22-apishield
23-botdefender:23-botmitigation
24-ddosshield:24-ddosdefender
29-riskscoreai:29-behavioranalytics
31-audittracker:31-cloudposture
32-zerotrustai:32-zerotrust
33-passwordvault:33-kubearmor
34-biometricai:34-containerscan
35-emailguard:35-emaildefender
36-webfilter:36-browserisolation
37-dnsshield:37-dnsfirewall
39-vpnguardian:39-vpnanalyzer
40-wirelesswatch:40-wirelesshunter
41-datalossprevention:41-dlpadvanced
42-iotsecure:42-iotsentinel
43-mobiledefend:43-mobileshield
44-backupguard:44-supplychainai
49-pcidsscheck:49-soc2automator
50-bugbountyai:50-iso27001
"

echo "📁 STEP 1: Renaming Frontend Directories"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for pair in $DIR_RENAMES; do
  old="${pair%%:*}"
  new="${pair##*:}"
  if [ -d "frontend/tools/$old" ]; then
    echo "  📦 frontend/tools/$old → $new"
    mv "frontend/tools/$old" "frontend/tools/$new"
  fi
done

echo ""
echo "📁 STEP 2: Renaming Backend Directories"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for pair in $DIR_RENAMES; do
  old="${pair%%:*}"
  new="${pair##*:}"
  if [ -d "backend/tools/$old" ]; then
    echo "  📦 backend/tools/$old → $new"
    mv "backend/tools/$old" "backend/tools/$new"
  fi
done

echo ""
echo "📝 STEP 3: Updating File Contents (lowercase)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Name replacements (old:new format)
NAME_RENAMES="
intelliscout:darkwebmonitor
threatradar:zerodaydetect
malwarehunter:ransomshield
phishguard:phishnetai
securecode:codesentinel
compliancecheck:runtimeguard
loganalyzer:xdrplatform
accesscontrol:identityforge
encryptionmanager:secretvault
cryptovault:privilegeguard
networkmonitor:networkforensics
audittrail:audittrailpro
riskassess:riskquantify
securityscore:securitydashboard
apiguard:apishield
botdefender:botmitigation
ddosshield:ddosdefender
riskscoreai:behavioranalytics
audittracker:cloudposture
zerotrustai:zerotrust
passwordvault:kubearmor
biometricai:containerscan
emailguard:emaildefender
webfilter:browserisolation
dnsshield:dnsfirewall
vpnguardian:vpnanalyzer
wirelesswatch:wirelesshunter
datalossprevention:dlpadvanced
iotsecure:iotsentinel
mobiledefend:mobileshield
backupguard:supplychainai
pcidsscheck:soc2automator
bugbountyai:iso27001
"

# Find all text files
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.sh" -o -name "*.yml" -o -name "*.yaml" -o -name "*.conf" -o -name "*.html" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/dist/*" \
  ! -name "package-lock.json" \
  ! -name "rebrand-all-tools.sh" \
  -print0 2>/dev/null | while IFS= read -r -d '' file; do
  
  for pair in $NAME_RENAMES; do
    old="${pair%%:*}"
    new="${pair##*:}"
    if grep -q "$old" "$file" 2>/dev/null; then
      sed -i '' "s/$old/$new/g" "$file" 2>/dev/null || true
    fi
  done
done

echo "  ✅ Updated lowercase references"

echo ""
echo "📝 STEP 4: Updating CamelCase Names"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# CamelCase replacements
CAMEL_RENAMES="
IntelliScout:DarkWebMonitor
ThreatRadar:ZeroDayDetect
MalwareHunter:RansomShield
PhishGuard:PhishNetAI
SecureCode:CodeSentinel
ComplianceCheck:RuntimeGuard
LogAnalyzer:XDRPlatform
AccessControl:IdentityForge
EncryptionManager:SecretVault
CryptoVault:PrivilegeGuard
NetworkMonitor:NetworkForensics
AuditTrail:AuditTrailPro
RiskAssess:RiskQuantify
SecurityScore:SecurityDashboard
ApiGuard:APIShield
BotDefender:BotMitigation
DdosShield:DDoSDefender
RiskScoreAI:BehaviorAnalytics
AuditTracker:CloudPosture
ZeroTrustAI:ZeroTrust
PasswordVault:KubeArmor
BiometricAI:ContainerScan
EmailGuard:EmailDefender
WebFilter:BrowserIsolation
DnsShield:DNSFirewall
VpnGuardian:VPNAnalyzer
WirelessWatch:WirelessHunter
DataLossPrevention:DLPAdvanced
IoTSecure:IoTSentinel
MobileDefend:MobileShield
BackupGuard:SupplyChainAI
PciDssCheck:SOC2Automator
BugBountyAI:ISO27001
"

find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" -o -name "*.md" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/dist/*" \
  ! -name "package-lock.json" \
  ! -name "rebrand-all-tools.sh" \
  -print0 2>/dev/null | while IFS= read -r -d '' file; do
  
  for pair in $CAMEL_RENAMES; do
    old="${pair%%:*}"
    new="${pair##*:}"
    if grep -q "$old" "$file" 2>/dev/null; then
      sed -i '' "s/$old/$new/g" "$file" 2>/dev/null || true
    fi
  done
done

echo "  ✅ Updated CamelCase references"

echo ""
echo "📝 STEP 5: Updating Directory Path References"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" -o -name "*.md" -o -name "*.sh" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -name "package-lock.json" \
  ! -name "rebrand-all-tools.sh" \
  -print0 2>/dev/null | while IFS= read -r -d '' file; do
  
  for pair in $DIR_RENAMES; do
    old="${pair%%:*}"
    new="${pair##*:}"
    if grep -q "$old" "$file" 2>/dev/null; then
      sed -i '' "s|$old|$new|g" "$file" 2>/dev/null || true
    fi
  done
done

echo "  ✅ Updated directory path references"

echo ""
echo "🎉 REBRANDING COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "New Frontend tools:"
ls frontend/tools/ | sort
echo ""
echo "New Backend tools:"
ls backend/tools/ | sort

