import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  Activity, 
  Globe, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  BarChart2,
  MapPin,
  Zap,
  Server,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Calendar
} from 'lucide-react';
import clsx from 'clsx';
import { getTrafficStats } from '../services/api';

const COLORS = ['#00d9ff', '#ff6b6b', '#ffa726', '#66bb6a', '#42a5f5', '#ab47bc', '#ec407a', '#26c6da'];

export default function TrafficAnalytics() {
  const [timeRange, setTimeRange] = useState('24h');
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['trafficStats', timeRange],
    queryFn: () => getTrafficStats(timeRange),
  });

  // Mock data for visualization
  const trafficOverTime = Array.from({ length: 24 }, (_, i) => ({
    time: `${i.toString().padStart(2, '0')}:00`,
    requests: Math.floor(Math.random() * 50000) + 10000,
    blocked: Math.floor(Math.random() * 2000) + 500,
    allowed: Math.floor(Math.random() * 45000) + 8000,
  }));

  const countryData = [
    { country: 'United States', code: 'US', requests: 45234, blocked: 1234, percentage: 35.2 },
    { country: 'China', code: 'CN', requests: 28456, blocked: 8234, percentage: 22.1 },
    { country: 'Germany', code: 'DE', requests: 15678, blocked: 456, percentage: 12.2 },
    { country: 'United Kingdom', code: 'UK', requests: 12345, blocked: 234, percentage: 9.6 },
    { country: 'Russia', code: 'RU', requests: 8765, blocked: 4321, percentage: 6.8 },
    { country: 'Japan', code: 'JP', requests: 6543, blocked: 123, percentage: 5.1 },
    { country: 'Brazil', code: 'BR', requests: 5432, blocked: 456, percentage: 4.2 },
    { country: 'India', code: 'IN', requests: 4321, blocked: 234, percentage: 3.4 },
  ];

  const endpointStats = [
    { endpoint: '/api/login', requests: 12456, blocked: 3456, ratio: 27.7 },
    { endpoint: '/api/search', requests: 9876, blocked: 234, ratio: 2.4 },
    { endpoint: '/api/users', requests: 8765, blocked: 1234, ratio: 14.1 },
    { endpoint: '/api/admin', requests: 5432, blocked: 2345, ratio: 43.2 },
    { endpoint: '/api/upload', requests: 4321, blocked: 567, ratio: 13.1 },
    { endpoint: '/api/checkout', requests: 3456, blocked: 123, ratio: 3.6 },
  ];

  const responseTimeData = Array.from({ length: 12 }, (_, i) => ({
    time: `${(i * 2).toString().padStart(2, '0')}:00`,
    avgLatency: Math.floor(Math.random() * 50) + 20,
    p95Latency: Math.floor(Math.random() * 100) + 80,
    p99Latency: Math.floor(Math.random() * 150) + 150,
  }));

  const statusCodeData = [
    { code: '2xx', count: 125678, color: '#66bb6a' },
    { code: '3xx', count: 8765, color: '#42a5f5' },
    { code: '4xx', count: 12345, color: '#ffa726' },
    { code: '5xx', count: 2345, color: '#ff6b6b' },
  ];

  const bandwidthData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i.toString().padStart(2, '0')}:00`,
    inbound: Math.floor(Math.random() * 500) + 100,
    outbound: Math.floor(Math.random() * 300) + 50,
  }));

  const stats = {
    totalRequests: 1245678,
    blockedRequests: 45678,
    avgLatency: 42,
    bandwidth: '2.4 TB',
    requestsChange: 12.5,
    blockedChange: -8.3,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Traffic Analytics</h1>
          <p className="text-waf-muted mt-1">Real-time traffic insights and statistics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-waf-card border border-waf-border rounded-lg">
            {['1h', '24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={clsx(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  timeRange === range
                    ? 'bg-waf-primary text-white rounded-lg'
                    : 'text-waf-muted hover:text-white'
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <button onClick={() => refetch()} className="waf-btn-secondary">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="waf-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-waf-muted text-sm">Total Requests</span>
            <Activity className="w-5 h-5 text-waf-primary" />
          </div>
          <p className="text-2xl font-bold text-white">{(stats.totalRequests / 1000000).toFixed(2)}M</p>
          <div className="flex items-center gap-1 mt-1">
            {stats.requestsChange > 0 ? (
              <ArrowUp className="w-4 h-4 text-threat-low" />
            ) : (
              <ArrowDown className="w-4 h-4 text-threat-critical" />
            )}
            <span className={clsx('text-sm', stats.requestsChange > 0 ? 'text-threat-low' : 'text-threat-critical')}>
              {Math.abs(stats.requestsChange)}%
            </span>
          </div>
        </div>
        <div className="waf-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-waf-muted text-sm">Blocked Requests</span>
            <Zap className="w-5 h-5 text-threat-critical" />
          </div>
          <p className="text-2xl font-bold text-white">{(stats.blockedRequests / 1000).toFixed(1)}K</p>
          <div className="flex items-center gap-1 mt-1">
            {stats.blockedChange < 0 ? (
              <ArrowDown className="w-4 h-4 text-threat-low" />
            ) : (
              <ArrowUp className="w-4 h-4 text-threat-critical" />
            )}
            <span className={clsx('text-sm', stats.blockedChange < 0 ? 'text-threat-low' : 'text-threat-critical')}>
              {Math.abs(stats.blockedChange)}%
            </span>
          </div>
        </div>
        <div className="waf-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-waf-muted text-sm">Avg Latency</span>
            <Clock className="w-5 h-5 text-threat-info" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.avgLatency}ms</p>
          <p className="text-sm text-waf-muted mt-1">P95: 89ms</p>
        </div>
        <div className="waf-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-waf-muted text-sm">Bandwidth</span>
            <TrendingUp className="w-5 h-5 text-threat-low" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.bandwidth}</p>
          <p className="text-sm text-waf-muted mt-1">Last {timeRange}</p>
        </div>
      </div>

      {/* Traffic Over Time */}
      <div className="waf-card">
        <h2 className="text-lg font-semibold text-white mb-4">Traffic Over Time</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficOverTime}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d9ff" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1b2e', 
                  border: '1px solid #2d2e4a',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Area type="monotone" dataKey="allowed" stroke="#66bb6a" fillOpacity={1} fill="url(#colorRequests)" name="Allowed" />
              <Area type="monotone" dataKey="blocked" stroke="#ff6b6b" fillOpacity={1} fill="url(#colorBlocked)" name="Blocked" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Distribution */}
        <div className="waf-card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-waf-primary" />
            Traffic by Country
          </h2>
          <div className="space-y-3">
            {countryData.map((item, index) => (
              <motion.div
                key={item.code}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4"
              >
                <span className="w-8 text-center text-lg">{
                  { US: '🇺🇸', CN: '🇨🇳', DE: '🇩🇪', UK: '🇬🇧', RU: '🇷🇺', JP: '🇯🇵', BR: '🇧🇷', IN: '🇮🇳' }[item.code]
                }</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-waf-text">{item.country}</span>
                    <span className="text-sm text-waf-muted">{item.percentage}%</span>
                  </div>
                  <div className="h-2 bg-waf-dark rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="h-full rounded-full"
                      style={{ 
                        background: `linear-gradient(to right, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})`
                      }}
                    />
                  </div>
                </div>
                <div className="text-right w-24">
                  <p className="text-sm font-medium text-white">{(item.requests / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-threat-critical">{item.blocked} blocked</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Response Status Codes */}
        <div className="waf-card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-waf-primary" />
            Response Status Codes
          </h2>
          <div className="flex items-center gap-6">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusCodeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {statusCodeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1b2e', 
                      border: '1px solid #2d2e4a',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {statusCodeData.map((item) => (
                <div key={item.code} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-waf-text flex-1">{item.code}</span>
                  <span className="text-sm font-medium text-white">{(item.count / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Endpoint Stats */}
      <div className="waf-card">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-waf-primary" />
          Top Endpoints by Traffic
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={endpointStats} layout="vertical">
              <XAxis type="number" stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="endpoint" stroke="#6b7280" fontSize={12} width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1b2e', 
                  border: '1px solid #2d2e4a',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="requests" fill="#00d9ff" name="Total Requests" radius={[0, 4, 4, 0]} />
              <Bar dataKey="blocked" fill="#ff6b6b" name="Blocked" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Response Time & Bandwidth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="waf-card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-waf-primary" />
            Response Latency
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimeData}>
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} unit="ms" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1b2e', 
                    border: '1px solid #2d2e4a',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="avgLatency" stroke="#66bb6a" strokeWidth={2} dot={false} name="Avg" />
                <Line type="monotone" dataKey="p95Latency" stroke="#ffa726" strokeWidth={2} dot={false} name="P95" />
                <Line type="monotone" dataKey="p99Latency" stroke="#ff6b6b" strokeWidth={2} dot={false} name="P99" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="waf-card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-waf-primary" />
            Bandwidth Usage
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bandwidthData}>
                <defs>
                  <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#42a5f5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#42a5f5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ab47bc" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ab47bc" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} unit=" MB" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1b2e', 
                    border: '1px solid #2d2e4a',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="inbound" stroke="#42a5f5" fillOpacity={1} fill="url(#colorInbound)" name="Inbound" />
                <Area type="monotone" dataKey="outbound" stroke="#ab47bc" fillOpacity={1} fill="url(#colorOutbound)" name="Outbound" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
