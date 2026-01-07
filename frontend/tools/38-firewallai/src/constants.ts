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
  customPrompt: `You are FirewallAI, an expert in network security and firewall management with deep knowledge of intrusion detection, threat analysis, policy enforcement, and AI-powered security operations.

CAPABILITIES:
- Analyze network traffic for security threats and anomalies
- Manage firewall rules and security policies
- Detect intrusions and unauthorized access attempts
- Provide real-time threat intelligence and recommendations
- Generate comprehensive security reports and analytics
- Optimize firewall performance and rule efficiency

AVAILABLE FUNCTIONS:
- analyze_traffic: Analyze network traffic for security threats
- create_firewall_rule: Create new firewall rules with AI optimization
- detect_intrusions: Run intrusion detection on network segments
- generate_security_report: Generate detailed security analytics reports
- optimize_rules: Optimize firewall rules for better performance
- threat_intelligence: Get latest threat intelligence and IOCs
- policy_compliance: Check firewall policies against compliance frameworks`,
  agentName: 'FirewallAI',
  temperature: 0.7,
  maxTokens: 4096,
  provider: 'gemini',
  model: 'gemini-2.5-flash-preview',
  activeTool: 'none',
  workspaceMode: 'FIREWALL_DASHBOARD',
  portalUrl: 'http://localhost:3038',
  canvas: {
    content: '',
    type: 'text',
    title: 'Firewall Analysis Canvas',
    language: 'text'
  }
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Firewall Rules',
    icon: 'Shield',
    tool: 'firewall_rules',
    description: 'Manage and optimize firewall rules'
  },
  {
    label: 'Traffic Analysis',
    icon: 'Activity',
    tool: 'traffic_analysis',
    description: 'Analyze network traffic patterns'
  },
  {
    label: 'Threat Detection',
    icon: 'AlertTriangle',
    tool: 'threat_detection',
    description: 'AI-powered threat detection and analysis'
  },
  {
    label: 'Policy Engine',
    icon: 'FileText',
    tool: 'policy_engine',
    description: 'Security policy management and compliance'
  },
  {
    label: 'Alerts',
    icon: 'Bell',
    tool: 'alerts',
    description: 'Security alerts and notifications'
  },
  {
    label: 'Reports',
    icon: 'BarChart3',
    tool: 'reports',
    description: 'Security analytics and reporting'
  },
  {
    label: 'Network Monitor',
    icon: 'Monitor',
    tool: 'network_monitor',
    description: 'Real-time network monitoring'
  },
  {
    label: 'Intrusion Detection',
    icon: 'Eye',
    tool: 'intrusion_detection',
    description: 'Advanced intrusion detection system'
  }
];

export const THREAT_CATEGORIES = [
  'malware',
  'intrusion',
  'dos_attack',
  'unauthorized_access',
  'data_exfiltration',
  'phishing',
  'ransomware',
  'zero_day',
  'insider_threat',
  'supply_chain'
];

export const PROTOCOLS = [
  'tcp',
  'udp',
  'icmp',
  'http',
  'https',
  'ftp',
  'ssh',
  'telnet',
  'smtp',
  'dns'
];

export const RULE_ACTIONS = [
  'allow',
  'deny',
  'reject',
  'drop',
  'log',
  'alert'
];

export const SEVERITY_LEVELS = [
  'low',
  'medium',
  'high',
  'critical'
];

export const ALERT_TYPES = [
  'intrusion',
  'anomaly',
  'policy_violation',
  'dos_attack',
  'malware',
  'unauthorized_access',
  'suspicious_traffic',
  'configuration_change'
];

export const VENDOR_CONFIG = [
  {
    id: 'palo_alto',
    name: 'Palo Alto Networks',
    type: 'firewall',
    supported_features: ['threat_prevention', 'url_filtering', 'application_control']
  },
  {
    id: 'checkpoint',
    name: 'Check Point',
    type: 'firewall',
    supported_features: ['identity_awareness', 'threat_emulation', 'sandblast']
  },
  {
    id: 'cisco_asa',
    name: 'Cisco ASA',
    type: 'firewall',
    supported_features: ['vpn', 'intrusion_prevention', 'content_filtering']
  },
  {
    id: 'fortinet',
    name: 'Fortinet FortiGate',
    type: 'utm',
    supported_features: ['web_filtering', 'antivirus', 'ips', 'application_control']
  },
  {
    id: 'juniper_srx',
    name: 'Juniper SRX',
    type: 'firewall',
    supported_features: ['app_secure', 'idp', 'utm']
  }
];

export const COMPLIANCE_FRAMEWORKS = [
  'PCI_DSS',
  'HIPAA',
  'SOX',
  'GDPR',
  'NIST',
  'ISO_27001',
  'CIS_Controls'
];

export const TIME_RANGES = [
  { label: 'Last 5 minutes', value: '5m' },
  { label: 'Last 15 minutes', value: '15m' },
  { label: 'Last hour', value: '1h' },
  { label: 'Last 6 hours', value: '6h' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' }
];

export const CHART_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // yellow
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#F97316', // orange
  '#84CC16', // lime
  '#EC4899', // pink
  '#6B7280'  // gray
];
