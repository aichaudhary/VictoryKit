import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4008/api/v1';
const ML_ENGINE_URL = import.meta.env.VITE_ML_URL || 'http://localhost:8008';

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
export interface Repository {
  id: string;
  name: string;
  url: string;
  branch: string;
  lastScan: string;
  status: 'connected' | 'scanning' | 'error';
}

export interface CodeScan {
  id: string;
  repositoryId: string;
  branch: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  completedAt?: string;
  vulnerabilities: VulnerabilitySummary;
}

export interface VulnerabilitySummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface Vulnerability {
  id: string;
  scanId: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  type: string;
  file: string;
  line: number;
  column: number;
  title: string;
  description: string;
  cwe: string;
  fix?: string;
  snippet: string;
}

export interface SecurityRule {
  id: string;
  name: string;
  category: string;
  severity: string;
  enabled: boolean;
  description: string;
}

export interface DashboardStats {
  totalScans: number;
  vulnerabilities: number;
  codeQuality: number;
  secureRepos: number;
  trendsData: { date: string; vulns: number }[];
}

// API Functions

// Dashboard
export const dashboard = {
  getStats: (): Promise<AxiosResponse<DashboardStats>> =>
    apiClient.get('/codesentinel/dashboard/stats'),
  
  getRecentScans: (limit: number = 10): Promise<AxiosResponse<CodeScan[]>> =>
    apiClient.get(`/codesentinel/dashboard/recent-scans?limit=${limit}`),
  
  getVulnerabilityTrends: (days: number = 30): Promise<AxiosResponse<any>> =>
    apiClient.get(`/codesentinel/dashboard/trends?days=${days}`),
};

// Repositories
export const repositories = {
  list: (): Promise<AxiosResponse<Repository[]>> =>
    apiClient.get('/codesentinel/repositories'),
  
  get: (id: string): Promise<AxiosResponse<Repository>> =>
    apiClient.get(`/codesentinel/repositories/${id}`),
  
  connect: (data: { url: string; token?: string }): Promise<AxiosResponse<Repository>> =>
    apiClient.post('/codesentinel/repositories', data),
  
  disconnect: (id: string): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/codesentinel/repositories/${id}`),
  
  sync: (id: string): Promise<AxiosResponse<Repository>> =>
    apiClient.post(`/codesentinel/repositories/${id}/sync`),
};

// Scans
export const scans = {
  list: (params?: { repositoryId?: string; status?: string }): Promise<AxiosResponse<CodeScan[]>> =>
    apiClient.get('/codesentinel/scans', { params }),
  
  get: (id: string): Promise<AxiosResponse<CodeScan>> =>
    apiClient.get(`/codesentinel/scans/${id}`),
  
  start: (data: { repositoryId: string; branch: string; options?: object }): Promise<AxiosResponse<CodeScan>> =>
    apiClient.post('/codesentinel/scans', data),
  
  cancel: (id: string): Promise<AxiosResponse<void>> =>
    apiClient.post(`/codesentinel/scans/${id}/cancel`),
  
  getResults: (id: string): Promise<AxiosResponse<Vulnerability[]>> =>
    apiClient.get(`/codesentinel/scans/${id}/results`),
};

// Vulnerabilities
export const vulnerabilities = {
  list: (params?: { severity?: string; type?: string; scanId?: string }): Promise<AxiosResponse<Vulnerability[]>> =>
    apiClient.get('/codesentinel/vulnerabilities', { params }),
  
  get: (id: string): Promise<AxiosResponse<Vulnerability>> =>
    apiClient.get(`/codesentinel/vulnerabilities/${id}`),
  
  updateStatus: (id: string, status: string): Promise<AxiosResponse<Vulnerability>> =>
    apiClient.patch(`/codesentinel/vulnerabilities/${id}`, { status }),
  
  getFix: (id: string): Promise<AxiosResponse<{ fix: string; explanation: string }>> =>
    apiClient.get(`/codesentinel/vulnerabilities/${id}/fix`),
};

// Security Rules
export const rules = {
  list: (): Promise<AxiosResponse<SecurityRule[]>> =>
    apiClient.get('/codesentinel/rules'),
  
  get: (id: string): Promise<AxiosResponse<SecurityRule>> =>
    apiClient.get(`/codesentinel/rules/${id}`),
  
  toggle: (id: string, enabled: boolean): Promise<AxiosResponse<SecurityRule>> =>
    apiClient.patch(`/codesentinel/rules/${id}`, { enabled }),
  
  import: (config: object): Promise<AxiosResponse<void>> =>
    apiClient.post('/codesentinel/rules/import', config),
};

// Reports
export const reports = {
  generate: (scanId: string, format: 'pdf' | 'json' | 'sarif' = 'pdf'): Promise<AxiosResponse<Blob>> =>
    apiClient.get(`/codesentinel/reports/${scanId}?format=${format}`, { responseType: 'blob' }),
  
  getHistory: (): Promise<AxiosResponse<any[]>> =>
    apiClient.get('/codesentinel/reports'),
};

// ML Engine
export const ml = {
  analyzeCode: (data: { code: string; language: string }): Promise<AxiosResponse<any>> =>
    axios.post(`${ML_ENGINE_URL}/analyze`, data),
  
  suggestFix: (vulnerabilityId: string): Promise<AxiosResponse<any>> =>
    axios.post(`${ML_ENGINE_URL}/suggest-fix`, { vulnerabilityId }),
  
  classifyVulnerability: (code: string): Promise<AxiosResponse<any>> =>
    axios.post(`${ML_ENGINE_URL}/classify`, { code }),
};

// Analytics
export const analytics = {
  getOverview: (): Promise<AxiosResponse<any>> =>
    apiClient.get('/codesentinel/analytics/overview'),
  
  getLanguageBreakdown: (): Promise<AxiosResponse<any>> =>
    apiClient.get('/codesentinel/analytics/languages'),
  
  getVulnerabilityTypes: (): Promise<AxiosResponse<any>> =>
    apiClient.get('/codesentinel/analytics/vulnerability-types'),
};

// Export default API object
export default {
  dashboard,
  repositories,
  scans,
  vulnerabilities,
  rules,
  reports,
  ml,
  analytics,
};
