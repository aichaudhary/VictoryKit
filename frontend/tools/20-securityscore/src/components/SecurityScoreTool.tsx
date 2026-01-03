/**
 * SecurityScore Tool Component v2.0 - Enhanced Security Posture Scoring
 */
import { useState, useEffect, useCallback } from 'react';
import {
  securityScoreApi,
  simulatedData,
  type ScoreDashboard,
  type ScoreCategory,
  type AIAnalysis,
  type ComplianceStatus,
  type VulnerabilitySummary,
  type PredictedScore,
  type RiskScenario,
  type Alert
} from '../api/securityscore.api';

type TabType = 'dashboard' | 'breakdown' | 'compliance' | 'predictions' | 'improve' | 'reports';

export default function SecurityScoreTool() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboard, setDashboard] = useState<ScoreDashboard | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilitySummary | null>(null);
  const [predictions, setPredictions] = useState<PredictedScore[]>([]);
  const [riskScenarios, setRiskScenarios] = useState<RiskScenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingSimulated, setUsingSimulated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    loadDashboard();
    // Connect WebSocket for real-time updates
    securityScoreApi.connectWebSocket('org-1');
    securityScoreApi.onScoreUpdate((data) => {
      if (data.score) {
        setDashboard(prev => prev ? { ...prev, currentScore: { ...prev.currentScore, overallScore: data.score } } : prev);
      }
    });
    securityScoreApi.onAlert((alert) => {
      setAlerts(prev => [alert, ...prev.slice(0, 4)]);
    });

    return () => securityScoreApi.disconnectWebSocket();
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [dashResult, aiResult, compResult, vulnResult, predResult, scenarioResult] = await Promise.all([
        securityScoreApi.getDashboard(),
        securityScoreApi.getAIAnalysis({ score: 78 }),
        securityScoreApi.getComplianceStatus({ overall: 78, categories: {} }),
        securityScoreApi.getVulnerabilities('org-1'),
        securityScoreApi.getForecast('org-1', [], 6),
        securityScoreApi.getRiskScenarios('org-1', { overall: 78 })
      ]);

      if (dashResult.success && dashResult.data) {
        setDashboard(dashResult.data);
        setUsingSimulated(false);
      } else {
        setDashboard(simulatedData.dashboard);
        setUsingSimulated(true);
      }

      setAiAnalysis(aiResult.success ? aiResult.data! : simulatedData.aiAnalysis);
      setCompliance(compResult.success ? compResult.data! : simulatedData.complianceStatus);
      setVulnerabilities(vulnResult.success ? vulnResult.data! : simulatedData.vulnerabilities);
      setPredictions(predResult.success && predResult.data ? predResult.data : simulatedData.predictions);
      setRiskScenarios(scenarioResult.success && scenarioResult.data ? scenarioResult.data : simulatedData.riskScenarios);
      setAlerts(simulatedData.dashboard.alerts || []);
    } catch {
      setDashboard(simulatedData.dashboard);
      setAiAnalysis(simulatedData.aiAnalysis);
      setCompliance(simulatedData.complianceStatus);
      setVulnerabilities(simulatedData.vulnerabilities);
      setPredictions(simulatedData.predictions);
      setRiskScenarios(simulatedData.riskScenarios);
      setAlerts(simulatedData.dashboard.alerts || []);
      setUsingSimulated(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper functions
  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: 'text-green-400 bg-green-900/30 border-green-500/30',
      B: 'text-cyan-400 bg-cyan-900/30 border-cyan-500/30',
      C: 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30',
      D: 'text-orange-400 bg-orange-900/30 border-orange-500/30',
      F: 'text-red-400 bg-red-900/30 border-red-500/30'
    };
    return colors[grade] || 'text-gray-400 bg-gray-900/30 border-gray-500/30';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-cyan-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-cyan-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'text-green-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  // Dashboard Tab
  const renderDashboard = () => {
    if (!dashboard) return <div className="text-gray-400">Loading...</div>;
    const { currentScore } = dashboard;

    return (
      <div className="space-y-6">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border flex items-center justify-between ${
                  alert.type === 'critical' ? 'bg-red-900/20 border-red-500/30' :
                  alert.type === 'warning' ? 'bg-yellow-900/20 border-yellow-500/30' :
                  'bg-blue-900/20 border-blue-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{alert.type === 'critical' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                  <div>
                    <p className={`font-medium ${alert.type === 'critical' ? 'text-red-400' : alert.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'}`}>
                      {alert.message}
                    </p>
                    <p className="text-gray-500 text-sm">{alert.category}</p>
                  </div>
                </div>
                <button className="text-gray-500 hover:text-white" onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Main Score Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Gauge */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/20 flex flex-col items-center justify-center">
            <p className="text-gray-400 text-sm mb-4">Overall Security Score</p>
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#374151" strokeWidth="12" />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke={currentScore.overallScore >= 80 ? '#10b981' : currentScore.overallScore >= 60 ? '#06b6d4' : currentScore.overallScore >= 40 ? '#eab308' : '#ef4444'}
                  strokeWidth="12"
                  strokeDasharray={`${currentScore.overallScore * 2.64} 264`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${getScoreColor(currentScore.overallScore)}`}>{currentScore.overallScore}</span>
                <span className="text-gray-500 text-sm">/ 100</span>
              </div>
            </div>
            <div className={`mt-4 px-6 py-2 rounded-lg text-2xl font-bold border ${getGradeColor(currentScore.grade)}`}>
              Grade {currentScore.grade}
            </div>
            <p className="text-gray-500 text-sm mt-2">
              {currentScore.benchmarkComparison.percentile}th percentile in industry
            </p>
          </div>

          {/* Category Breakdown */}
          <div className="lg:col-span-2 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Security Categories</h3>
              <span className="text-gray-500 text-sm">Click for details</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentScore.categories.map((cat: ScoreCategory) => (
                <div
                  key={cat.name}
                  onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedCategory === cat.name ? 'bg-cyan-900/30 border border-cyan-500/50' : 'bg-gray-900/50 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 font-medium">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${getTrendColor(cat.trend)}`}>
                        {getTrendIcon(cat.trend)} {cat.change !== 0 && (cat.change! > 0 ? '+' : '')}{cat.change}
                      </span>
                      <span className={`font-bold ${getScoreColor(cat.score)}`}>{cat.score}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getScoreBgColor(cat.score)}`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  {selectedCategory === cat.name && (
                    <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-4 gap-2 text-center">
                      <div><span className="text-red-400 font-bold">{cat.findings.critical}</span><p className="text-xs text-gray-500">Critical</p></div>
                      <div><span className="text-orange-400 font-bold">{cat.findings.high}</span><p className="text-xs text-gray-500">High</p></div>
                      <div><span className="text-yellow-400 font-bold">{cat.findings.medium}</span><p className="text-xs text-gray-500">Medium</p></div>
                      <div><span className="text-green-400 font-bold">{cat.findings.low}</span><p className="text-xs text-gray-500">Low</p></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benchmark Comparison */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">vs Industry Average</p>
            <p className={`text-2xl font-bold ${currentScore.overallScore >= currentScore.benchmarkComparison.industry ? 'text-green-400' : 'text-red-400'}`}>
              {currentScore.overallScore >= currentScore.benchmarkComparison.industry ? '+' : ''}{currentScore.overallScore - currentScore.benchmarkComparison.industry} pts
            </p>
            <p className="text-gray-500 text-xs mt-1">Industry avg: {currentScore.benchmarkComparison.industry}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">vs Peer Group</p>
            <p className={`text-2xl font-bold ${currentScore.overallScore >= currentScore.benchmarkComparison.peers ? 'text-green-400' : 'text-red-400'}`}>
              {currentScore.overallScore >= currentScore.benchmarkComparison.peers ? '+' : ''}{currentScore.overallScore - currentScore.benchmarkComparison.peers} pts
            </p>
            <p className="text-gray-500 text-xs mt-1">Peer avg: {currentScore.benchmarkComparison.peers}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">vs Previous Month</p>
            <p className={`text-2xl font-bold ${currentScore.overallScore >= currentScore.benchmarkComparison.previous ? 'text-green-400' : 'text-red-400'}`}>
              {currentScore.overallScore >= currentScore.benchmarkComparison.previous ? '+' : ''}{currentScore.overallScore - currentScore.benchmarkComparison.previous} pts
            </p>
            <p className="text-gray-500 text-xs mt-1">Previous: {currentScore.benchmarkComparison.previous}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Industry Percentile</p>
            <p className="text-2xl font-bold text-cyan-400">{currentScore.benchmarkComparison.percentile}th</p>
            <p className="text-gray-500 text-xs mt-1">Top {100 - (currentScore.benchmarkComparison.percentile || 0)}%</p>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Score Trend (6 Months)</h3>
          <div className="flex items-end justify-between h-40 gap-2">
            {currentScore.trend.map((point, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-t transition-all ${getScoreBgColor(point.score)}`}
                  style={{ height: `${point.score * 1.4}px` }}
                />
                <span className="text-xs text-gray-500 mt-2">{point.date.split('-')[1]}</span>
                <span className={`text-xs ${point.change && point.change > 0 ? 'text-green-400' : point.change && point.change < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {point.change !== undefined && point.change !== 0 && (point.change > 0 ? '+' : '')}{point.change || ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Vulnerabilities Overview */}
        {vulnerabilities && (
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Vulnerability Summary</h3>
              <span className={`px-2 py-1 rounded text-sm ${
                vulnerabilities.trend === 'improving' ? 'bg-green-900/30 text-green-400' :
                vulnerabilities.trend === 'worsening' ? 'bg-red-900/30 text-red-400' :
                'bg-gray-900/30 text-gray-400'
              }`}>
                {vulnerabilities.trend === 'improving' ? '↓ Improving' : vulnerabilities.trend === 'worsening' ? '↑ Worsening' : '→ Stable'}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                <p className="text-3xl font-bold text-red-400">{vulnerabilities.critical}</p>
                <p className="text-gray-500 text-sm">Critical</p>
              </div>
              <div className="text-center p-3 bg-orange-900/20 rounded-lg border border-orange-500/30">
                <p className="text-3xl font-bold text-orange-400">{vulnerabilities.high}</p>
                <p className="text-gray-500 text-sm">High</p>
              </div>
              <div className="text-center p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                <p className="text-3xl font-bold text-yellow-400">{vulnerabilities.medium}</p>
                <p className="text-gray-500 text-sm">Medium</p>
              </div>
              <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                <p className="text-3xl font-bold text-green-400">{vulnerabilities.low}</p>
                <p className="text-gray-500 text-sm">Low</p>
              </div>
              <div className="text-center p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <p className="text-3xl font-bold text-cyan-400">{vulnerabilities.mttr}</p>
                <p className="text-gray-500 text-sm">MTTR (days)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Category Breakdown Tab
  const renderBreakdown = () => {
    if (!dashboard || !aiAnalysis) return null;
    const { currentScore } = dashboard;

    return (
      <div className="space-y-6">
        {/* AI Analysis Summary */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 rounded-xl p-6 border border-cyan-500/30">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🤖</span>
            <h3 className="text-white font-semibold">AI Security Analysis</h3>
            <span className="px-2 py-1 rounded text-sm bg-cyan-900/50 text-cyan-400">
              {Math.round(aiAnalysis.confidence * 100)}% confidence
            </span>
          </div>
          <p className="text-gray-300 leading-relaxed">{aiAnalysis.overview}</p>
          <div className="mt-4 flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              aiAnalysis.riskLevel === 'Critical' ? 'bg-red-900/50 text-red-400' :
              aiAnalysis.riskLevel === 'High' ? 'bg-orange-900/50 text-orange-400' :
              aiAnalysis.riskLevel === 'Medium' ? 'bg-yellow-900/50 text-yellow-400' :
              'bg-green-900/50 text-green-400'
            }`}>
              {aiAnalysis.riskLevel} Risk
            </span>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-green-500/30">
            <h3 className="text-green-400 font-semibold mb-4 flex items-center gap-2">
              <span>✓</span> Strengths
            </h3>
            <ul className="space-y-3">
              {aiAnalysis.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-green-400">•</span>
                  <span className="text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-red-500/30">
            <h3 className="text-red-400 font-semibold mb-4 flex items-center gap-2">
              <span>!</span> Areas for Improvement
            </h3>
            <ul className="space-y-3">
              {aiAnalysis.weaknesses.map((weakness, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-red-400">•</span>
                  <span className="text-gray-300">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Detailed Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentScore.categories.map((cat: ScoreCategory) => (
            <div key={cat.name} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">{cat.name}</h4>
                <span className={`text-xl font-bold ${getScoreColor(cat.score)}`}>{cat.score}</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
                <div className={`h-full rounded-full ${getScoreBgColor(cat.score)}`} style={{ width: `${cat.score}%` }} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Weight: {Math.round(cat.weight * 100)}%</span>
                <span className={getTrendColor(cat.trend)}>
                  {getTrendIcon(cat.trend)} {cat.change !== 0 && (cat.change! > 0 ? '+' : '')}{cat.change} pts
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex justify-between text-xs">
                  <span className="text-red-400">{cat.findings.critical} Critical</span>
                  <span className="text-orange-400">{cat.findings.high} High</span>
                  <span className="text-yellow-400">{cat.findings.medium} Med</span>
                  <span className="text-green-400">{cat.findings.low} Low</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Compliance Tab
  const renderCompliance = () => {
    if (!compliance) return null;

    return (
      <div className="space-y-6">
        {/* Overall Compliance */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Compliance Overview</h3>
            <span className={`text-3xl font-bold ${getScoreColor(compliance.overallCompliance)}`}>
              {compliance.overallCompliance}%
            </span>
          </div>
          <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${getScoreBgColor(compliance.overallCompliance)}`}
              style={{ width: `${compliance.overallCompliance}%` }}
            />
          </div>
        </div>

        {/* Framework Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {compliance.frameworks.map((fw) => (
            <div
              key={fw.id}
              onClick={() => setSelectedFramework(selectedFramework === fw.id ? null : fw.id)}
              className={`p-5 rounded-xl cursor-pointer transition-all ${
                selectedFramework === fw.id
                  ? 'bg-cyan-900/30 border border-cyan-500/50'
                  : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">{fw.name}</h4>
                <span className={`font-bold ${getScoreColor(fw.compliance)}`}>{fw.compliance}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
                <div className={`h-full rounded-full ${getScoreBgColor(fw.compliance)}`} style={{ width: `${fw.compliance}%` }} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{fw.controlsSatisfied}/{fw.totalControls} controls</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  fw.status.includes('Fully') ? 'bg-green-900/30 text-green-400' :
                  fw.status.includes('Substantially') ? 'bg-cyan-900/30 text-cyan-400' :
                  'bg-yellow-900/30 text-yellow-400'
                }`}>{fw.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance Gaps */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Priority Compliance Gaps</h3>
          <div className="space-y-3">
            {compliance.gaps.map((gap, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    gap.priority === 'High' ? 'bg-red-900/30 text-red-400' :
                    gap.priority === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-green-900/30 text-green-400'
                  }`}>{gap.priority}</span>
                  <div>
                    <p className="text-white">{gap.framework} - {gap.control}</p>
                    <p className="text-gray-500 text-sm capitalize">{gap.category}</p>
                  </div>
                </div>
                <span className="text-red-400 font-medium">-{gap.gap} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Predictions Tab
  const renderPredictions = () => {
    return (
      <div className="space-y-6">
        {/* Score Forecast */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">6-Month Score Forecast</h3>
          <div className="flex items-end justify-between h-48 gap-3">
            {predictions.map((pred, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full relative">
                  {/* Confidence interval */}
                  <div
                    className="w-full bg-cyan-900/20 rounded-t absolute bottom-0"
                    style={{
                      height: `${(pred.confidenceInterval.upper - pred.confidenceInterval.lower) * 2}px`,
                      bottom: `${pred.confidenceInterval.lower * 2 - 80}px`
                    }}
                  />
                  {/* Predicted score */}
                  <div
                    className="w-full bg-cyan-500 rounded-t relative"
                    style={{ height: `${pred.predictedScore * 2 - 40}px` }}
                  />
                </div>
                <span className="text-sm font-medium text-cyan-400 mt-2">{pred.predictedScore}</span>
                <span className="text-xs text-gray-500">{pred.date.split('-')[1]}</span>
                <span className="text-xs text-gray-600">{Math.round(pred.confidence * 100)}%</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded" />
              <span className="text-gray-400">Predicted Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-900/50 rounded" />
              <span className="text-gray-400">Confidence Interval</span>
            </div>
          </div>
        </div>

        {/* Risk Scenarios */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Risk Scenarios Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {riskScenarios.map((scenario) => (
              <div
                key={scenario.name}
                className={`p-4 rounded-xl border ${
                  scenario.name === 'Best Case' ? 'bg-green-900/20 border-green-500/30' :
                  scenario.name === 'Expected' ? 'bg-cyan-900/20 border-cyan-500/30' :
                  scenario.name === 'Worst Case' ? 'bg-orange-900/20 border-orange-500/30' :
                  'bg-red-900/20 border-red-500/30'
                }`}
              >
                <h4 className="text-white font-medium mb-2">{scenario.name}</h4>
                <p className={`text-3xl font-bold mb-2 ${
                  scenario.name === 'Best Case' ? 'text-green-400' :
                  scenario.name === 'Expected' ? 'text-cyan-400' :
                  scenario.name === 'Worst Case' ? 'text-orange-400' :
                  'text-red-400'
                }`}>{scenario.projectedScore}</p>
                <p className="text-gray-500 text-sm mb-3">{Math.round(scenario.probability * 100)}% probability</p>
                <p className="text-gray-400 text-xs">{scenario.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Improvements Tab
  const renderImprovements = () => {
    if (!dashboard || !aiAnalysis) return null;

    return (
      <div className="space-y-6">
        {/* AI Recommendations */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 rounded-xl p-6 border border-cyan-500/30">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🤖</span>
            <h3 className="text-white font-semibold">AI-Powered Recommendations</h3>
          </div>
          <div className="space-y-4">
            {aiAnalysis.recommendations.map((rec, i) => (
              <div key={i} className="p-4 bg-gray-900/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white ${
                    rec.priority === 'Critical' ? 'bg-red-600' :
                    rec.priority === 'High' ? 'bg-orange-600' :
                    rec.priority === 'Medium' ? 'bg-yellow-600' :
                    'bg-green-600'
                  }`}>
                    +{rec.estimatedImprovement}
                  </div>
                  <div>
                    <p className="text-white font-medium">{rec.action}</p>
                    <p className="text-gray-500 text-sm">{rec.category} • {rec.impact} Impact • {rec.effort} Effort</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  rec.priority === 'Critical' ? 'bg-red-900/50 text-red-400' :
                  rec.priority === 'High' ? 'bg-orange-900/50 text-orange-400' :
                  rec.priority === 'Medium' ? 'bg-yellow-900/50 text-yellow-400' :
                  'bg-green-900/50 text-green-400'
                }`}>{rec.priority}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Wins */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Prioritized Improvements</h3>
          <div className="space-y-3">
            {dashboard.improvements.map((imp, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold">
                    +{imp.impact}
                  </div>
                  <div>
                    <p className="text-white">{imp.action}</p>
                    <p className="text-gray-500 text-sm">{imp.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-sm ${
                    imp.effort === 'Low' ? 'bg-green-900/30 text-green-400' :
                    imp.effort === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>{imp.effort} Effort</span>
                  {imp.priority && (
                    <span className={`px-2 py-1 rounded text-sm ${
                      imp.priority === 'Critical' ? 'bg-red-900/30 text-red-400' :
                      imp.priority === 'High' ? 'bg-orange-900/30 text-orange-400' :
                      'bg-yellow-900/30 text-yellow-400'
                    }`}>{imp.priority}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Reports Tab
  const renderReports = () => {
    const reportTypes = [
      { id: 'executive_summary', name: 'Executive Summary', icon: '📋', desc: 'High-level overview for leadership' },
      { id: 'detailed_assessment', name: 'Detailed Assessment', icon: '📊', desc: 'Comprehensive security analysis' },
      { id: 'benchmark_comparison', name: 'Benchmark Report', icon: '📈', desc: 'Industry and peer comparison' },
      { id: 'compliance_mapping', name: 'Compliance Report', icon: '✓', desc: 'Framework compliance status' },
      { id: 'trend_analysis', name: 'Trend Analysis', icon: '📉', desc: 'Historical trends and predictions' }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Generate Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => (
              <button
                key={report.id}
                onClick={async () => {
                  const result = await securityScoreApi.generateReport(report.id, {
                    score: dashboard?.currentScore,
                    organization: 'Demo Organization'
                  }, { format: 'pdf' });
                  if (result.success) {
                    alert(`Report generated: ${result.data?.filename}`);
                  }
                }}
                className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{report.icon}</span>
                  <h4 className="text-white font-medium">{report.name}</h4>
                </div>
                <p className="text-gray-500 text-sm">{report.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Export Data</h3>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors">
              📄 Export PDF
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors">
              📊 Export Excel
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors">
              📦 Export JSON
            </button>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: '🎯' },
    { id: 'breakdown' as TabType, label: 'Analysis', icon: '📊' },
    { id: 'compliance' as TabType, label: 'Compliance', icon: '✓' },
    { id: 'predictions' as TabType, label: 'Forecast', icon: '🔮' },
    { id: 'improve' as TabType, label: 'Improve', icon: '🚀' },
    { id: 'reports' as TabType, label: 'Reports', icon: '📋' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-cyan-950 text-white">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center text-xl">
                🎯
              </div>
              <div>
                <h1 className="text-xl font-bold">SecurityScore</h1>
                <p className="text-gray-400 text-sm">Enterprise Security Posture Scoring</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {usingSimulated && (
                <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-500/30 text-yellow-400 rounded-full text-sm">
                  🔄 Demo Mode
                </span>
              )}
              <button
                onClick={loadDashboard}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors flex items-center gap-2"
              >
                <span>↻</span> Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && activeTab === 'dashboard' && renderDashboard()}
        {!loading && activeTab === 'breakdown' && renderBreakdown()}
        {!loading && activeTab === 'compliance' && renderCompliance()}
        {!loading && activeTab === 'predictions' && renderPredictions()}
        {!loading && activeTab === 'improve' && renderImprovements()}
        {!loading && activeTab === 'reports' && renderReports()}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          SecurityScore Tool 20 v2.0 • VictoryKit Security Platform • Real-time Security Posture Scoring
        </div>
      </footer>
    </div>
  );
}
