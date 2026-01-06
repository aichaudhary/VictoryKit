import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4028/api/v1/soarengine';

export interface Playbook {
  _id: string;
  name: string;
  description: string;
  category: string;
  severity: string;
  steps: PlaybookStep[];
  status: string;
  executionStats: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageDuration: number;
  };
}

export interface PlaybookStep {
  stepNumber: number;
  action: string;
  tool: string;
  parameters: any;
  condition?: string;
}

export interface Case {
  _id: string;
  caseId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  status: string;
  assignedTo?: string;
  createdAt: string;
}

export interface Execution {
  _id: string;
  executionId: string;
  playbookName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep: number;
  totalSteps: number;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
}

export interface Integration {
  _id: string;
  toolName: string;
  toolType: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  healthCheck: {
    isHealthy: boolean;
    lastChecked: string;
  };
}

class SOAREngineAPI {
  
  // ==================== PLAYBOOK APIs ====================
  
  async getPlaybooks(params?: {
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await axios.get(`${API_BASE_URL}/playbooks`, { params });
    return response.data;
  }
  
  async getPlaybookById(id: string) {
    const response = await axios.get(`${API_BASE_URL}/playbooks/${id}`);
    return response.data;
  }
  
  async createPlaybook(data: Partial<Playbook>) {
    const response = await axios.post(`${API_BASE_URL}/playbooks`, data);
    return response.data;
  }
  
  async updatePlaybook(id: string, data: Partial<Playbook>) {
    const response = await axios.put(`${API_BASE_URL}/playbooks/${id}`, data);
    return response.data;
  }
  
  async deletePlaybook(id: string) {
    const response = await axios.delete(`${API_BASE_URL}/playbooks/${id}`);
    return response.data;
  }
  
  async clonePlaybook(id: string) {
    const response = await axios.post(`${API_BASE_URL}/playbooks/${id}/clone`);
    return response.data;
  }
  
  async getPlaybookTemplates() {
    const response = await axios.get(`${API_BASE_URL}/templates`);
    return response.data;
  }
  
  // ==================== EXECUTION APIs ====================
  
  async executePlaybook(data: {
    playbook_id: string;
    incident_id?: string;
    input_data?: any;
    execution_mode?: 'automatic' | 'semi_automatic' | 'manual_approval';
    notify_on_complete?: boolean;
    rollback_on_error?: boolean;
  }) {
    const response = await axios.post(`${API_BASE_URL}/executions`, data);
    return response.data;
  }
  
  async getExecutions(params?: {
    status?: string;
    playbookId?: string;
    caseId?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await axios.get(`${API_BASE_URL}/executions`, { params });
    return response.data;
  }
  
  async getExecutionById(executionId: string) {
    const response = await axios.get(`${API_BASE_URL}/executions/${executionId}`);
    return response.data;
  }
  
  async cancelExecution(executionId: string) {
    const response = await axios.post(`${API_BASE_URL}/executions/${executionId}/cancel`);
    return response.data;
  }
  
  // ==================== CASE APIs ====================
  
  async getCases(params?: {
    status?: string;
    severity?: string;
    category?: string;
    assignedTo?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await axios.get(`${API_BASE_URL}/cases`, { params });
    return response.data;
  }
  
  async getCaseById(caseId: string) {
    const response = await axios.get(`${API_BASE_URL}/cases/${caseId}`);
    return response.data;
  }
  
  async createCase(data: {
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    assigned_to?: string;
    related_events?: string[];
    auto_execute_playbook?: boolean;
    playbook_id?: string;
    sla_hours?: number;
  }) {
    const response = await axios.post(`${API_BASE_URL}/cases`, data);
    return response.data;
  }
  
  async updateCase(caseId: string, data: Partial<Case>) {
    const response = await axios.put(`${API_BASE_URL}/cases/${caseId}`, data);
    return response.data;
  }
  
  async assignCase(caseId: string, analystId: string) {
    const response = await axios.post(`${API_BASE_URL}/cases/${caseId}/assign`, {
      analyst_id: analystId
    });
    return response.data;
  }
  
  async closeCase(caseId: string, data: {
    resolution_summary: string;
    root_cause?: string;
    actions_taken?: string[];
    recommendations?: string[];
  }) {
    const response = await axios.post(`${API_BASE_URL}/cases/${caseId}/close`, data);
    return response.data;
  }
  
  // ==================== INTEGRATION APIs ====================
  
  async getIntegrations(params?: {
    toolType?: string;
    status?: string;
    search?: string;
  }) {
    const response = await axios.get(`${API_BASE_URL}/integrations`, { params });
    return response.data;
  }
  
  async getIntegrationById(id: string) {
    const response = await axios.get(`${API_BASE_URL}/integrations/${id}`);
    return response.data;
  }
  
  async createIntegration(data: Partial<Integration>) {
    const response = await axios.post(`${API_BASE_URL}/integrations`, data);
    return response.data;
  }
  
  async updateIntegration(id: string, data: Partial<Integration>) {
    const response = await axios.put(`${API_BASE_URL}/integrations/${id}`, data);
    return response.data;
  }
  
  async deleteIntegration(id: string) {
    const response = await axios.delete(`${API_BASE_URL}/integrations/${id}`);
    return response.data;
  }
  
  async testIntegration(id: string) {
    const response = await axios.post(`${API_BASE_URL}/integrations/${id}/test`);
    return response.data;
  }
  
  // ==================== METRICS APIs ====================
  
  async getAutomationMetrics(timePeriod: 'today' | 'last_7_days' | 'last_30_days' | 'last_quarter' | 'last_year' = 'last_7_days') {
    const response = await axios.get(`${API_BASE_URL}/metrics/automation`, {
      params: { time_period: timePeriod }
    });
    return response.data;
  }
  
  async getDashboardStats() {
    const response = await axios.get(`${API_BASE_URL}/dashboard/stats`);
    return response.data;
  }
  
  // ==================== HEALTH CHECK ====================
  
  async healthCheck() {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  }
}

export default new SOAREngineAPI();
