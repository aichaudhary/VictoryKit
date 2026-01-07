import { useState } from 'react';
import {
  AlertTriangle,
  Shield,
  Network,
  RefreshCw,
  Globe,
  Code,
  Fingerprint,
  MessageSquare,
  Key,
  UserX,
  FileWarning,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
} from 'lucide-react';
import type { RiskFactorScore, RiskFinding, Severity } from '../types';
import { RISK_FACTORS, SEVERITY_COLORS, GRADE_COLORS, getGradeFromScore } from '../constants';

// Mock data
const mockFactorScores: RiskFactorScore[] = [
  { factor_id: 'network_security', name: 'Network Security', score: 72, weight: 15, weighted_score: 10.8, findings_count: 5, trend: 'stable' },
  { factor_id: 'patching_cadence', name: 'Patching Cadence', score: 58, weight: 15, weighted_score: 8.7, findings_count: 8, trend: 'declining' },
  { factor_id: 'endpoint_security', name: 'Endpoint Security', score: 85, weight: 12, weighted_score: 10.2, findings_count: 2, trend: 'improving' },
  { factor_id: 'dns_health', name: 'DNS Health', score: 91, weight: 10, weighted_score: 9.1, findings_count: 1, trend: 'stable' },
  { factor_id: 'application_security', name: 'Application Security', score: 68, weight: 12, weighted_score: 8.16, findings_count: 6, trend: 'stable' },
  { factor_id: 'ip_reputation', name: 'IP Reputation', score: 82, weight: 8, weighted_score: 6.56, findings_count: 1, trend: 'improving' },
  { factor_id: 'hacker_chatter', name: 'Hacker Chatter', score: 95, weight: 8, weighted_score: 7.6, findings_count: 0, trend: 'stable' },
  { factor_id: 'leaked_credentials', name: 'Leaked Credentials', score: 65, weight: 10, weighted_score: 6.5, findings_count: 4, trend: 'declining' },
  { factor_id: 'social_engineering', name: 'Social Engineering', score: 78, weight: 5, weighted_score: 3.9, findings_count: 2, trend: 'stable' },
  { factor_id: 'information_disclosure', name: 'Information Disclosure', score: 88, weight: 5, weighted_score: 4.4, findings_count: 1, trend: 'improving' },
];

const mockFindings: Record<string, RiskFinding[]> = {
  network_security: [
    { id: '1', organization_id: 'org-1', factor_id: 'network_security', severity: 'high', title: 'Open RDP Port (3389)', description: 'Remote Desktop Protocol exposed to internet', evidence: '203.0.113.10:3389', first_detected: '2024-03-01', last_seen: '2024-03-15', status: 'open', affected_assets: ['203.0.113.10'], cve_ids: [], compliance_impact: ['nist_csf'] },
    { id: '2', organization_id: 'org-1', factor_id: 'network_security', severity: 'medium', title: 'TLS 1.0/1.1 Enabled', description: 'Deprecated TLS versions still in use', evidence: 'api.example.com', first_detected: '2024-02-15', last_seen: '2024-03-15', status: 'in_progress', affected_assets: ['api.example.com'], cve_ids: [], compliance_impact: ['pci_dss'] },
  ],
  patching_cadence: [
    { id: '3', organization_id: 'org-1', factor_id: 'patching_cadence', severity: 'critical', title: 'CVE-2024-1234 Unpatched', description: 'Critical RCE vulnerability in Apache Server', evidence: 'Apache 2.4.49', first_detected: '2024-03-10', last_seen: '2024-03-15', status: 'open', affected_assets: ['web-01.example.com'], cve_ids: ['CVE-2024-1234'], compliance_impact: ['nist_csf', 'soc2'] },
    { id: '4', organization_id: 'org-1', factor_id: 'patching_cadence', severity: 'high', title: 'OpenSSL Version Outdated', description: 'Running OpenSSL 1.1.1 (EOL)', evidence: 'OpenSSL 1.1.1', first_detected: '2024-02-20', last_seen: '2024-03-15', status: 'open', affected_assets: ['*.example.com'], cve_ids: [], compliance_impact: ['pci_dss'] },
  ],
  leaked_credentials: [
    { id: '5', organization_id: 'org-1', factor_id: 'leaked_credentials', severity: 'high', title: 'Credentials in Data Breach', description: '15 employee credentials found in breach database', evidence: 'DarkWeb breach 2024-03', first_detected: '2024-03-05', last_seen: '2024-03-15', status: 'in_progress', affected_assets: ['employee accounts'], cve_ids: [], compliance_impact: ['gdpr', 'hipaa'] },
  ],
};

const iconMap: Record<string, React.ComponentType<{className?: string}>> = {
  network_security: Network,
  patching_cadence: RefreshCw,
  endpoint_security: Shield,
  dns_health: Globe,
  application_security: Code,
  ip_reputation: Fingerprint,
  hacker_chatter: MessageSquare,
  leaked_credentials: Key,
  social_engineering: UserX,
  information_disclosure: FileWarning,
};

export function RiskFactorsPanel() {
  const [expandedFactor, setExpandedFactor] = useState<string | null>('patching_cadence');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');

  const overallScore = Math.round(mockFactorScores.reduce((sum, f) => sum + f.weighted_score, 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
            Risk Factor Analysis
          </h1>
          <p className="text-gray-400 mt-1">Detailed breakdown of security risk categories</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as Severity | 'all')}
            className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Overall Score Card */}
      <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-6">
        <div className="flex items-center gap-6">
          <div
            className="w-20 h-20 rounded-xl flex flex-col items-center justify-center"
            style={{ backgroundColor: GRADE_COLORS[getGradeFromScore(overallScore)] + '20' }}
          >
            <span
              className="text-3xl font-bold"
              style={{ color: GRADE_COLORS[getGradeFromScore(overallScore)] }}
            >
              {overallScore}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white mb-2">Composite Risk Score</h2>
            <p className="text-gray-400 text-sm">
              Calculated from {mockFactorScores.length} risk factors with weighted scoring
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm mb-1">Total Findings</p>
            <p className="text-2xl font-bold text-white">
              {mockFactorScores.reduce((sum, f) => sum + f.findings_count, 0)}
            </p>
          </div>
        </div>

        {/* Factor Weight Distribution */}
        <div className="mt-6">
          <div className="flex h-3 rounded-full overflow-hidden">
            {mockFactorScores.map((factor) => (
              <div
                key={factor.factor_id}
                className="h-full transition-all hover:opacity-80 cursor-pointer"
                style={{
                  width: `${factor.weight}%`,
                  backgroundColor: GRADE_COLORS[getGradeFromScore(factor.score)],
                }}
                title={`${factor.name}: ${factor.score}`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Network Security (15%)</span>
            <span>Information Disclosure (5%)</span>
          </div>
        </div>
      </div>

      {/* Risk Factors Accordion */}
      <div className="space-y-3">
        {mockFactorScores.map((factor) => {
          const IconComponent = iconMap[factor.factor_id] || Shield;
          const factorConfig = RISK_FACTORS.find((f) => f.id === factor.factor_id);
          const findings = mockFindings[factor.factor_id] || [];
          const isExpanded = expandedFactor === factor.factor_id;

          return (
            <div
              key={factor.factor_id}
              className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] overflow-hidden"
            >
              {/* Factor Header */}
              <button
                className="w-full p-4 flex items-center gap-4 hover:bg-[#252529] transition-colors"
                onClick={() => setExpandedFactor(isExpanded ? null : factor.factor_id)}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: GRADE_COLORS[getGradeFromScore(factor.score)] + '20' }}
                >
                  <IconComponent
                    className="w-6 h-6"
                    style={{ color: GRADE_COLORS[getGradeFromScore(factor.score)] }}
                  />
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-medium">{factor.name}</h3>
                    {factor.findings_count > 0 && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
                        {factor.findings_count} findings
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">{factorConfig?.description}</p>
                </div>

                <div className="flex items-center gap-6">
                  {/* Trend */}
                  <div className="flex items-center gap-1">
                    {factor.trend === 'improving' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : factor.trend === 'declining' ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : (
                      <Minus className="w-4 h-4 text-gray-500" />
                    )}
                  </div>

                  {/* Score */}
                  <div className="text-right w-20">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: GRADE_COLORS[getGradeFromScore(factor.score)] }}
                    >
                      {factor.score}
                    </span>
                    <p className="text-gray-500 text-xs">{factor.weight}% weight</p>
                  </div>

                  {/* Expand Icon */}
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Findings List */}
              {isExpanded && findings.length > 0 && (
                <div className="border-t border-[#2A2A2F] p-4 space-y-3">
                  {findings
                    .filter((f) => severityFilter === 'all' || f.severity === severityFilter)
                    .map((finding) => (
                      <div
                        key={finding.id}
                        className="flex items-center gap-4 p-3 bg-[#252529] rounded-lg hover:bg-[#2A2A2F] transition-colors cursor-pointer"
                      >
                        <div
                          className="w-1 h-12 rounded-full"
                          style={{ backgroundColor: SEVERITY_COLORS[finding.severity] }}
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium">{finding.title}</p>
                          <p className="text-gray-400 text-sm">{finding.description}</p>
                        </div>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: SEVERITY_COLORS[finding.severity] + '20',
                            color: SEVERITY_COLORS[finding.severity],
                          }}
                        >
                          {finding.severity.toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            finding.status === 'open'
                              ? 'bg-red-500/20 text-red-400'
                              : finding.status === 'in_progress'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {finding.status.replace('_', ' ')}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                      </div>
                    ))}
                </div>
              )}

              {/* No Findings */}
              {isExpanded && findings.length === 0 && (
                <div className="border-t border-[#2A2A2F] p-6 text-center">
                  <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-400">No findings detected for this risk factor</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
