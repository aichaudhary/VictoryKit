import axios, { AxiosInstance, AxiosError } from 'axios';

// API configuration
const API_BASE_URL = import.meta.env.VITE_VULNSCAN_API_URL || 'http://localhost:4006/api';

// Types
export interface Vulnerability {
  _id: string;
  scanId: string;
  vulnerabilityId: string;
  name: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  cvssScore: number;
  cvssVector?: string;
  cveIds: string[];
  cweIds: string[];
  affectedComponent: string;
  location: string;
  evidence?: string;
  solution?: string;
  references: string[];
  status: 'open' | 'confirmed' | 'false_positive' | 'remediated' | 'accepted';
  epssScore?: number;
  isKEV?: boolean;
  riskScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Scan {
  _id: string;
  scanId: string;
  userId: string;
  targetType: 'network' | 'web_application' | 'host' | 'container' | 'cloud' | 'api';
  targetIdentifier: string;
  scanType: 'full' | 'quick' | 'compliance' | 'authenticated' | 'unauthenticated';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: {
    percentage: number;
    currentPhase: string;
    message: string;
  };
  scanConfig?: {
    ports?: { range?: string; topPorts?: number };
    depth?: string;
    options?: Record<string, boolean>;
  };
  results?: {
    summary: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      info: number;
      total: number;
    };
    openPorts?: number[];
    services?: Array<{ port: number; service: string; version?: string }>;
    osDetection?: { name: string; accuracy: number };
  };
  timing?: {
    startTime?: string;
    endTime?: string;
    duration?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  _id: string;
  assetId: string;
  name: string;
  description?: string;
  assetType: 'web_application' | 'host' | 'network' | 'container' | 'cloud_resource' | 'api' | 'database' | 'iot_device';
  target: {
    hostname?: string;
    ipAddress?: string;
    url?: string;
    port?: number;
  };
  environment: 'production' | 'staging' | 'development' | 'testing' | 'dr';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'inactive' | 'decommissioned' | 'pending';
  owner?: {
    name?: string;
    email?: string;
    team?: string;
  };
  tags: string[];
  lastScan?: {
    date?: string;
    status?: string;
    vulnerabilities?: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    riskScore?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledScan {
  _id: string;
  scheduleId: string;
  name: string;
  description?: string;
  targets: Array<{
    targetType: string;
    targetIdentifier: string;
    assetId?: string;
  }>;
  schedule: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    cronExpression?: string;
    timezone: string;
    dayOfWeek?: number[];
    hour: number;
    minute: number;
    nextRun?: string;
    lastRun?: string;
  };
  scanConfig: {
    scanType: string;
    ports?: { topPorts?: number; range?: string };
    depth?: string;
    options?: Record<string, boolean>;
  };
  status: 'active' | 'paused' | 'expired';
  notifications?: {
    enabled: boolean;
    channels: Array<{ type: string; target: string }>;
  };
  stats?: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    averageDuration: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CVEData {
  cveId: string;
  description: string;
  severity: string;
  cvssScore: number;
  cvssVector?: string;
  publishedDate: string;
  lastModifiedDate: string;
  references: string[];
  cweIds: string[];
  affectedProducts?: string[];
  epss?: {
    score: number;
    percentile: number;
  };
  isKEV: boolean;
  riskScore?: number;
}

export interface Report {
  _id: string;
  reportId: string;
  reportType: 'scan_summary' | 'compliance' | 'trending' | 'executive' | 'technical';
  format: 'pdf' | 'html' | 'json';
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add auth token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string }>) => {
      if (error.response?.status === 401) {
        // Handle unauthorized - redirect to login
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      const message = error.response?.data?.message || error.message || 'An error occurred';
      return Promise.reject(new Error(message));
    }
  );

  return client;
};

const api = createApiClient();

// ===========================
// SCAN API
// ===========================
export const scanApi = {
  // Create a new scan
  createScan: async (data: {
    targetType: string;
    targetIdentifier: string;
    scanType?: string;
    scanConfig?: Record<string, any>;
  }): Promise<Scan> => {
    const response = await api.post<ApiResponse<Scan>>('/scans', data);
    return response.data.data;
  },

  // Get all scans with pagination
  getAllScans: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    targetType?: string;
  }): Promise<PaginatedResponse<Scan>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Scan>>>('/scans', { params });
    return response.data.data;
  },

  // Get scan by ID
  getScanById: async (id: string): Promise<Scan> => {
    const response = await api.get<ApiResponse<Scan>>(`/scans/${id}`);
    return response.data.data;
  },

  // Delete scan
  deleteScan: async (id: string): Promise<void> => {
    await api.delete(`/scans/${id}`);
  },

  // Get scan statistics
  getStatistics: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<Record<string, any>> => {
    const response = await api.get<ApiResponse<Record<string, any>>>('/scans/statistics', { params });
    return response.data.data;
  },

  // Poll scan status
  pollScanStatus: async (id: string, interval = 2000): Promise<Scan> => {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const scan = await scanApi.getScanById(id);
          if (scan.status === 'completed' || scan.status === 'failed' || scan.status === 'cancelled') {
            resolve(scan);
          } else {
            setTimeout(poll, interval);
          }
        } catch (error) {
          reject(error);
        }
      };
      poll();
    });
  },
};

// ===========================
// VULNERABILITY API
// ===========================
export const vulnerabilityApi = {
  // Get all vulnerabilities
  getAllVulnerabilities: async (params?: {
    page?: number;
    limit?: number;
    severity?: string;
    status?: string;
    scanId?: string;
  }): Promise<PaginatedResponse<Vulnerability>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Vulnerability>>>('/vulnerabilities', { params });
    return response.data.data;
  },

  // Get vulnerability by ID
  getVulnerabilityById: async (id: string): Promise<Vulnerability> => {
    const response = await api.get<ApiResponse<Vulnerability>>(`/vulnerabilities/${id}`);
    return response.data.data;
  },

  // Update vulnerability status
  updateVulnerability: async (id: string, data: {
    status?: string;
    notes?: string;
    assignedTo?: string;
  }): Promise<Vulnerability> => {
    const response = await api.patch<ApiResponse<Vulnerability>>(`/vulnerabilities/${id}`, data);
    return response.data.data;
  },

  // Delete vulnerability
  deleteVulnerability: async (id: string): Promise<void> => {
    await api.delete(`/vulnerabilities/${id}`);
  },
};

// ===========================
// ASSET API
// ===========================
export const assetApi = {
  // Create asset
  createAsset: async (data: {
    name: string;
    assetType: string;
    target: Record<string, any>;
    description?: string;
    environment?: string;
    criticality?: string;
    owner?: Record<string, any>;
    tags?: string[];
  }): Promise<Asset> => {
    const response = await api.post<ApiResponse<Asset>>('/assets', data);
    return response.data.data;
  },

  // Get all assets
  getAllAssets: async (params?: {
    page?: number;
    limit?: number;
    assetType?: string;
    environment?: string;
    criticality?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ assets: Asset[]; pagination: any; stats: any }> => {
    const response = await api.get<ApiResponse<{ assets: Asset[]; pagination: any; stats: any }>>('/assets', { params });
    return response.data.data;
  },

  // Get asset by ID
  getAssetById: async (id: string): Promise<Asset> => {
    const response = await api.get<ApiResponse<Asset>>(`/assets/${id}`);
    return response.data.data;
  },

  // Update asset
  updateAsset: async (id: string, data: Partial<Asset>): Promise<Asset> => {
    const response = await api.put<ApiResponse<Asset>>(`/assets/${id}`, data);
    return response.data.data;
  },

  // Delete asset
  deleteAsset: async (id: string): Promise<void> => {
    await api.delete(`/assets/${id}`);
  },

  // Bulk import assets
  bulkImport: async (assets: Array<Partial<Asset>>): Promise<{
    imported: number;
    failed: number;
    errors: Array<{ asset: string; error: string }>;
  }> => {
    const response = await api.post<ApiResponse<any>>('/assets/bulk-import', { assets });
    return response.data.data;
  },

  // Get asset statistics
  getStatistics: async (): Promise<Record<string, any>> => {
    const response = await api.get<ApiResponse<Record<string, any>>>('/assets/statistics');
    return response.data.data;
  },

  // Get all tags
  getTags: async (): Promise<string[]> => {
    const response = await api.get<ApiResponse<string[]>>('/assets/tags');
    return response.data.data;
  },

  // Get assets by tag
  getAssetsByTag: async (tag: string, params?: { page?: number; limit?: number }): Promise<{
    assets: Asset[];
    pagination: any;
  }> => {
    const response = await api.get<ApiResponse<any>>(`/assets/tag/${encodeURIComponent(tag)}`, { params });
    return response.data.data;
  },

  // Discover asset from scan
  discoverFromScan: async (scanId: string): Promise<Asset> => {
    const response = await api.post<ApiResponse<Asset>>('/assets/discover', { scanId });
    return response.data.data;
  },
};

// ===========================
// SCHEDULED SCAN API
// ===========================
export const scheduleApi = {
  // Create scheduled scan
  createSchedule: async (data: {
    name: string;
    targets: Array<{ targetType: string; targetIdentifier: string }>;
    schedule: { type: string; hour?: number; minute?: number; dayOfWeek?: number[] };
    scanConfig?: Record<string, any>;
    notifications?: Record<string, any>;
    description?: string;
    tags?: string[];
  }): Promise<ScheduledScan> => {
    const response = await api.post<ApiResponse<ScheduledScan>>('/schedules', data);
    return response.data.data;
  },

  // Get all schedules
  getAllSchedules: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ schedules: ScheduledScan[]; pagination: any }> => {
    const response = await api.get<ApiResponse<any>>('/schedules', { params });
    return response.data.data;
  },

  // Get schedule by ID
  getScheduleById: async (id: string): Promise<ScheduledScan> => {
    const response = await api.get<ApiResponse<ScheduledScan>>(`/schedules/${id}`);
    return response.data.data;
  },

  // Update schedule
  updateSchedule: async (id: string, data: Partial<ScheduledScan>): Promise<ScheduledScan> => {
    const response = await api.put<ApiResponse<ScheduledScan>>(`/schedules/${id}`, data);
    return response.data.data;
  },

  // Delete schedule
  deleteSchedule: async (id: string): Promise<void> => {
    await api.delete(`/schedules/${id}`);
  },

  // Toggle schedule status (pause/resume)
  toggleStatus: async (id: string): Promise<ScheduledScan> => {
    const response = await api.post<ApiResponse<ScheduledScan>>(`/schedules/${id}/toggle`);
    return response.data.data;
  },

  // Run schedule now
  runNow: async (id: string): Promise<{ scheduledScan: ScheduledScan; triggeredScans: Scan[] }> => {
    const response = await api.post<ApiResponse<any>>(`/schedules/${id}/run`);
    return response.data.data;
  },

  // Get execution history
  getHistory: async (id: string, params?: { page?: number; limit?: number }): Promise<{
    history: any[];
    pagination: any;
    stats: any;
  }> => {
    const response = await api.get<ApiResponse<any>>(`/schedules/${id}/history`, { params });
    return response.data.data;
  },

  // Get upcoming schedules
  getUpcoming: async (limit?: number): Promise<ScheduledScan[]> => {
    const response = await api.get<ApiResponse<ScheduledScan[]>>('/schedules/upcoming', { params: { limit } });
    return response.data.data;
  },

  // Get schedule statistics
  getStatistics: async (): Promise<Record<string, any>> => {
    const response = await api.get<ApiResponse<Record<string, any>>>('/schedules/statistics');
    return response.data.data;
  },
};

// ===========================
// CVE API
// ===========================
export const cveApi = {
  // Lookup CVE by ID
  lookupCVE: async (cveId: string): Promise<CVEData> => {
    const response = await api.get<ApiResponse<CVEData>>(`/cve/lookup/${cveId}`);
    return response.data.data;
  },

  // Bulk lookup CVEs
  bulkLookup: async (cveIds: string[]): Promise<CVEData[]> => {
    const response = await api.post<ApiResponse<CVEData[]>>('/cve/bulk-lookup', { cveIds });
    return response.data.data;
  },

  // Get EPSS score
  getEPSSScore: async (cveId: string): Promise<{ cveId: string; epss: number; percentile: number }> => {
    const response = await api.get<ApiResponse<any>>(`/cve/epss/${cveId}`);
    return response.data.data;
  },

  // Check if CVE is in KEV
  checkKEV: async (cveId: string): Promise<{ cveId: string; isKEV: boolean }> => {
    const response = await api.get<ApiResponse<any>>(`/cve/kev/${cveId}`);
    return response.data.data;
  },

  // Search CVEs
  searchCVEs: async (keyword: string, params?: { page?: number; limit?: number }): Promise<{
    results: CVEData[];
    pagination: any;
  }> => {
    const response = await api.get<ApiResponse<any>>('/cve/search', { params: { keyword, ...params } });
    return response.data.data;
  },
};

// ===========================
// REPORT API
// ===========================
export const reportApi = {
  // Generate report
  generateReport: async (data: {
    reportType: string;
    format?: string;
    scanIds?: string[];
    dateRange?: { start: string; end: string };
    filters?: Record<string, any>;
  }): Promise<Report> => {
    const response = await api.post<ApiResponse<Report>>('/reports/generate', data);
    return response.data.data;
  },

  // Get report by ID
  getReportById: async (id: string): Promise<Report> => {
    const response = await api.get<ApiResponse<Report>>(`/reports/${id}`);
    return response.data.data;
  },

  // Get all reports
  getAllReports: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Report>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Report>>>('/reports', { params });
    return response.data.data;
  },

  // Export report
  exportReport: async (id: string): Promise<Blob> => {
    const response = await api.get(`/reports/${id}/export`, { responseType: 'blob' });
    return response.data;
  },

  // Delete report
  deleteReport: async (id: string): Promise<void> => {
    await api.delete(`/reports/${id}`);
  },
};

// ===========================
// DASHBOARD API (Combined endpoints)
// ===========================
export const dashboardApi = {
  // Get dashboard overview
  getDashboardData: async (): Promise<{
    scanStats: any;
    assetStats: any;
    scheduleStats: any;
    recentScans: Scan[];
    topVulnerabilities: Vulnerability[];
    upcomingSchedules: ScheduledScan[];
  }> => {
    const [scanStats, assetStats, scheduleStats, recentScans, upcomingSchedules] = await Promise.all([
      scanApi.getStatistics(),
      assetApi.getStatistics(),
      scheduleApi.getStatistics(),
      scanApi.getAllScans({ limit: 5 }),
      scheduleApi.getUpcoming(5),
    ]);

    // Get top critical vulnerabilities
    const vulnResponse = await vulnerabilityApi.getAllVulnerabilities({
      limit: 10,
      severity: 'CRITICAL',
    });

    return {
      scanStats,
      assetStats,
      scheduleStats,
      recentScans: recentScans.data || [],
      topVulnerabilities: vulnResponse.data || [],
      upcomingSchedules,
    };
  },
};

// Export default api instance for custom requests
export default api;
