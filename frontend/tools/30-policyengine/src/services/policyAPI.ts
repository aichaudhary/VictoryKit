// PolicyEngine API Client - TypeScript Interface
// Comprehensive API client for all policy management operations

export interface PolicyContent {
  purpose: string;
  scope: string;
  policy: string;
  procedures?: string[];
  exceptions?: string[];
  enforcement?: {
    automated?: boolean;
    platform?: string;
    rules?: string[];
  };
  references?: string[];
}

export interface PolicyFramework {
  baseFramework?: string;
  version?: string;
  mappings?: Array<{
    framework: string;
    controlId: string;
    coverage: 'full' | 'partial' | 'none';
  }>;
}

export interface PolicyCompliance {
  mandates?: string[];
  requirements?: string[];
  effectiveDate?: Date;
  reviewCycle?: 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'biennial';
  nextReviewDate?: Date;
  attestationRequired?: boolean;
}

export interface PolicyApplicability {
  scope: 'organization' | 'department' | 'team' | 'role' | 'system';
  departments?: string[];
  teams?: string[];
  roles?: string[];
  systems?: string[];
  locations?: string[];
  exemptions?: string[];
}

export interface PolicyOwner {
  userId: string;
  userName: string;
  email: string;
  department?: string;
  role?: string;
}

export interface Policy {
  policyId: string;
  policyNumber: string;
  policyName: string;
  category: string;
  status: 'draft' | 'under_review' | 'approved' | 'published' | 'archived';
  version: {
    current: string;
    major: number;
    minor: number;
    patch: number;
  };
  content: PolicyContent;
  framework: PolicyFramework;
  compliance: PolicyCompliance;
  applicability: PolicyApplicability;
  owner: PolicyOwner;
  metrics: {
    complianceRate: number;
    violationCount: number;
    exceptionCount: number;
  };
  approval?: {
    status: string;
    approvers: Array<any>;
    finalApprovalDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface RuntimeGuard {
  checkId: string;
  policyId: string;
  policyName: string;
  checkType: 'automated' | 'manual' | 'continuous';
  scope: string;
  scopeId?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  result?: {
    overall: 'compliant' | 'non_compliant' | 'partially_compliant';
    complianceScore: number;
    totalControls: number;
    compliantControls: number;
    nonCompliantControls: number;
  };
  findings?: Array<any>;
  execution: {
    startTime: Date;
    endTime?: Date;
    automated: boolean;
  };
}

export interface PolicyException {
  exceptionId: string;
  policyId: string;
  policyName: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'revoked';
  requestor: {
    userId: string;
    userName: string;
    email: string;
  };
  justification: {
    reason: string;
    businessImpact: string;
    urgency: string;
  };
  scope: {
    type: string;
    affected: string[];
  };
  duration: {
    startDate: Date;
    endDate: Date;
    duration: string;
  };
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
  };
  approval: {
    required: string[];
    approvals: Array<any>;
    finalDecision: string;
  };
}

export interface FrameworkMapping {
  mappingId: string;
  policyId: string;
  policyName: string;
  framework: {
    name: string;
    version: string;
    category: string;
  };
  mappings: Array<{
    controlId: string;
    controlName: string;
    controlDescription: string;
    mappingType: string;
    coverage: string;
    status: string;
  }>;
  complianceStatus: {
    overall: string;
    complianceScore: number;
    totalControls: number;
  };
  gaps?: Array<any>;
}

export interface DashboardStats {
  policies: {
    total: number;
    draft: number;
    approved: number;
    published: number;
  };
  exceptions: {
    total: number;
    pending: number;
    active: number;
  };
  compliance: {
    totalChecks: number;
    averageScore: number;
    recentChecks: RuntimeGuard[];
  };
}

class PolicyAPI {
  private baseURL: string;
  
  constructor() {
    this.baseURL = import.meta.env.VITE_POLICYENGINE_API_URL || 'http://localhost:4030/api/v1/policyengine';
  }
  
  // ==================== POLICY MANAGEMENT ====================
  
  async createPolicy(policyData: {
    policy_name: string;
    category: string;
    content: PolicyContent;
    framework?: PolicyFramework;
    compliance?: PolicyCompliance;
    applicability?: PolicyApplicability;
    owner: PolicyOwner;
  }): Promise<{ success: boolean; data: any }> {
    const response = await fetch(`${this.baseURL}/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policyData)
    });
    return response.json();
  }
  
  async getPolicies(filters?: {
    category?: string;
    status?: string;
    framework?: string;
    compliance?: string;
    scope?: string;
    owner?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{ success: boolean; data: Policy[]; pagination: any }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${this.baseURL}/policies?${params}`);
    return response.json();
  }
  
  async getPolicyById(policyId: string): Promise<{ success: boolean; data: Policy }> {
    const response = await fetch(`${this.baseURL}/policies/${policyId}`);
    return response.json();
  }
  
  async updatePolicy(policyId: string, updates: Partial<Policy>): Promise<{ success: boolean; data: Policy }> {
    const response = await fetch(`${this.baseURL}/policies/${policyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }
  
  async deletePolicy(policyId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseURL}/policies/${policyId}`, {
      method: 'DELETE'
    });
    return response.json();
  }
  
  // ==================== POLICY APPROVAL ====================
  
  async submitForApproval(policyId: string, approvers: Array<{ userId: string; userName: string; role: string }>): Promise<any> {
    const response = await fetch(`${this.baseURL}/policies/${policyId}/approval/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvers })
    });
    return response.json();
  }
  
  async approvePolicy(policyId: string, approverData: {
    approver_id: string;
    decision: 'approved' | 'rejected';
    comments?: string;
  }): Promise<any> {
    const response = await fetch(`${this.baseURL}/policies/${policyId}/approval/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(approverData)
    });
    return response.json();
  }
  
  // ==================== COMPLIANCE CHECKING ====================
  
  async checkCompliance(checkData: {
    policy_id: string;
    scope?: string;
    scope_id?: string;
    check_type?: 'automated' | 'manual' | 'continuous';
  }): Promise<any> {
    const response = await fetch(`${this.baseURL}/compliance/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkData)
    });
    return response.json();
  }
  
  async getRuntimeGuards(filters?: {
    policy_id?: string;
    scope?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: RuntimeGuard[]; pagination: any }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${this.baseURL}/compliance/checks?${params}`);
    return response.json();
  }
  
  // ==================== POLICY EXCEPTIONS ====================
  
  async createException(exceptionData: {
    policy_id: string;
    requestor: { userId: string; userName: string; email: string };
    justification: { reason: string; businessImpact: string; urgency: string };
    scope: { type: string; affected: string[] };
    duration: { duration: string };
    compensating_controls?: Array<any>;
  }): Promise<any> {
    const response = await fetch(`${this.baseURL}/exceptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exceptionData)
    });
    return response.json();
  }
  
  async getExceptions(filters?: {
    policy_id?: string;
    status?: string;
    requestor?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: PolicyException[]; pagination: any }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${this.baseURL}/exceptions?${params}`);
    return response.json();
  }
  
  async approveException(exceptionId: string, approvalData: {
    approver_id: string;
    approver_name: string;
    approver_role: string;
    decision: 'approved' | 'rejected';
    comments?: string;
  }): Promise<any> {
    const response = await fetch(`${this.baseURL}/exceptions/${exceptionId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(approvalData)
    });
    return response.json();
  }
  
  // ==================== FRAMEWORK MAPPING ====================
  
  async mapToFramework(mappingData: {
    policy_id: string;
    framework: { name: string; version: string; category?: string };
    mappings: Array<any>;
  }): Promise<any> {
    const response = await fetch(`${this.baseURL}/framework/map`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mappingData)
    });
    return response.json();
  }
  
  async getFrameworkMappings(filters?: {
    policy_id?: string;
    framework?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: FrameworkMapping[]; pagination: any }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${this.baseURL}/framework/mappings?${params}`);
    return response.json();
  }
  
  // ==================== DASHBOARD ====================
  
  async getDashboardStats(): Promise<{ success: boolean; data: DashboardStats }> {
    const response = await fetch(`${this.baseURL}/dashboard/stats`);
    return response.json();
  }
  
  // Health check
  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseURL}/health`);
    return response.json();
  }
}

export default new PolicyAPI();
