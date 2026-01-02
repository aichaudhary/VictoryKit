/**
 * CloudSecure API Service
 * Handles communication with the CloudSecure backend
 */

const API_BASE_URL = import.meta.env.VITE_CLOUDSECURE_API_URL || 'http://localhost:4031/api';

export interface CloudFinding {
  id: string;
  findingId?: string;
  resourceId: string;
  resourceName: string;
  resource?: string;
  resourceType: string;
  provider: 'aws' | 'azure' | 'gcp';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  title: string;
  description: string;
  recommendation: string;
  compliance?: { framework: string; control: string; requirement: string }[];
  remediationCode?: { terraform?: string; cli?: string };
  status?: string;
  createdAt?: string;
}

export interface ScanConfig {
  name: string;
  providers: string[];
  scanType: string;
  frameworks: string[];
  resourceTypes?: string[];
}

export interface Scan {
  _id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  providers: string[];
  scanType: string;
  results?: {
    totalResources: number;
    findingsCount: { critical: number; high: number; medium: number; low: number; info: number };
    complianceScores: { framework: string; score: number }[];
  };
  createdAt: string;
  completedAt?: string;
}

export interface DashboardData {
  securityScore: number;
  complianceScore: number;
  totalResources: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  resourcesByProvider: { provider: string; count: number }[];
  complianceByFramework: { framework: string; score: number }[];
  recentScans: Scan[];
  topFindings: CloudFinding[];
  attackPaths: { id: string; name: string; severity: string; riskScore: number }[];
}

export interface ComplianceReport {
  framework: string;
  totalControls: number;
  passed: number;
  failed: number;
  warning: number;
  complianceScore: number;
  controls: {
    controlId: string;
    controlTitle: string;
    status: 'passed' | 'failed' | 'warning';
    findingsCount: number;
  }[];
}

export interface AttackPath {
  _id: string;
  pathId: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  riskScore: number;
  entryPoint: string;
  target: string;
  hopCount: number;
  hops: {
    step: number;
    action: string;
    resource: string;
    technique: { id: string; name: string };
    description: string;
  }[];
  blastRadius?: {
    affectedResources: { resourceId: string; resourceName: string }[];
    estimatedRecordsAtRisk: number;
    estimatedCost: number;
  };
}

class CloudSecureAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Dashboard
  async getDashboard(): Promise<{ success: boolean; data: DashboardData }> {
    return this.request('/dashboard');
  }

  async getSecurityPosture(): Promise<{ success: boolean; data: any }> {
    return this.request('/dashboard/security-posture');
  }

  async getQuickStats(): Promise<{ success: boolean; data: any }> {
    return this.request('/dashboard/quick-stats');
  }

  // Scans
  async startScan(config: ScanConfig): Promise<{ success: boolean; data: { scan: Scan } }> {
    return this.request('/scans', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getScans(params?: { status?: string; limit?: number }): Promise<{ success: boolean; data: { scans: Scan[] } }> {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/scans${query}`);
  }

  async getScanStatus(scanId: string): Promise<{ success: boolean; data: { scan: Scan } }> {
    return this.request(`/scans/${scanId}/status`);
  }

  async getScanResults(scanId: string): Promise<{ success: boolean; data: { scan: Scan; findings: CloudFinding[] } }> {
    return this.request(`/scans/${scanId}/results`);
  }

  async cancelScan(scanId: string): Promise<{ success: boolean }> {
    return this.request(`/scans/${scanId}/cancel`, { method: 'POST' });
  }

  // Findings
  async getFindings(params?: {
    severity?: string;
    provider?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: { findings: CloudFinding[]; total: number; page: number; pages: number } }> {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/findings${query}`);
  }

  async getFindingById(findingId: string): Promise<{ success: boolean; data: { finding: CloudFinding } }> {
    return this.request(`/findings/${findingId}`);
  }

  async updateFindingStatus(findingId: string, status: string, notes?: string): Promise<{ success: boolean }> {
    return this.request(`/findings/${findingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  async getFindingStats(): Promise<{ success: boolean; data: any }> {
    return this.request('/findings/stats/overview');
  }

  async getRemediationCode(findingId: string): Promise<{ success: boolean; data: { remediationCode: any } }> {
    return this.request(`/findings/${findingId}/remediation`);
  }

  // Resources
  async getResources(params?: {
    provider?: string;
    type?: string;
    riskLevel?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: { resources: any[]; total: number } }> {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/resources${query}`);
  }

  async getResourceById(resourceId: string): Promise<{ success: boolean; data: { resource: any } }> {
    return this.request(`/resources/${resourceId}`);
  }

  async getInventorySummary(): Promise<{ success: boolean; data: any }> {
    return this.request('/resources/inventory/summary');
  }

  async getResourceTypes(): Promise<{ success: boolean; data: { types: string[] } }> {
    return this.request('/resources/types/all');
  }

  async detectDrift(): Promise<{ success: boolean; data: { driftedResources: any[] } }> {
    return this.request('/resources/drift/detect', { method: 'POST' });
  }

  // Compliance
  async getComplianceOverview(): Promise<{ success: boolean; data: any }> {
    return this.request('/compliance/overview');
  }

  async getComplianceReport(framework: string): Promise<{ success: boolean; data: { report: ComplianceReport } }> {
    return this.request(`/compliance/${framework}`);
  }

  async generateComplianceReport(framework: string): Promise<{ success: boolean; data: { report: ComplianceReport } }> {
    return this.request(`/compliance/${framework}/generate`, { method: 'POST' });
  }

  async getComplianceHistory(framework: string): Promise<{ success: boolean; data: { history: any[] } }> {
    return this.request(`/compliance/${framework}/history`);
  }

  async exportComplianceReport(framework: string, format: 'pdf' | 'csv' | 'json'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/compliance/${framework}/export?format=${format}`);
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  }

  // Attack Paths
  async getAttackPaths(params?: {
    severity?: string;
    provider?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: { attackPaths: AttackPath[]; total: number } }> {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/attack-paths${query}`);
  }

  async getAttackPathById(pathId: string): Promise<{ success: boolean; data: { attackPath: AttackPath } }> {
    return this.request(`/attack-paths/${pathId}`);
  }

  async updateAttackPathStatus(pathId: string, status: string): Promise<{ success: boolean }> {
    return this.request(`/attack-paths/${pathId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getBlastRadius(pathId: string): Promise<{ success: boolean; data: { blastRadius: any } }> {
    return this.request(`/attack-paths/${pathId}/blast-radius`);
  }

  async getMitreMapping(pathId: string): Promise<{ success: boolean; data: { mitreMapping: any[] } }> {
    return this.request(`/attack-paths/${pathId}/mitre-mapping`);
  }

  async getRemediationPlan(pathId: string): Promise<{ success: boolean; data: { plan: any } }> {
    return this.request(`/attack-paths/${pathId}/remediation-plan`);
  }

  // Health check
  async checkHealth(): Promise<{ status: string; service: string }> {
    return this.request('/health');
  }
}

export const cloudSecureAPI = new CloudSecureAPI();
export default cloudSecureAPI;
