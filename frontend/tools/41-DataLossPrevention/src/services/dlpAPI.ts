/**
 * DLP API Service
 * Connects to Data Loss Prevention backend API
 */

import axios from 'axios';
import { ScanResult, DLPPolicy, DLPIncident, CloudIntegration, EndpointAgent, DashboardStats } from '../types';
import { API_BASE_URL } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dlp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dlpAPI = {
  // ==========================================
  // Content & File Scanning
  // ==========================================
  
  scan: {
    /**
     * Scan text content for sensitive data
     */
    async content(content: string, options?: { policyId?: string }): Promise<ScanResult> {
      const response = await api.post('/scan/content', { content, options });
      return response.data;
    },
    
    /**
     * Scan uploaded file for sensitive data
     */
    async file(file: File, options?: { policyId?: string }): Promise<ScanResult> {
      const formData = new FormData();
      formData.append('file', file);
      if (options) {
        formData.append('options', JSON.stringify(options));
      }
      
      const response = await api.post('/scan/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    
    /**
     * Scan email content
     */
    async email(emailData: {
      subject: string;
      body: string;
      from: string;
      to: string[];
      attachments?: string[];
    }): Promise<ScanResult> {
      const response = await api.post('/scan/email', emailData);
      return response.data;
    },
    
    /**
     * Get scan history
     */
    async history(filters?: { source?: string; startDate?: string; endDate?: string }): Promise<ScanResult[]> {
      const response = await api.get('/scans', { params: filters });
      return response.data.scans;
    },
  },
  
  // ==========================================
  // DLP Policies
  // ==========================================
  
  policies: {
    /**
     * Get all DLP policies
     */
    async list(): Promise<DLPPolicy[]> {
      const response = await api.get('/policies');
      return response.data.policies;
    },
    
    /**
     * Get single policy by ID
     */
    async get(id: string): Promise<DLPPolicy> {
      const response = await api.get(`/policies/${id}`);
      return response.data.policy;
    },
    
    /**
     * Create new policy
     */
    async create(policy: Omit<DLPPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<DLPPolicy> {
      const response = await api.post('/policies', policy);
      return response.data.policy;
    },
    
    /**
     * Update existing policy
     */
    async update(id: string, updates: Partial<DLPPolicy>): Promise<DLPPolicy> {
      const response = await api.put(`/policies/${id}`, updates);
      return response.data.policy;
    },
    
    /**
     * Delete policy
     */
    async delete(id: string): Promise<void> {
      await api.delete(`/policies/${id}`);
    },
    
    /**
     * Toggle policy enabled state
     */
    async toggle(id: string, enabled: boolean): Promise<DLPPolicy> {
      const response = await api.patch(`/policies/${id}/toggle`, { enabled });
      return response.data.policy;
    },
  },
  
  // ==========================================
  // DLP Incidents
  // ==========================================
  
  incidents: {
    /**
     * Get all incidents
     */
    async list(filters?: {
      status?: string;
      severity?: string;
      startDate?: string;
      endDate?: string;
    }): Promise<DLPIncident[]> {
      const response = await api.get('/incidents', { params: filters });
      return response.data.incidents;
    },
    
    /**
     * Get single incident
     */
    async get(id: string): Promise<DLPIncident> {
      const response = await api.get(`/incidents/${id}`);
      return response.data.incident;
    },
    
    /**
     * Update incident status
     */
    async updateStatus(id: string, status: string, notes?: string): Promise<DLPIncident> {
      const response = await api.patch(`/incidents/${id}/status`, { status, notes });
      return response.data.incident;
    },
    
    /**
     * Resolve incident
     */
    async resolve(id: string, resolution: string, notes?: string): Promise<DLPIncident> {
      const response = await api.patch(`/incidents/${id}/resolve`, { resolution, notes });
      return response.data.incident;
    },
  },
  
  // ==========================================
  // Cloud Integrations
  // ==========================================
  
  integrations: {
    /**
     * Get integration status
     */
    async status(): Promise<Record<string, CloudIntegration>> {
      const response = await api.get('/integrations/status');
      return response.data.integrations;
    },
    
    /**
     * Scan Microsoft 365
     */
    async scanMicrosoft365(options: {
      type: 'onedrive' | 'sharepoint' | 'teams' | 'outlook';
      userId?: string;
      siteId?: string;
      channelId?: string;
    }): Promise<ScanResult> {
      const endpoint = `/integrations/microsoft365/scan/${options.type}`;
      const response = await api.post(endpoint, options);
      return response.data;
    },
    
    /**
     * Scan Google Workspace
     */
    async scanGoogle(options: {
      type: 'drive' | 'gmail';
      userEmail: string;
      folderId?: string;
    }): Promise<ScanResult> {
      const endpoint = `/integrations/google/scan/${options.type}`;
      const response = await api.post(endpoint, options);
      return response.data;
    },
    
    /**
     * Scan Slack
     */
    async scanSlack(options: {
      channelId?: string;
      scanWorkspace?: boolean;
    }): Promise<ScanResult> {
      const endpoint = options.scanWorkspace 
        ? '/integrations/slack/scan/workspace'
        : '/integrations/slack/scan/channel';
      const response = await api.post(endpoint, options);
      return response.data;
    },
    
    /**
     * Scan cloud storage (S3, Azure, Dropbox, Box)
     */
    async scanCloudStorage(provider: 'aws' | 'azure' | 'dropbox' | 'box', options: {
      bucket?: string;
      container?: string;
      folderId?: string;
      path?: string;
    }): Promise<ScanResult> {
      const endpoints: Record<string, string> = {
        aws: '/integrations/s3/scan',
        azure: '/integrations/azure/scan',
        dropbox: '/integrations/dropbox/scan',
        box: '/integrations/box/scan',
      };
      const response = await api.post(endpoints[provider], options);
      return response.data;
    },
    
    /**
     * Scan all cloud providers
     */
    async scanAll(): Promise<ScanResult> {
      const response = await api.post('/integrations/cloud/scan-all');
      return response.data;
    },
  },
  
  // ==========================================
  // Endpoint Agents
  // ==========================================
  
  endpoints: {
    /**
     * Get connected agents
     */
    async list(): Promise<EndpointAgent[]> {
      const response = await api.get('/endpoint/agents');
      return response.data.agents;
    },
    
    /**
     * Get agent configuration
     */
    async getConfig(): Promise<any> {
      const response = await api.get('/endpoint/config');
      return response.data.config;
    },
  },
  
  // ==========================================
  // Dashboard & Reports
  // ==========================================
  
  dashboard: {
    /**
     * Get dashboard statistics
     */
    async stats(): Promise<DashboardStats> {
      const response = await api.get('/dashboard/stats');
      return response.data;
    },
    
    /**
     * Get recent activity
     */
    async activity(limit: number = 10): Promise<any[]> {
      const response = await api.get('/dashboard/activity', { params: { limit } });
      return response.data.activities;
    },
  },
  
  reports: {
    /**
     * Generate report
     */
    async generate(options: {
      type: 'summary' | 'incidents' | 'compliance';
      startDate: string;
      endDate: string;
      format: 'pdf' | 'csv' | 'json';
    }): Promise<Blob> {
      const response = await api.post('/reports/generate', options, {
        responseType: 'blob',
      });
      return response.data;
    },
  },
  
  // ==========================================
  // Sensitive Patterns
  // ==========================================
  
  patterns: {
    /**
     * Get available patterns
     */
    async list(): Promise<any[]> {
      const response = await api.get('/patterns');
      return response.data;
    },
    
    /**
     * Create custom pattern
     */
    async create(pattern: {
      name: string;
      regex: string;
      category: string;
      severity: string;
    }): Promise<any> {
      const response = await api.post('/patterns', pattern);
      return response.data.pattern;
    },
  },
};

export default dlpAPI;
