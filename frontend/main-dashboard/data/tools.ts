
import { SecurityTool } from '../types';

const categoryThemes: Record<string, SecurityTool['theme']> = {
  'Threat Detection': {
    primary: 'red-500',
    secondary: 'orange-500',
    glow: 'rgba(239, 68, 68, 0.4)',
    bgStop: '#0d0404'
  },
  'Network Security': {
    primary: 'emerald-500',
    secondary: 'teal-400',
    glow: 'rgba(16, 185, 129, 0.4)',
    bgStop: '#040d0a'
  },
  'AI-Powered': {
    primary: 'purple-500',
    secondary: 'pink-500',
    glow: 'rgba(168, 85, 247, 0.4)',
    bgStop: '#08040d'
  },
  'Data Protection': {
    primary: 'blue-500',
    secondary: 'cyan-400',
    glow: 'rgba(59, 130, 246, 0.4)',
    bgStop: '#04080d'
  },
  'Compliance': {
    primary: 'amber-500',
    secondary: 'yellow-400',
    glow: 'rgba(245, 158, 11, 0.4)',
    bgStop: '#0d0a04'
  },
  'Identity & Access': {
    primary: 'purple-500',
    secondary: 'indigo-400',
    glow: 'rgba(129, 140, 248, 0.4)',
    bgStop: '#040412'
  },
  'Cloud Security': {
    primary: 'cyan-500',
    secondary: 'blue-400',
    glow: 'rgba(6, 182, 212, 0.4)',
    bgStop: '#040d12'
  },
  'Incident Response': {
    primary: 'orange-500',
    secondary: 'red-400',
    glow: 'rgba(249, 115, 22, 0.4)',
    bgStop: '#0d0503'
  }
};

const getThemeForCategory = (cat: string): SecurityTool['theme'] => {
  if (cat.includes('Detection') || cat.includes('Malware') || cat.includes('Phishing') || cat.includes('Intelligence')) return categoryThemes['Threat Detection'];
  if (cat.includes('Network') || cat.includes('Firewall') || cat.includes('DNS') || cat.includes('VPN') || cat.includes('Wireless')) return categoryThemes['Network Security'];
  if (cat.includes('AI') || cat.includes('Red Team') || cat.includes('Blue Team') || cat.includes('SIEM') || cat.includes('SOAR') || cat.includes('Bug Bounty')) return categoryThemes['AI-Powered'];
  if (cat.includes('Data') || cat.includes('Crypto') || cat.includes('Backup') || cat.includes('Privacy')) return categoryThemes['Data Protection'];
  if (cat.includes('Compliance') || cat.includes('GDPR') || cat.includes('HIPAA') || cat.includes('PCI') || cat.includes('Audit') || cat.includes('Policy')) return categoryThemes['Compliance'];
  if (cat.includes('IAM') || cat.includes('Zero Trust') || cat.includes('Password') || cat.includes('Biometric') || cat.includes('Identity')) return categoryThemes['Identity & Access'];
  if (cat.includes('Cloud') || cat.includes('API') || cat.includes('Container') || cat.includes('DevSecOps') || cat.includes('IoT')) return categoryThemes['Cloud Security'];
  if (cat.includes('Incident') || cat.includes('Response') || cat.includes('Forensics') || cat.includes('DR') || cat.includes('Anomaly')) return categoryThemes['Incident Response'];
  return categoryThemes['Threat Detection']; // Fallback
};

export const tools: SecurityTool[] = [
  {
    id: 1,
    name: "FraudGuard",
    description: "Stop fraud before it starts. AI-powered fraud detection that analyzes patterns in real-time, identifying suspicious activities with 99.9% accuracy.",
    category: "Threat Detection",
    stats: { threatsBlocked: "10M+", uptime: "<50ms Resp", accuracy: "99.9%" },
    imageUrl: "https://picsum.photos/seed/fguard/1200/800",
    url: "https://fraudguard.maula.ai",
    theme: categoryThemes['Threat Detection']
  },
  {
    id: 2,
    name: "IntelliScout",
    description: "Intelligence that sees everything. Advanced threat intelligence platform that monitors dark web markets, forums, and encrypted channels.",
    category: "Intelligence",
    stats: { threatsBlocked: "50K+ Src", uptime: "Global", accuracy: "Real-time" },
    imageUrl: "https://picsum.photos/seed/iscout/1200/800",
    url: "https://intelliscout.maula.ai",
    theme: categoryThemes['Threat Detection']
  },
  {
    id: 3,
    name: "ThreatRadar",
    description: "360Â° threat visibility. Comprehensive threat detection system that correlates signals across your entire infrastructure.",
    category: "Threat Detection",
    stats: { threatsBlocked: "99.7% Det", uptime: "<1m MTTD", accuracy: "<0.1% FP" },
    imageUrl: "https://picsum.photos/seed/tradar/1200/800",
    url: "https://threatradar.maula.ai",
    theme: categoryThemes['Threat Detection']
  },
  {
    id: 4,
    name: "MalwareHunter",
    description: "Hunt malware with precision. Advanced malware analysis platform using sandboxing, static analysis, and behavioral detection.",
    category: "Malware",
    stats: { threatsBlocked: "1M+ Samples", uptime: "500+ Zero-Day", accuracy: "<30s Analys" },
    imageUrl: "https://picsum.photos/seed/mhunter/1200/800",
    url: "https://malwarehunter.maula.ai",
    theme: categoryThemes['Threat Detection']
  },
  {
    id: 5,
    name: "PhishGuard",
    description: "Catch every phish in the net. Multi-layered phishing detection that analyzes URLs, emails, and web content.",
    category: "Phishing",
    stats: { threatsBlocked: "5M+ Block", uptime: "99.8% Det", accuracy: "100M+ Scans" },
    imageUrl: "https://picsum.photos/seed/pguard/1200/800",
    url: "https://phishguard.maula.ai",
    theme: categoryThemes['Threat Detection']
  },
  {
    id: 6,
    name: "VulnScan",
    description: "Find weaknesses before attackers do. Continuous vulnerability scanning for your entire attack surface identifying CVEs and misconfigurations.",
    category: "Vulnerability",
    stats: { threatsBlocked: "200K+ CVEs", uptime: "10K hosts/hr", accuracy: "99.5%" },
    imageUrl: "https://picsum.photos/seed/vscan/1200/800",
    url: "https://vulnscan.maula.ai",
    theme: categoryThemes['Compliance']
  },
  {
    id: 7,
    name: "PenTestAI",
    description: "AI-driven penetration testing. Automated penetration testing powered by AI that thinks like a hacker for continuous validation.",
    category: "Penetration Testing",
    stats: { threatsBlocked: "1000+ Vectors", uptime: "50K+ Exploit", accuracy: "Full Stack" },
    imageUrl: "https://picsum.photos/seed/pentest/1200/800",
    url: "https://pentestai.maula.ai",
    theme: categoryThemes['AI-Powered']
  },
  {
    id: 8,
    name: "SecureCode",
    description: "Code security from the start. Static and dynamic application security testing integrated into your CI/CD pipeline.",
    category: "Code Security",
    stats: { threatsBlocked: "30+ Lang", uptime: "5000+ Rules", accuracy: "<5% FP" },
    imageUrl: "https://picsum.photos/seed/scode/1200/800",
    url: "https://securecode.maula.ai",
    theme: categoryThemes['Cloud Security']
  },
  {
    id: 9,
    name: "ComplianceCheck",
    description: "Compliance made simple. Automated compliance monitoring and reporting for SOC2, ISO 27001, NIST, and more.",
    category: "Compliance",
    stats: { threatsBlocked: "20+ Frames", uptime: "1000+ Ctrl", accuracy: "90% Auto" },
    imageUrl: "https://picsum.photos/seed/compliance/1200/800",
    url: "https://compliancecheck.maula.ai",
    theme: categoryThemes['Compliance']
  },
  {
    id: 10,
    name: "DataGuardian",
    description: "Protect what matters most. Enterprise data loss prevention with intelligent content inspection across your organization.",
    category: "Data Protection",
    stats: { threatsBlocked: "100+ Types", uptime: "Custom Sens", accuracy: "AES-256" },
    imageUrl: "https://picsum.photos/seed/dguardian/1200/800",
    url: "https://dataguardian.maula.ai",
    theme: categoryThemes['Data Protection']
  },
  {
    id: 11,
    name: "CryptoShield",
    description: "Cryptography you can trust. Enterprise-grade cryptographic services including key management and certificate lifecycle.",
    category: "Cryptography",
    stats: { threatsBlocked: "50+ Algo", uptime: "99.99%", accuracy: "HSM Integr" },
    imageUrl: "https://picsum.photos/seed/cshield/1200/800",
    url: "https://cryptovault.maula.ai",
    theme: categoryThemes['Data Protection']
  },
  {
    id: 12,
    name: "IAMControl",
    description: "Identity is the new perimeter. Unified identity and access management with zero-trust principles across your entire infrastructure.",
    category: "Identity & Access",
    stats: { threatsBlocked: "200+ Integr", uptime: "15+ Auth", accuracy: "Unlimited" },
    imageUrl: "https://picsum.photos/seed/iamctrl/1200/800",
    url: "https://loganalyzer.maula.ai",
    theme: categoryThemes['Identity & Access']
  },
  {
    id: 13,
    name: "LogIntel",
    description: "Intelligence from every log. Centralized log management with AI-powered analysis to detect anomalies and investigate incidents.",
    category: "Logging",
    stats: { threatsBlocked: "1M+ EPS", uptime: "500+ Parsers", accuracy: "Real-time" },
    imageUrl: "https://picsum.photos/seed/logintel/1200/800",
    url: "https://accesscontrol.maula.ai",
    theme: categoryThemes['Incident Response']
  },
  {
    id: 14,
    name: "NetDefender",
    description: "Network security reimagined. Advanced network security with deep packet inspection, IDS/IPS, and network segmentation.",
    category: "Network",
    stats: { threatsBlocked: "100Gbps", uptime: "50K+ Sig", accuracy: "<1ms Lat" },
    imageUrl: "https://picsum.photos/seed/ndefender/1200/800",
    url: "https://encryptionmanager.maula.ai",
    theme: categoryThemes['Network Security']
  },
  {
    id: 15,
    name: "EndpointShield",
    description: "Protect every endpoint. Next-generation endpoint protection with EDR capabilities for all your enterprise devices.",
    category: "Endpoint",
    stats: { threatsBlocked: "99.9% Det", uptime: "W/M/L Plat", accuracy: "<10s Resp" },
    imageUrl: "https://picsum.photos/seed/eshield/1200/800",
    url: "https://cryptovault.maula.ai",
    theme: categoryThemes['Threat Detection']
  },
  {
    id: 16,
    name: "CloudSecure",
    description: "Secure your cloud journey. Cloud security posture management for AWS, Azure, and GCP with continuous monitoring.",
    category: "Cloud",
    stats: { threatsBlocked: "Multi-Cloud", uptime: "1000+ Checks", accuracy: "Auto Remed" },
    imageUrl: "https://picsum.photos/seed/csecure/1200/800",
    url: "https://networkmonitor.maula.ai",
    theme: categoryThemes['Cloud Security']
  },
  {
    id: 17,
    name: "APIGuardian",
    description: "Secure every API call. API security testing and runtime protection against API-specific attacks and shadow APIs.",
    category: "API",
    stats: { threatsBlocked: "Unlimited", uptime: "50+ Atk Typ", accuracy: "<5ms Lat" },
    imageUrl: "https://picsum.photos/seed/aguardian/1200/800",
    url: "https://audittrail.maula.ai",
    theme: categoryThemes['Cloud Security']
  },
  {
    id: 18,
    name: "ContainerWatch",
    description: "Container security done right. Container and Kubernetes security from build to runtime with image scanning.",
    category: "Container",
    stats: { threatsBlocked: "All Major", uptime: "200K+ CVEs", accuracy: "<30s Scan" },
    imageUrl: "https://picsum.photos/seed/cwatch/1200/800",
    url: "https://threatmodel.maula.ai",
    theme: categoryThemes['Cloud Security']
  },
  {
    id: 19,
    name: "DevSecOps",
    description: "Security at the speed of DevOps. Integrate security into every stage of your development lifecycle with shift-left automation.",
    category: "DevSecOps",
    stats: { threatsBlocked: "20+ Tools", uptime: "<5min Scan", accuracy: "Full Pipe" },
    imageUrl: "https://picsum.photos/seed/devsecops/1200/800",
    url: "https://riskassess.maula.ai",
    theme: categoryThemes['Cloud Security']
  },
  {
    id: 20,
    name: "IncidentCommand",
    description: "Respond faster, recover stronger. Incident response platform with automated playbooks and team collaboration.",
    category: "Incident Response",
    stats: { threatsBlocked: "60% MTTR", uptime: "100+ Playbk", accuracy: "50+ Integr" },
    imageUrl: "https://picsum.photos/seed/incident/1200/800",
    url: "https://securityscore.maula.ai",
    theme: categoryThemes['Incident Response']
  },
  {
    id: 21,
    name: "ForensicsLab",
    description: "Digital forensics at scale. Enterprise digital forensics platform for investigations with chain of custody tracking.",
    category: "Forensics",
    stats: { threatsBlocked: "50+ Src", uptime: "20+ Analysis", accuracy: "All Format" },
    imageUrl: "https://picsum.photos/seed/forensics/1200/800",
    url: "https://wafmanager.maula.ai",
    theme: categoryThemes['Incident Response']
  },
  {
    id: 22,
    name: "ThreatIntel",
    description: "Know your enemy. Threat intelligence platform with IOC feeds, threat actor profiles, and campaign tracking.",
    category: "Intelligence",
    stats: { threatsBlocked: "100+ Src", uptime: "10M+ IOCs", accuracy: "Real-time" },
    imageUrl: "https://picsum.photos/seed/tintel/1200/800",
    url: "https://apiguard.maula.ai",
    theme: categoryThemes['Threat Detection']
  },
  {
    id: 23,
    name: "BehaviorWatch",
    description: "Behavior tells the story. User and entity behavior analytics powered by machine learning to detect insider threats.",
    category: "Behavior",
    stats: { threatsBlocked: "Unlimited", uptime: "20+ Models", accuracy: "<1hr Det" },
    imageUrl: "https://picsum.photos/seed/bwatch/1200/800",
    url: "https://botdefender.maula.ai",
    theme: categoryThemes['Incident Response']
  },
  {
    id: 24,
    name: "AnomalyDetect",
    description: "Find the needle in the haystack. AI-powered anomaly detection across your entire infrastructure.",
    category: "Anomaly",
    stats: { threatsBlocked: "10M+ EPS", uptime: "98% Acc", accuracy: "<1% FP" },
    imageUrl: "https://picsum.photos/seed/anomaly/1200/800",
    url: "https://ddosshield.maula.ai",
    theme: categoryThemes['Incident Response']
  },
  {
    id: 25,
    name: "RedTeamAI",
    description: "Think like an attacker. AI-powered red team automation for continuous adversary simulation.",
    category: "Red Team",
    stats: { threatsBlocked: "200+ Tech", uptime: "50+ Evasion", accuracy: "Detailed" },
    imageUrl: "https://picsum.photos/seed/redteam/1200/800",
    url: "https://sslmonitor.maula.ai",
    theme: categoryThemes['AI-Powered']
  },
  {
    id: 26,
    name: "BlueTeamAI",
    description: "Defend with intelligence. AI-powered blue team operations center for automated defense and triage.",
    category: "Blue Team",
    stats: { threatsBlocked: "10x Faster", uptime: "80% Auto", accuracy: "24/7" },
    imageUrl: "https://picsum.photos/seed/blueteam/1200/800",
    url: "https://blueteamai.maula.ai",
    theme: categoryThemes['AI-Powered']
  },
  {
    id: 27,
    name: "SIEMCommander",
    description: "Command your security data. Next-generation SIEM with unlimited data ingestion and AI-powered analytics.",
    category: "SIEM",
    stats: { threatsBlocked: "1M+ EPS", uptime: "Custom Ret", accuracy: "500+ Rules" },
    imageUrl: "https://picsum.photos/seed/siem/1200/800",
    url: "https://siemcommander.maula.ai",
    theme: categoryThemes['AI-Powered']
  },
  {
    id: 28,
    name: "SOAREngine",
    description: "Orchestrate your response. Security orchestration, automation, and response platform with 500+ integrations.",
    category: "SOAR",
    stats: { threatsBlocked: "500+ Integr", uptime: "90% MTTR Red", accuracy: "95% Auto" },
    imageUrl: "https://picsum.photos/seed/soar/1200/800",
    url: "https://soarengine.maula.ai",
    theme: categoryThemes['AI-Powered']
  },
  {
    id: 29,
    name: "RiskScoreAI",
    description: "Quantify your risk. AI-powered risk assessment and scoring to continuously evaluate your security posture.",
    category: "Risk",
    stats: { threatsBlocked: "200+ Fact", uptime: "95% Acc", accuracy: "Real-time" },
    imageUrl: "https://picsum.photos/seed/riskscore/1200/800",
    url: "https://riskscoreai.maula.ai",
    theme: categoryThemes['AI-Powered']
  },
  {
    id: 30,
    name: "PolicyEngine",
    description: "Policy as code. Centralized security policy management with automated enforcement across your infrastructure.",
    category: "Policy",
    stats: { threatsBlocked: "500+ Temp", uptime: "All Major", accuracy: "Real-time" },
    imageUrl: "https://picsum.photos/seed/policy/1200/800",
    url: "https://policyengine.maula.ai",
    theme: categoryThemes['Compliance']
  },
  {
    id: 31,
    name: "AuditTracker",
    description: "Audit with confidence. Comprehensive audit management with automated evidence collection and reporting.",
    category: "Audit",
    stats: { threatsBlocked: "All Major", uptime: "85% Auto", accuracy: "70% Saved" },
    imageUrl: "https://picsum.photos/seed/audit/1200/800",
    url: "https://audittracker.maula.ai",
    theme: categoryThemes['Compliance']
  },
  {
    id: 32,
    name: "ZeroTrustAI",
    description: "Trust nothing, verify everything. Zero trust architecture implementation with continuous verification.",
    category: "Zero Trust",
    stats: { threatsBlocked: "Continuous", uptime: "Real-time", accuracy: "80% Reduc" },
    imageUrl: "https://picsum.photos/seed/zerotrust/1200/800",
    url: "https://zerotrustai.maula.ai",
    theme: categoryThemes['Identity & Access']
  },
  {
    id: 33,
    name: "PasswordVault",
    description: "Secrets management done right. Enterprise password and secrets management with automated rotation.",
    category: "Password",
    stats: { threatsBlocked: "AES-256", uptime: "Automated", accuracy: "Complete" },
    imageUrl: "https://picsum.photos/seed/pvault/1200/800",
    url: "https://passwordvault.maula.ai",
    theme: categoryThemes['Identity & Access']
  },
  {
    id: 34,
    name: "BiometricAI",
    description: "Your identity is the key. AI-powered biometric authentication with liveness detection.",
    category: "Biometric",
    stats: { threatsBlocked: "99.99% Acc", uptime: "Face/Voice", accuracy: "<1s Speed" },
    imageUrl: "https://picsum.photos/seed/biometric/1200/800",
    url: "https://biometricai.maula.ai",
    theme: categoryThemes['Identity & Access']
  },
  {
    id: 35,
    name: "EmailGuard",
    description: "Secure every inbox. Advanced email security with threat detection, DLP, and encryption.",
    category: "Email",
    stats: { threatsBlocked: "100M+ Day", uptime: "99.9% Det", accuracy: "<100ms Lat" },
    imageUrl: "https://picsum.photos/seed/emailguard/1200/800",
    url: "https://emailguard.maula.ai",
    theme: categoryThemes['Network Security']
  },
  {
    id: 36,
    name: "WebFilter",
    description: "Safe browsing guaranteed. Advanced web filtering with category-based policies and threat protection.",
    category: "Web",
    stats: { threatsBlocked: "100+ Cat", uptime: "1B+ Classified", accuracy: "Real-time" },
    imageUrl: "https://picsum.photos/seed/webfilter/1200/800",
    url: "https://webfilter.maula.ai",
    theme: categoryThemes['Network Security']
  },
  {
    id: 37,
    name: "DNSShield",
    description: "DNS security layer. DNS-layer security that blocks threats before they reach your network.",
    category: "DNS",
    stats: { threatsBlocked: "1B+ Qry/Day", uptime: "10M+ Thrts", accuracy: "<10ms Lat" },
    imageUrl: "https://picsum.photos/seed/dnsshield/1200/800",
    url: "https://dnsshield.maula.ai",
    theme: categoryThemes['Network Security']
  },
  {
    id: 38,
    name: "FirewallAI",
    description: "Intelligent perimeter defense. AI-powered next-generation firewall with advanced threat prevention.",
    category: "Firewall",
    stats: { threatsBlocked: "100Gbps", uptime: "Unlimited", accuracy: "99.9%" },
    imageUrl: "https://picsum.photos/seed/firewall/1200/800",
    url: "https://firewallai.maula.ai",
    theme: categoryThemes['Network Security']
  },
  {
    id: 39,
    name: "VPNGuardian",
    description: "Secure remote access. Enterprise VPN with zero-trust network access and granular controls.",
    category: "VPN",
    stats: { threatsBlocked: "Unlimited", uptime: "AES-256", accuracy: "All Major" },
    imageUrl: "https://picsum.photos/seed/vpnguard/1200/800",
    url: "https://vpnguardian.maula.ai",
    theme: categoryThemes['Network Security']
  },
  {
    id: 40,
    name: "WirelessWatch",
    description: "Secure your airwaves. Wireless intrusion detection and prevention with rogue AP detection.",
    category: "Wireless",
    stats: { threatsBlocked: "All 802.11", uptime: "Real-time", accuracy: "Enterprise" },
    imageUrl: "https://picsum.photos/seed/wireless/1200/800",
    url: "https://wirelesswatch.maula.ai",
    theme: categoryThemes['Network Security']
  },
  {
    id: 41,
    name: "IoTSecure",
    description: "Secure the connected world. IoT security platform for device discovery, monitoring, and protection.",
    category: "IoT",
    stats: { threatsBlocked: "10K+ Dev", uptime: "50+ Proto", accuracy: "Complete" },
    imageUrl: "https://picsum.photos/seed/iotsecure/1200/800",
    url: "https://datalossprevention.maula.ai",
    theme: categoryThemes['Cloud Security']
  },
  {
    id: 42,
    name: "MobileDefend",
    description: "Mobile security everywhere. Mobile threat defense for iOS and Android against phishing and malware.",
    category: "Mobile",
    stats: { threatsBlocked: "iOS/Android", uptime: "99.9% Det", accuracy: "<1% Battery" },
    imageUrl: "https://picsum.photos/seed/mdefend/1200/800",
    url: "https://iotsecure.maula.ai",
    theme: categoryThemes['Network Security']
  },
  {
    id: 43,
    name: "BackupGuard",
    description: "Backup with confidence. Secure backup and recovery with ransomware protection and air-gapped storage.",
    category: "Backup",
    stats: { threatsBlocked: "<1min Recov", uptime: "Custom Ret", accuracy: "AES-256" },
    imageUrl: "https://picsum.photos/seed/backup/1200/800",
    url: "https://mobiledefend.maula.ai",
    theme: categoryThemes['Data Protection']
  },
  {
    id: 44,
    name: "DRPlan",
    description: "Disaster recovery made simple. Comprehensive disaster recovery planning and orchestration.",
    category: "DR",
    stats: { threatsBlocked: "<15min RTO", uptime: "<5min RPO", accuracy: "Automated" },
    imageUrl: "https://picsum.photos/seed/drplan/1200/800",
    url: "https://backupguard.maula.ai",
    theme: categoryThemes['Incident Response']
  },
  {
    id: 45,
    name: "PrivacyShield",
    description: "Privacy by design. Privacy management platform for data subject requests and consent management.",
    category: "Privacy",
    stats: { threatsBlocked: "<24hr Resp", uptime: "GDPR/CCPA", accuracy: "90% Auto" },
    imageUrl: "https://picsum.photos/seed/privacy/1200/800",
    url: "https://drplan.maula.ai",
    theme: categoryThemes['Data Protection']
  },
  {
    id: 46,
    name: "GDPRCompliance",
    description: "GDPR made manageable. Complete GDPR compliance management with data mapping and DPIA automation.",
    category: "GDPR",
    stats: { threatsBlocked: "All 99 Art", uptime: "100+ Temp", accuracy: "Audit Redy" },
    imageUrl: "https://picsum.photos/seed/gdpr/1200/800",
    url: "https://privacyshield.maula.ai",
    theme: categoryThemes['Compliance']
  },
  {
    id: 47,
    name: "HIPAAGuard",
    description: "Healthcare compliance simplified. HIPAA compliance management with PHI protection and access monitoring.",
    category: "HIPAA",
    stats: { threatsBlocked: "All HIPAA", uptime: "BAA Supprt", accuracy: "Audit Redy" },
    imageUrl: "https://picsum.photos/seed/hipaa/1200/800",
    url: "https://gdprcompliance.maula.ai",
    theme: categoryThemes['Compliance']
  },
  {
    id: 48,
    name: "PCI-DSS",
    description: "Payment security assured. PCI-DSS compliance for payment card security and network monitoring.",
    category: "PCI-DSS",
    stats: { threatsBlocked: "All 12 Req", uptime: "All SAQ", accuracy: "Continuous" },
    imageUrl: "https://picsum.photos/seed/pcidss/1200/800",
    url: "https://hipaaguard.maula.ai",
    theme: categoryThemes['Compliance']
  },
  {
    id: 49,
    name: "BugBountyAI",
    description: "Crowdsource your security. AI-powered bug bounty platform to manage submissions and researcher rewards.",
    category: "Bug Bounty",
    stats: { threatsBlocked: "50K+ Resrch", uptime: "<1hr Triag", accuracy: "<24hr Pay" },
    imageUrl: "https://picsum.photos/seed/bugbounty/1200/800",
    url: "https://pcidsscheck.maula.ai",
    theme: categoryThemes['AI-Powered']
  },
  {
    id: 50,
    name: "CyberEduAI",
    description: "Security awareness that works. AI-powered security awareness training with personalized learning paths.",
    category: "Education",
    stats: { threatsBlocked: "200+ Crse", uptime: "30+ Lang", accuracy: "95% Engagem" },
    imageUrl: "https://picsum.photos/seed/cyberedu/1200/800",
    url: "https://bugbountyai.maula.ai",
    theme: categoryThemes['Incident Response']
  }
];


