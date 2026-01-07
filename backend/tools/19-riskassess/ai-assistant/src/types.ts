/**
 * TypeScript Type Definitions for RiskAssess AI Assistant
 * Tool 19 - Comprehensive Risk Assessment Types
 */

export interface RiskQuery {
  type: AnalysisType;
  data: any;
  context?: AnalysisContext;
  sessionId?: string;
}

export type AnalysisType =
  | 'risk_analysis'
  | 'threat_modeling'
  | 'impact_assessment'
  | 'compliance_check'
  | 'mitigation_strategy'
  | 'scenario_planning';

export interface AnalysisContext {
  industry?: string;
  organizationSize?: string;
  regulatoryRequirements?: string[];
  existingControls?: string[];
  riskTolerance?: RiskTolerance;
  timeHorizon?: string;
  stakeholders?: string[];
}

export type RiskTolerance = 'low' | 'medium' | 'high';

export interface AIResponse {
  id: string;
  type: AnalysisType;
  content: string;
  confidence?: number;
  recommendations?: string[];
  riskScore?: number;
  riskLevel?: RiskLevel;
  timestamp: Date;
  sessionId?: string;
  processingTime?: number;
}

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'minimal';

export interface RiskData {
  name: string;
  category: RiskCategory;
  description: string;
  probability: number; // 1-5 scale
  impact: number; // 1-5 scale
  detection?: number; // 1-5 scale for some frameworks
  owner?: string;
  mitigationStatus?: MitigationStatus;
  lastAssessment?: Date;
}

export type RiskCategory =
  | 'strategic'
  | 'operational'
  | 'financial'
  | 'compliance'
  | 'cybersecurity'
  | 'reputational'
  | 'legal'
  | 'technological'
  | 'environmental'
  | 'health_safety';

export type MitigationStatus =
  | 'not_started'
  | 'planned'
  | 'in_progress'
  | 'implemented'
  | 'monitoring'
  | 'closed';

export interface ThreatModelData {
  system: string;
  assets: string[];
  attackSurface: string[];
  trustBoundaries?: string[];
  entryPoints?: string[];
  dataFlows?: DataFlow[];
}

export interface DataFlow {
  source: string;
  destination: string;
  dataType: string;
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
}

export interface ImpactAssessmentData {
  riskName: string;
  businessUnit: string;
  financialImpact: FinancialImpact;
  operationalImpact: OperationalImpact;
  reputationalImpact: ReputationalImpact;
  complianceImpact: ComplianceImpact;
}

export interface FinancialImpact {
  directCosts: number;
  indirectCosts: number;
  lostRevenue: number;
  recoveryCosts: number;
  currency: string;
}

export interface OperationalImpact {
  downtimeHours: number;
  affectedUsers: number;
  alternativeProcesses: string[];
  recoveryTimeObjective: number; // in hours
  recoveryPointObjective: number; // in hours
}

export interface ReputationalImpact {
  brandDamage: 'minimal' | 'moderate' | 'significant' | 'severe';
  customerTrust: 'unaffected' | 'reduced' | 'severely_damaged';
  mediaCoverage: 'none' | 'local' | 'national' | 'international';
}

export interface ComplianceImpact {
  affectedRegulations: string[];
  potentialFines: number;
  auditRequirements: string[];
  reportingObligations: string[];
}

export interface ComplianceCheckData {
  scenario: string;
  regulations: string[];
  dataTypes: string[];
  processes: string[];
  currentControls: string[];
  geographicScope: string[];
}

export interface MitigationStrategyData {
  riskName: string;
  riskScore: number;
  riskLevel: RiskLevel;
  timeframe: 'immediate' | 'short_term' | 'long_term';
  budget: number;
  resources: string[];
  stakeholders: string[];
}

export interface ScenarioPlanningData {
  riskName: string;
  scenarios: Scenario[];
  triggers: string[];
  earlyWarningIndicators: string[];
  responsePlans: ResponsePlan[];
}

export interface Scenario {
  type: 'best_case' | 'worst_case' | 'most_likely';
  description: string;
  probability: number;
  impact: ImpactAssessmentData;
  duration: number; // in hours
}

export interface ResponsePlan {
  scenarioType: 'best_case' | 'worst_case' | 'most_likely';
  immediateActions: string[];
  escalationProcedures: string[];
  communicationPlan: CommunicationPlan;
  recoveryProcedures: string[];
  successMetrics: string[];
}

export interface CommunicationPlan {
  internalStakeholders: string[];
  externalStakeholders: string[];
  templates: string[];
  channels: string[];
  frequency: string;
}

export interface SessionData {
  id: string;
  startTime: Date;
  lastActivity: Date;
  queryCount: number;
  analysisTypes: AnalysisType[];
  context: AnalysisContext;
  riskProfile: RiskProfile;
}

export interface RiskProfile {
  overallRiskLevel: RiskLevel;
  riskCategories: Record<RiskCategory, number>;
  topRisks: string[];
  mitigationGaps: string[];
  complianceStatus: Record<string, 'compliant' | 'non_compliant' | 'unknown'>;
}

export interface AIConfig {
  primaryModel: 'claude' | 'gemini' | 'openai';
  fallbackModels: ('claude' | 'gemini' | 'openai')[];
  timeout: number;
  maxRetries: number;
  temperature: number;
  maxTokens: number;
}

export interface WebSocketConnection {
  id: string;
  ip: string;
  connectedAt: Date;
  lastPing: Date;
  sessionId?: string;
  queryCount: number;
  isActive: boolean;
}

export interface AnalysisMetrics {
  responseTime: number;
  confidence: number;
  tokenCount: number;
  modelUsed: string;
  success: boolean;
  errorType?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  connectionId: string;
  sessionId?: string;
  queryType: AnalysisType;
  inputData: any;
  responseData: Partial<AIResponse>;
  metrics: AnalysisMetrics;
  ipAddress: string;
  userAgent?: string;
}

// Error types
export class AIAssistantError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AIAssistantError';
  }
}

export class ValidationError extends AIAssistantError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class AIProviderError extends AIAssistantError {
  constructor(message: string, public provider: string) {
    super(message, 'AI_PROVIDER_ERROR', 503);
    this.name = 'AIProviderError';
  }
}

export class RateLimitError extends AIAssistantError {
  constructor(message: string) {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
  }
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RiskMatrix = {
  [probability: number]: {
    [impact: number]: RiskLevel;
  };
};

export type ComplianceFramework =
  | 'GDPR'
  | 'HIPAA'
  | 'PCI_DSS'
  | 'SOX'
  | 'ISO_27001'
  | 'NIST_SP_800_53'
  | 'COBIT'
  | 'CIS_Controls';

export interface ComplianceRequirement {
  framework: ComplianceFramework;
  requirement: string;
  description: string;
  controls: string[];
  testing: string[];
  evidence: string[];
}