import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Shield,
  Bot,
  Lock,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Eye,
  Ban,
  CheckCircle,
  ArrowLeft,
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
} from 'recharts';
import { analyticsApi } from '../services/api';
import { useWebSocket } from '../services/websocket';

const BOT_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'];

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: analyticsApi.getDashboard,
    refetchInterval: 30000,
  });

  useQuery({
    queryKey: ['realtime-stats'],
    queryFn: analyticsApi.getRealtime,
    refetchInterval: 5000,
  });

  const { botDetections, trafficUpdates: _trafficUpdates, isConnected } = useWebSocket();
  
  // Mock data for demo
  const botCategories = [
    { name: 'Scrapers', value: 45 },
    { name: 'Credential Stuffers', value: 25 },
    { name: 'Spam Bots', value: 15 },
    { name: 'Click Fraud', value: 10 },
    { name: 'Other', value: 5 },
  ];

  const hourlyTraffic = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    legitimate: Math.floor(Math.random() * 1000) + 500,
    bots: Math.floor(Math.random() * 200) + 50,
    blocked: Math.floor(Math.random() * 100) + 20,
  }));

  const statCards = [
    {
      title: 'Total Requests (24h)',
      value: stats?.data?.totalRequests?.toLocaleString() || '124,892',
      change: '+12.5%',
      trend: 'up',
      icon: Activity,
      color: 'blue',
    },
    {
      title: 'Bots Detected',
      value: stats?.data?.botsDetected?.toLocaleString() || '8,432',
      change: '+5.2%',
      trend: 'up',
      icon: Bot,
      color: 'red',
    },
    {
      title: 'Challenges Issued',
      value: stats?.data?.challengesIssued?.toLocaleString() || '2,156',
      change: '-3.1%',
      trend: 'down',
      icon: Lock,
      color: 'orange',
    },
    {
      title: 'Block Rate',
      value: stats?.data?.blockRate || '89.2%',
      change: '+2.1%',
      trend: 'up',
      icon: Shield,
      color: 'green',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="https://maula.ai"
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all duration-200 group"
            title="Back to MAULA.AI"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </a>
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 mt-1">Real-time bot detection overview</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-sm font-medium">{isConnected ? 'Live' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800 rounded-xl border border-slate-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-500/20`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{stat.change}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            <p className="text-sm text-slate-400 mt-1">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Traffic Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyTraffic}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="legitimate"
                  stackId="1"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.3}
                  name="Legitimate"
                />
                <Area
                  type="monotone"
                  dataKey="bots"
                  stackId="2"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.3}
                  name="Bots"
                />
                <Area
                  type="monotone"
                  dataKey="blocked"
                  stackId="3"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                  name="Blocked"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bot Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800 rounded-xl border border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Bot Categories</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={botCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {botCategories.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={BOT_COLORS[index % BOT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {botCategories.map((cat, index) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: BOT_COLORS[index % BOT_COLORS.length] }}
                  />
                  <span className="text-slate-400">{cat.name}</span>
                </div>
                <span className="text-white font-medium">{cat.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Live Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-800 rounded-xl border border-slate-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Live Activity</h3>
            <div className="flex items-center space-x-2 text-green-400">
              <Zap size={16} />
              <span className="text-sm">Real-time</span>
            </div>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {botDetections.length > 0 ? (
              botDetections.slice(0, 10).map((detection, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      detection.data.action === 'block' 
                        ? 'bg-red-500/20 text-red-400' 
                        : detection.data.action === 'challenge'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {detection.data.action === 'block' ? <Ban size={16} /> : 
                       detection.data.action === 'challenge' ? <Eye size={16} /> : 
                       <CheckCircle size={16} />}
                    </div>
                    <div>
                      <p className="text-sm text-white">{detection.data.ipAddress || 'Unknown'}</p>
                      <p className="text-xs text-slate-400">{detection.data.userAgent?.substring(0, 40)}...</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    detection.data.action === 'block' 
                      ? 'bg-red-500/20 text-red-400' 
                      : detection.data.action === 'challenge'
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {detection.data.action}
                  </span>
                </motion.div>
              ))
            ) : (
              // Demo data when no WebSocket events
              Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      i % 3 === 0 ? 'bg-red-500/20 text-red-400' : 
                      i % 3 === 1 ? 'bg-orange-500/20 text-orange-400' : 
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {i % 3 === 0 ? <Ban size={16} /> : 
                       i % 3 === 1 ? <Eye size={16} /> : 
                       <CheckCircle size={16} />}
                    </div>
                    <div>
                      <p className="text-sm text-white">192.168.{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}</p>
                      <p className="text-xs text-slate-400">Mozilla/5.0 (compatible; Bot/{i + 1}.0)</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    i % 3 === 0 ? 'bg-red-500/20 text-red-400' : 
                    i % 3 === 1 ? 'bg-orange-500/20 text-orange-400' : 
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {i % 3 === 0 ? 'block' : i % 3 === 1 ? 'challenge' : 'allow'}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions & Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-slate-800 rounded-xl border border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Detection Methods</h3>
          <div className="space-y-4">
            {[
              { name: 'Behavioral Analysis', value: 45, color: 'blue' },
              { name: 'Fingerprinting', value: 30, color: 'purple' },
              { name: 'Rate Limiting', value: 15, color: 'orange' },
              { name: 'IP Reputation', value: 7, color: 'red' },
              { name: 'CAPTCHA Failed', value: 3, color: 'green' },
            ].map((method) => (
              <div key={method.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-400">{method.name}</span>
                  <span className="text-sm text-white font-medium">{method.value}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${method.value}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full bg-${method.color}-500 rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <h4 className="text-sm font-medium text-slate-400 mb-4">Quick Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">98.5%</p>
                <p className="text-xs text-slate-400">Accuracy Rate</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">12ms</p>
                <p className="text-xs text-slate-400">Avg Response</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">1.2M</p>
                <p className="text-xs text-slate-400">Requests/Day</p>
              </div>
              <div className="p-3 bg-slate-700/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">24</p>
                <p className="text-xs text-slate-400">Active Rules</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
