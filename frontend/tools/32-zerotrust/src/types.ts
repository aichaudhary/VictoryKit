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

export type NeuralTool = 
  | 'none' 
  | 'access_control'
  | 'identity_verification'
  | 'device_trust'
  | 'policies'
  | 'audit_trail'
  | 'reports'
  | 'web_search'
  | 'canvas'
  | 'browser';

export type WorkspaceMode = 'CHAT' | 'PORTAL' | 'CANVAS' | 'ZEROTRUST_DASHBOARD';

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

// ZeroTrust Specific Types
export interface AccessRequest {
  id: string;
  request_id: string;
  user_id: string;
  resource_id: string;
  resource_type: 'application' | 'network' | 'data' | 'service';
  action: 'read' | 'write' | 'execute' | 'admin';
  timestamp: string;
  status: 'pending' | 'approved' | 'denied' | 'escalated';
  trust_score?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  decision_reason?: string;
}

export interface DeviceTrust {
  device_id: string;
  device_type: 'laptop' | 'desktop' | 'mobile' | 'tablet' | 'server';
  os_type: string;
  os_version: string;
  is_managed: boolean;
  is_compliant: boolean;
  trust_score: number;
  last_verified: string;
  compliance_violations: string[];
  security_posture: {
    antivirus: boolean;
    firewall: boolean;
    encryption: boolean;
    patched: boolean;
  };
}

export interface UserIdentity {
  user_id: string;
  username: string;
  email: string;
  role: string;
  clearance_level: 'public' | 'internal' | 'confidential' | 'secret';
  groups: string[];
  mfa_enabled: boolean;
  last_login: string;
  trust_score: number;
  authentication_factors: string[];
}

export interface ZeroTrustPolicy {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  category: 'access' | 'identity' | 'device' | 'network' | 'data';
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  created_at: string;
  updated_at: string;
}

export interface PolicyCondition {
  type: 'user' | 'device' | 'location' | 'time' | 'risk';
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number | boolean;
}

export interface PolicyAction {
  type: 'allow' | 'deny' | 'require_mfa' | 'escalate' | 'log';
  parameters?: Record<string, any>;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  event_type: 'access_request' | 'policy_change' | 'identity_verification' | 'device_check';
  user_id: string;
  resource_id?: string;
  action: string;
  result: 'success' | 'failure' | 'blocked';
  details: Record<string, any>;
}

export interface TrustScore {
  overall: number;
  identity: number;
  device: number;
  network: number;
  context: number;
  factors: TrustFactor[];
}

export interface TrustFactor {
  name: string;
  weight: number;
  score: number;
  status: 'passed' | 'failed' | 'warning';
  details: string;
}

export interface Tab {
  id: string;
  type: 'chat' | 'web' | 'code' | 'chart' | 'access' | 'report';
  title: string;
  content: any;
  status: 'loading' | 'active' | 'complete' | 'error';
  aiGenerated: boolean;
}
