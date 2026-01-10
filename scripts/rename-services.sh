#!/bin/bash
# ===========================================
# Rename Service Files to Match Tool Names
# ===========================================

TOOLS_DIR="/Users/onelastai/Documents/VictoryKit/frontend/tools"

# Mapping: old_service|new_service
declare -a SERVICE_RENAMES=(
    "02-darkwebmonitor|intelliscoutAPI|darkwebmonitorAPI"
    "03-zerodaydetect|threatRadarAPI|zerodaydetectAPI"
    "04-ransomshield|malwareHunterAPI|ransomshieldAPI"
    "05-phishnetai|phishGuardAPI|phishnetaiAPI"
    "08-codesentinel|secureCodeAPI|codesentinelAPI"
    "09-runtimeguard|complianceCheckAPI|runtimeguardAPI"
    "12-xdrplatform|logAnalyzerAPI|xdrplatformAPI"
    "13-identityforge|accessControlAPI|identityforgeAPI"
    "14-secretvault|encryptionManagerAPI|secretvaultAPI"
    "15-privilegeguard|cryptoVaultAPI|privilegeguardAPI"
    "16-networkforensics|networkMonitorAPI|networkforensicsAPI"
    "17-audittrailpro|auditTrailAPI|audittrailproAPI"
    "19-riskquantify|riskAssessAPI|riskquantifyAPI"
    "20-securitydashboard|securityScoreAPI|securitydashboardAPI"
    "22-apishield|apiGuardAPI|apishieldAPI"
    "23-botmitigation|botDefenderAPI|botmitigationAPI"
    "24-ddosdefender|ddosShieldAPI|ddosdefenderAPI"
    "29-behavioranalytics|riskScoreAIAPI|behavioranalyticsAPI"
    "31-cloudposture|auditTrackerAPI|cloudpostureAPI"
    "32-zerotrust|zeroTrustAIAPI|zerotrustAPI"
    "33-kubearmor|passwordVaultAPI|kubearmorAPI"
    "34-containerscan|biometricAIAPI|containerscanAPI"
    "35-emaildefender|emailGuardAPI|emaildefenderAPI"
    "36-browserisolation|webFilterAPI|browserisolationAPI"
    "37-dnsfirewall|dnsShieldAPI|dnsfirewallAPI"
    "39-vpnanalyzer|vpnGuardianAPI|vpnanalyzerAPI"
    "40-wirelesshunter|wirelessWatchAPI|wirelesshunterAPI"
    "41-dlpadvanced|dataLossPreventionAPI|dlpadvancedAPI"
    "42-iotsentinel|iotSecureAPI|iotsentinelAPI"
    "43-mobileshield|mobileDefendAPI|mobileshieldAPI"
    "44-supplychainai|backupGuardAPI|supplychainaiAPI"
    "49-soc2automator|pcidssCheckAPI|soc2automatorAPI"
    "50-iso27001|bugBountyAIAPI|iso27001API"
)

echo "🔄 Renaming service files..."

for entry in "${SERVICE_RENAMES[@]}"; do
    IFS='|' read -r tool_dir old_name new_name <<< "$entry"
    
    services_dir="$TOOLS_DIR/$tool_dir/src/services"
    
    if [ -d "$services_dir" ]; then
        old_file="$services_dir/${old_name}.ts"
        new_file="$services_dir/${new_name}.ts"
        
        if [ -f "$old_file" ]; then
            echo "Renaming $tool_dir: $old_name -> $new_name"
            mv "$old_file" "$new_file"
            
            # Update content
            sed -i '' "s/${old_name}/${new_name}/g" "$new_file"
        fi
    fi
done

# Also update all imports in tsx files
echo ""
echo "🔄 Updating imports in TSX files..."

for entry in "${SERVICE_RENAMES[@]}"; do
    IFS='|' read -r tool_dir old_name new_name <<< "$entry"
    
    tool_path="$TOOLS_DIR/$tool_dir"
    
    if [ -d "$tool_path" ]; then
        find "$tool_path" -name "*.tsx" -o -name "*.ts" | while read file; do
            sed -i '' "s/${old_name}/${new_name}/g" "$file" 2>/dev/null
        done
    fi
done

echo "✅ Service files renamed!"
