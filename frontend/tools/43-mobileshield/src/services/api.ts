import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4043';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

// API Response wrapper
interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Dashboard API
const dashboardAPI = {
  getStats: (): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get('/api/v1/mobile/dashboard'),
  
  getRecentScans: (): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get('/api/v1/mobile/dashboard/scans'),
  
  getThreats: (): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get('/api/v1/mobile/dashboard/threats'),
};

// Apps API
const appsAPI = {
  getAll: (params?: any): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get('/api/v1/mobile/apps', { params }),
  
  getById: (id: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get(`/api/v1/mobile/apps/${id}`),
  
  upload: (formData: FormData): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post('/api/v1/mobile/apps/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000, // 5 minutes for upload
    }),
  
  update: (id: string, data: any): Promise<AxiosResponse<APIResponse>> => 
    apiClient.put(`/api/v1/mobile/apps/${id}`, data),
  
  delete: (id: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.delete(`/api/v1/mobile/apps/${id}`),
  
  quarantine: (id: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post(`/api/v1/mobile/apps/${id}/quarantine`),
  
  getReport: (id: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get(`/api/v1/mobile/apps/${id}/report`),
};

// Scans API
const scansAPI = {
  startSAST: (appId: string, config?: any): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post('/api/v1/mobile/scans/sast', { appId, ...config }),
  
  startDAST: (appId: string, config?: any): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post('/api/v1/mobile/scans/dast', { appId, ...config }),
  
  startMalware: (appId: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post('/api/v1/mobile/scans/malware', { appId }),
  
  startPentest: (appId: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post('/api/v1/mobile/scans/pentest', { appId }),
  
  getStatus: (scanId: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get(`/api/v1/mobile/scans/${scanId}`),
  
  getResults: (scanId: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get(`/api/v1/mobile/scans/${scanId}/results`),
  
  cancel: (scanId: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.delete(`/api/v1/mobile/scans/${scanId}`),
  
  getAll: (params?: any): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get('/api/v1/mobile/scans', { params }),
};

// Vulnerabilities API
const vulnerabilitiesAPI = {
  getAll: (params?: any): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get('/api/v1/mobile/vulnerabilities', { params }),
  
  getById: (id: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get(`/api/v1/mobile/vulnerabilities/${id}`),
  
  updateStatus: (id: string, status: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.put(`/api/v1/mobile/vulnerabilities/${id}`, { status }),
  
  getByOWASP: (): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get('/api/v1/mobile/vulnerabilities/owasp'),
  
  getRemediation: (id: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post(`/api/v1/mobile/vulnerabilities/${id}/remediate`),
};

// Devices API
const devicesAPI = {
  getAll: (params?: any): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get('/api/v1/mobile/devices', { params }),
  
  getById: (id: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get(`/api/v1/mobile/devices/${id}`),
  
  wipe: (id: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post(`/api/v1/mobile/devices/${id}/wipe`),
  
  lock: (id: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post(`/api/v1/mobile/devices/${id}/lock`),
  
  getInstalledApps: (id: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get(`/api/v1/mobile/devices/${id}/apps`),
  
  enroll: (data: any): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post('/api/v1/mobile/devices/enroll', data),
};

// Threats API
const threatsAPI = {
  getAll: (params?: any): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get('/api/v1/mobile/threats', { params }),
  
  getById: (id: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get(`/api/v1/mobile/threats/${id}`),
  
  mitigate: (id: string, action: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post(`/api/v1/mobile/threats/${id}/mitigate`, { action }),
  
  getIntelligence: (): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get('/api/v1/mobile/threats/intelligence'),
};

// Runtime Protection API
const runtimeAPI = {
  getPolicies: (): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get('/api/v1/mobile/runtime/policies'),
  
  createPolicy: (data: any): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post('/api/v1/mobile/runtime/policies', data),
  
  getEvents: (params?: any): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get('/api/v1/mobile/runtime/events', { params }),
  
  enableShield: (appId: string, config: any): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post('/api/v1/mobile/runtime/shield', { appId, ...config }),
};

// Compliance API
const complianceAPI = {
  getFrameworks: (): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get('/api/v1/mobile/compliance/frameworks'),
  
  assess: (appId: string, framework: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post('/api/v1/mobile/compliance/assess', { appId, framework }),
  
  getReport: (reportId: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get(`/api/v1/mobile/compliance/report/${reportId}`),
  
  attest: (reportId: string, data: any): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post('/api/v1/mobile/compliance/attest', { reportId, ...data }),
};

// Code Analysis API
const codeAPI = {
  analyze: (data: any): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post('/api/v1/mobile/code/analyze', data),
  
  getDependencies: (appId: string): Promise<AxiosResponse<APIResponse>> => 
    apiClient.get(`/api/v1/mobile/code/dependencies?appId=${appId}`),
  
  connectRepository: (data: any): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post('/api/v1/mobile/code/repository', data),
};

// ML Engine API
const mlAPI = {
  detectMalware: (binaryData: any): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post(`${import.meta.env.VITE_ML_URL}/detect-malware`, binaryData),
  
  analyzeBehavior: (data: any): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post(`${import.meta.env.VITE_ML_URL}/analyze-behavior`, data),
  
  predictExploitability: (vulnData: any): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post(`${import.meta.env.VITE_ML_URL}/predict-exploitability`, vulnData),
  
  scanCode: (codeData: any): Promise<AxiosResponse<APIResponse>> => 
    apiClient.post(`${import.meta.env.VITE_ML_URL}/scan-code`, codeData),
};

// Export consolidated API
export const mobileShieldAPI = {
  dashboard: dashboardAPI,
  apps: appsAPI,
  scans: scansAPI,
  vulnerabilities: vulnerabilitiesAPI,
  devices: devicesAPI,
  threats: threatsAPI,
  runtime: runtimeAPI,
  compliance: complianceAPI,
  code: codeAPI,
  ml: mlAPI,
};

export default mobileShieldAPI;
