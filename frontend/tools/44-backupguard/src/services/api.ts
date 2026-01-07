import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4044';
const ML_URL = import.meta.env.VITE_ML_URL || 'http://localhost:8044';

class BackupGuardAPI {
  private api: AxiosInstance;
  private mlApi: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/api/v1/backup`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.mlApi = axios.create({
      baseURL: ML_URL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor (add auth token)
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor (handle errors)
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
    getStats: (): Promise<AxiosResponse> => 
      this.api.get('/dashboard'),
  };

  // Backup Jobs
  jobs = {
    list: (params?: { 
      status?: string; 
      type?: string; 
      limit?: number; 
      page?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }): Promise<AxiosResponse> => 
      this.api.get('/jobs', { params }),

    get: (jobId: string): Promise<AxiosResponse> => 
      this.api.get(`/jobs/${jobId}`),

    create: (jobData: {
      name: string;
      type: string;
      schedule: any;
      target: any;
      destination: any;
      settings?: any;
    }): Promise<AxiosResponse> => 
      this.api.post('/jobs', jobData),

    update: (jobId: string, updates: any): Promise<AxiosResponse> => 
      this.api.put(`/jobs/${jobId}`, updates),

    delete: (jobId: string): Promise<AxiosResponse> => 
      this.api.delete(`/jobs/${jobId}`),

    run: (jobId: string): Promise<AxiosResponse> => 
      this.api.post(`/jobs/${jobId}/run`),

    pause: (jobId: string): Promise<AxiosResponse> => 
      this.api.post(`/jobs/${jobId}/pause`),

    resume: (jobId: string): Promise<AxiosResponse> => 
      this.api.post(`/jobs/${jobId}/resume`),

    cancel: (jobId: string): Promise<AxiosResponse> => 
      this.api.post(`/jobs/${jobId}/cancel`),

    getSchedule: (jobId: string): Promise<AxiosResponse> => 
      this.api.get(`/jobs/${jobId}/schedule`),

    getHistory: (jobId: string, params?: { limit?: number }): Promise<AxiosResponse> => 
      this.api.get(`/jobs/${jobId}/history`, { params }),
  };

  // Snapshots
  snapshots = {
    list: (params?: { 
      jobId?: string; 
      status?: string; 
      startDate?: string; 
      endDate?: string;
      limit?: number;
      page?: number;
    }): Promise<AxiosResponse> => 
      this.api.get('/snapshots', { params }),

    get: (snapshotId: string): Promise<AxiosResponse> => 
      this.api.get(`/snapshots/${snapshotId}`),

    validate: (snapshotId: string): Promise<AxiosResponse> => 
      this.api.post(`/snapshots/${snapshotId}/validate`),

    lock: (snapshotId: string, lockData: { 
      lockExpiry?: string; 
      legalHold?: boolean 
    }): Promise<AxiosResponse> => 
      this.api.post(`/snapshots/${snapshotId}/lock`, lockData),

    unlock: (snapshotId: string): Promise<AxiosResponse> => 
      this.api.post(`/snapshots/${snapshotId}/unlock`),

    delete: (snapshotId: string, force?: boolean): Promise<AxiosResponse> => 
      this.api.delete(`/snapshots/${snapshotId}`, { params: { force } }),

    getMetadata: (snapshotId: string): Promise<AxiosResponse> => 
      this.api.get(`/snapshots/${snapshotId}/metadata`),

    getChain: (snapshotId: string): Promise<AxiosResponse> => 
      this.api.get(`/snapshots/${snapshotId}/chain`),
  };

  // Storage Pools
  storage = {
    list: (params?: { type?: string; tier?: string }): Promise<AxiosResponse> => 
      this.api.get('/storage/pools', { params }),

    get: (poolId: string): Promise<AxiosResponse> => 
      this.api.get(`/storage/pools/${poolId}`),

    create: (poolData: {
      name: string;
      type: string;
      tier: string;
      capacity: any;
      configuration: any;
      location?: any;
    }): Promise<AxiosResponse> => 
      this.api.post('/storage/pools', poolData),

    update: (poolId: string, updates: any): Promise<AxiosResponse> => 
      this.api.put(`/storage/pools/${poolId}`, updates),

    delete: (poolId: string): Promise<AxiosResponse> => 
      this.api.delete(`/storage/pools/${poolId}`),

    getCapacity: (poolId: string): Promise<AxiosResponse> => 
      this.api.get(`/storage/pools/${poolId}/capacity`),

    getHealth: (poolId: string): Promise<AxiosResponse> => 
      this.api.get(`/storage/pools/${poolId}/health`),

    getPerformance: (poolId: string, params?: { timeRange?: string }): Promise<AxiosResponse> => 
      this.api.get(`/storage/pools/${poolId}/performance`, { params }),

    getCostAnalysis: (poolId: string): Promise<AxiosResponse> => 
      this.api.get(`/storage/pools/${poolId}/cost`),
  };

  // Integrity Checks
  integrity = {
    validate: (snapshotIds: string[]): Promise<AxiosResponse> => 
      this.api.post('/integrity/validate', { snapshotIds }),

    listChecks: (params?: { 
      status?: string; 
      type?: string; 
      limit?: number 
    }): Promise<AxiosResponse> => 
      this.api.get('/integrity/checks', { params }),

    getCheck: (checkId: string): Promise<AxiosResponse> => 
      this.api.get(`/integrity/checks/${checkId}`),

    runRestoreTest: (snapshotId: string, testConfig?: {
      targetLocation?: string;
      filesToTest?: string[];
    }): Promise<AxiosResponse> => 
      this.api.post('/integrity/restore-test', { snapshotId, ...testConfig }),

    scheduleChecks: (schedule: {
      frequency: string;
      snapshotFilters?: any;
      checkTypes: string[];
    }): Promise<AxiosResponse> => 
      this.api.post('/integrity/schedule', schedule),

    getSchedule: (): Promise<AxiosResponse> => 
      this.api.get('/integrity/schedule'),
  };

  // Ransomware Protection
  ransomware = {
    listAlerts: (params?: { 
      severity?: string; 
      status?: string; 
      limit?: number 
    }): Promise<AxiosResponse> => 
      this.api.get('/ransomware/alerts', { params }),

    getAlert: (alertId: string): Promise<AxiosResponse> => 
      this.api.get(`/ransomware/alerts/${alertId}`),

    quarantine: (snapshotId: string, reason?: string): Promise<AxiosResponse> => 
      this.api.post('/ransomware/quarantine', { snapshotId, reason }),

    rollback: (snapshotId: string, targetSnapshot: string): Promise<AxiosResponse> => 
      this.api.post('/ransomware/rollback', { snapshotId, targetSnapshot }),

    investigate: (alertId: string, updates: {
      status?: string;
      assignedTo?: string;
      notes?: string[];
    }): Promise<AxiosResponse> => 
      this.api.put(`/ransomware/alerts/${alertId}`, updates),

    getScan: (snapshotId: string): Promise<AxiosResponse> => 
      this.api.get(`/ransomware/scan/${snapshotId}`),

    runScan: (snapshotId: string): Promise<AxiosResponse> => 
      this.api.post(`/ransomware/scan`, { snapshotId }),
  };

  // Recovery & Restore
  recovery = {
    initiateRestore: (restoreData: {
      snapshotId: string;
      type: string;
      target: any;
      options?: any;
    }): Promise<AxiosResponse> => 
      this.api.post('/recovery/restore', restoreData),

    listJobs: (params?: { 
      status?: string; 
      limit?: number 
    }): Promise<AxiosResponse> => 
      this.api.get('/recovery/jobs', { params }),

    getJob: (jobId: string): Promise<AxiosResponse> => 
      this.api.get(`/recovery/jobs/${jobId}`),

    cancelJob: (jobId: string): Promise<AxiosResponse> => 
      this.api.post(`/recovery/jobs/${jobId}/cancel`),

    instantVMRecovery: (vmData: {
      snapshotId: string;
      vmName: string;
      targetHost: string;
      networkConfig?: any;
    }): Promise<AxiosResponse> => 
      this.api.post('/recovery/instant-vm', vmData),

    getRestorePoints: (assetId: string): Promise<AxiosResponse> => 
      this.api.get('/recovery/restore-points', { params: { assetId } }),
  };

  // Compliance
  compliance = {
    listFrameworks: (): Promise<AxiosResponse> => 
      this.api.get('/compliance/frameworks'),

    generateReport: (reportConfig: {
      framework: string;
      period: { start: string; end: string };
      includeEvidence?: boolean;
    }): Promise<AxiosResponse> => 
      this.api.post('/compliance/report', reportConfig),

    getReport: (reportId: string): Promise<AxiosResponse> => 
      this.api.get(`/compliance/report/${reportId}`),

    listReports: (params?: { 
      framework?: string; 
      limit?: number 
    }): Promise<AxiosResponse> => 
      this.api.get('/compliance/reports', { params }),

    listPolicies: (): Promise<AxiosResponse> => 
      this.api.get('/compliance/retention-policies'),

    createPolicy: (policyData: {
      name: string;
      framework: string;
      retentionDays: number;
      assetFilter?: any;
    }): Promise<AxiosResponse> => 
      this.api.post('/compliance/retention-policies', policyData),

    getAuditLog: (params?: { 
      startDate?: string; 
      endDate?: string; 
      action?: string 
    }): Promise<AxiosResponse> => 
      this.api.get('/compliance/audit-log', { params }),

    attest: (reportId: string, attestation: {
      attestedBy: string;
      signature?: string;
    }): Promise<AxiosResponse> => 
      this.api.post(`/compliance/report/${reportId}/attest`, attestation),
  };

  // Disaster Recovery
  dr = {
    getTopology: (): Promise<AxiosResponse> => 
      this.api.get('/dr/topology'),

    initiateFailover: (failoverData: {
      sourcePool: string;
      targetPool: string;
      assets?: string[];
      runbooks?: string[];
    }): Promise<AxiosResponse> => 
      this.api.post('/dr/failover', failoverData),

    initiateFailback: (failbackData: {
      sourcePool: string;
      targetPool: string;
    }): Promise<AxiosResponse> => 
      this.api.post('/dr/failback', failbackData),

    getRTORPO: (): Promise<AxiosResponse> => 
      this.api.get('/dr/rto-rpo'),

    listRunbooks: (): Promise<AxiosResponse> => 
      this.api.get('/dr/runbooks'),

    createRunbook: (runbookData: {
      name: string;
      steps: any[];
      assets: string[];
    }): Promise<AxiosResponse> => 
      this.api.post('/dr/runbooks', runbookData),

    testDR: (testConfig: {
      runbookId?: string;
      assets: string[];
      isolatedNetwork: boolean;
    }): Promise<AxiosResponse> => 
      this.api.post('/dr/test', testConfig),

    getReplicationStatus: (): Promise<AxiosResponse> => 
      this.api.get('/dr/replication'),
  };

  // Machine Learning
  ml = {
    detectRansomware: (snapshotData: {
      snapshotId: string;
      files?: any[];
    }): Promise<AxiosResponse> => 
      this.mlApi.post('/detect-ransomware', snapshotData),

    detectAnomaly: (jobData: {
      jobId: string;
      historicalData?: any[];
    }): Promise<AxiosResponse> => 
      this.mlApi.post('/detect-anomaly', jobData),

    validateIntegrity: (snapshotData: {
      snapshotId: string;
      checksum: string;
    }): Promise<AxiosResponse> => 
      this.mlApi.post('/validate-integrity', snapshotData),

    optimizeStorage: (poolData: {
      poolId: string;
      currentUsage: any;
      historicalData?: any[];
    }): Promise<AxiosResponse> => 
      this.mlApi.post('/optimize-storage', poolData),

    predictFailure: (jobData: {
      jobId: string;
      metrics: any[];
    }): Promise<AxiosResponse> => 
      this.mlApi.post('/predict-failure', jobData),
  };
}

export const backupGuardAPI = new BackupGuardAPI();
export default backupGuardAPI;
