// EmailGuard API Service
// TypeScript client for EmailGuard backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4035/api';

// Types
export interface Email {
  id: string;
  messageId: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  body: {
    text?: string;
    html?: string;
  };
  attachments: Attachment[];
  headers: Record<string, string>;
  receivedAt: string;
  processedAt?: string;
  status: 'pending' | 'delivered' | 'quarantined' | 'blocked' | 'released';
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export interface EmailAddress {
  address: string;
  name?: string;
  domain: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  hash: {
    md5?: string;
    sha256?: string;
  };
  scanResult: 'clean' | 'suspicious' | 'malicious' | 'pending';
  threatDetails?: ThreatDetails;
}

export interface ThreatDetails {
  type: string;
  confidence: number;
  indicators: string[];
  description: string;
}

export interface EmailAnalysis {
  id: string;
  emailId: string;
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  overallScore: number;
  categories: AnalysisCategory[];
  indicators: ThreatIndicator[];
  recommendations: string[];
  processingTime: number;
  analyzedAt: string;
}

export interface AnalysisCategory {
  name: 'phishing' | 'malware' | 'spam' | 'bec' | 'spoofing' | 'dlp';
  score: number;
  detected: boolean;
  details: Record<string, unknown>;
}

export interface ThreatIndicator {
  type: string;
  value: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source?: string;
}

export interface QuarantineItem {
  id: string;
  emailId: string;
  email: Email;
  reason: string;
  category: 'spam' | 'phishing' | 'malware' | 'policy_violation';
  quarantinedAt: string;
  expiresAt: string;
  status: 'quarantined' | 'released' | 'deleted' | 'pending_review';
  releasedBy?: string;
  releasedAt?: string;
}

export interface EmailPolicy {
  id: string;
  name: string;
  description: string;
  type: 'inbound' | 'outbound' | 'internal';
  enabled: boolean;
  priority: number;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  createdAt: string;
  updatedAt: string;
}

export interface PolicyCondition {
  field: string;
  operator: 'equals' | 'contains' | 'matches' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: string | string[] | number;
}

export interface PolicyAction {
  type: 'allow' | 'block' | 'quarantine' | 'tag' | 'encrypt' | 'redirect' | 'notify';
  parameters?: Record<string, unknown>;
}

export interface EmailAlert {
  id: string;
  type: 'phishing_detected' | 'malware_blocked' | 'bec_attempt' | 'dlp_violation' | 'suspicious_activity' | 'policy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  emailId?: string;
  userId?: string;
  title: string;
  description: string;
  indicators: ThreatIndicator[];
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface EmailStats {
  totalEmails: number;
  delivered: number;
  quarantined: number;
  blocked: number;
  threatsByType: Record<string, number>;
  threatsByLevel: Record<string, number>;
  topSenders: { address: string; count: number }[];
  topThreats: { type: string; count: number }[];
  trendsDaily: { date: string; emails: number; threats: number }[];
}

export interface DashboardData {
  stats: EmailStats;
  recentAlerts: EmailAlert[];
  quarantineCount: number;
  pendingReview: number;
  userRiskSummary: { high: number; medium: number; low: number };
  complianceStatus: { framework: string; score: number }[];
}

export interface EmailUser {
  id: string;
  email: string;
  name: string;
  department?: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  phishingTestResults: { passed: number; failed: number };
  trainingStatus: { completed: number; pending: number };
  lastIncident?: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'threat_summary' | 'compliance' | 'user_risk' | 'policy_effectiveness' | 'trend_analysis';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  generatedAt: string;
  format: 'pdf' | 'csv' | 'json' | 'xlsx';
  downloadUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// API Helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('emailguard_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Email Processing
export const processEmail = (emailData: Partial<Email>) =>
  apiRequest<{ success: boolean; email: Email; analysis: EmailAnalysis }>('/process', {
    method: 'POST',
    body: JSON.stringify(emailData),
  });

export const processBulkEmails = (emails: Partial<Email>[]) =>
  apiRequest<{ success: boolean; processed: number; results: Email[] }>('/process/bulk', {
    method: 'POST',
    body: JSON.stringify({ emails }),
  });

// Analysis
export const getEmailAnalysis = (emailId: string) =>
  apiRequest<{ success: boolean; analysis: EmailAnalysis }>(`/analysis/${emailId}`);

// Quarantine
export const getQuarantine = (params?: {
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) queryParams.append(key, value.toString());
  });
  
  return apiRequest<{ success: boolean; items: QuarantineItem[]; total: number }>(
    `/quarantine?${queryParams}`
  );
};

export const releaseFromQuarantine = (quarantineId: string, reason?: string) =>
  apiRequest<{ success: boolean; item: QuarantineItem }>(`/quarantine/${quarantineId}`, {
    method: 'PUT',
    body: JSON.stringify({ action: 'release', reason }),
  });

export const deleteFromQuarantine = (quarantineId: string) =>
  apiRequest<{ success: boolean }>(`/quarantine/${quarantineId}`, {
    method: 'DELETE',
  });

// Policies
export const getPolicies = (params?: { type?: string; enabled?: boolean }) => {
  const queryParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) queryParams.append(key, value.toString());
  });
  
  return apiRequest<{ success: boolean; policies: EmailPolicy[] }>(`/policies?${queryParams}`);
};

export const createPolicy = (policy: Omit<EmailPolicy, 'id' | 'createdAt' | 'updatedAt'>) =>
  apiRequest<{ success: boolean; policy: EmailPolicy }>('/policies', {
    method: 'POST',
    body: JSON.stringify(policy),
  });

export const updatePolicy = (policyId: string, updates: Partial<EmailPolicy>) =>
  apiRequest<{ success: boolean; policy: EmailPolicy }>(`/policies/${policyId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });

export const deletePolicy = (policyId: string) =>
  apiRequest<{ success: boolean }>(`/policies/${policyId}`, {
    method: 'DELETE',
  });

// Alerts
export const getAlerts = (params?: {
  severity?: string;
  status?: string;
  type?: string;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) queryParams.append(key, value.toString());
  });
  
  return apiRequest<{ success: boolean; alerts: EmailAlert[]; total: number }>(
    `/alerts?${queryParams}`
  );
};

export const resolveAlert = (alertId: string, resolution: {
  status: 'resolved' | 'false_positive';
  notes?: string;
}) =>
  apiRequest<{ success: boolean; alert: EmailAlert }>(`/alerts/${alertId}/resolve`, {
    method: 'PUT',
    body: JSON.stringify(resolution),
  });

// Reports
export const getReports = (params?: { type?: string; period?: string }) => {
  const queryParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  return apiRequest<{ success: boolean; reports: Report[] }>(`/reports?${queryParams}`);
};

export const generateReport = (data: {
  type: Report['type'];
  period: Report['period'];
  format: Report['format'];
  filters?: Record<string, unknown>;
}) =>
  apiRequest<{ success: boolean; report: Report }>('/reports/generate', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Statistics & Dashboard
export const getStats = (params?: { period?: string }) => {
  const queryParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  return apiRequest<{ success: boolean; stats: EmailStats }>(`/stats?${queryParams}`);
};

export const getDashboard = () =>
  apiRequest<{ success: boolean; data: DashboardData }>('/dashboard');

// Users
export const getUsers = (params?: {
  riskLevel?: string;
  department?: string;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) queryParams.append(key, value.toString());
  });
  
  return apiRequest<{ success: boolean; users: EmailUser[]; total: number }>(
    `/users?${queryParams}`
  );
};

export const updateUserRisk = (userId: string, data: {
  riskLevel?: EmailUser['riskLevel'];
  notes?: string;
}) =>
  apiRequest<{ success: boolean; user: EmailUser }>(`/users/${userId}/risk`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

// Health
export const getHealth = () =>
  apiRequest<{ service: string; status: string; timestamp: string; version: string }>('/health');

export default {
  // Email Processing
  processEmail,
  processBulkEmails,
  
  // Analysis
  getEmailAnalysis,
  
  // Quarantine
  getQuarantine,
  releaseFromQuarantine,
  deleteFromQuarantine,
  
  // Policies
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  
  // Alerts
  getAlerts,
  resolveAlert,
  
  // Reports
  getReports,
  generateReport,
  
  // Stats & Dashboard
  getStats,
  getDashboard,
  
  // Users
  getUsers,
  updateUserRisk,
  
  // Health
  getHealth,
};
