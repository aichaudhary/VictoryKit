/**
 * NetworkForensics API Client - Tool 16 - Real-Time Network Traffic Analysis
 * Enhanced API client with full CRUD operations and WebSocket support
 */

const API_BASE_URL = import.meta.env.VITE_NETWORKFORENSICS_API_URL || 'http://localhost:4016/api';
const WS_URL = import.meta.env.VITE_NETWORKFORENSICS_WS_URL || 'ws://localhost:4016/ws';

// ==================== Types ====================
export interface NetworkDevice {
  _id: string;
  name: string;
  ip: string;
  mac?: string;
  vendor?: string;
  status: 'online' | 'offline' | 'warning' | 'critical' | 'unknown';
  type: 'server' | 'router' | 'switch' | 'firewall' | 'endpoint' | 'ap' | 'printer' | 'iot' | 'other';
  uptime?: number;
  network?: { vlan?: number; zone?: string };
  bandwidth?: { in: number; out: number };
  metrics?: { latency?: number; packetLoss?: number; cpu?: number; memory?: number };
  interfaces?: { name: string; status: 'up' | 'down'; speed?: number; inBytes?: number; outBytes?: number }[];
  snmp?: { enabled: boolean; version?: string };
  location?: { building?: string; floor?: string; rack?: string };
  lastSeen?: string;
  lastPolled?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NetworkAlert {
  _id: string;
  alertId: string;
  type: 'intrusion' | 'anomaly' | 'threshold' | 'connectivity' | 'device-offline' | 'latency' | 'packet-loss';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  source?: { ip?: string; deviceId?: string };
  target?: { ip?: string };
  status: 'open' | 'acknowledged' | 'investigating' | 'resolved';
  acknowledged: boolean;
  resolved: boolean;
  acknowledgedAt?: string;
  resolvedAt?: string;
  timestamp: string;
  occurrenceCount: number;
  notes?: { text: string; author: string; timestamp: string }[];
}

export interface TrafficStats {
  summary: { totalBytes: number; totalPackets: number; flowCount: number };
  topSources: { ip: string; bytes: number; flows: number }[];
  topDestinations: { ip: string; bytes: number; flows: number }[];
  topProtocols: { protocol: string; bytes: number; flows: number }[];
  timeline: { time: string; bytes: number; packets: number; flows: number }[];
}

export interface DashboardOverview {
  devices: { total: number; online: number; offline: number; warning: number; critical: number; healthPercent: number };
  alerts: { open: number; critical: number; high: number; medium: number; low: number; last24h: number };
  traffic: { bytesLastHour: number; packetsLastHour: number; flowsLastHour: number; bytesFormatted: string };
  recentAlerts: NetworkAlert[];
  topDevices: { device: { name: string; ip: string }; bytes: number }[];
  wsClients: number;
  lastUpdated: string;
}

export interface NetworkMapData {
  nodes: { id: string; name: string; ip: string; type: string; status: string; building?: string }[];
  edges: { source: string; target: string; bytes: number; flows: number }[];
}

export interface ApiResponse<T> { success: boolean; data?: T; count?: number; total?: number; error?: string; simulated?: boolean }

// ==================== WebSocket Manager ====================
type WebSocketCallback = (data: unknown) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private listeners: Map<string, Set<WebSocketCallback>> = new Map();
  private connected = false;

  constructor(url: string = WS_URL) { this.url = url; }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    try {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => { console.log('[WS] Connected to NetworkForensics'); this.connected = true; this.reconnectAttempts = 0; };
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type || 'message', data);
          if (data.topic) this.emit(data.topic, data);
        } catch (e) { console.error('[WS] Failed to parse message:', e); }
      };
      this.ws.onclose = () => { console.log('[WS] Disconnected'); this.connected = false; this.tryReconnect(); };
      this.ws.onerror = (error) => { console.error('[WS] Error:', error); };
    } catch (error) { console.error('[WS] Connection failed:', error); }
  }

  private tryReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) { console.log('[WS] Max reconnect attempts reached'); return; }
    this.reconnectAttempts++;
    console.log(`[WS] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    setTimeout(() => this.connect(), this.reconnectDelay);
  }

  subscribe(topic: string): void { this.send({ action: 'subscribe', topic }); }
  unsubscribe(topic: string): void { this.send({ action: 'unsubscribe', topic }); }
  send(data: unknown): void { if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(data)); }

  on(event: string, callback: WebSocketCallback): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: WebSocketCallback): void { this.listeners.get(event)?.delete(callback); }

  private emit(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach((callback) => { try { callback(data); } catch (e) { console.error(`[WS] Callback error for ${event}:`, e); } });
  }

  disconnect(): void { this.ws?.close(); this.ws = null; this.connected = false; }
  isConnected(): boolean { return this.connected; }
}

// ==================== API Client ====================
class NetworkForensicsApi {
  private baseUrl: string;
  constructor(baseUrl: string = API_BASE_URL) { this.baseUrl = baseUrl; }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const r = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
      const d = await r.json();
      if (!r.ok) return { success: false, error: d.error || 'Request failed' };
      return d;
    } catch (e) { return { success: false, error: e instanceof Error ? e.message : 'Network error' }; }
  }

  // Dashboard
  async getDashboardOverview(): Promise<ApiResponse<DashboardOverview>> { return this.request('/dashboard/overview'); }
  async getDashboardHealth(): Promise<ApiResponse<{ status: string; healthScore: number }>> { return this.request('/dashboard/health'); }
  async getDashboardTimeline(hours?: number): Promise<ApiResponse<unknown>> { return this.request(`/dashboard/timeline${hours ? `?hours=${hours}` : ''}`); }
  async getNetworkMap(): Promise<ApiResponse<NetworkMapData>> { return this.request('/dashboard/network-map'); }

  // Devices
  async getDevices(params?: { status?: string; type?: string; search?: string }): Promise<ApiResponse<NetworkDevice[]>> {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.type) q.set('type', params.type);
    if (params?.search) q.set('search', params.search);
    return this.request(`/devices${q.toString() ? `?${q}` : ''}`);
  }
  async getDevice(id: string): Promise<ApiResponse<NetworkDevice>> { return this.request(`/devices/${id}`); }
  async createDevice(device: Partial<NetworkDevice>): Promise<ApiResponse<NetworkDevice>> { return this.request('/devices', { method: 'POST', body: JSON.stringify(device) }); }
  async updateDevice(id: string, updates: Partial<NetworkDevice>): Promise<ApiResponse<NetworkDevice>> { return this.request(`/devices/${id}`, { method: 'PUT', body: JSON.stringify(updates) }); }
  async deleteDevice(id: string): Promise<ApiResponse<void>> { return this.request(`/devices/${id}`, { method: 'DELETE' }); }
  async discoverDevices(subnet: string): Promise<ApiResponse<unknown[]>> { return this.request('/devices/discover', { method: 'POST', body: JSON.stringify({ subnet }) }); }
  async autoDiscoverDevices(subnet: string): Promise<ApiResponse<{ discovered: number; added: number }>> { return this.request('/devices/auto-discover', { method: 'POST', body: JSON.stringify({ subnet }) }); }
  async checkDeviceStatus(id: string): Promise<ApiResponse<{ online: boolean; latency: number }>> { return this.request(`/devices/${id}/status`); }
  async checkAllDevicesStatus(): Promise<ApiResponse<{ total: number; online: number; offline: number }>> { return this.request('/devices/check-all', { method: 'POST' }); }
  async getDeviceStats(): Promise<ApiResponse<{ total: number; byStatus: Record<string, number>; byType: Record<string, number> }>> { return this.request('/devices/stats'); }

  // Alerts
  async getAlerts(params?: { severity?: string; type?: string; status?: string; resolved?: boolean; limit?: number }): Promise<ApiResponse<NetworkAlert[]>> {
    const q = new URLSearchParams();
    if (params?.severity) q.set('severity', params.severity);
    if (params?.type) q.set('type', params.type);
    if (params?.status) q.set('status', params.status);
    if (params?.resolved !== undefined) q.set('resolved', String(params.resolved));
    if (params?.limit) q.set('limit', String(params.limit));
    return this.request(`/alerts${q.toString() ? `?${q}` : ''}`);
  }
  async getAlert(id: string): Promise<ApiResponse<NetworkAlert>> { return this.request(`/alerts/${id}`); }
  async createAlert(alert: Partial<NetworkAlert>): Promise<ApiResponse<NetworkAlert>> { return this.request('/alerts', { method: 'POST', body: JSON.stringify(alert) }); }
  async acknowledgeAlert(id: string): Promise<ApiResponse<NetworkAlert>> { return this.request(`/alerts/${id}/acknowledge`, { method: 'POST' }); }
  async resolveAlert(id: string, resolution?: string): Promise<ApiResponse<NetworkAlert>> { return this.request(`/alerts/${id}/resolve`, { method: 'POST', body: JSON.stringify({ resolution }) }); }
  async addAlertNote(id: string, note: string): Promise<ApiResponse<NetworkAlert>> { return this.request(`/alerts/${id}/notes`, { method: 'POST', body: JSON.stringify({ note }) }); }
  async getAlertStats(): Promise<ApiResponse<{ openAlerts: number; criticalAlerts: number; bySeverity: Record<string, number> }>> { return this.request('/alerts/stats'); }
  async bulkAcknowledgeAlerts(alertIds: string[]): Promise<ApiResponse<{ acknowledged: number }>> { return this.request('/alerts/bulk/acknowledge', { method: 'POST', body: JSON.stringify({ alertIds }) }); }
  async bulkResolveAlerts(alertIds: string[], resolution?: string): Promise<ApiResponse<{ resolved: number }>> { return this.request('/alerts/bulk/resolve', { method: 'POST', body: JSON.stringify({ alertIds, resolution }) }); }

  // Traffic
  async getTrafficStats(params?: { startTime?: string; endTime?: string }): Promise<ApiResponse<TrafficStats>> {
    const q = new URLSearchParams();
    if (params?.startTime) q.set('startTime', params.startTime);
    if (params?.endTime) q.set('endTime', params.endTime);
    return this.request(`/traffic/stats${q.toString() ? `?${q}` : ''}`);
  }
  async getTopTalkers(period?: string): Promise<ApiResponse<{ topSources: unknown[]; topDestinations: unknown[] }>> { return this.request(`/traffic/top-talkers${period ? `?period=${period}` : ''}`); }
  async getProtocolDistribution(period?: string): Promise<ApiResponse<unknown[]>> { return this.request(`/traffic/protocols${period ? `?period=${period}` : ''}`); }
  async getBandwidth(): Promise<ApiResponse<unknown[]>> { return this.request('/traffic/bandwidth'); }
  async getGeoDistribution(period?: string): Promise<ApiResponse<unknown>> { return this.request(`/traffic/geo${period ? `?period=${period}` : ''}`); }

  // Health
  async checkHealth(): Promise<ApiResponse<{ status: string; version: string }>> { return this.request('/health'); }
}

// ==================== Exports ====================
export const networkMonitorApi = new NetworkForensicsApi();
export const wsManager = new WebSocketManager();

// Simulated data for offline/demo mode
export const simulatedData = {
  dashboard: {
    devices: { total: 48, online: 42, offline: 4, warning: 2, critical: 0, healthPercent: 88 },
    alerts: { open: 8, critical: 1, high: 3, medium: 4, low: 0, last24h: 15 },
    traffic: { bytesLastHour: 4500000000, packetsLastHour: 3200000, flowsLastHour: 8500, bytesFormatted: '4.19 GB' },
    recentAlerts: [
      { _id: '1', alertId: 'ALERT-001', type: 'anomaly' as const, severity: 'high' as const, title: 'Unusual traffic spike', message: 'Traffic from 10.0.0.45 increased 300%', source: { ip: '10.0.0.45' }, status: 'open' as const, acknowledged: false, resolved: false, timestamp: new Date().toISOString(), occurrenceCount: 3 },
      { _id: '2', alertId: 'ALERT-002', type: 'connectivity' as const, severity: 'critical' as const, title: 'Device offline', message: 'Core switch is not responding', source: { ip: '10.0.0.1' }, status: 'acknowledged' as const, acknowledged: true, resolved: false, timestamp: new Date(Date.now() - 900000).toISOString(), occurrenceCount: 1 },
    ],
    topDevices: [{ device: { name: 'Web Server 01', ip: '10.0.1.10' }, bytes: 1200000000 }, { device: { name: 'DB Server', ip: '10.0.1.20' }, bytes: 800000000 }],
    wsClients: 0,
    lastUpdated: new Date().toISOString()
  } as DashboardOverview,
  devices: [
    { _id: '1', name: 'Core Router', ip: '10.0.0.1', mac: 'AA:BB:CC:DD:EE:01', status: 'online' as const, type: 'router' as const, vendor: 'Cisco', uptime: 864000, bandwidth: { in: 2500000, out: 1800000 }, metrics: { latency: 2, packetLoss: 0, cpu: 35 }, lastSeen: new Date().toISOString() },
    { _id: '2', name: 'Core Switch', ip: '10.0.0.2', mac: 'AA:BB:CC:DD:EE:02', status: 'online' as const, type: 'switch' as const, vendor: 'Arista', uptime: 432000, bandwidth: { in: 8500000, out: 7200000 }, metrics: { latency: 1, packetLoss: 0, cpu: 22 }, lastSeen: new Date().toISOString() },
    { _id: '3', name: 'Firewall', ip: '10.0.0.3', mac: 'AA:BB:CC:DD:EE:03', status: 'warning' as const, type: 'firewall' as const, vendor: 'Palo Alto', uptime: 2592000, bandwidth: { in: 5000000, out: 4800000 }, metrics: { latency: 3, packetLoss: 0.1, cpu: 78 }, lastSeen: new Date().toISOString() },
    { _id: '4', name: 'Web Server 01', ip: '10.0.1.10', mac: 'AA:BB:CC:DD:EE:10', status: 'online' as const, type: 'server' as const, vendor: 'Dell', uptime: 172800, bandwidth: { in: 500000, out: 450000 }, metrics: { latency: 5, packetLoss: 0, cpu: 45, memory: 62 }, lastSeen: new Date().toISOString() },
    { _id: '5', name: 'Backup Server', ip: '10.0.1.30', mac: 'AA:BB:CC:DD:EE:30', status: 'offline' as const, type: 'server' as const, vendor: 'Dell', uptime: 0, bandwidth: { in: 0, out: 0 }, lastSeen: new Date(Date.now() - 3600000).toISOString() },
  ] as NetworkDevice[],
  alerts: [
    { _id: '1', alertId: 'ALERT-001', type: 'anomaly' as const, severity: 'high' as const, title: 'Unusual traffic spike', message: 'Traffic from 10.0.0.45 increased 300%', source: { ip: '10.0.0.45' }, status: 'open' as const, acknowledged: false, resolved: false, timestamp: new Date().toISOString(), occurrenceCount: 3 },
    { _id: '2', alertId: 'ALERT-002', type: 'connectivity' as const, severity: 'critical' as const, title: 'Device offline', message: 'Backup Server is not responding', source: { ip: '10.0.1.30' }, status: 'acknowledged' as const, acknowledged: true, resolved: false, timestamp: new Date(Date.now() - 900000).toISOString(), occurrenceCount: 1 },
    { _id: '3', alertId: 'ALERT-003', type: 'threshold' as const, severity: 'medium' as const, title: 'High CPU usage', message: 'Firewall CPU at 78%', source: { ip: '10.0.0.3' }, status: 'open' as const, acknowledged: false, resolved: false, timestamp: new Date(Date.now() - 1800000).toISOString(), occurrenceCount: 5 },
    { _id: '4', alertId: 'ALERT-004', type: 'intrusion' as const, severity: 'high' as const, title: 'Port scan detected', message: 'Multiple port scans from external IP 203.0.113.50', source: { ip: '203.0.113.50' }, target: { ip: '10.0.0.3' }, status: 'investigating' as const, acknowledged: true, resolved: false, timestamp: new Date(Date.now() - 7200000).toISOString(), occurrenceCount: 12 },
  ] as NetworkAlert[],
};

// Utility functions
export const formatBytes = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let value = bytes;
  while (value >= 1024 && unitIndex < units.length - 1) { value /= 1024; unitIndex++; }
  return `${value.toFixed(2)} ${units[unitIndex]}`;
};

export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};
