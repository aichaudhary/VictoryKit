/**
 * IdentityForge IAM Types
 * Tool 13 - Enterprise Identity & Access Management
 */

// ============================================================================
// Core IAM Types
// ============================================================================

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending' | 'deleted';
export type MFAType = 'none' | 'totp' | 'sms' | 'email' | 'hardware' | 'authenticator';
export type ActionType = 'create' | 'read' | 'update' | 'delete' | 'execute' | 'admin' | 'write' | 'deploy' | 'approve' | '*';
export type PolicyEffect = 'allow' | 'deny';
export type ComplianceFramework = 'SOC2' | 'HIPAA' | 'GDPR' | 'PCI-DSS' | 'ISO27001';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type LifecycleStage = 'onboarding' | 'active' | 'role-change' | 'leave' | 'offboarding' | 'offboarded';

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  department: string;
  title: string;
  manager?: string;
  roles: string[];
  groups?: string[];
  directPermissions?: string[];
  effectivePermissions?: string[]; // Computed from roles + direct
  status: UserStatus;
  lifecycleStage?: LifecycleStage;
  mfaEnabled: boolean;
  mfaType?: MFAType;
  lastLogin?: string | null;
  lastPasswordChange?: string;
  passwordExpiresAt?: string;
  passwordLastChanged?: string;
  createdAt: string;
  updatedAt?: string;
  attributes?: Record<string, string | number | boolean>;
  riskScore: number;
  loginHistory?: LoginEvent[];
}

export interface LoginEvent {
  timestamp: string;
  ipAddress: string;
  location: string;
  device: string;
  success: boolean;
  failureReason?: string;
}

// ============================================================================
// Role Types
// ============================================================================

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  parentRole?: string; // For inheritance
  childRoles?: string[];
  userCount: number;
  isSystem: boolean;
  isPrivileged: boolean;
  maxUsers?: number;
  requiresMFA: boolean;
  requiresApproval: boolean;
  approvers?: string[];
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

export interface RoleHierarchy {
  role: Role;
  children: RoleHierarchy[];
  level: number;
  inheritedPermissions: string[];
  totalPermissions: string[];
}

// ============================================================================
// Permission Types
// ============================================================================

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  resource: string;
  action: ActionType;
  category: string;
  isSystem: boolean;
  isSensitive: boolean;
  requiresApproval: boolean;
  auditRequired: boolean;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  path: string;
  owner: string;
  sensitivity: RiskLevel;
  availableActions: ActionType[];
  description: string;
}

// ============================================================================
// Policy Types
// ============================================================================

export interface Policy {
  id: string;
  name: string;
  description: string;
  type: 'rbac' | 'abac' | 'hybrid';
  rules: PolicyRule[];
  priority: number;
  enabled: boolean;
  scope?: string[];
  version?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PolicyRule {
  id: string;
  name: string;
  description?: string;
  resource: string;
  resources?: string[];
  actions: ActionType[] | string[];
  effect: PolicyEffect;
  conditions: PolicyCondition[];
}

export interface PolicyCondition {
  attribute: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'matches';
  value: string | number | boolean | (string | number)[];
}

// ============================================================================
// Access Evaluation Types
// ============================================================================

export interface AccessRequest {
  userId: string;
  resource: string;
  action: ActionType;
  context?: Record<string, any>;
}

export interface AccessDecision {
  allowed: boolean;
  reason: string;
  matchedPolicy?: string;
  matchedRule?: string;
  evaluationPath: EvaluationStep[];
  timestamp: string;
}

export interface EvaluationStep {
  step: number;
  type: 'user_lookup' | 'role_check' | 'permission_check' | 'policy_eval' | 'condition_check' | 'final_decision';
  description: string;
  result: 'pass' | 'fail' | 'skip';
  details?: string;
}

// ============================================================================
// Audit Types
// ============================================================================

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorType: 'user' | 'service' | 'system';
  action: string;
  resource: string;
  resourceType: string;
  result: 'success' | 'failure' | 'denied';
  details: Record<string, any>;
  ipAddress: string;
  userAgent?: string;
  sessionId?: string;
  riskScore: number;
}

// ============================================================================
// Compliance Types
// ============================================================================

export interface ComplianceCheck {
  id: string;
  checkId?: string;
  name?: string;
  category?: string;
  framework: ComplianceFramework;
  requirement: string;
  description: string;
  status: 'pass' | 'fail' | 'warning' | 'not_applicable' | 'compliant' | 'non_compliant' | 'partial';
  severity: RiskLevel;
  findings: ComplianceFinding[];
  finding?: string;
  evidence?: string[];
  affectedResources?: string[];
  remediation?: string;
  recommendation?: string;
  lastChecked: string;
}

export interface ComplianceFinding {
  id: string;
  type: string;
  description: string;
  affectedUsers?: string[];
  affectedRoles?: string[];
  recommendation: string;
  priority: RiskLevel;
}

export interface ComplianceReport {
  framework: ComplianceFramework;
  generatedAt: string;
  overallScore: number;
  totalChecks: number;
  passed: number;
  passedChecks?: number;
  failed: number;
  failedChecks?: number;
  partial: number;
  warnings?: number;
  checks: ComplianceCheck[];
  summary: string;
}

// ============================================================================
// User Lifecycle Types
// ============================================================================

export type LifecycleEventType = 'hire' | 'promotion' | 'transfer' | 'role_change' | 'leave_start' | 'leave_end' | 'termination' | 'onboard' | 'mfa_setup' | 'status_change' | 'group_change';

export interface LifecycleEvent {
  id: string;
  userId: string;
  eventType: LifecycleEventType;
  fromState: Partial<User>;
  toState: Partial<User>;
  effectiveDate: string;
  approvedBy?: string;
  approver?: string;
  notes?: string;
  timestamp: string;
  performedBy?: string;
  changes?: { before: Record<string, any>; after: Record<string, any> };
  automatedActions?: string[];
  approvalRequired?: boolean;
  status?: 'pending' | 'completed' | 'failed';
}

export interface LifecycleWorkflow {
  id: string;
  name: string;
  eventType: LifecycleEventType;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  action: string;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completedAt?: string;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface IAMDashboard {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalPolicies: number;
  securityScore: number;
  pendingReviews: { type: string; description: string; priority: 'low' | 'medium' | 'high' }[];
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    suspendedUsers: number;
    totalRoles: number;
    totalPolicies: number;
    activePolicies: number;
    totalPermissions: number;
  };
  security: {
    mfaAdoption: number;
    privilegedUsers: number;
    orphanedAccounts: number;
    dormantAccounts: number;
    expiredPasswords: number;
    highRiskUsers: number;
  };
  compliance: {
    overallScore: number;
    frameworkScores: { framework: ComplianceFramework; score: number }[];
    criticalFindings: number;
    pendingRemediation: number;
  };
  recentActivity: AuditLog[];
  roleDistribution: { role: string; count: number; percentage: number }[];
  departmentBreakdown: { department: string; users: number; avgRoles: number }[];
  accessTrends: { date: string; granted: number; denied: number }[];
}
