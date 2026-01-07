import React from 'react';
import {
  FileText,
  Search,
  Database,
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Terminal,
  Activity,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Logs Ingested',
      value: '2.4B',
      change: '+12.5%',
      trend: 'up',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-log-500 to-log-600',
      subtext: 'Last 24 hours',
    },
    {
      title: 'Log Sources',
      value: '156',
      change: '+8',
      trend: 'up',
      icon: <Database className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      subtext: 'Active connections',
    },
    {
      title: 'Alerts Triggered',
      value: '47',
      change: '-15%',
      trend: 'down',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'from-amber-500 to-amber-600',
      subtext: 'vs yesterday',
    },
    {
      title: 'Avg Parse Time',
      value: '1.2ms',
      change: '-0.3ms',
      trend: 'down',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      subtext: 'Per log entry',
    },
  ];

  const recentLogs = [
    { timestamp: '2026-01-07 10:45:32', level: 'error', source: 'api-gateway', message: 'Connection timeout to downstream service', count: 234 },
    { timestamp: '2026-01-07 10:45:28', level: 'warn', source: 'auth-service', message: 'High rate of failed login attempts detected', count: 89 },
    { timestamp: '2026-01-07 10:45:25', level: 'info', source: 'payment-api', message: 'Transaction batch processed successfully', count: 1205 },
    { timestamp: '2026-01-07 10:45:20', level: 'error', source: 'db-primary', message: 'Slow query detected: SELECT * FROM orders', count: 45 },
    { timestamp: '2026-01-07 10:45:15', level: 'debug', source: 'cache-layer', message: 'Cache miss rate increased above threshold', count: 567 },
    { timestamp: '2026-01-07 10:45:10', level: 'fatal', source: 'worker-03', message: 'Out of memory exception - process terminated', count: 1 },
  ];

  const levelColors: Record<string, string> = {
    debug: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    warn: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    fatal: 'bg-red-600/30 text-red-300 border-red-500/50',
  };

  const logSources = [
    { name: 'api-gateway', logs: '450M', status: 'healthy', rate: '15K/s' },
    { name: 'auth-service', logs: '280M', status: 'healthy', rate: '8K/s' },
    { name: 'payment-api', logs: '320M', status: 'warning', rate: '12K/s' },
    { name: 'db-primary', logs: '180M', status: 'healthy', rate: '5K/s' },
    { name: 'worker-cluster', logs: '520M', status: 'healthy', rate: '20K/s' },
  ];

  return (
    <div className="flex-1 bg-dark-200 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Log Analytics Dashboard</h1>
            <p className="text-gray-400 mt-1">Real-time log monitoring and intelligent analysis</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-log-500/20 border border-log-500/30 rounded-lg">
              <Activity className="w-4 h-4 text-log-400 animate-pulse" />
              <span className="text-log-400 text-sm">Live: 45K logs/sec</span>
            </div>
            <button className="px-4 py-2 bg-log-gradient text-white rounded-lg font-medium hover:shadow-log transition-all flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Logs
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-dark-300 rounded-xl p-5 border border-log-500/20 hover:border-log-500/40 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.trend === 'down' && !stat.title.includes('Alerts') && !stat.title.includes('Parse')
                        ? 'text-red-400'
                        : 'text-green-400'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span>{stat.change}</span>
                    </div>
                    <span className="text-xs text-gray-500">{stat.subtext}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Logs */}
          <div className="lg:col-span-2 bg-dark-300 rounded-xl border border-log-500/20">
            <div className="p-4 border-b border-log-500/20 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-log-400" />
                Recent Log Entries
              </h2>
              <button className="text-log-400 text-sm hover:text-log-300">View All →</button>
            </div>
            <div className="divide-y divide-dark-100 font-mono text-sm">
              {recentLogs.map((log, index) => (
                <div key={index} className="p-4 hover:bg-dark-200/50 transition-all cursor-pointer">
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-0.5 text-xs rounded border ${levelColors[log.level]}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{log.timestamp}</span>
                        <span>•</span>
                        <span className="text-log-400">{log.source}</span>
                        <span>•</span>
                        <span>{log.count.toLocaleString()} occurrences</span>
                      </div>
                      <p className="text-gray-300 mt-1 truncate">{log.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Log Sources */}
          <div className="bg-dark-300 rounded-xl border border-log-500/20">
            <div className="p-4 border-b border-log-500/20">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-log-400" />
                Log Sources
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {logSources.map((source, index) => (
                <div key={index} className="p-3 bg-dark-200 rounded-lg border border-dark-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{source.name}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      source.status === 'healthy' ? 'bg-green-400' : 'bg-amber-400'
                    }`}></span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{source.logs} logs</span>
                    <span className="text-log-400">{source.rate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Log Level Distribution & Query Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-dark-300 rounded-xl p-5 border border-log-500/20">
            <h3 className="text-gray-400 text-sm mb-4">Log Level Distribution (24h)</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-purple-400 text-sm flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-purple-400"></span>
                  DEBUG
                </span>
                <div className="flex-1 mx-3 h-3 bg-dark-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '35%' }}></div>
                </div>
                <span className="text-white font-semibold w-16 text-right">840M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-400 text-sm flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-blue-400"></span>
                  INFO
                </span>
                <div className="flex-1 mx-3 h-3 bg-dark-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <span className="text-white font-semibold w-16 text-right">1.1B</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-400 text-sm flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-400"></span>
                  WARN
                </span>
                <div className="flex-1 mx-3 h-3 bg-dark-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '12%' }}></div>
                </div>
                <span className="text-white font-semibold w-16 text-right">290M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-400 text-sm flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-red-400"></span>
                  ERROR
                </span>
                <div className="flex-1 mx-3 h-3 bg-dark-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '6%' }}></div>
                </div>
                <span className="text-white font-semibold w-16 text-right">145M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-300 text-sm flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-red-600"></span>
                  FATAL
                </span>
                <div className="flex-1 mx-3 h-3 bg-dark-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full" style={{ width: '2%' }}></div>
                </div>
                <span className="text-white font-semibold w-16 text-right">25M</span>
              </div>
            </div>
          </div>

          <div className="bg-dark-300 rounded-xl p-5 border border-log-500/20">
            <h3 className="text-gray-400 text-sm mb-4">Search & Query Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-dark-200 rounded-lg border border-dark-100 text-center">
                <p className="text-2xl font-bold text-log-400">1.2ms</p>
                <p className="text-xs text-gray-400 mt-1">Avg Query Time</p>
              </div>
              <div className="p-4 bg-dark-200 rounded-lg border border-dark-100 text-center">
                <p className="text-2xl font-bold text-green-400">99.8%</p>
                <p className="text-xs text-gray-400 mt-1">Query Success</p>
              </div>
              <div className="p-4 bg-dark-200 rounded-lg border border-dark-100 text-center">
                <p className="text-2xl font-bold text-blue-400">3.2K</p>
                <p className="text-xs text-gray-400 mt-1">Queries/min</p>
              </div>
              <div className="p-4 bg-dark-200 rounded-lg border border-dark-100 text-center">
                <p className="text-2xl font-bold text-purple-400">48TB</p>
                <p className="text-xs text-gray-400 mt-1">Indexed Data</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-log-500/10 border border-log-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Storage Used</span>
                <span className="text-sm text-log-400">48TB / 100TB</span>
              </div>
              <div className="mt-2 h-2 bg-dark-100 rounded-full overflow-hidden">
                <div className="h-full bg-log-gradient rounded-full" style={{ width: '48%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
