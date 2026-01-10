/**
 * RuntimeGuard API Client
 * Tool 09 - Regulatory Compliance Auditing & Framework Assessment
 * 
 * TypeScript client for communicating with RuntimeGuard backend
 */

const API_BASE_URL = import.meta.env.VITE_RUNTIMEGUARD_API_URL || 'http://localhost:4009/api';

// ============= Types =============

export interface Framework {
  id: string;
  name: string;
  shortName: string;
  version: string;
  description: string;
  category: string;
  industries: string[];
  regions: string[];
  controlCount: number;
  isActive: boolean;
}

export interface Control {
  controlId: string;
  name: string;
  description: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  automatable: boolean;
  testProcedure?: string;
  evidenceRequired?: string[];
}

export interface Assessment {
  id: string;
  name: string;
  status: 'draft' | 'in-progress' | 'review' | 'completed';
  frameworks: string[];
  scope: {
    systems: string[];
    departments: string[];
    dataTypes: string[];
  };
  startDate?: string;
  completedDate?: string;
  results?: AssessmentResults;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentResults {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  controlsPassed: number;
  controlsFailed: number;
  controlsPartial: number;
  controlsNotApplicable: number;
  criticalGaps: number;
  highGaps: number;
}

export interface ControlAssessment {
  controlId: string;
  status: 'not-started' | 'in-progress' | 'passed' | 'failed' | 'partial' | 'not-applicable';
  assessorNotes?: string;
  evidenceIds?: string[];
  gap?: {
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    remediation: string;
  };
}

export interface Evidence {
  id: string;
  name: string;
  description?: string;
  category: 'policy' | 'procedure' | 'configuration' | 'screenshot' | 'log' | 'attestation' | 'report' | 'certificate';
  controlIds: string[];
  assessmentId?: string;
  status: 'pending' | 'valid' | 'invalid' | 'expired';
  expiresAt?: string;
  uploadedAt: string;
}

export interface GapAnalysis {
  assessmentId: string;
  totalGaps: number;
  criticalGaps: number;
  gaps: Gap[];
  recommendations: string[];
  roadmap?: RemediationPhase[];
  aiPowered: boolean;
}

export interface Gap {
  controlId: string;
  controlName: string;
  framework: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  remediation: string;
  estimatedEffort: string;
}

export interface RemediationPhase {
  phase: number;
  name: string;
  duration: string;
  controls: string[];
  focus: string;
}

export interface ComplianceStatus {
  frameworks: {
    total: number;
    list: Framework[];
  };
  recentAssessments: Assessment[];
  overallHealth: {
    score: number;
    status: 'excellent' | 'good' | 'needs-improvement' | 'critical' | 'no-data' | 'in-progress';
    message?: string;
    assessmentCount?: number;
  };
}

export interface FrameworkRecommendation {
  framework: string;
  priority: 'required' | 'recommended' | 'optional';
  reason: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  simulated?: boolean;
}

// ============= API Client =============

class RuntimeGuardApi {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Request failed' };
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  // ============= Assessments =============

  async listAssessments(filters?: {
    status?: string;
    framework?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ assessments: Assessment[]; pagination: any }>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.framework) params.append('framework', filters.framework);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    
    return this.request(`/assessments?${params.toString()}`);
  }

  async createAssessment(data: {
    name: string;
    frameworks: string[];
    scope?: {
      systems?: string[];
      departments?: string[];
      dataTypes?: string[];
    };
  }): Promise<ApiResponse<{ assessment: Assessment }>> {
    return this.request('/assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAssessment(assessmentId: string): Promise<ApiResponse<{ assessment: Assessment }>> {
    return this.request(`/assessments/${assessmentId}`);
  }

  async startAssessment(assessmentId: string): Promise<ApiResponse<{ assessment: Assessment }>> {
    return this.request(`/assessments/${assessmentId}/start`, {
      method: 'POST',
    });
  }

  async runAutomatedTests(assessmentId: string): Promise<ApiResponse<{
    tested: number;
    passed: number;
    failed: number;
    results: any[];
  }>> {
    return this.request(`/assessments/${assessmentId}/run-tests`, {
      method: 'POST',
    });
  }

  async updateControlStatus(
    assessmentId: string,
    controlId: string,
    data: ControlAssessment
  ): Promise<ApiResponse<{ assessment: Assessment }>> {
    return this.request(`/assessments/${assessmentId}/controls/${controlId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async analyzeGaps(assessmentId: string): Promise<ApiResponse<GapAnalysis>> {
    return this.request(`/assessments/${assessmentId}/analyze-gaps`, {
      method: 'POST',
    });
  }

  async generateReport(assessmentId: string, format: string = 'json'): Promise<ApiResponse<any>> {
    return this.request(`/assessments/${assessmentId}/report?format=${format}`);
  }

  // ============= Frameworks =============

  async listFrameworks(filters?: {
    category?: string;
    industry?: string;
  }): Promise<ApiResponse<{ frameworks: Framework[] }>> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.industry) params.append('industry', filters.industry);
    
    return this.request(`/v2/frameworks?${params.toString()}`);
  }

  async getFrameworkDetails(frameworkId: string): Promise<ApiResponse<{ framework: Framework }>> {
    return this.request(`/v2/frameworks/${frameworkId}`);
  }

  async getFrameworkControls(frameworkId: string, filters?: {
    category?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ controls: Control[]; pagination: any }>> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    
    return this.request(`/v2/frameworks/${frameworkId}/controls?${params.toString()}`);
  }

  async getCrossFrameworkMappings(
    sourceFramework: string,
    targetFramework: string
  ): Promise<ApiResponse<{ mappings: any[] }>> {
    const params = new URLSearchParams();
    params.append('source', sourceFramework);
    params.append('target', targetFramework);
    
    return this.request(`/v2/frameworks/mappings?${params.toString()}`);
  }

  async getFrameworkRecommendations(data: {
    industry: string;
    region: string;
    dataTypes?: string[];
  }): Promise<ApiResponse<{ recommendations: FrameworkRecommendation[] }>> {
    return this.request('/v2/frameworks/recommendations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============= Evidence =============

  async listEvidence(filters?: {
    assessmentId?: string;
    controlId?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ evidence: Evidence[]; pagination: any }>> {
    const params = new URLSearchParams();
    if (filters?.assessmentId) params.append('assessmentId', filters.assessmentId);
    if (filters?.controlId) params.append('controlId', filters.controlId);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    
    return this.request(`/evidence?${params.toString()}`);
  }

  async uploadEvidence(data: FormData): Promise<ApiResponse<{ evidence: Evidence }>> {
    try {
      const response = await fetch(`${this.baseUrl}/evidence`, {
        method: 'POST',
        body: data,
        // Don't set Content-Type for FormData - browser will set it with boundary
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Upload failed' };
      }

      return result;
    } catch (error) {
      console.error('Evidence upload error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload error' 
      };
    }
  }

  async getEvidence(evidenceId: string): Promise<ApiResponse<{ evidence: Evidence }>> {
    return this.request(`/evidence/${evidenceId}`);
  }

  async downloadEvidence(evidenceId: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.request(`/evidence/${evidenceId}/download`);
  }

  async validateEvidence(evidenceId: string): Promise<ApiResponse<{ evidence: Evidence }>> {
    return this.request(`/evidence/${evidenceId}/validate`, {
      method: 'POST',
    });
  }

  async deleteEvidence(evidenceId: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request(`/evidence/${evidenceId}`, {
      method: 'DELETE',
    });
  }

  async getExpiringEvidence(days: number = 30): Promise<ApiResponse<{ evidence: Evidence[] }>> {
    return this.request(`/evidence/expiring?days=${days}`);
  }

  async collectEvidenceFromVanta(controlIds?: string[]): Promise<ApiResponse<{
    collected: number;
    evidence: Evidence[];
  }>> {
    return this.request('/evidence/collect/vanta', {
      method: 'POST',
      body: JSON.stringify({ controlIds }),
    });
  }

  async collectEvidenceFromDrata(controlIds?: string[]): Promise<ApiResponse<{
    collected: number;
    evidence: Evidence[];
  }>> {
    return this.request('/evidence/collect/drata', {
      method: 'POST',
      body: JSON.stringify({ controlIds }),
    });
  }

  // ============= Quick Status =============

  async getComplianceStatus(): Promise<ApiResponse<{ status: ComplianceStatus }>> {
    return this.request('/quick/compliance-status');
  }

  // ============= Legacy Endpoints =============

  async legacyListFrameworks(): Promise<ApiResponse<any>> {
    return this.request('/frameworks');
  }

  async legacyGetFramework(name: string): Promise<ApiResponse<any>> {
    return this.request(`/frameworks/${name}`);
  }

  async legacyListAudits(): Promise<ApiResponse<any>> {
    return this.request('/audits');
  }

  async legacyCreateAudit(data: any): Promise<ApiResponse<any>> {
    return this.request('/audits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Export singleton instance
export const complianceCheckApi = new RuntimeGuardApi();

// Export class for testing/custom instances
export { RuntimeGuardApi };

// ============= Simulation Helper =============

/**
 * Generate simulated data when API is unavailable
 */
export const simulatedData = {
  frameworks: [
    { id: 'soc2', name: 'SOC 2 Type II', shortName: 'SOC2', version: '2023', controlCount: 64, category: 'security' },
    { id: 'iso27001', name: 'ISO 27001:2022', shortName: 'ISO27001', version: '2022', controlCount: 93, category: 'security' },
    { id: 'hipaa', name: 'HIPAA Security Rule', shortName: 'HIPAA', version: '2023', controlCount: 54, category: 'healthcare' },
    { id: 'pci-dss', name: 'PCI DSS v4.0', shortName: 'PCI-DSS', version: '4.0', controlCount: 250, category: 'payment' },
    { id: 'gdpr', name: 'GDPR', shortName: 'GDPR', version: '2018', controlCount: 99, category: 'privacy' },
    { id: 'nist-csf', name: 'NIST Cybersecurity Framework', shortName: 'NIST-CSF', version: '2.0', controlCount: 108, category: 'security' },
  ] as Framework[],

  generateAssessment(id: string, name: string, frameworks: string[]): Assessment {
    return {
      id,
      name,
      status: 'draft',
      frameworks,
      scope: { systems: [], departments: [], dataTypes: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  generateGapAnalysis(assessmentId: string): GapAnalysis {
    return {
      assessmentId,
      totalGaps: 12,
      criticalGaps: 2,
      gaps: [
        {
          controlId: 'CC6.1',
          controlName: 'Logical Access Controls',
          framework: 'SOC2',
          severity: 'critical',
          description: 'Multi-factor authentication not enforced for all users',
          remediation: 'Implement MFA for all user accounts using TOTP or hardware tokens',
          estimatedEffort: '2-4 weeks',
        },
        {
          controlId: 'CC7.2',
          controlName: 'Security Monitoring',
          framework: 'SOC2',
          severity: 'high',
          description: 'Security monitoring does not cover all critical systems',
          remediation: 'Extend SIEM coverage to include all production systems',
          estimatedEffort: '3-6 weeks',
        },
      ],
      recommendations: [
        'Prioritize MFA implementation across all systems',
        'Extend security monitoring coverage',
        'Document incident response procedures',
      ],
      roadmap: [
        { phase: 1, name: 'Critical Fixes', duration: '4 weeks', controls: ['CC6.1'], focus: 'Access controls' },
        { phase: 2, name: 'High Priority', duration: '6 weeks', controls: ['CC7.2'], focus: 'Monitoring' },
      ],
      aiPowered: false,
    };
  },
};
