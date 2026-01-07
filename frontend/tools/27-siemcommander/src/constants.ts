/**
 * SIEMCommander - Constants
 * AI-Powered Security Information & Event Management
 */

import type { NavItem, EventSeverity, EventSource, Settings } from './types';

// ============ Theme Colors ============
export const THEME = {
  primary: '#8B5CF6', // Violet
  secondary: '#7C3AED',
  accent: '#A78BFA',
  success: '#22C55E',
  warning: '#EAB308',
  danger: '#EF4444',
  info: '#3B82F6',
  background: '#0F172A',
  surface: '#1E293B',
  border: '#334155',
};

// ============ Severity Colors ============
export const SEVERITY_COLORS: Record<EventSeverity, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#22C55E',
  info: '#3B82F6',
};

export const SEVERITY_BG_COLORS: Record<EventSeverity, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

// ============ Status Colors ============
export const STATUS_COLORS = {
  new: 'bg-blue-500/20 text-blue-400',
  open: 'bg-blue-500/20 text-blue-400',
  investigating: 'bg-yellow-500/20 text-yellow-400',
  triaging: 'bg-yellow-500/20 text-yellow-400',
  containing: 'bg-orange-500/20 text-orange-400',
  resolved: 'bg-green-500/20 text-green-400',
  closed: 'bg-gray-500/20 text-gray-400',
  acknowledged: 'bg-purple-500/20 text-purple-400',
  suppressed: 'bg-gray-500/20 text-gray-400',
  false_positive: 'bg-gray-500/20 text-gray-400',
  escalated: 'bg-red-500/20 text-red-400',
  eradicating: 'bg-orange-500/20 text-orange-400',
  recovering: 'bg-green-500/20 text-green-400',
};

// ============ Navigation Items ============
export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'events', label: 'Events', icon: 'Activity' },
  { id: 'incidents', label: 'Incidents', icon: 'AlertTriangle', badge: 5 },
  { id: 'alerts', label: 'Alerts', icon: 'Bell', badge: 12 },
  { id: 'threatHunting', label: 'Threat Hunting', icon: 'Crosshair' },
  { id: 'playbooks', label: 'Playbooks', icon: 'GitBranch' },
  { id: 'rules', label: 'Detection Rules', icon: 'Shield' },
  { id: 'dataSources', label: 'Data Sources', icon: 'Database' },
  { id: 'reports', label: 'Reports', icon: 'FileText' },
  { id: 'assistant', label: 'AI Assistant', icon: 'Bot' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
];

// ============ Event Sources ============
export const EVENT_SOURCES: { id: EventSource; name: string; icon: string }[] = [
  { id: 'firewall', name: 'Firewall', icon: 'Shield' },
  { id: 'ids', name: 'IDS', icon: 'Eye' },
  { id: 'ips', name: 'IPS', icon: 'ShieldCheck' },
  { id: 'endpoint', name: 'Endpoint', icon: 'Monitor' },
  { id: 'cloud', name: 'Cloud', icon: 'Cloud' },
  { id: 'application', name: 'Application', icon: 'AppWindow' },
  { id: 'network', name: 'Network', icon: 'Network' },
  { id: 'database', name: 'Database', icon: 'Database' },
  { id: 'email', name: 'Email', icon: 'Mail' },
  { id: 'proxy', name: 'Proxy', icon: 'Globe' },
];

// ============ MITRE ATT&CK Tactics ============
export const MITRE_TACTICS = [
  { id: 'TA0001', name: 'Initial Access', shortName: 'initial-access' },
  { id: 'TA0002', name: 'Execution', shortName: 'execution' },
  { id: 'TA0003', name: 'Persistence', shortName: 'persistence' },
  { id: 'TA0004', name: 'Privilege Escalation', shortName: 'privilege-escalation' },
  { id: 'TA0005', name: 'Defense Evasion', shortName: 'defense-evasion' },
  { id: 'TA0006', name: 'Credential Access', shortName: 'credential-access' },
  { id: 'TA0007', name: 'Discovery', shortName: 'discovery' },
  { id: 'TA0008', name: 'Lateral Movement', shortName: 'lateral-movement' },
  { id: 'TA0009', name: 'Collection', shortName: 'collection' },
  { id: 'TA0010', name: 'Exfiltration', shortName: 'exfiltration' },
  { id: 'TA0011', name: 'Command and Control', shortName: 'command-and-control' },
  { id: 'TA0040', name: 'Impact', shortName: 'impact' },
];

// ============ Incident Categories ============
export const INCIDENT_CATEGORIES = [
  { id: 'malware', name: 'Malware', icon: 'Bug' },
  { id: 'phishing', name: 'Phishing', icon: 'Fish' },
  { id: 'ddos', name: 'DDoS', icon: 'Zap' },
  { id: 'data_breach', name: 'Data Breach', icon: 'DatabaseZap' },
  { id: 'insider_threat', name: 'Insider Threat', icon: 'UserX' },
  { id: 'apt', name: 'APT', icon: 'Target' },
  { id: 'ransomware', name: 'Ransomware', icon: 'Lock' },
  { id: 'unauthorized_access', name: 'Unauthorized Access', icon: 'KeyRound' },
  { id: 'policy_violation', name: 'Policy Violation', icon: 'FileWarning' },
];

// ============ Time Ranges ============
export const TIME_RANGES = [
  { label: 'Last 15 minutes', value: '15m' },
  { label: 'Last 1 hour', value: '1h' },
  { label: 'Last 6 hours', value: '6h' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Custom', value: 'custom' },
];

// ============ Query Languages ============
export const QUERY_LANGUAGES = [
  { id: 'spl', name: 'SPL (Splunk)', description: 'Splunk Processing Language' },
  { id: 'kql', name: 'KQL (Kusto)', description: 'Kusto Query Language' },
  { id: 'sigma', name: 'Sigma', description: 'Generic signature format' },
  { id: 'custom', name: 'Custom', description: 'Custom query syntax' },
];

// ============ Report Types ============
export const REPORT_TYPES = [
  { id: 'executive', name: 'Executive Summary', icon: 'BarChart2' },
  { id: 'compliance', name: 'Compliance Report', icon: 'CheckSquare' },
  { id: 'threat', name: 'Threat Intelligence', icon: 'Shield' },
  { id: 'incident', name: 'Incident Report', icon: 'AlertTriangle' },
  { id: 'activity', name: 'Activity Report', icon: 'Activity' },
  { id: 'custom', name: 'Custom Report', icon: 'FileText' },
];

// ============ Default Settings ============
export const DEFAULT_SETTINGS: Settings = {
  general: {
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
    refreshInterval: 30,
    darkMode: true,
  },
  notifications: {
    email: true,
    slack: false,
    criticalAlerts: true,
    incidentUpdates: true,
  },
  retention: {
    events: 90,
    incidents: 365,
    logs: 30,
  },
  integrations: {
    ticketing: { enabled: false, provider: '' },
    threatIntel: { enabled: true, feeds: ['misp', 'otx'] },
    soar: { enabled: true, autoResponse: false },
  },
  ai: {
    enabled: true,
    model: 'gpt-4',
    autoAnalysis: true,
  },
};

// ============ API Endpoints ============
export const API_ENDPOINTS = {
  dashboard: '/api/v1/siem/dashboard',
  events: '/api/v1/siem/events',
  incidents: '/api/v1/siem/incidents',
  alerts: '/api/v1/siem/alerts',
  rules: '/api/v1/siem/rules',
  playbooks: '/api/v1/siem/playbooks',
  dataSources: '/api/v1/siem/datasources',
  reports: '/api/v1/siem/reports',
  hunts: '/api/v1/siem/hunts',
  settings: '/api/v1/siem/settings',
  ai: '/api/v1/siem/ai',
};

// ============ Chart Colors ============
export const CHART_COLORS = {
  primary: '#8B5CF6',
  secondary: '#A78BFA',
  critical: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#22C55E',
  info: '#3B82F6',
  grid: 'rgba(255, 255, 255, 0.05)',
  tooltip: 'rgba(15, 23, 42, 0.95)',
};

// ============ Quick Actions ============
export const QUICK_ACTIONS = [
  { id: 'search_events', label: 'Search Events', icon: 'Search' },
  { id: 'create_incident', label: 'Create Incident', icon: 'Plus' },
  { id: 'run_playbook', label: 'Run Playbook', icon: 'Play' },
  { id: 'generate_report', label: 'Generate Report', icon: 'FileText' },
  { id: 'hunt_threats', label: 'Hunt Threats', icon: 'Crosshair' },
];

// ============ AI Suggestions ============
export const AI_SUGGESTIONS = [
  'What are the top threats in the last 24 hours?',
  'Show me all critical incidents',
  'Analyze events from the firewall',
  'Create a detection rule for brute force',
  'Run the malware containment playbook',
  'Generate an executive summary report',
  'Hunt for lateral movement activity',
];

// ============ Mock Data Helpers ============
export function getSeverityBadgeClass(severity: EventSeverity): string {
  return SEVERITY_BG_COLORS[severity] || SEVERITY_BG_COLORS.info;
}

export function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `${Math.floor(minutes / 1440)}d ${Math.floor((minutes % 1440) / 60)}h`;
}
