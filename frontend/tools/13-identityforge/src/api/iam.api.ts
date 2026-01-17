/**
 * IdentityForge IAM API
 * Tool 13 - Enterprise Identity & Access Management
 */

import type {
  User,
  Role,
  Permission,
  Policy,
  Resource,
  AccessRequest,
  AccessDecision,
  EvaluationStep,
  AuditLog,
  ComplianceReport,
  ComplianceCheck,
  IAMDashboard,
  LifecycleEvent,
  RoleHierarchy,
} from '../types/iam.types';

// ============================================================================
// Mock Data - Users
// ============================================================================

export const mockUsers: User[] = [
  {
    id: 'usr-001',
    username: 'sarah.chen',
    email: 'sarah.chen@acmecorp.com',
    firstName: 'Sarah',
    lastName: 'Chen',
    displayName: 'Sarah Chen',
    department: 'Engineering',
    title: 'Senior Software Engineer',
    manager: 'usr-003',
    roles: ['developer', 'code-reviewer'],
    directPermissions: [],
    effectivePermissions: ['code:read', 'code:write', 'code:review', 'repo:read', 'ci:trigger', 'deploy:staging'],
    status: 'active',
    lifecycleStage: 'active',
    mfaEnabled: true,
    mfaType: 'totp',
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    lastPasswordChange: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    createdAt: '2023-06-15T00:00:00Z',
    updatedAt: new Date().toISOString(),
    attributes: { location: 'San Francisco', clearance: 'confidential', team: 'platform' },
    riskScore: 15,
    loginHistory: [
      { timestamp: new Date(Date.now() - 3600000).toISOString(), ipAddress: '192.168.1.100', location: 'San Francisco, CA', device: 'MacBook Pro', success: true },
      { timestamp: new Date(Date.now() - 86400000).toISOString(), ipAddress: '192.168.1.100', location: 'San Francisco, CA', device: 'MacBook Pro', success: true },
    ],
  },
  {
    id: 'usr-002',
    username: 'mike.johnson',
    email: 'mike.johnson@acmecorp.com',
    firstName: 'Mike',
    lastName: 'Johnson',
    displayName: 'Mike Johnson',
    department: 'Finance',
    title: 'Financial Analyst',
    manager: 'usr-005',
    roles: ['analyst'],
    directPermissions: ['reports:financial'],
    effectivePermissions: ['reports:read', 'reports:financial', 'dashboard:view'],
    status: 'active',
    lifecycleStage: 'active',
    mfaEnabled: false,
    mfaType: 'none',
    lastLogin: new Date(Date.now() - 7200000).toISOString(),
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: new Date().toISOString(),
    attributes: { location: 'New York', clearance: 'internal', team: 'fp&a' },
    riskScore: 45,
    loginHistory: [],
  },
  {
    id: 'usr-003',
    username: 'james.wilson',
    email: 'james.wilson@acmecorp.com',
    firstName: 'James',
    lastName: 'Wilson',
    displayName: 'James Wilson',
    department: 'Engineering',
    title: 'Engineering Manager',
    roles: ['manager', 'developer'],
    directPermissions: ['team:manage', 'budget:view'],
    effectivePermissions: ['code:read', 'code:write', 'repo:read', 'ci:trigger', 'deploy:staging', 'team:manage', 'budget:view', 'hiring:approve'],
    status: 'active',
    lifecycleStage: 'active',
    mfaEnabled: true,
    mfaType: 'hardware',
    lastLogin: new Date(Date.now() - 1800000).toISOString(),
    createdAt: '2022-03-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    attributes: { location: 'San Francisco', clearance: 'secret', team: 'platform' },
    riskScore: 25,
    loginHistory: [],
  },
  {
    id: 'usr-004',
    username: 'admin',
    email: 'admin@acmecorp.com',
    firstName: 'System',
    lastName: 'Administrator',
    displayName: 'System Admin',
    department: 'IT',
    title: 'System Administrator',
    roles: ['super-admin'],
    directPermissions: [],
    effectivePermissions: ['*'],
    status: 'active',
    lifecycleStage: 'active',
    mfaEnabled: true,
    mfaType: 'hardware',
    lastLogin: new Date(Date.now() - 900000).toISOString(),
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    attributes: { location: 'Austin', clearance: 'top-secret' },
    riskScore: 5,
    loginHistory: [],
  },
  {
    id: 'usr-005',
    username: 'emily.davis',
    email: 'emily.davis@acmecorp.com',
    firstName: 'Emily',
    lastName: 'Davis',
    displayName: 'Emily Davis',
    department: 'Finance',
    title: 'Finance Director',
    roles: ['director', 'analyst'],
    directPermissions: ['budget:approve', 'payroll:admin'],
    effectivePermissions: ['reports:read', 'reports:financial', 'dashboard:view', 'budget:approve', 'payroll:admin', 'hiring:approve'],
    status: 'active',
    lifecycleStage: 'active',
    mfaEnabled: true,
    mfaType: 'totp',
    lastLogin: new Date(Date.now() - 5400000).toISOString(),
    createdAt: '2021-08-15T00:00:00Z',
    updatedAt: new Date().toISOString(),
    attributes: { location: 'New York', clearance: 'confidential' },
    riskScore: 20,
    loginHistory: [],
  },
  {
    id: 'usr-006',
    username: 'intern.alex',
    email: 'alex.intern@acmecorp.com',
    firstName: 'Alex',
    lastName: 'Thompson',
    displayName: 'Alex Thompson (Intern)',
    department: 'Engineering',
    title: 'Software Engineering Intern',
    manager: 'usr-001',
    roles: ['intern'],
    directPermissions: [],
    effectivePermissions: ['code:read', 'docs:read'],
    status: 'active',
    lifecycleStage: 'onboarding',
    mfaEnabled: false,
    mfaType: 'none',
    lastLogin: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date().toISOString(),
    attributes: { location: 'Remote', clearance: 'public', team: 'platform' },
    riskScore: 60,
    loginHistory: [],
  },
  {
    id: 'usr-007',
    username: 'departed.user',
    email: 'departed@acmecorp.com',
    firstName: 'John',
    lastName: 'Former',
    displayName: 'John Former',
    department: 'Sales',
    title: 'Sales Representative',
    roles: [],
    directPermissions: [],
    effectivePermissions: [],
    status: 'inactive',
    lifecycleStage: 'offboarded',
    mfaEnabled: false,
    mfaType: 'none',
    lastLogin: '2024-12-01T00:00:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-12-15T00:00:00Z',
    attributes: {},
    riskScore: 0,
    loginHistory: [],
  },
  {
    id: 'usr-008',
    username: 'contractor.bob',
    email: 'bob.contractor@external.com',
    firstName: 'Bob',
    lastName: 'Contractor',
    displayName: 'Bob (Contractor)',
    department: 'Engineering',
    title: 'External Contractor',
    manager: 'usr-003',
    roles: ['contractor'],
    directPermissions: ['project-x:access'],
    effectivePermissions: ['code:read', 'project-x:access'],
    status: 'active',
    lifecycleStage: 'active',
    mfaEnabled: true,
    mfaType: 'email',
    lastLogin: new Date(Date.now() - 14400000).toISOString(),
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    attributes: { location: 'Remote', clearance: 'contractor', contractEnd: '2025-03-31' },
    riskScore: 55,
    loginHistory: [],
  },
];

// ============================================================================
// Mock Data - Roles
// ============================================================================

export const mockRoles: Role[] = [
  {
    id: 'role-001',
    name: 'super-admin',
    displayName: 'Super Administrator',
    description: 'Full system access with all permissions. Reserved for system administrators.',
    permissions: ['*'],
    childRoles: ['admin'],
    userCount: 1,
    isSystem: true,
    isPrivileged: true,
    maxUsers: 3,
    requiresMFA: true,
    requiresApproval: true,
    approvers: ['ciso', 'cto'],
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    metadata: { criticality: 'highest' },
  },
  {
    id: 'role-002',
    name: 'admin',
    displayName: 'Administrator',
    description: 'Administrative access to manage users, roles, and system settings.',
    permissions: ['users:*', 'roles:*', 'settings:*', 'audit:read'],
    parentRole: 'super-admin',
    childRoles: ['director'],
    userCount: 3,
    isSystem: true,
    isPrivileged: true,
    requiresMFA: true,
    requiresApproval: true,
    approvers: ['super-admin'],
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    metadata: {},
  },
  {
    id: 'role-003',
    name: 'director',
    displayName: 'Director',
    description: 'Department leadership with team management and budget approval capabilities.',
    permissions: ['team:manage', 'budget:approve', 'hiring:approve', 'reports:all'],
    parentRole: 'admin',
    childRoles: ['manager'],
    userCount: 8,
    isSystem: false,
    isPrivileged: true,
    requiresMFA: true,
    requiresApproval: true,
    approvers: ['admin'],
    createdAt: '2020-06-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    metadata: {},
  },
  {
    id: 'role-004',
    name: 'manager',
    displayName: 'Manager',
    description: 'Team management responsibilities with limited administrative access.',
    permissions: ['team:view', 'team:manage', 'budget:view', 'hiring:request', 'reports:team'],
    parentRole: 'director',
    childRoles: ['developer', 'analyst'],
    userCount: 25,
    isSystem: false,
    isPrivileged: false,
    requiresMFA: true,
    requiresApproval: false,
    createdAt: '2020-06-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    metadata: {},
  },
  {
    id: 'role-005',
    name: 'developer',
    displayName: 'Developer',
    description: 'Software development access including code repositories and CI/CD.',
    permissions: ['code:read', 'code:write', 'repo:read', 'ci:trigger', 'deploy:staging'],
    parentRole: 'manager',
    childRoles: ['intern'],
    userCount: 150,
    isSystem: false,
    isPrivileged: false,
    requiresMFA: false,
    requiresApproval: false,
    createdAt: '2020-06-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    metadata: {},
  },
  {
    id: 'role-006',
    name: 'analyst',
    displayName: 'Analyst',
    description: 'Data analysis and reporting access.',
    permissions: ['reports:read', 'dashboard:view', 'data:read'],
    parentRole: 'manager',
    childRoles: [],
    userCount: 45,
    isSystem: false,
    isPrivileged: false,
    requiresMFA: false,
    requiresApproval: false,
    createdAt: '2020-06-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    metadata: {},
  },
  {
    id: 'role-007',
    name: 'code-reviewer',
    displayName: 'Code Reviewer',
    description: 'Permission to review and approve code changes.',
    permissions: ['code:review', 'code:approve', 'pr:merge'],
    childRoles: [],
    userCount: 30,
    isSystem: false,
    isPrivileged: false,
    requiresMFA: false,
    requiresApproval: false,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    metadata: {},
  },
  {
    id: 'role-008',
    name: 'intern',
    displayName: 'Intern',
    description: 'Limited read-only access for interns and trainees.',
    permissions: ['code:read', 'docs:read'],
    parentRole: 'developer',
    childRoles: [],
    userCount: 12,
    isSystem: false,
    isPrivileged: false,
    requiresMFA: false,
    requiresApproval: false,
    createdAt: '2020-06-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    metadata: { temporary: true },
  },
  {
    id: 'role-009',
    name: 'contractor',
    displayName: 'External Contractor',
    description: 'Limited access for external contractors with time-bound permissions.',
    permissions: ['code:read'],
    childRoles: [],
    userCount: 20,
    isSystem: false,
    isPrivileged: false,
    requiresMFA: true,
    requiresApproval: true,
    approvers: ['manager'],
    createdAt: '2021-06-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    metadata: { external: true },
  },
];

// ============================================================================
// Mock Data - Permissions
// ============================================================================

export const mockPermissions: Permission[] = [
  { id: 'perm-001', name: 'code:read', displayName: 'Read Code', description: 'View source code repositories', resource: 'code', action: 'read', category: 'Development', isSystem: false, isSensitive: false, requiresApproval: false, auditRequired: false },
  { id: 'perm-002', name: 'code:write', displayName: 'Write Code', description: 'Commit code changes', resource: 'code', action: 'update', category: 'Development', isSystem: false, isSensitive: false, requiresApproval: false, auditRequired: true },
  { id: 'perm-003', name: 'code:review', displayName: 'Review Code', description: 'Review and comment on pull requests', resource: 'code', action: 'read', category: 'Development', isSystem: false, isSensitive: false, requiresApproval: false, auditRequired: true },
  { id: 'perm-004', name: 'deploy:staging', displayName: 'Deploy to Staging', description: 'Deploy applications to staging environment', resource: 'deployment', action: 'execute', category: 'Operations', isSystem: false, isSensitive: false, requiresApproval: false, auditRequired: true },
  { id: 'perm-005', name: 'deploy:production', displayName: 'Deploy to Production', description: 'Deploy applications to production environment', resource: 'deployment', action: 'execute', category: 'Operations', isSystem: false, isSensitive: true, requiresApproval: true, auditRequired: true },
  { id: 'perm-006', name: 'users:read', displayName: 'View Users', description: 'View user profiles and information', resource: 'users', action: 'read', category: 'Administration', isSystem: true, isSensitive: false, requiresApproval: false, auditRequired: false },
  { id: 'perm-007', name: 'users:create', displayName: 'Create Users', description: 'Create new user accounts', resource: 'users', action: 'create', category: 'Administration', isSystem: true, isSensitive: true, requiresApproval: true, auditRequired: true },
  { id: 'perm-008', name: 'users:delete', displayName: 'Delete Users', description: 'Delete user accounts', resource: 'users', action: 'delete', category: 'Administration', isSystem: true, isSensitive: true, requiresApproval: true, auditRequired: true },
  { id: 'perm-009', name: 'budget:view', displayName: 'View Budget', description: 'View department budgets', resource: 'budget', action: 'read', category: 'Finance', isSystem: false, isSensitive: true, requiresApproval: false, auditRequired: true },
  { id: 'perm-010', name: 'budget:approve', displayName: 'Approve Budget', description: 'Approve budget requests', resource: 'budget', action: 'execute', category: 'Finance', isSystem: false, isSensitive: true, requiresApproval: true, auditRequired: true },
  { id: 'perm-011', name: 'payroll:admin', displayName: 'Payroll Administration', description: 'Full access to payroll system', resource: 'payroll', action: 'admin', category: 'Finance', isSystem: false, isSensitive: true, requiresApproval: true, auditRequired: true },
  { id: 'perm-012', name: 'reports:financial', displayName: 'Financial Reports', description: 'Access financial reports', resource: 'reports', action: 'read', category: 'Finance', isSystem: false, isSensitive: true, requiresApproval: false, auditRequired: true },
];

// ============================================================================
// Mock Data - Policies
// ============================================================================

export const mockPolicies: Policy[] = [
  {
    id: 'pol-001',
    name: 'Production Deployment Policy',
    description: 'Controls who can deploy to production environment',
    type: 'abac',
    rules: [
      {
        id: 'rule-001',
        name: 'Senior Engineers Only',
        resource: 'deployment:production',
        actions: ['execute'],
        effect: 'allow',
        conditions: [
          { attribute: 'role', operator: 'in', value: ['developer', 'devops'] },
          { attribute: 'title', operator: 'contains', value: 'Senior' },
          { attribute: 'mfaEnabled', operator: 'equals', value: true },
        ],
      },
    ],
    priority: 1,
    enabled: true,
    version: '1.0.0',
    scope: ['engineering'],
    createdBy: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pol-002',
    name: 'Financial Data Access Policy',
    description: 'Restricts access to sensitive financial data',
    type: 'abac',
    version: '2.1.0',
    rules: [
      {
        id: 'rule-002',
        name: 'Finance Department Only',
        resource: 'data:financial',
        actions: ['read', 'update'],
        effect: 'allow',
        conditions: [
          { attribute: 'department', operator: 'equals', value: 'Finance' },
          { attribute: 'clearance', operator: 'in', value: ['confidential', 'secret'] },
        ],
      },
      {
        id: 'rule-003',
        name: 'Deny External',
        resource: 'data:financial',
        actions: ['*'],
        effect: 'deny',
        conditions: [
          { attribute: 'userType', operator: 'equals', value: 'contractor' },
        ],
      },
    ],
    priority: 2,
    enabled: true,
    scope: ['finance', 'accounting'],
    createdBy: 'admin',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pol-003',
    name: 'After Hours Access Policy',
    description: 'Restricts sensitive access outside business hours',
    type: 'abac',
    version: '1.0.0',
    rules: [
      {
        id: 'rule-004',
        name: 'Business Hours Only',
        resource: 'admin:*',
        actions: ['*'],
        effect: 'deny',
        conditions: [
          { attribute: 'currentHour', operator: 'not_in', value: ['9', '10', '11', '12', '13', '14', '15', '16', '17'] },
          { attribute: 'isPrivileged', operator: 'equals', value: false },
        ],
      },
    ],
    priority: 10,
    enabled: true,
    scope: ['*'],
    createdBy: 'admin',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pol-004',
    name: 'MFA Requirement Policy',
    description: 'Requires MFA for privileged actions',
    type: 'abac',
    version: '1.5.0',
    rules: [
      {
        id: 'rule-005',
        name: 'Require MFA for Admin',
        resource: 'admin:*',
        actions: ['*'],
        effect: 'deny',
        conditions: [
          { attribute: 'mfaEnabled', operator: 'equals', value: false },
        ],
      },
    ],
    priority: 1,
    enabled: true,
    scope: ['*'],
    createdBy: 'admin',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

// ============================================================================
// Mock Data - Resources
// ============================================================================

export const mockResources: Resource[] = [
  { id: 'res-001', name: 'Source Code Repository', type: 'repository', path: '/code/*', owner: 'engineering', sensitivity: 'medium', availableActions: ['read', 'create', 'update', 'delete'], description: 'Main code repositories' },
  { id: 'res-002', name: 'Production Environment', type: 'environment', path: '/deploy/production', owner: 'devops', sensitivity: 'critical', availableActions: ['read', 'execute'], description: 'Production deployment target' },
  { id: 'res-003', name: 'Staging Environment', type: 'environment', path: '/deploy/staging', owner: 'devops', sensitivity: 'medium', availableActions: ['read', 'execute'], description: 'Staging deployment target' },
  { id: 'res-004', name: 'Customer Database', type: 'database', path: '/data/customers', owner: 'data-team', sensitivity: 'critical', availableActions: ['read', 'create', 'update', 'delete'], description: 'Customer PII data' },
  { id: 'res-005', name: 'Financial Reports', type: 'reports', path: '/reports/financial/*', owner: 'finance', sensitivity: 'high', availableActions: ['read'], description: 'Financial reporting data' },
  { id: 'res-006', name: 'User Management', type: 'admin', path: '/admin/users', owner: 'it', sensitivity: 'high', availableActions: ['read', 'create', 'update', 'delete', 'admin'], description: 'User account management' },
  { id: 'res-007', name: 'Payroll System', type: 'system', path: '/systems/payroll', owner: 'hr', sensitivity: 'critical', availableActions: ['read', 'update', 'admin'], description: 'Employee payroll management' },
  { id: 'res-008', name: 'API Gateway', type: 'infrastructure', path: '/infra/api-gateway', owner: 'platform', sensitivity: 'high', availableActions: ['read', 'update', 'admin'], description: 'API routing and security' },
];

// ============================================================================
// Mock Data - Audit Logs
// ============================================================================

export const mockAuditLogs: AuditLog[] = [
  { id: 'audit-001', timestamp: new Date(Date.now() - 300000).toISOString(), actor: 'sarah.chen', actorType: 'user', action: 'code:write', resource: '/code/main-repo', resourceType: 'repository', result: 'success', details: { commit: 'abc123', branch: 'feature/new-ui' }, ipAddress: '192.168.1.100', riskScore: 10 },
  { id: 'audit-002', timestamp: new Date(Date.now() - 600000).toISOString(), actor: 'mike.johnson', actorType: 'user', action: 'deploy:production', resource: '/deploy/production', resourceType: 'environment', result: 'denied', details: { reason: 'Missing permission: deploy:production' }, ipAddress: '10.0.0.50', riskScore: 75 },
  { id: 'audit-003', timestamp: new Date(Date.now() - 900000).toISOString(), actor: 'admin', actorType: 'user', action: 'users:create', resource: '/admin/users', resourceType: 'admin', result: 'success', details: { newUser: 'new.employee@acmecorp.com' }, ipAddress: '192.168.1.1', riskScore: 20 },
  { id: 'audit-004', timestamp: new Date(Date.now() - 1200000).toISOString(), actor: 'intern.alex', actorType: 'user', action: 'budget:view', resource: '/reports/financial/budget', resourceType: 'reports', result: 'denied', details: { reason: 'Clearance level insufficient' }, ipAddress: '172.16.0.100', riskScore: 60 },
  { id: 'audit-005', timestamp: new Date(Date.now() - 1800000).toISOString(), actor: 'emily.davis', actorType: 'user', action: 'payroll:admin', resource: '/systems/payroll', resourceType: 'system', result: 'success', details: { action: 'salary_update', count: 15 }, ipAddress: '10.0.1.25', riskScore: 35 },
  { id: 'audit-006', timestamp: new Date(Date.now() - 3600000).toISOString(), actor: 'contractor.bob', actorType: 'user', action: 'code:read', resource: '/code/project-x', resourceType: 'repository', result: 'success', details: { files: 12 }, ipAddress: '203.0.113.50', riskScore: 40 },
  { id: 'audit-007', timestamp: new Date(Date.now() - 7200000).toISOString(), actor: 'system', actorType: 'system', action: 'password:expire', resource: '/admin/users/usr-002', resourceType: 'admin', result: 'success', details: { notification: 'sent' }, ipAddress: '127.0.0.1', riskScore: 5 },
];

// ============================================================================
// Access Evaluation Engine
// ============================================================================

export function evaluateAccess(request: AccessRequest): AccessDecision {
  const steps: EvaluationStep[] = [];
  let stepNum = 0;

  // Step 1: User Lookup
  const user = mockUsers.find(u => u.id === request.userId);
  steps.push({
    step: ++stepNum,
    type: 'user_lookup',
    description: `Looking up user: ${request.userId}`,
    result: user ? 'pass' : 'fail',
    details: user ? `Found: ${user.displayName} (${user.status})` : 'User not found',
  });

  if (!user) {
    return {
      allowed: false,
      reason: 'User not found',
      evaluationPath: steps,
      timestamp: new Date().toISOString(),
    };
  }

  if (user.status !== 'active') {
    steps.push({
      step: ++stepNum,
      type: 'user_lookup',
      description: 'Checking user status',
      result: 'fail',
      details: `User status is ${user.status}`,
    });
    return {
      allowed: false,
      reason: `User account is ${user.status}`,
      evaluationPath: steps,
      timestamp: new Date().toISOString(),
    };
  }

  const userPerms = user.effectivePermissions || [];
  const userAttrs = user.attributes || {};

  // Step 2: Check for superadmin wildcard
  if (userPerms.includes('*')) {
    steps.push({
      step: ++stepNum,
      type: 'permission_check',
      description: 'Checking for superadmin wildcard',
      result: 'pass',
      details: 'User has wildcard (*) permission',
    });
    return {
      allowed: true,
      reason: 'Superadmin access granted',
      evaluationPath: steps,
      timestamp: new Date().toISOString(),
    };
  }

  // Step 3: Role Check
  const userRoles = user.roles.map(r => mockRoles.find(role => role.name === r)).filter(Boolean) as Role[];
  steps.push({
    step: ++stepNum,
    type: 'role_check',
    description: 'Resolving user roles',
    result: userRoles.length > 0 ? 'pass' : 'fail',
    details: `Roles: ${userRoles.map(r => r.displayName).join(', ') || 'None'}`,
  });

  // Step 4: Permission Check
  const requiredPermission = `${request.resource}:${request.action}`;
  const hasPermission = userPerms.some(p => {
    if (p === requiredPermission) return true;
    if (p.endsWith(':*') && requiredPermission.startsWith(p.replace(':*', ':'))) return true;
    if (p.startsWith(request.resource + ':') && p.endsWith('*')) return true;
    return false;
  });

  steps.push({
    step: ++stepNum,
    type: 'permission_check',
    description: `Checking permission: ${requiredPermission}`,
    result: hasPermission ? 'pass' : 'fail',
    details: hasPermission 
      ? `Permission found in effective permissions` 
      : `Permission not found. User has: ${userPerms.slice(0, 5).join(', ')}${userPerms.length > 5 ? '...' : ''}`,
  });

  // Step 5: Policy Evaluation
  for (const policy of mockPolicies.filter(p => p.enabled)) {
    for (const rule of policy.rules) {
      const resourceMatches = request.resource.includes(rule.resource.replace('*', '')) || rule.resource === '*';
      const actionMatches = rule.actions.includes(request.action) || rule.actions.includes('*');
      
      if (resourceMatches && actionMatches) {
        // Check conditions
        let conditionsMet = true;
        for (const condition of rule.conditions) {
          const userValue = userAttrs[condition.attribute] ?? 
                           (user as any)[condition.attribute] ??
                           userRoles.some(r => r.name === condition.value);
          
          // Simplified condition evaluation
          if (condition.operator === 'equals' && userValue !== condition.value) conditionsMet = false;
          if (condition.operator === 'in' && Array.isArray(condition.value) && !condition.value.includes(userValue as string)) conditionsMet = false;
        }

        if (conditionsMet) {
          steps.push({
            step: ++stepNum,
            type: 'policy_eval',
            description: `Policy "${policy.name}" - Rule "${rule.name}"`,
            result: rule.effect === 'allow' ? 'pass' : 'fail',
            details: `Effect: ${rule.effect.toUpperCase()}`,
          });

          if (rule.effect === 'deny') {
            return {
              allowed: false,
              reason: `Denied by policy: ${policy.name}`,
              matchedPolicy: policy.name,
              matchedRule: rule.name,
              evaluationPath: steps,
              timestamp: new Date().toISOString(),
            };
          }
        }
      }
    }
  }

  // Final Decision
  steps.push({
    step: ++stepNum,
    type: 'final_decision',
    description: 'Computing final access decision',
    result: hasPermission ? 'pass' : 'fail',
    details: hasPermission ? 'Access granted based on effective permissions' : 'Access denied - no matching permission',
  });

  return {
    allowed: hasPermission,
    reason: hasPermission ? 'Permission granted' : 'Permission denied - insufficient privileges',
    evaluationPath: steps,
    timestamp: new Date().toISOString(),
  };
}

// ============================================================================
// Role Hierarchy Builder
// ============================================================================

export function buildRoleHierarchy(): RoleHierarchy[] {
  const rootRoles = mockRoles.filter(r => !r.parentRole);
  
  function buildTree(role: Role, level: number, inheritedPerms: string[]): RoleHierarchy {
    const totalPerms = [...new Set([...inheritedPerms, ...role.permissions])];
    const children = mockRoles
      .filter(r => r.parentRole === role.name)
      .map(child => buildTree(child, level + 1, totalPerms));
    
    return {
      role,
      children,
      level,
      inheritedPermissions: inheritedPerms,
      totalPermissions: totalPerms,
    };
  }

  return rootRoles.map(role => buildTree(role, 0, []));
}

// ============================================================================
// Compliance Checker
// ============================================================================

export function runComplianceCheck(framework: 'SOC2' | 'HIPAA' | 'GDPR' | 'PCI-DSS' | 'ISO27001'): ComplianceReport {
  const checks: ComplianceCheck[] = [];
  let passed = 0, failed = 0, partial = 0, warnings = 0;

  // Check 1: MFA Adoption
  const mfaUsers = mockUsers.filter(u => u.status === 'active' && u.mfaEnabled).length;
  const activeUsersCount = mockUsers.filter(u => u.status === 'active').length;
  const mfaRate = (mfaUsers / activeUsersCount) * 100;
  
  const mfaCheck: ComplianceCheck = {
    id: 'check-001',
    checkId: 'check-001',
    name: 'Multi-Factor Authentication',
    category: 'Authentication',
    framework,
    requirement: framework === 'SOC2' ? 'CC6.1' : framework === 'HIPAA' ? '164.312(d)' : framework === 'GDPR' ? 'Art. 32' : 'CC6.1',
    description: 'Multi-Factor Authentication must be enabled for all privileged users',
    status: mfaRate >= 100 ? 'pass' : mfaRate >= 80 ? 'warning' : 'fail',
    severity: 'high',
    finding: mfaRate >= 100 ? 'All users have MFA enabled' : `Only ${Math.round(mfaRate)}% of users have MFA enabled`,
    evidence: [`${mfaUsers}/${activeUsersCount} active users have MFA enabled`],
    affectedResources: mockUsers.filter(u => u.status === 'active' && !u.mfaEnabled).map(u => u.username),
    recommendation: mfaRate < 100 ? 'Enable MFA for all users, prioritizing privileged accounts' : undefined,
    findings: mockUsers
      .filter(u => u.status === 'active' && !u.mfaEnabled)
      .map(u => ({
        id: `finding-mfa-${u.id}`,
        type: 'missing_mfa',
        description: `User ${u.displayName} does not have MFA enabled`,
        affectedUsers: [u.id],
        recommendation: 'Enable MFA for this user immediately',
        priority: u.roles.some(r => mockRoles.find(role => role.name === r)?.isPrivileged) ? 'critical' as const : 'high' as const,
      })),
    remediation: 'Enable MFA for all users, prioritizing privileged accounts',
    lastChecked: new Date().toISOString(),
  };
  checks.push(mfaCheck);
  if (mfaCheck.status === 'pass') passed++; else if (mfaCheck.status === 'warning') { warnings++; partial++; } else failed++;

  // Check 2: Orphaned Accounts
  const orphanedUsers = mockUsers.filter(u => u.status === 'inactive' && u.updatedAt && new Date(u.updatedAt) < new Date(Date.now() - 30 * 24 * 3600000));
  const orphanCheck: ComplianceCheck = {
    id: 'check-002',
    checkId: 'check-002',
    name: 'Orphaned Account Management',
    category: 'Access Control',
    framework,
    requirement: framework === 'SOC2' ? 'CC6.2' : framework === 'HIPAA' ? '164.308(a)(3)' : 'Art. 17',
    description: 'Inactive accounts must be disabled within 30 days',
    status: orphanedUsers.length === 0 ? 'pass' : 'fail',
    severity: 'medium',
    finding: orphanedUsers.length === 0 ? 'No orphaned accounts found' : `${orphanedUsers.length} orphaned accounts detected`,
    evidence: orphanedUsers.length === 0 ? ['All inactive accounts properly managed'] : orphanedUsers.map(u => `${u.username} inactive since ${u.updatedAt}`),
    affectedResources: orphanedUsers.map(u => u.username),
    recommendation: orphanedUsers.length > 0 ? 'Review and disable all orphaned accounts' : undefined,
    findings: orphanedUsers.map(u => ({
      id: `finding-orphan-${u.id}`,
      type: 'orphaned_account',
      description: `Account ${u.username} has been inactive for over 30 days`,
      affectedUsers: [u.id],
      recommendation: 'Disable or delete this account',
      priority: 'medium' as const,
    })),
    remediation: 'Review and disable all orphaned accounts',
    lastChecked: new Date().toISOString(),
  };
  checks.push(orphanCheck);
  if (orphanCheck.status === 'pass') passed++; else failed++;

  // Check 3: Privileged Access Review
  const privilegedWithoutApproval = mockRoles.filter(r => r.isPrivileged && !r.requiresApproval);
  const privCheck: ComplianceCheck = {
    id: 'check-003',
    checkId: 'check-003',
    name: 'Privileged Access Approval Workflow',
    category: 'Privileged Access',
    framework,
    requirement: framework === 'SOC2' ? 'CC6.3' : framework === 'HIPAA' ? '164.312(a)(1)' : 'Art. 25',
    description: 'Privileged role assignments must require approval',
    status: privilegedWithoutApproval.length === 0 ? 'pass' : 'fail',
    severity: 'high',
    finding: privilegedWithoutApproval.length === 0 ? 'All privileged roles require approval' : `${privilegedWithoutApproval.length} privileged roles lack approval workflow`,
    evidence: privilegedWithoutApproval.length === 0 ? ['Approval workflow configured for all privileged roles'] : privilegedWithoutApproval.map(r => `${r.displayName} has no approval requirement`),
    affectedResources: privilegedWithoutApproval.map(r => r.name),
    recommendation: privilegedWithoutApproval.length > 0 ? 'Enable approval requirements for all privileged roles' : undefined,
    findings: privilegedWithoutApproval.map(r => ({
      id: `finding-priv-${r.id}`,
      type: 'missing_approval_workflow',
      description: `Privileged role "${r.displayName}" does not require approval`,
      affectedRoles: [r.id],
      recommendation: 'Configure approval workflow for this role',
      priority: 'high' as const,
    })),
    remediation: 'Enable approval requirements for all privileged roles',
    lastChecked: new Date().toISOString(),
  };
  checks.push(privCheck);
  if (privCheck.status === 'pass') passed++; else failed++;

  // Check 4: Password Policy
  const expiredPasswords = mockUsers.filter(u => 
    u.status === 'active' && 
    u.passwordLastChanged && 
    new Date(u.passwordLastChanged) < new Date(Date.now() - 90 * 24 * 3600000)
  );
  const pwdCheck: ComplianceCheck = {
    id: 'check-004',
    checkId: 'check-004',
    name: 'Password Rotation Policy',
    category: 'Password Management',
    framework,
    requirement: framework === 'SOC2' ? 'CC6.1' : framework === 'HIPAA' ? '164.308(a)(5)' : 'Art. 32',
    description: 'Passwords must be changed every 90 days',
    status: expiredPasswords.length === 0 ? 'pass' : 'warning',
    severity: 'medium',
    finding: expiredPasswords.length === 0 ? 'All passwords within policy' : `${expiredPasswords.length} users have passwords older than 90 days`,
    evidence: expiredPasswords.length === 0 ? ['Password rotation policy enforced'] : expiredPasswords.map(u => `${u.username} password last changed: ${u.passwordLastChanged}`),
    affectedResources: expiredPasswords.map(u => u.username),
    recommendation: expiredPasswords.length > 0 ? 'Force password reset for affected users' : undefined,
    findings: expiredPasswords.map(u => ({
      id: `finding-pwd-${u.id}`,
      type: 'expired_password',
      description: `User ${u.displayName} has not changed password in over 90 days`,
      affectedUsers: [u.id],
      recommendation: 'Force password reset for this user',
      priority: 'medium' as const,
    })),
    remediation: 'Enforce password rotation policy',
    lastChecked: new Date().toISOString(),
  };
  checks.push(pwdCheck);
  if (pwdCheck.status === 'pass') passed++; else if (pwdCheck.status === 'warning') { warnings++; partial++; } else failed++;

  // Check 5: Audit Logging
  const auditCheck: ComplianceCheck = {
    id: 'check-005',
    checkId: 'check-005',
    name: 'Audit Logging',
    category: 'Monitoring',
    framework,
    requirement: framework === 'SOC2' ? 'CC7.2' : framework === 'HIPAA' ? '164.312(b)' : 'Art. 30',
    description: 'All access attempts must be logged',
    status: 'pass',
    severity: 'high',
    finding: 'Audit logging is enabled and capturing all access events',
    evidence: [`${mockAuditLogs.length} audit events captured in recent period`],
    affectedResources: [],
    findings: [],
    lastChecked: new Date().toISOString(),
  };
  checks.push(auditCheck);
  passed++;

  // Check 6: Least Privilege
  const superAdmins = mockUsers.filter(u => u.roles.includes('super-admin') || u.roles.includes('admin'));
  const leastPrivCheck: ComplianceCheck = {
    id: 'check-006',
    checkId: 'check-006',
    name: 'Least Privilege Principle',
    category: 'Access Control',
    framework,
    requirement: framework === 'SOC2' ? 'CC6.3' : framework === 'HIPAA' ? '164.312(a)(1)' : 'Art. 5',
    description: 'Users should only have the minimum required permissions',
    status: superAdmins.length <= 2 ? 'pass' : 'warning',
    severity: 'medium',
    finding: superAdmins.length <= 2 ? 'Privileged access is appropriately limited' : `${superAdmins.length} users have admin access`,
    evidence: [`${superAdmins.length} users with administrative privileges`],
    affectedResources: superAdmins.map(u => u.username),
    recommendation: superAdmins.length > 2 ? 'Review admin access and reduce where possible' : undefined,
    findings: [],
    lastChecked: new Date().toISOString(),
  };
  checks.push(leastPrivCheck);
  if (leastPrivCheck.status === 'pass') passed++; else { warnings++; partial++; }

  const totalChecks = checks.length;
  const overallScore = Math.round(((passed + (warnings * 0.5)) / totalChecks) * 100);

  return {
    framework,
    generatedAt: new Date().toISOString(),
    overallScore,
    totalChecks,
    passed,
    passedChecks: passed,
    failed,
    failedChecks: failed,
    partial,
    warnings,
    checks,
    summary: `${framework} Compliance Score: ${overallScore}%. ${failed} critical findings require immediate attention.`,
  };
}

// ============================================================================
// Dashboard Generator
// ============================================================================

export function generateDashboard(): IAMDashboard {
  const activeUsers = mockUsers.filter(u => u.status === 'active');
  const privilegedUsers = mockUsers.filter(u => 
    u.roles.some(r => mockRoles.find(role => role.name === r)?.isPrivileged)
  );
  const dormantUsers = mockUsers.filter(u => 
    u.status === 'active' && 
    u.lastLogin && 
    new Date(u.lastLogin) < new Date(Date.now() - 30 * 24 * 3600000)
  );

  const roleDistribution = mockRoles.map(r => ({
    role: r.displayName,
    count: r.userCount,
    percentage: Math.round((r.userCount / mockUsers.length) * 100),
  })).sort((a, b) => b.count - a.count);

  const departments = [...new Set(mockUsers.map(u => u.department))];
  const departmentBreakdown = departments.map(dept => {
    const deptUsers = mockUsers.filter(u => u.department === dept);
    return {
      department: dept,
      users: deptUsers.length,
      avgRoles: Math.round(deptUsers.reduce((sum, u) => sum + u.roles.length, 0) / deptUsers.length * 10) / 10,
    };
  });

  // Generate trend data for last 7 days
  const accessTrends = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 24 * 3600000);
    return {
      date: date.toISOString().split('T')[0],
      granted: Math.floor(Math.random() * 500) + 800,
      denied: Math.floor(Math.random() * 50) + 20,
    };
  });

  const soc2Report = runComplianceCheck('SOC2');

  return {
    // Top-level dashboard properties
    totalUsers: mockUsers.length,
    activeUsers: activeUsers.length,
    totalRoles: mockRoles.length,
    totalPolicies: mockPolicies.length,
    securityScore: Math.round((activeUsers.filter(u => u.mfaEnabled).length / activeUsers.length) * 100),
    pendingReviews: [
      { type: 'Access Request', description: 'Mike Johnson requests production deploy access', priority: 'high' as const },
      { type: 'Role Review', description: 'Quarterly admin role review due', priority: 'medium' as const },
      { type: 'Password Expiry', description: '2 users have passwords expiring soon', priority: 'low' as const },
    ],
    // Nested overview
    overview: {
      totalUsers: mockUsers.length,
      activeUsers: activeUsers.length,
      inactiveUsers: mockUsers.filter(u => u.status === 'inactive').length,
      suspendedUsers: mockUsers.filter(u => u.status === 'suspended').length,
      totalRoles: mockRoles.length,
      totalPolicies: mockPolicies.length,
      activePolicies: mockPolicies.filter(p => p.enabled).length,
      totalPermissions: mockPermissions.length,
    },
    security: {
      mfaAdoption: Math.round((activeUsers.filter(u => u.mfaEnabled).length / activeUsers.length) * 100),
      privilegedUsers: privilegedUsers.length,
      orphanedAccounts: mockUsers.filter(u => u.status === 'inactive').length,
      dormantAccounts: dormantUsers.length,
      expiredPasswords: 2,
      highRiskUsers: mockUsers.filter(u => u.riskScore > 50).length,
    },
    compliance: {
      overallScore: soc2Report.overallScore,
      frameworkScores: [
        { framework: 'SOC2' as const, score: soc2Report.overallScore },
        { framework: 'HIPAA' as const, score: Math.round(soc2Report.overallScore * 0.95) },
        { framework: 'GDPR' as const, score: Math.round(soc2Report.overallScore * 0.9) },
      ],
      criticalFindings: soc2Report.checks.filter(c => c.status === 'fail' && c.severity === 'high').length,
      pendingRemediation: soc2Report.failed,
    },
    recentActivity: mockAuditLogs.slice(0, 10),
    roleDistribution,
    departmentBreakdown,
    accessTrends,
  };
}

// ============================================================================
// Lifecycle Event Simulator
// ============================================================================

export interface SimulatedLifecycleEvent {
  eventType: string;
  userId: string;
  timestamp: string;
  changes: { before: Record<string, any>; after: Record<string, any> };
  automatedActions: string[];
  approvalRequired: boolean;
  approver?: string;
  status: 'pending' | 'completed' | 'failed';
  performedBy?: string;
}

export function simulateLifecycleEvent(
  userId: string, 
  eventType: string
): SimulatedLifecycleEvent {
  const user = mockUsers.find(u => u.id === userId);
  
  const automatedActionsMap: Record<string, string[]> = {
    'onboard': ['Account created', 'Welcome email sent', 'Initial permissions granted'],
    'promote': ['Role updated', 'New permissions granted', 'Manager notified'],
    'demote': ['Role downgraded', 'Permissions revoked', 'HR notified'],
    'transfer': ['Department updated', 'New manager assigned', 'Access adjusted'],
    'suspend': ['Account suspended', 'Active sessions terminated', 'Manager notified'],
    'reactivate': ['Account reactivated', 'Permissions restored', 'Welcome back email sent'],
    'offboard': ['Account disabled', 'All access revoked', 'Assets reclaim initiated', 'Exit interview scheduled'],
    'role_change': ['Role updated', 'Permissions adjusted'],
    'mfa_setup': ['MFA enrolled', 'Recovery codes generated'],
    'status_change': ['Status updated', 'Notifications sent'],
    'group_change': ['Group membership updated', 'Access recalculated'],
  };

  const changesMap: Record<string, { before: Record<string, any>; after: Record<string, any> }> = {
    'promote': { 
      before: { role: user?.roles[0] || 'developer' }, 
      after: { role: 'manager' } 
    },
    'demote': { 
      before: { role: user?.roles[0] || 'manager' }, 
      after: { role: 'developer' } 
    },
    'transfer': { 
      before: { department: user?.department || 'Engineering' }, 
      after: { department: 'Product' } 
    },
    'suspend': { 
      before: { status: 'active' }, 
      after: { status: 'suspended' } 
    },
    'reactivate': { 
      before: { status: 'suspended' }, 
      after: { status: 'active' } 
    },
    'offboard': { 
      before: { status: user?.status || 'active', roles: user?.roles || [] }, 
      after: { status: 'deleted', roles: [] } 
    },
  };

  return {
    eventType,
    userId,
    timestamp: new Date().toISOString(),
    changes: changesMap[eventType] || { before: {}, after: {} },
    automatedActions: automatedActionsMap[eventType] || ['Action completed'],
    approvalRequired: ['promote', 'demote', 'offboard'].includes(eventType),
    approver: ['promote', 'demote', 'offboard'].includes(eventType) ? 'manager@company.com' : undefined,
    status: 'completed',
    performedBy: 'hr-system',
  };
}
