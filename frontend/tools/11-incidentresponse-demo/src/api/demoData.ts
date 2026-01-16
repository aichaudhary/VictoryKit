/**
 * Demo Data for Incident Response Platform
 * Realistic sample incidents for demonstration purposes
 */

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';
export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'eradicated' | 'recovered' | 'closed';
export type IncidentCategory = 'malware' | 'phishing' | 'data-breach' | 'ddos' | 'unauthorized-access' | 'insider-threat' | 'ransomware' | 'other';

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category: IncidentCategory;
  source: string;
  affectedAssets: string[];
  assignee: string;
  createdAt: string;
  updatedAt: string;
  indicators: Indicator[];
  timeline: TimelineEntry[];
  aiInsights?: AIInsight;
}

export interface Indicator {
  type: 'ip' | 'domain' | 'hash' | 'email' | 'url';
  value: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface TimelineEntry {
  timestamp: string;
  action: string;
  performedBy: string;
  details?: string;
}

export interface AIInsight {
  riskScore: number;
  threatType: string;
  recommendation: string;
  relatedIncidents: number;
  predictedImpact: string;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  steps: PlaybookStep[];
  automatedActions: string[];
  estimatedTime: string;
}

export interface PlaybookStep {
  order: number;
  title: string;
  description: string;
  automated: boolean;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

// Demo Incidents Data
export const demoIncidents: Incident[] = [
  {
    id: 'INC-2026-0142',
    title: 'Ransomware Attack Detected on Production Servers',
    description: 'Multiple production servers showing signs of ransomware encryption activity. File extensions being changed to .locked and ransom note detected.',
    severity: 'critical',
    status: 'investigating',
    category: 'ransomware',
    source: 'EDR Alert',
    affectedAssets: ['PROD-WEB-01', 'PROD-WEB-02', 'PROD-DB-01', 'FILE-SERVER-03'],
    assignee: 'Sarah Chen',
    createdAt: '2026-01-16T02:15:00Z',
    updatedAt: '2026-01-16T03:45:00Z',
    indicators: [
      { type: 'hash', value: 'a3f5d8c2b1e9f4a7c6d8e2b1a5f9c3d7', confidence: 'high' },
      { type: 'ip', value: '185.220.101.45', confidence: 'high' },
      { type: 'domain', value: 'malware-c2.darkweb.onion', confidence: 'medium' },
    ],
    timeline: [
      { timestamp: '2026-01-16T02:15:00Z', action: 'Incident Created', performedBy: 'System', details: 'Auto-generated from EDR alert' },
      { timestamp: '2026-01-16T02:18:00Z', action: 'AI Analysis Triggered', performedBy: 'System', details: 'Running threat correlation' },
      { timestamp: '2026-01-16T02:20:00Z', action: 'Assigned to Analyst', performedBy: 'Auto-Assignment', details: 'Assigned based on expertise and availability' },
      { timestamp: '2026-01-16T02:35:00Z', action: 'Network Isolation Initiated', performedBy: 'Sarah Chen', details: 'Isolating affected servers from network' },
    ],
    aiInsights: {
      riskScore: 94,
      threatType: 'LockBit 3.0 Variant',
      recommendation: 'Immediately isolate affected systems, preserve forensic evidence, and activate ransomware playbook RB-001.',
      relatedIncidents: 3,
      predictedImpact: 'High - Potential data loss and business disruption'
    }
  },
  {
    id: 'INC-2026-0141',
    title: 'Suspicious Login Activity from Multiple Geolocations',
    description: 'Executive account showing simultaneous login attempts from USA, Russia, and China within 5-minute window. Potential credential compromise.',
    severity: 'high',
    status: 'contained',
    category: 'unauthorized-access',
    source: 'SIEM Correlation',
    affectedAssets: ['exec-john.doe@company.com', 'VPN-Gateway', 'Azure AD'],
    assignee: 'Mike Rodriguez',
    createdAt: '2026-01-16T01:30:00Z',
    updatedAt: '2026-01-16T02:45:00Z',
    indicators: [
      { type: 'ip', value: '203.0.113.42', confidence: 'high' },
      { type: 'ip', value: '198.51.100.77', confidence: 'high' },
      { type: 'email', value: 'exec-john.doe@company.com', confidence: 'high' },
    ],
    timeline: [
      { timestamp: '2026-01-16T01:30:00Z', action: 'Incident Created', performedBy: 'System', details: 'Impossible travel alert triggered' },
      { timestamp: '2026-01-16T01:32:00Z', action: 'Account Locked', performedBy: 'Automated Response', details: 'Preventive account lockout' },
      { timestamp: '2026-01-16T01:45:00Z', action: 'User Contacted', performedBy: 'Mike Rodriguez', details: 'Verified user location - confirmed compromise' },
      { timestamp: '2026-01-16T02:00:00Z', action: 'Password Reset', performedBy: 'Mike Rodriguez', details: 'Forced password reset and MFA re-enrollment' },
    ],
    aiInsights: {
      riskScore: 78,
      threatType: 'Credential Stuffing / Account Takeover',
      recommendation: 'Review all recent activities, reset credentials, and enable additional MFA factors.',
      relatedIncidents: 7,
      predictedImpact: 'Medium - Potential data access and lateral movement'
    }
  },
  {
    id: 'INC-2026-0140',
    title: 'Phishing Campaign Targeting Finance Department',
    description: 'Multiple employees in Finance received sophisticated spear-phishing emails impersonating CEO requesting wire transfer.',
    severity: 'high',
    status: 'investigating',
    category: 'phishing',
    source: 'User Report',
    affectedAssets: ['finance-team@company.com', 'EMAIL-SERVER-01'],
    assignee: 'Lisa Park',
    createdAt: '2026-01-15T23:45:00Z',
    updatedAt: '2026-01-16T01:30:00Z',
    indicators: [
      { type: 'email', value: 'ceo.company@gmail-secure.com', confidence: 'high' },
      { type: 'domain', value: 'gmail-secure.com', confidence: 'high' },
      { type: 'url', value: 'https://secure-payment.fake-bank.com/transfer', confidence: 'high' },
    ],
    timeline: [
      { timestamp: '2026-01-15T23:45:00Z', action: 'Incident Created', performedBy: 'User Report', details: 'Finance manager reported suspicious email' },
      { timestamp: '2026-01-15T23:50:00Z', action: 'Email Quarantined', performedBy: 'Lisa Park', details: 'Similar emails blocked and quarantined' },
      { timestamp: '2026-01-16T00:15:00Z', action: 'IOCs Extracted', performedBy: 'Lisa Park', details: 'Malicious URLs and domains identified' },
    ],
    aiInsights: {
      riskScore: 72,
      threatType: 'Business Email Compromise (BEC)',
      recommendation: 'Block sender domain, alert all employees, and review any recent wire transfers.',
      relatedIncidents: 12,
      predictedImpact: 'High - Financial loss risk'
    }
  },
  {
    id: 'INC-2026-0139',
    title: 'DDoS Attack on Customer Portal',
    description: 'Volumetric DDoS attack causing service degradation on customer-facing portal. Traffic spike from 10K to 2M requests/second.',
    severity: 'medium',
    status: 'contained',
    category: 'ddos',
    source: 'WAF Alert',
    affectedAssets: ['customer-portal.company.com', 'LB-PROD-01', 'CDN'],
    assignee: 'David Kim',
    createdAt: '2026-01-15T20:00:00Z',
    updatedAt: '2026-01-15T22:30:00Z',
    indicators: [
      { type: 'ip', value: '192.0.2.0/24', confidence: 'medium' },
      { type: 'ip', value: '198.51.100.0/24', confidence: 'medium' },
    ],
    timeline: [
      { timestamp: '2026-01-15T20:00:00Z', action: 'Incident Created', performedBy: 'System', details: 'Traffic anomaly detected' },
      { timestamp: '2026-01-15T20:05:00Z', action: 'Rate Limiting Enabled', performedBy: 'Automated', details: 'Emergency rate limiting activated' },
      { timestamp: '2026-01-15T20:30:00Z', action: 'CDN Scrubbing Activated', performedBy: 'David Kim', details: 'Cloudflare Under Attack mode enabled' },
      { timestamp: '2026-01-15T21:45:00Z', action: 'Attack Mitigated', performedBy: 'System', details: 'Traffic returning to normal levels' },
    ],
    aiInsights: {
      riskScore: 58,
      threatType: 'UDP Flood / Amplification Attack',
      recommendation: 'Review source IPs, update WAF rules, and consider additional DDoS protection.',
      relatedIncidents: 2,
      predictedImpact: 'Medium - Service availability affected'
    }
  },
  {
    id: 'INC-2026-0138',
    title: 'Potential Data Exfiltration via DNS Tunneling',
    description: 'Unusual DNS query patterns detected suggesting possible data exfiltration through DNS tunneling technique.',
    severity: 'high',
    status: 'open',
    category: 'data-breach',
    source: 'DNS Firewall',
    affectedAssets: ['WORKSTATION-2847', 'DNS-SERVER-01'],
    assignee: 'Unassigned',
    createdAt: '2026-01-16T03:30:00Z',
    updatedAt: '2026-01-16T03:30:00Z',
    indicators: [
      { type: 'domain', value: 'aGVsbG8td29ybGQ.exfil-tunnel.net', confidence: 'high' },
      { type: 'ip', value: '192.168.1.247', confidence: 'high' },
    ],
    timeline: [
      { timestamp: '2026-01-16T03:30:00Z', action: 'Incident Created', performedBy: 'System', details: 'DNS anomaly detection triggered' },
    ],
    aiInsights: {
      riskScore: 82,
      threatType: 'DNS Tunneling / Data Exfiltration',
      recommendation: 'Isolate workstation immediately, analyze DNS logs, and identify data scope.',
      relatedIncidents: 1,
      predictedImpact: 'High - Sensitive data may be compromised'
    }
  },
  {
    id: 'INC-2026-0137',
    title: 'Malware Detected in Software Supply Chain',
    description: 'Compromised npm package detected in build pipeline. Package "lodash-utils-helper" contains backdoor code.',
    severity: 'critical',
    status: 'eradicated',
    category: 'malware',
    source: 'Supply Chain Scanner',
    affectedAssets: ['CI-CD-PIPELINE', 'BUILD-SERVER-01', 'DEV-WORKSTATIONS'],
    assignee: 'Alex Thompson',
    createdAt: '2026-01-15T14:00:00Z',
    updatedAt: '2026-01-16T02:00:00Z',
    indicators: [
      { type: 'hash', value: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', confidence: 'high' },
      { type: 'domain', value: 'npm-mirror-cdn.malicious.com', confidence: 'high' },
    ],
    timeline: [
      { timestamp: '2026-01-15T14:00:00Z', action: 'Incident Created', performedBy: 'System', details: 'Supply chain scanner alert' },
      { timestamp: '2026-01-15T14:15:00Z', action: 'Build Pipeline Stopped', performedBy: 'Alex Thompson', details: 'Emergency stop of all builds' },
      { timestamp: '2026-01-15T16:00:00Z', action: 'Malicious Package Identified', performedBy: 'Alex Thompson', details: 'lodash-utils-helper identified as malicious' },
      { timestamp: '2026-01-15T20:00:00Z', action: 'Clean Builds Verified', performedBy: 'Alex Thompson', details: 'All builds rebuilt from trusted sources' },
      { timestamp: '2026-01-16T02:00:00Z', action: 'Incident Eradicated', performedBy: 'Alex Thompson', details: 'Malicious code removed, systems clean' },
    ],
    aiInsights: {
      riskScore: 88,
      threatType: 'Supply Chain Attack / Typosquatting',
      recommendation: 'Audit all dependencies, implement package signing, and review access controls.',
      relatedIncidents: 0,
      predictedImpact: 'Critical - Production code potentially compromised'
    }
  }
];

// Demo Playbooks
export const demoPlaybooks: Playbook[] = [
  {
    id: 'PB-001',
    name: 'Ransomware Response',
    description: 'Comprehensive playbook for ransomware incident response including isolation, forensics, and recovery.',
    category: 'ransomware',
    severity: 'critical',
    steps: [
      { order: 1, title: 'Isolate Affected Systems', description: 'Immediately disconnect affected systems from network', automated: true, status: 'completed' },
      { order: 2, title: 'Preserve Evidence', description: 'Create forensic images of affected systems', automated: false, status: 'running' },
      { order: 3, title: 'Identify Ransomware Variant', description: 'Analyze samples to identify ransomware family', automated: true, status: 'pending' },
      { order: 4, title: 'Check for Decryption Keys', description: 'Search No More Ransom and vendor resources', automated: true, status: 'pending' },
      { order: 5, title: 'Restore from Backups', description: 'Begin restoration process from clean backups', automated: false, status: 'pending' },
    ],
    automatedActions: ['Network Isolation', 'IOC Extraction', 'Threat Intel Lookup', 'Backup Status Check'],
    estimatedTime: '4-8 hours'
  },
  {
    id: 'PB-002',
    name: 'Phishing Response',
    description: 'Standard response procedure for phishing incidents including containment and user notification.',
    category: 'phishing',
    severity: 'high',
    steps: [
      { order: 1, title: 'Quarantine Email', description: 'Remove malicious email from all mailboxes', automated: true, status: 'completed' },
      { order: 2, title: 'Block Sender', description: 'Add sender domain to blocklist', automated: true, status: 'completed' },
      { order: 3, title: 'Extract IOCs', description: 'Identify malicious URLs, domains, and attachments', automated: true, status: 'completed' },
      { order: 4, title: 'User Notification', description: 'Send alert to potentially affected users', automated: true, status: 'pending' },
      { order: 5, title: 'Credential Reset', description: 'Force password reset for users who clicked', automated: false, status: 'pending' },
    ],
    automatedActions: ['Email Quarantine', 'Domain Block', 'IOC Extraction', 'User Alert'],
    estimatedTime: '1-2 hours'
  },
  {
    id: 'PB-003',
    name: 'Account Compromise Response',
    description: 'Response playbook for compromised user accounts including lockout and investigation.',
    category: 'unauthorized-access',
    severity: 'high',
    steps: [
      { order: 1, title: 'Lock Account', description: 'Immediately disable compromised account', automated: true, status: 'completed' },
      { order: 2, title: 'Revoke Sessions', description: 'Terminate all active sessions', automated: true, status: 'completed' },
      { order: 3, title: 'Audit Activity', description: 'Review all account activity for last 30 days', automated: true, status: 'running' },
      { order: 4, title: 'Contact User', description: 'Verify compromise with account owner', automated: false, status: 'pending' },
      { order: 5, title: 'Reset Credentials', description: 'Force password reset and MFA re-enrollment', automated: false, status: 'pending' },
    ],
    automatedActions: ['Account Lock', 'Session Revocation', 'Activity Audit', 'Alert Generation'],
    estimatedTime: '2-4 hours'
  },
  {
    id: 'PB-004',
    name: 'DDoS Mitigation',
    description: 'Automated response for DDoS attacks including traffic scrubbing and origin protection.',
    category: 'ddos',
    severity: 'medium',
    steps: [
      { order: 1, title: 'Enable Rate Limiting', description: 'Activate emergency rate limits', automated: true, status: 'completed' },
      { order: 2, title: 'Activate Scrubbing', description: 'Route traffic through DDoS scrubbing center', automated: true, status: 'completed' },
      { order: 3, title: 'Block Attack Sources', description: 'Identify and block malicious IP ranges', automated: true, status: 'running' },
      { order: 4, title: 'Monitor Recovery', description: 'Track traffic patterns for normalization', automated: true, status: 'pending' },
      { order: 5, title: 'Post-Attack Analysis', description: 'Generate attack report and recommendations', automated: true, status: 'pending' },
    ],
    automatedActions: ['Rate Limiting', 'Traffic Scrubbing', 'IP Blocking', 'Traffic Analysis'],
    estimatedTime: '1-3 hours'
  }
];

// Dashboard Stats
export const dashboardStats = {
  totalIncidents: 142,
  openIncidents: 23,
  criticalIncidents: 4,
  resolvedToday: 12,
  mttr: '2.4 hours',
  avgResolutionTime: '3.2 hours',
  aiAssisted: 89,
  playbooksExecuted: 67,
  indicators: 1247,
  threatsBlocked: 3892,
};

// Team Members
export const teamMembers = [
  { name: 'Sarah Chen', role: 'Senior Analyst', avatar: '👩‍💻', activeIncidents: 3, status: 'online' },
  { name: 'Mike Rodriguez', role: 'SOC Lead', avatar: '👨‍💼', activeIncidents: 2, status: 'online' },
  { name: 'Lisa Park', role: 'Threat Hunter', avatar: '👩‍🔬', activeIncidents: 4, status: 'online' },
  { name: 'David Kim', role: 'Incident Responder', avatar: '👨‍🔧', activeIncidents: 2, status: 'busy' },
  { name: 'Alex Thompson', role: 'Security Engineer', avatar: '👨‍💻', activeIncidents: 1, status: 'offline' },
];

// Severity distribution for charts
export const severityDistribution = [
  { severity: 'Critical', count: 4, color: '#ef4444' },
  { severity: 'High', count: 12, color: '#f97316' },
  { severity: 'Medium', count: 8, color: '#eab308' },
  { severity: 'Low', count: 15, color: '#3b82f6' },
  { severity: 'Info', count: 7, color: '#6b7280' },
];

// Recent activity feed
export const recentActivity = [
  { type: 'incident_created', message: 'New critical incident: Ransomware Attack Detected', time: '2 min ago', icon: '🚨' },
  { type: 'playbook_executed', message: 'Playbook "Phishing Response" completed successfully', time: '15 min ago', icon: '✅' },
  { type: 'ai_analysis', message: 'AI identified 3 related incidents for correlation', time: '28 min ago', icon: '🤖' },
  { type: 'status_change', message: 'INC-2026-0141 status changed to Contained', time: '45 min ago', icon: '📋' },
  { type: 'team_update', message: 'Lisa Park joined incident INC-2026-0140', time: '1 hour ago', icon: '👥' },
  { type: 'alert', message: 'Threat intel update: New ransomware variant detected', time: '2 hours ago', icon: '⚠️' },
];
