import axios from 'axios';
import type { 
  WAFInstance, 
  WAFRule, 
  WAFPolicy, 
  AttackLog, 
  DashboardMetrics,
  TrafficStats,
  ThreatIndicator,
  ApiResponse,
  AttackLogFilters,
  RuleFilters
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('waf_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('waf_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== Dashboard ====================
export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const { data } = await api.get<ApiResponse<DashboardMetrics>>('/dashboard/metrics');
  return data.data;
};

export const getDashboardStats = async (period: '1h' | '24h' | '7d' | '30d' = '24h') => {
  const { data } = await api.get(`/dashboard/stats?period=${period}`);
  return data.data;
};

// ==================== WAF Instances ====================
export const getWAFInstances = async (): Promise<WAFInstance[]> => {
  const { data } = await api.get<ApiResponse<WAFInstance[]>>('/instances');
  return data.data;
};

export const getWAFInstance = async (id: string): Promise<WAFInstance> => {
  const { data } = await api.get<ApiResponse<WAFInstance>>(`/instances/${id}`);
  return data.data;
};

export const createWAFInstance = async (instance: Partial<WAFInstance>): Promise<WAFInstance> => {
  const { data } = await api.post<ApiResponse<WAFInstance>>('/instances', instance);
  return data.data;
};

export const updateWAFInstance = async (id: string, updates: Partial<WAFInstance>): Promise<WAFInstance> => {
  const { data } = await api.put<ApiResponse<WAFInstance>>(`/instances/${id}`, updates);
  return data.data;
};

export const deleteWAFInstance = async (id: string): Promise<void> => {
  await api.delete(`/instances/${id}`);
};

export const syncWAFInstance = async (id: string): Promise<WAFInstance> => {
  const { data } = await api.post<ApiResponse<WAFInstance>>(`/instances/${id}/sync`);
  return data.data;
};

export const testWAFConnection = async (config: Partial<WAFInstance>): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.post('/instances/test-connection', config);
  return data;
};

// ==================== WAF Rules ====================
export const getWAFRules = async (filters?: RuleFilters): Promise<WAFRule[]> => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, Array.isArray(value) ? value.join(',') : String(value));
      }
    });
  }
  const { data } = await api.get<ApiResponse<WAFRule[]>>(`/rules?${params}`);
  return data.data;
};

export const getWAFRule = async (id: string): Promise<WAFRule> => {
  const { data } = await api.get<ApiResponse<WAFRule>>(`/rules/${id}`);
  return data.data;
};

export const createWAFRule = async (rule: Partial<WAFRule>): Promise<WAFRule> => {
  const { data } = await api.post<ApiResponse<WAFRule>>('/rules', rule);
  return data.data;
};

export const updateWAFRule = async (id: string, updates: Partial<WAFRule>): Promise<WAFRule> => {
  const { data } = await api.put<ApiResponse<WAFRule>>(`/rules/${id}`, updates);
  return data.data;
};

export const deleteWAFRule = async (id: string): Promise<void> => {
  await api.delete(`/rules/${id}`);
};

export const toggleWAFRule = async (id: string, enabled: boolean): Promise<WAFRule> => {
  const { data } = await api.patch<ApiResponse<WAFRule>>(`/rules/${id}/toggle`, { enabled });
  return data.data;
};

export const testWAFRule = async (ruleId: string, testPayload: string): Promise<{ matched: boolean; details: any }> => {
  const { data } = await api.post(`/rules/${ruleId}/test`, { payload: testPayload });
  return data.data;
};

export const optimizeRules = async (): Promise<{ optimizations: any[]; mlScore: number }> => {
  const { data } = await api.post('/rules/optimize');
  return data.data;
};

// ==================== WAF Policies ====================
export const getWAFPolicies = async (): Promise<WAFPolicy[]> => {
  const { data } = await api.get<ApiResponse<WAFPolicy[]>>('/policies');
  return data.data;
};

export const getWAFPolicy = async (id: string): Promise<WAFPolicy> => {
  const { data } = await api.get<ApiResponse<WAFPolicy>>(`/policies/${id}`);
  return data.data;
};

export const createWAFPolicy = async (policy: Partial<WAFPolicy>): Promise<WAFPolicy> => {
  const { data } = await api.post<ApiResponse<WAFPolicy>>('/policies', policy);
  return data.data;
};

export const updateWAFPolicy = async (id: string, updates: Partial<WAFPolicy>): Promise<WAFPolicy> => {
  const { data } = await api.put<ApiResponse<WAFPolicy>>(`/policies/${id}`, updates);
  return data.data;
};

export const deleteWAFPolicy = async (id: string): Promise<void> => {
  await api.delete(`/policies/${id}`);
};

export const applyPolicyToInstances = async (policyId: string, instanceIds: string[]): Promise<void> => {
  await api.post(`/policies/${policyId}/apply`, { instanceIds });
};

// ==================== Attack Logs ====================
export const getAttackLogs = async (
  filters?: AttackLogFilters,
  page: number = 1,
  limit: number = 50
): Promise<{ logs: AttackLog[]; total: number; pages: number }> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          params.append(key, value.toISOString());
        } else if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, String(value));
        }
      }
    });
  }
  const { data } = await api.get(`/events?${params}`);
  return {
    logs: data.data,
    total: data.pagination?.total || 0,
    pages: data.pagination?.pages || 1,
  };
};

export const getAttackLogDetails = async (id: string): Promise<AttackLog> => {
  const { data } = await api.get<ApiResponse<AttackLog>>(`/events/${id}`);
  return data.data;
};

export const exportAttackLogs = async (filters?: AttackLogFilters, format: 'json' | 'csv' = 'json'): Promise<Blob> => {
  const params = new URLSearchParams({ format });
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }
  const { data } = await api.get(`/events/export?${params}`, { responseType: 'blob' });
  return data;
};

// ==================== Traffic Analytics ====================
export const getTrafficStats = async (
  period: '1h' | '6h' | '24h' | '7d' | '30d' = '24h',
  instanceId?: string
): Promise<TrafficStats[]> => {
  const params = new URLSearchParams({ period });
  if (instanceId) params.append('instanceId', instanceId);
  const { data } = await api.get(`/traffic/stats?${params}`);
  return data.data;
};

export const getTrafficByCountry = async (period: string = '24h'): Promise<Record<string, number>> => {
  const { data } = await api.get(`/traffic/by-country?period=${period}`);
  return data.data;
};

export const getTrafficByCategory = async (period: string = '24h'): Promise<Record<string, number>> => {
  const { data } = await api.get(`/traffic/by-category?period=${period}`);
  return data.data;
};

export const getTopAttackedEndpoints = async (limit: number = 10): Promise<{ endpoint: string; count: number }[]> => {
  const { data } = await api.get(`/traffic/top-endpoints?limit=${limit}`);
  return data.data;
};

// ==================== Threat Intelligence ====================
export const getThreatIndicators = async (
  type?: string,
  page: number = 1,
  limit: number = 50
): Promise<{ indicators: ThreatIndicator[]; total: number }> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (type) params.append('type', type);
  const { data } = await api.get(`/threats/indicators?${params}`);
  return { indicators: data.data, total: data.pagination?.total || 0 };
};

export const checkIPReputation = async (ip: string): Promise<{
  ip: string;
  reputation: number;
  threats: string[];
  sources: string[];
  lastSeen?: Date;
}> => {
  const { data } = await api.post('/threats/check-ip', { ip });
  return data.data;
};

export const importThreatFeed = async (feedUrl: string, type: string): Promise<{ imported: number }> => {
  const { data } = await api.post('/threats/import-feed', { feedUrl, type });
  return data.data;
};

// ==================== Settings ====================
export const getSettings = async () => {
  const { data } = await api.get('/settings');
  return data.data;
};

export const updateSettings = async (settings: Record<string, any>) => {
  const { data } = await api.put('/settings', settings);
  return data.data;
};

export const testIntegration = async (integrationType: string, config: Record<string, any>) => {
  const { data } = await api.post('/settings/test-integration', { type: integrationType, config });
  return data;
};

export default api;
