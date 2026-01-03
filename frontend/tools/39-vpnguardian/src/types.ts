// VPN Connection Types
export interface VPNConnection {
  connectionId: string;
  userId: string;
  username: string;
  vpnProvider: 'openvpn' | 'wireguard' | 'cisco' | 'paloalto' | 'fortinet' | 'checkpoint' | 'juniper' | 'microsoft' | 'aws' | 'azure' | 'gcp' | 'cloudflare' | 'nordvpn' | 'expressvpn' | 'other';
  connectionType: 'remote-access' | 'site-to-site' | 'client-to-site';
  status: 'connected' | 'disconnected' | 'connecting' | 'failed' | 'suspended';
  ipAddress?: string;
  publicIP?: string;
  location?: {
    country: string;
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  deviceInfo?: {
    os: string;
    browser: string;
    deviceType: string;
  };
  securityMetrics: {
    encryptionStrength: 'weak' | 'medium' | 'strong' | 'excellent';
    protocol: 'openvpn' | 'wireguard' | 'ikev2' | 'ipsec' | 'pptp' | 'sstp' | 'l2tp';
    certificateValid: boolean;
    lastHandshake?: Date;
    dataTransferred: {
      upload: number;
      download: number;
    };
  };
  sessionInfo: {
    connectedAt?: Date;
    disconnectedAt?: Date;
    duration?: number;
    bytesTransferred?: number;
  };
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  alerts: Array<{
    type: 'security' | 'performance' | 'connectivity';
    severity: 'info' | 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>;
  complianceStatus: {
    gdpr: boolean;
    hipaa: boolean;
    pci: boolean;
    sox: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// VPN Policy Types
export interface VPNPolicy {
  policyId: string;
  name: string;
  description?: string;
  vpnProvider: string;
  policyType: 'access-control' | 'security' | 'routing' | 'bandwidth' | 'time-based' | 'location-based';
  rules: Array<{
    ruleId: string;
    name: string;
    action: 'allow' | 'deny' | 'limit' | 'monitor';
    conditions: {
      sourceIP?: string[];
      destinationIP?: string[];
      ports?: number[];
      protocols?: string[];
      users?: string[];
      groups?: string[];
      timeRange?: {
        start: string;
        end: string;
        daysOfWeek?: number[];
      };
      locations?: Array<{
        country: string;
        city: string;
      }>;
      deviceTypes?: string[];
      applications?: string[];
    };
    priority: number;
    enabled: boolean;
  }>;
  securitySettings: {
    encryption: {
      algorithm: 'AES-128' | 'AES-256' | 'ChaCha20' | 'Blowfish';
      keySize: number;
    };
    authentication: {
      method: 'certificate' | 'username-password' | 'two-factor' | 'biometric';
      mfaRequired: boolean;
    };
    protocols: string[];
    certificateValidation: {
      required: boolean;
      crlCheck: boolean;
      ocspCheck: boolean;
    };
  };
  bandwidthLimits: {
    uploadLimit?: number;
    downloadLimit?: number;
    burstLimit?: number;
    throttlingEnabled: boolean;
  };
  monitoring: {
    loggingEnabled: boolean;
    alertOnViolation: boolean;
    sessionTimeout?: number;
    idleTimeout?: number;
  };
  compliance: {
    gdpr: boolean;
    hipaa: boolean;
    pci: boolean;
    sox: boolean;
    customFrameworks?: string[];
  };
  appliedTo: Array<{
    type: 'user' | 'group' | 'device' | 'location';
    id: string;
    name: string;
  }>;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastApplied?: Date;
}

// Security Alert Types
export interface VPNSecurityAlert {
  alertId: string;
  connectionId: string;
  userId: string;
  alertType: 'unauthorized-access' | 'suspicious-traffic' | 'weak-encryption' | 'certificate-expiry' | 'protocol-anomaly' | 'geographic-anomaly' | 'brute-force' | 'malware-detected' | 'data-leak' | 'policy-violation' | 'session-anomaly' | 'bandwidth-abuse';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  details: {
    sourceIP?: string;
    destinationIP?: string;
    protocol?: string;
    port?: number;
    userAgent?: string;
    location?: {
      country: string;
      city: string;
      coordinates: {
        latitude: number;
        longitude: number;
      };
    };
    deviceInfo?: {
      os: string;
      browser: string;
      deviceType: string;
    };
    threatIndicators?: string[];
    riskScore?: number;
    anomalyScore?: number;
  };
  status: 'new' | 'investigating' | 'resolved' | 'dismissed' | 'escalated';
  assignedTo?: string;
  resolution?: {
    action: 'block-connection' | 'disconnect-user' | 'update-policy' | 'monitor' | 'ignore' | 'escalate';
    notes?: string;
    resolvedBy?: string;
    resolvedAt?: Date;
  };
  integrations: {
    sentToSIEM: boolean;
    sentToSOAR: boolean;
    ticketCreated: boolean;
    ticketId?: string;
  };
  metadata: {
    vpnProvider?: string;
    connectionType?: string;
    sessionDuration?: number;
    dataTransferred?: number;
    encryptionStrength?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// User Management Types
export interface VPNUser {
  userId: string;
  username: string;
  email: string;
  fullName?: string;
  department?: string;
  role: 'admin' | 'user' | 'auditor' | 'readonly';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  authentication: {
    method: 'local' | 'ldap' | 'saml' | 'oauth' | 'certificate';
    passwordHash?: string;
    certificate?: {
      serialNumber: string;
      issuer: string;
      validFrom: Date;
      validTo: Date;
      fingerprint: string;
    };
    mfaEnabled: boolean;
    mfaMethod?: 'totp' | 'sms' | 'email' | 'hardware-token';
    lastLogin?: Date;
    failedLoginAttempts: number;
    accountLocked: boolean;
    lockoutUntil?: Date;
  };
  vpnAccess: {
    allowedProviders: string[];
    allowedLocations: Array<{
      country: string;
      city: string;
    }>;
    timeRestrictions: {
      allowedHours: {
        start: string;
        end: string;
      };
      allowedDays: number[];
      timezone?: string;
    };
    deviceRestrictions: {
      maxDevices: number;
      allowedDeviceTypes: string[];
      requireDeviceRegistration: boolean;
    };
    bandwidthLimits: {
      dailyLimit?: number;
      monthlyLimit?: number;
      throttlingEnabled: boolean;
    };
  };
  securityProfile: {
    riskScore: number;
    trustLevel: 'low' | 'medium' | 'high' | 'excellent';
    securityIncidents: number;
    lastSecurityReview?: Date;
    complianceStatus: {
      gdpr: boolean;
      hipaa: boolean;
      pci: boolean;
      sox: boolean;
    };
  };
  activityLog: Array<{
    action: 'login' | 'logout' | 'connection-established' | 'connection-terminated' | 'policy-applied' | 'alert-triggered';
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    location?: {
      country: string;
      city: string;
    };
    details?: any;
  }>;
  groups: Array<{
    groupId: string;
    groupName: string;
    role: string;
  }>;
  preferences: {
    notifications: {
      emailAlerts: boolean;
      securityAlerts: boolean;
      connectionAlerts: boolean;
      weeklyReports: boolean;
    };
    ui: {
      theme: 'light' | 'dark';
      language: string;
      timezone?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  lastActive?: Date;
}

// Connection Metrics Types
export interface ConnectionMetrics {
  connectionId: string;
  status: string;
  metrics: {
    latency: number;
    bandwidth: {
      upload: number;
      download: number;
    };
    packetLoss: number;
    uptime: number;
  };
  security: {
    encryptionStrength: string;
    threatLevel: string;
  };
}

// Dashboard Types
export interface VPNDashboardData {
  totalConnections: number;
  activeConnections: number;
  totalUsers: number;
  securityAlerts: number;
  criticalAlerts: number;
  bandwidthUsage: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  topLocations: Array<{
    country: string;
    connections: number;
  }>;
  recentAlerts: VPNSecurityAlert[];
  connectionTrends: Array<{
    date: string;
    connections: number;
  }>;
}

// UI State Types
export type TabType = 'dashboard' | 'connections' | 'policies' | 'alerts' | 'users' | 'analytics';
export type ViewMode = 'grid' | 'list' | 'table';

export interface VPNState {
  activeTab: TabType;
  viewMode: ViewMode;
  selectedConnection?: string;
  filters: {
    status?: string[];
    provider?: string[];
    severity?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  searchQuery: string;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Legacy types for backward compatibility (keeping minimal set)
export type Sender = 'YOU' | 'AGENT' | 'SYSTEM';

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: string;
  isImage?: boolean;
  groundingUrls?: string[];
  functionCall?: FunctionCallResult;
}

export interface FunctionCallResult {
  name: string;
  args: Record<string, any>;
  result?: any;
}

export interface ChatSession {
  id: string;
  name: string;
  active: boolean;
  messages: Message[];
  settings: SettingsState;
}

export type NeuralTool =
  | 'none'
  | 'fraud_analysis'
  | 'risk_visualization'
  | 'transaction_history'
  | 'alerts'
  | 'reports'
  | 'web_search'
  | 'canvas'
  | 'browser';

export type WorkspaceMode = 'CHAT' | 'PORTAL' | 'CANVAS' | 'VPN_DASHBOARD';

export interface CanvasState {
  content: string;
  type: 'text' | 'code' | 'html' | 'video' | 'image' | 'chart';
  language?: string;
  title: string;
}

export interface SettingsState {
  customPrompt: string;
  agentName: string;
  temperature: number;
  maxTokens: number;
  provider: string;
  model: string;
  activeTool: NeuralTool;
  workspaceMode: WorkspaceMode;
  portalUrl: string;
  canvas: CanvasState;
}

export interface NavItem {
  label: string;
  icon: string;
  tool: NeuralTool;
  description: string;
}

// FraudGuard Specific Types
export interface Transaction {
  id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  user_ip?: string;
  device_fingerprint?: string;
  email?: string;
  card_last4?: string;
  merchant_id?: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'declined' | 'flagged';
  fraud_score?: number;
  risk_level?: 'low' | 'medium' | 'high';
}

export interface FraudScore {
  transaction_id: string;
  score: number;
  risk_level: 'low' | 'medium' | 'high';
  confidence: number;
  indicators: FraudIndicator[];
  recommendation: string;
  ml_model_version: string;
  analyzed_at: string;
}

export interface FraudIndicator {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  weight: number;
}

export interface Alert {
  id: string;
  alert_type: 'high_risk_transaction' | 'suspicious_pattern' | 'velocity_breach' | 'unusual_location';
  threshold: number;
  notification_channels: ('email' | 'webhook' | 'sms' | 'slack')[];
  active: boolean;
  created_at: string;
  triggered_count: number;
}

export interface AnalyticsData {
  total_transactions: number;
  flagged_transactions: number;
  average_fraud_score: number;
  high_risk_percentage: number;
  transactions_by_day: { date: string; count: number; flagged: number }[];
  risk_distribution: { level: string; count: number }[];
  top_fraud_indicators: { indicator: string; count: number }[];
}

export interface Tab {
  id: string;
  type: 'chat' | 'web' | 'code' | 'chart' | 'transaction' | 'report';
  title: string;
  content: any;
  status: 'loading' | 'active' | 'complete' | 'error';
  aiGenerated: boolean;
}
