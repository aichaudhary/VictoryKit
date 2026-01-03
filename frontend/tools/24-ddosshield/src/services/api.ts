import axios from 'axios';
import { Attack, TrafficData, ProtectionRule, AnalyticsData, Incident, SystemStatus, APIResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4024/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ddosshield_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ddosshield_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Attack API
export const attackAPI = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<APIResponse<Attack[]>>('/attacks', { params }),

  getById: (id: string) =>
    api.get<APIResponse<Attack>>(`/attacks/${id}`),

  updateStatus: (id: string, status: string, mitigation?: any) =>
    api.patch<APIResponse<Attack>>(`/attacks/${id}/status`, { status, mitigation }),

  getStats: () =>
    api.get<APIResponse<any>>('/attacks/stats'),
};

// Traffic API
export const trafficAPI = {
  getRealtime: () =>
    api.get<APIResponse<TrafficData[]>>('/traffic/realtime'),

  getHistorical: (params: { start: Date; end: Date; granularity?: string }) =>
    api.get<APIResponse<TrafficData[]>>('/traffic/historical', { params }),

  getByIP: (ip: string) =>
    api.get<APIResponse<TrafficData[]>>(`/traffic/ip/${ip}`),

  getAnomalies: () =>
    api.get<APIResponse<TrafficData[]>>('/traffic/anomalies'),
};

// Protection Rules API
export const protectionAPI = {
  getAll: () =>
    api.get<APIResponse<ProtectionRule[]>>('/protection'),

  create: (rule: Omit<ProtectionRule, '_id' | 'createdAt' | 'updatedAt'>) =>
    api.post<APIResponse<ProtectionRule>>('/protection', rule),

  update: (id: string, rule: Partial<ProtectionRule>) =>
    api.put<APIResponse<ProtectionRule>>(`/protection/${id}`, rule),

  delete: (id: string) =>
    api.delete<APIResponse<void>>(`/protection/${id}`),

  toggle: (id: string, enabled: boolean) =>
    api.patch<APIResponse<ProtectionRule>>(`/protection/${id}/toggle`, { enabled }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () =>
    api.get<APIResponse<AnalyticsData>>('/analytics/dashboard'),

  getTrafficChart: (period: string) =>
    api.get<APIResponse<any>>(`/analytics/traffic/${period}`),

  getAttackChart: (period: string) =>
    api.get<APIResponse<any>>(`/analytics/attacks/${period}`),

  getGeoData: () =>
    api.get<APIResponse<any>>('/analytics/geo'),
};

// Incident API
export const incidentAPI = {
  getAll: (params?: { status?: string; severity?: string }) =>
    api.get<APIResponse<Incident[]>>('/incidents', { params }),

  getById: (id: string) =>
    api.get<APIResponse<Incident>>(`/incidents/${id}`),

  create: (incident: Omit<Incident, '_id' | 'createdAt' | 'updatedAt'>) =>
    api.post<APIResponse<Incident>>('/incidents', incident),

  update: (id: string, updates: Partial<Incident>) =>
    api.put<APIResponse<Incident>>(`/incidents/${id}`, updates),

  resolve: (id: string, resolution: any) =>
    api.patch<APIResponse<Incident>>(`/incidents/${id}/resolve`, resolution),
};

// System API
export const systemAPI = {
  getStatus: () =>
    api.get<APIResponse<SystemStatus>>('/system/status'),

  getHealth: () =>
    api.get<APIResponse<any>>('/health'),

  restartProtection: () =>
    api.post<APIResponse<void>>('/system/restart'),

  updateSettings: (settings: any) =>
    api.put<APIResponse<void>>('/system/settings', settings),
};

// External Provider APIs
export const providerAPI = {
  getCloudflareStatus: () =>
    api.get<APIResponse<any>>('/providers/cloudflare/status'),

  getAkamaiStatus: () =>
    api.get<APIResponse<any>>('/providers/akamai/status'),

  getAWSShieldStatus: () =>
    api.get<APIResponse<any>>('/providers/aws/status'),

  getAzureStatus: () =>
    api.get<APIResponse<any>>('/providers/azure/status'),

  syncRules: (provider: string) =>
    api.post<APIResponse<void>>(`/providers/${provider}/sync`),

  deployRule: (provider: string, rule: any) =>
    api.post<APIResponse<void>>(`/providers/${provider}/deploy`, rule),
};

export default api;