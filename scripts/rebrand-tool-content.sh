#!/bin/bash
# ===========================================
# Complete Tool Rebranding Script
# Updates all old tool names to new names
# ===========================================

TOOLS_DIR="/Users/onelastai/Documents/VictoryKit/frontend/tools"

echo "🔄 COMPLETE TOOL REBRANDING - Updating all file content..."
echo ""

# Define the mapping: old_name|new_name|old_display|new_display
declare -a MAPPINGS=(
    # Tool 02: IntelliScout -> DarkWebMonitor
    "intelliscout|darkwebmonitor|IntelliScout|DarkWebMonitor|INTELLISCOUT|DARKWEBMONITOR"
    # Tool 03: ThreatRadar -> ZeroDayDetect  
    "threatradar|zerodaydetect|ThreatRadar|ZeroDayDetect|THREATRADAR|ZERODAYDETECT"
    # Tool 04: MalwareHunter -> RansomShield
    "malwarehunter|ransomshield|MalwareHunter|RansomShield|MALWAREHUNTER|RANSOMSHIELD"
    # Tool 05: PhishGuard -> PhishNetAI
    "phishguard|phishnetai|PhishGuard|PhishNetAI|PHISHGUARD|PHISHNETAI"
    # Tool 08: SecureCode -> CodeSentinel
    "securecode|codesentinel|SecureCode|CodeSentinel|SECURECODE|CODESENTINEL"
    # Tool 09: ComplianceCheck -> RuntimeGuard
    "compliancecheck|runtimeguard|ComplianceCheck|RuntimeGuard|COMPLIANCECHECK|RUNTIMEGUARD"
    # Tool 12: LogAnalyzer -> XDRPlatform
    "loganalyzer|xdrplatform|LogAnalyzer|XDRPlatform|LOGANALYZER|XDRPLATFORM"
    # Tool 13: AccessControl -> IdentityForge
    "accesscontrol|identityforge|AccessControl|IdentityForge|ACCESSCONTROL|IDENTITYFORGE"
    # Tool 14: EncryptionManager -> SecretVault
    "encryptionmanager|secretvault|EncryptionManager|SecretVault|ENCRYPTIONMANAGER|SECRETVAULT"
    # Tool 15: CryptoVault -> PrivilegeGuard
    "cryptovault|privilegeguard|CryptoVault|PrivilegeGuard|CRYPTOVAULT|PRIVILEGEGUARD"
    # Tool 16: NetworkMonitor -> NetworkForensics
    "networkmonitor|networkforensics|NetworkMonitor|NetworkForensics|NETWORKMONITOR|NETWORKFORENSICS"
    # Tool 17: AuditTrail -> AuditTrailPro
    "audittrail|audittrailpro|AuditTrail|AuditTrailPro|AUDITTRAIL|AUDITTRAILPRO"
    # Tool 19: RiskAssess -> RiskQuantify
    "riskassess|riskquantify|RiskAssess|RiskQuantify|RISKASSESS|RISKQUANTIFY"
    # Tool 20: SecurityScore -> SecurityDashboard
    "securityscore|securitydashboard|SecurityScore|SecurityDashboard|SECURITYSCORE|SECURITYDASHBOARD"
    # Tool 22: APIGuard -> APIShield
    "apiguard|apishield|APIGuard|APIShield|APIGUARD|APISHIELD"
    # Tool 23: BotDefender -> BotMitigation
    "botdefender|botmitigation|BotDefender|BotMitigation|BOTDEFENDER|BOTMITIGATION"
    # Tool 24: DDoSShield -> DDoSDefender
    "ddosshield|ddosdefender|DDoSShield|DDoSDefender|DDOSSHIELD|DDOSDEFENDER"
    # Tool 29: RiskScoreAI -> BehaviorAnalytics
    "riskscoreai|behavioranalytics|RiskScoreAI|BehaviorAnalytics|RISKSCOREAI|BEHAVIORANALYTICS"
    # Tool 31: AuditTracker -> CloudPosture
    "audittracker|cloudposture|AuditTracker|CloudPosture|AUDITTRACKER|CLOUDPOSTURE"
    # Tool 32: ZeroTrustAI -> ZeroTrust
    "zerotrustai|zerotrust|ZeroTrustAI|ZeroTrust|ZEROTRUSTAI|ZEROTRUST"
    # Tool 33: PasswordVault -> KubeArmor
    "passwordvault|kubearmor|PasswordVault|KubeArmor|PASSWORDVAULT|KUBEARMOR"
    # Tool 34: BiometricAI -> ContainerScan
    "biometricai|containerscan|BiometricAI|ContainerScan|BIOMETRICAI|CONTAINERSCAN"
    # Tool 35: EmailGuard -> EmailDefender
    "emailguard|emaildefender|EmailGuard|EmailDefender|EMAILGUARD|EMAILDEFENDER"
    # Tool 36: WebFilter -> BrowserIsolation
    "webfilter|browserisolation|WebFilter|BrowserIsolation|WEBFILTER|BROWSERISOLATION"
    # Tool 37: DNSShield -> DNSFirewall
    "dnsshield|dnsfirewall|DNSShield|DNSFirewall|DNSSHIELD|DNSFIREWALL"
    # Tool 39: VPNGuardian -> VPNAnalyzer
    "vpnguardian|vpnanalyzer|VPNGuardian|VPNAnalyzer|VPNGUARDIAN|VPNANALYZER"
    # Tool 40: WirelessWatch -> WirelessHunter
    "wirelesswatch|wirelesshunter|WirelessWatch|WirelessHunter|WIRELESSWATCH|WIRELESSHUNTER"
    # Tool 41: DataLossPrevention -> DLPAdvanced
    "datalossprevention|dlpadvanced|DataLossPrevention|DLPAdvanced|DATALOSSPREVENTION|DLPADVANCED"
    # Tool 42: IoTSecure -> IoTSentinel
    "iotsecure|iotsentinel|IoTSecure|IoTSentinel|IOTSECURE|IOTSENTINEL"
    # Tool 43: MobileDefend -> MobileShield
    "mobiledefend|mobileshield|MobileDefend|MobileShield|MOBILEDEFEND|MOBILESHIELD"
    # Tool 44: BackupGuard -> SupplyChainAI
    "backupguard|supplychainai|BackupGuard|SupplyChainAI|BACKUPGUARD|SUPPLYCHAINAI"
    # Tool 49: PCIDSSCheck -> SOC2Automator
    "pcidsscheck|soc2automator|PCIDSSCheck|SOC2Automator|PCIDSSCHECK|SOC2AUTOMATOR"
    # Tool 50: BugBountyAI -> ISO27001
    "bugbountyai|iso27001|BugBountyAI|ISO27001|BUGBOUNTYAI|ISO27001"
)

# Additional API naming mappings
declare -a API_MAPPINGS=(
    "intelliScoutAPI|darkWebMonitorAPI"
    "threatRadarAPI|zeroDayDetectAPI"
    "malwareHunterAPI|ransomShieldAPI"
    "phishGuardAPI|phishNetAIAPI"
    "secureCodeAPI|codeSentinelAPI"
    "complianceCheckAPI|runtimeGuardAPI"
    "logAnalyzerAPI|xdrPlatformAPI"
    "accessControlAPI|identityForgeAPI"
    "encryptionManagerAPI|secretVaultAPI"
    "cryptoVaultAPI|privilegeGuardAPI"
    "networkMonitorAPI|networkForensicsAPI"
    "auditTrailAPI|auditTrailProAPI"
    "riskAssessAPI|riskQuantifyAPI"
    "securityScoreAPI|securityDashboardAPI"
    "apiGuardAPI|apiShieldAPI"
    "botDefenderAPI|botMitigationAPI"
    "ddosShieldAPI|ddosDefenderAPI"
    "riskScoreAIAPI|behaviorAnalyticsAPI"
    "auditTrackerAPI|cloudPostureAPI"
    "zeroTrustAIAPI|zeroTrustAPI"
    "passwordVaultAPI|kubeArmorAPI"
    "biometricAIAPI|containerScanAPI"
    "emailGuardAPI|emailDefenderAPI"
    "webFilterAPI|browserIsolationAPI"
    "dnsShieldAPI|dnsFirewallAPI"
    "vpnGuardianAPI|vpnAnalyzerAPI"
    "wirelessWatchAPI|wirelessHunterAPI"
    "dataLossPreventionAPI|dlpAdvancedAPI"
    "iotSecureAPI|iotSentinelAPI"
    "mobileDefendAPI|mobileShieldAPI"
    "backupGuardAPI|supplyChainAIAPI"
    "pcidssCheckAPI|soc2AutomatorAPI"
    "bugBountyAIAPI|iso27001API"
)

# Process all files
find "$TOOLS_DIR" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.json" \) | while read file; do
    # Apply all name mappings
    for mapping in "${MAPPINGS[@]}"; do
        IFS='|' read -r old_lower new_lower old_camel new_camel old_upper new_upper <<< "$mapping"
        
        # Replace lowercase
        sed -i '' "s/${old_lower}/${new_lower}/g" "$file" 2>/dev/null
        
        # Replace CamelCase
        sed -i '' "s/${old_camel}/${new_camel}/g" "$file" 2>/dev/null
        
        # Replace UPPERCASE
        sed -i '' "s/${old_upper}/${new_upper}/g" "$file" 2>/dev/null
    done
    
    # Apply API mappings
    for api_mapping in "${API_MAPPINGS[@]}"; do
        IFS='|' read -r old_api new_api <<< "$api_mapping"
        sed -i '' "s/${old_api}/${new_api}/g" "$file" 2>/dev/null
    done
done

echo "✅ All file content rebranded!"
echo ""

# Verify changes
echo "📋 Verifying - searching for any remaining old names..."
for mapping in "${MAPPINGS[@]}"; do
    IFS='|' read -r old_lower new_lower old_camel new_camel old_upper new_upper <<< "$mapping"
    count=$(grep -r "$old_camel" "$TOOLS_DIR" --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
    if [ "$count" -gt 0 ]; then
        echo "  ⚠️  Found $count instances of '$old_camel'"
    fi
done

echo ""
echo "🎉 REBRANDING COMPLETE!"
