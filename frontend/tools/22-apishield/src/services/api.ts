import axios from 'axios';
import type {
  API,
  Endpoint,
  Policy,
  Anomaly,
  DashboardStats,
  APIAnalytics,
  SecurityScan,
  APIShieldSettings,
  PaginatedResponse,
  APIFilters,
  EndpointFilters,
  AnomalyFilters,
  PolicyFilters,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('apishield_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

// ==================== Dashboard ====================

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get('/dashboard/stats');
  return data;
};

export const getTrafficOverview = async (timeRange: string = '24h') => {
  const { data } = await api.get('/dashboard/traffic', { params: { timeRange } });
  return data;
};

// ==================== APIs ====================

export const getAPIs = async (filters?: APIFilters): Promise<PaginatedResponse<API>> => {
  const { data } = await api.get('/apis', { params: filters });
  return data;
};

export const getAPI = async (apiId: string): Promise<API> => {
  const { data } = await api.get(`/apis/${apiId}`);
  return data;
};

export const createAPI = async (apiData: Partial<API>): Promise<API> => {
  const { data } = await api.post('/apis', apiData);
  return data;
};

export const updateAPI = async (apiId: string, updates: Partial<API>): Promise<API> => {
  const { data } = await api.put(`/apis/${apiId}`, updates);
  return data;
};

export const deleteAPI = async (apiId: string): Promise<void> => {
  await api.delete(`/apis/${apiId}`);
};

export const discoverAPI = async (specUrl: string): Promise<API> => {
  const { data } = await api.post('/apis/discover', { specUrl });
  return data;
};

export const importAPISpec = async (spec: string | object, format: string): Promise<API> => {
  const { data } = await api.post('/apis/import', { spec, format });
  return data;
};

export const getAPIAnalytics = async (apiId: string, timeRange: string = '24h'): Promise<APIAnalytics> => {
  const { data } = await api.get(`/apis/${apiId}/analytics`, { params: { timeRange } });
  return data;
};

export const syncAPISpec = async (apiId: string): Promise<API> => {
  const { data } = await api.post(`/apis/${apiId}/sync`);
  return data;
};

// ==================== Endpoints ====================

export const getEndpoints = async (filters?: EndpointFilters): Promise<PaginatedResponse<Endpoint>> => {
  const { data } = await api.get('/endpoints', { params: filters });
  return data;
};

export const getEndpoint = async (endpointId: string): Promise<Endpoint> => {
  const { data } = await api.get(`/endpoints/${endpointId}`);
  return data;
};

export const createEndpoint = async (endpointData: Partial<Endpoint>): Promise<Endpoint> => {
  const { data } = await api.post('/endpoints', endpointData);
  return data;
};

export const updateEndpoint = async (endpointId: string, updates: Partial<Endpoint>): Promise<Endpoint> => {
  const { data } = await api.put(`/endpoints/${endpointId}`, updates);
  return data;
};

export const deleteEndpoint = async (endpointId: string): Promise<void> => {
  await api.delete(`/endpoints/${endpointId}`);
};

export const deprecateEndpoint = async (endpointId: string, deprecationDate?: Date): Promise<Endpoint> => {
  const { data } = await api.post(`/endpoints/${endpointId}/deprecate`, { deprecationDate });
  return data;
};

export const getEndpointVulnerabilities = async (endpointId: string) => {
  const { data } = await api.get(`/endpoints/${endpointId}/vulnerabilities`);
  return data;
};

// ==================== Policies ====================

export const getPolicies = async (filters?: PolicyFilters): Promise<PaginatedResponse<Policy>> => {
  const { data } = await api.get('/policies', { params: filters });
  return data;
};

export const getPolicy = async (policyId: string): Promise<Policy> => {
  const { data } = await api.get(`/policies/${policyId}`);
  return data;
};

export const createPolicy = async (policyData: Partial<Policy>): Promise<Policy> => {
  const { data } = await api.post('/policies', policyData);
  return data;
};

export const updatePolicy = async (policyId: string, updates: Partial<Policy>): Promise<Policy> => {
  const { data } = await api.put(`/policies/${policyId}`, updates);
  return data;
};

export const deletePolicy = async (policyId: string): Promise<void> => {
  await api.delete(`/policies/${policyId}`);
};

export const togglePolicy = async (policyId: string, isActive: boolean): Promise<Policy> => {
  const { data } = await api.patch(`/policies/${policyId}/toggle`, { isActive });
  return data;
};

export const attachPolicyToAPI = async (policyId: string, apiId: string): Promise<Policy> => {
  const { data } = await api.post(`/policies/${policyId}/attach/api/${apiId}`);
  return data;
};

export const detachPolicyFromAPI = async (policyId: string, apiId: string): Promise<Policy> => {
  const { data } = await api.post(`/policies/${policyId}/detach/api/${apiId}`);
  return data;
};

export const getPolicyTemplates = async (): Promise<Partial<Policy>[]> => {
  const { data } = await api.get('/policies/templates');
  return data;
};

// ==================== Anomalies ====================

export const getAnomalies = async (filters?: AnomalyFilters): Promise<PaginatedResponse<Anomaly>> => {
  const { data } = await api.get('/anomalies', { params: filters });
  return data;
};

export const getAnomaly = async (anomalyId: string): Promise<Anomaly> => {
  const { data } = await api.get(`/anomalies/${anomalyId}`);
  return data;
};

export const updateAnomalyStatus = async (
  anomalyId: string, 
  status: string, 
  resolution?: { action: string; notes: string }
): Promise<Anomaly> => {
  const { data } = await api.patch(`/anomalies/${anomalyId}/status`, { status, resolution });
  return data;
};

export const getAnomalyStats = async (timeRange: string = '7d') => {
  const { data } = await api.get('/anomalies/stats', { params: { timeRange } });
  return data;
};

// ==================== Security Scanning ====================

export const startSecurityScan = async (apiId: string, scanType: 'quick' | 'full' | 'compliance' = 'quick'): Promise<SecurityScan> => {
  const { data } = await api.post(`/security/scan`, { apiId, type: scanType });
  return data;
};

export const getScanHistory = async (apiId?: string): Promise<SecurityScan[]> => {
  const { data } = await api.get('/security/scans', { params: { apiId } });
  return data;
};

export const getScan = async (scanId: string): Promise<SecurityScan> => {
  const { data } = await api.get(`/security/scans/${scanId}`);
  return data;
};

export const getSecurityOverview = async () => {
  const { data } = await api.get('/security/overview');
  return data;
};

export const getOWASPCompliance = async (apiId: string) => {
  const { data } = await api.get(`/security/owasp/${apiId}`);
  return data;
};

// ==================== Analytics ====================

export const getGlobalAnalytics = async (timeRange: string = '24h') => {
  const { data } = await api.get('/analytics/global', { params: { timeRange } });
  return data;
};

export const getErrorAnalytics = async (timeRange: string = '24h') => {
  const { data } = await api.get('/analytics/errors', { params: { timeRange } });
  return data;
};

export const getLatencyAnalytics = async (timeRange: string = '24h') => {
  const { data } = await api.get('/analytics/latency', { params: { timeRange } });
  return data;
};

export const getConsumerAnalytics = async (apiId?: string, timeRange: string = '24h') => {
  const { data } = await api.get('/analytics/consumers', { params: { apiId, timeRange } });
  return data;
};

export const getGeographicAnalytics = async (timeRange: string = '24h') => {
  const { data } = await api.get('/analytics/geographic', { params: { timeRange } });
  return data;
};

// ==================== Settings ====================

export const getSettings = async (): Promise<APIShieldSettings> => {
  const { data } = await api.get('/settings');
  return data;
};

export const updateSettings = async (settings: Partial<APIShieldSettings>): Promise<APIShieldSettings> => {
  const { data } = await api.put('/settings', settings);
  return data;
};

export const testIntegration = async (integration: string, config: Record<string, unknown>) => {
  const { data } = await api.post('/settings/test-integration', { integration, config });
  return data;
};

export const getAPIKeys = async () => {
  const { data } = await api.get('/settings/api-keys');
  return data;
};

export const createAPIKey = async (name: string, scopes: string[]) => {
  const { data } = await api.post('/settings/api-keys', { name, scopes });
  return data;
};

export const revokeAPIKey = async (keyId: string) => {
  await api.delete(`/settings/api-keys/${keyId}`);
};

// ==================== Gateways ====================

export const getConnectedGateways = async () => {
  const { data } = await api.get('/gateways');
  return data;
};

export const syncGateway = async (gatewayId: string) => {
  const { data } = await api.post(`/gateways/${gatewayId}/sync`);
  return data;
};

export const importFromGateway = async (gatewayId: string) => {
  const { data } = await api.post(`/gateways/${gatewayId}/import`);
  return data;
};

// ==================== Health ====================

export const healthCheck = async () => {
  const { data } = await api.get('/health');
  return data;
};

// ==================== API Service Object ====================

export const apiService = {
  // Dashboard
  getDashboardStats,
  getTrafficOverview,
  // APIs
  getAPIs,
  getAPI,
  createAPI,
  updateAPI,
  deleteAPI,
  discoverAPI,
  importAPISpec,
  getAPIAnalytics,
  syncAPISpec,
  // Endpoints
  getEndpoints,
  getEndpoint,
  createEndpoint,
  updateEndpoint,
  deleteEndpoint,
  deprecateEndpoint,
  getEndpointVulnerabilities,
  // Policies
  getPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  deletePolicy,
  togglePolicy,
  attachPolicyToAPI,
  detachPolicyFromAPI,
  getPolicyTemplates,
  // Anomalies
  getAnomalies,
  getAnomaly,
  updateAnomalyStatus,
  getAnomalyStats,
  // Security
  startSecurityScan,
  getScanHistory,
  getScan,
  getSecurityOverview,
  getOWASPCompliance,
  // Analytics
  getGlobalAnalytics,
  getErrorAnalytics,
  getLatencyAnalytics,
  getConsumerAnalytics,
  getGeographicAnalytics,
  // Settings
  getSettings,
  updateSettings,
  testIntegration,
  getAPIKeys,
  createAPIKey,
  revokeAPIKey,
  // Gateways
  getConnectedGateways,
  syncGateway,
  importFromGateway,
  // Health
  healthCheck,
};

export default apiService;
