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

export interface Alert {
  id: string;
  alert_type: 'high_risk_transaction' | 'suspicious_pattern' | 'velocity_breach' | 'unusual_location';
  threshold: number;
  notification_channels: ('email' | 'webhook' | 'sms' | 'slack')[];
  active: boolean;
  created_at: string;
  triggered_count: number;
}

export interface AnalyticsData {
  total_transactions: number;
  flagged_transactions: number;
  average_fraud_score: number;
  high_risk_percentage: number;
  transactions_by_day: { date: string; count: number; flagged: number }[];
  risk_distribution: { level: string; count: number }[];
  top_fraud_indicators: { indicator: string; count: number }[];
}

export interface Tab {
  id: string;
  type: 'chat' | 'web' | 'code' | 'chart' | 'transaction' | 'report';
  title: string;
  content: any;
  status: 'loading' | 'active' | 'complete' | 'error';
  aiGenerated: boolean;
}

// Transaction type for FraudGuard compatibility
export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  user_email: string;
  merchant_name: string;
  merchant_category: string;
  card_last_four: string;
  timestamp: string;
  ip_address: string;
  location_city: string;
  fraud_score?: number;
  status?: 'pending' | 'approved' | 'declined' | 'flagged';
}

// Fraud Score type
export interface FraudScore {
  score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  recommendation: string;
}
