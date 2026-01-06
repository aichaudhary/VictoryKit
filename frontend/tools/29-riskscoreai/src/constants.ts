import type { NavItem, RiskFactor, ScoreGrade, Industry, Tab, ComplianceFramework, Severity, Grade } from './types';

// ============ Theme Colors ============
export const THEME = {
  primary: '#F59E0B', // Amber/Orange
  primaryDark: '#D97706',
  primaryLight: '#FBBF24',
  background: '#0F0F12',
  surface: '#1A1A1F',
  surfaceHover: '#252529',
  border: '#2A2A2F',
  text: '#FFFFFF',
  textSecondary: '#A0A0A5',
  textMuted: '#6B6B70',
};

// ============ Grade Colors ============
export const GRADE_COLORS: Record<Grade, string> = {
  A: '#10B981', // Green
  B: '#22C55E', // Light Green
  C: '#F59E0B', // Amber
  D: '#EF4444', // Red
  F: '#DC2626', // Dark Red
};

export const SCORE_GRADES: ScoreGrade[] = [
  { grade: 'A', min: 90, max: 100, label: 'Excellent', color: GRADE_COLORS.A },
  { grade: 'B', min: 80, max: 89, label: 'Good', color: GRADE_COLORS.B },
  { grade: 'C', min: 70, max: 79, label: 'Fair', color: GRADE_COLORS.C },
  { grade: 'D', min: 60, max: 69, label: 'Poor', color: GRADE_COLORS.D },
  { grade: 'F', min: 0, max: 59, label: 'Critical', color: GRADE_COLORS.F },
];

// ============ Severity Colors ============
export const SEVERITY_COLORS: Record<Severity, string> = {
  critical: '#DC2626',
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#22C55E',
  info: '#3B82F6',
};

// ============ Navigation Items ============
export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', name: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'organizations', name: 'Organizations', icon: 'Building2' },
  { id: 'vendors', name: 'Vendor Risk', icon: 'Users' },
  { id: 'risks', name: 'Risk Factors', icon: 'AlertTriangle' },
  { id: 'remediations', name: 'Remediations', icon: 'Wrench' },
  { id: 'reports', name: 'Reports', icon: 'FileText' },
  { id: 'benchmarks', name: 'Benchmarks', icon: 'BarChart3' },
  { id: 'assistant', name: 'AI Assistant', icon: 'Bot' },
  { id: 'settings', name: 'Settings', icon: 'Settings' },
];

// ============ Risk Factors ============
export const RISK_FACTORS: RiskFactor[] = [
  {
    id: 'network_security',
    name: 'Network Security',
    description: 'Open ports, exposed services, TLS configuration, firewall posture',
    weight: 15,
    category: 'technical',
    icon: 'Network',
  },
  {
    id: 'patching_cadence',
    name: 'Patching Cadence',
    description: 'Speed of applying security patches for known vulnerabilities',
    weight: 15,
    category: 'technical',
    icon: 'RefreshCw',
  },
  {
    id: 'endpoint_security',
    name: 'Endpoint Security',
    description: 'Malware infections, botnet participation, compromised hosts',
    weight: 12,
    category: 'technical',
    icon: 'Shield',
  },
  {
    id: 'dns_health',
    name: 'DNS Health',
    description: 'DNS configuration, DNSSEC, SPF, DKIM, DMARC records',
    weight: 10,
    category: 'technical',
    icon: 'Globe',
  },
  {
    id: 'application_security',
    name: 'Application Security',
    description: 'Web application vulnerabilities, OWASP Top 10 issues',
    weight: 12,
    category: 'technical',
    icon: 'Code',
  },
  {
    id: 'ip_reputation',
    name: 'IP Reputation',
    description: 'Blacklist status, spam sources, suspicious traffic patterns',
    weight: 8,
    category: 'operational',
    icon: 'Fingerprint',
  },
  {
    id: 'hacker_chatter',
    name: 'Hacker Chatter',
    description: 'Dark web mentions, underground forum discussions, threat actor interest',
    weight: 8,
    category: 'operational',
    icon: 'MessageSquare',
  },
  {
    id: 'leaked_credentials',
    name: 'Leaked Credentials',
    description: 'Exposed credentials in data breaches, credential stuffing risk',
    weight: 10,
    category: 'operational',
    icon: 'Key',
  },
  {
    id: 'social_engineering',
    name: 'Social Engineering',
    description: 'Phishing susceptibility, social media exposure, impersonation risk',
    weight: 5,
    category: 'operational',
    icon: 'UserX',
  },
  {
    id: 'information_disclosure',
    name: 'Information Disclosure',
    description: 'Sensitive data exposure, metadata leaks, public document analysis',
    weight: 5,
    category: 'compliance',
    icon: 'FileWarning',
  },
];

// ============ Industries ============
export const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Financial Services' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'government', label: 'Government' },
  { value: 'education', label: 'Education' },
  { value: 'energy', label: 'Energy & Utilities' },
  { value: 'telecommunications', label: 'Telecommunications' },
  { value: 'other', label: 'Other' },
];

// ============ Compliance Frameworks ============
export const COMPLIANCE_FRAMEWORKS: { id: ComplianceFramework; name: string; description: string }[] = [
  {
    id: 'nist_csf',
    name: 'NIST CSF',
    description: 'National Institute of Standards and Technology Cybersecurity Framework',
  },
  {
    id: 'iso_27001',
    name: 'ISO 27001',
    description: 'International Organization for Standardization Information Security',
  },
  {
    id: 'soc2',
    name: 'SOC 2',
    description: 'Service Organization Control 2 Trust Services Criteria',
  },
  {
    id: 'pci_dss',
    name: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard',
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    description: 'General Data Protection Regulation',
  },
  {
    id: 'hipaa',
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act',
  },
];

// ============ Default Settings ============
export const DEFAULT_SETTINGS = {
  organization_name: '',
  primary_domain: '',
  industry: 'technology' as Industry,
  organization_size: 'medium' as const,
  scan_frequency: 'daily' as const,
  alert_threshold: 70,
  notifications_enabled: true,
  email_recipients: [],
  auto_remediation: false,
  ai_recommendations: true,
};

// ============ API Endpoints ============
export const API_ENDPOINTS = {
  base: '/api/v1/riskscore',
  organizations: '/organizations',
  vendors: '/vendors',
  findings: '/findings',
  remediations: '/remediations',
  reports: '/reports',
  benchmarks: '/benchmarks',
  compliance: '/compliance',
  trends: '/trends',
  quantify: '/quantify',
  chat: '/ai/chat',
};

// ============ Report Types ============
export const REPORT_TYPES = [
  { id: 'executive_summary', name: 'Executive Summary', description: 'High-level overview for leadership' },
  { id: 'detailed_risk', name: 'Detailed Risk Report', description: 'Comprehensive risk analysis' },
  { id: 'vendor_assessment', name: 'Vendor Assessment', description: 'Third-party risk evaluation' },
  { id: 'compliance', name: 'Compliance Report', description: 'Framework compliance status' },
  { id: 'trend_analysis', name: 'Trend Analysis', description: 'Historical risk trends' },
];

// ============ Quick Actions ============
export const QUICK_ACTIONS = [
  { id: 'scan', name: 'Run Full Scan', icon: 'Scan', description: 'Initiate comprehensive security scan' },
  { id: 'add_vendor', name: 'Add Vendor', icon: 'UserPlus', description: 'Onboard new vendor for monitoring' },
  { id: 'export', name: 'Export Report', icon: 'Download', description: 'Generate and download report' },
  { id: 'remediate', name: 'Start Remediation', icon: 'Wrench', description: 'Begin remediation workflow' },
];

// ============ AI Suggestions ============
export const AI_SUGGESTIONS = [
  'What is my current security posture?',
  'Which vendors pose the highest risk?',
  'What should I prioritize for remediation?',
  'How do I compare to industry peers?',
  'Calculate financial risk exposure',
  'Show compliance gaps for SOC 2',
];

// ============ Chart Colors ============
export const CHART_COLORS = [
  '#F59E0B', // Primary amber
  '#3B82F6', // Blue
  '#10B981', // Green
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

// ============ Time Periods ============
export const TIME_PERIODS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' },
];

// ============ Vendor Tiers ============
export const VENDOR_TIERS = [
  { tier: 1, label: 'Tier 1 - Critical', description: 'Direct access to sensitive data', color: '#DC2626' },
  { tier: 2, label: 'Tier 2 - High', description: 'Access to internal systems', color: '#EF4444' },
  { tier: 3, label: 'Tier 3 - Medium', description: 'Limited system access', color: '#F59E0B' },
  { tier: 4, label: 'Tier 4 - Low', description: 'No system access', color: '#22C55E' },
];

// ============ Helper Functions ============
export function getGradeFromScore(score: number): Grade {
  const gradeInfo = SCORE_GRADES.find(g => score >= g.min && score <= g.max);
  return gradeInfo?.grade ?? 'F';
}

export function getGradeColor(grade: Grade): string {
  return GRADE_COLORS[grade];
}

export function getSeverityColor(severity: Severity): string {
  return SEVERITY_COLORS[severity];
}

export function getRiskFactor(factorId: string): RiskFactor | undefined {
  return RISK_FACTORS.find(f => f.id === factorId);
}
