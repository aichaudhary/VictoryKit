import React from 'react';
import { 
  Shield, Activity, Users, Lock, AlertTriangle, CheckCircle,
  TrendingUp, TrendingDown, Clock, Globe, Server, Laptop,
  Eye, Zap, BarChart3, PieChart
} from 'lucide-react';

interface TrustSession {
  id: string;
  user: string;
  device: string;
  location: string;
  trustScore: number;
  status: string;
  riskLevel: string;
  lastVerified: Date;
  factors: string[];
}

interface Stats {
  activeSessions: number;
  trustedDevices: number;
  policiesEnforced: number;
  blockedAttempts: number;
  avgTrustScore: number;
  verificationRate: number;
}

interface Props {
  sessions: TrustSession[];
  stats: Stats;
}

const ZeroTrustDashboard: React.FC<Props> = ({ sessions, stats }) => {
  const recentSessions = sessions.slice(0, 5);
  
  const trustScoreDistribution = [
    { range: '90-100', count: 892, color: 'bg-green-500' },
    { range: '70-89', count: 234, color: 'bg-yellow-500' },
    { range: '50-69', count: 89, color: 'bg-orange-500' },
    { range: '0-49', count: 32, color: 'bg-red-500' },
  ];

  const riskAlerts = [
    { id: 'ALT-001', type: 'High Risk Session', user: 'external.vendor@partner.com', severity: 'critical', time: '2 min ago' },
    { id: 'ALT-002', type: 'Unverified Device', user: 'jane.smith@company.com', severity: 'warning', time: '15 min ago' },
    { id: 'ALT-003', type: 'Location Anomaly', user: 'bob.wilson@company.com', severity: 'medium', time: '1 hour ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Zero Trust Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time trust monitoring and security overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/50 rounded-lg">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">All Systems Secure</span>
          </div>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="flex items-center text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              +12%
            </span>
          </div>
          <h3 className="text-2xl font-bold mt-4">{stats.activeSessions.toLocaleString()}</h3>
          <p className="text-gray-400 text-sm">Active Sessions</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Laptop className="w-6 h-6 text-blue-400" />
            </div>
            <span className="flex items-center text-blue-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              +8%
            </span>
          </div>
          <h3 className="text-2xl font-bold mt-4">{stats.trustedDevices}</h3>
          <p className="text-gray-400 text-sm">Trusted Devices</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-purple-400" />
            </div>
            <span className="flex items-center text-purple-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              +5%
            </span>
          </div>
          <h3 className="text-2xl font-bold mt-4">{stats.policiesEnforced}</h3>
          <p className="text-gray-400 text-sm">Policies Enforced</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mt-4">{stats.avgTrustScore}%</h3>
          <p className="text-gray-400 text-sm">Avg Trust Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trust Score Distribution */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Trust Score Distribution</h2>
          <div className="space-y-4">
            {trustScoreDistribution.map((range) => (
              <div key={range.range} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{range.range}</span>
                    <span className="text-sm text-gray-400">{range.count}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`${range.color} h-full`}
                      style={{ width: `${(range.count / 1247) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Sessions</h2>
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  session.trustScore >= 90 ? 'bg-green-500/20' :
                  session.trustScore >= 70 ? 'bg-yellow-500/20' :
                  session.trustScore >= 50 ? 'bg-orange-500/20' : 'bg-red-500/20'
                }`}>
                  {session.status === 'active' ? 
                    <CheckCircle className={`w-5 h-5 ${
                      session.trustScore >= 90 ? 'text-green-400' : 'text-gray-400'
                    }`} /> :
                    <AlertTriangle className={`w-5 h-5 ${
                      session.trustScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                    }`} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.user}</p>
                  <p className="text-xs text-gray-400">{session.device}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold">{session.trustScore}%</span>
                  <p className="text-xs text-gray-500">
                    {new Date(session.lastVerified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Alerts */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Active Risk Alerts</h2>
          <button className="text-sm text-emerald-400 hover:text-emerald-300">View All</button>
        </div>
        <div className="space-y-3">
          {riskAlerts.map((alert) => (
            <div key={alert.id} className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                alert.severity === 'critical' ? 'bg-red-500/20' :
                alert.severity === 'warning' ? 'bg-yellow-500/20' : 'bg-orange-500/20'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${
                  alert.severity === 'critical' ? 'text-red-400' :
                  alert.severity === 'warning' ? 'text-yellow-400' : 'text-orange-400'
                }`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{alert.type}</p>
                <p className="text-xs text-gray-400">{alert.user}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                  alert.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {alert.severity}
                </span>
                <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Verification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats.verificationRate}%</p>
              <p className="text-xs text-gray-400">Verification Success Rate</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats.blockedAttempts}</p>
              <p className="text-xs text-gray-400">Blocked Attempts (24h)</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold">2.3s</p>
              <p className="text-xs text-gray-400">Avg Verification Time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZeroTrustDashboard;
