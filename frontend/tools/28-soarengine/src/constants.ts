// SOAR Engine Constants
// Tool #28 - soarengine.maula.ai

import { NavItem, SOARSettings } from './types';

// ============================================
// Provider Configuration
// ============================================

export const PROVIDER_CONFIG = {
  gemini: {
    name: 'Google Gemini',
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    defaultModel: 'gemini-2.0-flash',
  },
  openai: {
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'o1-preview', 'o1-mini'],
    defaultModel: 'gpt-4o',
  },
  anthropic: {
    name: 'Anthropic',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    defaultModel: 'claude-3-sonnet',
  },
  xai: {
    name: 'xAI',
    models: ['grok-2', 'grok-2-mini'],
    defaultModel: 'grok-2',
  },
  mistral: {
    name: 'Mistral AI',
    models: ['mistral-large', 'mistral-medium', 'mistral-small'],
    defaultModel: 'mistral-large',
  },
  meta: {
    name: 'Meta AI',
    models: ['llama-3.1-405b', 'llama-3.1-70b', 'llama-3.1-8b'],
    defaultModel: 'llama-3.1-70b',
  },
};

// ============================================
// Navigation Items
// ============================================

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', description: 'Overview & metrics' },
  { id: 'cases', label: 'Cases', icon: 'Briefcase', description: 'Case management' },
  { id: 'playbooks', label: 'Playbooks', icon: 'BookOpen', description: 'Response playbooks' },
  { id: 'automations', label: 'Automations', icon: 'Zap', description: 'Automation rules' },
  { id: 'integrations', label: 'Integrations', icon: 'Plug', description: 'Tool connections' },
  { id: 'enrichment', label: 'Enrichment', icon: 'Search', description: 'IOC enrichment' },
  { id: 'reports', label: 'Reports', icon: 'FileBarChart', description: 'Analytics & reports' },
  { id: 'settings', label: 'Settings', icon: 'Settings', description: 'Configuration' },
];

// ============================================
// Severity & Status Colors
// ============================================

export const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export const SEVERITY_DOT_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
  info: 'bg-blue-500',
};

export const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  in_progress: 'bg-purple-500/20 text-purple-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  resolved: 'bg-green-500/20 text-green-400',
  closed: 'bg-gray-500/20 text-gray-400',
  escalated: 'bg-red-500/20 text-red-400',
};

export const PLAYBOOK_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-400',
  active: 'bg-green-500/20 text-green-400',
  disabled: 'bg-yellow-500/20 text-yellow-400',
  archived: 'bg-slate-500/20 text-slate-400',
};

export const EXECUTION_STATUS_COLORS: Record<string, string> = {
  running: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
  cancelled: 'bg-gray-500/20 text-gray-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
};

export const INTEGRATION_STATUS_COLORS: Record<string, string> = {
  connected: 'bg-green-500/20 text-green-400',
  disconnected: 'bg-gray-500/20 text-gray-400',
  error: 'bg-red-500/20 text-red-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
};

// ============================================
// Playbook Categories
// ============================================

export const PLAYBOOK_CATEGORIES = [
  { id: 'phishing', name: 'Phishing Response', icon: 'Mail' },
  { id: 'malware', name: 'Malware Containment', icon: 'Bug' },
  { id: 'account', name: 'Account Compromise', icon: 'UserX' },
  { id: 'data', name: 'Data Exfiltration', icon: 'Database' },
  { id: 'ransomware', name: 'Ransomware Response', icon: 'Lock' },
  { id: 'insider', name: 'Insider Threat', icon: 'UserMinus' },
  { id: 'ddos', name: 'DDoS Mitigation', icon: 'Cloud' },
  { id: 'vulnerability', name: 'Vulnerability Response', icon: 'Shield' },
];

// ============================================
// Integration Categories
// ============================================

export const INTEGRATION_CATEGORIES = [
  { id: 'siem', name: 'SIEM', icon: 'Monitor', description: 'Security Information & Event Management' },
  { id: 'edr', name: 'EDR', icon: 'Shield', description: 'Endpoint Detection & Response' },
  { id: 'firewall', name: 'Firewall', icon: 'Flame', description: 'Network Firewalls' },
  { id: 'email', name: 'Email Security', icon: 'Mail', description: 'Email Protection' },
  { id: 'ticketing', name: 'Ticketing', icon: 'Ticket', description: 'IT Service Management' },
  { id: 'threat_intel', name: 'Threat Intel', icon: 'Eye', description: 'Threat Intelligence Feeds' },
  { id: 'cloud', name: 'Cloud', icon: 'Cloud', description: 'Cloud Platforms' },
  { id: 'identity', name: 'Identity', icon: 'Users', description: 'Identity & Access Management' },
];

// ============================================
// Available Integrations
// ============================================

export const AVAILABLE_INTEGRATIONS = [
  // SIEM
  { id: 'splunk', name: 'Splunk', category: 'siem', icon: '🔍' },
  { id: 'elastic', name: 'Elastic Security', category: 'siem', icon: '🟡' },
  { id: 'qradar', name: 'IBM QRadar', category: 'siem', icon: '🔵' },
  { id: 'sentinel', name: 'Microsoft Sentinel', category: 'siem', icon: '🟦' },
  // EDR
  { id: 'crowdstrike', name: 'CrowdStrike', category: 'edr', icon: '🦅' },
  { id: 'sentinelone', name: 'SentinelOne', category: 'edr', icon: '🟣' },
  { id: 'defender', name: 'Microsoft Defender', category: 'edr', icon: '🛡️' },
  { id: 'carbonblack', name: 'VMware Carbon Black', category: 'edr', icon: '⚫' },
  // Firewall
  { id: 'paloalto', name: 'Palo Alto', category: 'firewall', icon: '🔥' },
  { id: 'fortinet', name: 'Fortinet', category: 'firewall', icon: '🟠' },
  { id: 'checkpoint', name: 'Check Point', category: 'firewall', icon: '☑️' },
  // Threat Intel
  { id: 'virustotal', name: 'VirusTotal', category: 'threat_intel', icon: '🦠' },
  { id: 'alienvault', name: 'AlienVault OTX', category: 'threat_intel', icon: '👽' },
  { id: 'misp', name: 'MISP', category: 'threat_intel', icon: '🔗' },
  // Ticketing
  { id: 'servicenow', name: 'ServiceNow', category: 'ticketing', icon: '📋' },
  { id: 'jira', name: 'Jira', category: 'ticketing', icon: '🎫' },
];

// ============================================
// Enrichment Sources
// ============================================

export const ENRICHMENT_SOURCES = [
  { id: 'virustotal', name: 'VirusTotal', types: ['ip', 'domain', 'url', 'hash'] },
  { id: 'abuseipdb', name: 'AbuseIPDB', types: ['ip'] },
  { id: 'shodan', name: 'Shodan', types: ['ip'] },
  { id: 'urlscan', name: 'urlscan.io', types: ['url', 'domain'] },
  { id: 'alienvault', name: 'AlienVault OTX', types: ['ip', 'domain', 'hash'] },
  { id: 'ipinfo', name: 'IPInfo', types: ['ip'] },
  { id: 'whois', name: 'WHOIS', types: ['domain', 'ip'] },
  { id: 'greynoise', name: 'GreyNoise', types: ['ip'] },
];

// ============================================
// Default Settings
// ============================================

export const DEFAULT_SETTINGS: SOARSettings = {
  organization: 'Security Operations Center',
  timezone: 'UTC',
  default_sla: {
    critical: 1,
    high: 4,
    medium: 24,
    low: 72,
  },
  notifications: {
    email_enabled: true,
    slack_enabled: false,
    teams_enabled: false,
  },
  ai_provider: 'gemini',
  ai_model: 'gemini-2.0-flash',
  auto_enrichment: true,
  auto_assign: false,
};

// ============================================
// Chart Colors
// ============================================

export const CHART_COLORS = {
  primary: '#8B5CF6',
  secondary: '#A855F7',
  accent: '#C084FC',
  success: '#22C55E',
  warning: '#EAB308',
  danger: '#EF4444',
  info: '#3B82F6',
};

// ============================================
// Event Types
// ============================================

export const EVENT_TYPE_ICONS: Record<string, string> = {
  created: 'Plus',
  updated: 'Edit',
  escalated: 'ArrowUp',
  assigned: 'UserPlus',
  comment: 'MessageSquare',
  automation: 'Zap',
  enrichment: 'Search',
  playbook: 'BookOpen',
  resolved: 'CheckCircle',
  closed: 'XCircle',
};
