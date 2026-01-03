// SSLMonitor TypeScript Interfaces

export interface Certificate {
  _id?: string;
  certificateId: string;
  domain: string;
  hostname: string;
  port: number;
  subject: {
    commonName: string;
    organization?: string;
    organizationalUnit?: string;
    country?: string;
    state?: string;
    locality?: string;
  };
  issuer: {
    commonName: string;
    organization?: string;
    country?: string;
  };
  validity: {
    notBefore: Date;
    notAfter: Date;
    daysRemaining: number;
    isExpired: boolean;
    isExpiringSoon: boolean;
  };
  serialNumber: string;
  fingerprints: {
    sha256: string;
    sha1: string;
    md5: string;
  };
  publicKey: {
    algorithm: string;
    size: number;
  };
  signatureAlgorithm: string;
  version: string;
  extensions: {
    keyUsage?: string[];
    extendedKeyUsage?: string[];
    subjectAltNames?: string[];
    authorityInfoAccess?: string[];
    crlDistributionPoints?: string[];
    certificatePolicies?: string[];
  };
  chain: Certificate[];
  grade?: string;
  score?: number;
  issues: string[];
  lastScanned: Date;
  nextScan?: Date;
  status: 'valid' | 'expired' | 'expiring_soon' | 'invalid' | 'unknown';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Domain {
  _id?: string;
  domainId: string;
  name: string;
  type: 'apex' | 'subdomain' | 'wildcard';
  certificates: Certificate[];
  lastScanned: Date;
  nextScan: Date;
  scanFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  status: 'active' | 'inactive' | 'suspended';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  _id?: string;
  alertId: string;
  type: 'certificate_expiring' | 'certificate_expired' | 'certificate_invalid' | 'domain_unreachable' | 'ssl_vulnerability' | 'grade_changed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  certificateId?: string;
  domainId?: string;
  certificate?: Certificate;
  domain?: Domain;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScanResult {
  _id?: string;
  scanId: string;
  domain: string;
  certificate?: Certificate;
  grade: string;
  score: number;
  issues: string[];
  vulnerabilities: Vulnerability[];
  recommendations: string[];
  scanDuration: number;
  scannedAt: Date;
  nextScanAt: Date;
}

export interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cve?: string;
  cvss?: number;
  affectedVersions?: string[];
  remediation: string;
  references: string[];
}

export interface AnalyticsData {
  totalCertificates: number;
  validCertificates: number;
  expiredCertificates: number;
  expiringSoonCertificates: number;
  averageGrade: string;
  gradeDistribution: { [grade: string]: number };
  expirationTrend: { date: string; count: number }[];
  vulnerabilityStats: { severity: string; count: number }[];
  topIssuers: { issuer: string; count: number }[];
  scanFrequency: { period: string; scans: number }[];
}

export interface ComplianceReport {
  reportId: string;
  standard: 'PCI_DSS' | 'HIPAA' | 'GDPR' | 'SOX' | 'NIST';
  period: {
    start: Date;
    end: Date;
  };
  overallCompliance: boolean;
  sections: ComplianceSection[];
  generatedAt: Date;
  generatedBy: string;
}

export interface ComplianceSection {
  name: string;
  compliant: boolean;
  requirements: ComplianceRequirement[];
  score: number;
}

export interface ComplianceRequirement {
  requirement: string;
  compliant: boolean;
  evidence: string[];
  notes?: string;
}

export interface SystemStatus {
  uptime: number;
  totalScans: number;
  activeScans: number;
  queuedScans: number;
  failedScans: number;
  lastScanTime: Date;
  nextScheduledScan: Date;
  apiStatus: { [service: string]: 'online' | 'offline' | 'degraded' };
  databaseStatus: 'connected' | 'disconnected' | 'error';
  websocketConnections: number;
}

export interface ScanConfig {
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  domains: string[];
  includeSubdomains: boolean;
  excludePatterns: string[];
  alertThresholds: {
    expiringDays: number;
    minimumGrade: string;
  };
  notificationChannels: ('email' | 'slack' | 'webhook' | 'pagerduty')[];
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'scan_started' | 'scan_completed' | 'scan_failed' | 'alert_created' | 'certificate_updated' | 'system_status';
  data: any;
  timestamp: Date;
}

// Form types
export interface CertificateFormData {
  domain: string;
  hostname?: string;
  port: number;
  tags: string[];
  scanFrequency: string;
}

export interface DomainFormData {
  name: string;
  type: 'apex' | 'subdomain' | 'wildcard';
  tags: string[];
  scanFrequency: string;
}

export interface AlertSettingsFormData {
  emailEnabled: boolean;
  emailRecipients: string[];
  slackEnabled: boolean;
  slackWebhookUrl: string;
  pagerDutyEnabled: boolean;
  pagerDutyKey: string;
  webhookEnabled: boolean;
  webhookUrl: string;
  alertThresholds: {
    expiringDays: number;
    minimumGrade: string;
  };
}