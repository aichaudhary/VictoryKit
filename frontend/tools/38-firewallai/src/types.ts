// FirewallAI Types - AI-Powered Firewall Management

export type Sender = 'YOU' | 'AGENT' | 'SYSTEM';

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: string;
  isImage?: boolean;
  groundingUrls?: string[][];
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

export type NeuralTool =
  | 'none'
  | 'firewall_rules'
  | 'traffic_analysis'
  | 'threat_detection'
  | 'policy_engine'
  | 'alerts'
  | 'reports'
  | 'network_monitor'
  | 'intrusion_detection';

export type WorkspaceMode = 'CHAT' | 'PORTAL' | 'CANVAS' | 'FIREWALL_DASHBOARD';

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

// FirewallAI Specific Types
export interface FirewallRule {
  id: string;
  name: string;
  description: string;
  action: 'allow' | 'deny' | 'reject' | 'drop';
  protocol: 'tcp' | 'udp' | 'icmp' | 'all';
  source_ip?: string;
  source_port?: number;
  destination_ip?: string;
  destination_port?: number;
  direction: 'inbound' | 'outbound' | 'both';
  priority: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  hit_count: number;
  last_hit?: string;
}

export interface TrafficLog {
  id: string;
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  source_port: number;
  destination_port: number;
  protocol: string;
  action: 'allowed' | 'denied' | 'rejected' | 'dropped';
  rule_id?: string;
  rule_name?: string;
  bytes_sent: number;
  bytes_received: number;
  packets_sent: number;
  packets_received: number;
  interface: string;
  threat_level?: 'low' | 'medium' | 'high' | 'critical';
  threat_type?: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'intrusion' | 'anomaly' | 'policy_violation' | 'dos_attack' | 'malware' | 'unauthorized_access';
  source_ip?: string;
  destination_ip?: string;
  rule_id?: string;
  timestamp: string;
  status: 'new' | 'acknowledged' | 'resolved' | 'false_positive';
  ai_analysis?: string;
  recommended_action?: string;
}

export interface ThreatAnalysis {
  id: string;
  timestamp: string;
  threat_type: string;
  confidence_score: number;
  indicators: ThreatIndicator[];
  affected_rules: string[];
  recommended_actions: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  ai_insights: string;
}

export interface ThreatIndicator {
  type: string;
  value: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  first_seen: string;
  last_seen: string;
  hit_count: number;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  rules: FirewallRule[];
  enabled: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
  compliance_framework?: string;
  tags: string[];
}

export interface RealTimeData {
  timestamp: string;
  total_connections: number;
  active_connections: number;
  blocked_connections: number;
  throughput_mbps: number;
  cpu_usage: number;
  memory_usage: number;
  alerts_per_minute: number;
  top_blocked_ips: { ip: string; count: number }[];
  top_protocols: { protocol: string; count: number }[];
  threat_trends: { timestamp: string; count: number }[];
}

export interface Vendor {
  id: string;
  name: string;
  type: 'firewall' | 'ids' | 'ips' | 'utm' | 'waf';
  ip_address: string;
  status: 'online' | 'offline' | 'maintenance';
  last_seen: string;
  version: string;
  managed_rules: number;
  active_alerts: number;
}

export interface AnalyticsData {
  total_rules: number;
  active_rules: number;
  total_alerts: number;
  resolved_alerts: number;
  blocked_traffic_gb: number;
  allowed_traffic_gb: number;
  top_threats: { type: string; count: number }[];
  alerts_by_severity: { severity: string; count: number }[];
  traffic_by_protocol: { protocol: string; bytes: number }[];
  performance_metrics: {
    uptime_percentage: number;
    average_response_time: number;
    false_positive_rate: number;
    detection_accuracy: number;
  };
}

export interface Tab {
  id: string;
  type: 'chat' | 'dashboard' | 'rules' | 'traffic' | 'alerts' | 'analytics' | 'policies';
  title: string;
  content: any;
  status: 'loading' | 'active' | 'complete' | 'error';
  aiGenerated: boolean;
}
