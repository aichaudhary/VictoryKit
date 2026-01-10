#!/bin/bash
# ============================================================================
# Update All Tool Components with Proper Names and Features
# ============================================================================

cd /Users/onelastai/Documents/VictoryKit

echo "🔧 UPDATING ALL TOOL COMPONENTS..."
echo ""

# Define tool mappings (directory:OldName:NewName)
TOOLS="
03-zerodaydetect:ThreatRadar:ZeroDayDetect
04-ransomshield:MalwareHunter:RansomShield
05-phishnetai:PhishGuard:PhishNetAI
08-codesentinel:SecureCode:CodeSentinel
09-runtimeguard:ComplianceCheck:RuntimeGuard
12-xdrplatform:LogAnalyzer:XDRPlatform
13-identityforge:AccessControl:IdentityForge
14-secretvault:EncryptionManager:SecretVault
15-privilegeguard:CryptoVault:PrivilegeGuard
16-networkforensics:NetworkMonitor:NetworkForensics
17-audittrailpro:AuditTrail:AuditTrailPro
19-riskquantify:RiskAssess:RiskQuantify
20-securitydashboard:SecurityScore:SecurityDashboard
22-apishield:ApiGuard:APIShield
23-botmitigation:BotDefender:BotMitigation
24-ddosdefender:DdosShield:DDoSDefender
29-behavioranalytics:RiskScoreAI:BehaviorAnalytics
31-cloudposture:AuditTracker:CloudPosture
32-zerotrust:ZeroTrustAI:ZeroTrust
33-kubearmor:PasswordVault:KubeArmor
34-containerscan:BiometricAI:ContainerScan
35-emaildefender:EmailGuard:EmailDefender
36-browserisolation:WebFilter:BrowserIsolation
37-dnsfirewall:DnsShield:DNSFirewall
39-vpnanalyzer:VpnGuardian:VPNAnalyzer
40-wirelesshunter:WirelessWatch:WirelessHunter
41-dlpadvanced:DataLossPrevention:DLPAdvanced
42-iotsentinel:IoTSecure:IoTSentinel
43-mobileshield:MobileDefend:MobileShield
44-supplychainai:BackupGuard:SupplyChainAI
49-soc2automator:PciDssCheck:SOC2Automator
50-iso27001:BugBountyAI:ISO27001
"

for entry in $TOOLS; do
  dir="${entry%%:*}"
  rest="${entry#*:}"
  old="${rest%%:*}"
  new="${rest##*:}"
  oldLower=$(echo "$old" | tr '[:upper:]' '[:lower:]')
  newLower=$(echo "$new" | tr '[:upper:]' '[:lower:]')
  
  compDir="frontend/tools/${dir}/src/components"
  
  if [ -d "$compDir" ]; then
    echo "📁 $dir: $old → $new"
    
    # Rename component files
    for f in "$compDir"/*${old}*.tsx; do
      if [ -f "$f" ]; then
        newName=$(echo "$f" | sed "s/$old/$new/g")
        mv "$f" "$newName" 2>/dev/null || true
      fi
    done
    
    # Update content in all files
    for f in "$compDir"/*.tsx; do
      if [ -f "$f" ]; then
        sed -i '' "s/$old/$new/g" "$f" 2>/dev/null || true
        sed -i '' "s/$oldLower/$newLower/g" "$f" 2>/dev/null || true
      fi
    done
    
    # Update App.tsx imports
    appFile="frontend/tools/${dir}/src/App.tsx"
    if [ -f "$appFile" ]; then
      sed -i '' "s/$old/$new/g" "$appFile" 2>/dev/null || true
      sed -i '' "s/$oldLower/$newLower/g" "$appFile" 2>/dev/null || true
    fi
    
    # Update services
    svcDir="frontend/tools/${dir}/src/services"
    if [ -d "$svcDir" ]; then
      for f in "$svcDir"/*.ts; do
        if [ -f "$f" ]; then
          sed -i '' "s/$old/$new/g" "$f" 2>/dev/null || true
          sed -i '' "s/$oldLower/$newLower/g" "$f" 2>/dev/null || true
        fi
      done
    fi
  fi
done

echo ""
echo "✅ All tool components updated!"
