#!/bin/bash
# Rename pages to match 2026 tool naming convention from TOOLS-MASTER-INVENTORY.md

cd /Users/onelastai/Documents/VictoryKit/frontend/maula-frontend/pages

# Tool 01: FraudGuard (already correct)
# FraudGuardDetail.tsx -> 01-FraudGuardDetail.tsx

# Tool 02: DarkWebMonitor (IntelliScout -> DarkWebMonitor)
mv IntelliScoutDetail.tsx 02-DarkWebMonitorDetail.tsx 2>/dev/null

# Tool 03: ZeroDayDetect (AnomalyDetect -> ZeroDayDetect)
mv AnomalyDetectDetail.tsx 03-ZeroDayDetectDetail.tsx 2>/dev/null

# Tool 04: RansomShield (CryptoShield -> RansomShield)
mv CryptoShieldDetail.tsx 04-RansomShieldDetail.tsx 2>/dev/null

# Tool 05: PhishNetAI (PhishGuard -> PhishNetAI)
mv PhishGuardDetail.tsx 05-PhishNetAIDetail.tsx 2>/dev/null

# Tool 06: VulnScan Pro (already correct)
mv VulnScanDetail.tsx 06-VulnScanDetail.tsx 2>/dev/null

# Tool 07: PenTestAI (already correct)
mv PenTestAIDetail.tsx 07-PenTestAIDetail.tsx 2>/dev/null

# Tool 08: CodeSentinel (SecureCode -> CodeSentinel)
mv SecureCodeDetail.tsx 08-CodeSentinelDetail.tsx 2>/dev/null

# Tool 09: RuntimeGuard (DevSecOps -> RuntimeGuard)
mv DevSecOpsDetail.tsx 09-RuntimeGuardDetail.tsx 2>/dev/null

# Tool 10: DataGuardian (already correct)
mv DataGuardianDetail.tsx 10-DataGuardianDetail.tsx 2>/dev/null

# Tool 11: IncidentResponse (IncidentCommand -> IncidentResponse)
mv IncidentCommandDetail.tsx 11-IncidentResponseDetail.tsx 2>/dev/null

# Tool 12: XDRPlatform (ThreatRadar -> XDRPlatform)
mv ThreatRadarDetail.tsx 12-XDRPlatformDetail.tsx 2>/dev/null

# Tool 13: IdentityForge (IAMControl -> IdentityForge)
mv IAMControlDetail.tsx 13-IdentityForgeDetail.tsx 2>/dev/null

# Tool 14: SecretVault (PasswordVault -> SecretVault)
mv PasswordVaultDetail.tsx 14-SecretVaultDetail.tsx 2>/dev/null

# Tool 15: PrivilegeGuard (BiometricAI -> PrivilegeGuard)
mv BiometricAIDetail.tsx 15-PrivilegeGuardDetail.tsx 2>/dev/null

# Tool 16: NetworkForensics (ForensicsLab -> NetworkForensics)
mv ForensicsLabDetail.tsx 16-NetworkForensicsDetail.tsx 2>/dev/null

# Tool 17: AuditTrailPro (AuditTracker -> AuditTrailPro)
mv AuditTrackerDetail.tsx 17-AuditTrailProDetail.tsx 2>/dev/null

# Tool 18: ThreatModel (ThreatIntel -> ThreatModel)
mv ThreatIntelDetail.tsx 18-ThreatModelDetail.tsx 2>/dev/null

# Tool 19: RiskQuantify (RiskScoreAI -> RiskQuantify)
mv RiskScoreAIDetail.tsx 19-RiskQuantifyDetail.tsx 2>/dev/null

# Tool 20: SecurityDashboard (LogIntel -> SecurityDashboard)
mv LogIntelDetail.tsx 20-SecurityDashboardDetail.tsx 2>/dev/null

# Tool 21: WAFManager (WebFilter -> WAFManager)
mv WebFilterDetail.tsx 21-WAFManagerDetail.tsx 2>/dev/null

# Tool 22: APIShield (APIGuardian -> APIShield)
mv APIGuardianDetail.tsx 22-APIShieldDetail.tsx 2>/dev/null

# Tool 23: BotMitigation (MalwareHunter -> BotMitigation)
mv MalwareHunterDetail.tsx 23-BotMitigationDetail.tsx 2>/dev/null

# Tool 24: DDoSDefender (NetDefender -> DDoSDefender)
mv NetDefenderDetail.tsx 24-DDoSDefenderDetail.tsx 2>/dev/null

# Tool 25: SSLMonitor (ComplianceCheck -> SSLMonitor)
mv ComplianceCheckDetail.tsx 25-SSLMonitorDetail.tsx 2>/dev/null

# Tool 26: BlueTeamAI (already correct)
mv BlueTeamAIDetail.tsx 26-BlueTeamAIDetail.tsx 2>/dev/null

# Tool 27: SIEMCommander (already correct)
mv SIEMCommanderDetail.tsx 27-SIEMCommanderDetail.tsx 2>/dev/null

# Tool 28: SOAREngine (already correct)
mv SOAREngineDetail.tsx 28-SOAREngineDetail.tsx 2>/dev/null

# Tool 29: BehaviorAnalytics (BehaviorWatch -> BehaviorAnalytics)
mv BehaviorWatchDetail.tsx 29-BehaviorAnalyticsDetail.tsx 2>/dev/null

# Tool 30: PolicyEngine (already correct)
mv PolicyEngineDetail.tsx 30-PolicyEngineDetail.tsx 2>/dev/null

# Tool 31: CloudPosture (CloudSecure -> CloudPosture)
mv CloudSecureDetail.tsx 31-CloudPostureDetail.tsx 2>/dev/null

# Tool 32: ZeroTrustEngine (ZeroTrustAI -> ZeroTrustEngine)
mv ZeroTrustAIDetail.tsx 32-ZeroTrustEngineDetail.tsx 2>/dev/null

# Tool 33: KubeArmor (ContainerWatch -> KubeArmor)
mv ContainerWatchDetail.tsx 33-KubeArmorDetail.tsx 2>/dev/null

# Tool 34: ContainerScan (create new, or map existing)
# No direct match - will need to create

# Tool 35: EmailDefender (EmailGuard -> EmailDefender)
mv EmailGuardDetail.tsx 35-EmailDefenderDetail.tsx 2>/dev/null

# Tool 36: BrowserIsolation (CyberEduAI -> BrowserIsolation)
mv CyberEduAIDetail.tsx 36-BrowserIsolationDetail.tsx 2>/dev/null

# Tool 37: DNSFirewall (DNSShield -> DNSFirewall)
mv DNSShieldDetail.tsx 37-DNSFirewallDetail.tsx 2>/dev/null

# Tool 38: FirewallAI (already correct)
mv FirewallAIDetail.tsx 38-FirewallAIDetail.tsx 2>/dev/null

# Tool 39: VPNAnalyzer (VPNGuardian -> VPNAnalyzer)
mv VPNGuardianDetail.tsx 39-VPNAnalyzerDetail.tsx 2>/dev/null

# Tool 40: WirelessHunter (WirelessWatch -> WirelessHunter)
mv WirelessWatchDetail.tsx 40-WirelessHunterDetail.tsx 2>/dev/null

# Tool 41: DLPAdvanced (EndpointShield -> DLPAdvanced)
mv EndpointShieldDetail.tsx 41-DLPAdvancedDetail.tsx 2>/dev/null

# Tool 42: IoTSentinel (IoTSecure -> IoTSentinel)
mv IoTSecureDetail.tsx 42-IoTSentinelDetail.tsx 2>/dev/null

# Tool 43: MobileShield (MobileDefend -> MobileShield)
mv MobileDefendDetail.tsx 43-MobileShieldDetail.tsx 2>/dev/null

# Tool 44: SupplyChainAI (BugBountyAI -> SupplyChainAI)
mv BugBountyAIDetail.tsx 44-SupplyChainAIDetail.tsx 2>/dev/null

# Tool 45: DRPlan (already correct)
mv DRPlanDetail.tsx 45-DRPlanDetail.tsx 2>/dev/null

# Tool 46: PrivacyShield (already correct)
mv PrivacyShieldDetail.tsx 46-PrivacyShieldDetail.tsx 2>/dev/null

# Tool 47: GDPRCompliance (already correct)
mv GDPRComplianceDetail.tsx 47-GDPRComplianceDetail.tsx 2>/dev/null

# Tool 48: HIPAAGuard (already correct)
mv HIPAAGuardDetail.tsx 48-HIPAAGuardDetail.tsx 2>/dev/null

# Tool 49: SOC2Automator (PCIDSS -> SOC2Automator)
mv PCIDSSDetail.tsx 49-SOC2AutomatorDetail.tsx 2>/dev/null

# Tool 50: ISO27001Manager (RedTeamAI -> ISO27001Manager)
mv RedTeamAIDetail.tsx 50-ISO27001ManagerDetail.tsx 2>/dev/null

# Tool 01: FraudGuard (rename last to avoid conflicts)
mv FraudGuardDetail.tsx 01-FraudGuardDetail.tsx 2>/dev/null

# Extra files that need cleanup (BackupGuard doesn't exist in 2026 inventory)
# BackupGuardDetail.tsx - remove or repurpose

echo "Renaming complete. Current files:"
ls -1 *.tsx | sort
