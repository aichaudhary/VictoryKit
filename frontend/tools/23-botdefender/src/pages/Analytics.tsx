import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Globe,
  Bot,
  Shield,
  Activity,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { analyticsApi } from '../services/api';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeView, setActiveView] = useState<'overview' | 'geographic' | 'threats'>('overview');

  const { data: _trendsData } = useQuery({
    queryKey: ['analytics-trends', timeRange],
    queryFn: () => analyticsApi.getTrends(Number(timeRange.replace('d', ''))),
  });

  const { data: _geoData } = useQuery({
    queryKey: ['analytics-geo'],
    queryFn: analyticsApi.getGeographic,
  });

  const { data: _threatsData } = useQuery({
    queryKey: ['analytics-threats'],
    queryFn: analyticsApi.getThreats,
  });

  // Demo data
  const demoTrafficTrend = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
    total: Math.floor(Math.random() * 50000) + 30000,
    bots: Math.floor(Math.random() * 8000) + 2000,
    blocked: Math.floor(Math.random() * 3000) + 500,
  }));

  const demoBotTypes = [
    { name: 'Scrapers', value: 4500, color: '#f97316' },
    { name: 'Crawlers', value: 3200, color: '#3b82f6' },
    { name: 'Spammers', value: 1800, color: '#ef4444' },
    { name: 'Attackers', value: 1200, color: '#8b5cf6' },
    { name: 'Automation', value: 900, color: '#22c55e' },
  ];

  const demoGeoData = [
    { country: 'United States', code: 'US', requests: 45000, bots: 3200, blocked: 1500 },
    { country: 'China', code: 'CN', requests: 28000, bots: 8500, blocked: 6200 },
    { country: 'Russia', code: 'RU', requests: 15000, bots: 4200, blocked: 3100 },
    { country: 'Germany', code: 'DE', requests: 12000, bots: 1800, blocked: 400 },
    { country: 'India', code: 'IN', requests: 10000, bots: 2100, blocked: 800 },
    { country: 'Brazil', code: 'BR', requests: 8500, bots: 1500, blocked: 600 },
    { country: 'United Kingdom', code: 'GB', requests: 7500, bots: 900, blocked: 200 },
    { country: 'France', code: 'FR', requests: 6800, bots: 800, blocked: 150 },
  ];

  const demoHourlyActivity = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    traffic: Math.floor(Math.random() * 3000) + 1000,
    bots: Math.floor(Math.random() * 500) + 100,
  }));

  const demoThreats = [
    { type: 'Credential Stuffing', count: 1234, trend: 15, severity: 'critical' },
    { type: 'Content Scraping', count: 856, trend: -8, severity: 'high' },
    { type: 'DDoS Attempt', count: 234, trend: 42, severity: 'critical' },
    { type: 'Form Spam', count: 567, trend: -12, severity: 'medium' },
    { type: 'API Abuse', count: 345, trend: 5, severity: 'high' },
    { type: 'Account Takeover', count: 123, trend: 28, severity: 'critical' },
  ];

  const stats = [
    { label: 'Total Requests', value: '284.5K', change: 12, icon: Activity, color: 'blue' },
    { label: 'Bot Traffic', value: '23.4K', change: -5, icon: Bot, color: 'orange' },
    { label: 'Blocked', value: '8.7K', change: 18, icon: Shield, color: 'red' },
    { label: 'Challenges Passed', value: '4.2K', change: 3, icon: AlertTriangle, color: 'green' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 mt-1">Traffic patterns and threat intelligence</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex space-x-1 bg-slate-800 rounded-lg p-1 w-fit">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'geographic', label: 'Geographic' },
          { id: 'threats', label: 'Threats' },
        ].map((view) => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id as typeof activeView)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === view.id
                ? 'bg-orange-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-800 rounded-xl border border-slate-700 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                <stat.icon size={20} className={`text-${stat.color}-400`} />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                stat.change > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{Math.abs(stat.change)}%</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Overview View */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Traffic Trend Chart */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Traffic Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={demoTrafficTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Legend />
                <Area type="monotone" dataKey="total" name="Total Traffic" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <Area type="monotone" dataKey="bots" name="Bot Traffic" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
                <Area type="monotone" dataKey="blocked" name="Blocked" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Bot Types Distribution */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Bot Categories</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={demoBotTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {demoBotTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {demoBotTypes.map((type) => (
                  <div key={type.name} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                    <span className="text-sm text-slate-400">{type.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Activity */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Hourly Activity</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={demoHourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={2} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#f8fafc' }}
                  />
                  <Bar dataKey="traffic" name="Traffic" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="bots" name="Bots" fill="#f97316" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Geographic View */}
      {activeView === 'geographic' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Traffic by Country</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={demoGeoData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="country" type="category" stroke="#94a3b8" width={100} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Legend />
                <Bar dataKey="requests" name="Total Requests" fill="#3b82f6" stackId="a" />
                <Bar dataKey="bots" name="Bot Traffic" fill="#f97316" stackId="b" />
                <Bar dataKey="blocked" name="Blocked" fill="#ef4444" stackId="b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Country Table */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Country</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Total Requests</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Bot Traffic</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Bot %</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Blocked</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Block Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {demoGeoData.map((row) => {
                    const botRate = ((row.bots / row.requests) * 100).toFixed(1);
                    const blockRate = ((row.blocked / row.bots) * 100).toFixed(1);
                    return (
                      <tr key={row.code} className="hover:bg-slate-700/30">
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <Globe size={16} className="text-slate-400" />
                            <span className="text-white">{row.country}</span>
                            <span className="text-slate-500 text-sm">({row.code})</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-300">{row.requests.toLocaleString()}</td>
                        <td className="px-4 py-4 text-orange-400">{row.bots.toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            parseFloat(botRate) > 30 ? 'bg-red-500/20 text-red-400' :
                            parseFloat(botRate) > 15 ? 'bg-orange-500/20 text-orange-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {botRate}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-red-400">{row.blocked.toLocaleString()}</td>
                        <td className="px-4 py-4 text-slate-300">{blockRate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Threats View */}
      {activeView === 'threats' && (
        <div className="space-y-6">
          {/* Threat Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            {demoThreats.slice(0, 3).map((threat, i) => (
              <motion.div
                key={threat.type}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-xl border ${getSeverityColor(threat.severity)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium capitalize">{threat.severity}</span>
                  <div className={`flex items-center space-x-1 text-sm ${
                    threat.trend > 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {threat.trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{Math.abs(threat.trend)}%</span>
                  </div>
                </div>
                <p className="text-2xl font-bold">{threat.count.toLocaleString()}</p>
                <p className="text-sm opacity-80">{threat.type}</p>
              </motion.div>
            ))}
          </div>

          {/* Threats Table */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Threat Activity</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Threat Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Count</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Trend</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Severity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {demoThreats.map((threat) => (
                    <tr key={threat.type} className="hover:bg-slate-700/30">
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle size={16} className={
                            threat.severity === 'critical' ? 'text-red-400' :
                            threat.severity === 'high' ? 'text-orange-400' : 'text-yellow-400'
                          } />
                          <span className="text-white font-medium">{threat.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-300 font-mono">{threat.count.toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <div className={`flex items-center space-x-1 ${
                          threat.trend > 0 ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {threat.trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          <span>{Math.abs(threat.trend)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getSeverityColor(threat.severity)}`}>
                          {threat.severity}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                          Mitigated
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detection Methods */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Detection Methods Performance</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { method: 'ML Classification', detected: 4521, accuracy: 98.2 },
                { method: 'Fingerprinting', detected: 3245, accuracy: 95.8 },
                { method: 'Behavioral Analysis', detected: 2890, accuracy: 94.5 },
                { method: 'Rate Limiting', detected: 1567, accuracy: 99.1 },
              ].map((item) => (
                <div key={item.method} className="p-4 bg-slate-700/50 rounded-lg">
                  <h4 className="text-white font-medium mb-2">{item.method}</h4>
                  <p className="text-2xl font-bold text-orange-400">{item.detected.toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-slate-400">Accuracy</span>
                    <span className="text-sm text-green-400">{item.accuracy}%</span>
                  </div>
                  <div className="mt-2 h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${item.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
