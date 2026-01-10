import React from 'react';
import { 
  FileSearch, Clock, AlertTriangle, CheckCircle, Activity,
  TrendingUp, ArrowUpRight, ArrowDownRight, Shield, BarChart3
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  category: string;
  severity: string;
  user: string;
  outcome: string;
}

interface Stats {
  totalEvents: number;
  todayEvents: number;
  warningEvents: number;
  criticalEvents: number;
  complianceScore: number;
  retentionDays: number;
}

interface Props {
  logs: AuditLog[];
  stats: Stats;
}

const AuditDashboard: React.FC<Props> = ({ logs, stats }) => {
  const categoryStats = [
    { name: 'Authentication', count: 1247, change: +12, color: 'teal' },
    { name: 'Authorization', count: 892, change: -5, color: 'blue' },
    { name: 'Data Access', count: 2341, change: +8, color: 'violet' },
    { name: 'Configuration', count: 156, change: +2, color: 'amber' },
    { name: 'Security', count: 89, change: +15, color: 'red' },
    { name: 'System', count: 567, change: -3, color: 'gray' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Dashboard</h1>
          <p className="text-gray-400 mt-1">Monitor security events and compliance</p>
        </div>
        <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <FileSearch className="w-6 h-6 text-teal-400" />
            </div>
            <span className="flex items-center text-green-400 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              +18%
            </span>
          </div>
          <h3 className="text-2xl font-bold mt-4">{stats.totalEvents.toLocaleString()}</h3>
          <p className="text-gray-400 text-sm">Total Events</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs text-gray-500">Last 24h</span>
          </div>
          <h3 className="text-2xl font-bold mt-4">{stats.todayEvents}</h3>
          <p className="text-gray-400 text-sm">Today's Events</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="flex items-center text-yellow-400 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              +3
            </span>
          </div>
          <h3 className="text-2xl font-bold mt-4">{stats.warningEvents}</h3>
          <p className="text-gray-400 text-sm">Warning Events</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mt-4">{stats.complianceScore}%</h3>
          <p className="text-gray-400 text-sm">Compliance Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Categories */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Event Categories</h2>
          <div className="space-y-4">
            {categoryStats.map((cat) => (
              <div key={cat.name} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{cat.count}</span>
                      <span className={`text-xs ${cat.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {cat.change >= 0 ? '+' : ''}{cat.change}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        cat.color === 'teal' ? 'bg-teal-500' :
                        cat.color === 'blue' ? 'bg-blue-500' :
                        cat.color === 'violet' ? 'bg-violet-500' :
                        cat.color === 'amber' ? 'bg-amber-500' :
                        cat.color === 'red' ? 'bg-red-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${Math.min((cat.count / 2500) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Events</h2>
          <div className="space-y-3">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  log.severity === 'critical' ? 'bg-red-500/20' :
                  log.severity === 'error' ? 'bg-orange-500/20' :
                  log.severity === 'warning' ? 'bg-yellow-500/20' : 'bg-teal-500/20'
                }`}>
                  {log.outcome === 'success' ? 
                    <CheckCircle className={`w-5 h-5 ${
                      log.severity === 'info' ? 'text-teal-400' : 'text-gray-400'
                    }`} /> :
                    <AlertTriangle className={`w-5 h-5 ${
                      log.severity === 'critical' ? 'text-red-400' :
                      log.severity === 'error' ? 'text-orange-400' : 'text-yellow-400'
                    }`} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{log.action}</p>
                  <p className="text-xs text-gray-400">{log.user}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Compliance Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { framework: 'SOC 2 Type II', status: 96, lastAudit: '2025-12-15' },
            { framework: 'ISO 27001', status: 94, lastAudit: '2025-11-20' },
            { framework: 'HIPAA', status: 92, lastAudit: '2025-12-01' },
            { framework: 'GDPR', status: 89, lastAudit: '2025-10-30' },
          ].map((item) => (
            <div key={item.framework} className="p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{item.framework}</span>
                <span className={`text-sm font-bold ${
                  item.status >= 90 ? 'text-green-400' : item.status >= 80 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {item.status}%
                </span>
              </div>
              <div className="h-2 bg-gray-600 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full ${
                    item.status >= 90 ? 'bg-green-500' : item.status >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${item.status}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">Last audit: {item.lastAudit}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuditDashboard;
