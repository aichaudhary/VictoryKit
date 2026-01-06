export interface RiskScoreAIConfig {
  tool_name: string;
  description: string;
  ai_enabled: boolean;
  ai_system_prompt: string;
  ai_functions: Array<{
    name: string;
    description: string;
    parameters: Record<string, any>;
    required: string[];
  }>;
  navigation: Array<{
    name: string;
    path: string;
    icon?: string;
  }>;
  color_theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  risk_levels: {
    low: { threshold: number; color: string; label: string };
    medium: { threshold: number; color: string; label: string };
    high: { threshold: number; color: string; label: string };
    critical: { threshold: number; color: string; label: string };
  };
}

let configCache: RiskScoreAIConfig | null = null;

export async function loadConfig(): Promise<RiskScoreAIConfig> {
  if (configCache) {
    return configCache;
  }

  try {
    const response = await fetch('/riskscoreai-config.json');
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.statusText}`);
    }
    configCache = await response.json();
    return configCache as RiskScoreAIConfig;
  } catch (error) {
    console.error('Error loading RiskScoreAI config:', error);
    throw error;
  }
}

export function getConfig(): RiskScoreAIConfig | null {
  return configCache;
}

export function clearConfigCache(): void {
  configCache = null;
}

export function getRiskLevelColor(score: number): string {
  if (score >= 80) return '#dc2626'; // critical - red
  if (score >= 60) return '#f59e0b'; // high - amber
  if (score >= 40) return '#f59e0b'; // medium - amber
  return '#10b981'; // low - green
}

export function getRiskLevelLabel(score: number): string {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

export function formatRiskScore(score: number): string {
  return `${score}/100`;
}

export function getRecommendedActions(riskLevel: string): string[] {
  switch (riskLevel.toLowerCase()) {
    case 'critical':
      return [
        'Immediate executive escalation required',
        'Activate incident response procedures',
        'Deploy emergency controls',
        'Schedule daily status reviews',
        'Consider business continuity activation'
      ];
    case 'high':
      return [
        'Escalate to senior management',
        'Implement compensating controls',
        'Accelerate remediation timeline',
        'Increase monitoring frequency',
        'Review and update risk treatment plan'
      ];
    case 'medium':
      return [
        'Document in risk register',
        'Implement standard controls',
        'Schedule remediation within 30 days',
        'Monitor for changes',
        'Assign risk owner'
      ];
    case 'low':
      return [
        'Accept risk with monitoring',
        'Routine security reviews',
        'Document in risk register',
        'Quarterly reassessment'
      ];
    default:
      return [];
  }
}

export function calculateComplianceGap(required: string[], achieved: string[]): {
  total: number;
  compliant: number;
  gap: number;
  percentage: number;
} {
  const total = required.length;
  const compliant = required.filter(r => achieved.includes(r)).length;
  const gap = total - compliant;
  const percentage = total > 0 ? (compliant / total) * 100 : 100;

  return {
    total,
    compliant,
    gap,
    percentage: Math.round(percentage)
  };
}
