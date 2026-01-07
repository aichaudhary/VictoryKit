/**
 * WebFilter API Client
 * TypeScript client for WebFilter REST API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4036/api';

// Types
export interface UrlAnalysis {
  _id: string;
  url: string;
  domain: string;
  threatLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  threatScore: number;
  categories: string[];
  blocked: boolean;
  reason?: string;
  threats: ThreatIndicator[];
  reputation: ReputationData;
  analyzedAt: string;
}

export interface ThreatIndicator {
  type: string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
}

export interface ReputationData {
  score: number;
  age: number;
  category: string;
  sources: { name: string; score: number }[];
}

export interface FilterPolicy {
  _id: string;
  name: string;
  description: string;
  type: 'user' | 'group' | 'global';
  enabled: boolean;
  priority: number;
  rules: PolicyRule[];
  actions: string[];
  schedule?: ScheduleRule;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyRule {
  field: string;
  operator: string;
  value: string | number | boolean;
  category?: string;
}

export interface ScheduleRule {
  days: string[];
  startTime: string;
  endTime: string;
}

export interface UserProfile {
  _id: string;
  userId: string;
  username: string;
  email: string;
  group: string;
  policies: string[];
  quotas: BandwidthQuota;
  overrides: Override[];
  activitySummary: ActivitySummary;
}

export interface BandwidthQuota {
  daily?: number;
  weekly?: number;
  monthly?: number;
  used: number;
}

export interface Override {
  url: string;
  action: 'allow' | 'block';
  expiresAt?: string;
  reason: string;
}

export interface ActivitySummary {
  totalRequests: number;
  blockedRequests: number;
  allowedRequests: number;
  topCategories: { category: string; count: number }[];
  topDomains: { domain: string; count: number }[];
}

export interface AccessLog {
  _id: string;
  userId: string;
  url: string;
  domain: string;
  category: string;
  action: 'allowed' | 'blocked';
  reason?: string;
  timestamp: string;
  userAgent: string;
  ipAddress: string;
}

export interface Alert {
  _id: string;
  type: 'threat' | 'policy_violation' | 'anomaly' | 'quota_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  userId?: string;
  url?: string;
  data: Record<string, any>;
  status: 'open' | 'acknowledged' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export interface DashboardData {
  summary: {
    totalRequests: number;
    blockedRequests: number;
    threatsBlocked: number;
    activeUsers: number;
    bandwidthUsed: number;
  };
  realtimeStats: {
    requestsPerMinute: number;
    blockedPerMinute: number;
    topThreats: { type: string; count: number }[];
    topCategories: { category: string; count: number }[];
  };
  trends: {
    timestamp: string;
    requests: number;
    blocked: number;
    threats: number;
  }[];
  topBlockedDomains: { domain: string; count: number; threatLevel: string }[];
  policyEffectiveness: { policyId: string; name: string; blocks: number; effectiveness: number }[];
}

export interface FilterCheckRequest {
  url: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface FilterCheckResponse {
  action: 'allow' | 'block' | 'warn';
  url: string;
  category: string;
  reason?: string;
  threatLevel?: string;
  policyApplied?: string;
  alternativeUrl?: string;
}

export interface Report {
  _id: string;
  type: 'summary' | 'threats' | 'compliance' | 'bandwidth' | 'users';
  period: {
    start: string;
    end: string;
  };
  data: Record<string, any>;
  generatedAt: string;
  generatedBy: string;
}

class WebFilterAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // URL Analysis
  async analyzeUrl(url: string, deepScan: boolean = false): Promise<UrlAnalysis> {
    const response = await fetch(`${this.baseUrl}/analysis/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, deepScan })
    });
    if (!response.ok) throw new Error(`Analysis failed: ${response.statusText}`);
    return response.json();
  }

  async batchAnalyze(urls: string[]): Promise<UrlAnalysis[]> {
    const response = await fetch(`${this.baseUrl}/analysis/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls })
    });
    if (!response.ok) throw new Error(`Batch analysis failed: ${response.statusText}`);
    return response.json();
  }

  async getAnalysisHistory(userId: string, limit: number = 50): Promise<UrlAnalysis[]> {
    const response = await fetch(`${this.baseUrl}/analysis/history/${userId}?limit=${limit}`);
    if (!response.ok) throw new Error(`Failed to fetch history: ${response.statusText}`);
    return response.json();
  }

  // Policy Management
  async getPolicies(): Promise<FilterPolicy[]> {
    const response = await fetch(`${this.baseUrl}/policies`);
    if (!response.ok) throw new Error(`Failed to fetch policies: ${response.statusText}`);
    return response.json();
  }

  async createPolicy(policy: Partial<FilterPolicy>): Promise<FilterPolicy> {
    const response = await fetch(`${this.baseUrl}/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy)
    });
    if (!response.ok) throw new Error(`Failed to create policy: ${response.statusText}`);
    return response.json();
  }

  async updatePolicy(id: string, updates: Partial<FilterPolicy>): Promise<FilterPolicy> {
    const response = await fetch(`${this.baseUrl}/policies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error(`Failed to update policy: ${response.statusText}`);
    return response.json();
  }

  async deletePolicy(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/policies/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`Failed to delete policy: ${response.statusText}`);
    return response.json();
  }

  async applyPolicy(id: string, targets: string[]): Promise<{ applied: number }> {
    const response = await fetch(`${this.baseUrl}/policies/${id}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targets })
    });
    if (!response.ok) throw new Error(`Failed to apply policy: ${response.statusText}`);
    return response.json();
  }

  // User Management
  async getUsers(): Promise<UserProfile[]> {
    const response = await fetch(`${this.baseUrl}/users`);
    if (!response.ok) throw new Error(`Failed to fetch users: ${response.statusText}`);
    return response.json();
  }

  async createUser(user: Partial<UserProfile>): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!response.ok) throw new Error(`Failed to create user: ${response.statusText}`);
    return response.json();
  }

  async getUserProfile(id: string): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/users/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    return response.json();
  }

  async getUserActivity(id: string, period: string = 'day'): Promise<AccessLog[]> {
    const response = await fetch(`${this.baseUrl}/users/${id}/activity?period=${period}`);
    if (!response.ok) throw new Error(`Failed to fetch user activity: ${response.statusText}`);
    return response.json();
  }

  async addUserOverride(id: string, override: Override): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/users/${id}/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(override)
    });
    if (!response.ok) throw new Error(`Failed to add override: ${response.statusText}`);
    return response.json();
  }

  // Filtering
  async checkUrl(request: FilterCheckRequest): Promise<FilterCheckResponse> {
    const response = await fetch(`${this.baseUrl}/filter/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    if (!response.ok) throw new Error(`Filter check failed: ${response.statusText}`);
    return response.json();
  }

  async allowUrl(url: string, userId: string, reason: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/filter/allow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, userId, reason })
    });
    if (!response.ok) throw new Error(`Failed to allow URL: ${response.statusText}`);
    return response.json();
  }

  async blockUrl(url: string, reason: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/filter/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, reason })
    });
    if (!response.ok) throw new Error(`Failed to block URL: ${response.statusText}`);
    return response.json();
  }

  async getCategories(): Promise<{ name: string; count: number; blocked: number }[]> {
    const response = await fetch(`${this.baseUrl}/filter/categories`);
    if (!response.ok) throw new Error(`Failed to fetch categories: ${response.statusText}`);
    return response.json();
  }

  // Logs
  async getAccessLogs(params?: { limit?: number; userId?: string; startDate?: string; endDate?: string }): Promise<AccessLog[]> {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`${this.baseUrl}/logs/access?${query}`);
    if (!response.ok) throw new Error(`Failed to fetch access logs: ${response.statusText}`);
    return response.json();
  }

  async getBlockedLogs(params?: { limit?: number; userId?: string; startDate?: string }): Promise<AccessLog[]> {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`${this.baseUrl}/logs/blocked?${query}`);
    if (!response.ok) throw new Error(`Failed to fetch blocked logs: ${response.statusText}`);
    return response.json();
  }

  async getAlerts(status?: string): Promise<Alert[]> {
    const url = status ? `${this.baseUrl}/logs/alerts?status=${status}` : `${this.baseUrl}/logs/alerts`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch alerts: ${response.statusText}`);
    return response.json();
  }

  async exportLogs(params: { startDate: string; endDate: string; format: 'csv' | 'json' }): Promise<Blob> {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`${this.baseUrl}/logs/export?${query}`);
    if (!response.ok) throw new Error(`Failed to export logs: ${response.statusText}`);
    return response.blob();
  }

  // Reports
  async getSummaryReport(period: { start: string; end: string }): Promise<Report> {
    const response = await fetch(`${this.baseUrl}/reports/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period })
    });
    if (!response.ok) throw new Error(`Failed to generate summary report: ${response.statusText}`);
    return response.json();
  }

  async getThreatsReport(period: { start: string; end: string }): Promise<Report> {
    const response = await fetch(`${this.baseUrl}/reports/threats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period })
    });
    if (!response.ok) throw new Error(`Failed to generate threats report: ${response.statusText}`);
    return response.json();
  }

  async getComplianceReport(standard: string, period: { start: string; end: string }): Promise<Report> {
    const response = await fetch(`${this.baseUrl}/reports/compliance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ standard, period })
    });
    if (!response.ok) throw new Error(`Failed to generate compliance report: ${response.statusText}`);
    return response.json();
  }

  async getBandwidthReport(period: { start: string; end: string }): Promise<Report> {
    const response = await fetch(`${this.baseUrl}/reports/bandwidth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period })
    });
    if (!response.ok) throw new Error(`Failed to generate bandwidth report: ${response.statusText}`);
    return response.json();
  }

  async getUsersReport(period: { start: string; end: string }): Promise<Report> {
    const response = await fetch(`${this.baseUrl}/reports/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period })
    });
    if (!response.ok) throw new Error(`Failed to generate users report: ${response.statusText}`);
    return response.json();
  }

  // Dashboard
  async getDashboard(): Promise<DashboardData> {
    const response = await fetch(`${this.baseUrl}/dashboard`);
    if (!response.ok) throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
    return response.json();
  }

  async getRealtimeStats(): Promise<DashboardData['realtimeStats']> {
    const response = await fetch(`${this.baseUrl}/dashboard/realtime`);
    if (!response.ok) throw new Error(`Failed to fetch realtime stats: ${response.statusText}`);
    return response.json();
  }

  async getStats(period: string = 'day'): Promise<Record<string, any>> {
    const response = await fetch(`${this.baseUrl}/dashboard/stats?period=${period}`);
    if (!response.ok) throw new Error(`Failed to fetch stats: ${response.statusText}`);
    return response.json();
  }
}

// Export singleton instance
export const webfilterAPI = new WebFilterAPI();
export default webfilterAPI;
