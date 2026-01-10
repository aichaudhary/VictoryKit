import { useState } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Users,
  Wrench,
  BarChart3,
  ArrowUpRight,
  Shield,
  Target,
} from 'lucide-react';
import type { DashboardStats, RiskScore, RiskFinding, Vendor, ScoreHistory } from '../types';
import { GRADE_COLORS, SEVERITY_COLORS, getGradeFromScore, TIME_PERIODS } from '../constants';

// Mock data
const mockStats: DashboardStats = {
  organization_score: 78,
  organization_grade: 'C',
  score_change_30d: 3,
  vendor_count: 47,
  critical_vendors: 8,
  open_findings: 23,
  critical_findings: 4,
  pending_remediations: 12,
  industry_percentile: 68,
  breach_probability: 0.12,
};

const mockTrend: ScoreHistory[] = [
  { date: '2024-01-01', score: 72, grade: 'C' },
  { date: '2024-01-15', score: 74, grade: 'C' },
  { date: '2024-02-01', score: 73, grade: 'C' },
  { date: '2024-02-15', score: 76, grade: 'C' },
  { date: '2024-03-01', score: 75, grade: 'C' },
  { date: '2024-03-15', score: 78, grade: 'C' },
];

const mockTopRisks: RiskFinding[] = [
  {
    id: '1',
    organization_id: 'org-1',
    factor_id: 'patching_cadence',
    severity: 'critical',
    title: 'Outdated SSL/TLS Version',
    description: 'Critical TLS 1.0 still enabled on main domain',
    evidence: 'https://example.com uses TLS 1.0',
    first_detected: '2024-03-01',
    last_seen: '2024-03-15',
    status: 'open',
    affected_assets: ['example.com'],
    cve_ids: [],
    compliance_impact: ['pci_dss', 'soc2'],
  },
  {
    id: '2',
    organization_id: 'org-1',
    factor_id: 'network_security',
    severity: 'high',
    title: 'Open RDP Port Detected',
    description: 'Port 3389 exposed to internet on 2 hosts',
    evidence: '203.0.113.10:3389, 203.0.113.11:3389',
    first_detected: '2024-03-10',
    last_seen: '2024-03-15',
    status: 'open',
    affected_assets: ['203.0.113.10', '203.0.113.11'],
    cve_ids: [],
    compliance_impact: ['nist_csf'],
  },
  {
    id: '3',
    organization_id: 'org-1',
    factor_id: 'leaked_credentials',
    severity: 'high',
    title: 'Employee Credentials Found in Breach',
    description: '15 employee credentials found in recent data breach',
    evidence: 'Credentials detected in DarkWeb breach database',
    first_detected: '2024-03-05',
    last_seen: '2024-03-15',
    status: 'in_progress',
    affected_assets: ['employee accounts'],
    cve_ids: [],
    compliance_impact: ['gdpr', 'hipaa'],
  },
];

const mockCriticalVendors: Vendor[] = [
  {
    id: 'v1',
    name: 'CloudCore Services',
    domain: 'cloudcore.io',
    industry: 'technology',
    relationship: 'service_provider',
    criticality: 'critical',
    tier: 1,
    status: 'active',
    score: { overall: 62, grade: 'D', factors: [], calculated_at: '', trend: 'declining', change_30d: -5 },
    last_assessed: '2024-03-10',
    next_review: '2024-04-10',
    contacts: [],
    tags: ['cloud', 'infrastructure'],
    notes: '',
  },
  {
    id: 'v2',
    name: 'PaySecure Inc',
    domain: 'paysecure.com',
    industry: 'finance',
    relationship: 'partner',
    criticality: 'critical',
    tier: 1,
    status: 'under_review',
    score: { overall: 58, grade: 'F', factors: [], calculated_at: '', trend: 'stable', change_30d: 0 },
    last_assessed: '2024-03-12',
    next_review: '2024-04-12',
    contacts: [],
    tags: ['payment', 'pci'],
    notes: '',
  },
];

export function RiskDashboard() {
  const [period, setPeriod] = useState('30d');
  const stats = mockStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 text-amber-500" />
            Risk Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Real-time security posture overview</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            {TIME_PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Score Card */}
      <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Score Gauge */}
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#2A2A2F"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={GRADE_COLORS[stats.organization_grade]}
                  strokeWidth="12"
                  strokeDasharray={`${(stats.organization_score / 100) * 440} 440`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{stats.organization_score}</span>
                <span
                  className="text-2xl font-bold"
                  style={{ color: GRADE_COLORS[stats.organization_grade] }}
                >
                  {stats.organization_grade}
                </span>
              </div>
            </div>

            {/* Score Details */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Security Score</h2>
              <div className="flex items-center gap-2 mb-3">
                {stats.score_change_30d > 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : stats.score_change_30d < 0 ? (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                ) : (
                  <Minus className="w-5 h-5 text-gray-500" />
                )}
                <span
                  className={`text-sm font-medium ${
                    stats.score_change_30d > 0
                      ? 'text-green-500'
                      : stats.score_change_30d < 0
                      ? 'text-red-500'
                      : 'text-gray-500'
                  }`}
                >
                  {stats.score_change_30d > 0 ? '+' : ''}
                  {stats.score_change_30d} points in last 30 days
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Industry Percentile: <span className="text-white font-medium">{stats.industry_percentile}th</span>
              </p>
            </div>
          </div>

          {/* Breach Probability */}
          <div className="text-right">
            <p className="text-gray-400 text-sm mb-1">12-Month Breach Probability</p>
            <p className="text-3xl font-bold text-amber-500">{(stats.breach_probability * 100).toFixed(1)}%</p>
            <p className="text-gray-500 text-xs mt-1">Based on current risk profile</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Vendors"
          value={stats.vendor_count}
          subValue={`${stats.critical_vendors} critical`}
          color="#3B82F6"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Open Findings"
          value={stats.open_findings}
          subValue={`${stats.critical_findings} critical`}
          color="#EF4444"
        />
        <StatCard
          icon={<Wrench className="w-5 h-5" />}
          label="Pending Remediations"
          value={stats.pending_remediations}
          subValue="action required"
          color="#F59E0B"
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Industry Ranking"
          value={`Top ${100 - stats.industry_percentile}%`}
          subValue="among peers"
          color="#10B981"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            Score Trend
          </h3>
          <div className="h-48 flex items-end justify-between gap-2">
            {mockTrend.map((point, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t transition-all hover:opacity-80"
                  style={{
                    height: `${(point.score / 100) * 150}px`,
                    backgroundColor: GRADE_COLORS[getGradeFromScore(point.score)],
                  }}
                />
                <span className="text-xs text-gray-500">{point.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Vendors */}
        <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-red-500" />
            High-Risk Vendors
          </h3>
          <div className="space-y-3">
            {mockCriticalVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="flex items-center justify-between p-3 bg-[#252529] rounded-lg hover:bg-[#2A2A2F] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: GRADE_COLORS[vendor.score.grade] + '20' }}
                  >
                    <span
                      className="text-lg font-bold"
                      style={{ color: GRADE_COLORS[vendor.score.grade] }}
                    >
                      {vendor.score.grade}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{vendor.name}</p>
                    <p className="text-gray-500 text-sm">{vendor.domain}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-white font-medium">{vendor.score.overall}</p>
                    <div className="flex items-center gap-1 text-xs">
                      {vendor.score.change_30d !== 0 && (
                        <>
                          {vendor.score.change_30d < 0 ? (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          ) : (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          )}
                          <span
                            className={vendor.score.change_30d < 0 ? 'text-red-500' : 'text-green-500'}
                          >
                            {vendor.score.change_30d}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Risk Findings */}
      <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-500" />
          Top Risk Findings
        </h3>
        <div className="space-y-3">
          {mockTopRisks.map((finding) => (
            <div
              key={finding.id}
              className="flex items-center justify-between p-4 bg-[#252529] rounded-lg hover:bg-[#2A2A2F] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-2 h-12 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLORS[finding.severity] }}
                />
                <div>
                  <p className="text-white font-medium">{finding.title}</p>
                  <p className="text-gray-400 text-sm">{finding.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: SEVERITY_COLORS[finding.severity] + '20',
                    color: SEVERITY_COLORS[finding.severity],
                  }}
                >
                  {finding.severity.toUpperCase()}
                </span>
                <ArrowUpRight className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue: string;
  color: string;
}) {
  return (
    <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-4">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color + '20', color }}
        >
          {icon}
        </div>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-gray-500 text-sm">{subValue}</p>
    </div>
  );
}
