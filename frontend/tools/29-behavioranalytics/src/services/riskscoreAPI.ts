import type {
  Organization,
  Vendor,
  RiskFinding,
  Remediation,
  Report,
  Benchmark,
  TrendData,
  RiskQuantification,
  DashboardStats,
  RiskScoreSettings,
  ComplianceMapping,
} from '../types';
import { API_ENDPOINTS } from '../constants';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4029';

class RiskScoreAPI {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE + API_ENDPOINTS.base;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ============ Dashboard ============
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request('/dashboard/stats');
  }

  // ============ Organizations ============
  async getOrganizations(): Promise<Organization[]> {
    return this.request(API_ENDPOINTS.organizations);
  }

  async getOrganization(id: string): Promise<Organization> {
    return this.request(`${API_ENDPOINTS.organizations}/${id}`);
  }

  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    return this.request(API_ENDPOINTS.organizations, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization> {
    return this.request(`${API_ENDPOINTS.organizations}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOrganization(id: string): Promise<void> {
    return this.request(`${API_ENDPOINTS.organizations}/${id}`, {
      method: 'DELETE',
    });
  }

  async scanOrganization(id: string): Promise<{ job_id: string }> {
    return this.request(`${API_ENDPOINTS.organizations}/${id}/scan`, {
      method: 'POST',
    });
  }

  // ============ Vendors ============
  async getVendors(organizationId?: string): Promise<Vendor[]> {
    const params = organizationId ? `?organization_id=${organizationId}` : '';
    return this.request(`${API_ENDPOINTS.vendors}${params}`);
  }

  async getVendor(id: string): Promise<Vendor> {
    return this.request(`${API_ENDPOINTS.vendors}/${id}`);
  }

  async createVendor(data: Partial<Vendor>): Promise<Vendor> {
    return this.request(API_ENDPOINTS.vendors, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVendor(id: string, data: Partial<Vendor>): Promise<Vendor> {
    return this.request(`${API_ENDPOINTS.vendors}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVendor(id: string): Promise<void> {
    return this.request(`${API_ENDPOINTS.vendors}/${id}`, {
      method: 'DELETE',
    });
  }

  async assessVendor(id: string): Promise<{ job_id: string }> {
    return this.request(`${API_ENDPOINTS.vendors}/${id}/assess`, {
      method: 'POST',
    });
  }

  // ============ Findings ============
  async getFindings(filters?: {
    organization_id?: string;
    factor_id?: string;
    severity?: string;
    status?: string;
  }): Promise<RiskFinding[]> {
    const params = new URLSearchParams(filters as Record<string, string>);
    return this.request(`${API_ENDPOINTS.findings}?${params}`);
  }

  async getFinding(id: string): Promise<RiskFinding> {
    return this.request(`${API_ENDPOINTS.findings}/${id}`);
  }

  async updateFinding(id: string, data: Partial<RiskFinding>): Promise<RiskFinding> {
    return this.request(`${API_ENDPOINTS.findings}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ============ Remediations ============
  async getRemediations(filters?: {
    organization_id?: string;
    status?: string;
    priority?: string;
  }): Promise<Remediation[]> {
    const params = new URLSearchParams(filters as Record<string, string>);
    return this.request(`${API_ENDPOINTS.remediations}?${params}`);
  }

  async getRemediation(id: string): Promise<Remediation> {
    return this.request(`${API_ENDPOINTS.remediations}/${id}`);
  }

  async createRemediation(data: Partial<Remediation>): Promise<Remediation> {
    return this.request(API_ENDPOINTS.remediations, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRemediation(id: string, data: Partial<Remediation>): Promise<Remediation> {
    return this.request(`${API_ENDPOINTS.remediations}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async generateAIRemediation(findingId: string): Promise<Remediation> {
    return this.request(`${API_ENDPOINTS.remediations}/generate`, {
      method: 'POST',
      body: JSON.stringify({ finding_id: findingId }),
    });
  }

  // ============ Reports ============
  async getReports(type?: string): Promise<Report[]> {
    const params = type ? `?type=${type}` : '';
    return this.request(`${API_ENDPOINTS.reports}${params}`);
  }

  async getReport(id: string): Promise<Report> {
    return this.request(`${API_ENDPOINTS.reports}/${id}`);
  }

  async generateReport(data: {
    type: string;
    organization_id: string;
    format: string;
    date_range?: { start: string; end: string };
  }): Promise<Report> {
    return this.request(API_ENDPOINTS.reports, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteReport(id: string): Promise<void> {
    return this.request(`${API_ENDPOINTS.reports}/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ Benchmarks ============
  async getBenchmark(organizationId: string, industry?: string): Promise<Benchmark> {
    const params = industry ? `?industry=${industry}` : '';
    return this.request(`${API_ENDPOINTS.benchmarks}/${organizationId}${params}`);
  }

  // ============ Trends ============
  async getTrends(organizationId: string, period: string): Promise<TrendData> {
    return this.request(`${API_ENDPOINTS.trends}/${organizationId}?period=${period}`);
  }

  // ============ Risk Quantification ============
  async quantifyRisk(organizationId: string): Promise<RiskQuantification> {
    return this.request(`${API_ENDPOINTS.quantify}/${organizationId}`);
  }

  // ============ Compliance ============
  async getComplianceMapping(
    organizationId: string,
    framework: string
  ): Promise<ComplianceMapping[]> {
    return this.request(`${API_ENDPOINTS.compliance}/${organizationId}?framework=${framework}`);
  }

  // ============ AI Chat ============
  async chat(message: string, context?: object): Promise<{ response: string; suggestions: string[] }> {
    return this.request(API_ENDPOINTS.chat, {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  // ============ Settings ============
  async getSettings(): Promise<RiskScoreSettings> {
    return this.request('/settings');
  }

  async updateSettings(settings: Partial<RiskScoreSettings>): Promise<RiskScoreSettings> {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export const riskscoreAPI = new RiskScoreAPI();
export default riskscoreAPI;
