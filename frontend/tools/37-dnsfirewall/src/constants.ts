// DNSFirewall Constants

export const DNS_THREAT_CATEGORIES = [
  'malware',
  'phishing',
  'botnet',
  'spam',
  'tunneling',
  'amplification',
  'c2c', // Command and Control
  'ddos'
];

export const DNS_QUERY_TYPES = [
  'A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'PTR', 'NS', 'SOA'
];

export const THREAT_SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'blue' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'critical', label: 'Critical', color: 'red' }
];

export const DNS_RULE_ACTIONS = [
  { value: 'allow', label: 'Allow', color: 'green' },
  { value: 'block', label: 'Block', color: 'red' },
  { value: 'monitor', label: 'Monitor', color: 'blue' },
  { value: 'redirect', label: 'Redirect', color: 'yellow' }
];

export const DNS_RULE_CONDITIONS = [
  { field: 'domain', operators: ['equals', 'contains', 'regex'] },
  { field: 'queryType', operators: ['equals', 'in'] },
  { field: 'sourceIP', operators: ['equals', 'contains', 'regex', 'in'] },
  { field: 'reputation', operators: ['range', 'equals'] },
  { field: 'category', operators: ['equals', 'in'] }
];

export const THREAT_INTELLIGENCE_SOURCES = [
  'AbuseIPDB',
  'MalwareBazaar',
  'PhishTank',
  'URLhaus',
  'Spamhaus',
  'FireHOL',
  'AlienVault OTX',
  'ThreatFox'
];

export const DNS_ANALYTICS_TIME_RANGES = [
  { value: '1h', label: 'Last Hour' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' }
];

export const DNS_METRICS = [
  {
    key: 'totalQueries',
    label: 'Total Queries',
    format: 'number',
    color: 'blue'
  },
  {
    key: 'blockedQueries',
    label: 'Blocked Queries',
    format: 'number',
    color: 'red'
  },
  {
    key: 'maliciousQueries',
    label: 'Malicious Queries',
    format: 'number',
    color: 'orange'
  },
  {
    key: 'queriesPerSecond',
    label: 'Queries/sec',
    format: 'number',
    color: 'green'
  },
  {
    key: 'blockedPercentage',
    label: 'Block Rate',
    format: 'percentage',
    color: 'red'
  },
  {
    key: 'responseTime',
    label: 'Avg Response Time',
    format: 'duration',
    color: 'purple'
  }
];

export const ALERT_TYPES = [
  { value: 'threat', label: 'Threat Detection', icon: 'AlertTriangle' },
  { value: 'anomaly', label: 'Traffic Anomaly', icon: 'TrendingUp' },
  { value: 'policy', label: 'Policy Violation', icon: 'Shield' },
  { value: 'system', label: 'System Alert', icon: 'Settings' }
];

export const DEFAULT_DNS_SETTINGS = {
  monitoring: {
    enabled: true,
    realTimeUpdates: true,
    retentionDays: 90
  },
  security: {
    autoBlock: true,
    threatThreshold: 0.8,
    whitelistEnabled: true
  },
  alerting: {
    emailNotifications: true,
    alertThreshold: 'medium'
  }
};
- create_alert: Create fraud monitoring alerts
- export_report: Generate and export fraud reports

Always be thorough in your analysis and explain findings in clear, non-technical language.`,
  agentName: "FraudGuard AI",
  temperature: 0.7,
  maxTokens: 4096,
  provider: 'gemini',
  model: "gemini-2.5-flash-preview",
  activeTool: 'fraud_analysis',
  workspaceMode: 'CHAT',
  portalUrl: 'https://www.google.com/search?igu=1',
  canvas: {
    content: "// FraudGuard Workspace\n\nReady for fraud analysis.",
    type: 'text',
    title: 'FraudGuard_Canvas'
  }
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Fraud Analysis', icon: '🛡️', tool: 'fraud_analysis', description: 'Analyze transactions for fraud' },
  { label: 'Risk Dashboard', icon: '📊', tool: 'risk_visualization', description: 'View risk charts and graphs' },
  { label: 'Transaction History', icon: '📜', tool: 'transaction_history', description: 'Browse past transactions' },
  { label: 'Alerts', icon: '🔔', tool: 'alerts', description: 'Manage fraud alerts' },
  { label: 'Reports', icon: '📄', tool: 'reports', description: 'Generate fraud reports' },
  { label: 'Web Portal', icon: '🌐', tool: 'browser', description: 'Open web browser' },
  { label: 'Canvas', icon: '🖌️', tool: 'canvas', description: 'Collaborative workspace' },
  { label: 'Web Search', icon: '🔍', tool: 'web_search', description: 'Search the web' }
];

export const FRAUD_PRESETS: Record<string, { prompt: string; temp: number }> = {
  thorough: { 
    prompt: "Perform extremely detailed fraud analysis. Check every indicator, cross-reference patterns, and provide comprehensive risk assessment.", 
    temp: 0.3 
  },
  quick: { 
    prompt: "Perform quick fraud screening. Focus on major red flags and provide a rapid risk assessment.", 
    temp: 0.5 
  },
  educational: { 
    prompt: "Explain fraud analysis in educational terms. Help the user understand fraud patterns and detection methods.", 
    temp: 0.7 
  },
  investigative: { 
    prompt: "Take an investigative approach. Look for hidden patterns, connections, and potential fraud networks.", 
    temp: 0.4 
  }
};

export const RISK_COLORS = {
  low: '#00ff88',
  medium: '#ffaa00',
  high: '#ff0055'
};

export const API_ENDPOINTS = {
  fraudguard: {
    analyze: '/api/fraudguard/analyze',
    score: '/api/fraudguard/score',
    transactions: '/api/fraudguard/transactions',
    analytics: '/api/fraudguard/analytics',
    alerts: '/api/fraudguard/alerts',
    reports: '/api/fraudguard/reports'
  },
  ml: {
    predict: '/api/ml/predict',
    score: '/api/ml/score',
    train: '/api/ml/train'
  },
  ai: {
    chat: '/api/ai/chat',
    ws: '/ws/ai'
  }
};
