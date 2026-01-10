// WirelessHunter Constants - Enterprise Wireless Network Security Monitoring

import { SettingsState, NavItem } from './types';

export const DEFAULT_SETTINGS: SettingsState = {
  customPrompt: 'You are WirelessHunter, an AI-powered wireless network security monitoring assistant. Help users detect rogue access points, analyze signal quality, identify threats, and manage wireless security.',
  agentName: 'WirelessHunter AI',
  temperature: 0.7,
  maxTokens: 4096,
  provider: 'openai',
  model: 'gpt-4',
  activeTool: 'network_monitor',
  workspaceMode: 'WIRELESS_DASHBOARD',
  portalUrl: '',
  canvas: {
    content: '',
    type: 'text',
    title: 'Wireless Analysis Canvas'
  }
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    tool: 'network_monitor',
    description: 'Wireless network overview and health metrics'
  },
  {
    label: 'Access Points',
    icon: 'Radio',
    tool: 'access_points',
    description: 'Manage and monitor access points'
  },
  {
    label: 'Clients',
    icon: 'Laptop',
    tool: 'clients',
    description: 'Connected devices and client management'
  },
  {
    label: 'Security Alerts',
    icon: 'ShieldAlert',
    tool: 'security_alerts',
    description: 'Security incidents and threat alerts'
  },
  {
    label: 'Threat Detection',
    icon: 'Radar',
    tool: 'threat_detection',
    description: 'Rogue AP and evil twin detection'
  },
  {
    label: 'Signal Analysis',
    icon: 'Activity',
    tool: 'signal_analysis',
    description: 'RF analysis and interference detection'
  },
  {
    label: 'Reports',
    icon: 'FileText',
    tool: 'reports',
    description: 'Compliance reports and analytics'
  },
  {
    label: 'Settings',
    icon: 'Settings',
    tool: 'settings',
    description: 'Configure monitoring preferences'
  }
];

export const PROVIDER_CONFIG = {
  openai: {
    name: 'OpenAI GPT-4',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
  },
  anthropic: {
    name: 'Anthropic Claude',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
  },
  azure: {
    name: 'Azure OpenAI',
    models: ['gpt-4', 'gpt-35-turbo']
  }
};

export const ALERT_TYPES = {
  'rogue-access-point': {
    label: 'Rogue Access Point',
    color: 'red',
    icon: 'Radio'
  },
  'evil-twin-attack': {
    label: 'Evil Twin Attack',
    color: 'red',
    icon: 'Copy'
  },
  'deauth-flood': {
    label: 'Deauthentication Flood',
    color: 'orange',
    icon: 'Zap'
  },
  'weak-encryption': {
    label: 'Weak Encryption',
    color: 'yellow',
    icon: 'Unlock'
  },
  'mac-spoofing': {
    label: 'MAC Spoofing',
    color: 'orange',
    icon: 'UserX'
  },
  'signal-jamming': {
    label: 'Signal Jamming',
    color: 'red',
    icon: 'WifiOff'
  },
  'channel-interference': {
    label: 'Channel Interference',
    color: 'yellow',
    icon: 'Radio'
  },
  'unauthorized-client': {
    label: 'Unauthorized Client',
    color: 'orange',
    icon: 'UserMinus'
  },
  'probe-request-flood': {
    label: 'Probe Request Flood',
    color: 'yellow',
    icon: 'Search'
  },
  'beacon-manipulation': {
    label: 'Beacon Manipulation',
    color: 'red',
    icon: 'AlertTriangle'
  }
};

export const SEVERITY_COLORS = {
  info: 'blue',
  low: 'green',
  medium: 'yellow',
  high: 'orange',
  critical: 'red'
};

export const STATUS_COLORS = {
  online: 'green',
  offline: 'red',
  degraded: 'yellow',
  maintenance: 'blue',
  active: 'green',
  inactive: 'gray',
  quarantined: 'red',
  connected: 'green',
  disconnected: 'gray',
  roaming: 'blue',
  blocked: 'red'
};

export const DEVICE_ICONS: Record<string, string> = {
  laptop: 'Laptop',
  smartphone: 'Smartphone',
  tablet: 'Tablet',
  iot: 'Cpu',
  printer: 'Printer',
  unknown: 'HelpCircle'
};

export const ENCRYPTION_STRENGTH = {
  'WPA3-Enterprise': { level: 'excellent', score: 100 },
  'WPA3-Personal': { level: 'excellent', score: 95 },
  'WPA2-Enterprise': { level: 'good', score: 85 },
  'WPA2-Personal': { level: 'acceptable', score: 70 },
  'WPA': { level: 'weak', score: 40 },
  'WEP': { level: 'vulnerable', score: 15 },
  'Open': { level: 'none', score: 0 }
};

export const WIFI_PROVIDERS = [
  { id: 'meraki', name: 'Cisco Meraki', icon: '🌐' },
  { id: 'aruba', name: 'Aruba Networks', icon: '📡' },
  { id: 'unifi', name: 'Ubiquiti UniFi', icon: '📶' },
  { id: 'ruckus', name: 'Ruckus Wireless', icon: '🔌' },
  { id: 'mist', name: 'Juniper Mist', icon: '☁️' },
  { id: 'fortinet', name: 'Fortinet FortiAP', icon: '🛡️' },
  { id: 'extreme', name: 'Extreme Networks', icon: '🌍' }
];

export const FREQUENCY_BANDS = [
  { value: '2.4GHz', label: '2.4 GHz', channels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  { value: '5GHz', label: '5 GHz', channels: [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 144, 149, 153, 157, 161, 165] },
  { value: '6GHz', label: '6 GHz', channels: [1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61, 65, 69, 73, 77, 81, 85, 89, 93] }
];

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4040/api/v1/wirelesshunter';
