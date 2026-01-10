// WirelessHunter API Service - Enterprise Wireless Network Security Monitoring

import { 
  WirelessNetwork, 
  AccessPoint, 
  WirelessClient, 
  WirelessSecurityAlert,
  DashboardData,
  ThreatDetectionResult,
  ProviderStatus
} from '../types';
import { API_BASE_URL } from '../constants';

class WirelessHunterAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ==================== STATUS & DASHBOARD ====================

  async getStatus() {
    return this.request<{ status: string; service: string; version: string; timestamp: string }>('/status');
  }

  async getDashboard(): Promise<DashboardData> {
    const response = await this.request<{ success: boolean; data: DashboardData }>('/dashboard');
    return response.data;
  }

  // ==================== NETWORK MANAGEMENT ====================

  networks = {
    getAll: async (filters?: {
      status?: string;
      networkType?: string;
      isRogue?: boolean;
      building?: string;
      limit?: number;
    }): Promise<WirelessNetwork[]> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) params.append(key, String(value));
        });
      }
      const response = await this.request<{ success: boolean; count: number; data: WirelessNetwork[] }>(
        `/networks?${params.toString()}`
      );
      return response.data;
    },

    getById: async (networkId: string): Promise<WirelessNetwork> => {
      const response = await this.request<{ success: boolean; data: WirelessNetwork }>(`/networks/${networkId}`);
      return response.data;
    },

    create: async (network: Partial<WirelessNetwork>): Promise<WirelessNetwork> => {
      const response = await this.request<{ success: boolean; data: WirelessNetwork }>('/networks', {
        method: 'POST',
        body: JSON.stringify(network),
      });
      return response.data;
    },

    update: async (networkId: string, updates: Partial<WirelessNetwork>): Promise<WirelessNetwork> => {
      const response = await this.request<{ success: boolean; data: WirelessNetwork }>(`/networks/${networkId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return response.data;
    },

    delete: async (networkId: string): Promise<void> => {
      await this.request(`/networks/${networkId}`, { method: 'DELETE' });
    },
  };

  // ==================== ACCESS POINT MANAGEMENT ====================

  accessPoints = {
    getAll: async (filters?: {
      status?: string;
      building?: string;
      manufacturer?: string;
      controller?: string;
      limit?: number;
    }): Promise<AccessPoint[]> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) params.append(key, String(value));
        });
      }
      const response = await this.request<{ success: boolean; count: number; data: AccessPoint[] }>(
        `/access-points?${params.toString()}`
      );
      return response.data;
    },

    getById: async (apId: string): Promise<AccessPoint> => {
      const response = await this.request<{ success: boolean; data: AccessPoint }>(`/access-points/${apId}`);
      return response.data;
    },

    create: async (ap: Partial<AccessPoint>): Promise<AccessPoint> => {
      const response = await this.request<{ success: boolean; data: AccessPoint }>('/access-points', {
        method: 'POST',
        body: JSON.stringify(ap),
      });
      return response.data;
    },

    update: async (apId: string, updates: Partial<AccessPoint>): Promise<AccessPoint> => {
      const response = await this.request<{ success: boolean; data: AccessPoint }>(`/access-points/${apId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return response.data;
    },

    delete: async (apId: string): Promise<void> => {
      await this.request(`/access-points/${apId}`, { method: 'DELETE' });
    },
  };

  // ==================== CLIENT MANAGEMENT ====================

  clients = {
    getAll: async (filters?: {
      connectionStatus?: string;
      deviceType?: string;
      trustLevel?: string;
      ssid?: string;
      limit?: number;
    }): Promise<WirelessClient[]> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) params.append(key, String(value));
        });
      }
      const response = await this.request<{ success: boolean; count: number; data: WirelessClient[] }>(
        `/clients?${params.toString()}`
      );
      return response.data;
    },

    getById: async (clientId: string): Promise<WirelessClient> => {
      const response = await this.request<{ success: boolean; data: WirelessClient }>(`/clients/${clientId}`);
      return response.data;
    },

    getByMac: async (macAddress: string): Promise<WirelessClient> => {
      const response = await this.request<{ success: boolean; data: WirelessClient }>(`/clients/mac/${macAddress}`);
      return response.data;
    },

    create: async (client: Partial<WirelessClient>): Promise<WirelessClient> => {
      const response = await this.request<{ success: boolean; data: WirelessClient }>('/clients', {
        method: 'POST',
        body: JSON.stringify(client),
      });
      return response.data;
    },

    update: async (clientId: string, updates: Partial<WirelessClient>): Promise<WirelessClient> => {
      const response = await this.request<{ success: boolean; data: WirelessClient }>(`/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return response.data;
    },

    block: async (clientId: string, reason: string): Promise<WirelessClient> => {
      const response = await this.request<{ success: boolean; data: WirelessClient }>(`/clients/${clientId}/block`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      return response.data;
    },
  };

  // ==================== SECURITY ALERTS ====================

  alerts = {
    getAll: async (filters?: {
      status?: string;
      severity?: string;
      alertType?: string;
      building?: string;
      limit?: number;
    }): Promise<WirelessSecurityAlert[]> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) params.append(key, String(value));
        });
      }
      const response = await this.request<{ success: boolean; count: number; data: WirelessSecurityAlert[] }>(
        `/alerts?${params.toString()}`
      );
      return response.data;
    },

    getById: async (alertId: string): Promise<WirelessSecurityAlert> => {
      const response = await this.request<{ success: boolean; data: WirelessSecurityAlert }>(`/alerts/${alertId}`);
      return response.data;
    },

    create: async (alert: Partial<WirelessSecurityAlert>): Promise<WirelessSecurityAlert> => {
      const response = await this.request<{ success: boolean; data: WirelessSecurityAlert }>('/alerts', {
        method: 'POST',
        body: JSON.stringify(alert),
      });
      return response.data;
    },

    acknowledge: async (alertId: string, userId: string): Promise<WirelessSecurityAlert> => {
      const response = await this.request<{ success: boolean; data: WirelessSecurityAlert }>(
        `/alerts/${alertId}/acknowledge`,
        {
          method: 'POST',
          body: JSON.stringify({ userId }),
        }
      );
      return response.data;
    },

    resolve: async (
      alertId: string,
      resolution: { resolvedBy: string; notes: string; rootCause?: string }
    ): Promise<WirelessSecurityAlert> => {
      const response = await this.request<{ success: boolean; data: WirelessSecurityAlert }>(
        `/alerts/${alertId}/resolve`,
        {
          method: 'POST',
          body: JSON.stringify(resolution),
        }
      );
      return response.data;
    },
  };

  // ==================== THREAT DETECTION ====================

  threatDetection = {
    scanRogueAPs: async (): Promise<ThreatDetectionResult> => {
      const response = await this.request<{ success: boolean; data: ThreatDetectionResult }>('/scan/rogue-aps', {
        method: 'POST',
      });
      return response.data;
    },

    scanWeakEncryption: async (): Promise<{ weakNetworksFound: number; alerts: WirelessSecurityAlert[] }> => {
      const response = await this.request<{
        success: boolean;
        data: { weakNetworksFound: number; alerts: WirelessSecurityAlert[] };
      }>('/scan/weak-encryption', { method: 'POST' });
      return response.data;
    },

    analyzeSignals: async (): Promise<{ apsAnalyzed: number; anomaliesDetected: number; anomalies: WirelessSecurityAlert[] }> => {
      const response = await this.request<{
        success: boolean;
        data: { apsAnalyzed: number; anomaliesDetected: number; anomalies: WirelessSecurityAlert[] };
      }>('/scan/signal-anomalies', { method: 'POST' });
      return response.data;
    },

    performThreatHunting: async (): Promise<{
      networks: number;
      clients: number;
      accessPoints: number;
      mlAnalysis: any;
      timestamp: string;
    }> => {
      const response = await this.request<{
        success: boolean;
        data: {
          networks: number;
          clients: number;
          accessPoints: number;
          mlAnalysis: any;
          timestamp: string;
        };
      }>('/threat-hunting', { method: 'POST' });
      return response.data;
    },
  };

  // ==================== PROVIDERS ====================

  providers = {
    getStatus: async (): Promise<ProviderStatus[]> => {
      const response = await this.request<{ success: boolean; data: ProviderStatus[] }>('/providers');
      return response.data;
    },

    sync: async (providerId: string): Promise<{ success: boolean; provider: string; message: string }> => {
      const response = await this.request<{
        success: boolean;
        data: { success: boolean; provider: string; message: string };
      }>(`/providers/${providerId}/sync`, { method: 'POST' });
      return response.data;
    },
  };

  // ==================== CONFIG & REPORTS ====================

  config = {
    get: async (): Promise<any> => {
      const response = await this.request<{ success: boolean; config: any }>('/config');
      return response.config;
    },

    update: async (config: any): Promise<any> => {
      const response = await this.request<{ success: boolean; config: any }>('/config', {
        method: 'PUT',
        body: JSON.stringify(config),
      });
      return response.config;
    },
  };

  reports = {
    getAll: async (): Promise<any[]> => {
      const response = await this.request<{ success: boolean; reports: any[]; total: number }>('/reports');
      return response.reports;
    },

    getById: async (reportId: string): Promise<any> => {
      const response = await this.request<{ success: boolean; id: string; status: string }>(`/reports/${reportId}`);
      return response;
    },
  };
}

export const wirelessHunterAPI = new WirelessHunterAPI();
export default wirelessHunterAPI;
