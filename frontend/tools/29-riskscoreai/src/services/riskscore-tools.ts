/**
 * RiskScoreAI - AI Function Definitions
 * These functions define the AI capabilities for risk scoring and analysis
 */

import type {
  Organization,
  Vendor,
  RiskFinding,
  RiskScore,
  RiskQuantification,
  Remediation,
  Benchmark,
  ComplianceFramework,
} from '../types';

// ============ AI Function Schemas ============

export const AI_FUNCTIONS = {
  // Calculate overall risk score for an organization
  calculate_risk_score: {
    name: 'calculate_risk_score',
    description: 'Calculate comprehensive security risk score for an organization based on multiple factors',
    parameters: {
      type: 'object',
      properties: {
        organization_id: {
          type: 'string',
          description: 'The organization ID to calculate score for',
        },
        include_factors: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific risk factors to include (optional, all if not specified)',
        },
        recalculate: {
          type: 'boolean',
          description: 'Force recalculation even if cached score exists',
        },
      },
      required: ['organization_id'],
    },
  },

  // Assess vendor risk
  assess_vendor_risk: {
    name: 'assess_vendor_risk',
    description: 'Perform comprehensive risk assessment on a third-party vendor',
    parameters: {
      type: 'object',
      properties: {
        vendor_domain: {
          type: 'string',
          description: 'Primary domain of the vendor to assess',
        },
        vendor_name: {
          type: 'string',
          description: 'Name of the vendor organization',
        },
        criticality: {
          type: 'string',
          enum: ['critical', 'high', 'medium', 'low'],
          description: 'Business criticality level of the vendor',
        },
        include_deep_scan: {
          type: 'boolean',
          description: 'Include comprehensive deep scan (takes longer)',
        },
      },
      required: ['vendor_domain'],
    },
  },

  // Quantify financial risk
  quantify_risk: {
    name: 'quantify_risk',
    description: 'Calculate financial risk exposure using quantitative risk analysis',
    parameters: {
      type: 'object',
      properties: {
        organization_id: {
          type: 'string',
          description: 'Organization to quantify risk for',
        },
        annual_revenue: {
          type: 'number',
          description: 'Annual revenue in USD for loss calculations',
        },
        industry: {
          type: 'string',
          description: 'Industry sector for benchmarking',
        },
        confidence_level: {
          type: 'number',
          description: 'Confidence level for VaR calculation (0.95 or 0.99)',
          default: 0.95,
        },
      },
      required: ['organization_id'],
    },
  },

  // Generate remediation recommendations
  generate_remediation: {
    name: 'generate_remediation',
    description: 'Generate AI-powered remediation recommendations for a finding',
    parameters: {
      type: 'object',
      properties: {
        finding_id: {
          type: 'string',
          description: 'ID of the finding to remediate',
        },
        priority_override: {
          type: 'string',
          enum: ['critical', 'high', 'medium', 'low'],
          description: 'Override priority level for remediation',
        },
        include_automation: {
          type: 'boolean',
          description: 'Include automated remediation scripts where possible',
        },
      },
      required: ['finding_id'],
    },
  },

  // Trend analysis
  trend_analysis: {
    name: 'trend_analysis',
    description: 'Analyze historical trends and predict future risk trajectory',
    parameters: {
      type: 'object',
      properties: {
        organization_id: {
          type: 'string',
          description: 'Organization to analyze trends for',
        },
        period: {
          type: 'string',
          enum: ['7d', '30d', '90d', '1y'],
          description: 'Time period for trend analysis',
        },
        include_prediction: {
          type: 'boolean',
          description: 'Include AI predictions for next 30 days',
        },
      },
      required: ['organization_id', 'period'],
    },
  },

  // Benchmark analysis
  benchmark_analysis: {
    name: 'benchmark_analysis',
    description: 'Compare organization security posture against industry peers',
    parameters: {
      type: 'object',
      properties: {
        organization_id: {
          type: 'string',
          description: 'Organization to benchmark',
        },
        industry: {
          type: 'string',
          description: 'Industry to compare against',
        },
        organization_size: {
          type: 'string',
          enum: ['small', 'medium', 'large', 'enterprise'],
          description: 'Size category for peer comparison',
        },
      },
      required: ['organization_id'],
    },
  },

  // Compliance mapping
  compliance_mapping: {
    name: 'compliance_mapping',
    description: 'Map findings to compliance framework controls',
    parameters: {
      type: 'object',
      properties: {
        organization_id: {
          type: 'string',
          description: 'Organization to map compliance for',
        },
        framework: {
          type: 'string',
          enum: ['nist_csf', 'iso_27001', 'soc2', 'pci_dss', 'gdpr', 'hipaa'],
          description: 'Compliance framework to map against',
        },
        include_gaps: {
          type: 'boolean',
          description: 'Include gap analysis and recommendations',
        },
      },
      required: ['organization_id', 'framework'],
    },
  },

  // Breach probability prediction
  predict_breach_probability: {
    name: 'predict_breach_probability',
    description: 'Calculate probability of security breach based on current risk profile',
    parameters: {
      type: 'object',
      properties: {
        organization_id: {
          type: 'string',
          description: 'Organization to calculate breach probability for',
        },
        timeframe_months: {
          type: 'number',
          description: 'Timeframe for probability calculation (default: 12)',
          default: 12,
        },
        include_factors: {
          type: 'boolean',
          description: 'Include contributing factors breakdown',
        },
      },
      required: ['organization_id'],
    },
  },
};

// ============ AI Tool Executor ============

export async function executeAIFunction(
  functionName: string,
  parameters: Record<string, unknown>
): Promise<unknown> {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4029';
  
  const response = await fetch(`${apiBase}/api/v1/riskscore/ai/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      function: functionName,
      parameters,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI function execution failed: ${response.statusText}`);
  }

  return response.json();
}

// ============ Convenience Functions ============

export async function calculateOrganizationScore(
  organizationId: string,
  recalculate = false
): Promise<RiskScore> {
  return executeAIFunction('calculate_risk_score', {
    organization_id: organizationId,
    recalculate,
  }) as Promise<RiskScore>;
}

export async function assessVendor(
  domain: string,
  name?: string,
  deepScan = false
): Promise<Vendor> {
  return executeAIFunction('assess_vendor_risk', {
    vendor_domain: domain,
    vendor_name: name,
    include_deep_scan: deepScan,
  }) as Promise<Vendor>;
}

export async function quantifyFinancialRisk(
  organizationId: string,
  annualRevenue?: number
): Promise<RiskQuantification> {
  return executeAIFunction('quantify_risk', {
    organization_id: organizationId,
    annual_revenue: annualRevenue,
  }) as Promise<RiskQuantification>;
}

export async function generateRemediationPlan(
  findingId: string,
  includeAutomation = true
): Promise<Remediation> {
  return executeAIFunction('generate_remediation', {
    finding_id: findingId,
    include_automation: includeAutomation,
  }) as Promise<Remediation>;
}

export async function analyzeTrends(
  organizationId: string,
  period: '7d' | '30d' | '90d' | '1y',
  includePrediction = true
): Promise<unknown> {
  return executeAIFunction('trend_analysis', {
    organization_id: organizationId,
    period,
    include_prediction: includePrediction,
  });
}

export async function getBenchmarkComparison(
  organizationId: string,
  industry?: string
): Promise<Benchmark> {
  return executeAIFunction('benchmark_analysis', {
    organization_id: organizationId,
    industry,
  }) as Promise<Benchmark>;
}

export async function mapToCompliance(
  organizationId: string,
  framework: ComplianceFramework,
  includeGaps = true
): Promise<unknown> {
  return executeAIFunction('compliance_mapping', {
    organization_id: organizationId,
    framework,
    include_gaps: includeGaps,
  });
}

export async function predictBreachProbability(
  organizationId: string,
  months = 12
): Promise<{ probability: number; factors: unknown[] }> {
  return executeAIFunction('predict_breach_probability', {
    organization_id: organizationId,
    timeframe_months: months,
    include_factors: true,
  }) as Promise<{ probability: number; factors: unknown[] }>;
}
