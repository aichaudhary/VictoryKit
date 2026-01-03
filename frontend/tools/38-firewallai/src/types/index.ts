// FirewallAI TypeScript Interfaces and Types

export interface FirewallRule {
  id: string;
  name: string;
  description?: string;
  vendor: string;
  source_ip?: string;
  destination_ip?: string;
  source_port?: number;
  destination_port?: number;
  protocol: 'tcp' | 'udp' | 'icmp' | 'any';
  action: 'allow' | 'deny' | 'reject';
  enabled: boolean;
  priority: number;
  created_at: Date;
  updated_at: Date;
  ml_score?: number;
  threat_level?: 'low' | 'medium' | 'high' | 'critical';
  compliance_tags?: string[];
  audit_trail?: AuditEntry[];
}

export interface TrafficLog {
  id: string;
  timestamp: Date;
  source_ip: string;
  destination_ip: string;
  source_port: number;
  destination_port: number;
  protocol: string;
  action: 'allow' | 'deny' | 'reject';
  bytes_sent: number;
  bytes_received: number;
  vendor: string;
  rule_id?: string;
  ml_analysis?: MLTrafficAnalysis;
  geo_location?: GeoLocation;
  threat_indicators?: ThreatIndicator[];
  compliance_violations?: ComplianceViolation[];
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'acknowledged';
  type: 'intrusion' | 'anomaly' | 'policy_violation' | 'compliance' | 'performance';
  source: string;
  timestamp: Date;
  resolved_at?: Date;
  assigned_to?: string;
  tags: string[];
  automation?: AlertAutomation;
  incident_response?: IncidentResponse;
  ml_insights?: MLAlertInsights;
  related_logs?: string[];
  escalation_rules?: EscalationRule[];
}

export interface Vendor {
  id: string;
  name: string;
  type: 'pfsense' | 'palo_alto' | 'fortinet' | 'checkpoint' | 'cisco_asa' | 'aws_firewall' | 'azure_firewall' | 'gcp_armor' | 'cloudflare' | 'akamai';
  host: string;
  port?: number;
  username?: string;
  password?: string;
  api_key?: string;
  region?: string;
  enabled: boolean;
  config: VendorConfig;
  last_connected?: Date;
  connection_status?: 'connected' | 'disconnected' | 'error';
  capabilities?: VendorCapabilities;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  type: 'access_control' | 'threat_response' | 'compliance' | 'traffic_shaping' | 'intrusion_prevention';
  rules: string[];
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  priority: number;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
  compliance_frameworks?: string[];
  automation_rules?: AutomationRule[];
}

export interface RealTimeData {
  traffic: {
    inbound: number;
    outbound: number;
    blocked: number;
    timestamp: Date;
  };
  alerts: {
    active: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  performance: {
    cpu_usage: number;
    memory_usage: number;
    latency: number;
    throughput: number;
  };
  threats: {
    detected: number;
    blocked: number;
    categories: {[key: string]: number};
  };
}

export interface DashboardStats {
  total_rules: number;
  active_rules: number;
  total_alerts: number;
  active_alerts: number;
  traffic_volume: number;
  blocked_traffic: number;
  system_health: number;
  threat_score: number;
  compliance_score: number;
  uptime_percentage: number;
}

export interface MLTrafficAnalysis {
  anomaly_score: number;
  threat_probability: number;
  behavior_pattern: string;
  risk_factors: string[];
  recommended_action: string;
  confidence_level: number;
}

export interface MLAlertInsights {
  correlation_id: string;
  attack_pattern: string;
  attacker_profile: string;
  impact_assessment: string;
  recommended_response: string;
  false_positive_probability: number;
}

export interface ThreatIndicator {
  type: 'ip' | 'domain' | 'url' | 'hash' | 'signature';
  value: string;
  confidence: number;
  source: string;
  last_seen: Date;
  tags: string[];
}

export interface ComplianceViolation {
  framework: string;
  rule: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  remediation: string;
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  resource: string;
  details: any;
  ip_address: string;
  user_agent: string;
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  isp: string;
  asn: string;
}

export interface PolicyCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'contains' | 'regex';
  value: any;
  logical_operator?: 'and' | 'or';
}

export interface PolicyAction {
  type: 'allow' | 'deny' | 'reject' | 'log' | 'alert' | 'quarantine' | 'redirect';
  parameters?: any;
  priority?: number;
}

export interface AlertAutomation {
  enabled: boolean;
  playbook_id?: string;
  auto_resolve?: boolean;
  auto_escalate?: boolean;
  notification_channels?: string[];
  response_actions?: string[];
}

export interface IncidentResponse {
  incident_id?: string;
  status: 'investigating' | 'contained' | 'resolved' | 'closed';
  assigned_team?: string;
  timeline: IncidentTimelineEntry[];
  evidence: string[];
  lessons_learned?: string;
}

export interface IncidentTimelineEntry {
  timestamp: Date;
  action: string;
  user: string;
  details: string;
}

export interface EscalationRule {
  condition: string;
  action: 'notify' | 'assign' | 'escalate';
  target: string;
  delay_minutes?: number;
}

export interface VendorConfig {
  timeout?: number;
  ssl_verify?: boolean;
  retry_count?: number;
  api_version?: string;
  custom_headers?: {[key: string]: string};
  rate_limiting?: {
    requests_per_minute: number;
    burst_limit: number;
  };
}

export interface VendorCapabilities {
  rule_management: boolean;
  traffic_monitoring: boolean;
  threat_detection: boolean;
  log_export: boolean;
  api_rate_limits: number;
  supported_protocols: string[];
  advanced_features: string[];
}

export interface AutomationRule {
  trigger: string;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  cooldown_period?: number;
  enabled: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: any;
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  type: 'log' | 'rule' | 'alert' | 'config';
  id: string;
  name: string;
  data: any;
}

export interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'critical';
  components: {
    database: ComponentHealth;
    api: ComponentHealth;
    monitoring: ComponentHealth;
    ml_engine: ComponentHealth;
    integrations: ComponentHealth;
  };
  uptime: number;
  last_backup: Date;
  alerts_count: number;
}

export interface ComponentHealth {
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  response_time?: number;
  error_rate?: number;
  last_check: Date;
  message?: string;
}

export interface ComplianceReport {
  framework: string;
  overall_score: number;
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
  violations: ComplianceViolation[];
  generated_at: Date;
  next_audit: Date;
}

export interface BackupInfo {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'config_only';
  created_at: Date;
  size_bytes: number;
  status: 'completed' | 'failed' | 'in_progress';
  location: string;
  checksum?: string;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_prev: boolean;
}

// Filter Types
export interface RuleFilters {
  vendor?: string;
  enabled?: boolean;
  action?: string;
  protocol?: string;
  threat_level?: string;
  date_from?: Date;
  date_to?: Date;
}

export interface AlertFilters {
  severity?: string;
  status?: string;
  type?: string;
  assigned_to?: string;
  date_from?: Date;
  date_to?: Date;
}

export interface TrafficFilters {
  source_ip?: string;
  destination_ip?: string;
  protocol?: string;
  action?: string;
  vendor?: string;
  date_from?: Date;
  date_to?: Date;
}

// WebSocket Message Types
export interface WSMessage {
  type: 'traffic_update' | 'alert_new' | 'alert_update' | 'rule_change' | 'system_health' | 'threat_detected';
  data: any;
  timestamp: Date;
}

// Configuration Types
export interface AppConfig {
  api_url: string;
  ws_url: string;
  theme: 'light' | 'dark';
  timezone: string;
  date_format: string;
  refresh_interval: number;
  max_logs_display: number;
  alert_sound_enabled: boolean;
  auto_refresh_enabled: boolean;
  ml_enabled: boolean;
  compliance_frameworks: string[];
}

// Error Types
export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Export all types
export type {
  FirewallRule,
  TrafficLog,
  Alert,
  Vendor,
  Policy,
  RealTimeData,
  DashboardStats,
  MLTrafficAnalysis,
  MLAlertInsights,
  ThreatIndicator,
  ComplianceViolation,
  AuditEntry,
  GeoLocation,
  PolicyCondition,
  PolicyAction,
  AlertAutomation,
  IncidentResponse,
  IncidentTimelineEntry,
  EscalationRule,
  VendorConfig,
  VendorCapabilities,
  AutomationRule,
  ChatMessage,
  ChatAttachment,
  SystemHealth,
  ComponentHealth,
  ComplianceReport,
  BackupInfo,
  APIResponse,
  PaginatedResponse,
  RuleFilters,
  AlertFilters,
  TrafficFilters,
  WSMessage,
  AppConfig,
  APIError,
  ValidationError,
};