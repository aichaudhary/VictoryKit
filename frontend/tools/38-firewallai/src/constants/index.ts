// FirewallAI Constants and Configuration

export const FIREWALL_VENDORS = {
  PFSENSE: 'pfsense',
  PALO_ALTO: 'palo_alto',
  FORTINET: 'fortinet',
  CHECKPOINT: 'checkpoint',
  CISCO_ASA: 'cisco_asa',
  AWS_FIREWALL: 'aws_firewall',
  AZURE_FIREWALL: 'azure_firewall',
  GCP_ARMOR: 'gcp_armor',
  CLOUDFLARE: 'cloudflare',
  AKAMAI: 'akamai',
} as const;

export const VENDOR_DISPLAY_NAMES = {
  [FIREWALL_VENDORS.PFSENSE]: 'pfSense',
  [FIREWALL_VENDORS.PALO_ALTO]: 'Palo Alto Networks',
  [FIREWALL_VENDORS.FORTINET]: 'Fortinet',
  [FIREWALL_VENDORS.CHECKPOINT]: 'Check Point',
  [FIREWALL_VENDORS.CISCO_ASA]: 'Cisco ASA',
  [FIREWALL_VENDORS.AWS_FIREWALL]: 'AWS Network Firewall',
  [FIREWALL_VENDORS.AZURE_FIREWALL]: 'Azure Firewall',
  [FIREWALL_VENDORS.GCP_ARMOR]: 'Google Cloud Armor',
  [FIREWALL_VENDORS.CLOUDFLARE]: 'Cloudflare WAF',
  [FIREWALL_VENDORS.AKAMAI]: 'Akamai Kona Site Defender',
} as const;

export const VENDOR_CONFIG = {
  [FIREWALL_VENDORS.PFSENSE]: { name: 'pfSense' },
  [FIREWALL_VENDORS.PALO_ALTO]: { name: 'Palo Alto Networks' },
  [FIREWALL_VENDORS.FORTINET]: { name: 'Fortinet' },
  [FIREWALL_VENDORS.CHECKPOINT]: { name: 'Check Point' },
  [FIREWALL_VENDORS.CISCO_ASA]: { name: 'Cisco ASA' },
  [FIREWALL_VENDORS.AWS_FIREWALL]: { name: 'AWS Network Firewall' },
  [FIREWALL_VENDORS.AZURE_FIREWALL]: { name: 'Azure Firewall' },
  [FIREWALL_VENDORS.GCP_ARMOR]: { name: 'Google Cloud Armor' },
  [FIREWALL_VENDORS.CLOUDFLARE]: { name: 'Cloudflare WAF' },
  [FIREWALL_VENDORS.AKAMAI]: { name: 'Akamai Kona Site Defender' },
} as const;

export const RULE_ACTIONS = {
  ALLOW: 'allow',
  DENY: 'deny',
  REJECT: 'reject',
} as const;

export const PROTOCOLS = {
  TCP: 'tcp',
  UDP: 'udp',
  ICMP: 'icmp',
  ANY: 'any',
} as const;

export const ALERT_SEVERITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const ALERT_STATUSES = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  ACKNOWLEDGED: 'acknowledged',
} as const;

export const ALERT_TYPES = {
  INTRUSION: 'intrusion',
  ANOMALY: 'anomaly',
  POLICY_VIOLATION: 'policy_violation',
  COMPLIANCE: 'compliance',
  PERFORMANCE: 'performance',
} as const;

export const POLICY_TYPES = {
  ACCESS_CONTROL: 'access_control',
  THREAT_RESPONSE: 'threat_response',
  COMPLIANCE: 'compliance',
  TRAFFIC_SHAPING: 'traffic_shaping',
  INTRUSION_PREVENTION: 'intrusion_prevention',
} as const;

export const THREAT_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const COMPLIANCE_FRAMEWORKS = {
  PCI_DSS: 'PCI DSS',
  HIPAA: 'HIPAA',
  SOC2: 'SOC 2',
  GDPR: 'GDPR',
  NIST: 'NIST',
  ISO_27001: 'ISO 27001',
} as const;

export const TIME_RANGES = {
  LAST_5_MINUTES: '5m',
  LAST_15_MINUTES: '15m',
  LAST_HOUR: '1h',
  LAST_6_HOURS: '6h',
  LAST_24_HOURS: '24h',
  LAST_7_DAYS: '7d',
  LAST_30_DAYS: '30d',
} as const;

export const REFRESH_INTERVALS = {
  OFF: 0,
  SECONDS_5: 5000,
  SECONDS_10: 10000,
  SECONDS_30: 30000,
  MINUTE_1: 60000,
  MINUTE_5: 300000,
} as const;

export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#06b6d4',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#8b5cf6',
  TRAFFIC_INBOUND: '#3b82f6',
  TRAFFIC_OUTBOUND: '#10b981',
  TRAFFIC_BLOCKED: '#ef4444',
  ALERT_LOW: '#8b5cf6',
  ALERT_MEDIUM: '#f59e0b',
  ALERT_HIGH: '#ef4444',
  ALERT_CRITICAL: '#dc2626',
} as const;

export const DEFAULT_CONFIG = {
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:4000',
  THEME: 'dark' as const,
  TIMEZONE: Intl.DateTimeFormat().resolvedOptions().timeZone,
  DATE_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  REFRESH_INTERVAL: REFRESH_INTERVALS.SECONDS_30,
  MAX_LOGS_DISPLAY: 1000,
  ALERT_SOUND_ENABLED: true,
  AUTO_REFRESH_ENABLED: true,
  ML_ENABLED: true,
  COMPLIANCE_FRAMEWORKS: [COMPLIANCE_FRAMEWORKS.PCI_DSS, COMPLIANCE_FRAMEWORKS.HIPAA],
} as const;

export const API_ENDPOINTS = {
  RULES: '/api/rules',
  TRAFFIC: '/api/traffic',
  ALERTS: '/api/alerts',
  VENDORS: '/api/vendors',
  POLICIES: '/api/policies',
  THREATS: '/api/threats',
  DASHBOARD: '/api/dashboard',
  SYSTEM: '/api/system',
  CONFIG: '/api/config',
  AUDIT: '/api/audit',
  COMPLIANCE: '/api/compliance',
  BACKUP: '/api/backup',
  CHAT: '/api/chat',
  REALTIME: '/api/realtime',
} as const;

export const WS_EVENTS = {
  TRAFFIC_UPDATE: 'traffic_update',
  ALERT_NEW: 'alert_new',
  ALERT_UPDATE: 'alert_update',
  RULE_CHANGE: 'rule_change',
  SYSTEM_HEALTH: 'system_health',
  THREAT_DETECTED: 'threat_detected',
} as const;

export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  CRITICAL: 'critical',
} as const;

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SLACK: 'slack',
  TEAMS: 'teams',
  WEBHOOK: 'webhook',
  SMS: 'sms',
  PAGERDUTY: 'pagerduty',
} as const;

export const AUTOMATION_ACTIONS = {
  BLOCK_IP: 'block_ip',
  ALERT_TEAM: 'alert_team',
  QUARANTINE: 'quarantine',
  LOG_EVENT: 'log_event',
  ESCALATE: 'escalate',
  RUN_PLAYBOOK: 'run_playbook',
} as const;

export const THREAT_CATEGORIES = {
  MALWARE: 'malware',
  PHISHING: 'phishing',
  DDOS: 'ddos',
  BRUTE_FORCE: 'brute_force',
  SQL_INJECTION: 'sql_injection',
  XSS: 'xss',
  CSRF: 'csrf',
  RCE: 'rce',
  LFI: 'lfi',
  RFI: 'rfi',
  OTHER: 'other',
} as const;

export const GEO_REGIONS = {
  NORTH_AMERICA: 'North America',
  SOUTH_AMERICA: 'South America',
  EUROPE: 'Europe',
  ASIA: 'Asia',
  AFRICA: 'Africa',
  OCEANIA: 'Oceania',
  ANTARCTICA: 'Antarctica',
} as const;

export const SYSTEM_COMPONENTS = {
  DATABASE: 'database',
  API: 'api',
  MONITORING: 'monitoring',
  ML_ENGINE: 'ml_engine',
  INTEGRATIONS: 'integrations',
} as const;

export const COMPONENT_STATUS = {
  HEALTHY: 'healthy',
  WARNING: 'warning',
  CRITICAL: 'critical',
  OFFLINE: 'offline',
} as const;

export const BACKUP_TYPES = {
  FULL: 'full',
  INCREMENTAL: 'incremental',
  CONFIG_ONLY: 'config_only',
} as const;

export const BACKUP_STATUS = {
  COMPLETED: 'completed',
  FAILED: 'failed',
  IN_PROGRESS: 'in_progress',
} as const;

export const VALIDATION_RULES = {
  IP_ADDRESS: /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/,
  CIDR: /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}\/(3[0-2]|[1-2]\d|\d)$/,
  DOMAIN: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PORT: /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
} as const;

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 1000,
} as const;

export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
  PDF: 'pdf',
  XML: 'xml',
} as const;

export const FILTER_OPERATORS = {
  EQUALS: 'eq',
  NOT_EQUALS: 'ne',
  GREATER_THAN: 'gt',
  LESS_THAN: 'lt',
  GREATER_EQUAL: 'gte',
  LESS_EQUAL: 'lte',
  IN: 'in',
  NOT_IN: 'nin',
  CONTAINS: 'contains',
  REGEX: 'regex',
} as const;

export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

// Utility functions for constants
export const getVendorDisplayName = (vendor: string): string => {
  return VENDOR_DISPLAY_NAMES[vendor as keyof typeof VENDOR_DISPLAY_NAMES] || vendor;
};

export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case ALERT_SEVERITIES.LOW:
      return CHART_COLORS.ALERT_LOW;
    case ALERT_SEVERITIES.MEDIUM:
      return CHART_COLORS.ALERT_MEDIUM;
    case ALERT_SEVERITIES.HIGH:
      return CHART_COLORS.ALERT_HIGH;
    case ALERT_SEVERITIES.CRITICAL:
      return CHART_COLORS.ALERT_CRITICAL;
    default:
      return CHART_COLORS.INFO;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case ALERT_STATUSES.ACTIVE:
      return CHART_COLORS.ERROR;
    case ALERT_STATUSES.RESOLVED:
      return CHART_COLORS.SUCCESS;
    case ALERT_STATUSES.ACKNOWLEDGED:
      return CHART_COLORS.WARNING;
    default:
      return CHART_COLORS.INFO;
  }
};

export const formatTimeRange = (range: string): string => {
  switch (range) {
    case TIME_RANGES.LAST_5_MINUTES:
      return 'Last 5 minutes';
    case TIME_RANGES.LAST_15_MINUTES:
      return 'Last 15 minutes';
    case TIME_RANGES.LAST_HOUR:
      return 'Last hour';
    case TIME_RANGES.LAST_6_HOURS:
      return 'Last 6 hours';
    case TIME_RANGES.LAST_24_HOURS:
      return 'Last 24 hours';
    case TIME_RANGES.LAST_7_DAYS:
      return 'Last 7 days';
    case TIME_RANGES.LAST_30_DAYS:
      return 'Last 30 days';
    default:
      return range;
  }
};