/**
 * XDR Platform API Client
 * Real-world XDR API with simulated enterprise data
 */

import type {
  Alert,
  AlertSeverity,
  AlertStatus,
  DataSource,
  DataSourceType,
  DataSourceVendor,
  DetectionRule,
  Entity,
  EntityRiskProfile,
  EntityType,
  Hunt,
  MitreMapping,
  MitreTactic,
  NormalizedEvent,
  Playbook,
  PlaybookExecution,
  UserEntity,
  HostEntity,
  IPEntity,
  XDRDashboard,
} from '../types/xdr.types';

// ============================================================================
// API Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ============================================================================
// Mock Data Generators
// ============================================================================

const randomId = () => Math.random().toString(36).substring(2, 15);

const randomDate = (daysAgo: number = 7): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.random() * daysAgo);
  date.setHours(date.getHours() - Math.random() * 24);
  return date.toISOString();
};

const recentDate = (hoursAgo: number = 24): string => {
  const date = new Date();
  date.setHours(date.getHours() - Math.random() * hoursAgo);
  return date.toISOString();
};

// ============================================================================
// Mock Data Sources
// ============================================================================

const mockDataSources: DataSource[] = [
  {
    id: 'ds-crowdstrike',
    name: 'CrowdStrike Falcon',
    type: 'edr',
    vendor: 'crowdstrike',
    status: 'connected',
    lastSeen: new Date().toISOString(),
    eventsLast24h: 2847593,
    eventsPerSecond: 32.9,
    healthScore: 98,
    capabilities: ['process', 'file', 'network', 'registry', 'detection'],
  },
  {
    id: 'ds-defender',
    name: 'Microsoft Defender',
    type: 'edr',
    vendor: 'microsoft-defender',
    status: 'connected',
    lastSeen: new Date().toISOString(),
    eventsLast24h: 1924837,
    eventsPerSecond: 22.3,
    healthScore: 95,
    capabilities: ['process', 'file', 'network', 'detection', 'email'],
  },
  {
    id: 'ds-okta',
    name: 'Okta Identity',
    type: 'identity',
    vendor: 'okta',
    status: 'connected',
    lastSeen: new Date().toISOString(),
    eventsLast24h: 384729,
    eventsPerSecond: 4.5,
    healthScore: 100,
    capabilities: ['authentication', 'user-management', 'mfa', 'sessions'],
  },
  {
    id: 'ds-aad',
    name: 'Azure Active Directory',
    type: 'identity',
    vendor: 'azure-ad',
    status: 'connected',
    lastSeen: new Date().toISOString(),
    eventsLast24h: 547382,
    eventsPerSecond: 6.3,
    healthScore: 97,
    capabilities: ['authentication', 'user-management', 'conditional-access'],
  },
  {
    id: 'ds-zeek',
    name: 'Zeek Network Monitor',
    type: 'ndr',
    vendor: 'zeek',
    status: 'connected',
    lastSeen: new Date().toISOString(),
    eventsLast24h: 18472934,
    eventsPerSecond: 213.8,
    healthScore: 99,
    capabilities: ['dns', 'http', 'ssl', 'conn', 'files'],
  },
  {
    id: 'ds-paloalto',
    name: 'Palo Alto Firewall',
    type: 'firewall',
    vendor: 'palo-alto',
    status: 'connected',
    lastSeen: new Date().toISOString(),
    eventsLast24h: 8374928,
    eventsPerSecond: 96.9,
    healthScore: 94,
    capabilities: ['traffic', 'threat', 'url-filtering', 'wildfire'],
  },
  {
    id: 'ds-aws',
    name: 'AWS CloudTrail',
    type: 'cloud',
    vendor: 'aws',
    status: 'connected',
    lastSeen: new Date().toISOString(),
    eventsLast24h: 924837,
    eventsPerSecond: 10.7,
    healthScore: 100,
    config: { region: 'us-east-1' },
    capabilities: ['api-calls', 'iam', 's3', 'ec2', 'lambda'],
  },
  {
    id: 'ds-azure',
    name: 'Azure Activity Logs',
    type: 'cloud',
    vendor: 'azure',
    status: 'connected',
    lastSeen: new Date().toISOString(),
    eventsLast24h: 673928,
    eventsPerSecond: 7.8,
    healthScore: 96,
    capabilities: ['api-calls', 'iam', 'storage', 'compute'],
  },
  {
    id: 'ds-dns',
    name: 'Umbrella DNS',
    type: 'dns',
    vendor: 'cisco',
    status: 'connected',
    lastSeen: new Date().toISOString(),
    eventsLast24h: 12847392,
    eventsPerSecond: 148.7,
    healthScore: 99,
    capabilities: ['dns-query', 'dns-block', 'category'],
  },
  {
    id: 'ds-proofpoint',
    name: 'Proofpoint Email',
    type: 'email',
    vendor: 'custom',
    status: 'connected',
    lastSeen: new Date().toISOString(),
    eventsLast24h: 283749,
    eventsPerSecond: 3.3,
    healthScore: 98,
    capabilities: ['email-inbound', 'email-outbound', 'threat', 'dlp'],
  },
];

// ============================================================================
// Mock Users
// ============================================================================

const mockUsers: UserEntity[] = [
  {
    id: 'user-001',
    type: 'user',
    name: 'john.smith@company.com',
    displayName: 'John Smith',
    email: 'john.smith@company.com',
    department: 'Engineering',
    title: 'Senior Developer',
    location: 'New York, US',
    riskScore: 85,
    riskLevel: 'high',
    firstSeen: randomDate(90),
    lastSeen: recentDate(2),
    lastLogin: recentDate(1),
    alertCount: 12,
    eventCount: 24837,
    mfaEnabled: true,
    privileged: true,
    accountStatus: 'active',
    groups: ['Developers', 'Cloud-Admin', 'VPN-Users'],
    tags: ['privileged', 'high-risk'],
    metadata: {},
  },
  {
    id: 'user-002',
    type: 'user',
    name: 'sarah.johnson@company.com',
    displayName: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    department: 'Finance',
    title: 'Finance Director',
    location: 'London, UK',
    riskScore: 72,
    riskLevel: 'high',
    firstSeen: randomDate(180),
    lastSeen: recentDate(4),
    lastLogin: recentDate(3),
    alertCount: 8,
    eventCount: 18472,
    mfaEnabled: true,
    privileged: true,
    accountStatus: 'active',
    groups: ['Finance', 'Executives', 'SAP-Users'],
    tags: ['executive', 'pci-scope'],
    metadata: {},
  },
  {
    id: 'user-003',
    type: 'user',
    name: 'mike.chen@company.com',
    displayName: 'Mike Chen',
    email: 'mike.chen@company.com',
    department: 'IT Operations',
    title: 'System Administrator',
    location: 'Singapore',
    riskScore: 45,
    riskLevel: 'medium',
    firstSeen: randomDate(365),
    lastSeen: recentDate(1),
    lastLogin: recentDate(0.5),
    alertCount: 3,
    eventCount: 89472,
    mfaEnabled: true,
    privileged: true,
    accountStatus: 'active',
    groups: ['IT-Admins', 'Domain-Admins', 'AWS-Admins'],
    tags: ['privileged', 'domain-admin'],
    metadata: {},
  },
  {
    id: 'user-004',
    type: 'user',
    name: 'temp.contractor@company.com',
    displayName: 'Temp Contractor',
    email: 'temp.contractor@company.com',
    department: 'Contractors',
    title: 'External Consultant',
    location: 'Remote',
    riskScore: 62,
    riskLevel: 'medium',
    firstSeen: randomDate(30),
    lastSeen: recentDate(12),
    lastLogin: recentDate(10),
    alertCount: 5,
    eventCount: 3847,
    mfaEnabled: false,
    privileged: false,
    accountStatus: 'active',
    groups: ['Contractors', 'Limited-Access'],
    tags: ['external', 'no-mfa'],
    metadata: {},
  },
];

// ============================================================================
// Mock Hosts
// ============================================================================

const mockHosts: HostEntity[] = [
  {
    id: 'host-001',
    type: 'host',
    name: 'PROD-DC-01',
    displayName: 'Production Domain Controller',
    hostname: 'PROD-DC-01.company.local',
    os: 'Windows Server 2022',
    osVersion: '21H2',
    ipAddresses: ['10.0.1.10'],
    domain: 'company.local',
    riskScore: 35,
    riskLevel: 'medium',
    firstSeen: randomDate(365),
    lastSeen: recentDate(0.1),
    alertCount: 2,
    eventCount: 847293,
    agentVersion: '7.2.3',
    agentStatus: 'online',
    criticality: 'critical',
    assetType: 'domain-controller',
    tags: ['tier-0', 'dc', 'critical'],
    metadata: {},
  },
  {
    id: 'host-002',
    type: 'host',
    name: 'WS-JSMITH-01',
    displayName: 'John Smith Workstation',
    hostname: 'WS-JSMITH-01.company.local',
    os: 'Windows 11 Enterprise',
    osVersion: '23H2',
    ipAddresses: ['10.0.50.142'],
    domain: 'company.local',
    riskScore: 78,
    riskLevel: 'high',
    firstSeen: randomDate(180),
    lastSeen: recentDate(0.5),
    alertCount: 8,
    eventCount: 234872,
    agentVersion: '7.2.3',
    agentStatus: 'online',
    criticality: 'medium',
    assetType: 'workstation',
    tags: ['developer', 'high-risk'],
    metadata: {},
  },
  {
    id: 'host-003',
    type: 'host',
    name: 'PROD-WEB-01',
    displayName: 'Production Web Server',
    hostname: 'PROD-WEB-01.company.local',
    os: 'Ubuntu 22.04 LTS',
    ipAddresses: ['10.0.2.20', '192.168.1.50'],
    riskScore: 42,
    riskLevel: 'medium',
    firstSeen: randomDate(300),
    lastSeen: recentDate(0.2),
    alertCount: 4,
    eventCount: 1847293,
    agentVersion: '7.2.2',
    agentStatus: 'online',
    criticality: 'high',
    assetType: 'web-server',
    tags: ['production', 'internet-facing'],
    metadata: {},
  },
  {
    id: 'host-004',
    type: 'host',
    name: 'PROD-DB-01',
    displayName: 'Production Database',
    hostname: 'PROD-DB-01.company.local',
    os: 'Windows Server 2019',
    osVersion: '1809',
    ipAddresses: ['10.0.3.30'],
    domain: 'company.local',
    riskScore: 28,
    riskLevel: 'low',
    firstSeen: randomDate(500),
    lastSeen: recentDate(0.1),
    alertCount: 1,
    eventCount: 2847392,
    agentVersion: '7.2.3',
    agentStatus: 'online',
    criticality: 'critical',
    assetType: 'database',
    tags: ['pci-scope', 'sql-server'],
    metadata: {},
  },
];

// ============================================================================
// Mock IPs (External Threat IPs)
// ============================================================================

const mockIPs: IPEntity[] = [
  {
    id: 'ip-001',
    type: 'ip',
    name: '185.220.101.45',
    displayName: '185.220.101.45 (TOR Exit)',
    address: '185.220.101.45',
    isInternal: false,
    isPrivate: false,
    geoLocation: { country: 'Germany', city: 'Frankfurt' },
    asn: 'AS24940',
    organization: 'Hetzner Online GmbH',
    reputation: 'malicious',
    riskScore: 95,
    riskLevel: 'critical',
    firstSeen: randomDate(30),
    lastSeen: recentDate(2),
    alertCount: 15,
    eventCount: 847,
    tags: ['tor-exit', 'known-malicious'],
    threatIntel: [
      {
        indicator: '185.220.101.45',
        indicatorType: 'ip',
        source: 'AlienVault OTX',
        confidence: 95,
        severity: 'critical',
        tags: ['tor', 'c2'],
      },
    ],
    metadata: {},
  },
  {
    id: 'ip-002',
    type: 'ip',
    name: '45.33.32.156',
    displayName: '45.33.32.156 (Scanners)',
    address: '45.33.32.156',
    isInternal: false,
    isPrivate: false,
    geoLocation: { country: 'United States', city: 'Fremont' },
    asn: 'AS63949',
    organization: 'Linode LLC',
    reputation: 'suspicious',
    riskScore: 72,
    riskLevel: 'high',
    firstSeen: randomDate(14),
    lastSeen: recentDate(6),
    alertCount: 8,
    eventCount: 2847,
    tags: ['scanner', 'shodan'],
    metadata: {},
  },
];

// ============================================================================
// Mock MITRE Mappings
// ============================================================================

const mockMitreMappings: Record<string, MitreMapping[]> = {
  'impossible-travel': [
    {
      tactic: 'initial-access',
      tacticId: 'TA0001',
      technique: 'Valid Accounts',
      techniqueId: 'T1078',
      subTechnique: 'Cloud Accounts',
      subTechniqueId: 'T1078.004',
    },
  ],
  'rare-auth-source': [
    {
      tactic: 'credential-access',
      tacticId: 'TA0006',
      technique: 'Brute Force',
      techniqueId: 'T1110',
    },
  ],
  'suspicious-process': [
    {
      tactic: 'execution',
      tacticId: 'TA0002',
      technique: 'Command and Scripting Interpreter',
      techniqueId: 'T1059',
      subTechnique: 'PowerShell',
      subTechniqueId: 'T1059.001',
    },
  ],
  'lateral-movement': [
    {
      tactic: 'lateral-movement',
      tacticId: 'TA0008',
      technique: 'Remote Services',
      techniqueId: 'T1021',
      subTechnique: 'SMB/Windows Admin Shares',
      subTechniqueId: 'T1021.002',
    },
  ],
  'dns-tunneling': [
    {
      tactic: 'command-and-control',
      tacticId: 'TA0011',
      technique: 'Application Layer Protocol',
      techniqueId: 'T1071',
      subTechnique: 'DNS',
      subTechniqueId: 'T1071.004',
    },
  ],
  'credential-dump': [
    {
      tactic: 'credential-access',
      tacticId: 'TA0006',
      technique: 'OS Credential Dumping',
      techniqueId: 'T1003',
      subTechnique: 'LSASS Memory',
      subTechniqueId: 'T1003.001',
    },
  ],
};

// ============================================================================
// Mock Alerts
// ============================================================================

const generateMockAlerts = (): Alert[] => [
  {
    id: 'alert-001',
    title: 'Impossible Travel: Login from US then Germany in 10 minutes',
    description: 'User john.smith@company.com logged in from New York, US at 14:32 UTC and then from Frankfurt, Germany at 14:42 UTC. Distance: 6,300 km. Time between logins: 10 minutes.',
    severity: 'critical',
    status: 'new',
    source: 'identity',
    sourceVendor: 'okta',
    timestamp: recentDate(1),
    updatedAt: recentDate(0.5),
    mitre: mockMitreMappings['impossible-travel'],
    entities: {
      users: ['user-001'],
      ips: ['45.33.32.156'],
    },
    detection: {
      ruleId: 'rule-001',
      ruleName: 'Impossible Travel Detection',
      ruleType: 'ueba',
      confidence: 92,
    },
    eventCount: 2,
    tags: ['identity', 'account-compromise'],
  },
  {
    id: 'alert-002',
    title: 'Suspicious PowerShell with Encoded Command',
    description: 'Process powershell.exe executed with -EncodedCommand parameter containing Base64 encoded script. Decoded script attempts to download and execute remote payload.',
    severity: 'critical',
    status: 'in-progress',
    source: 'edr',
    sourceVendor: 'crowdstrike',
    timestamp: recentDate(3),
    updatedAt: recentDate(1),
    mitre: mockMitreMappings['suspicious-process'],
    entities: {
      users: ['user-001'],
      hosts: ['host-002'],
    },
    detection: {
      ruleId: 'rule-005',
      ruleName: 'Encoded PowerShell Command',
      ruleType: 'sigma',
      confidence: 88,
    },
    eventCount: 5,
    assignee: 'security-analyst@company.com',
    tags: ['edr', 'malware', 'powershell'],
  },
  {
    id: 'alert-003',
    title: 'Potential LSASS Memory Access',
    description: 'Process mimikatz.exe attempted to access LSASS process memory on PROD-DC-01. This is a common technique for credential dumping.',
    severity: 'critical',
    status: 'new',
    source: 'edr',
    sourceVendor: 'microsoft-defender',
    timestamp: recentDate(0.5),
    updatedAt: recentDate(0.5),
    mitre: mockMitreMappings['credential-dump'],
    entities: {
      users: ['user-003'],
      hosts: ['host-001'],
    },
    detection: {
      ruleId: 'rule-008',
      ruleName: 'LSASS Memory Access',
      ruleType: 'vendor',
      confidence: 95,
    },
    eventCount: 3,
    tags: ['credential-theft', 'mimikatz', 'domain-controller'],
  },
  {
    id: 'alert-004',
    title: 'DNS Tunneling Detected',
    description: 'Unusual DNS query patterns detected from host WS-JSMITH-01. High volume of TXT queries to subdomain.malicious-domain.com with encoded data in query names.',
    severity: 'high',
    status: 'new',
    source: 'dns',
    sourceVendor: 'cisco',
    timestamp: recentDate(2),
    updatedAt: recentDate(2),
    mitre: mockMitreMappings['dns-tunneling'],
    entities: {
      hosts: ['host-002'],
      domains: ['malicious-domain.com'],
    },
    detection: {
      ruleId: 'rule-012',
      ruleName: 'DNS Tunneling - High Entropy Queries',
      ruleType: 'ml',
      confidence: 78,
    },
    eventCount: 847,
    tags: ['exfiltration', 'dns', 'c2'],
  },
  {
    id: 'alert-005',
    title: 'Lateral Movement via SMB',
    description: 'User john.smith performed lateral movement from WS-JSMITH-01 to PROD-DB-01 using SMB admin shares. Accessed C$ and ADMIN$ shares.',
    severity: 'high',
    status: 'new',
    source: 'edr',
    sourceVendor: 'crowdstrike',
    timestamp: recentDate(1.5),
    updatedAt: recentDate(1.5),
    mitre: mockMitreMappings['lateral-movement'],
    entities: {
      users: ['user-001'],
      hosts: ['host-002', 'host-004'],
    },
    detection: {
      ruleId: 'rule-015',
      ruleName: 'SMB Admin Share Access',
      ruleType: 'sigma',
      confidence: 85,
    },
    eventCount: 12,
    tags: ['lateral-movement', 'smb'],
  },
  {
    id: 'alert-006',
    title: 'Authentication from TOR Exit Node',
    description: 'Successful authentication for sarah.johnson@company.com originated from known TOR exit node 185.220.101.45.',
    severity: 'high',
    status: 'new',
    source: 'identity',
    sourceVendor: 'azure-ad',
    timestamp: recentDate(4),
    updatedAt: recentDate(4),
    mitre: mockMitreMappings['rare-auth-source'],
    entities: {
      users: ['user-002'],
      ips: ['ip-001'],
    },
    detection: {
      ruleId: 'rule-003',
      ruleName: 'Auth from Anonymizing Network',
      ruleType: 'custom',
      confidence: 90,
    },
    eventCount: 1,
    tags: ['tor', 'account-compromise'],
  },
  {
    id: 'alert-007',
    title: 'Suspicious AWS API Calls',
    description: 'Unusual sequence of AWS API calls: DescribeInstances, GetSecretValue, CreateAccessKey from IP outside normal range for user mike.chen.',
    severity: 'medium',
    status: 'new',
    source: 'cloud',
    sourceVendor: 'aws',
    timestamp: recentDate(6),
    updatedAt: recentDate(6),
    entities: {
      users: ['user-003'],
    },
    detection: {
      ruleId: 'rule-020',
      ruleName: 'Anomalous AWS Activity',
      ruleType: 'ml',
      confidence: 72,
    },
    eventCount: 8,
    tags: ['cloud', 'aws', 'privilege-escalation'],
  },
  {
    id: 'alert-008',
    title: 'Phishing Email with Malicious Link',
    description: 'Email from external sender contains link to known phishing domain. 3 users clicked the link.',
    severity: 'medium',
    status: 'in-progress',
    source: 'email',
    sourceVendor: 'custom',
    timestamp: recentDate(8),
    updatedAt: recentDate(5),
    entities: {
      users: ['user-004'],
      domains: ['phishing-site.com'],
    },
    detection: {
      ruleId: 'rule-025',
      ruleName: 'Phishing Email Detection',
      ruleType: 'vendor',
      confidence: 88,
    },
    eventCount: 4,
    assignee: 'email-security@company.com',
    tags: ['phishing', 'email'],
  },
];

// ============================================================================
// Mock Detection Rules
// ============================================================================

const mockDetectionRules: DetectionRule[] = [
  {
    id: 'rule-001',
    name: 'Impossible Travel Detection',
    description: 'Detects when a user authenticates from two geographically distant locations within an impossible time frame.',
    enabled: true,
    severity: 'critical',
    type: 'ml',
    mitre: mockMitreMappings['impossible-travel'],
    sources: ['identity'],
    logic: {
      threshold: { count: 2, timeWindow: '30m', groupBy: ['user.email'] },
    },
    alertsLast24h: 3,
    falsePositiveRate: 5,
    author: 'XDR Team',
    tags: ['identity', 'ueba'],
    createdAt: randomDate(180),
    updatedAt: randomDate(30),
  },
  {
    id: 'rule-005',
    name: 'Encoded PowerShell Command',
    description: 'Detects execution of PowerShell with encoded commands, commonly used by attackers.',
    enabled: true,
    severity: 'high',
    type: 'sigma',
    mitre: mockMitreMappings['suspicious-process'],
    sources: ['edr'],
    logic: {
      query: 'process.name: "powershell.exe" AND process.command_line: (*-enc* OR *-EncodedCommand*)',
    },
    alertsLast24h: 7,
    falsePositiveRate: 12,
    author: 'Detection Engineering',
    references: ['https://attack.mitre.org/techniques/T1059/001/'],
    tags: ['edr', 'powershell'],
    createdAt: randomDate(90),
    updatedAt: randomDate(14),
  },
  {
    id: 'rule-008',
    name: 'LSASS Memory Access',
    description: 'Detects processes accessing LSASS memory, indicative of credential dumping.',
    enabled: true,
    severity: 'critical',
    type: 'vendor',
    mitre: mockMitreMappings['credential-dump'],
    sources: ['edr'],
    alertsLast24h: 1,
    falsePositiveRate: 2,
    author: 'Microsoft',
    tags: ['credential-theft'],
    createdAt: randomDate(365),
    updatedAt: randomDate(7),
  },
  {
    id: 'rule-012',
    name: 'DNS Tunneling - High Entropy Queries',
    description: 'Detects DNS tunneling by analyzing query entropy and frequency patterns.',
    enabled: true,
    severity: 'high',
    type: 'ml',
    mitre: mockMitreMappings['dns-tunneling'],
    sources: ['dns', 'ndr'],
    logic: {
      threshold: { count: 100, timeWindow: '5m', groupBy: ['host.name', 'dns.query'] },
    },
    alertsLast24h: 2,
    falsePositiveRate: 8,
    author: 'XDR ML Team',
    tags: ['dns', 'exfiltration'],
    createdAt: randomDate(60),
    updatedAt: randomDate(7),
  },
  {
    id: 'rule-015',
    name: 'SMB Admin Share Access',
    description: 'Detects access to administrative SMB shares (C$, ADMIN$) from workstations.',
    enabled: true,
    severity: 'high',
    type: 'sigma',
    mitre: mockMitreMappings['lateral-movement'],
    sources: ['edr', 'ndr'],
    logic: {
      query: 'event.action: "network-connection" AND destination.port: 445 AND file.path: (*C$* OR *ADMIN$*)',
    },
    alertsLast24h: 5,
    falsePositiveRate: 15,
    author: 'Detection Engineering',
    tags: ['lateral-movement', 'smb'],
    createdAt: randomDate(120),
    updatedAt: randomDate(21),
  },
];

// ============================================================================
// Mock Playbooks
// ============================================================================

const mockPlaybooks: Playbook[] = [
  {
    id: 'playbook-001',
    name: 'Disable Compromised User',
    description: 'Immediately disable user account, revoke sessions, and notify SOC team.',
    enabled: true,
    trigger: {
      type: 'manual',
    },
    actions: [
      {
        id: 'action-001',
        type: 'disable-user',
        name: 'Disable User Account',
        description: 'Disable the user account in Azure AD and Okta',
        target: { type: 'user' },
        requiresApproval: true,
        approvers: ['soc-manager@company.com'],
        timeout: '15m',
      },
      {
        id: 'action-002',
        type: 'revoke-sessions',
        name: 'Revoke Active Sessions',
        description: 'Terminate all active sessions for the user',
        target: { type: 'user' },
        requiresApproval: false,
      },
      {
        id: 'action-003',
        type: 'notify-slack',
        name: 'Notify SOC Slack',
        description: 'Send notification to #security-alerts Slack channel',
        target: { type: 'user' },
        parameters: { channel: '#security-alerts' },
        requiresApproval: false,
      },
      {
        id: 'action-004',
        type: 'create-ticket',
        name: 'Create Incident Ticket',
        description: 'Create a ServiceNow incident for investigation',
        target: { type: 'user' },
        parameters: { priority: 'P1', category: 'Security Incident' },
        requiresApproval: false,
      },
    ],
    executionsLast24h: 2,
    successRate: 100,
    avgDuration: '45s',
    author: 'SOC Team',
    tags: ['identity', 'account-compromise'],
    createdAt: randomDate(90),
    updatedAt: randomDate(14),
  },
  {
    id: 'playbook-002',
    name: 'Isolate Infected Host',
    description: 'Network isolate the host and collect forensic data.',
    enabled: true,
    trigger: {
      type: 'automatic',
      conditions: {
        severity: ['critical'],
        sources: ['edr'],
        mitreTactics: ['execution', 'credential-access'],
      },
    },
    actions: [
      {
        id: 'action-005',
        type: 'isolate-host',
        name: 'Isolate Host',
        description: 'Network isolate the host via CrowdStrike',
        target: { type: 'host' },
        requiresApproval: true,
        approvers: ['soc-manager@company.com', 'ir-lead@company.com'],
        timeout: '30m',
      },
      {
        id: 'action-006',
        type: 'collect-forensics',
        name: 'Collect Memory Dump',
        description: 'Collect memory dump and process list from host',
        target: { type: 'host' },
        requiresApproval: false,
      },
      {
        id: 'action-007',
        type: 'notify-slack',
        name: 'Notify IR Team',
        description: 'Send alert to #incident-response channel',
        target: { type: 'host' },
        parameters: { channel: '#incident-response' },
        requiresApproval: false,
      },
    ],
    executionsLast24h: 1,
    successRate: 100,
    avgDuration: '2m 15s',
    author: 'IR Team',
    tags: ['edr', 'malware', 'containment'],
    createdAt: randomDate(60),
    updatedAt: randomDate(7),
  },
  {
    id: 'playbook-003',
    name: 'Block Malicious IP',
    description: 'Block IP address at firewall and update threat intel.',
    enabled: true,
    trigger: {
      type: 'manual',
    },
    actions: [
      {
        id: 'action-008',
        type: 'block-ip',
        name: 'Block at Firewall',
        description: 'Add IP to Palo Alto block list',
        target: { type: 'ip' },
        requiresApproval: false,
      },
      {
        id: 'action-009',
        type: 'block-ip',
        name: 'Block at Proxy',
        description: 'Add IP to Zscaler block list',
        target: { type: 'ip' },
        requiresApproval: false,
      },
      {
        id: 'action-010',
        type: 'notify-email',
        name: 'Notify Security Team',
        description: 'Send email notification to security team',
        target: { type: 'ip' },
        parameters: { to: 'security-team@company.com' },
        requiresApproval: false,
      },
    ],
    executionsLast24h: 5,
    successRate: 98,
    avgDuration: '12s',
    author: 'SOC Team',
    tags: ['network', 'ioc-blocking'],
    createdAt: randomDate(120),
    updatedAt: randomDate(3),
  },
  {
    id: 'playbook-004',
    name: 'Block Malicious Domain',
    description: 'Block domain at DNS, proxy, and email gateway.',
    enabled: true,
    trigger: {
      type: 'manual',
    },
    actions: [
      {
        id: 'action-011',
        type: 'block-domain',
        name: 'Block at DNS',
        description: 'Sinkhole domain in Umbrella',
        target: { type: 'domain' },
        requiresApproval: false,
      },
      {
        id: 'action-012',
        type: 'block-domain',
        name: 'Block at Email Gateway',
        description: 'Add domain to Proofpoint block list',
        target: { type: 'domain' },
        requiresApproval: false,
      },
    ],
    executionsLast24h: 3,
    successRate: 100,
    avgDuration: '8s',
    author: 'SOC Team',
    tags: ['dns', 'email', 'ioc-blocking'],
    createdAt: randomDate(90),
    updatedAt: randomDate(5),
  },
  {
    id: 'playbook-005',
    name: 'Reset User Password',
    description: 'Force password reset and require MFA re-enrollment.',
    enabled: true,
    trigger: {
      type: 'manual',
    },
    actions: [
      {
        id: 'action-013',
        type: 'reset-password',
        name: 'Force Password Reset',
        description: 'Force password reset on next login',
        target: { type: 'user' },
        requiresApproval: true,
        approvers: ['soc-manager@company.com'],
      },
      {
        id: 'action-014',
        type: 'revoke-sessions',
        name: 'Revoke Sessions',
        description: 'Terminate all active sessions',
        target: { type: 'user' },
        requiresApproval: false,
      },
      {
        id: 'action-015',
        type: 'notify-email',
        name: 'Notify User',
        description: 'Send password reset notification to user',
        target: { type: 'user' },
        requiresApproval: false,
      },
    ],
    executionsLast24h: 4,
    successRate: 100,
    avgDuration: '30s',
    author: 'IT Security',
    tags: ['identity', 'password-reset'],
    createdAt: randomDate(180),
    updatedAt: randomDate(10),
  },
];

// ============================================================================
// Mock Normalized Events
// ============================================================================

const generateMockEvents = (count: number = 50): NormalizedEvent[] => {
  const events: NormalizedEvent[] = [];
  
  const eventTemplates: Partial<NormalizedEvent>[] = [
    {
      category: 'authentication',
      action: 'login',
      outcome: 'success',
      source: 'identity',
      sourceVendor: 'okta',
      user: { name: 'john.smith@company.com', email: 'john.smith@company.com' },
    },
    {
      category: 'authentication',
      action: 'login-failed',
      outcome: 'failure',
      source: 'identity',
      sourceVendor: 'azure-ad',
      user: { name: 'sarah.johnson@company.com' },
    },
    {
      category: 'process',
      action: 'process-start',
      outcome: 'success',
      source: 'edr',
      sourceVendor: 'crowdstrike',
      host: { name: 'WS-JSMITH-01', ip: '10.0.50.142', os: 'Windows 11' },
      process: { name: 'powershell.exe', pid: 4872, commandLine: 'powershell.exe -NoProfile -ExecutionPolicy Bypass' },
    },
    {
      category: 'network',
      action: 'connection-start',
      outcome: 'success',
      source: 'ndr',
      sourceVendor: 'zeek',
      network: { direction: 'outbound', protocol: 'tcp', sourceIp: '10.0.50.142', destinationIp: '185.220.101.45', destinationPort: 443 },
    },
    {
      category: 'dns',
      action: 'dns-query',
      outcome: 'success',
      source: 'dns',
      sourceVendor: 'cisco',
      dns: { query: 'api.malicious-domain.com', queryType: 'A', responseCode: 'NXDOMAIN' },
    },
    {
      category: 'file',
      action: 'file-create',
      outcome: 'success',
      source: 'edr',
      sourceVendor: 'microsoft-defender',
      file: { name: 'payload.exe', path: 'C:\\Users\\jsmith\\Downloads\\payload.exe', size: 847293 },
    },
    {
      category: 'cloud',
      action: 'resource-access',
      outcome: 'success',
      source: 'cloud',
      sourceVendor: 'aws',
      cloud: { provider: 'aws', region: 'us-east-1', service: 's3', action: 'GetObject' },
    },
    {
      category: 'iam',
      action: 'permission-change',
      outcome: 'success',
      source: 'cloud',
      sourceVendor: 'aws',
      cloud: { provider: 'aws', region: 'us-east-1', service: 'iam', action: 'AttachUserPolicy' },
    },
  ];
  
  for (let i = 0; i < count; i++) {
    const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
    events.push({
      id: randomId(),
      timestamp: recentDate(24),
      ...template,
    } as NormalizedEvent);
  }
  
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// ============================================================================
// Mock Entity Risk Profiles
// ============================================================================

const mockEntityRiskProfiles: EntityRiskProfile[] = [
  {
    entityId: 'user-001',
    entityType: 'user',
    entityName: 'john.smith@company.com',
    riskScore: 85,
    riskLevel: 'high',
    trend: 'increasing',
    factors: [
      { id: 'rf-001', name: 'Impossible Travel Alert', description: 'Authentication from distant locations', category: 'alert', weight: 30, timestamp: recentDate(1) },
      { id: 'rf-002', name: 'Suspicious PowerShell', description: 'Encoded PowerShell execution', category: 'alert', weight: 25, timestamp: recentDate(3) },
      { id: 'rf-003', name: 'Lateral Movement', description: 'SMB access to database server', category: 'behavior', weight: 20, timestamp: recentDate(1.5) },
      { id: 'rf-004', name: 'Privileged Account', description: 'Member of Cloud-Admin group', category: 'vulnerability', weight: 10, timestamp: recentDate(30) },
    ],
    alertCount: 12,
    openAlertCount: 5,
    lastAssessed: new Date().toISOString(),
  },
  {
    entityId: 'host-002',
    entityType: 'host',
    entityName: 'WS-JSMITH-01',
    riskScore: 78,
    riskLevel: 'high',
    trend: 'increasing',
    factors: [
      { id: 'rf-005', name: 'DNS Tunneling', description: 'High entropy DNS queries detected', category: 'alert', weight: 25, timestamp: recentDate(2) },
      { id: 'rf-006', name: 'Suspicious Process', description: 'Encoded PowerShell execution', category: 'alert', weight: 25, timestamp: recentDate(3) },
      { id: 'rf-007', name: 'C2 Communication', description: 'Connection to known malicious IP', category: 'threat-intel', weight: 20, timestamp: recentDate(2) },
    ],
    alertCount: 8,
    openAlertCount: 4,
    lastAssessed: new Date().toISOString(),
  },
  {
    entityId: 'user-002',
    entityType: 'user',
    entityName: 'sarah.johnson@company.com',
    riskScore: 72,
    riskLevel: 'high',
    trend: 'stable',
    factors: [
      { id: 'rf-008', name: 'TOR Authentication', description: 'Login from TOR exit node', category: 'alert', weight: 35, timestamp: recentDate(4) },
      { id: 'rf-009', name: 'Executive Account', description: 'Finance Director with sensitive access', category: 'vulnerability', weight: 15, timestamp: recentDate(90) },
    ],
    alertCount: 8,
    openAlertCount: 2,
    lastAssessed: new Date().toISOString(),
  },
];

// ============================================================================
// Mock Hunts
// ============================================================================

const mockHunts: Hunt[] = [
  {
    id: 'hunt-001',
    name: 'Search for Mimikatz Usage',
    description: 'Hunt for indicators of Mimikatz credential dumping tool',
    query: 'process.name: ("mimikatz.exe" OR "mimi.exe") OR process.command_line: (*sekurlsa* OR *kerberos* OR *logonpasswords*)',
    queryLanguage: 'kql',
    sources: ['edr'],
    timeRange: { start: randomDate(7), end: new Date().toISOString() },
    resultCount: 3,
    lastRun: recentDate(2),
    author: 'threat-hunter@company.com',
    tags: ['credential-theft', 'mimikatz'],
    mitre: mockMitreMappings['credential-dump'],
    createdAt: randomDate(30),
    updatedAt: randomDate(2),
  },
  {
    id: 'hunt-002',
    name: 'Unusual Service Account Activity',
    description: 'Find service accounts with interactive logins or unusual behavior',
    query: 'user.name: *svc* AND event.action: "login" AND NOT source.ip: (10.0.* OR 192.168.*)',
    queryLanguage: 'kql',
    sources: ['identity'],
    timeRange: { start: randomDate(7), end: new Date().toISOString() },
    resultCount: 12,
    lastRun: recentDate(6),
    author: 'threat-hunter@company.com',
    tags: ['service-account', 'anomaly'],
    createdAt: randomDate(60),
    updatedAt: randomDate(6),
  },
];

// ============================================================================
// API Functions
// ============================================================================

export const xdrApi = {
  // Dashboard
  async getDashboard(): Promise<XDRDashboard> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const alerts = generateMockAlerts();
    
    // Generate alert trend for 24 hours
    const alertTrend = Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
      count: Math.floor(Math.random() * 15) + 2,
    }));
    
    // Generate risky entities with entity data
    const riskyEntities = [
      { entity: mockUsers[1] as Entity, riskScore: 87, alertCount: 5 },
      { entity: mockHosts[0] as Entity, riskScore: 72, alertCount: 3 },
      { entity: mockUsers[3] as Entity, riskScore: 65, alertCount: 4 },
      { entity: mockIPs[0] as Entity, riskScore: 58, alertCount: 2 },
      { entity: mockHosts[2] as Entity, riskScore: 45, alertCount: 2 },
    ];
    
    return {
      overview: {
        totalAlerts: 127,
        alertsByStatus: { 'new': 45, 'in-progress': 32, 'resolved': 42, 'false-positive': 5, 'suppressed': 3 },
        alertsBySeverity: { 'critical': 8, 'high': 23, 'medium': 52, 'low': 38, 'info': 6 },
        alertsBySource: { 'edr': 42, 'identity': 28, 'ndr': 18, 'cloud': 15, 'dns': 12, 'email': 8, 'firewall': 4, 'proxy': 0, 'siem': 0, 'custom': 0 },
        mttd: '4m 32s',
        mttr: '18m 45s',
      },
      alertsByStatus: {
        open: 45,
        investigating: 32,
        resolved: 42,
        closed: 8,
        'false-positive': 5,
      },
      alertsBySeverity: {
        critical: 8,
        high: 23,
        medium: 52,
        low: 38,
        info: 6,
      },
      rulesEnabled: mockDetectionRules.filter(r => r.enabled).length,
      dataSourcesConnected: mockDataSources.filter(d => d.status === 'connected').length,
      eventsPerSecond: mockDataSources.reduce((sum, d) => sum + d.eventsPerSecond, 0),
      meanTimeToRespond: '18m 45s',
      entities: {
        totalUsers: 2847,
        totalHosts: 1234,
        highRiskUsers: 12,
        highRiskHosts: 8,
      },
      dataSources: mockDataSources,
      topAlerts: alerts.slice(0, 5),
      recentAlerts: alerts,
      topRiskyEntities: mockEntityRiskProfiles,
      riskyEntities,
      alertTrend,
      topMitreTechniques: [
        { techniqueId: 'T1566', technique: 'Phishing', count: 23 },
        { techniqueId: 'T1059', technique: 'Command and Scripting Interpreter', count: 18 },
        { techniqueId: 'T1003', technique: 'OS Credential Dumping', count: 12 },
        { techniqueId: 'T1071', technique: 'Application Layer Protocol', count: 9 },
        { techniqueId: 'T1021', technique: 'Remote Services', count: 7 },
      ],
      recentPlaybookExecutions: [],
      trends: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
        alerts: Math.floor(Math.random() * 20) + 5,
        criticalAlerts: Math.floor(Math.random() * 3),
        blockedThreats: Math.floor(Math.random() * 15) + 2,
      })),
    };
  },
  
  // Alerts
  async getAlerts(filters?: {
    severity?: AlertSeverity[];
    status?: AlertStatus[];
    source?: DataSourceType[];
    timeRange?: { start: string; end: string };
    search?: string;
  }): Promise<Alert[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let alerts = generateMockAlerts();
    
    if (filters?.severity?.length) {
      alerts = alerts.filter(a => filters.severity!.includes(a.severity));
    }
    if (filters?.status?.length) {
      alerts = alerts.filter(a => filters.status!.includes(a.status));
    }
    if (filters?.source?.length) {
      alerts = alerts.filter(a => filters.source!.includes(a.source));
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      alerts = alerts.filter(a => 
        a.title.toLowerCase().includes(search) || 
        a.description.toLowerCase().includes(search)
      );
    }
    
    return alerts;
  },
  
  async getAlert(id: string): Promise<Alert | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const alerts = generateMockAlerts();
    return alerts.find(a => a.id === id) || null;
  },
  
  async updateAlertStatus(id: string, status: AlertStatus): Promise<Alert> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const alert = (await this.getAlerts()).find(a => a.id === id);
    if (!alert) throw new Error('Alert not found');
    return { ...alert, status, updatedAt: new Date().toISOString() };
  },
  
  // Entities
  async getEntities(type?: EntityType): Promise<Entity[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const entities: Entity[] = [...mockUsers, ...mockHosts, ...mockIPs];
    if (type) {
      return entities.filter(e => e.type === type);
    }
    return entities;
  },
  
  async getEntity(id: string): Promise<Entity | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const entities: Entity[] = [...mockUsers, ...mockHosts, ...mockIPs];
    return entities.find(e => e.id === id) || null;
  },
  
  async getEntityTimeline(_entityId: string): Promise<NormalizedEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return generateMockEvents(30);
  },
  
  async getEntityRiskProfile(entityId: string): Promise<EntityRiskProfile | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockEntityRiskProfiles.find(p => p.entityId === entityId) || null;
  },
  
  // Data Sources
  async getDataSources(): Promise<DataSource[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDataSources;
  },
  
  async getDataSource(id: string): Promise<DataSource | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockDataSources.find(ds => ds.id === id) || null;
  },
  
  // Detection Rules
  async getDetectionRules(): Promise<DetectionRule[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDetectionRules;
  },
  
  async getDetectionRule(id: string): Promise<DetectionRule | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockDetectionRules.find(r => r.id === id) || null;
  },
  
  async toggleRule(id: string, enabled: boolean): Promise<DetectionRule> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const rule = mockDetectionRules.find(r => r.id === id);
    if (!rule) throw new Error('Rule not found');
    return { ...rule, enabled, updatedAt: new Date().toISOString() };
  },
  
  // Playbooks
  async getPlaybooks(): Promise<Playbook[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPlaybooks;
  },
  
  async getPlaybook(id: string): Promise<Playbook | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPlaybooks.find(p => p.id === id) || null;
  },
  
  async executePlaybook(playbookId: string, targetId: string): Promise<PlaybookExecution> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const playbook = mockPlaybooks.find(p => p.id === playbookId);
    if (!playbook) throw new Error('Playbook not found');
    
    const requiresApproval = playbook.actions.some(a => a.requiresApproval);
    
    return {
      id: randomId(),
      playbookId,
      playbookName: playbook.name,
      entityId: targetId,
      status: requiresApproval ? 'awaiting-approval' : 'running',
      startedAt: new Date().toISOString(),
      triggeredBy: 'security-analyst@company.com',
      actions: playbook.actions.map(a => ({
        actionId: a.id,
        actionType: a.type,
        status: a.requiresApproval ? 'pending' : 'pending',
      })),
    };
  },
  
  // Threat Hunting
  async getHunts(): Promise<Hunt[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockHunts;
  },
  
  async executeHunt(_query: string, _timeRange: { start: string; end: string }): Promise<NormalizedEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return generateMockEvents(Math.floor(Math.random() * 50) + 10);
  },
  
  // Events
  async getEvents(filters?: {
    category?: string[];
    source?: DataSourceType[];
    timeRange?: { start: string; end: string };
    search?: string;
    limit?: number;
  }): Promise<NormalizedEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let events = generateMockEvents(filters?.limit || 100);
    
    if (filters?.category?.length) {
      events = events.filter(e => filters.category!.includes(e.category));
    }
    if (filters?.source?.length) {
      events = events.filter(e => filters.source!.includes(e.source));
    }
    
    return events;
  },
  
  // Risk Scoring
  async getRiskyEntities(limit?: number): Promise<EntityRiskProfile[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockEntityRiskProfiles
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, limit || 10);
  },
};

export default xdrApi;
