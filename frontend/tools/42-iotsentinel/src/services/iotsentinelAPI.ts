/**
 * IoTSentinel API Service
 * Handles all API communication with the IoTSentinel backend
 */

import { API_BASE_URL, API_ENDPOINTS } from '../constants';
import {
  Device,
  Vulnerability,
  Scan,
  Alert,
  NetworkSegment,
  Firmware,
  Baseline,
  DashboardOverview,
  RiskBreakdown,
  NetworkTopology,
  IntegrationStatus,
  DeviceStats,
  VulnStats,
  AlertStats,
  ScanStats
} from '../types';

// Base API configuration
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// Generic API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const json = await response.json();
    
    if (!response.ok) {
      return { success: false, error: json.error || `HTTP ${response.status}` };
    }

    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================
// DEVICE API
// ============================================

export const deviceAPI = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest<{ data: Device[]; pagination: any }>(`${API_ENDPOINTS.devices.list}${query}`);
  },

  getById: async (id: string) => {
    return apiRequest<Device>(API_ENDPOINTS.devices.byId(id));
  },

  getStats: async () => {
    return apiRequest<DeviceStats>(API_ENDPOINTS.devices.stats);
  },

  getHighRisk: async () => {
    return apiRequest<Device[]>(API_ENDPOINTS.devices.highRisk);
  },

  getOffline: async () => {
    return apiRequest<Device[]>(API_ENDPOINTS.devices.offline);
  },

  create: async (device: Partial<Device>) => {
    return apiRequest<Device>(API_ENDPOINTS.devices.list, {
      method: 'POST',
      body: JSON.stringify(device),
    });
  },

  update: async (id: string, updates: Partial<Device>) => {
    return apiRequest<Device>(API_ENDPOINTS.devices.byId(id), {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string) => {
    return apiRequest<void>(API_ENDPOINTS.devices.byId(id), {
      method: 'DELETE',
    });
  },

  quarantine: async (id: string, reason: string) => {
    return apiRequest<Device>(API_ENDPOINTS.devices.quarantine(id), {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  scan: async (id: string, scanType: string = 'vulnerability') => {
    return apiRequest<Scan>(API_ENDPOINTS.devices.scan(id), {
      method: 'POST',
      body: JSON.stringify({ scanType }),
    });
  },
};

// ============================================
// VULNERABILITY API
// ============================================

export const vulnerabilityAPI = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest<{ data: Vulnerability[]; pagination: any }>(`${API_ENDPOINTS.vulnerabilities.list}${query}`);
  },

  getById: async (id: string) => {
    return apiRequest<Vulnerability>(API_ENDPOINTS.vulnerabilities.byId(id));
  },

  getStats: async () => {
    return apiRequest<VulnStats>(API_ENDPOINTS.vulnerabilities.stats);
  },

  getCritical: async () => {
    return apiRequest<Vulnerability[]>(API_ENDPOINTS.vulnerabilities.critical);
  },

  searchNVD: async (query: string) => {
    return apiRequest<any[]>(API_ENDPOINTS.vulnerabilities.searchNvd, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },

  getByCVE: async (cveId: string) => {
    return apiRequest<any>(API_ENDPOINTS.vulnerabilities.byCve(cveId));
  },

  update: async (id: string, updates: Partial<Vulnerability>) => {
    return apiRequest<Vulnerability>(API_ENDPOINTS.vulnerabilities.byId(id), {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// ============================================
// SCAN API
// ============================================

export const scanAPI = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest<{ data: Scan[]; pagination: any }>(`${API_ENDPOINTS.scans.list}${query}`);
  },

  getById: async (id: string) => {
    return apiRequest<Scan>(API_ENDPOINTS.scans.byId(id));
  },

  getStats: async () => {
    return apiRequest<ScanStats>(API_ENDPOINTS.scans.stats);
  },

  getRecent: async (limit: number = 10) => {
    return apiRequest<Scan[]>(`${API_ENDPOINTS.scans.recent}?limit=${limit}`);
  },

  getRunning: async () => {
    return apiRequest<Scan[]>(API_ENDPOINTS.scans.running);
  },

  startQuick: async (targets?: string[]) => {
    return apiRequest<Scan>(API_ENDPOINTS.scans.quick, {
      method: 'POST',
      body: JSON.stringify({ targets }),
    });
  },

  startDiscovery: async (networks: string[]) => {
    return apiRequest<Scan>(API_ENDPOINTS.scans.discovery, {
      method: 'POST',
      body: JSON.stringify({ networks }),
    });
  },

  startVulnerability: async (deviceIds: string[]) => {
    return apiRequest<Scan>(API_ENDPOINTS.scans.vulnerability, {
      method: 'POST',
      body: JSON.stringify({ deviceIds }),
    });
  },

  cancel: async (id: string) => {
    return apiRequest<Scan>(`${API_ENDPOINTS.scans.byId(id)}/cancel`, {
      method: 'POST',
    });
  },
};

// ============================================
// ALERT API
// ============================================

export const alertAPI = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest<{ data: Alert[]; pagination: any }>(`${API_ENDPOINTS.alerts.list}${query}`);
  },

  getById: async (id: string) => {
    return apiRequest<Alert>(API_ENDPOINTS.alerts.byId(id));
  },

  getStats: async () => {
    return apiRequest<AlertStats>(API_ENDPOINTS.alerts.stats);
  },

  getActive: async () => {
    return apiRequest<Alert[]>(API_ENDPOINTS.alerts.active);
  },

  getCritical: async () => {
    return apiRequest<Alert[]>(API_ENDPOINTS.alerts.critical);
  },

  getRecent: async (limit: number = 20) => {
    return apiRequest<Alert[]>(`${API_ENDPOINTS.alerts.recent}?limit=${limit}`);
  },

  acknowledge: async (id: string, userId?: string) => {
    return apiRequest<Alert>(API_ENDPOINTS.alerts.acknowledge(id), {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  resolve: async (id: string, resolution: string, userId?: string) => {
    return apiRequest<Alert>(API_ENDPOINTS.alerts.resolve(id), {
      method: 'POST',
      body: JSON.stringify({ resolution, userId }),
    });
  },

  create: async (alert: Partial<Alert>) => {
    return apiRequest<Alert>(API_ENDPOINTS.alerts.list, {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  },
};

// ============================================
// SEGMENT API
// ============================================

export const segmentAPI = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest<{ data: NetworkSegment[]; pagination: any }>(`${API_ENDPOINTS.segments.list}${query}`);
  },

  getById: async (id: string) => {
    return apiRequest<NetworkSegment>(API_ENDPOINTS.segments.byId(id));
  },

  getTopology: async () => {
    return apiRequest<NetworkTopology>(API_ENDPOINTS.segments.topology);
  },

  create: async (segment: Partial<NetworkSegment>) => {
    return apiRequest<NetworkSegment>(API_ENDPOINTS.segments.list, {
      method: 'POST',
      body: JSON.stringify(segment),
    });
  },

  update: async (id: string, updates: Partial<NetworkSegment>) => {
    return apiRequest<NetworkSegment>(API_ENDPOINTS.segments.byId(id), {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  addFirewallRule: async (id: string, rule: any) => {
    return apiRequest<NetworkSegment>(API_ENDPOINTS.segments.firewall(id), {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  },

  quarantine: async (id: string, reason: string) => {
    return apiRequest<NetworkSegment>(`${API_ENDPOINTS.segments.byId(id)}/quarantine`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

// ============================================
// FIRMWARE API
// ============================================

export const firmwareAPI = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest<{ data: Firmware[]; pagination: any }>(`${API_ENDPOINTS.firmware.list}${query}`);
  },

  getById: async (id: string) => {
    return apiRequest<Firmware>(API_ENDPOINTS.firmware.byId(id));
  },

  getVulnerable: async () => {
    return apiRequest<Firmware[]>(API_ENDPOINTS.firmware.vulnerable);
  },

  getOutdated: async () => {
    return apiRequest<Firmware[]>(API_ENDPOINTS.firmware.outdated);
  },

  upload: async (file: File, metadata: { vendor?: string; version?: string; deviceType?: string }) => {
    const reader = new FileReader();
    return new Promise<{ success: boolean; data?: Firmware; error?: string }>((resolve) => {
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await apiRequest<Firmware>('/firmware/upload', {
          method: 'POST',
          body: JSON.stringify({
            fileName: file.name,
            fileBuffer: base64,
            ...metadata,
          }),
        });
        resolve(result);
      };
      reader.onerror = () => resolve({ success: false, error: 'Failed to read file' });
      reader.readAsDataURL(file);
    });
  },

  analyze: async (id: string) => {
    return apiRequest<Firmware>(API_ENDPOINTS.firmware.analyze(id), {
      method: 'POST',
    });
  },

  scanVirusTotal: async (id: string) => {
    return apiRequest<any>(API_ENDPOINTS.firmware.virustotal(id), {
      method: 'POST',
    });
  },
};

// ============================================
// BASELINE API
// ============================================

export const baselineAPI = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest<{ data: Baseline[]; pagination: any }>(`${API_ENDPOINTS.baselines.list}${query}`);
  },

  getById: async (id: string) => {
    return apiRequest<Baseline>(API_ENDPOINTS.baselines.byId(id));
  },

  getByDevice: async (deviceId: string) => {
    return apiRequest<Baseline[]>(API_ENDPOINTS.baselines.byDevice(deviceId));
  },

  getAnomalies: async (hours: number = 24) => {
    return apiRequest<any[]>(`${API_ENDPOINTS.baselines.anomalies}?hours=${hours}`);
  },

  create: async (baseline: Partial<Baseline>) => {
    return apiRequest<Baseline>(API_ENDPOINTS.baselines.list, {
      method: 'POST',
      body: JSON.stringify(baseline),
    });
  },

  analyze: async (id: string, metrics: Record<string, any>) => {
    return apiRequest<any>(API_ENDPOINTS.baselines.analyze(id), {
      method: 'POST',
      body: JSON.stringify({ metrics }),
    });
  },

  activate: async (id: string) => {
    return apiRequest<Baseline>(`${API_ENDPOINTS.baselines.byId(id)}/activate`, {
      method: 'POST',
    });
  },

  reset: async (id: string) => {
    return apiRequest<Baseline>(`${API_ENDPOINTS.baselines.byId(id)}/reset`, {
      method: 'POST',
    });
  },
};

// ============================================
// DASHBOARD API
// ============================================

export const dashboardAPI = {
  getOverview: async () => {
    return apiRequest<DashboardOverview>(API_ENDPOINTS.dashboard.overview);
  },

  getRiskScore: async () => {
    return apiRequest<RiskBreakdown>(API_ENDPOINTS.dashboard.riskScore);
  },

  getTrends: async (period: '24h' | '7d' | '30d' = '7d') => {
    return apiRequest<any>(`${API_ENDPOINTS.dashboard.trends}?period=${period}`);
  },

  getActivity: async (limit: number = 50) => {
    return apiRequest<any[]>(`${API_ENDPOINTS.dashboard.activity}?limit=${limit}`);
  },

  getNetworkMap: async () => {
    return apiRequest<NetworkTopology>(API_ENDPOINTS.dashboard.networkMap);
  },

  getTopRisks: async () => {
    return apiRequest<any>(API_ENDPOINTS.dashboard.topRisks);
  },

  getCompliance: async () => {
    return apiRequest<any>(API_ENDPOINTS.dashboard.compliance);
  },
};

// ============================================
// INTEGRATION API
// ============================================

export const integrationAPI = {
  getStatus: async () => {
    return apiRequest<IntegrationStatus>(API_ENDPOINTS.integrations.status);
  },

  shodanLookup: async (ip: string) => {
    return apiRequest<any>(`${API_ENDPOINTS.integrations.shodan}/host/${ip}`);
  },

  greyNoiseLookup: async (ip: string) => {
    return apiRequest<any>(`${API_ENDPOINTS.integrations.greynoise}/ip/${ip}`);
  },

  virusTotalLookup: async (hash: string) => {
    return apiRequest<any>(`${API_ENDPOINTS.integrations.virustotal}/file/${hash}`);
  },

  aiAnalyze: async (prompt: string, context: any, provider: string = 'openai') => {
    return apiRequest<any>(API_ENDPOINTS.integrations.ai, {
      method: 'POST',
      body: JSON.stringify({ prompt, context, provider }),
    });
  },
};

// Export all APIs as a single object
export const iotSentinelAPI = {
  devices: deviceAPI,
  vulnerabilities: vulnerabilityAPI,
  scans: scanAPI,
  alerts: alertAPI,
  segments: segmentAPI,
  firmware: firmwareAPI,
  baselines: baselineAPI,
  dashboard: dashboardAPI,
  integrations: integrationAPI,
};

export default iotSentinelAPI;
