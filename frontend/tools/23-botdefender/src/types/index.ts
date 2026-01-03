// Bot Types
export type BotClassification = 'good' | 'bad' | 'unknown' | 'suspicious';

export type BotCategory = 
  | 'search_engine'
  | 'social_media'
  | 'monitoring'
  | 'scraper'
  | 'credential_stuffer'
  | 'card_cracker'
  | 'spam'
  | 'scanner'
  | 'api_abuser'
  | 'click_fraud'
  | 'crawler'
  | 'credential_stuffing'
  | 'custom';

export type DetectionMethod = 
  | 'behavioral'
  | 'fingerprint'
  | 'reputation'
  | 'ml_model'
  | 'rule'
  | 'challenge_failed'
  | 'manual'
  | 'rate_limit'
  | 'ip_reputation';

export type BotAction = 'allow' | 'challenge' | 'rate_limit' | 'block' | 'monitor';

export interface Bot {
  _id: string;
  botId?: string;
  name?: string;
  // Simple flat properties for UI
  ipAddress: string;
  userAgent?: string;
  botScore: number;
  type?: BotCategory;
  category?: string;
  country?: string;
  requestCount?: number;
  blockedCount?: number;
  status?: 'active' | 'blocked' | 'allowed' | 'monitoring';
  firstSeen?: string;
  lastSeen?: string;
  isBlocked?: boolean;
  // Simple classification as string for easy display
  classification: BotClassification;
  // Detection method as simple string
  detectionMethod?: DetectionMethod | string;
  // Action as simple string or nested object
  action?: BotAction | {
    current: BotAction;
    history?: Array<{
      action: BotAction;
      reason?: string;
      timestamp: string;
      performedBy?: string;
    }>;
  };
  // Additional metadata
  metadata?: {
    fingerprint?: string;
    sessions?: number;
    [key: string]: unknown;
  };
  // Complex nested structures (optional)
  identification?: {
    userAgent?: string;
    ipAddress?: string;
    fingerprint?: string;
    asn?: string;
    geo?: {
      country?: string;
      city?: string;
      region?: string;
    };
  };
  behavior?: {
    requestRate?: number;
    pattern?: string;
    mouseMovement?: boolean;
    keyboardInput?: boolean;
  };
  detection?: {
    method: DetectionMethod;
    signals?: string[];
    score: number;
    firstDetected?: string;
    lastSeen?: string;
  };
  statistics?: {
    totalRequests?: number;
    blockedRequests?: number;
    challengesPassed?: number;
    challengesFailed?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Challenge Types
export type ChallengeType = 'recaptcha' | 'hcaptcha' | 'turnstile' | 'javascript' | 'js_challenge' | 'proof_of_work';
export type ChallengeStatus = 'active' | 'disabled' | 'pending' | 'solved' | 'failed' | 'expired';

export interface Challenge {
  _id: string;
  name?: string;
  type: ChallengeType;
  status: ChallengeStatus;
  enabled?: boolean;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeout?: number;
  // Simple properties for individual challenge instances
  ipAddress?: string;
  attempts?: number;
  solveTime?: number;
  issuedAt?: string;
  expiresAt?: string;
  solvedAt?: string;
  metadata?: Record<string, unknown>;
  // Aggregate stats for challenge configurations
  issued?: number;
  passed?: number;
  failed?: number;
  passRate?: number;
  avgSolveTime?: number;
  successRate?: number;
  configuration?: {
    difficulty?: string;
    timeout?: number;
    maxAttempts?: number;
  };
  statistics?: {
    issued: number;
    passed: number;
    failed: number;
    avgSolveTime?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Fingerprint Types
export interface Fingerprint {
  _id: string;
  hash: string;
  browser?: string;
  os?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet' | string;
  ipAddress: string;
  country?: string;
  botScore: number;
  requestCount?: number;
  isBot?: boolean;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  components: {
    userAgent?: string;
    screen?: string;
    screenResolution?: string;
    timezone?: string;
    language?: string;
    platform?: string;
    plugins?: string[] | number;
    canvas?: string;
    webgl?: string;
    audio?: string;
    fonts?: string[];
    hardwareConcurrency?: number;
    deviceMemory?: number;
  };
  analysis?: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    anomalies?: string[];
    consistency?: number;
  };
  seenCount?: number;
  associatedIPs?: string[];
  firstSeen: string;
  lastSeen: string;
  createdAt?: string;
  updatedAt?: string;
}

// Rule Types
export interface RuleCondition {
  field: string;
  operator: string;
  value: string | number | string[];
  caseSensitive?: boolean;
}

export interface RateLimitConfig {
  requests: number;
  window: number;
}

export interface RuleAction {
  type: BotAction;
  challengeType?: ChallengeType;
  rateLimit?: RateLimitConfig;
  message?: string;
}

export interface Rule {
  _id: string;
  name: string;
  description?: string;
  enabled: boolean;
  priority: number;
  conditions: RuleCondition[];
  conditionLogic: 'AND' | 'OR' | 'and' | 'or';
  action: BotAction | RuleAction;
  rateLimit?: RateLimitConfig;
  matchCount?: number;
  lastMatched?: string;
  metadata?: {
    createdBy?: string;
    hitCount?: number;
    lastHit?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Incident Types
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'active' | 'investigating' | 'mitigating' | 'mitigated' | 'resolved';
export type IncidentType = 'credential_stuffing' | 'scraping' | 'ddos' | 'spam' | 'fraud' | 'api_abuse' | 'other';

export interface IncidentNote {
  content: string;
  timestamp: string;
  author?: string;
}

export interface Incident {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  type: IncidentType;
  attackType?: string;
  detectionMethod?: string;
  requestCount?: number;
  blockedCount?: number;
  startTime?: string;
  endTime?: string;
  targetEndpoints?: string[];
  notes?: IncidentNote[];
  affectedResources?: Array<{
    type: string;
    impact?: string;
  }>;
  sourceIPs?: string[];
  metrics?: {
    requestsBlocked?: number;
    uniqueBots?: number;
    peakRPS?: number;
    duration?: number;
  };
  resolution?: {
    summary?: string;
    resolvedAt?: string;
    resolvedBy?: string;
    preventiveMeasures?: string[];
  };
  timeline?: Array<{
    action: string;
    timestamp: string;
    details?: string;
    performedBy?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

// IP Reputation Types
export interface IPReputation {
  _id?: string;
  ip?: string;
  ipAddress?: string;
  riskScore: number;
  country?: string;
  city?: string;
  isp?: string;
  ipType?: string;
  isVpn?: boolean;
  isTor?: boolean;
  isDatacenter?: boolean;
  isKnownBot?: boolean;
  abuseReports?: number;
  classification?: BotClassification;
  factors?: string[];
  sources?: {
    ipQualityScore?: {
      available: boolean;
      fraudScore?: number;
      isBot?: boolean;
      isProxy?: boolean;
      isVPN?: boolean;
      isTor?: boolean;
    };
    abuseIPDB?: {
      available: boolean;
      abuseConfidenceScore?: number;
      totalReports?: number;
    };
    greyNoise?: {
      available: boolean;
      noise?: boolean;
      classification?: string;
    };
  };
  timestamp?: string;
}

// Analytics Types
export interface DashboardStats {
  overview: {
    totalBots: number;
    activeBots: number;
    blockedBots: number;
    totalFingerprints: number;
    suspiciousFingerprints: number;
  };
  traffic: {
    requests24h: number;
    botRequests24h: number;
    humanRequests24h: number;
    botPercentage: string;
  };
  challenges: {
    issued: number;
    passed: number;
    failed: number;
    passRate: string;
  };
  status: string;
  lastUpdated: string;
}

export interface TrafficData {
  total: number;
  bot: number;
  human: number;
  botPercentage: string;
  timeline: Array<{
    _id: {
      hour: number;
      isBot: boolean;
    };
    count: number;
  }>;
}

// WebSocket Event Types
export interface WSEvent {
  type: string;
  channel?: string;
  data?: unknown;
  timestamp: string;
}

export interface BotDetectionEvent extends WSEvent {
  type: 'bot_detected';
  data: {
    id: string;
    ipAddress?: string;
    userAgent?: string;
    classification: BotClassification;
    category?: BotCategory;
    confidence?: number;
    botScore: number;
    action: BotAction;
    method: DetectionMethod;
    country?: string;
  };
}

export interface LiveTrafficData {
  window: number;
  timestamp: string;
  traffic: Bot[];
  stats: {
    total: number;
    bots: number;
    humans: number;
    unknown: number;
    blocked: number;
    challenged: number;
    avgScore: number;
  };
}

// Simple traffic entry for real-time display
export interface TrafficEntry {
  id: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  path: string;
  method: string;
  statusCode: number;
  responseTime: number;
  classification: 'human' | 'bot' | 'suspicious';
  botScore: number;
  country: string;
  requestsPerMinute: number;
}

export interface TrafficUpdate {
  type: 'traffic_update';
  timestamp: string;
  entry: TrafficEntry;
}

export interface Settings {
  detectionEnabled: boolean;
  autoBlock: boolean;
  autoBlockThreshold: number;
  challengeThreshold: number;
  monitorThreshold: number;
  whitelistEnabled: boolean;
  notificationsEnabled: boolean;
  webhookUrl?: string;
  slackWebhook?: string;
}

export interface Integrations {
  recaptcha: { enabled: boolean; configured: boolean };
  hcaptcha: { enabled: boolean; configured: boolean };
  turnstile: { enabled: boolean; configured: boolean };
  ipQualityScore: { enabled: boolean };
  abuseIPDB: { enabled: boolean };
  greyNoise: { enabled: boolean };
  mlEngine: { enabled: boolean; url: string };
}

export interface BlacklistEntry {
  ip: string;
  reason?: string;
  addedAt: string;
  addedBy?: string;
}

export interface WhitelistEntry {
  ip: string;
  reason?: string;
  description?: string;
  addedAt: string;
  addedBy?: string;
}

export interface ApiResponse<T> {
  data: T;
  success?: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
