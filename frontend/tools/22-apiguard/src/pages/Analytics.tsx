import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Globe,
  AlertTriangle,
  Check,
  Download,
  Users,
} from 'lucide-react';
import clsx from 'clsx';

// Mock traffic data
const trafficData = [
  { time: '00:00', requests: 12400, errors: 24, latency: 145 },
  { time: '02:00', requests: 8200, errors: 12, latency: 132 },
  { time: '04:00', requests: 5100, errors: 8, latency: 128 },
  { time: '06:00', requests: 7800, errors: 15, latency: 135 },
  { time: '08:00', requests: 18500, errors: 45, latency: 178 },
  { time: '10:00', requests: 32400, errors: 78, latency: 205 },
  { time: '12:00', requests: 28900, errors: 62, latency: 195 },
  { time: '14:00', requests: 35600, errors: 89, latency: 218 },
  { time: '16:00', requests: 31200, errors: 72, latency: 198 },
  { time: '18:00', requests: 24800, errors: 48, latency: 175 },
  { time: '20:00', requests: 19600, errors: 38, latency: 162 },
  { time: '22:00', requests: 15200, errors: 28, latency: 148 },
];

const apiTrafficData = [
  { name: 'User Management', requests: 145000, growth: 12.5 },
  { name: 'Payment Gateway', requests: 89000, growth: 8.3 },
  { name: 'Product Catalog', requests: 234000, growth: 15.7 },
  { name: 'Notifications', requests: 56000, growth: -3.2 },
  { name: 'Legacy Orders', requests: 23000, growth: -12.8 },
];

const consumerData = [
  { name: 'Mobile App', value: 45, color: '#6366f1' },
  { name: 'Web Frontend', value: 32, color: '#8b5cf6' },
  { name: 'Partner APIs', value: 15, color: '#a855f7' },
  { name: 'Internal Services', value: 8, color: '#c084fc' },
];

const latencyData = [
  { percentile: 'P50', current: 45, baseline: 42, threshold: 100 },
  { percentile: 'P75', current: 82, baseline: 78, threshold: 200 },
  { percentile: 'P90', current: 156, baseline: 145, threshold: 500 },
  { percentile: 'P95', current: 245, baseline: 220, threshold: 800 },
  { percentile: 'P99', current: 520, baseline: 480, threshold: 1000 },
];

const statusCodeData = [
  { code: '2xx', count: 987500, percentage: 96.2 },
  { code: '3xx', count: 12400, percentage: 1.2 },
  { code: '4xx', count: 18600, percentage: 1.8 },
  { code: '5xx', count: 8200, percentage: 0.8 },
];

const topEndpoints = [
  { endpoint: 'GET /api/v1/products', requests: 145000, avgLatency: 42, errors: 0.1 },
  { endpoint: 'POST /api/v1/auth/login', requests: 89000, avgLatency: 125, errors: 2.3 },
  { endpoint: 'GET /api/v1/users/:id', requests: 78000, avgLatency: 35, errors: 0.05 },
  { endpoint: 'POST /api/v1/orders', requests: 56000, avgLatency: 285, errors: 1.8 },
  { endpoint: 'GET /graphql', requests: 45000, avgLatency: 95, errors: 0.3 },
];

const geoData = [
  { region: 'North America', requests: 425000, latency: 45 },
  { region: 'Europe', requests: 312000, latency: 78 },
  { region: 'Asia Pacific', requests: 189000, latency: 125 },
  { region: 'South America', requests: 56000, latency: 95 },
  { region: 'Middle East', requests: 34000, latency: 110 },
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('24h');

  const stats = [
    {
      label: 'Total Requests',
      value: '2.4M',
      change: '+12.5%',
      trend: 'up',
      icon: Activity,
      color: 'text-api-primary bg-api-primary/20',
    },
    {
      label: 'Avg Latency',
      value: '142ms',
      change: '-8.3%',
      trend: 'down',
      icon: Clock,
      color: 'text-green-400 bg-green-500/20',
    },
    {
      label: 'Error Rate',
      value: '0.82%',
      change: '-15.2%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-yellow-400 bg-yellow-500/20',
    },
    {
      label: 'Active Consumers',
      value: '1,284',
      change: '+5.7%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-400 bg-purple-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
          <p className="text-api-muted mt-1">API traffic and performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="api-input"
          >
            <option value="1h">Last 1 hour</option>
            <option value="6h">Last 6 hours</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <button className="api-btn bg-api-dark text-api-muted flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="api-card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={clsx('p-2 rounded-lg', stat.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={clsx(
                  'flex items-center gap-1 text-sm',
                  stat.trend === 'up' && stat.label === 'Error Rate' ? 'text-red-400' :
                  stat.trend === 'up' ? 'text-green-400' :
                  stat.label === 'Error Rate' ? 'text-green-400' : 'text-red-400'
                )}>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-api-muted mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Traffic Chart */}
      <div className="api-card p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Request Traffic</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficData}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f9fafb' }}
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#colorRequests)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Distribution */}
        <div className="api-card p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Latency Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis dataKey="percentile" type="category" stroke="#9ca3af" fontSize={12} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value}ms`, '']}
                />
                <Bar dataKey="current" fill="#6366f1" radius={[0, 4, 4, 0]} name="Current" />
                <Bar dataKey="baseline" fill="#4b5563" radius={[0, 4, 4, 0]} name="Baseline" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consumer Distribution */}
        <div className="api-card p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Traffic by Consumer</h3>
          <div className="h-[250px] flex items-center">
            <div className="w-1/2">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={consumerData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                  >
                    {consumerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-3">
              {consumerData.map((consumer) => (
                <div key={consumer.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: consumer.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">{consumer.name}</span>
                      <span className="text-sm text-api-muted">{consumer.value}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status Codes & API Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Codes */}
        <div className="api-card p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Response Status Codes</h3>
          <div className="space-y-4">
            {statusCodeData.map((status) => (
              <div key={status.code}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      'px-2 py-0.5 text-xs font-medium rounded',
                      status.code === '2xx' && 'bg-green-500/20 text-green-400',
                      status.code === '3xx' && 'bg-blue-500/20 text-blue-400',
                      status.code === '4xx' && 'bg-yellow-500/20 text-yellow-400',
                      status.code === '5xx' && 'bg-red-500/20 text-red-400'
                    )}>
                      {status.code}
                    </span>
                    <span className="text-sm text-api-muted">
                      {status.count.toLocaleString()} requests
                    </span>
                  </div>
                  <span className="text-sm text-white">{status.percentage}%</span>
                </div>
                <div className="h-2 bg-api-dark rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full',
                      status.code === '2xx' && 'bg-green-500',
                      status.code === '3xx' && 'bg-blue-500',
                      status.code === '4xx' && 'bg-yellow-500',
                      status.code === '5xx' && 'bg-red-500'
                    )}
                    style={{ width: `${status.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Traffic Comparison */}
        <div className="api-card p-5">
          <h3 className="text-lg font-semibold text-white mb-4">API Traffic Comparison</h3>
          <div className="space-y-4">
            {apiTrafficData.map((api) => (
              <div key={api.name} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{api.name}</span>
                    <span className="text-sm text-api-muted">
                      {(api.requests / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="h-2 bg-api-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-api-primary rounded-full"
                      style={{ width: `${(api.requests / 234000) * 100}%` }}
                    />
                  </div>
                </div>
                <span className={clsx(
                  'text-sm flex items-center gap-1 w-16 justify-end',
                  api.growth >= 0 ? 'text-green-400' : 'text-red-400'
                )}>
                  {api.growth >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(api.growth)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Endpoints */}
      <div className="api-card p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Top Endpoints</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-api-border">
                <th className="text-left p-3 text-sm font-medium text-api-muted">Endpoint</th>
                <th className="text-right p-3 text-sm font-medium text-api-muted">Requests</th>
                <th className="text-right p-3 text-sm font-medium text-api-muted">Avg Latency</th>
                <th className="text-right p-3 text-sm font-medium text-api-muted">Error Rate</th>
                <th className="text-right p-3 text-sm font-medium text-api-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {topEndpoints.map((endpoint, index) => (
                <tr key={index} className="border-b border-api-border hover:bg-api-dark/30">
                  <td className="p-3">
                    <code className="text-sm text-api-primary">{endpoint.endpoint}</code>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-sm text-white">{endpoint.requests.toLocaleString()}</span>
                  </td>
                  <td className="p-3 text-right">
                    <span className={clsx(
                      'text-sm',
                      endpoint.avgLatency < 100 ? 'text-green-400' :
                      endpoint.avgLatency < 200 ? 'text-yellow-400' : 'text-red-400'
                    )}>
                      {endpoint.avgLatency}ms
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className={clsx(
                      'text-sm',
                      endpoint.errors < 1 ? 'text-green-400' :
                      endpoint.errors < 2 ? 'text-yellow-400' : 'text-red-400'
                    )}>
                      {endpoint.errors}%
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {endpoint.errors < 1 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                        <Check className="w-3 h-3" />
                        Healthy
                      </span>
                    ) : endpoint.errors < 2 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                        <AlertTriangle className="w-3 h-3" />
                        Warning
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
                        <AlertTriangle className="w-3 h-3" />
                        Critical
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="api-card p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Geographic Distribution</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {geoData.map((region) => (
            <div key={region.region} className="p-4 bg-api-dark rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-api-primary" />
                <span className="text-sm font-medium text-white">{region.region}</span>
              </div>
              <p className="text-lg font-bold text-white">
                {(region.requests / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-api-muted">
                Avg latency: <span className="text-white">{region.latency}ms</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
