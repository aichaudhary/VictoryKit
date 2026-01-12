#!/bin/bash
# ===========================================
# Fix App.tsx files for all tools
# Each tool gets proper component import
# ===========================================

TOOLS_DIR="/Users/onelastai/Documents/VictoryKit/frontend/tools"

# Tool mapping: directory|component_name
declare -a TOOLS=(
	"01-fraudguard|FraudGuardTool"
	"02-darkwebmonitor|EnhancedDarkWebMonitorTool"
	"03-zerodaydetect|ZeroDayDetectTool"
	"04-ransomshield|RansomShieldTool"
	"05-phishnetai|PhishNetAITool"
	"06-vulnscan|VulnScanTool"
	"07-pentestai|PentestAITool"
	"08-codesentinel|CodeSentinelTool"
	"09-runtimeguard|RuntimeGuardTool"
	"10-dataguardian|DataGuardianTool"
	"11-incidentcommand|incidentcommandTool"
	"12-xdrplatform|XDRPlatformTool"
	"13-identityforge|IdentityForgeTool"
	"14-secretvault|SecretVaultTool"
	"15-privilegeguard|PrivilegeGuardTool"
	"16-networkforensics|NetworkForensicsTool"
	"17-audittrailpro|AuditTrailProTool"
	"18-threatmodel|ThreatModelTool"
	"19-riskquantify|RiskQuantifyTool"
	"20-securitydashboard|SecurityDashboardTool"
	"21-wafmanager|WAFManagerTool"
	"22-apishield|APIShieldTool"
	"23-botmitigation|BotMitigationTool"
	"24-ddosdefender|DDoSDefenderTool"
	"25-sslmonitor|SSLMonitorTool"
	"26-blueteamai|BlueTeamAITool"
	"27-siemcommander|SIEMCommanderTool"
	"28-soarengine|SOAREngineTool"
	"29-behavioranalytics|BehaviorAnalyticsTool"
	"30-policyengine|PolicyEngineTool"
	"31-cloudposture|CloudPostureTool"
	"32-zerotrust|ZeroTrustTool"
	"33-kubearmor|KubeArmorTool"
	"34-containerscan|ContainerScanTool"
	"35-emaildefender|EmailDefenderTool"
	"36-browserisolation|BrowserIsolationTool"
	"37-dnsfirewall|DNSFirewallTool"
	"38-firewallai|FirewallAITool"
	"39-vpnanalyzer|VPNAnalyzerTool"
	"40-wirelesshunter|WirelessHunterTool"
	"41-dlpadvanced|DLPAdvancedTool"
	"42-iotsentinel|IoTSentinelTool"
	"43-mobileshield|MobileShieldTool"
	"44-supplychainai|SupplyChainAITool"
	"45-drplan|DRPlanTool"
	"46-privacyshield|PrivacyShieldTool"
	"47-gdprcompliance|GDPRComplianceTool"
	"48-hipaaguard|HIPAAGuardTool"
	"49-soc2automator|SOC2AutomatorTool"
	"50-iso27001|ISO27001Tool"
)

for tool_entry in "${TOOLS[@]}"; do
	IFS='|' read -r tool_dir component_name <<<"$tool_entry"

	tool_path="$TOOLS_DIR/$tool_dir"
	app_file="$tool_path/src/App.tsx"

	if [ -d "$tool_path" ] && [ -d "$tool_path/src/components" ]; then
		echo "Fixing $tool_dir -> $component_name"

		cat >"$app_file" <<EOF
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ${component_name} from "./components/${component_name}";

function App() {
  return (
    <Routes>
      <Route path="/" element={<${component_name} />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
EOF
	fi
done

echo "✅ All App.tsx files fixed!"
