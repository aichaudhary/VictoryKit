// WAF Instance Types
export interface WAFInstance {
  _id: string;
  name: string;
  provider: 'aws' | 'cloudflare' | 'akamai' | 'f5' | 'imperva' | 'azure' | 'gcp' | 'fastly' | 'sucuri';
  status: 'active' | 'inactive' | 'error' | 'syncing';
  endpoint: string;
  region?: string;
  resourceId?: string;
  config: {
    mode: 'blocking' | 'monitoring' | 'learning';
    ruleGroups: string[];
    customRules: string[];
    ipWhitelist: string[];
    ipBlacklist: string[];
  };
  stats: {
    totalRequests: number;
    blockedRequests: number;
    allowedRequests: number;
    challengedRequests: number;
    lastSyncedAt: Date;
  };
  healthCheck: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    lastCheckedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// WAF Rule Types
export interface WAFRule {
  _id: string;
  name: string;
  description: string;
  ruleId: string;
  category: 'sqli' | 'xss' | 'rce' | 'lfi' | 'rfi' | 'csrf' | 'custom' | 'bot' | 'scanner' | 'protocol';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  action: 'block' | 'allow' | 'challenge' | 'log' | 'redirect';
  enabled: boolean;
  pattern: {
    type: 'regex' | 'exact' | 'contains' | 'startswith' | 'endswith';
    value: string;
    target: 'uri' | 'header' | 'body' | 'query' | 'cookie' | 'method' | 'ip';
    field?: string;
  };
  conditions: RuleCondition[];
  rateLimit?: {
    enabled: boolean;
    requests: number;
    period: number; // seconds
    action: 'block' | 'challenge' | 'throttle';
  };
  mlScore?: number;
  hitCount: number;
  lastTriggeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleCondition {
  field: string;
  operator: 'eq' | 'neq' | 'contains' | 'not_contains' | 'regex' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in';
  value: string | number | string[];
  negate?: boolean;
}

// Policy Types
export interface WAFPolicy {
  _id: string;
  name: string;
  description: string;
  template: 'owasp_top_10' | 'api_protection' | 'bot_mitigation' | 'ddos_protection' | 'custom';
  enabled: boolean;
  priority: number;
  rules: string[];
  ruleGroups: string[];
  schedule?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    days: string[];
    timezone: string;
  };
  customResponse?: {
    enabled: boolean;
    statusCode: number;
    body: string;
    headers: Record<string, string>;
  };
  geoBlocking?: {
    enabled: boolean;
    mode: 'allow' | 'block';
    countries: string[];
  };
  appliedInstances: string[];
  stats: {
    triggeredCount: number;
    blockedCount: number;
    lastTriggeredAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Attack Log Types
export interface AttackLog {
  _id: string;
  timestamp: Date;
  instanceId: string;
  instanceName: string;
  ruleId: string;
  ruleName: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  action: 'blocked' | 'allowed' | 'challenged' | 'logged';
  request: {
    method: string;
    uri: string;
    host: string;
    userAgent: string;
    contentType?: string;
    protocol: string;
  };
  source: {
    ip: string;
    country: string;
    city?: string;
    asn?: string;
    isp?: string;
    isTor: boolean;
    isProxy: boolean;
    isVpn: boolean;
  };
  threat: {
    type: string;
    payload?: string;
    matchedPattern?: string;
    confidence: number;
    aiAnalysis?: string;
  };
  response: {
    statusCode: number;
    blocked: boolean;
    challengeRequired?: boolean;
  };
}

// Traffic Stats Types
export interface TrafficStats {
  timestamp: Date;
  totalRequests: number;
  blockedRequests: number;
  allowedRequests: number;
  challengedRequests: number;
  avgLatency: number;
  peakRps: number;
  byCategory: Record<string, number>;
  byCountry: Record<string, number>;
  bySeverity: Record<string, number>;
  byAction: Record<string, number>;
}

// Threat Intelligence Types
export interface ThreatIndicator {
  _id: string;
  type: 'ip' | 'domain' | 'url' | 'hash' | 'pattern';
  value: string;
  threatType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  sources: string[];
  firstSeen: Date;
  lastSeen: Date;
  tags: string[];
  isActive: boolean;
}

// Dashboard Metrics
export interface DashboardMetrics {
  overview: {
    totalInstances: number;
    activeInstances: number;
    totalRules: number;
    enabledRules: number;
    activePolicies: number;
  };
  traffic: {
    totalRequests: number;
    blockedRequests: number;
    allowedRequests: number;
    blockRate: number;
    avgLatency: number;
  };
  threats: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    topCategories: { category: string; count: number }[];
    topCountries: { country: string; count: number }[];
  };
  recentAttacks: AttackLog[];
  trafficTrend: { timestamp: string; requests: number; blocked: number }[];
}

// Real-time Events
export interface RealTimeEvent {
  id: string;
  type: 'attack' | 'rule_trigger' | 'rate_limit' | 'geo_block' | 'bot_detect';
  timestamp: Date;
  instanceId: string;
  data: Partial<AttackLog>;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Filter Types
export interface AttackLogFilters {
  startDate?: Date;
  endDate?: Date;
  instanceId?: string;
  severity?: string[];
  category?: string[];
  action?: string[];
  country?: string;
  ip?: string;
  search?: string;
}

export interface RuleFilters {
  category?: string[];
  severity?: string[];
  enabled?: boolean;
  action?: string[];
  search?: string;
}

// Provider Configuration Types
export interface ProviderConfig {
  provider: string;
  displayName: string;
  icon: string;
  color: string;
  fields: ProviderField[];
}

export interface ProviderField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'multiselect';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}
