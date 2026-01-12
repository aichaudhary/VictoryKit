import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  Lock,
  Globe,
  Database,
  Server,
  Wifi,
  Mail,
  Key,
  FileWarning,
  Clock,
  RefreshCw,
  ChevronRight,
  Zap,
  Target,
  BarChart3,
} from 'lucide-react';

interface SecurityMetric {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
  description: string;
  details: string[];
  recommendations: string[];
}

interface SecurityEvent {
  id: string;
  type: 'breach' | 'leak' | 'threat' | 'scan';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const calculateOverallScore = (metrics: SecurityMetric[]): number => {
  const totalScore = metrics.reduce((acc, m) => acc + m.score, 0);
  const maxScore = metrics.reduce((acc, m) => acc + m.maxScore, 0);
  return Math.round((totalScore / maxScore) * 100);
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
};

const getScoreGradient = (score: number): string => {
  if (score >= 80) return 'from-green-500 to-emerald-600';
  if (score >= 60) return 'from-yellow-500 to-orange-500';
  if (score >= 40) return 'from-orange-500 to-red-500';
  return 'from-red-500 to-red-700';
};

const getScoreBg = (score: number): string => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

const StatusIcon: React.FC<{ status: 'good' | 'warning' | 'critical' }> = ({ status }) => {
  switch (status) {
    case 'good':
      return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    case 'critical':
      return <XCircle className="w-5 h-5 text-red-400" />;
  }
};

export const SecurityScoreDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetric[]>([
    {
      id: 'breach-exposure',
      name: 'Breach Exposure',
      score: 75,
      maxScore: 100,
      status: 'warning',
      icon: <Database className="w-5 h-5" />,
      description: 'Email found in 2 breaches',
      details: [
        'LinkedIn breach (2021) - Email exposed',
        'Adobe breach (2013) - Email & password exposed',
      ],
      recommendations: [
        'Change passwords for affected accounts',
        'Enable 2FA on LinkedIn and Adobe',
      ],
    },
    {
      id: 'credential-security',
      name: 'Credential Security',
      score: 60,
      maxScore: 100,
      status: 'warning',
      icon: <Key className="w-5 h-5" />,
      description: '1 weak password detected',
      details: [
        'Password reuse detected across 3 accounts',
        '1 password found in common password lists',
      ],
      recommendations: ['Use a password manager', 'Generate unique passwords for each account'],
    },
    {
      id: 'dark-web-presence',
      name: 'Dark Web Presence',
      score: 90,
      maxScore: 100,
      status: 'good',
      icon: <Eye className="w-5 h-5" />,
      description: 'Minimal dark web exposure',
      details: ['No recent mentions in dark web forums', 'No credentials listed for sale'],
      recommendations: ['Continue monitoring for new mentions'],
    },
    {
      id: 'domain-security',
      name: 'Domain Security',
      score: 85,
      maxScore: 100,
      status: 'good',
      icon: <Globe className="w-5 h-5" />,
      description: 'Domain properly configured',
      details: ['SSL certificate valid', 'DMARC record configured', 'SPF record present'],
      recommendations: ['Consider DNSSEC implementation'],
    },
    {
      id: 'threat-intelligence',
      name: 'Threat Intelligence',
      score: 70,
      maxScore: 100,
      status: 'warning',
      icon: <Target className="w-5 h-5" />,
      description: '3 active threats in your sector',
      details: [
        'Ransomware campaign targeting your industry',
        'APT group activity detected',
        'Phishing kit impersonating similar domains',
      ],
      recommendations: [
        'Review and update security policies',
        'Conduct security awareness training',
      ],
    },
    {
      id: 'monitoring-coverage',
      name: 'Monitoring Coverage',
      score: 95,
      maxScore: 100,
      status: 'good',
      icon: <Activity className="w-5 h-5" />,
      description: 'Comprehensive monitoring active',
      details: [
        '4 assets being monitored',
        'Real-time alerts enabled',
        'Daily scan schedule configured',
      ],
      recommendations: ['Add API keys and secrets to monitoring'],
    },
  ]);

  const [events, setEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'scan',
      message: 'Daily security scan completed',
      timestamp: new Date(),
      severity: 'low',
    },
    {
      id: '2',
      type: 'breach',
      message: 'Email found in new data breach',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      severity: 'high',
    },
    {
      id: '3',
      type: 'threat',
      message: 'New ransomware variant detected in your industry',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      severity: 'medium',
    },
    {
      id: '4',
      type: 'leak',
      message: 'Credential monitoring: No new leaks found',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      severity: 'low',
    },
  ]);

  const [selectedMetric, setSelectedMetric] = useState<SecurityMetric | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const overallScore = calculateOverallScore(metrics);
  const previousScore = 72; // Mock previous score
  const scoreTrend = overallScore - previousScore;

  const handleRescan = async () => {
    setIsScanning(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Simulate score changes
    setMetrics((prev) =>
      prev.map((m) => ({
        ...m,
        score: Math.min(100, Math.max(0, m.score + Math.floor(Math.random() * 10) - 5)),
      }))
    );

    setIsScanning(false);
  };

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Security Score</h2>
            <p className="text-gray-400">Overall security posture assessment</p>
          </div>
          <button
            onClick={handleRescan}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm hover:border-slate-500/50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Rescan'}
          </button>
        </div>

        <div className="flex items-center gap-8">
          {/* Score Circle */}
          <div className="relative">
            <svg className="w-40 h-40 -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-slate-700"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(overallScore / 100) * 440} 440`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop
                    offset="0%"
                    className={getScoreColor(overallScore).replace('text-', 'stop-')}
                  />
                  <stop
                    offset="100%"
                    className={getScoreColor(overallScore).replace('text-', 'stop-')}
                  />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}
              </span>
              <span className="text-gray-400 text-sm">/ 100</span>
            </div>
          </div>

          {/* Score Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  overallScore >= 80
                    ? 'bg-green-500/20 text-green-400'
                    : overallScore >= 60
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : overallScore >= 40
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-red-500/20 text-red-400'
                }`}
              >
                {overallScore >= 80
                  ? 'EXCELLENT'
                  : overallScore >= 60
                    ? 'GOOD'
                    : overallScore >= 40
                      ? 'FAIR'
                      : 'POOR'}
              </span>
              <div
                className={`flex items-center gap-1 text-sm ${
                  scoreTrend >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {scoreTrend >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {Math.abs(scoreTrend)} points from last scan
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-400 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-2xl font-bold">
                    {metrics.filter((m) => m.status === 'good').length}
                  </span>
                </div>
                <span className="text-xs text-gray-400">Good</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-400 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-2xl font-bold">
                    {metrics.filter((m) => m.status === 'warning').length}
                  </span>
                </div>
                <span className="text-xs text-gray-400">Warnings</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-400 mb-1">
                  <XCircle className="w-4 h-4" />
                  <span className="text-2xl font-bold">
                    {metrics.filter((m) => m.status === 'critical').length}
                  </span>
                </div>
                <span className="text-xs text-gray-400">Critical</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            onClick={() => setSelectedMetric(metric)}
            className={`bg-slate-800/50 rounded-xl border p-5 cursor-pointer transition-all hover:border-slate-600/50 ${
              metric.status === 'critical'
                ? 'border-red-500/30'
                : metric.status === 'warning'
                  ? 'border-yellow-500/30'
                  : 'border-slate-700/50'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    metric.status === 'good'
                      ? 'bg-green-500/20 text-green-400'
                      : metric.status === 'warning'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {metric.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{metric.name}</h3>
                  <p className="text-xs text-gray-400">{metric.description}</p>
                </div>
              </div>
              <StatusIcon status={metric.status} />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      metric.status === 'good'
                        ? 'bg-green-500'
                        : metric.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${(metric.score / metric.maxScore) * 100}%` }}
                  />
                </div>
              </div>
              <span
                className={`text-lg font-bold ${
                  metric.status === 'good'
                    ? 'text-green-400'
                    : metric.status === 'warning'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                }`}
              >
                {metric.score}
              </span>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
              <span className="text-xs text-gray-500">
                {metric.recommendations.length} recommendation
                {metric.recommendations.length !== 1 ? 's' : ''}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">Recent Security Events</h3>
        </div>
        <div className="divide-y divide-slate-700/50">
          {events.map((event) => (
            <div key={event.id} className="p-4 flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  event.severity === 'critical'
                    ? 'bg-red-500/20'
                    : event.severity === 'high'
                      ? 'bg-orange-500/20'
                      : event.severity === 'medium'
                        ? 'bg-yellow-500/20'
                        : 'bg-blue-500/20'
                }`}
              >
                {event.type === 'breach' ? (
                  <Database
                    className={`w-5 h-5 ${
                      event.severity === 'critical'
                        ? 'text-red-400'
                        : event.severity === 'high'
                          ? 'text-orange-400'
                          : 'text-yellow-400'
                    }`}
                  />
                ) : event.type === 'leak' ? (
                  <Key className="w-5 h-5 text-purple-400" />
                ) : event.type === 'threat' ? (
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      event.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'
                    }`}
                  />
                ) : (
                  <Activity className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">{event.message}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {event.timestamp.toLocaleString()}
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  event.severity === 'critical'
                    ? 'bg-red-500/20 text-red-400'
                    : event.severity === 'high'
                      ? 'bg-orange-500/20 text-orange-400'
                      : event.severity === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                }`}
              >
                {event.severity.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Metric Detail Modal */}
      {selectedMetric && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedMetric.status === 'good'
                        ? 'bg-green-500/20 text-green-400'
                        : selectedMetric.status === 'warning'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {selectedMetric.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedMetric.name}</h3>
                    <p className="text-sm text-gray-400">{selectedMetric.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMetric(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Score */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Score</span>
                  <span
                    className={`text-2xl font-bold ${
                      selectedMetric.status === 'good'
                        ? 'text-green-400'
                        : selectedMetric.status === 'warning'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                    }`}
                  >
                    {selectedMetric.score} / {selectedMetric.maxScore}
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      selectedMetric.status === 'good'
                        ? 'bg-green-500'
                        : selectedMetric.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${(selectedMetric.score / selectedMetric.maxScore) * 100}%` }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Details</h4>
                <ul className="space-y-2">
                  {selectedMetric.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-gray-600 mt-1">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {selectedMetric.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-green-400">
                      <CheckCircle2 className="w-4 h-4 mt-0.5" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityScoreDashboard;
