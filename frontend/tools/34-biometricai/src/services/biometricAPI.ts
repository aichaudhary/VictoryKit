// BiometricAI API Service
// TypeScript client for BiometricAI backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4034/api';

// Types
export interface BiometricProfile {
  id: string;
  userId: string;
  profiles: {
    face: BiometricModality;
    fingerprint: FingerprintModality;
    voice: VoiceModality;
    iris: BiometricModality;
    behavioral: BehavioralModality;
    palm: BiometricModality;
  };
  settings: ProfileSettings;
  createdAt: string;
  updatedAt: string;
}

export interface BiometricModality {
  enrolled: boolean;
  templates: BiometricTemplate[];
  settings: ModalitySettings;
}

export interface FingerprintModality extends BiometricModality {
  templates: FingerprintTemplate[];
}

export interface VoiceModality extends BiometricModality {
  templates: VoiceTemplate[];
}

export interface BehavioralModality extends BiometricModality {
  templates: BehavioralTemplate[];
}

export interface BiometricTemplate {
  templateId: string;
  data: string;
  quality: number;
  enrolledAt: string;
  lastUsed?: string;
  deviceInfo?: string;
}

export interface FingerprintTemplate extends BiometricTemplate {
  finger: 'left_thumb' | 'left_index' | 'left_middle' | 'left_ring' | 'left_pinky' |
          'right_thumb' | 'right_index' | 'right_middle' | 'right_ring' | 'right_pinky';
  sensorType: string;
}

export interface VoiceTemplate extends BiometricTemplate {
  phrases: string[];
  language: string;
}

export interface BehavioralTemplate extends BiometricTemplate {
  typingPattern: {
    keystrokeDynamics: Record<string, unknown>;
    typingSpeed: number;
    errorRate: number;
  };
  mousePattern: {
    movementPatterns: Record<string, unknown>;
    clickPatterns: Record<string, unknown>;
  };
}

export interface ModalitySettings {
  livenessDetection?: boolean;
  antiSpoofing?: boolean;
  confidenceThreshold?: number;
  qualityThreshold?: number;
  multiFinger?: boolean;
  textDependent?: boolean;
  noiseCancellation?: boolean;
}

export interface ProfileSettings {
  defaultModality: string;
  mfaEnabled: boolean;
  mfaModalities: string[];
  adaptiveAuth: boolean;
  continuousAuth: boolean;
}

export interface BiometricSession {
  id: string;
  userId: string;
  modality: string;
  action: 'enrollment' | 'authentication' | 'verification';
  status: 'success' | 'failure' | 'pending' | 'suspicious';
  matchScore?: number;
  livenessScore?: number;
  spoofDetected: boolean;
  deviceInfo: DeviceInfo;
  location?: GeoLocation;
  timestamp: string;
  duration: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface DeviceInfo {
  deviceId: string;
  platform: string;
  browser?: string;
  sensorType?: string;
  osVersion?: string;
}

export interface GeoLocation {
  country: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface AuthenticationResult {
  success: boolean;
  userId?: string;
  matchScore: number;
  livenessScore: number;
  spoofDetected: boolean;
  modality: string;
  sessionId: string;
  message: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface EnrollmentResult {
  success: boolean;
  templateId: string;
  modality: string;
  quality: number;
  message: string;
}

export interface QualityAnalysis {
  score: number;
  issues: string[];
  recommendations: string[];
  acceptable: boolean;
}

export interface SpoofAnalysis {
  isSpoof: boolean;
  confidence: number;
  attackType?: string;
  details: Record<string, unknown>;
}

export interface BiometricAlert {
  id: string;
  type: 'spoof_attempt' | 'multiple_failures' | 'anomaly' | 'device_change' | 'location_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  message: string;
  details: Record<string, unknown>;
  timestamp: string;
  acknowledged: boolean;
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
  const token = localStorage.getItem('biometricai_token');
  
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

// Status & Config
export const getStatus = () => 
  apiRequest<{ status: string; service: string; timestamp: string }>('/status');

export const getConfig = () => 
  apiRequest<Record<string, unknown>>('/config');

// Enrollment
export const enrollBiometric = (data: {
  userId: string;
  modality: string;
  templateData: string;
  qualityThreshold?: number;
  livenessCheck?: boolean;
  antiSpoofing?: boolean;
}) => apiRequest<EnrollmentResult>('/enroll', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const updateBiometricProfile = (userId: string, updates: Partial<BiometricProfile>) =>
  apiRequest<{ success: boolean; profile: BiometricProfile }>(`/enroll/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });

export const deleteBiometricProfile = (userId: string, modality?: string) =>
  apiRequest<{ success: boolean }>(`/enroll/${userId}${modality ? `?modality=${modality}` : ''}`, {
    method: 'DELETE',
  });

// Authentication
export const authenticateBiometric = (data: {
  userId?: string;
  modality: string;
  sampleData: string;
  mode?: 'verify' | 'identify';
  threshold?: 'low' | 'medium' | 'high';
  requireLiveness?: boolean;
}) => apiRequest<AuthenticationResult>('/auth/biometric', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const authenticateMultiFactor = (data: {
  userId: string;
  samples: {
    modality: string;
    sampleData: string;
  }[];
  combinationMode?: 'all' | 'any' | 'weighted';
}) => apiRequest<AuthenticationResult>('/auth/mfa', {
  method: 'POST',
  body: JSON.stringify(data),
});

// Profile Management
export const getBiometricProfile = (userId: string) =>
  apiRequest<{ success: boolean; profile: BiometricProfile }>(`/profile/${userId}`);

export const getBiometricSessions = (userId: string, params?: {
  modality?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value) queryParams.append(key, value.toString());
  });
  
  return apiRequest<{ success: boolean; sessions: BiometricSession[]; total: number }>(
    `/sessions/${userId}?${queryParams}`
  );
};

// Quality Analysis
export const analyzeQuality = (data: {
  sampleId: string;
  modality: string;
  sampleData: string;
}) => apiRequest<{ success: boolean; analysis: QualityAnalysis }>('/analyze/quality', {
  method: 'POST',
  body: JSON.stringify(data),
});

// Spoof Detection
export const detectSpoof = (data: {
  sampleId: string;
  modality: string;
  sampleData: string;
  checkTypes?: string[];
}) => apiRequest<{ success: boolean; analysis: SpoofAnalysis }>('/analyze/spoof', {
  method: 'POST',
  body: JSON.stringify(data),
});

// Liveness Detection
export const checkLiveness = (data: {
  modality: string;
  sampleData: string;
  challengeResponse?: Record<string, unknown>;
}) => apiRequest<{ success: boolean; isLive: boolean; confidence: number }>('/analyze/liveness', {
  method: 'POST',
  body: JSON.stringify(data),
});

// Alerts
export const getAlerts = (params?: {
  severity?: string;
  type?: string;
  acknowledged?: boolean;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined) queryParams.append(key, value.toString());
  });
  
  return apiRequest<{ success: boolean; alerts: BiometricAlert[]; total: number }>(
    `/alerts?${queryParams}`
  );
};

export const acknowledgeAlert = (alertId: string) =>
  apiRequest<{ success: boolean }>(`/alerts/${alertId}/acknowledge`, {
    method: 'POST',
  });

// Reports
export const getReports = (params?: {
  type?: string;
  period?: string;
}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  return apiRequest<{ success: boolean; reports: unknown[] }>(`/reports?${queryParams}`);
};

export const getReportById = (reportId: string) =>
  apiRequest<{ success: boolean; report: unknown }>(`/reports/${reportId}`);

export const generateReport = (data: {
  reportType: 'usage' | 'security' | 'quality' | 'compliance' | 'performance';
  timePeriod: 'day' | 'week' | 'month' | 'quarter';
  includeCharts?: boolean;
  format?: 'json' | 'pdf' | 'csv';
}) => apiRequest<{ success: boolean; report: unknown }>('/reports/generate', {
  method: 'POST',
  body: JSON.stringify(data),
});

// Analytics
export const getAnalytics = (params: {
  metric: 'far' | 'frr' | 'eer' | 'fte' | 'fta';
  modality?: string;
  period?: string;
}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  return apiRequest<{ success: boolean; data: Record<string, unknown> }>(
    `/analytics?${queryParams}`
  );
};

export const detectAnomalies = (data: {
  userId?: string;
  timePeriod: 'hour' | 'day' | 'week' | 'month';
  anomalyTypes?: string[];
}) => apiRequest<{ success: boolean; anomalies: unknown[] }>('/analyze/anomalies', {
  method: 'POST',
  body: JSON.stringify(data),
});

// Consent Management
export const manageConsent = (data: {
  userId: string;
  action: 'grant' | 'revoke' | 'view' | 'export' | 'delete';
  modalities?: string[];
  purpose?: string;
}) => apiRequest<{ success: boolean; consent: unknown }>('/consent', {
  method: 'POST',
  body: JSON.stringify(data),
});

// Device Management
export const registerDevice = (data: {
  userId: string;
  deviceInfo: DeviceInfo;
}) => apiRequest<{ success: boolean; deviceId: string }>('/devices/register', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const getRegisteredDevices = (userId: string) =>
  apiRequest<{ success: boolean; devices: DeviceInfo[] }>(`/devices/${userId}`);

export const revokeDevice = (userId: string, deviceId: string) =>
  apiRequest<{ success: boolean }>(`/devices/${userId}/${deviceId}`, {
    method: 'DELETE',
  });

export default {
  // Status
  getStatus,
  getConfig,
  
  // Enrollment
  enrollBiometric,
  updateBiometricProfile,
  deleteBiometricProfile,
  
  // Authentication
  authenticateBiometric,
  authenticateMultiFactor,
  
  // Profile
  getBiometricProfile,
  getBiometricSessions,
  
  // Analysis
  analyzeQuality,
  detectSpoof,
  checkLiveness,
  detectAnomalies,
  
  // Alerts
  getAlerts,
  acknowledgeAlert,
  
  // Reports
  getReports,
  getReportById,
  generateReport,
  
  // Analytics
  getAnalytics,
  
  // Consent
  manageConsent,
  
  // Devices
  registerDevice,
  getRegisteredDevices,
  revokeDevice,
};
