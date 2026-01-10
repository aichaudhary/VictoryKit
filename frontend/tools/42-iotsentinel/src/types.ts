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
  | 'device_inventory'
  | 'vulnerability_scan'
  | 'network_topology'
  | 'alerts'
  | 'firmware_analysis'
  | 'baselines'
  | 'web_search'
  | 'canvas'
  | 'browser';

export type WorkspaceMode = 'CHAT' | 'PORTAL' | 'CANVAS' | 'IOT_DASHBOARD';

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

// ============================================
// IoT DEVICE TYPES
// ============================================

export type DeviceType = 
  | 'camera' | 'thermostat' | 'sensor' | 'controller' | 'gateway'
  | 'router' | 'switch' | 'access_point' | 'smart_lock' | 'smart_plug'
  | 'hvac' | 'lighting' | 'medical_device' | 'industrial_plc' | 'scada'
  | 'building_automation' | 'environmental_sensor' | 'wearable' | 'vehicle'
  | 'smart_meter' | 'security_system' | 'voice_assistant' | 'unknown';

export type DeviceStatus = 'online' | 'offline' | 'degraded' | 'maintenance' | 'quarantined' | 'decommissioned';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type Criticality = 'low' | 'medium' | 'high' | 'critical';

export interface Device {
  _id: string;
  deviceId: string;
  name: string;
  type: DeviceType;
  manufacturer?: string;
  model?: string;
  firmwareVersion?: string;
  ipAddress?: string;
  macAddress?: string;
  status: DeviceStatus;
  riskLevel: RiskLevel;
  riskScore: number;
  criticality: Criticality;
  lastSeen?: string;
  firstSeen?: string;
  networkSegment?: NetworkSegment;
  location?: {
    building?: string;
    floor?: string;
    room?: string;
    coordinates?: { lat: number; lng: number };
  };
  vulnerabilities?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// VULNERABILITY TYPES
// ============================================

export type VulnSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type VulnStatus = 'open' | 'in_progress' | 'mitigated' | 'resolved' | 'accepted' | 'false_positive';

export interface Vulnerability {
  _id: string;
  cveId?: string;
  title: string;
  description?: string;
  severity: VulnSeverity;
  cvssScore?: number;
  cvssVector?: string;
  status: VulnStatus;
  exploitAvailable: boolean;
  exploitedInWild: boolean;
  affectedDevices: string[];
  discoveredAt: string;
  remediation?: {
    description?: string;
    patchAvailable: boolean;
    patchUrl?: string;
    workaround?: string;
  };
  references?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// SCAN TYPES
// ============================================

export type ScanType = 'discovery' | 'vulnerability' | 'firmware' | 'compliance' | 'full' | 'quick';
export type ScanStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'scheduled';

export interface Scan {
  _id: string;
  scanId: string;
  type: ScanType;
  status: ScanStatus;
  progress: number;
  targets: {
    networks?: string[];
    devices?: string[];
    ports?: number[];
  };
  results?: {
    devicesScanned: number;
    devicesDiscovered: number;
    vulnerabilitiesFound: number;
    findings: ScanFinding[];
  };
  startedAt?: string;
  completedAt?: string;
  scheduledAt?: string;
  createdAt: string;
}

export interface ScanFinding {
  type: string;
  severity: VulnSeverity;
  deviceId?: string;
  title: string;
  description: string;
  recommendation?: string;
}

// ============================================
// ALERT TYPES
// ============================================

export type AlertType = 
  | 'device_offline' | 'new_device' | 'rogue_device' | 'vulnerability_detected'
  | 'behavioral_anomaly' | 'firmware_outdated' | 'unauthorized_access' | 'malware_detected'
  | 'network_intrusion' | 'policy_violation' | 'configuration_change' | 'high_risk_activity';

export type AlertSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive' | 'escalated';

export interface Alert {
  _id: string;
  alertId: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description?: string;
  source: string;
  device?: Device;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  notes?: AlertNote[];
  actions?: AlertAction[];
  createdAt: string;
  updatedAt: string;
}

export interface AlertNote {
  author: string;
  content: string;
  timestamp: string;
}

export interface AlertAction {
  action: string;
  performedBy: string;
  timestamp: string;
  result?: string;
}

// ============================================
// FIRMWARE TYPES
// ============================================

export interface Firmware {
  _id: string;
  firmwareId: string;
  name: string;
  vendor?: string;
  version: string;
  deviceType?: DeviceType;
  status: 'pending_analysis' | 'analyzing' | 'analyzed' | 'failed';
  file?: {
    size: number;
    md5?: string;
    sha256?: string;
    fileName: string;
  };
  staticAnalysis?: {
    performed: boolean;
    analysisDate?: string;
    entropyScore?: number;
    stringsExtracted?: number;
    cryptoFunctionsFound?: string[];
    hardcodedCredentials?: boolean;
    debugSymbols?: boolean;
    packingDetected?: boolean;
  };
  virusTotalAnalysis?: {
    scanned: boolean;
    scanDate?: string;
    detectionRatio?: string;
    malicious: boolean;
    suspicious: boolean;
  };
  vulnerabilityFindings?: FirmwareVulnerability[];
  updateAvailable?: {
    version: string;
    releaseDate: string;
    critical: boolean;
    downloadUrl?: string;
    releaseNotes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FirmwareVulnerability {
  type: string;
  severity: VulnSeverity;
  description: string;
  location?: string;
  recommendation?: string;
}

// ============================================
// NETWORK SEGMENT TYPES
// ============================================

export type SegmentType = 
  | 'production' | 'development' | 'iot' | 'guest' | 'management'
  | 'dmz' | 'quarantine' | 'critical_infrastructure' | 'medical' | 'industrial';

export type SecurityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface NetworkSegment {
  _id: string;
  segmentId: string;
  name: string;
  type: SegmentType;
  status: 'active' | 'inactive' | 'quarantined';
  securityLevel: SecurityLevel;
  network?: {
    subnet: string;
    gateway?: string;
    vlanId?: number;
    dnsServers?: string[];
  };
  devices: string[] | Device[];
  firewallRules?: FirewallRule[];
  accessPolicies?: AccessPolicy[];
  trafficStats?: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    lastUpdated?: string;
  };
  compliance?: {
    pciDss: boolean;
    hipaa: boolean;
    gdpr: boolean;
    iso27001: boolean;
  };
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirewallRule {
  ruleId: string;
  name: string;
  action: 'allow' | 'deny' | 'log';
  direction: 'inbound' | 'outbound' | 'both';
  protocol: 'tcp' | 'udp' | 'icmp' | 'any';
  sourceIp?: string;
  destinationIp?: string;
  sourcePorts?: string;
  destinationPorts?: string;
  enabled: boolean;
  priority: number;
}

export interface AccessPolicy {
  policyId: string;
  name: string;
  type: 'time_based' | 'role_based' | 'device_based' | 'location_based';
  conditions: Record<string, any>;
  action: 'allow' | 'deny' | 'require_mfa';
  enabled: boolean;
  priority: number;
}

// ============================================
// BASELINE TYPES
// ============================================

export interface Baseline {
  _id: string;
  baselineId: string;
  device: string | Device;
  status: 'learning' | 'active' | 'paused' | 'expired';
  learningStarted?: string;
  learningCompleted?: string;
  dataPointCount: number;
  anomalyCount: number;
  trafficMetrics?: {
    avgBytesIn: number;
    avgBytesOut: number;
    avgPacketsIn: number;
    avgPacketsOut: number;
    stdDevBytesIn?: number;
    stdDevBytesOut?: number;
  };
  connectionMetrics?: {
    avgActiveConnections: number;
    avgNewConnections: number;
    typicalPorts: number[];
    typicalDestinations?: string[];
  };
  temporalMetrics?: {
    activeHours: number[];
    avgSessionDuration: number;
    typicalDaysOfWeek?: number[];
  };
  config?: {
    learningPeriod: number;
    updateInterval: number;
    anomalyThreshold: number;
  };
  anomalyHistory?: AnomalyEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface AnomalyEvent {
  metricType: string;
  value: number;
  expectedRange: { min: number; max: number };
  deviation: number;
  severity: AlertSeverity;
  timestamp: string;
}

// ============================================
// DASHBOARD & ANALYTICS TYPES
// ============================================

export interface DashboardOverview {
  riskScore: number;
  devices: DeviceStats;
  vulnerabilities: VulnStats;
  alerts: AlertStats;
  scans: ScanStats;
  segments: SegmentStats;
  firmware: FirmwareStats;
  lastUpdated: string;
}

export interface DeviceStats {
  total: number;
  byStatus: Record<DeviceStatus, number>;
  byType: Record<DeviceType, number>;
  byRiskLevel: Record<RiskLevel, number>;
  byCriticality: Record<Criticality, number>;
}

export interface VulnStats {
  total: number;
  bySeverity: Record<VulnSeverity, number>;
  byStatus: Record<VulnStatus, number>;
  exploitable: number;
}

export interface AlertStats {
  total: number;
  bySeverity: Record<AlertSeverity, number>;
  byStatus: Record<AlertStatus, number>;
  byType: Record<AlertType, number>;
}

export interface ScanStats {
  total: number;
  byStatus: Record<ScanStatus, number>;
  byType: Record<ScanType, number>;
  averageDuration?: number;
}

export interface SegmentStats {
  total: number;
  byType: Record<SegmentType, number>;
  bySecurityLevel: Record<SecurityLevel, number>;
  active: number;
}

export interface FirmwareStats {
  total: number;
  analyzed: number;
  vulnerable: number;
  outdated: number;
  malicious: number;
}

export interface RiskBreakdown {
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: {
    deviceRisk: { score: number; factors: Record<string, number> };
    vulnerabilityRisk: { score: number; factors: Record<string, number> };
    alertRisk: { score: number; factors: Record<string, number> };
  };
  recommendations: Recommendation[];
}

export interface Recommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  action: string;
}

// ============================================
// TOPOLOGY TYPES
// ============================================

export interface TopologyNode {
  id: string;
  type: 'segment' | 'device';
  label: string;
  deviceType?: DeviceType;
  segmentType?: SegmentType;
  status?: string;
  riskLevel?: RiskLevel;
  securityLevel?: SecurityLevel;
  color?: string;
  deviceCount?: number;
  ip?: string;
}

export interface TopologyEdge {
  source: string;
  target: string;
  type: 'contains' | 'connects' | 'allowed' | 'blocked';
}

export interface NetworkTopology {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  summary: {
    segments: number;
    devices: number;
  };
}

// ============================================
// INTEGRATION TYPES
// ============================================

export interface IntegrationStatus {
  integrations: Record<string, boolean>;
  summary: {
    total: number;
    configured: number;
    notConfigured: number;
  };
}

// ============================================
// TAB TYPES
// ============================================

export interface Tab {
  id: string;
  type: 'chat' | 'web' | 'code' | 'chart' | 'device' | 'scan' | 'report';
  title: string;
  content: any;
  status: 'loading' | 'active' | 'complete' | 'error';
  aiGenerated: boolean;
}
