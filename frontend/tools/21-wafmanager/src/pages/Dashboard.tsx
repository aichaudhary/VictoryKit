import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Server, 
  FileCode2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Globe,
  Clock,
  Zap,
  Target,
  Ban
} from 'lucide-react';
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
  Bar
} from 'recharts';
import CountUp from 'react-countup';
import { getDashboardMetrics } from '../services/api';
import { useWAFStore } from '../stores/wafStore';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

const COLORS = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
  info: '#3b82f6',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { realtimeAttacks } = useWAFStore();

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: getDashboardMetrics,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Generate mock data for demo
  const mockMetrics = {
    overview: {
      totalInstances: 8,
      activeInstances: 7,
      totalRules: 256,
      enabledRules: 241,
      activePolicies: 12,
    },
    traffic: {
      totalRequests: 2847563,
      blockedRequests: 45892,
      allowedRequests: 2801671,
      blockRate: 1.61,
      avgLatency: 23,
    },
    threats: {
      criticalCount: 12,
      highCount: 89,
      mediumCount: 342,
      lowCount: 1247,
      topCategories: [
        { category: 'SQL Injection', count: 4521 },
        { category: 'XSS', count: 3892 },
        { category: 'Bot Traffic', count: 2847 },
        { category: 'Scanner', count: 1923 },
        { category: 'RCE', count: 892 },
      ],
      topCountries: [
        { country: 'China', count: 12453 },
        { country: 'Russia', count: 8924 },
        { country: 'United States', count: 5632 },
        { country: 'Brazil', count: 3421 },
        { country: 'India', count: 2891 },
      ],
    },
    recentAttacks: [],
    trafficTrend: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${i}:00`,
      requests: Math.floor(Math.random() * 50000) + 100000,
      blocked: Math.floor(Math.random() * 2000) + 500,
    })),
  };

  const data = metrics || mockMetrics;

  const severityData = [
    { name: 'Critical', value: data.threats.criticalCount, color: COLORS.critical },
    { name: 'High', value: data.threats.highCount, color: COLORS.high },
    { name: 'Medium', value: data.threats.mediumCount, color: COLORS.medium },
    { name: 'Low', value: data.threats.lowCount, color: COLORS.low },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requests */}
        <motion.div variants={itemVariants} className="metric-card metric-card-blue">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-waf-muted text-sm font-medium">Total Requests</p>
              <h3 className="text-3xl font-bold text-white mt-1">
                <CountUp end={data.traffic.totalRequests} duration={1} separator="," />
              </h3>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-threat-low" />
                <span className="text-sm text-threat-low">+12.5%</span>
                <span className="text-xs text-waf-muted">vs yesterday</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-threat-info/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-threat-info" />
            </div>
          </div>
        </motion.div>

        {/* Blocked Requests */}
        <motion.div variants={itemVariants} className="metric-card metric-card-red">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-waf-muted text-sm font-medium">Blocked Attacks</p>
              <h3 className="text-3xl font-bold text-white mt-1">
                <CountUp end={data.traffic.blockedRequests} duration={1} separator="," />
              </h3>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="w-4 h-4 text-threat-low" />
                <span className="text-sm text-threat-low">-8.3%</span>
                <span className="text-xs text-waf-muted">vs yesterday</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-threat-critical/20 flex items-center justify-center">
              <Ban className="w-6 h-6 text-threat-critical" />
            </div>
          </div>
        </motion.div>

        {/* Active Rules */}
        <motion.div variants={itemVariants} className="metric-card metric-card-orange">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-waf-muted text-sm font-medium">Active Rules</p>
              <h3 className="text-3xl font-bold text-white mt-1">
                <CountUp end={data.overview.enabledRules} duration={1} />
                <span className="text-lg text-waf-muted">/{data.overview.totalRules}</span>
              </h3>
              <div className="flex items-center gap-1 mt-2">
                <Shield className="w-4 h-4 text-waf-primary" />
                <span className="text-sm text-waf-muted">
                  {((data.overview.enabledRules / data.overview.totalRules) * 100).toFixed(0)}% coverage
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-waf-primary/20 flex items-center justify-center">
              <FileCode2 className="w-6 h-6 text-waf-primary" />
            </div>
          </div>
        </motion.div>

        {/* WAF Instances */}
        <motion.div variants={itemVariants} className="metric-card metric-card-green">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-waf-muted text-sm font-medium">WAF Instances</p>
              <h3 className="text-3xl font-bold text-white mt-1">
                <CountUp end={data.overview.activeInstances} duration={1} />
                <span className="text-lg text-waf-muted">/{data.overview.totalInstances}</span>
              </h3>
              <div className="flex items-center gap-1 mt-2">
                <Server className="w-4 h-4 text-threat-low" />
                <span className="text-sm text-threat-low">All healthy</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-threat-low/20 flex items-center justify-center">
              <Server className="w-6 h-6 text-threat-low" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Traffic Chart & Threat Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Trend Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 waf-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Traffic Trend (24h)</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-threat-info" />
                <span className="text-sm text-waf-muted">Requests</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-threat-critical" />
                <span className="text-sm text-waf-muted">Blocked</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trafficTrend}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#8b949e" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#8b949e" 
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161b22',
                    border: '1px solid #30363d',
                    borderRadius: '8px',
                    color: '#c9d1d9',
                  }}
                  formatter={(value: number) => [value.toLocaleString(), '']}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRequests)"
                />
                <Area
                  type="monotone"
                  dataKey="blocked"
                  stroke="#dc2626"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBlocked)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Threat Distribution */}
        <motion.div variants={itemVariants} className="waf-card">
          <h3 className="text-lg font-semibold text-white mb-6">Threat Severity</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161b22',
                    border: '1px solid #30363d',
                    borderRadius: '8px',
                    color: '#c9d1d9',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {severityData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }} 
                />
                <span className="text-sm text-waf-muted">{item.name}</span>
                <span className="text-sm font-medium text-white ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Categories & Recent Attacks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Attack Categories */}
        <motion.div variants={itemVariants} className="waf-card">
          <h3 className="text-lg font-semibold text-white mb-6">Top Attack Categories</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data.threats.topCategories} 
                layout="vertical"
                margin={{ left: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" horizontal={false} />
                <XAxis type="number" stroke="#8b949e" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="category" 
                  stroke="#8b949e" 
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161b22',
                    border: '1px solid #30363d',
                    borderRadius: '8px',
                    color: '#c9d1d9',
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#ff6b2b" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Countries */}
        <motion.div variants={itemVariants} className="waf-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Top Attack Origins</h3>
            <Globe className="w-5 h-5 text-waf-muted" />
          </div>
          <div className="space-y-4">
            {data.threats.topCountries.map((item, index) => {
              const maxCount = data.threats.topCountries[0].count;
              const percentage = (item.count / maxCount) * 100;
              
              return (
                <div key={item.country} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-waf-muted w-5">{index + 1}</span>
                      <span className="text-sm font-medium text-white">{item.country}</span>
                    </div>
                    <span className="text-sm text-waf-muted">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-waf-dark rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={clsx(
                        'h-full rounded-full',
                        index === 0 ? 'bg-threat-critical' :
                        index === 1 ? 'bg-threat-high' :
                        index === 2 ? 'bg-threat-medium' :
                        'bg-waf-primary'
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Recent Attacks Feed */}
      <motion.div variants={itemVariants} className="waf-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Attacks</h3>
          <a href="/attacks" className="text-sm text-waf-primary hover:text-waf-secondary transition-colors">
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="waf-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Source IP</th>
                <th>Target</th>
                <th>Severity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(realtimeAttacks.length > 0 ? realtimeAttacks.slice(0, 5) : [
                { _id: '1', timestamp: new Date(), category: 'sqli', source: { ip: '192.168.1.1', country: 'CN' }, request: { uri: '/api/users', method: 'POST' }, severity: 'critical', action: 'blocked' },
                { _id: '2', timestamp: new Date(Date.now() - 60000), category: 'xss', source: { ip: '10.0.0.1', country: 'RU' }, request: { uri: '/search', method: 'GET' }, severity: 'high', action: 'blocked' },
                { _id: '3', timestamp: new Date(Date.now() - 120000), category: 'bot', source: { ip: '172.16.0.1', country: 'US' }, request: { uri: '/login', method: 'POST' }, severity: 'medium', action: 'challenged' },
                { _id: '4', timestamp: new Date(Date.now() - 180000), category: 'scanner', source: { ip: '192.168.2.1', country: 'BR' }, request: { uri: '/admin', method: 'GET' }, severity: 'low', action: 'logged' },
                { _id: '5', timestamp: new Date(Date.now() - 240000), category: 'rce', source: { ip: '10.1.1.1', country: 'IN' }, request: { uri: '/api/exec', method: 'POST' }, severity: 'critical', action: 'blocked' },
              ]).map((attack: any) => (
                <tr key={attack._id}>
                  <td className="text-waf-muted text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatDistanceToNow(new Date(attack.timestamp), { addSuffix: true })}
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-sm text-white uppercase">{attack.category}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-white">{attack.source?.ip}</span>
                      <span className="text-xs text-waf-muted">({attack.source?.country})</span>
                    </div>
                  </td>
                  <td className="font-mono text-sm text-waf-muted">
                    {attack.request?.method} {attack.request?.uri}
                  </td>
                  <td>
                    <span className={clsx(
                      'waf-badge',
                      attack.severity === 'critical' && 'waf-badge-critical',
                      attack.severity === 'high' && 'waf-badge-high',
                      attack.severity === 'medium' && 'waf-badge-medium',
                      attack.severity === 'low' && 'waf-badge-low'
                    )}>
                      {attack.severity}
                    </span>
                  </td>
                  <td>
                    <span className={clsx(
                      'text-sm font-medium',
                      attack.action === 'blocked' && 'text-threat-critical',
                      attack.action === 'challenged' && 'text-threat-medium',
                      attack.action === 'logged' && 'text-threat-info'
                    )}>
                      {attack.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
