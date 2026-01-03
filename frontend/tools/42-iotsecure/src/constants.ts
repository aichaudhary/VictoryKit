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
  customPrompt: `You are IoTSecure AI, an expert in IoT device security with deep knowledge of network security, vulnerability assessment, firmware analysis, and threat detection.

CAPABILITIES:
- Scan and discover IoT devices on the network
- Analyze vulnerabilities and provide risk scores
- Monitor device behavior and detect anomalies
- Manage network segmentation and firewall rules
- Analyze firmware for security issues
- Generate security reports and compliance assessments

AVAILABLE FUNCTIONS:
- discover_devices: Scan network for IoT devices
- scan_vulnerabilities: Run vulnerability scan on devices
- analyze_device: Get detailed security analysis of a device
- get_device_inventory: List all discovered devices
- check_firmware: Analyze firmware for vulnerabilities
- create_baseline: Create behavioral baseline for device
- detect_anomalies: Check for behavioral anomalies
- create_segment: Create network segmentation
- add_firewall_rule: Add firewall rules
- create_alert: Create security alerts
- export_report: Generate security reports

Always provide actionable security recommendations and explain findings clearly.`,
  agentName: "IoTSecure AI",
  temperature: 0.7,
  maxTokens: 4096,
  provider: 'gemini',
  model: "gemini-2.5-flash-preview",
  activeTool: 'device_inventory',
  workspaceMode: 'CHAT',
  portalUrl: 'https://www.shodan.io',
  canvas: {
    content: "// IoTSecure Workspace\n\nReady for IoT security analysis.",
    type: 'text',
    title: 'IoTSecure_Canvas'
  }
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Device Inventory', icon: '📱', tool: 'device_inventory', description: 'View all IoT devices' },
  { label: 'Vulnerability Scan', icon: '🔍', tool: 'vulnerability_scan', description: 'Scan for vulnerabilities' },
  { label: 'Network Topology', icon: '🌐', tool: 'network_topology', description: 'View network segments' },
  { label: 'Alerts', icon: '🚨', tool: 'alerts', description: 'Security alerts' },
  { label: 'Firmware', icon: '💾', tool: 'firmware_analysis', description: 'Analyze firmware' },
  { label: 'Baselines', icon: '📈', tool: 'baselines', description: 'Behavioral baselines' },
  { label: 'Web Portal', icon: '🔗', tool: 'browser', description: 'Open web browser' },
  { label: 'Canvas', icon: '🖌️', tool: 'canvas', description: 'Collaborative workspace' }
];

export const IOT_PRESETS: Record<string, { prompt: string; temp: number }> = {
  discovery: { 
    prompt: "Focus on device discovery. Scan the network, identify all IoT devices, and classify them by type and manufacturer.", 
    temp: 0.3 
  },
  vulnerability: { 
    prompt: "Perform thorough vulnerability assessment. Check for CVEs, misconfigurations, and security weaknesses.", 
    temp: 0.4 
  },
  monitoring: { 
    prompt: "Set up continuous monitoring. Create baselines, configure alerts, and detect anomalies in device behavior.", 
    temp: 0.5 
  },
  compliance: { 
    prompt: "Check compliance with security frameworks. Assess PCI-DSS, HIPAA, GDPR, and ISO 27001 requirements.", 
    temp: 0.4 
  },
  forensics: { 
    prompt: "Investigate security incidents. Analyze logs, trace attack vectors, and gather evidence.", 
    temp: 0.3 
  }
};

export const DEVICE_TYPE_ICONS: Record<string, string> = {
  camera: '📷',
  thermostat: '🌡️',
  sensor: '📡',
  controller: '🎛️',
  gateway: '🚪',
  router: '📶',
  switch: '🔌',
  access_point: '📻',
  smart_lock: '🔐',
  smart_plug: '🔋',
  hvac: '❄️',
  lighting: '💡',
  medical_device: '🏥',
  industrial_plc: '🏭',
  scada: '⚙️',
  building_automation: '🏢',
  environmental_sensor: '🌿',
  wearable: '⌚',
  vehicle: '🚗',
  smart_meter: '📊',
  security_system: '🔒',
  voice_assistant: '🗣️',
  unknown: '❓'
};

export const RISK_COLORS = {
  low: '#00ff88',
  medium: '#ffaa00',
  high: '#ff6600',
  critical: '#ff0055',
  info: '#00aaff'
};

export const SEVERITY_COLORS = {
  info: '#3498db',
  low: '#00ff88',
  medium: '#f1c40f',
  high: '#e67e22',
  critical: '#e74c3c'
};

export const STATUS_COLORS = {
  online: '#00ff88',
  offline: '#95a5a6',
  degraded: '#f1c40f',
  maintenance: '#3498db',
  quarantined: '#e74c3c',
  decommissioned: '#7f8c8d'
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4041/api/v1';

export const API_ENDPOINTS = {
  devices: {
    list: '/devices',
    stats: '/devices/stats',
    highRisk: '/devices/high-risk',
    offline: '/devices/offline',
    byId: (id: string) => `/devices/${id}`,
    quarantine: (id: string) => `/devices/${id}/quarantine`,
    scan: (id: string) => `/devices/${id}/scan`
  },
  vulnerabilities: {
    list: '/vulnerabilities',
    stats: '/vulnerabilities/stats',
    critical: '/vulnerabilities/critical',
    byId: (id: string) => `/vulnerabilities/${id}`,
    searchNvd: '/vulnerabilities/search-nvd',
    byCve: (cveId: string) => `/vulnerabilities/cve/${cveId}`
  },
  scans: {
    list: '/scans',
    stats: '/scans/stats',
    recent: '/scans/recent',
    running: '/scans/running',
    byId: (id: string) => `/scans/${id}`,
    quick: '/scans/quick',
    discovery: '/scans/discovery',
    vulnerability: '/scans/vulnerability'
  },
  alerts: {
    list: '/alerts',
    stats: '/alerts/stats',
    active: '/alerts/active',
    critical: '/alerts/critical',
    recent: '/alerts/recent',
    byId: (id: string) => `/alerts/${id}`,
    acknowledge: (id: string) => `/alerts/${id}/acknowledge`,
    resolve: (id: string) => `/alerts/${id}/resolve`
  },
  segments: {
    list: '/segments',
    stats: '/segments/stats',
    topology: '/segments/topology',
    byId: (id: string) => `/segments/${id}`,
    firewall: (id: string) => `/segments/${id}/firewall-rules`
  },
  firmware: {
    list: '/firmware',
    stats: '/firmware/stats',
    vulnerable: '/firmware/vulnerable',
    outdated: '/firmware/outdated',
    byId: (id: string) => `/firmware/${id}`,
    analyze: (id: string) => `/firmware/${id}/analyze`,
    virustotal: (id: string) => `/firmware/${id}/virustotal`
  },
  baselines: {
    list: '/baselines',
    stats: '/baselines/stats',
    anomalies: '/baselines/anomalies',
    byDevice: (deviceId: string) => `/baselines/device/${deviceId}`,
    byId: (id: string) => `/baselines/${id}`,
    analyze: (id: string) => `/baselines/${id}/analyze`
  },
  dashboard: {
    overview: '/dashboard/overview',
    riskScore: '/dashboard/risk-score',
    trends: '/dashboard/trends',
    activity: '/dashboard/activity',
    networkMap: '/dashboard/network-map',
    topRisks: '/dashboard/top-risks',
    compliance: '/dashboard/compliance'
  },
  integrations: {
    status: '/integrations/status',
    shodan: '/integrations/shodan',
    virustotal: '/integrations/virustotal',
    greynoise: '/integrations/greynoise',
    ai: '/integrations/ai/analyze'
  },
  ai: {
    chat: '/api/ai/chat',
    ws: '/ws/ai'
  }
};
