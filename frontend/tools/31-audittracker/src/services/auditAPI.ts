import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4031/api/v1/audittracker';

export interface AuditLog {
  auditId: string;
  logId: string;
  timestamp: string;
  source: {
    type: string;
    name: string;
    hostname?: string;
  };
  event: {
    event_id: string;
    category: string;
    action: string;
    severity: string;
    outcome: string;
  };
  actor: {
    user_id?: string;
    username?: string;
    ip_address?: string;
  };
  target?: {
    resource_type?: string;
    resource_id?: string;
    resource_name?: string;
  };
  risk: {
    score: number;
    level: string;
    anomaly_detected: boolean;
  };
  compliance: {
    frameworks: string[];
    violation: boolean;
  };
}

export interface ComplianceEvidence {
  evidenceId: string;
  framework: {
    name: string;
    version: string;
  };
  control: {
    control_id: string;
    control_name: string;
  };
  evidence: {
    type: string;
    title: string;
    audit_log_ids: string[];
  };
  quality?: {
    overall_score: number;
    rating: string;
  };
}

export interface Investigation {
  investigationId: string;
  case_number: string;
  investigation: {
    title: string;
    type: string;
    severity: string;
    status: string;
  };
  timeline: {
    investigation_started: string;
  };
}

export interface Anomaly {
  anomalyId: string;
  detection: {
    detected_at: string;
    detection_model: string;
    confidence_score: number;
  };
  anomaly: {
    type: string;
    severity: string;
    risk_score: number;
    description: string;
  };
}

export interface AuditPolicy {
  policyId: string;
  policy_name: string;
  policy: {
    status: string;
    description: string;
  };
  sources: {
    enabled_sources: string[];
  };
}

class AuditAPI {
  
  // ==================== AUDIT LOGS ====================
  
  async createAuditLog(data: any): Promise<AuditLog> {
    const response = await axios.post(`${API_BASE}/audit-logs`, data);
    return response.data.data;
  }
  
  async getAuditLogs(params: any = {}): Promise<{ data: AuditLog[], pagination: any }> {
    const response = await axios.get(`${API_BASE}/audit-logs`, { params });
    return response.data;
  }
  
  async getAuditLogById(id: string): Promise<AuditLog> {
    const response = await axios.get(`${API_BASE}/audit-logs/${id}`);
    return response.data.data;
  }
  
  async verifyAuditIntegrity(id: string): Promise<any> {
    const response = await axios.post(`${API_BASE}/audit-logs/${id}/verify`);
    return response.data.data;
  }
  
  async flagAuditLog(id: string, data: any): Promise<AuditLog> {
    const response = await axios.post(`${API_BASE}/audit-logs/${id}/flag`, data);
    return response.data.data;
  }
  
  // ==================== COMPLIANCE EVIDENCE ====================
  
  async collectComplianceEvidence(data: any): Promise<ComplianceEvidence> {
    const response = await axios.post(`${API_BASE}/compliance/evidence`, data);
    return response.data.data;
  }
  
  async getComplianceEvidence(params: any = {}): Promise<{ data: ComplianceEvidence[], pagination: any }> {
    const response = await axios.get(`${API_BASE}/compliance/evidence`, { params });
    return response.data;
  }
  
  async attestEvidence(id: string, data: any): Promise<ComplianceEvidence> {
    const response = await axios.post(`${API_BASE}/compliance/evidence/${id}/attest`, data);
    return response.data.data;
  }
  
  // ==================== INVESTIGATIONS ====================
  
  async createInvestigation(data: any): Promise<Investigation> {
    const response = await axios.post(`${API_BASE}/investigations`, data);
    return response.data.data;
  }
  
  async getInvestigations(params: any = {}): Promise<{ data: Investigation[], pagination: any }> {
    const response = await axios.get(`${API_BASE}/investigations`, { params });
    return response.data;
  }
  
  async getInvestigationById(id: string): Promise<Investigation> {
    const response = await axios.get(`${API_BASE}/investigations/${id}`);
    return response.data.data;
  }
  
  async updateInvestigationStatus(id: string, status: string): Promise<Investigation> {
    const response = await axios.put(`${API_BASE}/investigations/${id}/status`, { status });
    return response.data.data;
  }
  
  async addInvestigationEvidence(id: string, data: any): Promise<Investigation> {
    const response = await axios.post(`${API_BASE}/investigations/${id}/evidence`, data);
    return response.data.data;
  }
  
  async addInvestigationFinding(id: string, data: any): Promise<Investigation> {
    const response = await axios.post(`${API_BASE}/investigations/${id}/findings`, data);
    return response.data.data;
  }
  
  // ==================== ANOMALY DETECTION ====================
  
  async detectAnomalies(data: any): Promise<any> {
    const response = await axios.post(`${API_BASE}/anomalies/detect`, data);
    return response.data.data;
  }
  
  async getAnomalies(params: any = {}): Promise<{ data: Anomaly[], pagination: any }> {
    const response = await axios.get(`${API_BASE}/anomalies`, { params });
    return response.data;
  }
  
  async markAnomalyFalsePositive(id: string, data: any): Promise<Anomaly> {
    const response = await axios.post(`${API_BASE}/anomalies/${id}/false-positive`, data);
    return response.data.data;
  }
  
  // ==================== AUDIT POLICIES ====================
  
  async createAuditPolicy(data: any): Promise<AuditPolicy> {
    const response = await axios.post(`${API_BASE}/policies`, data);
    return response.data.data;
  }
  
  async getAuditPolicies(params: any = {}): Promise<{ data: AuditPolicy[], pagination: any }> {
    const response = await axios.get(`${API_BASE}/policies`, { params });
    return response.data;
  }
  
  async activateAuditPolicy(id: string): Promise<AuditPolicy> {
    const response = await axios.post(`${API_BASE}/policies/${id}/activate`);
    return response.data.data;
  }
  
  async deactivateAuditPolicy(id: string): Promise<AuditPolicy> {
    const response = await axios.post(`${API_BASE}/policies/${id}/deactivate`);
    return response.data.data;
  }
  
  // ==================== DASHBOARD & ANALYTICS ====================
  
  async getDashboardStats(): Promise<any> {
    const response = await axios.get(`${API_BASE}/dashboard/stats`);
    return response.data.data;
  }
  
  async getAuditTimeline(params: any = {}): Promise<any> {
    const response = await axios.get(`${API_BASE}/dashboard/timeline`, { params });
    return response.data.data;
  }
  
  async searchAuditLogs(data: any): Promise<{ data: AuditLog[], pagination: any }> {
    const response = await axios.post(`${API_BASE}/search`, data);
    return response.data;
  }
  
  // ==================== HEALTH CHECK ====================
  
  async healthCheck(): Promise<any> {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data;
  }
}

export const auditAPI = new AuditAPI();
export default auditAPI;
