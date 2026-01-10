import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4003';
const ML_URL = import.meta.env.VITE_ML_URL || 'http://localhost:8003';

class ZeroDayDetectAPI {
  private api: AxiosInstance;
  private mlApi: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/api/v1/threats`,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.mlApi = axios.create({
      baseURL: ML_URL,
      timeout: 60000,
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

  // Threats
  threats = {
    list: (params?: { 
      severity?: string; 
      status?: string;
      type?: string;
      limit?: number; 
      page?: number 
    }): Promise<AxiosResponse> => this.api.get('/', { params }),

    get: (threatId: string): Promise<AxiosResponse> => this.api.get(`/${threatId}`),

    create: (threatData: any): Promise<AxiosResponse> => this.api.post('/', threatData),

    update: (threatId: string, updates: any): Promise<AxiosResponse> => 
      this.api.put(`/${threatId}`, updates),

    delete: (threatId: string): Promise<AxiosResponse> => this.api.delete(`/${threatId}`),

    block: (threatId: string): Promise<AxiosResponse> => this.api.post(`/${threatId}/block`),

    investigate: (threatId: string): Promise<AxiosResponse> => 
      this.api.post(`/${threatId}/investigate`),

    remediate: (threatId: string, action: string): Promise<AxiosResponse> => 
      this.api.post(`/${threatId}/remediate`, { action }),
  };

  // Scans
  scans = {
    initiate: (scanConfig: {
      type: string;
      targets?: string[];
      depth?: string;
    }): Promise<AxiosResponse> => this.api.post('/scans', scanConfig),

    getStatus: (scanId: string): Promise<AxiosResponse> => this.api.get(`/scans/${scanId}`),

    list: (params?: { limit?: number }): Promise<AxiosResponse> => 
      this.api.get('/scans', { params }),

    cancel: (scanId: string): Promise<AxiosResponse> => this.api.post(`/scans/${scanId}/cancel`),

    schedule: (scheduleData: {
      type: string;
      frequency: string;
      targets?: string[];
    }): Promise<AxiosResponse> => this.api.post('/scans/schedule', scheduleData),
  };

  // Threat Intelligence
  intelligence = {
    getFeeds: (): Promise<AxiosResponse> => this.api.get('/intelligence/feeds'),

    updateFeeds: (): Promise<AxiosResponse> => this.api.post('/intelligence/feeds/update'),

    getIndicators: (params?: { type?: string; limit?: number }): Promise<AxiosResponse> => 
      this.api.get('/intelligence/indicators', { params }),

    addIndicator: (indicator: {
      type: string;
      value: string;
      context?: string;
    }): Promise<AxiosResponse> => this.api.post('/intelligence/indicators', indicator),

    searchIndicator: (query: string): Promise<AxiosResponse> => 
      this.api.get('/intelligence/search', { params: { query } }),

    getAttackVectors: (): Promise<AxiosResponse> => this.api.get('/intelligence/vectors'),

    getTTPAnalysis: (): Promise<AxiosResponse> => this.api.get('/intelligence/ttp'),
  };

  // Attack Surface
  attackSurface = {
    get: (): Promise<AxiosResponse> => this.api.get('/attack-surface'),

    scan: (): Promise<AxiosResponse> => this.api.post('/attack-surface/scan'),

    getAssets: (params?: { type?: string }): Promise<AxiosResponse> => 
      this.api.get('/attack-surface/assets', { params }),

    getVulnerabilities: (): Promise<AxiosResponse> => 
      this.api.get('/attack-surface/vulnerabilities'),

    getExposures: (): Promise<AxiosResponse> => this.api.get('/attack-surface/exposures'),
  };

  // Monitoring
  monitoring = {
    getStatus: (): Promise<AxiosResponse> => this.api.get('/monitoring'),

    getLiveEvents: (): Promise<AxiosResponse> => this.api.get('/monitoring/events'),

    getRules: (): Promise<AxiosResponse> => this.api.get('/monitoring/rules'),

    createRule: (ruleData: any): Promise<AxiosResponse> => 
      this.api.post('/monitoring/rules', ruleData),

    updateRule: (ruleId: string, updates: any): Promise<AxiosResponse> => 
      this.api.put(`/monitoring/rules/${ruleId}`, updates),

    deleteRule: (ruleId: string): Promise<AxiosResponse> => 
      this.api.delete(`/monitoring/rules/${ruleId}`),
  };

  // Reports
  reports = {
    generate: (reportData: {
      type: string;
      period: { start: string; end: string };
      format?: string;
    }): Promise<AxiosResponse> => this.api.post('/reports', reportData),

    list: (params?: { type?: string; limit?: number }): Promise<AxiosResponse> => 
      this.api.get('/reports', { params }),

    get: (reportId: string): Promise<AxiosResponse> => this.api.get(`/reports/${reportId}`),

    download: (reportId: string): Promise<AxiosResponse> => 
      this.api.get(`/reports/${reportId}/download`, { responseType: 'blob' }),
  };

  // Defense
  defense = {
    getStatus: (): Promise<AxiosResponse> => this.api.get('/defense'),

    getBlocklist: (): Promise<AxiosResponse> => this.api.get('/defense/blocklist'),

    addToBlocklist: (item: { type: string; value: string }): Promise<AxiosResponse> => 
      this.api.post('/defense/blocklist', item),

    removeFromBlocklist: (itemId: string): Promise<AxiosResponse> => 
      this.api.delete(`/defense/blocklist/${itemId}`),

    getPlaybooks: (): Promise<AxiosResponse> => this.api.get('/defense/playbooks'),

    executePlaybook: (playbookId: string, params?: any): Promise<AxiosResponse> => 
      this.api.post(`/defense/playbooks/${playbookId}/execute`, params),
  };

  // ML Services
  ml = {
    analyzeThreat: (threatData: any): Promise<AxiosResponse> => 
      this.mlApi.post('/analyze-threat', threatData),

    predictAttack: (contextData: any): Promise<AxiosResponse> => 
      this.mlApi.post('/predict-attack', contextData),

    classifyIndicator: (indicator: { type: string; value: string }): Promise<AxiosResponse> => 
      this.mlApi.post('/classify-indicator', indicator),

    correlateEvents: (events: any[]): Promise<AxiosResponse> => 
      this.mlApi.post('/correlate-events', { events }),

    assessRisk: (assetData: any): Promise<AxiosResponse> => 
      this.mlApi.post('/assess-risk', assetData),
  };
}

export const zeroDayDetectAPI = new ZeroDayDetectAPI();
export default zeroDayDetectAPI;
