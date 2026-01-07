import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4010/api/v1';
const ML_ENGINE_URL = import.meta.env.VITE_ML_URL || 'http://localhost:8010';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface DataAsset {
  id: string;
  name: string;
  type: string;
  source: string;
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  sensitiveDataTypes: string[];
  protectionStatus: 'protected' | 'unprotected' | 'partial';
  lastScanned: string;
}

export interface DiscoveryScan {
  id: string;
  source: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress: number;
  findings: { pii: number; pci: number; phi: number; credentials: number };
  startedAt: string;
  completedAt?: string;
}

export interface ProtectionPolicy {
  id: string;
  name: string;
  type: 'encryption' | 'masking' | 'tokenization' | 'access-control';
  appliedTo: string[];
  status: 'active' | 'inactive';
  rules: object[];
}

export interface AccessEvent {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: string;
  allowed: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface DashboardStats {
  totalDataAssets: number;
  protectedAssets: number;
  sensitiveRecords: number;
  accessEvents: number;
}

// API Functions

// Dashboard
export const dashboard = {
  getStats: (): Promise<AxiosResponse<DashboardStats>> =>
    apiClient.get('/dataguardian/dashboard/stats'),
  
  getRecentDiscoveries: (limit: number = 10): Promise<AxiosResponse<DiscoveryScan[]>> =>
    apiClient.get(`/dataguardian/dashboard/discoveries?limit=${limit}`),
  
  getProtectionOverview: (): Promise<AxiosResponse<any>> =>
    apiClient.get('/dataguardian/dashboard/protection'),
};

// Data Discovery
export const discovery = {
  list: (params?: { status?: string; source?: string }): Promise<AxiosResponse<DiscoveryScan[]>> =>
    apiClient.get('/dataguardian/discovery/scans', { params }),
  
  start: (data: { source: string; type: string; options?: object }): Promise<AxiosResponse<DiscoveryScan>> =>
    apiClient.post('/dataguardian/discovery/scan', data),
  
  getResults: (scanId: string): Promise<AxiosResponse<any>> =>
    apiClient.get(`/dataguardian/discovery/scans/${scanId}/results`),
  
  cancel: (scanId: string): Promise<AxiosResponse<void>> =>
    apiClient.post(`/dataguardian/discovery/scans/${scanId}/cancel`),
};

// Data Classification
export const classification = {
  getCategories: (): Promise<AxiosResponse<any[]>> =>
    apiClient.get('/dataguardian/classification/categories'),
  
  classify: (assetId: string, classification: string): Promise<AxiosResponse<DataAsset>> =>
    apiClient.patch(`/dataguardian/classification/${assetId}`, { classification }),
  
  autoClassify: (scanId: string): Promise<AxiosResponse<any>> =>
    apiClient.post(`/dataguardian/classification/auto/${scanId}`),
  
  getRules: (): Promise<AxiosResponse<any[]>> =>
    apiClient.get('/dataguardian/classification/rules'),
};

// Data Protection
export const protection = {
  getPolicies: (): Promise<AxiosResponse<ProtectionPolicy[]>> =>
    apiClient.get('/dataguardian/protection/policies'),
  
  createPolicy: (data: Partial<ProtectionPolicy>): Promise<AxiosResponse<ProtectionPolicy>> =>
    apiClient.post('/dataguardian/protection/policies', data),
  
  applyPolicy: (policyId: string, assetIds: string[]): Promise<AxiosResponse<void>> =>
    apiClient.post(`/dataguardian/protection/policies/${policyId}/apply`, { assetIds }),
  
  getStatus: (assetId: string): Promise<AxiosResponse<any>> =>
    apiClient.get(`/dataguardian/protection/status/${assetId}`),
};

// Encryption
export const encryption = {
  getKeys: (): Promise<AxiosResponse<any[]>> =>
    apiClient.get('/dataguardian/encryption/keys'),
  
  createKey: (data: { name: string; algorithm: string }): Promise<AxiosResponse<any>> =>
    apiClient.post('/dataguardian/encryption/keys', data),
  
  encrypt: (data: { assetId: string; keyId: string }): Promise<AxiosResponse<any>> =>
    apiClient.post('/dataguardian/encryption/encrypt', data),
  
  rotateKey: (keyId: string): Promise<AxiosResponse<any>> =>
    apiClient.post(`/dataguardian/encryption/keys/${keyId}/rotate`),
};

// Access Control
export const access = {
  getEvents: (params?: { userId?: string; riskLevel?: string }): Promise<AxiosResponse<AccessEvent[]>> =>
    apiClient.get('/dataguardian/access/events', { params }),
  
  getPolicies: (): Promise<AxiosResponse<any[]>> =>
    apiClient.get('/dataguardian/access/policies'),
  
  createPolicy: (data: object): Promise<AxiosResponse<any>> =>
    apiClient.post('/dataguardian/access/policies', data),
  
  audit: (assetId: string): Promise<AxiosResponse<any>> =>
    apiClient.get(`/dataguardian/access/audit/${assetId}`),
};

// Monitoring
export const monitoring = {
  getAlerts: (): Promise<AxiosResponse<any[]>> =>
    apiClient.get('/dataguardian/monitoring/alerts'),
  
  getMetrics: (timeRange: string = '24h'): Promise<AxiosResponse<any>> =>
    apiClient.get(`/dataguardian/monitoring/metrics?range=${timeRange}`),
  
  acknowledgeAlert: (alertId: string): Promise<AxiosResponse<void>> =>
    apiClient.post(`/dataguardian/monitoring/alerts/${alertId}/acknowledge`),
};

// Reports
export const reports = {
  generate: (type: string, format: 'pdf' | 'xlsx' | 'json' = 'pdf'): Promise<AxiosResponse<Blob>> =>
    apiClient.get(`/dataguardian/reports/${type}?format=${format}`, { responseType: 'blob' }),
  
  getHistory: (): Promise<AxiosResponse<any[]>> =>
    apiClient.get('/dataguardian/reports'),
};

// ML Engine
export const ml = {
  classifyData: (data: { content: string }): Promise<AxiosResponse<any>> =>
    axios.post(`${ML_ENGINE_URL}/classify`, data),
  
  detectSensitive: (data: { text: string }): Promise<AxiosResponse<any>> =>
    axios.post(`${ML_ENGINE_URL}/detect-sensitive`, data),
  
  riskAnalysis: (assetId: string): Promise<AxiosResponse<any>> =>
    axios.post(`${ML_ENGINE_URL}/risk-analysis`, { assetId }),
};

// Export default API object
export default {
  dashboard,
  discovery,
  classification,
  protection,
  encryption,
  access,
  monitoring,
  reports,
  ml,
};
