// ============ Navigation & Tabs ============
export type Tab = 'dashboard' | 'organizations' | 'vendors' | 'risks' | 'remediations' | 'reports' | 'benchmarks' | 'assistant' | 'settings';

// ============ Scoring System ============
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface ScoreGrade {
  grade: Grade;
  min: number;
  max: number;
  label: string;
  color: string;
}

export interface RiskScore {
  overall: number;
  grade: Grade;
  factors: RiskFactorScore[];
  calculated_at: string;
  trend: 'improving' | 'stable' | 'declining';
  change_30d: number;
}

export interface RiskFactorScore {
  factor_id: string;
  name: string;
  score: number;
  weight: number;
  weighted_score: number;
  findings_count: number;
  trend: 'improving' | 'stable' | 'declining';
}

// ============ Organizations ============
export interface Organization {
  id: string;
  name: string;
  domain: string;
  industry: Industry;
  size: OrganizationSize;
  logo_url?: string;
  score: RiskScore;
  vendor_count: number;
  created_at: string;
  updated_at: string;
  last_scanned: string;
  is_primary: boolean;
}

export type Industry = 
  | 'technology'
  | 'healthcare'
  | 'finance'
  | 'retail'
  | 'manufacturing'
  | 'government'
  | 'education'
  | 'energy'
  | 'telecommunications'
  | 'other';

export type OrganizationSize = 'small' | 'medium' | 'large' | 'enterprise';

// ============ Vendors ============
export interface Vendor {
  id: string;
  name: string;
  domain: string;
  industry: Industry;
  relationship: VendorRelationship;
  criticality: Criticality;
  score: RiskScore;
  tier: VendorTier;
  status: VendorStatus;
  last_assessed: string;
  next_review: string;
  contacts: VendorContact[];
  tags: string[];
  notes: string;
}

export type VendorRelationship = 'supplier' | 'service_provider' | 'partner' | 'subcontractor' | 'other';
export type Criticality = 'critical' | 'high' | 'medium' | 'low';
export type VendorTier = 1 | 2 | 3 | 4;
export type VendorStatus = 'active' | 'under_review' | 'probation' | 'offboarded';

export interface VendorContact {
  name: string;
  email: string;
  role: string;
  is_primary: boolean;
}

// ============ Risk Findings ============
export interface RiskFinding {
  id: string;
  organization_id: string;
  factor_id: string;
  severity: Severity;
  title: string;
  description: string;
  evidence: string;
  first_detected: string;
  last_seen: string;
  status: FindingStatus;
  remediation_id?: string;
  affected_assets: string[];
  cve_ids?: string[];
  compliance_impact: string[];
}

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type FindingStatus = 'open' | 'in_progress' | 'resolved' | 'accepted' | 'false_positive';

// ============ Remediation ============
export interface Remediation {
  id: string;
  finding_id: string;
  organization_id: string;
  title: string;
  description: string;
  priority: Severity;
  status: RemediationStatus;
  assignee?: string;
  due_date?: string;
  created_at: string;
  completed_at?: string;
  steps: RemediationStep[];
  estimated_impact: number; // Score improvement
  actual_impact?: number;
  ai_generated: boolean;
}

export type RemediationStatus = 'pending' | 'in_progress' | 'completed' | 'verified' | 'cancelled';

export interface RemediationStep {
  id: string;
  order: number;
  description: string;
  completed: boolean;
  completed_at?: string;
}

// ============ Risk Quantification ============
export interface RiskQuantification {
  organization_id: string;
  annual_revenue: number;
  estimated_loss_low: number;
  estimated_loss_mid: number;
  estimated_loss_high: number;
  breach_probability: number; // 0-1
  var_95: number; // Value at Risk 95th percentile
  var_99: number;
  roi_remediation: number; // Expected ROI from remediation
  calculation_date: string;
}

// ============ Benchmarking ============
export interface Benchmark {
  organization_id: string;
  industry: Industry;
  size: OrganizationSize;
  organization_score: number;
  industry_average: number;
  industry_median: number;
  percentile: number;
  top_quartile_threshold: number;
  peer_count: number;
  calculated_at: string;
  factor_benchmarks: FactorBenchmark[];
}

export interface FactorBenchmark {
  factor_id: string;
  name: string;
  organization_score: number;
  industry_average: number;
  percentile: number;
}

// ============ Trend Data ============
export interface ScoreHistory {
  date: string;
  score: number;
  grade: Grade;
}

export interface TrendData {
  organization_id: string;
  period: '7d' | '30d' | '90d' | '1y';
  history: ScoreHistory[];
  trend: 'improving' | 'stable' | 'declining';
  change_absolute: number;
  change_percentage: number;
}

// ============ Compliance ============
export interface ComplianceMapping {
  finding_id: string;
  framework: ComplianceFramework;
  controls: ComplianceControl[];
}

export type ComplianceFramework = 'nist_csf' | 'iso_27001' | 'soc2' | 'pci_dss' | 'gdpr' | 'hipaa';

export interface ComplianceControl {
  control_id: string;
  name: string;
  description: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
}

// ============ Reports ============
export interface Report {
  id: string;
  organization_id: string;
  type: ReportType;
  title: string;
  generated_at: string;
  generated_by: string;
  format: 'pdf' | 'html' | 'json';
  sections: ReportSection[];
  download_url?: string;
}

export type ReportType = 'executive_summary' | 'detailed_risk' | 'vendor_assessment' | 'compliance' | 'trend_analysis';

export interface ReportSection {
  id: string;
  title: string;
  order: number;
  included: boolean;
}

// ============ Dashboard Stats ============
export interface DashboardStats {
  organization_score: number;
  organization_grade: Grade;
  score_change_30d: number;
  vendor_count: number;
  critical_vendors: number;
  open_findings: number;
  critical_findings: number;
  pending_remediations: number;
  industry_percentile: number;
  breach_probability: number;
}

// ============ Settings ============
export interface RiskScoreSettings {
  organization_name: string;
  primary_domain: string;
  industry: Industry;
  organization_size: OrganizationSize;
  annual_revenue?: number;
  scan_frequency: 'daily' | 'weekly' | 'monthly';
  alert_threshold: number;
  notifications_enabled: boolean;
  email_recipients: string[];
  auto_remediation: boolean;
  ai_recommendations: boolean;
}

// ============ Navigation ============
export interface NavItem {
  id: Tab;
  name: string;
  icon: string;
  badge?: number;
}

// ============ Risk Factors Config ============
export interface RiskFactor {
  id: string;
  name: string;
  description: string;
  weight: number;
  category: 'technical' | 'operational' | 'compliance';
  icon: string;
}

// ============ AI Chat ============
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

// ============ Alerts ============
export interface RiskAlert {
  id: string;
  organization_id: string;
  type: 'score_drop' | 'new_finding' | 'vendor_issue' | 'breach_detected';
  severity: Severity;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  action_url?: string;
}
