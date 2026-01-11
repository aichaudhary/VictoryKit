import { SettingsState, NavItem } from './types';

export const PROVIDER_CONFIG = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    models: ['gemini-2.5-flash-preview', 'gemini-2.5-pro-preview', 'gemini-2.0-flash']
  },
  {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4o-mini']
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307']
  }
];

export const DEFAULT_SETTINGS: SettingsState = {
  customPrompt: `You are ZeroTrust AI, an expert in Zero Trust Network Architecture (ZTNA) with deep knowledge of identity verification, micro-segmentation, least-privilege access, and continuous authentication.

CAPABILITIES:
- Evaluate access requests against zero trust policies
- Assess device trust and compliance status
- Verify user identity and authentication factors
- Analyze network segmentation and access controls
- Generate compliance reports and audit trails

AVAILABLE FUNCTIONS:
- evaluate_access_request: Evaluate an access request against policies
- verify_identity: Verify user identity and authentication
- assess_device_trust: Assess device compliance and trust score
- check_policy_compliance: Check policy compliance status
- generate_audit_report: Generate security audit reports

Always apply the principle of "never trust, always verify" in your analysis.`,
  agentName: "ZeroTrust AI",
  temperature: 0.7,
  maxTokens: 4096,
  provider: 'gemini',
  model: "gemini-2.5-flash-preview",
  activeTool: 'access_control',
  workspaceMode: 'CHAT',
  portalUrl: 'https://www.google.com/search?igu=1',
  canvas: {
    content: "// ZeroTrust Workspace\n\nReady for access control analysis.",
    type: 'text',
    title: 'ZeroTrust_Canvas'
  }
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Access Control', icon: '🔐', tool: 'access_control', description: 'Manage access requests' },
  { label: 'Identity Verification', icon: '👤', tool: 'identity_verification', description: 'Verify user identities' },
  { label: 'Device Trust', icon: '📱', tool: 'device_trust', description: 'Assess device compliance' },
  { label: 'Policies', icon: '📋', tool: 'policies', description: 'Manage security policies' },
  { label: 'Audit Trail', icon: '📊', tool: 'audit_trail', description: 'View audit logs' },
  { label: 'Reports', icon: '📄', tool: 'reports', description: 'Generate compliance reports' }
];

export const TRUST_LEVELS = {
  NONE: { level: 0, label: 'No Trust', color: '#ef4444' },
  LOW: { level: 25, label: 'Low Trust', color: '#f97316' },
  MEDIUM: { level: 50, label: 'Medium Trust', color: '#eab308' },
  HIGH: { level: 75, label: 'High Trust', color: '#22c55e' },
  FULL: { level: 100, label: 'Full Trust', color: '#10b981' }
};

export const API_ENDPOINTS = {
  zerotrust: {
    accessRequests: '/api/zerotrust/access-requests',
    policies: '/api/zerotrust/policies',
    devices: '/api/zerotrust/devices',
    identities: '/api/zerotrust/identities',
    audit: '/api/zerotrust/audit',
    reports: '/api/zerotrust/reports'
  },
  ml: {
    evaluate: '/api/ml/evaluate',
    trustScore: '/api/ml/trust-score'
  },
  ai: {
    chat: '/api/ai/chat',
    ws: '/ws/ai'
  }
};
