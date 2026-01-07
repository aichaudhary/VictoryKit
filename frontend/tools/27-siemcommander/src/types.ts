/**
 * SIEMCommander - Type Definitions
 * AI-Powered Security Information & Event Management
 */

// ============ Navigation Types ============
export type Tab = 
  | 'dashboard' 
  | 'events' 
  | 'incidents' 
  | 'alerts' 
  | 'threatHunting'
  | 'playbooks'
  | 'reports'
  | 'dataSources'
  | 'rules'
  | 'assistant'
  | 'settings';

export interface NavItem {
  id: Tab;
  label: string;
  icon: string;
  badge?: number;
}

// ============ Security Event Types ============
export type EventSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type EventStatus = 'new' | 'investigating' | 'resolved' | 'false_positive' | 'escalated';
export type EventSource = 'firewall' | 'ids' | 'ips' | 'endpoint' | 'cloud' | 'application' | 'network' | 'database' | 'email' | 'proxy';

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  source: EventSource;
  sourceName: string;
  sourceIP: string;
  destinationIP?: string;
  severity: EventSeverity;
  category: string;
  subcategory?: string;
  title: string;
  description: string;
  rawLog: string;
  normalizedFields: Record<string, unknown>;
  mitreTactic?: string;
  mitreTechnique?: string;
  indicators: string[];
  correlationId?: string;
  incidentId?: string;
  status: EventStatus;
  assignedTo?: string;
  tags: string[];
}

export interface EventFilter {
  severity?: EventSeverity[];
  source?: EventSource[];
  status?: EventStatus[];
  timeRange: TimeRange;
  searchQuery?: string;
  mitreTactic?: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
  label: string;
}

// ============ Incident Types ============
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'new' | 'triaging' | 'investigating' | 'containing' | 'eradicating' | 'recovering' | 'closed';
export type IncidentCategory = 'malware' | 'phishing' | 'ddos' | 'data_breach' | 'insider_threat' | 'apt' | 'ransomware' | 'unauthorized_access' | 'policy_violation';

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category: IncidentCategory;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  assignedTo: string;
  assignedTeam?: string;
  eventIds: string[];
  eventCount: number;
  affectedAssets: string[];
  affectedUsers: string[];
  playbookId?: string;
  playbookStatus?: PlaybookStatus;
  timeline: IncidentTimelineEntry[];
  notes: IncidentNote[];
  iocs: IOC[];
  ttd?: number;
  ttr?: number;
  ttc?: number;
  tags: string[];
}

export interface IncidentTimelineEntry {
  id: string;
  timestamp: Date;
  type: 'event' | 'action' | 'note' | 'status_change' | 'assignment';
  description: string;
  user?: string;
  automated?: boolean;
}

export interface IncidentNote {
  id: string;
  timestamp: Date;
  author: string;
  content: string;
  isPrivate: boolean;
}

export interface IOC {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email' | 'file_path' | 'registry_key';
  value: string;
  confidence: number;
  source: string;
  firstSeen: Date;
  lastSeen: Date;
  tags: string[];
}

// ============ Alert Types ============
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'suppressed';

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  eventIds: string[];
  eventCount: number;
  sourceIP?: string;
  destinationIP?: string;
  affectedAssets: string[];
  mitreTactics: string[];
  mitreTechniques: string[];
  assignedTo?: string;
  falsePositiveCount: number;
  truePositiveCount: number;
  tags: string[];
}

// ============ Detection Rule Types ============
export type RuleStatus = 'enabled' | 'disabled' | 'testing';
export type RuleType = 'threshold' | 'correlation' | 'anomaly' | 'ml' | 'sigma' | 'custom';

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  status: RuleStatus;
  severity: EventSeverity;
  mitreTactics: string[];
  mitreTechniques: string[];
  dataSources: string[];
  query: string;
  queryLanguage: 'spl' | 'kql' | 'sigma' | 'custom';
  threshold?: number;
  timeWindow?: string;
  suppressionPeriod?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastTriggered?: Date;
  triggerCount: number;
  falsePositiveRate: number;
  tags: string[];
}

// ============ Playbook Types ============
export type PlaybookStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
export type PlaybookTrigger = 'manual' | 'alert' | 'incident' | 'schedule' | 'webhook';

export interface Playbook {
  id: string;
  name: string;
  description: string;
  category: IncidentCategory;
  trigger: PlaybookTrigger;
  triggerConditions?: Record<string, unknown>;
  steps: PlaybookStep[];
  status: PlaybookStatus;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  executionCount: number;
  avgExecutionTime: number;
  successRate: number;
  tags: string[];
}

export interface PlaybookStep {
  id: string;
  order: number;
  name: string;
  description: string;
  action: string;
  actionType: 'enrichment' | 'containment' | 'notification' | 'remediation' | 'query' | 'decision' | 'manual';
  parameters: Record<string, unknown>;
  timeout?: number;
  retryCount?: number;
  onSuccess?: string;
  onFailure?: string;
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: unknown;
  executedAt?: Date;
  duration?: number;
}

export interface PlaybookExecution {
  id: string;
  playbookId: string;
  playbookName: string;
  incidentId?: string;
  alertId?: string;
  status: PlaybookStatus;
  startedAt: Date;
  completedAt?: Date;
  triggeredBy: string;
  triggerType: PlaybookTrigger;
  steps: PlaybookStep[];
  currentStep?: number;
  output?: Record<string, unknown>;
}

// ============ Data Source Types ============
export type DataSourceStatus = 'connected' | 'disconnected' | 'error' | 'pending';
export type DataSourceType = 'syslog' | 'api' | 'agent' | 'file' | 'cloud' | 'database';

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  category: EventSource;
  status: DataSourceStatus;
  host?: string;
  port?: number;
  protocol?: string;
  eventsPerSecond: number;
  totalEvents: number;
  lastEventAt?: Date;
  health: number;
  config: Record<string, unknown>;
  parser?: string;
  createdAt: Date;
  tags: string[];
}

// ============ Dashboard Types ============
export interface DashboardStats {
  totalEvents: number;
  eventsLast24h: number;
  eventsTrend: number;
  openIncidents: number;
  criticalIncidents: number;
  incidentsTrend: number;
  openAlerts: number;
  criticalAlerts: number;
  alertsTrend: number;
  mttr: number;
  mttrTrend: number;
  activeSources: number;
  totalSources: number;
  eventsPerSecond: number;
  topThreats: ThreatSummary[];
  severityDistribution: SeverityCount[];
  eventsBySource: SourceCount[];
  recentActivity: ActivityItem[];
}

export interface ThreatSummary {
  category: string;
  count: number;
  severity: EventSeverity;
  trend: 'up' | 'down' | 'stable';
}

export interface SeverityCount {
  severity: EventSeverity;
  count: number;
  percentage: number;
}

export interface SourceCount {
  source: EventSource;
  name: string;
  count: number;
  eventsPerSecond: number;
}

export interface ActivityItem {
  id: string;
  timestamp: Date;
  type: 'event' | 'incident' | 'alert' | 'playbook';
  title: string;
  severity?: EventSeverity;
  status?: string;
}

// ============ Report Types ============
export type ReportType = 'executive' | 'compliance' | 'threat' | 'incident' | 'activity' | 'custom';
export type ReportFormat = 'pdf' | 'html' | 'csv' | 'json';

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  format: ReportFormat;
  lastGenerated?: Date;
  generatedBy?: string;
  fileUrl?: string;
  recipients: string[];
  isScheduled: boolean;
  schedule?: string;
  createdAt: Date;
  tags: string[];
}

// ============ Threat Hunt Types ============
export interface ThreatHunt {
  id: string;
  name: string;
  hypothesis: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'archived';
  mitreTactics: string[];
  mitreTechniques: string[];
  queries: HuntQuery[];
  findings: HuntFinding[];
  assignedTo: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  tags: string[];
}

export interface HuntQuery {
  id: string;
  name: string;
  query: string;
  queryLanguage: string;
  dataSources: string[];
  resultCount?: number;
  executedAt?: Date;
}

export interface HuntFinding {
  id: string;
  title: string;
  description: string;
  severity: EventSeverity;
  evidence: string[];
  iocs: IOC[];
  recommendations: string[];
  createdAt: Date;
}

// ============ Settings Types ============
export interface Settings {
  general: {
    timezone: string;
    dateFormat: string;
    refreshInterval: number;
    darkMode: boolean;
  };
  notifications: {
    email: boolean;
    slack: boolean;
    criticalAlerts: boolean;
    incidentUpdates: boolean;
  };
  retention: {
    events: number;
    incidents: number;
    logs: number;
  };
  integrations: {
    ticketing: { enabled: boolean; provider: string };
    threatIntel: { enabled: boolean; feeds: string[] };
    soar: { enabled: boolean; autoResponse: boolean };
  };
  ai: {
    enabled: boolean;
    model: string;
    autoAnalysis: boolean;
  };
}

// ============ Chat Types ============
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

// ============ Time Series Types ============
export interface EventTrendData {
  time: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}
