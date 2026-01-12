import { SecurityTool } from '../types';

const categoryThemes: Record<string, SecurityTool['theme']> = {
  'Threat Detection': {
    primary: 'red-500',
    secondary: 'orange-500',
    glow: 'rgba(239, 68, 68, 0.4)',
    bgStop: '#0d0404',
  },
  'Network Security': {
    primary: 'emerald-500',
    secondary: 'teal-400',
    glow: 'rgba(16, 185, 129, 0.4)',
    bgStop: '#040d0a',
  },
  'AI-Powered': {
    primary: 'purple-500',
    secondary: 'pink-500',
    glow: 'rgba(168, 85, 247, 0.4)',
    bgStop: '#08040d',
  },
  'Data Protection': {
    primary: 'blue-500',
    secondary: 'cyan-400',
    glow: 'rgba(59, 130, 246, 0.4)',
    bgStop: '#04080d',
  },
  Compliance: {
    primary: 'amber-500',
    secondary: 'yellow-400',
    glow: 'rgba(245, 158, 11, 0.4)',
    bgStop: '#0d0a04',
  },
  'Identity & Access': {
    primary: 'purple-500',
    secondary: 'indigo-400',
    glow: 'rgba(129, 140, 248, 0.4)',
    bgStop: '#040412',
  },
  'Cloud Security': {
    primary: 'cyan-500',
    secondary: 'blue-400',
    glow: 'rgba(6, 182, 212, 0.4)',
    bgStop: '#040d12',
  },
  'Incident Response': {
    primary: 'orange-500',
    secondary: 'red-400',
    glow: 'rgba(249, 115, 22, 0.4)',
    bgStop: '#0d0503',
  },
};

const getThemeForCategory = (cat: string): SecurityTool['theme'] => {
  if (
    cat.includes('Detection') ||
    cat.includes('Malware') ||
    cat.includes('Phishing') ||
    cat.includes('Intelligence')
  )
    return categoryThemes['Threat Detection'];
  if (
    cat.includes('Network') ||
    cat.includes('Firewall') ||
    cat.includes('DNS') ||
    cat.includes('VPN') ||
    cat.includes('Wireless')
  )
    return categoryThemes['Network Security'];
  if (
    cat.includes('AI') ||
    cat.includes('Red Team') ||
    cat.includes('Blue Team') ||
    cat.includes('SIEM') ||
    cat.includes('SOAR') ||
    cat.includes('Bug Bounty')
  )
    return categoryThemes['AI-Powered'];
  if (
    cat.includes('Data') ||
    cat.includes('Crypto') ||
    cat.includes('Backup') ||
    cat.includes('Privacy')
  )
    return categoryThemes['Data Protection'];
  if (
    cat.includes('Compliance') ||
    cat.includes('GDPR') ||
    cat.includes('HIPAA') ||
    cat.includes('PCI') ||
    cat.includes('Audit') ||
    cat.includes('Policy')
  )
    return categoryThemes['Compliance'];
  if (
    cat.includes('IAM') ||
    cat.includes('Zero Trust') ||
    cat.includes('Password') ||
    cat.includes('Biometric') ||
    cat.includes('Identity')
  )
    return categoryThemes['Identity & Access'];
  if (
    cat.includes('Cloud') ||
    cat.includes('API') ||
    cat.includes('Container') ||
    cat.includes('DevSecOps') ||
    cat.includes('IoT')
  )
    return categoryThemes['Cloud Security'];
  if (
    cat.includes('Incident') ||
    cat.includes('Response') ||
    cat.includes('Forensics') ||
    cat.includes('DR') ||
    cat.includes('Anomaly')
  )
    return categoryThemes['Incident Response'];
  return categoryThemes['Threat Detection']; // Fallback
};

export const tools: SecurityTool[] = [
  {
    id: 1,
    name: 'FraudGuard',
    description:
      'Stop fraud before it starts. AI-powered fraud detection that analyzes patterns in real-time, identifying suspicious activities with 99.9% accuracy.',
    category: 'Threat Detection',
    stats: { threatsBlocked: '10M+', uptime: '<50ms Resp', accuracy: '99.9%' },
    imageUrl: 'https://picsum.photos/seed/fraudguard/1200/800',
    theme: categoryThemes['Threat Detection'],
  },
  {
    id: 2,
    name: 'DarkWebMonitor',
    description:
      'Intelligence that sees everything. Advanced threat intelligence platform that monitors dark web markets, forums, and encrypted channels for stolen credentials and data.',
    category: 'Intelligence',
    stats: { threatsBlocked: '50K+ Src', uptime: 'Global', accuracy: 'Real-time' },
    imageUrl: 'https://picsum.photos/seed/darkwebmonitor/1200/800',
    theme: categoryThemes['Threat Detection'],
  },
  {
    id: 3,
    name: 'ZeroDayDetect',
    description:
      '360° threat visibility. Comprehensive zero-day threat detection system that identifies unknown vulnerabilities and exploits before they cause damage.',
    category: 'Threat Detection',
    stats: { threatsBlocked: '99.7% Det', uptime: '<1m MTTD', accuracy: '<0.1% FP' },
    imageUrl: 'https://picsum.photos/seed/zerodaydetect/1200/800',
    theme: categoryThemes['Threat Detection'],
  },
  {
    id: 4,
    name: 'RansomShield',
    description:
      'Complete ransomware protection. Advanced ransomware detection and prevention using behavioral analysis, file integrity monitoring, and instant recovery.',
    category: 'Malware',
    stats: { threatsBlocked: '1M+ Samples', uptime: '500+ Zero-Day', accuracy: '<30s Analys' },
    imageUrl: 'https://picsum.photos/seed/ransomshield/1200/800',
    theme: categoryThemes['Threat Detection'],
  },
  {
    id: 5,
    name: 'PhishNetAI',
    description:
      'Catch every phish in the net. AI-powered phishing detection that analyzes URLs, emails, and web content with machine learning precision.',
    category: 'Phishing',
    stats: { threatsBlocked: '5M+ Block', uptime: '99.8% Det', accuracy: '100M+ Scans' },
    imageUrl: 'https://picsum.photos/seed/phishnetai/1200/800',
    theme: categoryThemes['Threat Detection'],
  },
  {
    id: 6,
    name: 'VulnScan',
    description:
      'Find weaknesses before attackers do. Continuous vulnerability scanning for your entire attack surface identifying CVEs and misconfigurations.',
    category: 'Vulnerability',
    stats: { threatsBlocked: '200K+ CVEs', uptime: '10K hosts/hr', accuracy: '99.5%' },
    imageUrl: 'https://picsum.photos/seed/vulnscan/1200/800',
    theme: categoryThemes['Compliance'],
  },
  {
    id: 7,
    name: 'PenTestAI',
    description:
      'AI-driven penetration testing. Automated penetration testing powered by AI that thinks like a hacker for continuous validation.',
    category: 'Penetration Testing',
    stats: { threatsBlocked: '1000+ Vectors', uptime: '50K+ Exploit', accuracy: 'Full Stack' },
    imageUrl: 'https://picsum.photos/seed/pentestai/1200/800',
    theme: categoryThemes['AI-Powered'],
  },
  {
    id: 8,
    name: 'CodeSentinel',
    description:
      'Code security from the start. Static and dynamic application security testing integrated into your CI/CD pipeline with intelligent code analysis.',
    category: 'Code Security',
    stats: { threatsBlocked: '30+ Lang', uptime: '5000+ Rules', accuracy: '<5% FP' },
    imageUrl: 'https://picsum.photos/seed/codesentinel/1200/800',
    theme: categoryThemes['Cloud Security'],
  },
  {
    id: 9,
    name: 'RuntimeGuard',
    description:
      'Runtime application protection. Real-time application security monitoring and protection that detects and blocks attacks during execution.',
    category: 'Runtime Security',
    stats: { threatsBlocked: '20+ Frames', uptime: '1000+ Ctrl', accuracy: '90% Auto' },
    imageUrl: 'https://picsum.photos/seed/runtimeguard/1200/800',
    theme: categoryThemes['Cloud Security'],
  },
  {
    id: 10,
    name: 'DataGuardian',
    description:
      'Protect what matters most. Enterprise data loss prevention with intelligent content inspection across your organization.',
    category: 'Data Protection',
    stats: { threatsBlocked: '100+ Types', uptime: 'Custom Sens', accuracy: 'AES-256' },
    imageUrl: 'https://picsum.photos/seed/dataguardian/1200/800',
    theme: categoryThemes['Data Protection'],
  },
  {
    id: 11,
    name: 'IncidentResponse',
    description:
      'Respond faster, recover stronger. Comprehensive incident response platform with automated playbooks, team collaboration, and forensic capabilities.',
    category: 'Incident Response',
    stats: { threatsBlocked: '60% MTTR', uptime: '100+ Playbk', accuracy: '50+ Integr' },
    imageUrl: 'https://picsum.photos/seed/incidentresponse/1200/800',
    theme: categoryThemes['Incident Response'],
  },
  {
    id: 12,
    name: 'XDRPlatform',
    description:
      'Extended detection and response. Unified XDR platform that correlates data across endpoints, networks, cloud, and applications for comprehensive threat visibility.',
    category: 'Detection & Response',
    stats: { threatsBlocked: '200+ Integr', uptime: '15+ Auth', accuracy: 'Unlimited' },
    imageUrl: 'https://picsum.photos/seed/xdrplatform/1200/800',
    theme: categoryThemes['Threat Detection'],
  },
  {
    id: 13,
    name: 'IdentityForge',
    description:
      'Identity is the new perimeter. Unified identity and access management with zero-trust principles across your entire infrastructure.',
    category: 'Identity & Access',
    stats: { threatsBlocked: '200+ Integr', uptime: '15+ Auth', accuracy: 'Unlimited' },
    imageUrl: 'https://picsum.photos/seed/identityforge/1200/800',
    theme: categoryThemes['Identity & Access'],
  },
  {
    id: 14,
    name: 'SecretVault',
    description:
      'Secrets management done right. Enterprise secrets and credentials management with automated rotation and secure storage.',
    category: 'Secrets Management',
    stats: { threatsBlocked: 'AES-256', uptime: 'Automated', accuracy: 'Complete' },
    imageUrl: 'https://picsum.photos/seed/secretvault/1200/800',
    theme: categoryThemes['Identity & Access'],
  },
  {
    id: 15,
    name: 'PrivilegeGuard',
    description:
      'Protect privileged access. Privileged access management with just-in-time access, session recording, and credential vaulting.',
    category: 'Privileged Access',
    stats: { threatsBlocked: '99.9% Det', uptime: 'W/M/L Plat', accuracy: '<10s Resp' },
    imageUrl: 'https://picsum.photos/seed/privilegeguard/1200/800',
    theme: categoryThemes['Identity & Access'],
  },
  {
    id: 16,
    name: 'NetworkForensics',
    description:
      'Network visibility and forensics. Deep network traffic analysis and forensics for threat hunting and incident investigation.',
    category: 'Network',
    stats: { threatsBlocked: '100Gbps', uptime: '50K+ Sig', accuracy: '<1ms Lat' },
    imageUrl: 'https://picsum.photos/seed/networkforensics/1200/800',
    theme: categoryThemes['Network Security'],
  },
  {
    id: 17,
    name: 'AuditTrailPro',
    description:
      'Audit with confidence. Comprehensive audit trail management with automated evidence collection, compliance reporting, and change tracking.',
    category: 'Audit',
    stats: { threatsBlocked: 'All Major', uptime: '85% Auto', accuracy: '70% Saved' },
    imageUrl: 'https://picsum.photos/seed/audittrailpro/1200/800',
    theme: categoryThemes['Compliance'],
  },
  {
    id: 18,
    name: 'ThreatModel',
    description:
      'Proactive threat modeling. Automated threat modeling platform that identifies potential attack vectors and security gaps in your architecture.',
    category: 'Threat Modeling',
    stats: { threatsBlocked: 'Unlimited', uptime: '50+ Atk Typ', accuracy: '<5ms Lat' },
    imageUrl: 'https://picsum.photos/seed/threatmodel/1200/800',
    theme: categoryThemes['AI-Powered'],
  },
  {
    id: 19,
    name: 'RiskQuantify',
    description:
      'Quantify your risk. AI-powered risk assessment and scoring to continuously evaluate and prioritize your security posture.',
    category: 'Risk',
    stats: { threatsBlocked: '200+ Fact', uptime: '95% Acc', accuracy: 'Real-time' },
    imageUrl: 'https://picsum.photos/seed/riskquantify/1200/800',
    theme: categoryThemes['AI-Powered'],
  },
  {
    id: 20,
    name: 'SecurityDashboard',
    description:
      'Unified security visibility. Centralized security dashboard with real-time metrics, KPIs, and executive reporting across your entire security stack.',
    category: 'Monitoring',
    stats: { threatsBlocked: 'Multi-Cloud', uptime: '1000+ Checks', accuracy: 'Auto Remed' },
    imageUrl: 'https://picsum.photos/seed/securitydashboard/1200/800',
    theme: categoryThemes['Cloud Security'],
  },
  {
    id: 21,
    name: 'WAFManager',
    description:
      'Web application firewall management. Centralized WAF management with custom rules, bot protection, and real-time threat intelligence.',
    category: 'Web Security',
    stats: { threatsBlocked: '50+ Src', uptime: '20+ Analysis', accuracy: 'All Format' },
    imageUrl: 'https://picsum.photos/seed/wafmanager/1200/800',
    theme: categoryThemes['Network Security'],
  },
  {
    id: 22,
    name: 'APIShield',
    description:
      'Secure every API call. API security testing and runtime protection against API-specific attacks, abuse, and shadow APIs.',
    category: 'API',
    stats: { threatsBlocked: 'Unlimited', uptime: '50+ Atk Typ', accuracy: '<5ms Lat' },
    imageUrl: 'https://picsum.photos/seed/apishield/1200/800',
    theme: categoryThemes['Cloud Security'],
  },
  {
    id: 23,
    name: 'BotMitigation',
    description:
      'Stop malicious bots. Advanced bot detection and mitigation that distinguishes between good bots, bad bots, and human traffic.',
    category: 'Bot Protection',
    stats: { threatsBlocked: 'Unlimited', uptime: '20+ Models', accuracy: '<1hr Det' },
    imageUrl: 'https://picsum.photos/seed/botmitigation/1200/800',
    theme: categoryThemes['Network Security'],
  },
  {
    id: 24,
    name: 'DDoSDefender',
    description:
      'DDoS protection at scale. Multi-layer DDoS protection with automatic mitigation, traffic scrubbing, and real-time attack analytics.',
    category: 'DDoS',
    stats: { threatsBlocked: '10M+ EPS', uptime: '98% Acc', accuracy: '<1% FP' },
    imageUrl: 'https://picsum.photos/seed/ddosdefender/1200/800',
    theme: categoryThemes['Network Security'],
  },
  {
    id: 25,
    name: 'SSLMonitor',
    description:
      'Certificate management simplified. SSL/TLS certificate monitoring with expiration alerts, vulnerability detection, and automated renewal.',
    category: 'Certificate Management',
    stats: { threatsBlocked: '200+ Tech', uptime: '50+ Evasion', accuracy: 'Detailed' },
    imageUrl: 'https://picsum.photos/seed/sslmonitor/1200/800',
    theme: categoryThemes['Network Security'],
  },
  {
    id: 26,
    name: 'BlueTeamAI',
    description:
      'Defend with intelligence. AI-powered blue team operations center for automated defense, threat hunting, and incident triage.',
    category: 'Blue Team',
    stats: { threatsBlocked: '10x Faster', uptime: '80% Auto', accuracy: '24/7' },
    imageUrl: 'https://picsum.photos/seed/blueteamai/1200/800',
    theme: categoryThemes['AI-Powered'],
  },
  {
    id: 27,
    name: 'SIEMCommander',
    description:
      'Command your security data. Next-generation SIEM with unlimited data ingestion and AI-powered analytics.',
    category: 'SIEM',
    stats: { threatsBlocked: '1M+ EPS', uptime: 'Custom Ret', accuracy: '500+ Rules' },
    imageUrl: 'https://picsum.photos/seed/siemcommander/1200/800',
    theme: categoryThemes['AI-Powered'],
  },
  {
    id: 28,
    name: 'SOAREngine',
    description:
      'Orchestrate your response. Security orchestration, automation, and response platform with 500+ integrations.',
    category: 'SOAR',
    stats: { threatsBlocked: '500+ Integr', uptime: '90% MTTR Red', accuracy: '95% Auto' },
    imageUrl: 'https://picsum.photos/seed/soarengine/1200/800',
    theme: categoryThemes['AI-Powered'],
  },
  {
    id: 29,
    name: 'BehaviorAnalytics',
    description:
      'Behavior tells the story. User and entity behavior analytics powered by machine learning to detect insider threats and anomalies.',
    category: 'Behavior',
    stats: { threatsBlocked: 'Unlimited', uptime: '20+ Models', accuracy: '<1hr Det' },
    imageUrl: 'https://picsum.photos/seed/behavioranalytics/1200/800',
    theme: categoryThemes['Incident Response'],
  },
  {
    id: 30,
    name: 'PolicyEngine',
    description:
      'Policy as code. Centralized security policy management with automated enforcement across your infrastructure.',
    category: 'Policy',
    stats: { threatsBlocked: '500+ Temp', uptime: 'All Major', accuracy: 'Real-time' },
    imageUrl: 'https://picsum.photos/seed/policyengine/1200/800',
    theme: categoryThemes['Compliance'],
  },
  {
    id: 31,
    name: 'CloudPosture',
    description:
      'Secure your cloud journey. Cloud security posture management for AWS, Azure, and GCP with continuous monitoring and auto-remediation.',
    category: 'Cloud',
    stats: { threatsBlocked: 'Multi-Cloud', uptime: '1000+ Checks', accuracy: 'Auto Remed' },
    imageUrl: 'https://picsum.photos/seed/cloudposture/1200/800',
    theme: categoryThemes['Cloud Security'],
  },
  {
    id: 32,
    name: 'ZeroTrust',
    description:
      'Trust nothing, verify everything. Zero trust architecture implementation with continuous verification and least privilege access.',
    category: 'Zero Trust',
    stats: { threatsBlocked: 'Continuous', uptime: 'Real-time', accuracy: '80% Reduc' },
    imageUrl: 'https://picsum.photos/seed/zerotrust/1200/800',
    theme: categoryThemes['Identity & Access'],
  },
  {
    id: 33,
    name: 'KubeArmor',
    description:
      'Kubernetes security hardening. Runtime security for Kubernetes with policy enforcement, network segmentation, and workload protection.',
    category: 'Container',
    stats: { threatsBlocked: 'All Major', uptime: '200K+ CVEs', accuracy: '<30s Scan' },
    imageUrl: 'https://picsum.photos/seed/kubearmor/1200/800',
    theme: categoryThemes['Cloud Security'],
  },
  {
    id: 34,
    name: 'ContainerScan',
    description:
      'Container security done right. Container image scanning and runtime protection from build to production with vulnerability detection.',
    category: 'Container',
    stats: { threatsBlocked: 'All Major', uptime: '200K+ CVEs', accuracy: '<30s Scan' },
    imageUrl: 'https://picsum.photos/seed/containerscan/1200/800',
    theme: categoryThemes['Cloud Security'],
  },
  {
    id: 35,
    name: 'EmailDefender',
    description:
      'Secure every inbox. Advanced email security with threat detection, anti-phishing, DLP, and encryption for complete email protection.',
    category: 'Email',
    stats: { threatsBlocked: '100M+ Day', uptime: '99.9% Det', accuracy: '<100ms Lat' },
    imageUrl: 'https://picsum.photos/seed/emaildefender/1200/800',
    theme: categoryThemes['Network Security'],
  },
  {
    id: 36,
    name: 'BrowserIsolation',
    description:
      'Safe browsing guaranteed. Remote browser isolation that protects users from web-based threats by executing content in secure containers.',
    category: 'Web',
    stats: { threatsBlocked: '100+ Cat', uptime: '1B+ Classified', accuracy: 'Real-time' },
    imageUrl: 'https://picsum.photos/seed/browserisolation/1200/800',
    theme: categoryThemes['Network Security'],
  },
  {
    id: 37,
    name: 'DNSFirewall',
    description:
      'DNS security layer. DNS-layer security firewall that blocks threats before they reach your network with threat intelligence.',
    category: 'DNS',
    stats: { threatsBlocked: '1B+ Qry/Day', uptime: '10M+ Thrts', accuracy: '<10ms Lat' },
    imageUrl: 'https://picsum.photos/seed/dnsfirewall/1200/800',
    theme: categoryThemes['Network Security'],
  },
  {
    id: 38,
    name: 'FirewallAI',
    description:
      'Intelligent perimeter defense. AI-powered next-generation firewall with advanced threat prevention and adaptive policies.',
    category: 'Firewall',
    stats: { threatsBlocked: '100Gbps', uptime: 'Unlimited', accuracy: '99.9%' },
    imageUrl: 'https://picsum.photos/seed/firewallai/1200/800',
    theme: categoryThemes['Network Security'],
  },
  {
    id: 39,
    name: 'VPNAnalyzer',
    description:
      'Secure remote access. Enterprise VPN with zero-trust network access, traffic analysis, and granular access controls.',
    category: 'VPN',
    stats: { threatsBlocked: 'Unlimited', uptime: 'AES-256', accuracy: 'All Major' },
    imageUrl: 'https://picsum.photos/seed/vpnanalyzer/1200/800',
    theme: categoryThemes['Network Security'],
  },
  {
    id: 40,
    name: 'WirelessHunter',
    description:
      'Secure your airwaves. Wireless intrusion detection and prevention with rogue AP detection and spectrum analysis.',
    category: 'Wireless',
    stats: { threatsBlocked: 'All 802.11', uptime: 'Real-time', accuracy: 'Enterprise' },
    imageUrl: 'https://picsum.photos/seed/wirelesshunter/1200/800',
    theme: categoryThemes['Network Security'],
  },
  {
    id: 41,
    name: 'DLPAdvanced',
    description:
      'Advanced data loss prevention. Enterprise DLP with intelligent content inspection, policy enforcement, and cross-channel protection.',
    category: 'Data Protection',
    stats: { threatsBlocked: '100+ Types', uptime: 'Custom Sens', accuracy: 'AES-256' },
    imageUrl: 'https://picsum.photos/seed/dlpadvanced/1200/800',
    theme: categoryThemes['Data Protection'],
  },
  {
    id: 42,
    name: 'IoTSentinel',
    description:
      'Secure the connected world. IoT security platform for device discovery, monitoring, vulnerability management, and protection.',
    category: 'IoT',
    stats: { threatsBlocked: '10K+ Dev', uptime: '50+ Proto', accuracy: 'Complete' },
    imageUrl: 'https://picsum.photos/seed/iotsentinel/1200/800',
    theme: categoryThemes['Cloud Security'],
  },
  {
    id: 43,
    name: 'MobileShield',
    description:
      'Mobile security everywhere. Mobile threat defense for iOS and Android against phishing, malware, and network attacks.',
    category: 'Mobile',
    stats: { threatsBlocked: 'iOS/Android', uptime: '99.9% Det', accuracy: '<1% Battery' },
    imageUrl: 'https://picsum.photos/seed/mobileshield/1200/800',
    theme: categoryThemes['Network Security'],
  },
  {
    id: 44,
    name: 'SupplyChainAI',
    description:
      'Secure your supply chain. AI-powered software supply chain security with dependency analysis, SBOM generation, and vulnerability tracking.',
    category: 'Supply Chain',
    stats: { threatsBlocked: '<1min Recov', uptime: 'Custom Ret', accuracy: 'AES-256' },
    imageUrl: 'https://picsum.photos/seed/supplychainai/1200/800',
    theme: categoryThemes['Cloud Security'],
  },
  {
    id: 45,
    name: 'DRPlan',
    description:
      'Disaster recovery made simple. Comprehensive disaster recovery planning, testing, and orchestration for business continuity.',
    category: 'DR',
    stats: { threatsBlocked: '<15min RTO', uptime: '<5min RPO', accuracy: 'Automated' },
    imageUrl: 'https://picsum.photos/seed/drplan/1200/800',
    theme: categoryThemes['Incident Response'],
  },
  {
    id: 46,
    name: 'PrivacyShield',
    description:
      'Privacy by design. Privacy management platform for data subject requests, consent management, and privacy impact assessments.',
    category: 'Privacy',
    stats: { threatsBlocked: '<24hr Resp', uptime: 'GDPR/CCPA', accuracy: '90% Auto' },
    imageUrl: 'https://picsum.photos/seed/privacyshield/1200/800',
    theme: categoryThemes['Data Protection'],
  },
  {
    id: 47,
    name: 'GDPRCompliance',
    description:
      'GDPR made manageable. Complete GDPR compliance management with data mapping, DPIA automation, and breach notification.',
    category: 'GDPR',
    stats: { threatsBlocked: 'All 99 Art', uptime: '100+ Temp', accuracy: 'Audit Redy' },
    imageUrl: 'https://picsum.photos/seed/gdprcompliance/1200/800',
    theme: categoryThemes['Compliance'],
  },
  {
    id: 48,
    name: 'HIPAAGuard',
    description:
      'Healthcare compliance simplified. HIPAA compliance management with PHI protection, access monitoring, and audit trails.',
    category: 'HIPAA',
    stats: { threatsBlocked: 'All HIPAA', uptime: 'BAA Supprt', accuracy: 'Audit Redy' },
    imageUrl: 'https://picsum.photos/seed/hipaaguard/1200/800',
    theme: categoryThemes['Compliance'],
  },
  {
    id: 49,
    name: 'SOC2Automator',
    description:
      'SOC 2 compliance automated. Continuous SOC 2 compliance monitoring with evidence collection, gap analysis, and audit preparation.',
    category: 'Compliance',
    stats: { threatsBlocked: 'All 12 Req', uptime: 'All SAQ', accuracy: 'Continuous' },
    imageUrl: 'https://picsum.photos/seed/soc2automator/1200/800',
    theme: categoryThemes['Compliance'],
  },
  {
    id: 50,
    name: 'ISO27001',
    description:
      'ISO 27001 certification ready. Complete ISO 27001 compliance management with controls mapping, risk assessment, and certification support.',
    category: 'Compliance',
    stats: { threatsBlocked: '200+ Crse', uptime: '30+ Lang', accuracy: '95% Engagem' },
    imageUrl: 'https://picsum.photos/seed/iso27001/1200/800',
    theme: categoryThemes['Compliance'],
  },
];
