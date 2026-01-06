// SOAR Engine Types
// Tool #28 - soarengine.maula.ai

// ============================================
// Navigation & UI Types
// ============================================

export type Tab = 
  | 'dashboard' 
  | 'cases' 
  | 'playbooks' 
  | 'automations' 
  | 'integrations' 
  | 'enrichment' 
  | 'reports' 
  | 'settings';

export interface NavItem {
  id: Tab;
  label: string;
  icon: string;
  description: string;
}

// ============================================
// Case Management Types
// ============================================

export type CaseSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type CaseStatus = 'new' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'escalated';
export type CasePriority = 1 | 2 | 3 | 4 | 5;

export interface Case {
  id: string;
  title: string;
  description: string;
  severity: CaseSeverity;
  status: CaseStatus;
  priority: CasePriority;
  case_type: string;
  source: string;
  assigned_to: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  sla_deadline?: string;
  sla_breached: boolean;
  related_alerts: string[];
  related_cases: string[];
  artifacts: CaseArtifact[];
  timeline: CaseEvent[];
  tasks: CaseTask[];
  notes: CaseNote[];
  tags: string[];
  playbook_executions: string[];
}

export interface CaseArtifact {
  id: string;
  type: 'ip' | 'domain' | 'url' | 'hash_md5' | 'hash_sha1' | 'hash_sha256' | 'email' | 'file' | 'user' | 'host';
  value: string;
  source: string;
  enrichment?: ArtifactEnrichment;
  added_at: string;
  added_by: string;
  is_malicious?: boolean;
  confidence?: number;
}

export interface ArtifactEnrichment {
  source: string;
  data: Record<string, unknown>;
  enriched_at: string;
  reputation_score?: number;
  threat_type?: string;
  related_campaigns?: string[];
  geo_location?: {
    country: string;
    city?: string;
    isp?: string;
  };
}

export interface CaseEvent {
  id: string;
  timestamp: string;
  event_type: 'created' | 'updated' | 'escalated' | 'assigned' | 'comment' | 'automation' | 'enrichment' | 'playbook' | 'resolved' | 'closed';
  title: string;
  description: string;
  actor: string;
  metadata?: Record<string, unknown>;
}

export interface CaseTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  completed_by?: string;
  is_automated: boolean;
  playbook_step_id?: string;
}

export interface CaseNote {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  type: 'general' | 'finding' | 'action' | 'recommendation';
}

// ============================================
// Playbook Types
// ============================================

export type PlaybookStatus = 'draft' | 'active' | 'disabled' | 'archived';
export type PlaybookTrigger = 'manual' | 'alert' | 'scheduled' | 'webhook' | 'case_created';

export interface Playbook {
  id: string;
  name: string;
  description: string;
  category: string;
  status: PlaybookStatus;
  version: string;
  trigger: PlaybookTrigger;
  trigger_conditions?: TriggerCondition[];
  steps: PlaybookStep[];
  created_by: string;
  created_at: string;
  updated_at: string;
  execution_count: number;
  success_rate: number;
  avg_execution_time: number;
  tags: string[];
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'contains' | 'regex' | 'greater_than' | 'less_than' | 'in';
  value: string | number | string[];
}

export interface PlaybookStep {
  id: string;
  order: number;
  name: string;
  description: string;
  type: 'action' | 'decision' | 'parallel' | 'loop' | 'wait' | 'manual';
  action?: StepAction;
  conditions?: StepCondition[];
  on_success?: string;
  on_failure?: string;
  timeout?: number;
  retry_count?: number;
  retry_delay?: number;
}

export interface StepAction {
  integration_id: string;
  action_name: string;
  parameters: Record<string, unknown>;
}

export interface StepCondition {
  field: string;
  operator: string;
  value: unknown;
  next_step: string;
}

export interface PlaybookExecution {
  id: string;
  playbook_id: string;
  playbook_name: string;
  case_id?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  started_at: string;
  completed_at?: string;
  triggered_by: string;
  trigger_type: PlaybookTrigger;
  steps_completed: number;
  total_steps: number;
  current_step?: string;
  step_results: StepResult[];
  error?: string;
}

export interface StepResult {
  step_id: string;
  step_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  output?: Record<string, unknown>;
  error?: string;
}

// ============================================
// Automation Types
// ============================================

export interface Automation {
  id: string;
  name: string;
  description: string;
  type: 'enrichment' | 'response' | 'notification' | 'integration' | 'custom';
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  is_enabled: boolean;
  created_at: string;
  last_triggered?: string;
  execution_count: number;
}

export interface AutomationTrigger {
  type: 'event' | 'schedule' | 'condition';
  event_type?: string;
  schedule?: string;
  conditions?: TriggerCondition[];
}

export interface AutomationAction {
  id: string;
  type: string;
  integration_id?: string;
  parameters: Record<string, unknown>;
  order: number;
}

// ============================================
// Integration Types
// ============================================

export type IntegrationCategory = 'siem' | 'edr' | 'firewall' | 'email' | 'ticketing' | 'threat_intel' | 'cloud' | 'identity' | 'other';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export interface Integration {
  id: string;
  name: string;
  type: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  icon: string;
  description: string;
  config: Record<string, unknown>;
  capabilities: string[];
  actions: IntegrationAction[];
  last_sync?: string;
  health_status: 'healthy' | 'degraded' | 'unhealthy';
  created_at: string;
}

export interface IntegrationAction {
  id: string;
  name: string;
  description: string;
  parameters: IntegrationParameter[];
  returns?: string;
}

export interface IntegrationParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description: string;
  default?: unknown;
}

// ============================================
// Enrichment Types
// ============================================

export interface EnrichmentSource {
  id: string;
  name: string;
  type: 'threat_intel' | 'reputation' | 'geolocation' | 'whois' | 'sandbox' | 'custom';
  provider: string;
  is_enabled: boolean;
  api_key_configured: boolean;
  rate_limit: number;
  supported_types: string[];
  last_used?: string;
}

export interface EnrichmentResult {
  id: string;
  artifact_type: string;
  artifact_value: string;
  source: string;
  result: Record<string, unknown>;
  is_malicious: boolean;
  confidence: number;
  enriched_at: string;
  cached_until?: string;
}

// ============================================
// Metrics & Dashboard Types
// ============================================

export interface DashboardStats {
  open_cases: number;
  cases_today: number;
  critical_cases: number;
  active_playbooks: number;
  automations_triggered: number;
  mean_time_to_respond: number;
  mean_time_to_contain: number;
  automation_rate: number;
  sla_compliance: number;
  integrations_healthy: number;
  integrations_total: number;
}

export interface MetricsData {
  period: string;
  cases_opened: number;
  cases_closed: number;
  playbooks_executed: number;
  automations_run: number;
  avg_response_time: number;
  sla_breaches: number;
}

// ============================================
// Settings Types
// ============================================

export interface SOARSettings {
  organization: string;
  timezone: string;
  default_sla: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  notifications: {
    email_enabled: boolean;
    slack_enabled: boolean;
    teams_enabled: boolean;
  };
  ai_provider: string;
  ai_model: string;
  auto_enrichment: boolean;
  auto_assign: boolean;
}

// ============================================
// AI Assistant Types
// ============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
  actions?: SuggestedAction[];
}

export interface SuggestedAction {
  id: string;
  label: string;
  type: 'create_playbook' | 'run_automation' | 'enrich_artifact' | 'escalate_case';
  parameters?: Record<string, unknown>;
}
