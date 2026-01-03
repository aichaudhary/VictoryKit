import { SettingsState, NavItem } from './types';

export const VPN_PROVIDERS = [
  { id: 'openvpn', name: 'OpenVPN', color: '#FF6B35', icon: '🔒' },
  { id: 'wireguard', name: 'WireGuard', color: '#4ECDC4', icon: '⚡' },
  { id: 'cisco', name: 'Cisco AnyConnect', color: '#1E3A8A', icon: '🌐' },
  { id: 'paloalto', name: 'Palo Alto GlobalProtect', color: '#DC2626', icon: '🛡️' },
  { id: 'fortinet', name: 'Fortinet FortiClient', color: '#059669', icon: '🏰' },
  { id: 'checkpoint', name: 'Check Point Endpoint Security', color: '#7C3AED', icon: '✅' },
  { id: 'juniper', name: 'Juniper Pulse Secure', color: '#EA580C', icon: '🌿' },
  { id: 'microsoft', name: 'Microsoft Always On VPN', color: '#2563EB', icon: '🪟' },
  { id: 'aws', name: 'AWS Client VPN', color: '#FF9900', icon: '☁️' },
  { id: 'azure', name: 'Azure Point-to-Site VPN', color: '#0078D4', icon: '☁️' },
  { id: 'gcp', name: 'Google Cloud VPN', color: '#4285F4', icon: '☁️' },
  { id: 'cloudflare', name: 'Cloudflare WARP', color: '#F59E0B', icon: '⚡' },
  { id: 'nordvpn', name: 'NordVPN', color: '#4F46E5', icon: '🛡️' },
  { id: 'expressvpn', name: 'ExpressVPN', color: '#10B981', icon: '🚀' },
  { id: 'other', name: 'Other', color: '#6B7280', icon: '🔧' }
];

export const CONNECTION_STATUSES = [
  { id: 'connected', label: 'Connected', color: '#10B981', icon: '🟢' },
  { id: 'connecting', label: 'Connecting', color: '#F59E0B', icon: '🟡' },
  { id: 'disconnected', label: 'Disconnected', color: '#6B7280', icon: '⚪' },
  { id: 'failed', label: 'Failed', color: '#EF4444', icon: '🔴' },
  { id: 'suspended', label: 'Suspended', color: '#F97316', icon: '🟠' }
];

export const THREAT_LEVELS = [
  { id: 'low', label: 'Low', color: '#10B981', bgColor: '#D1FAE5' },
  { id: 'medium', label: 'Medium', color: '#F59E0B', bgColor: '#FEF3C7' },
  { id: 'high', label: 'High', color: '#F97316', bgColor: '#FED7AA' },
  { id: 'critical', label: 'Critical', color: '#EF4444', bgColor: '#FECACA' }
];

export const ALERT_TYPES = [
  { id: 'unauthorized-access', label: 'Unauthorized Access', severity: 'high' },
  { id: 'suspicious-traffic', label: 'Suspicious Traffic', severity: 'medium' },
  { id: 'weak-encryption', label: 'Weak Encryption', severity: 'high' },
  { id: 'certificate-expiry', label: 'Certificate Expiry', severity: 'medium' },
  { id: 'protocol-anomaly', label: 'Protocol Anomaly', severity: 'high' },
  { id: 'geographic-anomaly', label: 'Geographic Anomaly', severity: 'medium' },
  { id: 'brute-force', label: 'Brute Force Attack', severity: 'critical' },
  { id: 'malware-detected', label: 'Malware Detected', severity: 'critical' },
  { id: 'data-leak', label: 'Data Leak', severity: 'critical' },
  { id: 'policy-violation', label: 'Policy Violation', severity: 'medium' },
  { id: 'session-anomaly', label: 'Session Anomaly', severity: 'low' },
  { id: 'bandwidth-abuse', label: 'Bandwidth Abuse', severity: 'low' }
];

export const PROTOCOLS = [
  { id: 'wireguard', label: 'WireGuard', security: 'excellent' },
  { id: 'ikev2', label: 'IKEv2/IPsec', security: 'excellent' },
  { id: 'ipsec', label: 'IPsec', security: 'strong' },
  { id: 'openvpn', label: 'OpenVPN', security: 'strong' },
  { id: 'pptp', label: 'PPTP', security: 'weak' },
  { id: 'sstp', label: 'SSTP', security: 'medium' },
  { id: 'l2tp', label: 'L2TP/IPsec', security: 'medium' }
];

export const ENCRYPTION_STRENGTHS = [
  { id: 'weak', label: 'Weak', color: '#EF4444' },
  { id: 'medium', label: 'Medium', color: '#F59E0B' },
  { id: 'strong', label: 'Strong', color: '#10B981' },
  { id: 'excellent', label: 'Excellent', color: '#059669' }
];

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { id: 'connections', label: 'Connections', icon: '🔗', path: '/connections' },
  { id: 'policies', label: 'Policies', icon: '📋', path: '/policies' },
  { id: 'alerts', label: 'Security Alerts', icon: '🚨', path: '/alerts' },
  { id: 'users', label: 'Users', icon: '👥', path: '/users' },
  { id: 'analytics', label: 'Analytics', icon: '📈', path: '/analytics' }
];

export const DASHBOARD_METRICS = [
  {
    id: 'total-connections',
    label: 'Total Connections',
    icon: '🔗',
    color: 'blue',
    format: 'number'
  },
  {
    id: 'active-connections',
    label: 'Active Connections',
    icon: '🟢',
    color: 'green',
    format: 'number'
  },
  {
    id: 'security-alerts',
    label: 'Security Alerts',
    icon: '🚨',
    color: 'red',
    format: 'number'
  },
  {
    id: 'bandwidth-usage',
    label: 'Bandwidth Usage',
    icon: '📊',
    color: 'purple',
    format: 'data'
  }
];

export const DEFAULT_SETTINGS: SettingsState = {
  customPrompt: `You are VPNGuardian AI, an expert in VPN security, network protection, and threat detection with deep knowledge of cybersecurity, encryption protocols, and secure remote access.

CAPABILITIES:
- Monitor VPN connections and detect security threats
- Analyze connection patterns and identify anomalies
- Provide security recommendations and policy suggestions
- Generate VPN security reports and compliance documentation
- Alert on suspicious activities and potential breaches

AVAILABLE FUNCTIONS:
- monitor_connections: Monitor active VPN connections
- analyze_security: Analyze connection security metrics
- detect_threats: Detect potential security threats
- generate_reports: Generate security and compliance reports
- manage_policies: Create and manage VPN security policies`,
  agentName: 'VPNGuardian AI',
  temperature: 0.7
};

export const API_ENDPOINTS = {
  base: '/api/v1/vpnguardian',
  status: '/status',
  connections: '/connections',
  policies: '/policies',
  alerts: '/alerts',
  users: '/users',
  analytics: '/analytics'
};

export const POLL_INTERVALS = {
  connections: 30000, // 30 seconds
  alerts: 15000, // 15 seconds
  metrics: 60000 // 1 minute
};

export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#6B7280',
  success: '#059669'
};

export const COMPLIANCE_FRAMEWORKS = [
  { id: 'gdpr', label: 'GDPR', description: 'General Data Protection Regulation' },
  { id: 'hipaa', label: 'HIPAA', description: 'Health Insurance Portability and Accountability Act' },
  { id: 'pci', label: 'PCI DSS', description: 'Payment Card Industry Data Security Standard' },
  { id: 'sox', label: 'SOX', description: 'Sarbanes-Oxley Act' },
  { id: 'nist', label: 'NIST', description: 'National Institute of Standards and Technology' },
  { id: 'iso27001', label: 'ISO 27001', description: 'Information Security Management Systems' }
];

export const TIME_RANGES = [
  { id: '1h', label: 'Last Hour', value: 60 * 60 * 1000 },
  { id: '24h', label: 'Last 24 Hours', value: 24 * 60 * 60 * 1000 },
  { id: '7d', label: 'Last 7 Days', value: 7 * 24 * 60 * 60 * 1000 },
  { id: '30d', label: 'Last 30 Days', value: 30 * 24 * 60 * 60 * 1000 },
  { id: '90d', label: 'Last 90 Days', value: 90 * 24 * 60 * 60 * 1000 }
];

export const EXPORT_FORMATS = [
  { id: 'pdf', label: 'PDF Report', icon: '📄' },
  { id: 'csv', label: 'CSV Data', icon: '📊' },
  { id: 'json', label: 'JSON Export', icon: '🔧' },
  { id: 'xml', label: 'XML Export', icon: '📋' }
];
