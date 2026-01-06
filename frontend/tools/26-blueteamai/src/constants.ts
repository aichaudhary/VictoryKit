import { SettingsState, NavItem } from './types';

export const PROVIDER_CONFIG = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    models: ['gemini-2.5-flash-preview', 'gemini-2.5-pro-preview', 'gemini-2.0-flash']
  },
  {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini']
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307']
  },
  {
    id: 'xai',
    name: 'xAI Grok',
    models: ['grok-2', 'grok-2-mini']
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    models: ['mistral-large-latest', 'mistral-medium', 'mistral-small']
  },
  {
    id: 'meta',
    name: 'Meta Llama',
    models: ['llama-3.1-405b', 'llama-3.1-70b', 'llama-3.1-8b']
  }
];

export const DEFAULT_SETTINGS: SettingsState = {
  customPrompt: `You are BlueTeamAI, an expert AI assistant for defensive cybersecurity operations (Blue Team). You help security analysts with:

CAPABILITIES:
- Analyze and triage security alerts from multiple sources (SIEM, EDR, Firewall, etc.)
- Investigate incidents and build comprehensive timelines
- Execute threat hunting queries across security data
- Map observed techniques to MITRE ATT&CK framework
- Correlate IOCs across threat intelligence sources
- Execute and manage response playbooks
- Generate detailed incident and threat hunting reports

AVAILABLE FUNCTIONS:
- analyze_alert: Triage and analyze security alerts
- investigate_incident: Deep-dive incident investigation
- run_threat_hunt: Execute threat hunting queries
- get_mitre_mapping: Map techniques to MITRE ATT&CK
- create_timeline: Generate incident timelines
- execute_playbook: Run automated response playbooks
- correlate_iocs: Cross-reference IOCs with threat intel
- generate_report: Create comprehensive reports

Always provide accurate threat assessments, minimize false positives, and recommend actionable response steps.`,
  agentName: "BlueTeam AI",
  temperature: 0.6,
  maxTokens: 4096,
  provider: 'gemini',
  model: "gemini-2.5-flash-preview",
  activeTool: 'alert_triage',
  workspaceMode: 'CHAT',
  portalUrl: 'https://attack.mitre.org/',
  canvas: {
    content: "// BlueTeamAI Operations Workspace\n\nReady for defensive security operations.",
    type: 'text',
    title: 'BlueTeam_Canvas'
  }
};

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'Activity', description: 'Security operations overview' },
  { id: 'alerts', label: 'Alerts', icon: 'AlertTriangle', description: 'Triage security alerts' },
  { id: 'incidents', label: 'Incidents', icon: 'Eye', description: 'Investigate incidents' },
  { id: 'hunting', label: 'Threat Hunting', icon: 'Target', description: 'Proactive threat hunting' },
  { id: 'mitre', label: 'MITRE ATT&CK', icon: 'Grid', description: 'ATT&CK framework mapping' },
  { id: 'playbooks', label: 'Playbooks', icon: 'Zap', description: 'Response playbook automation' },
  { id: 'reports', label: 'Reports', icon: 'FileText', description: 'Generate security reports' },
  { id: 'settings', label: 'Settings', icon: 'Settings', description: 'Configure BlueTeamAI' }
];

export const BLUETEAM_PRESETS: Record<string, { prompt: string; temp: number }> = {
  triage: { 
    prompt: "Focus on rapid alert triage. Quickly assess severity, identify false positives, and prioritize genuine threats.", 
    temp: 0.4 
  },
  investigation: { 
    prompt: "Conduct thorough incident investigation. Build complete timelines, identify root cause, and document all findings.", 
    temp: 0.5 
  },
  hunting: { 
    prompt: "Proactive threat hunting mode. Look for hidden threats, anomalous behaviors, and potential compromises.", 
    temp: 0.6 
  },
  response: { 
    prompt: "Incident response mode. Focus on containment, eradication, and recovery actions.", 
    temp: 0.3 
  }
};

export const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  low: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  info: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/50' }
};

export const STATUS_COLORS = {
  new: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  investigating: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  escalated: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  resolved: { bg: 'bg-green-500/20', text: 'text-green-400' },
  false_positive: { bg: 'bg-gray-500/20', text: 'text-gray-400' }
};

export const INCIDENT_STATUS_COLORS = {
  open: { bg: 'bg-red-500/20', text: 'text-red-400' },
  in_progress: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  contained: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  eradicated: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  recovered: { bg: 'bg-green-500/20', text: 'text-green-400' },
  closed: { bg: 'bg-gray-500/20', text: 'text-gray-400' }
};

// MITRE ATT&CK Tactics
export const MITRE_TACTICS = [
  { id: 'reconnaissance', name: 'Reconnaissance', description: 'Gather information to plan future operations' },
  { id: 'resource-development', name: 'Resource Development', description: 'Establish resources to support operations' },
  { id: 'initial-access', name: 'Initial Access', description: 'Gain access to the target network' },
  { id: 'execution', name: 'Execution', description: 'Run malicious code on victim systems' },
  { id: 'persistence', name: 'Persistence', description: 'Maintain access to systems across restarts' },
  { id: 'privilege-escalation', name: 'Privilege Escalation', description: 'Gain higher-level permissions' },
  { id: 'defense-evasion', name: 'Defense Evasion', description: 'Avoid being detected by security tools' },
  { id: 'credential-access', name: 'Credential Access', description: 'Steal account names and passwords' },
  { id: 'discovery', name: 'Discovery', description: 'Explore the environment to understand it' },
  { id: 'lateral-movement', name: 'Lateral Movement', description: 'Move through the network to reach targets' },
  { id: 'collection', name: 'Collection', description: 'Gather data of interest to the goal' },
  { id: 'command-and-control', name: 'Command and Control', description: 'Communicate with compromised systems' },
  { id: 'exfiltration', name: 'Exfiltration', description: 'Steal data from the network' },
  { id: 'impact', name: 'Impact', description: 'Manipulate, interrupt, or destroy systems and data' }
];

// Alert Sources
export const ALERT_SOURCES = [
  { id: 'siem', name: 'SIEM', icon: '📊' },
  { id: 'edr', name: 'EDR', icon: '💻' },
  { id: 'firewall', name: 'Firewall', icon: '🔥' },
  { id: 'ids', name: 'IDS/IPS', icon: '🛡️' },
  { id: 'waf', name: 'WAF', icon: '🌐' },
  { id: 'email', name: 'Email Security', icon: '📧' },
  { id: 'cloud', name: 'Cloud Security', icon: '☁️' }
];
