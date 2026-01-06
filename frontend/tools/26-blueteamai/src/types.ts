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
  | 'alert_triage'
  | 'incident_investigation'
  | 'threat_hunting'
  | 'timeline_view'
  | 'mitre_mapping'
  | 'playbooks'
  | 'reports'
  | 'web_search'
  | 'canvas'
  | 'browser';

export type WorkspaceMode = 'CHAT' | 'PORTAL' | 'CANVAS' | 'BLUE_TEAM_OPS';

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
  id: string;
  label: string;
  icon: string;
  description: string;
}

export type Tab = 'dashboard' | 'alerts' | 'incidents' | 'hunting' | 'mitre' | 'playbooks' | 'reports' | 'settings';

// BlueTeamAI Specific Types
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AlertStatus = 'new' | 'investigating' | 'escalated' | 'resolved' | 'false_positive';
export type IncidentStatus = 'open' | 'in_progress' | 'contained' | 'eradicated' | 'recovered' | 'closed';

export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source: string;
  source_ip?: string;
  dest_ip?: string;
  source_type?: 'siem' | 'edr' | 'firewall' | 'ids' | 'waf' | 'email' | 'cloud' | 'custom';
  timestamp: string;
  entities?: AlertEntity[];
  indicators?: string[];
  mitre_techniques?: string[];
  raw_data?: string;
  assigned_to?: string;
  tags?: string[];
}

export interface AlertEntity {
  type: 'ip' | 'domain' | 'hash' | 'user' | 'host' | 'email' | 'file' | 'process' | 'url';
  value: string;
  reputation?: 'malicious' | 'suspicious' | 'clean' | 'unknown';
  context?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: AlertSeverity;
  created_at: string;
  updated_at: string;
  assigned_to: string[];
  related_alerts: string[];
  affected_assets?: string[];
  timeline: TimelineEvent[];
  iocs: IOC[];
  mitre_techniques: MitreTechnique[];
  containment_actions?: string[];
  notes: IncidentNote[];
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  event_type: 'detection' | 'investigation' | 'containment' | 'eradication' | 'recovery' | 'note';
  title: string;
  description: string;
  source?: string;
  user?: string;
  entities?: AlertEntity[];
}

export interface IOC {
  type: 'ip' | 'domain' | 'hash_md5' | 'hash_sha1' | 'hash_sha256' | 'url' | 'email' | 'filename';
  value: string;
  first_seen: string;
  last_seen: string;
  confidence: number;
  threat_type?: string;
  source?: string;
}

export interface MitreTechnique {
  id: string;
  name: string;
  tactic: string;
  description?: string;
  detection?: string;
  mitigation?: string;
}

export interface ThreatHunt {
  id: string;
  name: string;
  description?: string;
  hypothesis: string;
  query_type: 'ioc_search' | 'behavior_pattern' | 'anomaly_detection' | 'mitre_technique';
  status: 'pending' | 'draft' | 'running' | 'completed' | 'paused';
  created_at: string;
  created_by: string;
  data_sources: string[];
  indicators: string[];
  findings: ThreatHuntFinding[];
}

export interface ThreatHuntFinding {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  evidence: string;
  recommended_action: string;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  trigger_type: 'manual' | 'automatic' | 'scheduled' | 'conditional';
  trigger_conditions?: Record<string, any>;
  steps: PlaybookStep[];
  is_active: boolean;
  last_run?: string;
  run_count?: number;
  created_by: string;
  created_at: string;
}

export interface PlaybookStep {
  id: string;
  order: number;
  name: string;
  description?: string;
  action_type: 'enrichment' | 'containment' | 'notification' | 'query' | 'custom';
  action_config: Record<string, any>;
  required?: boolean;
  timeout?: number;
}

export interface PlaybookExecution {
  id: string;
  playbook_id: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  triggered_by: string;
  step_results: StepResult[];
}

export interface StepResult {
  step_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: any;
  error?: string;
}

export interface IncidentNote {
  id: string;
  timestamp: string;
  author: string;
  content: string;
  type: 'general' | 'finding' | 'action' | 'recommendation';
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'analyst' | 'senior_analyst' | 'lead' | 'manager';
  status: 'online' | 'away' | 'busy' | 'offline';
  avatar?: string;
  active_incidents: number;
}

export interface DashboardStats {
  open_incidents: number;
  alerts_today: number;
  critical_alerts: number;
  mean_time_to_detect: number;
  mean_time_to_respond: number;
  threats_neutralized: number;
  active_hunts: number;
  team_online: number;
}
