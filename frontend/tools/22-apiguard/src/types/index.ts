// API Types
export interface API {
  _id?: string;
  id?: string;
  apiId?: string;
  name: string;
  description?: string;
  type: APIType;
  version: string;
  baseUrl: string;
  specification?: APISpecification;
  authentication?: APIAuthentication;
  security?: APISecurityInfo;
  securityGrade?: SecurityGrade;
  securityScore?: number;
  rateLimit?: RateLimitConfig;
  endpoints: Endpoint[] | string[];
  policies: Policy[] | string[];
  status: APIStatus;
  metadata?: APIMetadata;
  owner?: string;
  tags?: string[];
  documentation?: string;
  healthCheckUrl?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type APIType = 'rest' | 'graphql' | 'grpc' | 'soap' | 'websocket' | 'REST' | 'GraphQL' | 'gRPC' | 'SOAP' | 'WebSocket';
export type APIStatus = 'active' | 'deprecated' | 'development' | 'retired';
export type SpecFormat = 'openapi' | 'swagger' | 'graphql' | 'wsdl' | 'proto';
export type AuthType = 'none' | 'api_key' | 'oauth2' | 'jwt' | 'basic' | 'mtls';
export type SecurityGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface APISpecification {
  format: SpecFormat;
  url?: string;
  content?: Record<string, unknown>;
}

export interface APIAuthentication {
  type: AuthType;
  enabled?: boolean;
  location?: 'header' | 'query' | 'cookie';
  headerName?: string;
}

export interface APISecurityInfo {
  score: number;
  grade: SecurityGrade;
  issues: SecurityIssue[];
  lastScan?: Date;
}

export interface SecurityIssue {
  severity: Severity;
  category: string;
  description: string;
  remediation?: string;
}

export interface RateLimitConfig {
  enabled: boolean;
  requests?: number;
  period?: string;
  window?: string;
}

export interface APIMetadata {
  owner?: string;
  team?: string;
  tags?: string[];
  environment?: 'production' | 'staging' | 'development';
}

// Endpoint Types
export interface Endpoint {
  _id?: string;
  id?: string;
  endpointId?: string;
  apiId: string | API;
  path: string;
  method: HTTPMethod;
  description?: string;
  parameters: EndpointParameter[];
  requestBody?: RequestBody;
  requestSchema?: Record<string, unknown>;
  responseSchema?: Record<string, unknown>;
  responses?: APIResponse[];
  security?: EndpointSecurity;
  securityScore?: number;
  validation?: ValidationConfig;
  rateLimit?: RateLimitOverride;
  vulnerabilities: Vulnerability[];
  statistics: EndpointStatistics;
  isDeprecated?: boolean;
  deprecationDate?: Date;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface EndpointParameter {
  name: string;
  location: 'path' | 'query' | 'header' | 'body';
  type: string;
  required: boolean;
  validation?: Record<string, unknown>;
}

export interface RequestBody {
  contentType: string;
  schema?: Record<string, unknown>;
  required: boolean;
}

export interface APIResponse {
  statusCode: number;
  description?: string;
  schema?: Record<string, unknown>;
}

export interface EndpointSecurity {
  authentication: boolean;
  authorization: string[];
  scopes: string[];
}

export interface ValidationConfig {
  input: boolean;
  output: boolean;
  strictMode: boolean;
}

export interface RateLimitOverride {
  override: boolean;
  requests?: number;
  period?: string;
}

export interface Vulnerability {
  type?: string;
  severity: Severity;
  description: string;
  remediation?: string;
  detectedAt?: Date;
}

export interface EndpointStatistics {
  totalCalls?: number;
  successRate?: number;
  avgLatency?: number;
  averageLatency?: number;
  requestsLast24h?: number;
  errorRate?: number;
  lastCalled?: Date;
}

// Policy Types
export interface Policy {
  _id?: string;
  id: string;
  policyId?: string;
  name: string;
  description?: string;
  type: PolicyType;
  category?: PolicyCategory;
  rules: PolicyRule[] | number;
  scope: PolicyScope | string[];
  enforcement?: EnforcementConfig;
  validation?: PolicyValidation;
  securityHeaders?: SecurityHeaders;
  isActive?: boolean;
  status?: 'active' | 'inactive' | 'draft';
  violations?: number | { last24h: number; last7d: number };
  version?: string;
  lastModified?: string;
  modifiedBy?: string;
  effectiveFrom?: Date;
  effectiveUntil?: Date;
  metadata?: PolicyMetadata;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PolicyType = 'security' | 'rate_limiting' | 'rate-limit' | 'validation' | 'transformation' | 'governance' | 'compliance' | 'logging' | 'authentication' | 'cors' | 'ip-filter' | 'graphql';
export type PolicyCategory = 'authentication' | 'authorization' | 'input_validation' | 'output_filtering' | 'encryption' | 'logging' | 'cors' | 'caching' | 'security' | 'rate-limiting' | 'validation' | 'monitoring' | 'compliance' | 'traffic' | 'access' | 'data' | 'performance';

export interface PolicyRule {
  name: string;
  condition: Record<string, unknown>;
  action: PolicyAction;
  priority: number;
}

export interface PolicyAction {
  type: 'allow' | 'deny' | 'transform' | 'log' | 'alert';
  parameters?: Record<string, unknown>;
}

export interface PolicyScope {
  global: boolean;
  apis: string[];
  endpoints: string[];
}

export interface EnforcementConfig {
  mode: 'enforce' | 'monitor' | 'disabled';
  failAction: 'deny' | 'allow_log' | 'alert';
}

export interface PolicyValidation {
  schemaEnforcement?: boolean;
  requiredFields?: boolean;
  typeChecking?: boolean;
  regexPatterns?: Record<string, unknown>;
}

export interface SecurityHeaders {
  cors?: Record<string, unknown>;
  contentSecurityPolicy?: string;
  xFrameOptions?: string;
  xContentTypeOptions?: boolean;
}

export interface PolicyMetadata {
  createdBy?: string;
  version?: number;
  tags?: string[];
}

// Anomaly Types
export interface Anomaly {
  _id?: string;
  id?: string;
  anomalyId?: string;
  apiId?: string | API;
  apiName?: string;
  endpointId?: string | Endpoint;
  endpoint?: string;
  type: AnomalyType;
  severity: Severity;
  description?: string;
  metrics?: AnomalyMetrics;
  request?: AnomalyRequest;
  detection?: DetectionInfo;
  status: AnomalyStatus;
  resolution?: AnomalyResolution | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type AnomalyType = 'traffic_spike' | 'error_rate' | 'latency' | 'security' | 'schema_violation' | 'authentication_failure' | 'auth_failure' | 'latency_anomaly' | 'data_exfiltration' | 'error_spike';
export type AnomalyStatus = 'open' | 'investigating' | 'resolved' | 'false_positive' | 'active' | 'dismissed';

export interface AnomalyMetrics {
  baseline: number;
  observed: number;
  deviation: number;
  threshold: number;
}

export interface AnomalyRequest {
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  payload?: Record<string, unknown>;
}

export interface DetectionInfo {
  method: 'ml' | 'rule' | 'threshold' | 'pattern';
  confidence: number;
  model?: string;
}

export interface AnomalyResolution {
  action?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  notes?: string;
}

// Dashboard & Analytics Types
export interface DashboardStats {
  totalAPIs: number;
  totalEndpoints: number;
  activePolicies: number;
  openAnomalies: number;
  avgSecurityScore: number;
  activeAPIs: number;
  deprecatedAPIs: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  mediumVulnerabilities: number;
  lowVulnerabilities: number;
  requestsLast24h: number;
  averageLatency: number;
  errorRate: number;
  uptime: number;
  gradeDistribution: GradeDistribution;
  apisByType: TypeDistribution[];
  recentAnomalies: Anomaly[];
  topVulnerabilities: VulnerabilityCount[];
  trafficTrend: TrafficDataPoint[];
}

export interface GradeDistribution {
  'A+': number;
  'A': number;
  'B': number;
  'C': number;
  'D': number;
  'F': number;
}

export interface TypeDistribution {
  type: APIType;
  count: number;
}

export interface VulnerabilityCount {
  type: string;
  count: number;
  severity: Severity;
}

export interface TrafficDataPoint {
  timestamp: Date;
  requests: number;
  errors: number;
  latency: number;
}

export interface APIAnalytics {
  apiId: string;
  timeRange: string;
  totalRequests: number;
  successRate: number;
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
  errorsByType: ErrorTypeCount[];
  requestsByEndpoint: EndpointTraffic[];
  requestsByTime: TrafficDataPoint[];
  topConsumers: ConsumerStats[];
  geographicDistribution: GeoStats[];
}

export interface ErrorTypeCount {
  statusCode: number;
  count: number;
  percentage: number;
}

export interface EndpointTraffic {
  endpoint: string;
  method: HTTPMethod;
  requests: number;
  avgLatency: number;
  errorRate: number;
}

export interface ConsumerStats {
  consumer: string;
  requests: number;
  lastActive: Date;
}

export interface GeoStats {
  country: string;
  countryCode: string;
  requests: number;
  percentage: number;
}

// Scan Types
export interface SecurityScan {
  id: string;
  scanId?: string;
  apiId: string;
  apiName?: string;
  type: 'quick' | 'full' | 'compliance' | 'pentest';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  progress?: number;
  findings?: ScanFindings;
  score?: number;
  duration?: number;
  summary?: ScanSummary;
}

export interface ScanFindings {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface ScanFinding {
  id: string;
  type: string;
  severity: Severity;
  title: string;
  description: string;
  endpoint?: string;
  evidence?: string;
  remediation: string;
  cwe?: string;
  owasp?: string;
}

export interface ScanSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  score: number;
  grade: SecurityGrade;
}

// Real-time Events
export interface RealTimeEvent {
  id: string;
  type: 'request' | 'anomaly' | 'policy_violation' | 'rate_limit' | 'scan_complete';
  timestamp: Date;
  apiId?: string;
  endpointId?: string;
  severity?: Severity;
  message: string;
  data?: Record<string, unknown>;
}

// Settings Types
export interface APIGuardSettings {
  general: GeneralSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  integrations: IntegrationSettings;
}

export interface GeneralSettings {
  defaultRateLimit: number;
  rateLimitWindow: number;
  maxPayloadSize: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableTelemetry: boolean;
}

export interface SecuritySettings {
  defaultAction: 'allow' | 'deny' | 'log';
  enableSchemaValidation: boolean;
  strictMode: boolean;
  autoScanNewAPIs: boolean;
  scanSchedule: string;
  vulnerabilityThreshold: Severity;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  emailRecipients: string[];
  slackEnabled: boolean;
  slackWebhook: string;
  alertThreshold: Severity;
  digestEnabled: boolean;
  digestFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface IntegrationSettings {
  gateway: GatewayIntegration;
  siem: SIEMIntegration;
  identity: IdentityIntegration;
}

export interface GatewayIntegration {
  provider: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface SIEMIntegration {
  provider: string;
  enabled: boolean;
  endpoint: string;
}

export interface IdentityIntegration {
  provider: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

// Pagination & Filters
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface APIFilters {
  search?: string;
  type?: APIType | string;
  status?: APIStatus | string;
  securityGrade?: SecurityGrade | string;
  minScore?: number;
  maxScore?: number;
  tags?: string[];
  environment?: string;
}

export interface EndpointFilters {
  apiId?: string;
  method?: HTTPMethod;
  hasVulnerabilities?: boolean;
  isDeprecated?: boolean;
}

export interface AnomalyFilters {
  type?: AnomalyType;
  severity?: Severity;
  status?: AnomalyStatus;
  apiId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PolicyFilters {
  type?: PolicyType;
  category?: PolicyCategory;
  isActive?: boolean;
  scope?: 'global' | 'api' | 'endpoint';
}
