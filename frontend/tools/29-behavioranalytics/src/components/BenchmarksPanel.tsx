import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  ArrowUp,
  ArrowDown,
  Target,
  Award,
  Users,
  Info,
} from 'lucide-react';
import type { Industry, Benchmark, FactorBenchmark } from '../types';
import { INDUSTRIES, RISK_FACTORS, GRADE_COLORS, getGradeFromScore } from '../constants';

// Mock data
const mockBenchmark: Benchmark = {
  organization_id: 'org-1',
  industry: 'technology',
  size: 'enterprise',
  organization_score: 78,
  industry_average: 72,
  industry_median: 74,
  percentile: 68,
  top_quartile_threshold: 85,
  peer_count: 1247,
  calculated_at: '2024-03-15',
  factor_benchmarks: [
    { factor_id: 'network_security', name: 'Network Security', organization_score: 72, industry_average: 68, percentile: 62 },
    { factor_id: 'patching_cadence', name: 'Patching Cadence', organization_score: 58, industry_average: 65, percentile: 38 },
    { factor_id: 'endpoint_security', name: 'Endpoint Security', organization_score: 85, industry_average: 70, percentile: 78 },
    { factor_id: 'dns_health', name: 'DNS Health', organization_score: 91, industry_average: 82, percentile: 85 },
    { factor_id: 'application_security', name: 'Application Security', organization_score: 68, industry_average: 66, percentile: 55 },
    { factor_id: 'ip_reputation', name: 'IP Reputation', organization_score: 82, industry_average: 75, percentile: 70 },
    { factor_id: 'hacker_chatter', name: 'Hacker Chatter', organization_score: 95, industry_average: 88, percentile: 82 },
    { factor_id: 'leaked_credentials', name: 'Leaked Credentials', organization_score: 65, industry_average: 60, percentile: 58 },
    { factor_id: 'social_engineering', name: 'Social Engineering', organization_score: 78, industry_average: 72, percentile: 65 },
    { factor_id: 'information_disclosure', name: 'Information Disclosure', organization_score: 88, industry_average: 80, percentile: 75 },
  ],
};

const peerComparison = [
  { name: 'Your Organization', score: 78, isYou: true },
  { name: 'Peer Average', score: 72, isYou: false },
  { name: 'Industry Leader', score: 94, isYou: false },
  { name: 'Top Quartile', score: 85, isYou: false },
];

export function BenchmarksPanel() {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>('technology');
  const benchmark = mockBenchmark;

  const aboveAverage = benchmark.organization_score > benchmark.industry_average;
  const scoreDiff = benchmark.organization_score - benchmark.industry_average;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-amber-500" />
            Industry Benchmarks
          </h1>
          <p className="text-gray-400 mt-1">Compare your security posture against industry peers</p>
        </div>
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value as Industry)}
          className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
        >
          {INDUSTRIES.map((ind) => (
            <option key={ind.value} value={ind.value}>
              {ind.label}
            </option>
          ))}
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-gray-400 text-sm">Your Score</span>
          </div>
          <p className="text-3xl font-bold text-white">{benchmark.organization_score}</p>
          <p className="text-gray-500 text-sm mt-1">
            Grade: <span style={{ color: GRADE_COLORS[getGradeFromScore(benchmark.organization_score)] }}>
              {getGradeFromScore(benchmark.organization_score)}
            </span>
          </p>
        </div>

        <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-gray-400 text-sm">Industry Average</span>
          </div>
          <p className="text-3xl font-bold text-white">{benchmark.industry_average}</p>
          <div className="flex items-center gap-1 mt-1">
            {aboveAverage ? (
              <>
                <ArrowUp className="w-4 h-4 text-green-500" />
                <span className="text-green-500 text-sm">+{scoreDiff} above</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-4 h-4 text-red-500" />
                <span className="text-red-500 text-sm">{scoreDiff} below</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-gray-400 text-sm">Percentile</span>
          </div>
          <p className="text-3xl font-bold text-white">{benchmark.percentile}<span className="text-lg text-gray-400">th</span></p>
          <p className="text-gray-500 text-sm mt-1">Better than {benchmark.percentile}% of peers</p>
        </div>

        <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-gray-400 text-sm">Peer Count</span>
          </div>
          <p className="text-3xl font-bold text-white">{benchmark.peer_count.toLocaleString()}</p>
          <p className="text-gray-500 text-sm mt-1">Organizations in benchmark</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Peer Comparison Chart */}
        <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Peer Comparison</h3>
          <div className="space-y-4">
            {peerComparison.map((peer, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className={peer.isYou ? 'text-amber-500 font-medium' : 'text-gray-400'}>
                    {peer.name}
                  </span>
                  <span className={peer.isYou ? 'text-amber-500 font-bold' : 'text-white font-medium'}>
                    {peer.score}
                  </span>
                </div>
                <div className="w-full bg-[#2A2A2F] rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      peer.isYou ? 'bg-amber-500' : 'bg-gray-600'
                    }`}
                    style={{ width: `${peer.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-[#252529] rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-sm font-medium">Path to Top Quartile</p>
              <p className="text-gray-400 text-sm mt-1">
                Improve your score by {benchmark.top_quartile_threshold - benchmark.organization_score} points 
                to reach the top 25% of organizations in your industry.
              </p>
            </div>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Industry Score Distribution</h3>
          <div className="relative h-48">
            {/* Distribution Curve Visualization */}
            <svg className="w-full h-full" viewBox="0 0 400 150">
              {/* Background grid */}
              <line x1="0" y1="130" x2="400" y2="130" stroke="#2A2A2F" strokeWidth="1" />
              
              {/* Bell curve */}
              <path
                d="M 20 130 Q 100 130 150 100 Q 200 20 250 100 Q 300 130 380 130"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
              />
              <path
                d="M 20 130 Q 100 130 150 100 Q 200 20 250 100 Q 300 130 380 130 L 380 130 L 20 130"
                fill="url(#gradient)"
                opacity="0.2"
              />
              
              {/* Your position marker */}
              <line x1="272" y1="85" x2="272" y2="130" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4" />
              <circle cx="272" cy="85" r="6" fill="#F59E0B" />
              
              {/* Average marker */}
              <line x1="200" y1="20" x2="200" y2="130" stroke="#6B7280" strokeWidth="1" strokeDasharray="4" />
              
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-4">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-gray-400 text-sm">Your Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-gray-400 text-sm">Industry Average</span>
            </div>
          </div>
        </div>
      </div>

      {/* Factor-by-Factor Comparison */}
      <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Factor-by-Factor Comparison</h3>
        <div className="space-y-4">
          {benchmark.factor_benchmarks.map((factor) => {
            const diff = factor.organization_score - factor.industry_average;
            const isAbove = diff > 0;

            return (
              <div key={factor.factor_id} className="flex items-center gap-4">
                <div className="w-48 text-gray-400 text-sm">{factor.name}</div>
                
                <div className="flex-1 flex items-center gap-4">
                  {/* Your Score Bar */}
                  <div className="flex-1 relative">
                    <div className="w-full bg-[#2A2A2F] rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{
                          width: `${factor.organization_score}%`,
                          backgroundColor: GRADE_COLORS[getGradeFromScore(factor.organization_score)],
                        }}
                      />
                    </div>
                    {/* Industry Average Marker */}
                    <div
                      className="absolute top-0 w-0.5 h-3 bg-white/50"
                      style={{ left: `${factor.industry_average}%` }}
                    />
                  </div>

                  <div className="w-12 text-right text-white font-medium">
                    {factor.organization_score}
                  </div>

                  <div className="w-20 flex items-center gap-1">
                    {isAbove ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-green-500 text-sm">+{diff}</span>
                      </>
                    ) : diff < 0 ? (
                      <>
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        <span className="text-red-500 text-sm">{diff}</span>
                      </>
                    ) : (
                      <>
                        <Minus className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500 text-sm">0</span>
                      </>
                    )}
                  </div>

                  <div className="w-16 text-right text-gray-500 text-sm">
                    {factor.percentile}th %
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-[#2A2A2F] flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-white/50" />
            <span>Industry Average</span>
          </div>
        </div>
      </div>
    </div>
  );
}
