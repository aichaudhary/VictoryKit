/**
 * XDR Platform - Core Types & Interfaces
 * Real-world Extended Detection & Response Platform
 */

// ============================================================================
// MITRE ATT&CK Framework
// ============================================================================

export type MitreTactic =
  | 'reconnaissance'
  | 'resource-development'
  | 'initial-access'
  | 'execution'
  | 'persistence'
  | 'privilege-escalation'
  | 'defense-evasion'
  | 'credential-access'
  | 'discovery'
  | 'lateral-movement'
  | 'collection'
  | 'command-and-control'
  | 'exfiltration'
  | 'impact';

export interface MitreMapping {
  tactic: MitreTactic;
  tacticId: string; // e.g., "TA0001"
  technique: string; // e.g., "Phishing"
  techniqueId: string; // e.g., "T1566"
  subTechnique?: string;
  subTechniqueId?: string;
}

// ============================================================================
// Data Sources & Connectors
// ============================================================================

export type DataSourceType =
  | 'edr' // Endpoint Detection & Response
  | 'ndr' // Network Detection & Response
  | 'identity' // Okta, AAD, etc.
  | 'email' // M365, Gmail security
  | 'cloud' // AWS, GCP, Azure
  | 'firewall' // Palo Alto, Fortinet
  | 'proxy' // Zscaler, BlueCoat
  | 'dns' // DNS resolver logs
  | 'siem' // External SIEM feeds
  | 'custom';

export type DataSourceVendor =
  | 'crowdstrike'
  | 'microsoft-defender'
  | 'sentinelone'
  | 'carbon-black'
  | 'okta'
  | 'azure-ad'
  | 'google-workspace'
  | 'aws'
  | 'gcp'
  | 'azure'
  | 'palo-alto'
  | 'fortinet'
  | 'zscaler'
  | 'cisco'
  | 'zeek'
  | 'suricata'
  | 'custom';

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  vendor: DataSourceVendor;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSeen: string;
  eventsLast24h: number;
  eventsPerSecond: number;
  healthScore: number; // 0-100
  config?: {
    apiEndpoint?: string;
    region?: string;
    tenantId?: string;
  };
  capabilities: string[];
}

// ============================================================================
// Entities (User, Host, IP, Application)
// ============================================================================

export type EntityType = 'user' | 'host' | 'ip' | 'domain' | 'file' | 'process' | 'application';

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  displayName: string;
  riskScore: number; // 0-100
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'info';
  firstSeen: string;
  lastSeen: string;
  alertCount: number;
  eventCount: number;
  tags: string[];
  metadata: Record<string, any>;
}

export interface UserEntity extends Entity {
  type: 'user';
  email: string;
  department?: string;
  manager?: string;
  title?: string;
  location?: string;
  lastLogin?: string;
  mfaEnabled?: boolean;
  privileged?: boolean;
  accountStatus: 'active' | 'disabled' | 'locked' | 'suspended';
  groups?: string[];
}

export interface HostEntity extends Entity {
  type: 'host';
  hostname: string;
  os: string;
  osVersion?: string;
  ipAddresses: string[];
  macAddresses?: string[];
  domain?: string;
  lastBootTime?: string;
  agentVersion?: string;
  agentStatus: 'online' | 'offline' | 'degraded';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  assetType: 'workstation' | 'server' | 'domain-controller' | 'database' | 'web-server' | 'other';
}

export interface IPEntity extends Entity {
  type: 'ip';
  address: string;
  isInternal: boolean;
  isPrivate: boolean;
  geoLocation?: {
    country: string;
    city?: string;
    lat?: number;
    lon?: number;
  };
  asn?: string;
  organization?: string;
  reputation?: 'malicious' | 'suspicious' | 'clean' | 'unknown';
  threatIntel?: ThreatIntelHit[];
}

// ============================================================================
// Alerts & Detections
// ============================================================================

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AlertStatus = 'new' | 'in-progress' | 'resolved' | 'false-positive' | 'suppressed';

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source: DataSourceType;
  sourceVendor?: DataSourceVendor;
  timestamp: string;
  updatedAt: string;
  
  // MITRE ATT&CK mapping
  mitre?: MitreMapping[];
  
  // Entities involved
  entities: {
    users?: string[];
    hosts?: string[];
    ips?: string[];
    domains?: string[];
    files?: string[];
    processes?: string[];
  };
  
  // Detection details
  detection: {
    ruleId?: string;
    ruleName?: string;
    ruleType: 'sigma' | 'vendor' | 'custom' | 'ml' | 'ueba';
    confidence: number; // 0-100
    falsePositiveRate?: number;
  };
  
  // Raw event data
  rawEvents?: NormalizedEvent[];
  eventCount: number;
  
  // Investigation
  assignee?: string;
  notes?: string[];
  tags?: string[];
  
  // Response
  playbooksRun?: string[];
  actionsRecommended?: string[];
}

// ============================================================================
// Normalized Events (ECS/OCSF inspired)
// ============================================================================

export type EventCategory = 
  | 'authentication'
  | 'process'
  | 'network'
  | 'file'
  | 'registry'
  | 'dns'
  | 'email'
  | 'cloud'
  | 'iam'
  | 'web';

export type EventAction = 
  | 'login' | 'logout' | 'login-failed'
  | 'process-start' | 'process-end' | 'process-inject'
  | 'connection-start' | 'connection-end' | 'dns-query'
  | 'file-create' | 'file-modify' | 'file-delete' | 'file-read'
  | 'registry-create' | 'registry-modify' | 'registry-delete'
  | 'email-received' | 'email-sent' | 'email-blocked'
  | 'user-create' | 'user-modify' | 'user-delete' | 'group-add' | 'group-remove'
  | 'resource-access' | 'permission-change' | 'policy-change';

export interface NormalizedEvent {
  id: string;
  timestamp: string;
  source: DataSourceType;
  sourceVendor?: DataSourceVendor;
  category: EventCategory;
  action: EventAction;
  outcome: 'success' | 'failure' | 'unknown';
  
  // Common fields
  message?: string;
  severity?: AlertSeverity;
  
  // Source entity
  user?: {
    id?: string;
    name: string;
    email?: string;
    domain?: string;
  };
  
  host?: {
    id?: string;
    name: string;
    ip?: string;
    os?: string;
  };
  
  // Process fields
  process?: {
    pid?: number;
    name: string;
    executable?: string;
    commandLine?: string;
    hash?: {
      md5?: string;
      sha1?: string;
      sha256?: string;
    };
    parent?: {
      pid?: number;
      name: string;
      executable?: string;
    };
  };
  
  // Network fields
  network?: {
    direction: 'inbound' | 'outbound' | 'internal';
    protocol?: string;
    sourceIp?: string;
    sourcePort?: number;
    destinationIp?: string;
    destinationPort?: number;
    bytesIn?: number;
    bytesOut?: number;
  };
  
  // DNS fields
  dns?: {
    query: string;
    queryType: string;
    responseCode?: string;
    answers?: string[];
  };
  
  // File fields
  file?: {
    name: string;
    path?: string;
    size?: number;
    hash?: {
      md5?: string;
      sha256?: string;
    };
  };
  
  // Cloud fields
  cloud?: {
    provider: 'aws' | 'gcp' | 'azure';
    region?: string;
    service?: string;
    resourceId?: string;
    action?: string;
  };
  
  // Geo location
  geo?: {
    country?: string;
    city?: string;
  };
  
  // Threat intel enrichment
  threatIntel?: ThreatIntelHit[];
  
  // Raw data
  raw?: Record<string, any>;
}

// ============================================================================
// Threat Intelligence
// ============================================================================

export interface ThreatIntelHit {
  indicator: string;
  indicatorType: 'ip' | 'domain' | 'hash' | 'url' | 'email';
  source: string; // e.g., "MISP", "VirusTotal", "AlienVault"
  confidence: number;
  severity: AlertSeverity;
  tags: string[];
  firstSeen?: string;
  lastSeen?: string;
  description?: string;
}

// ============================================================================
// Detection Rules
// ============================================================================

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: AlertSeverity;
  
  type: 'sigma' | 'vendor' | 'custom' | 'ml' | 'correlation';
  
  // MITRE mapping
  mitre?: MitreMapping[];
  
  // Data sources this rule applies to
  sources: DataSourceType[];
  
  // Rule logic
  logic?: {
    query?: string; // Sigma/KQL/ES DSL
    conditions?: any[];
    threshold?: {
      count: number;
      timeWindow: string; // e.g., "5m", "1h"
      groupBy?: string[];
    };
  };
  
  // Stats
  alertsLast24h?: number;
  falsePositiveRate?: number;
  
  // Metadata
  author?: string;
  references?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Response Playbooks
// ============================================================================

export type PlaybookActionType =
  | 'isolate-host'
  | 'unisolate-host'
  | 'disable-user'
  | 'enable-user'
  | 'reset-password'
  | 'revoke-sessions'
  | 'block-ip'
  | 'unblock-ip'
  | 'block-domain'
  | 'block-hash'
  | 'quarantine-email'
  | 'delete-email'
  | 'create-ticket'
  | 'notify-slack'
  | 'notify-teams'
  | 'notify-email'
  | 'run-script'
  | 'collect-forensics';

export interface PlaybookAction {
  id: string;
  type: PlaybookActionType;
  name: string;
  description: string;
  target: {
    type: EntityType | 'ioc';
    value?: string;
  };
  parameters?: Record<string, any>;
  requiresApproval: boolean;
  approvers?: string[];
  timeout?: string;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  
  // Trigger conditions
  trigger: {
    type: 'manual' | 'automatic' | 'scheduled';
    conditions?: {
      severity?: AlertSeverity[];
      sources?: DataSourceType[];
      mitreTactics?: MitreTactic[];
      ruleIds?: string[];
    };
  };
  
  // Actions to execute
  actions: PlaybookAction[];
  
  // Execution stats
  executionsLast24h?: number;
  successRate?: number;
  avgDuration?: string;
  
  // Metadata
  author?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaybookExecution {
  id: string;
  playbookId: string;
  playbookName: string;
  alertId?: string;
  entityId?: string;
  
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'awaiting-approval';
  startedAt: string;
  completedAt?: string;
  duration?: string;
  
  triggeredBy: string;
  approvedBy?: string;
  
  actions: {
    actionId: string;
    actionType: PlaybookActionType;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    result?: any;
    error?: string;
    startedAt?: string;
    completedAt?: string;
  }[];
}

// ============================================================================
// Threat Hunting
// ============================================================================

export interface Hunt {
  id: string;
  name: string;
  description?: string;
  query: string;
  queryLanguage: 'kql' | 'eql' | 'sql' | 'lucene';
  
  // Scope
  sources?: DataSourceType[];
  timeRange: {
    start: string;
    end: string;
  };
  
  // Results
  resultCount?: number;
  lastRun?: string;
  
  // Schedule
  schedule?: {
    enabled: boolean;
    cron?: string;
    notifyOnResults: boolean;
  };
  
  // Metadata
  author: string;
  tags?: string[];
  mitre?: MitreMapping[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Risk Scoring
// ============================================================================

export interface RiskFactor {
  id: string;
  name: string;
  description: string;
  category: 'alert' | 'anomaly' | 'threat-intel' | 'vulnerability' | 'behavior';
  weight: number; // 0-100
  source?: string;
  timestamp: string;
}

export interface ContributingFactor {
  factor: string;
  impact: number;
  description: string;
}

export interface EntityRiskProfile {
  entityId: string;
  entityType: EntityType;
  entityName: string;
  entity?: Entity;
  
  riskScore: number; // 0-100
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'info';
  trend: 'increasing' | 'stable' | 'decreasing' | Array<{ timestamp: string; score: number }>;
  
  factors: RiskFactor[];
  contributingFactors?: ContributingFactor[];
  
  alertCount: number;
  alertCounts?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  openAlertCount: number;
  
  lastAssessed: string;
  history?: {
    timestamp: string;
    score: number;
  }[];
  recommendations?: string[];
}

// ============================================================================
// Dashboard & Metrics
// ============================================================================

export interface XDRDashboard {
  overview: {
    totalAlerts: number;
    alertsByStatus: Record<AlertStatus, number>;
    alertsBySeverity: Record<AlertSeverity, number>;
    alertsBySource: Record<DataSourceType, number>;
    mttd: string; // Mean Time to Detect
    mttr: string; // Mean Time to Respond
  };
  
  // Flat access for convenience
  alertsByStatus: {
    open: number;
    investigating: number;
    resolved: number;
    closed: number;
    'false-positive': number;
  };
  alertsBySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  
  rulesEnabled: number;
  dataSourcesConnected: number;
  eventsPerSecond: number;
  meanTimeToRespond: string;
  
  entities: {
    totalUsers: number;
    totalHosts: number;
    highRiskUsers: number;
    highRiskHosts: number;
  };
  
  dataSources: DataSource[];
  
  topAlerts: Alert[];
  recentAlerts: Alert[];
  topRiskyEntities: EntityRiskProfile[];
  riskyEntities: Array<{ entity: Entity; riskScore: number; alertCount: number }>;
  
  alertTrend: Array<{ timestamp: string; count: number }>;
  topMitreTechniques: Array<{ techniqueId: string; technique: string; count: number }>;
  
  recentPlaybookExecutions: PlaybookExecution[];
  
  trends: {
    timestamp: string;
    alerts: number;
    criticalAlerts: number;
    blockedThreats: number;
  }[];
}
