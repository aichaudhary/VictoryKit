// PasswordVault API Service
// TypeScript client for PasswordVault backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4033/api';

// Types
export interface Vault {
  id: string;
  name: string;
  description?: string;
  type: 'personal' | 'team' | 'shared' | 'enterprise';
  owner: string;
  organization: string;
  encryptionAlgorithm: string;
  settings: VaultSettings;
  stats: VaultStats;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VaultSettings {
  requireMFA: boolean;
  autoLock: {
    enabled: boolean;
    timeout: number;
  };
  passwordPolicy: PasswordPolicy;
  backup: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    retention: number;
  };
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  preventReuse: number;
}

export interface VaultStats {
  totalSecrets: number;
  totalUsers: number;
  lastAccessed?: string;
  createdSecrets: number;
  accessedSecrets: number;
  sharedSecrets: number;
}

export interface Secret {
  id: string;
  name: string;
  description?: string;
  vault: string;
  type: SecretType;
  category: string;
  url?: string;
  username?: string;
  email?: string;
  notes?: string;
  tags: string[];
  expiryDate?: string;
  autoRotate: AutoRotateConfig;
  accessControl: SecretAccessControl;
  versions: SecretVersion[];
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
}

export type SecretType = 
  | 'password' 
  | 'api-key' 
  | 'certificate' 
  | 'ssh-key' 
  | 'database' 
  | 'token' 
  | 'credit-card' 
  | 'identity' 
  | 'secure-note' 
  | 'wifi';

export interface AutoRotateConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastRotated?: string;
  nextRotation?: string;
}

export interface SecretAccessControl {
  inheritFromVault: boolean;
  allowedUsers: {
    user: string;
    permissions: string[];
    grantedBy: string;
    grantedAt: string;
  }[];
}

export interface SecretVersion {
  version: number;
  modifiedBy: string;
  modifiedAt: string;
  changeReason?: string;
}

export interface GeneratedPassword {
  password: string;
  strength: PasswordStrength;
  entropy: number;
}

export interface PasswordStrength {
  score: number;
  label: string;
  length: number;
}

export interface SecurityAudit {
  id: string;
  type: string;
  startedAt: string;
  status: string;
  summary: AuditSummary;
  score: number;
  grade: string;
  recommendations: string[];
  compliance?: ComplianceResult;
}

export interface AuditSummary {
  totalVaults: number;
  totalSecrets: number;
  weakPasswords: number;
  expiredSecrets: number;
  duplicatePasswords: number;
  reusedPasswords: number;
  compromisedPasswords: number;
}

export interface ComplianceResult {
  framework: string;
  score: number;
  controls: {
    passed: number;
    failed: number;
    notApplicable: number;
  };
}

export interface ActivityLog {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  userId: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('passwordvault_token');
  
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

// Health & Status
export const getStatus = () => apiRequest<{ status: string; service: string; timestamp: string }>('/status');
export const getHealth = () => apiRequest<{ status: string }>('/health');
export const getConfig = () => apiRequest<Record<string, unknown>>('/config');

// Password Generator
export const generatePassword = (options: {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeAmbiguous?: boolean;
  excludeSimilar?: boolean;
  customSymbols?: string;
  pronounceable?: boolean;
  passphrase?: boolean;
  wordCount?: number;
}) => apiRequest<GeneratedPassword>('/generate-password', {
  method: 'POST',
  body: JSON.stringify(options),
});

export const analyzePassword = (passwordHash: string, options?: {
  checkPatterns?: boolean;
  checkDictionary?: boolean;
}) => apiRequest<{ analysis: Record<string, unknown> }>('/analyze-password', {
  method: 'POST',
  body: JSON.stringify({ passwordHash, ...options }),
});

// Vaults
export const getVaults = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.type) queryParams.append('type', params.type);
  
  return apiRequest<PaginatedResponse<Vault>>(`/vaults?${queryParams}`);
};

export const getVault = (vaultId: string) => 
  apiRequest<{ success: boolean; vault: Vault }>(`/vaults/${vaultId}`);

export const createVault = (data: {
  name: string;
  description?: string;
  type?: 'personal' | 'team' | 'shared' | 'enterprise';
  settings?: Partial<VaultSettings>;
}) => apiRequest<{ success: boolean; vault: Vault; message: string }>('/vaults', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const updateVault = (vaultId: string, data: Partial<Vault>) =>
  apiRequest<{ success: boolean; vault: Vault }>(`/vaults/${vaultId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteVault = (vaultId: string) =>
  apiRequest<{ success: boolean; message: string }>(`/vaults/${vaultId}`, {
    method: 'DELETE',
  });

// Vault Sharing
export const shareVault = (vaultId: string, data: {
  userId: string;
  permissions: string[];
  message?: string;
}) => apiRequest<{ success: boolean }>(`/vaults/${vaultId}/share`, {
  method: 'POST',
  body: JSON.stringify(data),
});

export const getVaultShares = (vaultId: string) =>
  apiRequest<{ success: boolean; shares: unknown[] }>(`/vaults/${vaultId}/shares`);

export const removeVaultShare = (vaultId: string, shareId: string) =>
  apiRequest<{ success: boolean }>(`/vaults/${vaultId}/shares/${shareId}`, {
    method: 'DELETE',
  });

// Secrets
export const getSecrets = (vaultId: string, params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.tags) queryParams.append('tags', params.tags.join(','));
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  return apiRequest<PaginatedResponse<Secret>>(`/secrets/${vaultId}?${queryParams}`);
};

export const getSecret = (secretId: string) =>
  apiRequest<{ success: boolean; secret: Secret }>(`/secrets/${secretId}`);

export const createSecret = (data: {
  vaultId: string;
  name: string;
  type: SecretType;
  data: string;
  tags?: string[];
  expiresAt?: string;
  notes?: string;
}) => apiRequest<{ success: boolean; secret: Secret }>('/secrets', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const updateSecret = (secretId: string, data: Partial<Secret>) =>
  apiRequest<{ success: boolean; secret: Secret }>(`/secrets/${secretId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteSecret = (secretId: string) =>
  apiRequest<{ success: boolean }>(`/secrets/${secretId}`, {
    method: 'DELETE',
  });

export const rotateSecret = (secretId: string, options?: {
  newPassword?: string;
  updateIntegrations?: boolean;
  notifyUsers?: boolean;
  keepHistory?: boolean;
}) => apiRequest<{ success: boolean }>(`/secrets/${secretId}/rotate`, {
  method: 'POST',
  body: JSON.stringify(options),
});

export const getSecretVersions = (secretId: string) =>
  apiRequest<{ success: boolean; versions: SecretVersion[] }>(`/secrets/${secretId}/versions`);

// Security Audit
export const runSecurityAudit = (options: {
  vaultId?: string;
  auditType?: 'full' | 'password-health' | 'access-review' | 'expiry-check' | 'breach-detection' | 'compliance';
  includeRecommendations?: boolean;
  complianceFramework?: 'NIST' | 'SOC2' | 'ISO27001' | 'PCI-DSS' | 'HIPAA';
}) => apiRequest<{ success: boolean; audit: SecurityAudit }>('/security-audit', {
  method: 'POST',
  body: JSON.stringify(options),
});

// Audit Logs
export const getAuditLogs = (params?: {
  resourceType?: string;
  resourceId?: string;
  actionType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value) queryParams.append(key, value.toString());
  });
  
  return apiRequest<{ success: boolean; logs: ActivityLog[]; total: number }>(`/audit?${queryParams}`);
};

// Authentication
export const login = (credentials: { email: string; password: string }) =>
  apiRequest<{ success: boolean; token: string; user: unknown }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

export const register = (data: { email: string; password: string; name: string }) =>
  apiRequest<{ success: boolean; message: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const logout = () => {
  localStorage.removeItem('passwordvault_token');
  return Promise.resolve({ success: true });
};

export const getProfile = () =>
  apiRequest<{ success: boolean; user: unknown }>('/auth/profile');

export const updateProfile = (data: Partial<{ name: string; email: string }>) =>
  apiRequest<{ success: boolean; user: unknown }>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  apiRequest<{ success: boolean; message: string }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Organizations
export const getOrganization = () =>
  apiRequest<{ success: boolean; organization: unknown }>('/organizations/current');

export const getOrganizationMembers = () =>
  apiRequest<{ success: boolean; members: unknown[] }>('/organizations/members');

export const inviteMember = (data: { email: string; role: string }) =>
  apiRequest<{ success: boolean }>('/organizations/invite', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export default {
  // Status
  getStatus,
  getHealth,
  getConfig,
  
  // Password
  generatePassword,
  analyzePassword,
  
  // Vaults
  getVaults,
  getVault,
  createVault,
  updateVault,
  deleteVault,
  shareVault,
  getVaultShares,
  removeVaultShare,
  
  // Secrets
  getSecrets,
  getSecret,
  createSecret,
  updateSecret,
  deleteSecret,
  rotateSecret,
  getSecretVersions,
  
  // Security
  runSecurityAudit,
  getAuditLogs,
  
  // Auth
  login,
  register,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  
  // Organization
  getOrganization,
  getOrganizationMembers,
  inviteMember,
};
