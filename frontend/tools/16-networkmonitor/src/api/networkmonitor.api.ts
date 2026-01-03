/**
 * NetworkMonitor API Client - Tool 16 - Network Traffic Analysis
 */
const API_BASE_URL = import.meta.env.VITE_NETWORKMONITOR_API_URL || 'http://localhost:4016/api/v1/networkmonitor';

export interface NetworkDevice { _id: string; name: string; ip: string; mac: string; status: 'online' | 'offline' | 'warning'; type: 'server' | 'router' | 'switch' | 'firewall' | 'endpoint'; lastSeen: string; bandwidth: { in: number; out: number; }; }
export interface NetworkAlert { _id: string; type: 'intrusion' | 'anomaly' | 'threshold' | 'connectivity'; severity: 'low' | 'medium' | 'high' | 'critical'; source: string; message: string; timestamp: string; resolved: boolean; }
export interface NetworkDashboard { overview: { devicesOnline: number; devicesOffline: number; activeAlerts: number; totalBandwidth: number; }; trafficByProtocol: { name: string; value: number; }[]; recentAlerts: NetworkAlert[]; }
export interface ApiResponse<T> { success: boolean; data?: T; error?: string; simulated?: boolean; }

class NetworkMonitorApi {
  private baseUrl: string;
  constructor(baseUrl: string = API_BASE_URL) { this.baseUrl = baseUrl; }
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try { const r = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } }); const d = await r.json(); if (!r.ok) return { success: false, error: d.error }; return d; }
    catch (e) { return { success: false, error: e instanceof Error ? e.message : 'Network error' }; }
  }
  async getDashboard(): Promise<ApiResponse<NetworkDashboard>> { return this.request('/dashboard'); }
  async getDevices(): Promise<ApiResponse<NetworkDevice[]>> { return this.request('/devices'); }
  async getAlerts(): Promise<ApiResponse<NetworkAlert[]>> { return this.request('/alerts'); }
}

export const networkMonitorApi = new NetworkMonitorApi();
export const simulatedData = {
  dashboard: { overview: { devicesOnline: 156, devicesOffline: 8, activeAlerts: 12, totalBandwidth: 8500 }, trafficByProtocol: [{ name: 'HTTPS', value: 65 }, { name: 'SSH', value: 15 }, { name: 'DNS', value: 12 }], recentAlerts: [{ _id: '1', type: 'anomaly', severity: 'high', source: '10.0.0.45', message: 'Unusual outbound traffic detected', timestamp: new Date().toISOString(), resolved: false }] } as NetworkDashboard,
  devices: [{ _id: '1', name: 'Core Router', ip: '10.0.0.1', mac: 'AA:BB:CC:DD:EE:01', status: 'online', type: 'router', lastSeen: new Date().toISOString(), bandwidth: { in: 2500, out: 1800 } }, { _id: '2', name: 'Web Server 01', ip: '10.0.1.10', mac: 'AA:BB:CC:DD:EE:10', status: 'online', type: 'server', lastSeen: new Date().toISOString(), bandwidth: { in: 500, out: 450 } }] as NetworkDevice[],
};
