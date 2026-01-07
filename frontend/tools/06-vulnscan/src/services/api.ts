import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4006';
const ML_URL = import.meta.env.VITE_ML_URL || 'http://localhost:8006';

class VulnScanAPI {
  private api: AxiosInstance;
  private mlApi: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/api/v1/vuln`,
      timeout: 60000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.mlApi = axios.create({
      baseURL: ML_URL,
      timeout: 120000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Dashboard
  dashboard = {
    getStats: (): Promise<AxiosResponse> => this.api.get('/dashboard'),
    getAlerts: (): Promise<AxiosResponse> => this.api.get('/dashboard/alerts'),
    getTrends: (): Promise<AxiosResponse> => this.api.get('/dashboard/trends'),
  };

  // Scanning
  scan = {
    start: (config: {
      type: string;
      targets: string[];
      depth?: string;
      options?: Record<string, any>;
    }): Promise<AxiosResponse> => this.api.post('/scan/start', config),

    quickScan: (target: string): Promise<AxiosResponse> =>
      this.api.post('/scan/quick', { target }),

    networkScan: (network: string): Promise<AxiosResponse> =>
      this.api.post('/scan/network', { network }),

    portScan: (host: string, ports?: string): Promise<AxiosResponse> =>
      this.api.post('/scan/ports', { host, ports }),

    getStatus: (scanId: string): Promise<AxiosResponse> =>
      this.api.get(`/scan/${scanId}/status`),

    getResults: (scanId: string): Promise<AxiosResponse> =>
      this.api.get(`/scan/${scanId}/results`),

    list: (params?: { status?: string; limit?: number }): Promise<AxiosResponse> =>
      this.api.get('/scan', { params }),

    cancel: (scanId: string): Promise<AxiosResponse> =>
      this.api.post(`/scan/${scanId}/cancel`),
  };

  // Vulnerabilities
  vulnerabilities = {
    list: (params?: {
      severity?: string;
      status?: string;
      cve?: string;
      limit?: number;
      page?: number;
    }): Promise<AxiosResponse> => this.api.get('/vulnerabilities', { params }),

    get: (vulnId: string): Promise<AxiosResponse> =>
      this.api.get(`/vulnerabilities/${vulnId}`),

    getByCVE: (cve: string): Promise<AxiosResponse> =>
      this.api.get(`/vulnerabilities/cve/${cve}`),

    update: (vulnId: string, data: {
      status?: string;
      notes?: string;
      priority?: string;
    }): Promise<AxiosResponse> => this.api.put(`/vulnerabilities/${vulnId}`, data),

    markFixed: (vulnId: string, evidence?: string): Promise<AxiosResponse> =>
      this.api.post(`/vulnerabilities/${vulnId}/fix`, { evidence }),

    markFalsePositive: (vulnId: string, reason: string): Promise<AxiosResponse> =>
      this.api.post(`/vulnerabilities/${vulnId}/false-positive`, { reason }),

    getRemediationSteps: (vulnId: string): Promise<AxiosResponse> =>
      this.api.get(`/vulnerabilities/${vulnId}/remediation`),

    getExploits: (vulnId: string): Promise<AxiosResponse> =>
      this.api.get(`/vulnerabilities/${vulnId}/exploits`),
  };

  // Assets
  assets = {
    list: (params?: {
      type?: string;
      status?: string;
      limit?: number;
      page?: number;
    }): Promise<AxiosResponse> => this.api.get('/assets', { params }),

    get: (assetId: string): Promise<AxiosResponse> =>
      this.api.get(`/assets/${assetId}`),

    add: (asset: {
      name: string;
      type: string;
      ipAddress?: string;
      hostname?: string;
      description?: string;
      tags?: string[];
    }): Promise<AxiosResponse> => this.api.post('/assets', asset),

    update: (assetId: string, data: any): Promise<AxiosResponse> =>
      this.api.put(`/assets/${assetId}`, data),

    delete: (assetId: string): Promise<AxiosResponse> =>
      this.api.delete(`/assets/${assetId}`),

    getVulnerabilities: (assetId: string): Promise<AxiosResponse> =>
      this.api.get(`/assets/${assetId}/vulnerabilities`),

    getScanHistory: (assetId: string): Promise<AxiosResponse> =>
      this.api.get(`/assets/${assetId}/scans`),
  };

  // Compliance
  compliance = {
    getStatus: (): Promise<AxiosResponse> => this.api.get('/compliance'),

    getStandards: (): Promise<AxiosResponse> =>
      this.api.get('/compliance/standards'),

    getReport: (standard: string): Promise<AxiosResponse> =>
      this.api.get(`/compliance/${standard}/report`),

    runCheck: (standard: string): Promise<AxiosResponse> =>
      this.api.post(`/compliance/${standard}/check`),
  };

  // Remediation
  remediation = {
    getQueue: (): Promise<AxiosResponse> => this.api.get('/remediation/queue'),

    autoRemediate: (vulnId: string): Promise<AxiosResponse> =>
      this.api.post(`/remediation/${vulnId}/auto`),

    createTicket: (vulnId: string, ticketData: any): Promise<AxiosResponse> =>
      this.api.post(`/remediation/${vulnId}/ticket`, ticketData),

    getStatus: (remediationId: string): Promise<AxiosResponse> =>
      this.api.get(`/remediation/${remediationId}/status`),
  };

  // Analytics
  analytics = {
    getRiskScore: (): Promise<AxiosResponse> =>
      this.api.get('/analytics/risk-score'),

    getAssetCategories: (): Promise<AxiosResponse> =>
      this.api.get('/analytics/asset-categories'),

    getVulnTrends: (period?: string): Promise<AxiosResponse> =>
      this.api.get('/analytics/vuln-trends', { params: { period } }),

    getTopVulnerabilities: (limit?: number): Promise<AxiosResponse> =>
      this.api.get('/analytics/top-vulnerabilities', { params: { limit } }),

    getCVSSDistribution: (): Promise<AxiosResponse> =>
      this.api.get('/analytics/cvss-distribution'),
  };

  // Reports
  reports = {
    generate: (reportData: {
      type: string;
      period: { start: string; end: string };
      includeAssets?: boolean;
      includeVulns?: boolean;
      format?: string;
    }): Promise<AxiosResponse> => this.api.post('/reports', reportData),

    list: (params?: { type?: string; limit?: number }): Promise<AxiosResponse> =>
      this.api.get('/reports', { params }),

    get: (reportId: string): Promise<AxiosResponse> =>
      this.api.get(`/reports/${reportId}`),

    download: (reportId: string): Promise<AxiosResponse> =>
      this.api.get(`/reports/${reportId}/download`, { responseType: 'blob' }),
  };

  // ML Services
  ml = {
    predictVulnerability: (assetData: any): Promise<AxiosResponse> =>
      this.mlApi.post('/predict/vulnerability', assetData),

    prioritizeVulnerabilities: (vulns: any[]): Promise<AxiosResponse> =>
      this.mlApi.post('/prioritize', { vulnerabilities: vulns }),

    recommendRemediation: (vulnId: string): Promise<AxiosResponse> =>
      this.mlApi.post('/recommend/remediation', { vulnId }),

    analyzeExploit: (cve: string): Promise<AxiosResponse> =>
      this.mlApi.post('/analyze/exploit', { cve }),
  };
}

export const vulnScanAPI = new VulnScanAPI();
export default vulnScanAPI;
