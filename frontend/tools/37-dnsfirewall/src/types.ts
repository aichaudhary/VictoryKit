// DNSFirewall Types

export interface DNSQuery {
  id: string;
  domain: string;
  queryType: string;
  sourceIP: string;
  timestamp: Date;
  responseTime: number;
  status: 'allowed' | 'blocked' | 'monitored';
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  reputation?: number;
}

export interface DNSThreat {
  id: string;
  domain: string;
  threatType: 'malware' | 'phishing' | 'botnet' | 'spam' | 'tunneling' | 'amplification';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  firstSeen: Date;
  lastSeen: Date;
  sources: string[];
  indicators: string[];
}

export interface DNSRule {
  id: string;
  name: string;
  description: string;
  type: 'domain' | 'category' | 'pattern' | 'reputation';
  action: 'allow' | 'block' | 'monitor' | 'redirect';
  conditions: DNSRuleCondition[];
  enabled: boolean;
  priority: number;
  hits: number;
  lastHit?: Date;
}

export interface DNSRuleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex' | 'range' | 'in';
  value: any;
}

export interface DNSAnalytics {
  totalQueries: number;
  blockedQueries: number;
  maliciousQueries: number;
  topDomains: Array<{ domain: string; count: number }>;
  topThreats: Array<{ type: string; count: number }>;
  queryTypes: Record<string, number>;
  timeSeries: Array<{ timestamp: Date; queries: number; threats: number }>;
}

export interface DNSAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'threat' | 'anomaly' | 'policy' | 'system';
  domain?: string;
  sourceIP?: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
}

export interface DNSSettings {
  monitoring: {
    enabled: boolean;
    realTimeUpdates: boolean;
    retentionDays: number;
  };
  security: {
    autoBlock: boolean;
    threatThreshold: number;
    whitelistEnabled: boolean;
  };
  alerting: {
    emailNotifications: boolean;
    webhookUrl?: string;
    alertThreshold: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface DNSStats {
  queriesPerSecond: number;
  totalQueries: number;
  blockedPercentage: number;
  activeThreats: number;
  uptime: number;
  responseTime: number;
}

export interface DomainReputation {
  domain: string;
  score: number; // 0-100, higher is worse
  category: string;
  lastChecked: Date;
  sources: Array<{
    name: string;
    score: number;
    category: string;
  }>;
}
  maxTokens: number;
  provider: string;
  model: string;
  activeTool: NeuralTool;
  workspaceMode: WorkspaceMode;
  portalUrl: string;
  canvas: CanvasState;
}

export interface NavItem {
  label: string;
  icon: string;
  tool: NeuralTool;
  description: string;
}

// FraudGuard Specific Types
export interface Transaction {
  id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  user_ip?: string;
  device_fingerprint?: string;
  email?: string;
  card_last4?: string;
  merchant_id?: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'declined' | 'flagged';
  fraud_score?: number;
  risk_level?: 'low' | 'medium' | 'high';
}

export interface FraudScore {
  transaction_id: string;
  score: number;
  risk_level: 'low' | 'medium' | 'high';
  confidence: number;
  indicators: FraudIndicator[];
  recommendation: string;
  ml_model_version: string;
  analyzed_at: string;
}

export interface FraudIndicator {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  weight: number;
}

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
