// DLP Types - Data Loss Prevention Tool #41

export type Sender = 'YOU' | 'AGENT' | 'SYSTEM';

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: string;
  isImage?: boolean;
  groundingUrls?: string[];
  functionCall?: FunctionCallResult;
}

export interface FunctionCallResult {
  name: string;
  args: Record<string, any>;
  result?: any;
}

export interface ChatSession {
  id: string;
  name: string;
  active: boolean;
  messages: Message[];
  settings: SettingsState;
}

export type DLPTool = 
  | 'none' 
  | 'content_scan'
  | 'file_scan'
  | 'cloud_scan'
  | 'policy_manager'
  | 'incident_response'
  | 'endpoint_monitor'
  | 'reports'
  | 'integrations';

export type WorkspaceMode = 'CHAT' | 'PORTAL' | 'CANVAS' | 'DLP_DASHBOARD';

export interface CanvasState {
  content: string;
  type: 'text' | 'code' | 'html' | 'video' | 'image' | 'chart';
  language?: string;
  title: string;
}

export interface SettingsState {
  customPrompt: string;
  agentName: string;
  temperature: number;
  maxTokens: number;
  provider: string;
  model: string;
  activeTool: DLPTool;
  workspaceMode: WorkspaceMode;
  portalUrl: string;
  canvas: CanvasState;
  autoRemediation: boolean;
  scanOnUpload: boolean;
}

export interface NavItem {
  label: string;
  icon: string;
  tool: DLPTool;
  description: string;
}

// DLP Specific Types
export interface ScanResult {
  id: string;
  scanId: string;
  source: 'content' | 'file' | 'email' | 'cloud' | 'endpoint';
  fileName?: string;
  riskScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  findings: Finding[];
  timestamp: string;
  scannedBy?: string;
  status: 'clean' | 'violation' | 'quarantined';
}

export interface Finding {
  type: string;
  category: string;
  count: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  locations: string[];
  redactedSample?: string;
}

export type PolicyAction = 'block' | 'alert' | 'quarantine' | 'encrypt' | 'log';
export type PolicyScopeType = 'all' | 'email' | 'cloud' | 'endpoint' | 'web';

export interface DLPPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  dataTypes: string[];
  actions: PolicyAction[];
  scope: PolicyScopeType[];
  patterns: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

export interface DLPIncident {
  id: string;
  policyId?: string;
  policyName?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  type: string;
  source: string;
  destination: string;
  user?: string;
  dataTypes: string[];
  matchCount: number;
  action: string;
  description: string;
  filePath?: string;
  resolution?: string;
  timestamp: string;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

export interface CloudIntegration {
  id: string;
  name: string;
  type: 'microsoft365' | 'google' | 'slack' | 'aws' | 'azure' | 'dropbox' | 'box';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  itemsScanned?: number;
  violationsFound?: number;
  icon: string;
}

export interface EndpointAgent {
  id: string;
  hostname: string;
  os: string;
  osVersion: string;
  agentVersion: string;
  status: 'online' | 'offline' | 'warning';
  lastSeen: string;
  user?: string;
  ip?: string;
  policyGroups: string[];
  features: {
    usbMonitoring: boolean;
    clipboardMonitoring: boolean;
    printMonitoring: boolean;
    screenCapture: boolean;
    fileTransfer: boolean;
  };
  stats?: {
    blockedActions: number;
    alertsGenerated: number;
    filesScanned: number;
  };
}

export interface DashboardStats {
  totalScans: number;
  totalViolations: number;
  activeIncidents: number;
  policiesEnabled: number;
  riskScore: number;
  dataTypesProtected: number;
  endpointsMonitored: number;
  cloudAppsConnected: number;
}

export interface DataClassification {
  id: string;
  name: string;
  description: string;
  level: 'public' | 'internal' | 'confidential' | 'restricted';
  dataTypes: string[];
  retentionDays: number;
  encryptionRequired: boolean;
}

export type DLPTab = 'dashboard' | 'scan' | 'policies' | 'incidents' | 'integrations' | 'endpoints' | 'reports';

// Data Type Categories
export const DATA_CATEGORIES = {
  PII: ['ssn', 'driver_license', 'passport', 'national_id', 'date_of_birth'],
  FINANCIAL: ['credit_card', 'bank_account', 'routing_number', 'tax_id', 'swift_code'],
  HEALTHCARE: ['medical_record', 'insurance_id', 'diagnosis', 'prescription', 'hipaa'],
  CREDENTIALS: ['password', 'api_key', 'access_token', 'private_key', 'secret'],
  CORPORATE: ['confidential', 'trade_secret', 'internal_only', 'restricted'],
} as const;

// DLP Alert Configuration
export interface DLPAlert {
  id: string;
  alertType: 'policy_violation' | 'data_exfiltration' | 'unauthorized_access' | 'compliance_breach';
  threshold: number;
  notificationChannels: ('email' | 'webhook' | 'sms' | 'slack' | 'teams')[];
  active: boolean;
  createdAt: string;
  triggeredCount: number;
  policyId?: string;
}

// DLP Analytics Data
export interface DLPAnalytics {
  totalScans: number;
  violationCount: number;
  averageRiskScore: number;
  highRiskPercentage: number;
  scansByDay: { date: string; count: number; violations: number }[];
  riskDistribution: { level: string; count: number }[];
  topDataTypes: { dataType: string; count: number }[];
  topSources: { source: string; count: number }[];
}

// Tab interface for multi-tab workspace
export interface WorkspaceTab {
  id: string;
  type: 'chat' | 'scan' | 'policy' | 'incident' | 'report' | 'integration';
  title: string;
  content: any;
  status: 'loading' | 'active' | 'complete' | 'error';
  aiGenerated: boolean;
}

// Sensitive Data Match for real-time scanning
export interface SensitiveDataMatch {
  id: string;
  pattern: string;
  dataType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  matchedText: string;
  redactedText: string;
  lineNumber?: number;
  columnStart?: number;
  columnEnd?: number;
  context?: string;
}

// Real-time monitoring event
export interface MonitoringEvent {
  id: string;
  eventType: 'file_access' | 'data_transfer' | 'copy_paste' | 'print' | 'usb_transfer' | 'cloud_upload';
  source: string;
  destination?: string;
  user: string;
  endpoint: string;
  dataTypes: string[];
  action: 'allowed' | 'blocked' | 'alerted';
  timestamp: string;
  riskScore: number;
}

// Compliance Framework
export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  version: string;
  requirements: ComplianceRequirement[];
  status: 'compliant' | 'non_compliant' | 'partial';
  lastAudit?: string;
  nextAudit?: string;
}

export interface ComplianceRequirement {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'met' | 'not_met' | 'partial' | 'not_applicable';
  evidence?: string[];
  dueDate?: string;
}

// Remediation Action
export interface RemediationAction {
  id: string;
  incidentId: string;
  actionType: 'quarantine' | 'encrypt' | 'delete' | 'notify' | 'block_user' | 'revoke_access';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  automatedBy?: string;
  manualBy?: string;
  timestamp: string;
  details: Record<string, any>;
}

// Data Flow Map
export interface DataFlow {
  id: string;
  source: DataEndpoint;
  destination: DataEndpoint;
  dataTypes: string[];
  volume: number;
  frequency: 'realtime' | 'daily' | 'weekly' | 'monthly';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  encrypted: boolean;
  compliant: boolean;
}

export interface DataEndpoint {
  type: 'internal' | 'external' | 'cloud' | 'endpoint' | 'partner';
  name: string;
  location?: string;
  classification?: string;
}

// AI Analysis Result
export interface AIAnalysisResult {
  id: string;
  scanId: string;
  analysisType: 'pattern_detection' | 'anomaly_detection' | 'risk_assessment' | 'classification';
  confidence: number;
  findings: AIFinding[];
  recommendations: string[];
  timestamp: string;
  modelVersion: string;
}

export interface AIFinding {
  category: string;
  description: string;
  confidence: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  context: string;
  suggestedAction: string;
}
