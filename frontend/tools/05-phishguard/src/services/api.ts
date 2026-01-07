import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4005';
const ML_URL = import.meta.env.VITE_ML_URL || 'http://localhost:8005';

class PhishGuardAPI {
  private api: AxiosInstance;
  private mlApi: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/api/v1/phishing`,
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

  // Email Analysis
  email = {
    analyze: (emailData: {
      subject: string;
      sender: string;
      body: string;
      headers?: Record<string, string>;
      attachments?: File[];
    }): Promise<AxiosResponse> => {
      const formData = new FormData();
      formData.append('subject', emailData.subject);
      formData.append('sender', emailData.sender);
      formData.append('body', emailData.body);
      if (emailData.headers) formData.append('headers', JSON.stringify(emailData.headers));
      emailData.attachments?.forEach(file => formData.append('attachments', file));
      return this.api.post('/email/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },

    analyzeRaw: (rawEmail: string): Promise<AxiosResponse> =>
      this.api.post('/email/analyze-raw', { rawEmail }),

    getAnalysis: (analysisId: string): Promise<AxiosResponse> =>
      this.api.get(`/email/${analysisId}`),

    list: (params?: { limit?: number; page?: number }): Promise<AxiosResponse> =>
      this.api.get('/email', { params }),
  };

  // URL Analysis
  url = {
    check: (url: string): Promise<AxiosResponse> =>
      this.api.post('/url/check', { url }),

    bulkCheck: (urls: string[]): Promise<AxiosResponse> =>
      this.api.post('/url/bulk-check', { urls }),

    getReport: (urlId: string): Promise<AxiosResponse> =>
      this.api.get(`/url/${urlId}`),

    screenshot: (url: string): Promise<AxiosResponse> =>
      this.api.post('/url/screenshot', { url }),
  };

  // Detections
  detections = {
    list: (params?: {
      status?: string;
      severity?: string;
      threatType?: string;
      limit?: number;
      page?: number;
    }): Promise<AxiosResponse> => this.api.get('/detections', { params }),

    get: (detectionId: string): Promise<AxiosResponse> =>
      this.api.get(`/detections/${detectionId}`),

    quarantine: (detectionId: string): Promise<AxiosResponse> =>
      this.api.post(`/detections/${detectionId}/quarantine`),

    release: (detectionId: string): Promise<AxiosResponse> =>
      this.api.post(`/detections/${detectionId}/release`),

    markSafe: (detectionId: string, reason: string): Promise<AxiosResponse> =>
      this.api.post(`/detections/${detectionId}/mark-safe`, { reason }),

    report: (detectionId: string): Promise<AxiosResponse> =>
      this.api.get(`/detections/${detectionId}/report`),
  };

  // Quarantine
  quarantine = {
    list: (params?: { limit?: number; page?: number }): Promise<AxiosResponse> =>
      this.api.get('/quarantine', { params }),

    get: (itemId: string): Promise<AxiosResponse> =>
      this.api.get(`/quarantine/${itemId}`),

    release: (itemId: string): Promise<AxiosResponse> =>
      this.api.post(`/quarantine/${itemId}/release`),

    delete: (itemId: string): Promise<AxiosResponse> =>
      this.api.delete(`/quarantine/${itemId}`),
  };

  // Campaigns (Phishing Campaign Tracking)
  campaigns = {
    list: (params?: { status?: string; limit?: number }): Promise<AxiosResponse> =>
      this.api.get('/campaigns', { params }),

    get: (campaignId: string): Promise<AxiosResponse> =>
      this.api.get(`/campaigns/${campaignId}`),

    getIndicators: (campaignId: string): Promise<AxiosResponse> =>
      this.api.get(`/campaigns/${campaignId}/indicators`),

    getSamples: (campaignId: string): Promise<AxiosResponse> =>
      this.api.get(`/campaigns/${campaignId}/samples`),
  };

  // Simulations (Phishing Awareness Training)
  simulations = {
    create: (simulation: {
      name: string;
      template: string;
      targets: string[];
      schedule?: Date;
    }): Promise<AxiosResponse> => this.api.post('/simulations', simulation),

    list: (params?: { status?: string; limit?: number }): Promise<AxiosResponse> =>
      this.api.get('/simulations', { params }),

    get: (simulationId: string): Promise<AxiosResponse> =>
      this.api.get(`/simulations/${simulationId}`),

    getResults: (simulationId: string): Promise<AxiosResponse> =>
      this.api.get(`/simulations/${simulationId}/results`),

    cancel: (simulationId: string): Promise<AxiosResponse> =>
      this.api.post(`/simulations/${simulationId}/cancel`),
  };

  // Domain Management
  domains = {
    addTrusted: (domain: string): Promise<AxiosResponse> =>
      this.api.post('/domains/trusted', { domain }),

    removeTrusted: (domain: string): Promise<AxiosResponse> =>
      this.api.delete(`/domains/trusted/${encodeURIComponent(domain)}`),

    listTrusted: (): Promise<AxiosResponse> =>
      this.api.get('/domains/trusted'),

    addBlocked: (domain: string, reason?: string): Promise<AxiosResponse> =>
      this.api.post('/domains/blocked', { domain, reason }),

    listBlocked: (): Promise<AxiosResponse> =>
      this.api.get('/domains/blocked'),

    checkReputation: (domain: string): Promise<AxiosResponse> =>
      this.api.get(`/domains/reputation/${encodeURIComponent(domain)}`),
  };

  // Analytics
  analytics = {
    getCampaigns: (): Promise<AxiosResponse> =>
      this.api.get('/analytics/campaigns'),

    getThreatTrends: (period?: string): Promise<AxiosResponse> =>
      this.api.get('/analytics/trends', { params: { period } }),

    getTopTargets: (limit?: number): Promise<AxiosResponse> =>
      this.api.get('/analytics/top-targets', { params: { limit } }),

    getAttackVectors: (): Promise<AxiosResponse> =>
      this.api.get('/analytics/attack-vectors'),
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

    get: (reportId: string): Promise<AxiosResponse> =>
      this.api.get(`/reports/${reportId}`),

    download: (reportId: string): Promise<AxiosResponse> =>
      this.api.get(`/reports/${reportId}/download`, { responseType: 'blob' }),
  };

  // ML Services
  ml = {
    classifyEmail: (emailContent: any): Promise<AxiosResponse> =>
      this.mlApi.post('/classify/email', emailContent),

    analyzeUrl: (url: string): Promise<AxiosResponse> =>
      this.mlApi.post('/analyze/url', { url }),

    extractIndicators: (content: string): Promise<AxiosResponse> =>
      this.mlApi.post('/extract/indicators', { content }),

    detectLanguage: (text: string): Promise<AxiosResponse> =>
      this.mlApi.post('/detect/language', { text }),

    sentimentAnalysis: (text: string): Promise<AxiosResponse> =>
      this.mlApi.post('/analyze/sentiment', { text }),
  };
}

export const phishGuardAPI = new PhishGuardAPI();
export default phishGuardAPI;
