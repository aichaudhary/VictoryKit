import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Server,
  GitBranch,
  Shield,
  AlertTriangle,
  Activity,
  TrendingUp,
  Clock,
  Zap,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  BarChart3,
  Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import clsx from 'clsx';
import apiService from '../services/api';
import { useAPIGuardStore } from '../stores/apiGuardStore';
import type { DashboardStats, RealTimeEvent } from '../types';

const gradeColors: Record<string, string> = {
  'A+': '#10b981',
  'A': '#22c55e',
  'B': '#eab308',
  'C': '#f97316',
  'D': '#ef4444',
  'F': '#dc2626',
};

export default function Dashboard() {
  const { realTimeEvents, liveMode } = useAPIGuardStore();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: stats, refetch } = useQuery({
    queryKey: ['dashboard-stats', refreshKey],
    queryFn: apiService.getDashboardStats,
    refetchInterval: liveMode ? 30000 : false,
  });

  // Simulated dashboard stats for demo
  const dashboardStats: DashboardStats = stats || {
    totalAPIs: 47,
    activeAPIs: 42,
    deprecatedAPIs: 3,
    totalEndpoints: 512,
    avgSecurityScore: 78,
    criticalVulnerabilities: 5,
    highVulnerabilities: 12,
    mediumVulnerabilities: 28,
    lowVulnerabilities: 45,
    openAnomalies: 8,
    activePolicies: 32,
    requestsLast24h: 2847293,
    averageLatency: 124,
    errorRate: 0.42,
    uptime: 99.97,
    gradeDistribution: { 'A+': 8, 'A': 15, 'B': 12, 'C': 7, 'D': 3, 'F': 2 },
    apisByType: [],
    recentAnomalies: [],
    topVulnerabilities: [],
    trafficTrend: [],
  };

  // Generate traffic data
  const trafficData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    requests: Math.floor(Math.random() * 150000) + 50000,
    errors: Math.floor(Math.random() * 500) + 50,
    latency: Math.floor(Math.random() * 50) + 100,
  }));

  // Grade distribution
  const gradeDistribution = [
    { grade: 'A+', count: 8, color: gradeColors['A+'] },
    { grade: 'A', count: 15, color: gradeColors['A'] },
    { grade: 'B', count: 12, color: gradeColors['B'] },
    { grade: 'C', count: 7, color: gradeColors['C'] },
    { grade: 'D', count: 3, color: gradeColors['D'] },
    { grade: 'F', count: 2, color: gradeColors['F'] },
  ];

  // API type distribution
  const typeDistribution = [
    { type: 'REST', count: 32, color: '#3b82f6' },
    { type: 'GraphQL', count: 8, color: '#e535ab' },
    { type: 'gRPC', count: 4, color: '#4285f4' },
    { type: 'WebSocket', count: 2, color: '#22c55e' },
    { type: 'SOAP', count: 1, color: '#f59e0b' },
  ];

  // Recent events from store
  const recentEvents: RealTimeEvent[] = realTimeEvents.slice(0, 10);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'api_request': return <Activity className="w-4 h-4 text-blue-400" />;
      case 'anomaly_detected': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'policy_violation': return <XCircle className="w-4 h-4 text-orange-400" />;
      case 'rate_limit_exceeded': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'scan_complete': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <Zap className="w-4 h-4 text-purple-400" />;
    }
  };

  const getSecurityScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-green-400';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">API Security Dashboard</h2>
          <p className="text-api-muted mt-1">Monitor and protect your API ecosystem</p>
        </div>
        <button
          onClick={() => {
            setRefreshKey(k => k + 1);
            refetch();
          }}
          className="api-btn api-btn-primary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total APIs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="api-card p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-api-muted text-sm">Total APIs</p>
              <p className="text-3xl font-bold text-white mt-1">{dashboardStats.totalAPIs}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-green-400 text-sm">{dashboardStats.activeAPIs} active</span>
                <span className="text-api-muted">•</span>
                <span className="text-yellow-400 text-sm">{dashboardStats.deprecatedAPIs} deprecated</span>
              </div>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Server className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

        {/* Total Endpoints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="api-card p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-api-muted text-sm">Total Endpoints</p>
              <p className="text-3xl font-bold text-white mt-1">{dashboardStats.totalEndpoints}</p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">+24 this week</span>
              </div>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <GitBranch className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </motion.div>

        {/* Security Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="api-card p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-api-muted text-sm">Avg Security Score</p>
              <p className={clsx('text-3xl font-bold mt-1', getSecurityScoreColor(dashboardStats.avgSecurityScore))}>
                {dashboardStats.avgSecurityScore}%
              </p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">+3% from last week</span>
              </div>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        {/* Open Anomalies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="api-card p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-api-muted text-sm">Open Anomalies</p>
              <p className="text-3xl font-bold text-white mt-1">{dashboardStats.openAnomalies}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-red-400 text-sm">{dashboardStats.criticalVulnerabilities} critical</span>
                <span className="text-api-muted">•</span>
                <span className="text-orange-400 text-sm">{dashboardStats.highVulnerabilities} high</span>
              </div>
            </div>
            <div className="p-3 bg-red-500/20 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Requests 24h */}
        <div className="api-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-api-muted text-sm">Requests (24h)</p>
              <p className="text-2xl font-bold text-white mt-1">{formatNumber(dashboardStats.requestsLast24h)}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        {/* Avg Latency */}
        <div className="api-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-api-muted text-sm">Avg Latency</p>
              <p className="text-2xl font-bold text-white mt-1">{dashboardStats.averageLatency}ms</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        {/* Error Rate */}
        <div className="api-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-api-muted text-sm">Error Rate</p>
              <p className="text-2xl font-bold text-white mt-1">{dashboardStats.errorRate}%</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        {/* Uptime */}
        <div className="api-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-api-muted text-sm">Uptime</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{dashboardStats.uptime}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 api-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">API Traffic (24h)</h3>
            <Link to="/analytics" className="text-api-primary hover:text-api-secondary text-sm flex items-center gap-1">
              View Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
                <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af' }} tickFormatter={(v: number) => formatNumber(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#3b82f6"
                  fill="url(#colorRequests)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Security Grade Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="api-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Security Grades</h3>
            <Link to="/apis" className="text-api-primary hover:text-api-secondary text-sm flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value: number) => [value, 'APIs']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {gradeDistribution.map((item) => (
              <div key={item.grade} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-api-muted">{item.grade}: {item.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Type Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="api-card p-5"
        >
          <h3 className="text-lg font-semibold text-white mb-4">API Types</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#6b7280" tick={{ fill: '#9ca3af' }} />
                <YAxis dataKey="type" type="category" stroke="#6b7280" tick={{ fill: '#9ca3af' }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Real-time Events Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="api-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              Live Events
              {liveMode && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
            </h3>
            <span className="text-xs text-api-muted">Last 10 events</span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentEvents.length === 0 ? (
              <div className="text-center py-8 text-api-muted">
                <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No events yet. Enable live mode to see real-time activity.</p>
              </div>
            ) : (
              recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 bg-api-dark rounded-lg"
                >
                  {getEventIcon(event.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{event.message}</p>
                    <p className="text-xs text-api-muted">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Vulnerability Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="api-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Vulnerability Overview</h3>
          <Link to="/security" className="text-api-primary hover:text-api-secondary text-sm flex items-center gap-1">
            Run Scan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-severity-critical/10 border border-severity-critical/30 rounded-xl text-center">
            <p className="text-3xl font-bold text-severity-critical">{dashboardStats.criticalVulnerabilities}</p>
            <p className="text-sm text-api-muted mt-1">Critical</p>
          </div>
          <div className="p-4 bg-severity-high/10 border border-severity-high/30 rounded-xl text-center">
            <p className="text-3xl font-bold text-severity-high">{dashboardStats.highVulnerabilities}</p>
            <p className="text-sm text-api-muted mt-1">High</p>
          </div>
          <div className="p-4 bg-severity-medium/10 border border-severity-medium/30 rounded-xl text-center">
            <p className="text-3xl font-bold text-severity-medium">{dashboardStats.mediumVulnerabilities}</p>
            <p className="text-sm text-api-muted mt-1">Medium</p>
          </div>
          <div className="p-4 bg-severity-low/10 border border-severity-low/30 rounded-xl text-center">
            <p className="text-3xl font-bold text-severity-low">{dashboardStats.lowVulnerabilities}</p>
            <p className="text-sm text-api-muted mt-1">Low</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/apis"
          className="api-card p-5 hover:border-api-primary transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
              <Server className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium">Register API</p>
              <p className="text-sm text-api-muted">Add new API to inventory</p>
            </div>
          </div>
        </Link>

        <Link
          to="/security"
          className="api-card p-5 hover:border-api-primary transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-white font-medium">Security Scan</p>
              <p className="text-sm text-api-muted">Run vulnerability scan</p>
            </div>
          </div>
        </Link>

        <Link
          to="/policies"
          className="api-card p-5 hover:border-api-primary transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">Create Policy</p>
              <p className="text-sm text-api-muted">Define new governance rule</p>
            </div>
          </div>
        </Link>

        <Link
          to="/anomalies"
          className="api-card p-5 hover:border-api-primary transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/20 rounded-xl group-hover:bg-red-500/30 transition-colors">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-white font-medium">View Anomalies</p>
              <p className="text-sm text-api-muted">{dashboardStats.openAnomalies} require attention</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
