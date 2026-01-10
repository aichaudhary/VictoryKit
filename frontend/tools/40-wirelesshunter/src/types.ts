// WirelessHunter Types - Enterprise Wireless Network Security Monitoring

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
  | 'network_monitor'
  | 'access_points'
  | 'clients'
  | 'security_alerts'
  | 'threat_detection'
  | 'signal_analysis'
  | 'reports'
  | 'settings';

export type WorkspaceMode = 'CHAT' | 'PORTAL' | 'CANVAS' | 'WIRELESS_DASHBOARD';

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

// ==================== WIRELESS NETWORK TYPES ====================

export interface WirelessNetwork {
  networkId: string;
  ssid: string;
  bssid: string;
  networkType: 'infrastructure' | 'ad-hoc' | 'mesh' | 'enterprise' | 'guest' | 'iot';
  status: 'active' | 'inactive' | 'quarantined' | 'maintenance';
  frequency: {
    band: '2.4GHz' | '5GHz' | '6GHz';
    channel: number;
    channelWidth: number;
  };
  security: {
    encryptionType: 'WPA3-Enterprise' | 'WPA3-Personal' | 'WPA2-Enterprise' | 'WPA2-Personal' | 'WPA' | 'WEP' | 'Open';
    authenticationMethod: string;
    pmfEnabled: boolean;
  };
  signalMetrics: {
    rssi: number;
    snr: number;
    noiseFloor: number;
    dataRate: number;
  };
  isAuthorized: boolean;
  isRogue: boolean;
  threatAssessment: {
    threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
  };
  lastSeen: string;
  createdAt: string;
}

export interface AccessPoint {
  apId: string;
  name: string;
  macAddress: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  hardware: {
    manufacturer: string;
    model: string;
    firmwareVersion: string;
  };
  location: {
    building: string;
    floor: string;
    room: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  radios: Array<{
    band: '2.4GHz' | '5GHz' | '6GHz';
    channel: number;
    power: number;
    clientCount: number;
  }>;
  connectedClients: {
    total: number;
    wireless24: number;
    wireless5: number;
    wireless6: number;
  };
  performance: {
    cpuUtilization: number;
    memoryUtilization: number;
    uptime: number;
    interference: {
      level: 'none' | 'low' | 'medium' | 'high';
      sources: string[];
    };
  };
  lastSeen: string;
}

export interface WirelessClient {
  clientId: string;
  macAddress: string;
  hostname: string;
  ipAddress: string;
  device: {
    deviceType: 'laptop' | 'smartphone' | 'tablet' | 'iot' | 'printer' | 'unknown';
    manufacturer: string;
    osType: string;
    osVersion: string;
  };
  connectionStatus: 'connected' | 'disconnected' | 'roaming' | 'blocked' | 'quarantined';
  currentConnection: {
    apId: string;
    apName: string;
    ssid: string;
    band: '2.4GHz' | '5GHz' | '6GHz';
    channel: number;
    connectedSince: string;
  };
  signalQuality: {
    rssi: number;
    snr: number;
    linkSpeed: number;
    txRate: number;
    rxRate: number;
  };
  trafficStats: {
    bytesReceived: number;
    bytesSent: number;
    packetsReceived: number;
    packetsSent: number;
  };
  security: {
    trustLevel: 'trusted' | 'verified' | 'unknown' | 'suspicious' | 'blocked';
    authenticationMethod: string;
    isCompliant: boolean;
    threatIndicators: Array<{
      type: string;
      severity: string;
      detectedAt: string;
    }>;
  };
  lastSeen: string;
}

export interface WirelessSecurityAlert {
  alertId: string;
  alertType: 
    | 'rogue-access-point'
    | 'evil-twin-attack'
    | 'deauth-flood'
    | 'weak-encryption'
    | 'mac-spoofing'
    | 'signal-jamming'
    | 'channel-interference'
    | 'unauthorized-client'
    | 'probe-request-flood'
    | 'beacon-manipulation';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false-positive';
  title: string;
  description: string;
  detectedAt: string;
  affectedNetwork?: {
    networkId: string;
    ssid: string;
    bssid: string;
  };
  source?: {
    type: string;
    identifier: string;
    macAddress: string;
  };
  location?: {
    building: string;
    floor: string;
  };
  riskAssessment: {
    score: number;
    confidenceLevel: number;
    potentialImpact: 'minimal' | 'moderate' | 'significant' | 'severe';
  };
  responseActions?: {
    recommended: Array<{
      action: string;
      priority: string;
      description: string;
    }>;
    taken: Array<{
      action: string;
      performedAt: string;
      performedBy: string;
    }>;
  };
}

// ==================== DASHBOARD TYPES ====================

export interface DashboardData {
  overview: {
    totalNetworks: number;
    activeNetworks: number;
    rogueNetworks: number;
    totalAPs: number;
    onlineAPs: number;
    totalClients: number;
    connectedClients: number;
    newAlerts: number;
    criticalAlerts: number;
  };
  networksByType: Array<{
    _id: string;
    count: number;
  }>;
  clientsByDevice: Array<{
    _id: string;
    count: number;
  }>;
  recentAlerts: WirelessSecurityAlert[];
  healthScore: number;
  timestamp: string;
}

export interface ThreatDetectionResult {
  scannedNetworks: number;
  detectedRogues: number;
  rogueNetworks: WirelessNetwork[];
  timestamp: string;
  // Extended fields for scan results
  scanType?: 'rogue-aps' | 'weak-encryption' | 'signal-anomalies' | 'threat-hunting';
  severity?: 'info' | 'low' | 'medium' | 'high' | 'critical';
  threatCount?: number;
  scannedItems?: number;
  findings?: Array<{
    name: string;
    description: string;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    type: string;
    recommendation?: string;
  }>;
}

export interface ProviderStatus {
  id: string;
  name: string;
  configured: boolean;
  site: string;
}

// ==================== TAB TYPES ====================

export type Tab = 
  | 'dashboard' 
  | 'networks' 
  | 'access-points' 
  | 'clients' 
  | 'alerts' 
  | 'threat-detection'
  | 'reports' 
  | 'settings';
