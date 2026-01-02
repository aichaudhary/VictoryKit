import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Shield, AlertTriangle, Activity, TrendingUp, TrendingDown, FileWarning, Cloud, Monitor, ChevronRight } from 'lucide-react';
import { dlpAPI } from '../services/dlpAPI';

interface DashboardStats {
  totalScans: number;
  totalFindings: number;
  activeIncidents: number;
  blockedActions: number;
  policiesActive: number;
  endpointsOnline: number;
  cloudConnected: number;
  dataProtected: string;
}

const DLPDashboard: React.FC = () => {
  const [stats] = useState<DashboardStats>({
    totalScans: 15423,
    totalFindings: 892,
    activeIncidents: 12,
    blockedActions: 156,
    policiesActive: 8,
    endpointsOnline: 45,
    cloudConnected: 4,
    dataProtected: '2.4 TB',
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load real data
      await Promise.all([
        dlpAPI.incidents.list({}),
        dlpAPI.policies.list(),
      ]);

      setRecentActivity([
        {
          id: 1,
          type: 'incident',
          severity: 'critical',
          message: 'Credit card data detected in shared document',
          source: 'OneDrive',
          time: '2 minutes ago',
        },
        {
          id: 2,
          type: 'block',
          severity: 'high',
          message: 'USB file transfer blocked',
          source: 'Endpoint LAPTOP-DEV-001',
          time: '5 minutes ago',
        },
        {
          id: 3,
          type: 'alert',
          severity: 'medium',
          message: 'PII data found in Slack message',
          source: 'Slack #general',
          time: '12 minutes ago',
        },
        {
          id: 4,
          type: 'scan',
          severity: 'low',
          message: 'Scheduled cloud scan completed',
          source: 'Google Drive',
          time: '30 minutes ago',
        },
        {
          id: 5,
          type: 'policy',
          severity: 'info',
          message: 'HIPAA policy updated',
          source: 'System',
          time: '1 hour ago',
        },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard: React.FC<{
    icon: React.ElementType;
    label: string;
    value: string | number;
    trend?: 'up' | 'down';
    trendValue?: string;
    color: string;
  }> = ({ icon: Icon, label, value, trend, trendValue, color }) => (
    <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-5 hover:border-purple-500/40 transition-all">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${
            trend === 'up' ? 'text-red-400' : 'text-green-400'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold mt-3">{value.toLocaleString()}</p>
      <p className="text-sm text-slate-400 mt-1">{label}</p>
    </div>
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'incident': return AlertTriangle;
      case 'block': return Shield;
      case 'alert': return FileWarning;
      case 'scan': return Activity;
      case 'policy': return Shield;
      default: return Activity;
    }
  };

  const getSeverityDot = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500',
      info: 'bg-slate-500',
    };
    return colors[severity] || 'bg-slate-500';
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Total Scans (24h)"
          value={stats.totalScans}
          trend="up"
          trendValue="+12%"
          color="bg-purple-500/20 text-purple-400"
        />
        <StatCard
          icon={FileWarning}
          label="Sensitive Data Found"
          value={stats.totalFindings}
          trend="down"
          trendValue="-8%"
          color="bg-yellow-500/20 text-yellow-400"
        />
        <StatCard
          icon={AlertTriangle}
          label="Active Incidents"
          value={stats.activeIncidents}
          trend="up"
          trendValue="+3"
          color="bg-red-500/20 text-red-400"
        />
        <StatCard
          icon={Shield}
          label="Blocked Actions"
          value={stats.blockedActions}
          color="bg-green-500/20 text-green-400"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-xl font-bold">{stats.policiesActive}</p>
            <p className="text-sm text-slate-400">Active Policies</p>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4 flex items-center gap-4">
          <div className="p-3 bg-green-500/20 rounded-lg">
            <Monitor className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-xl font-bold">{stats.endpointsOnline}</p>
            <p className="text-sm text-slate-400">Endpoints Online</p>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Cloud className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-xl font-bold">{stats.cloudConnected}</p>
            <p className="text-sm text-slate-400">Cloud Services</p>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4 flex items-center gap-4">
          <div className="p-3 bg-cyan-500/20 rounded-lg">
            <LayoutDashboard className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-xl font-bold">{stats.dataProtected}</p>
            <p className="text-sm text-slate-400">Data Protected</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Recent Activity
            </h3>
            <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {recentActivity.map(activity => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <div className={`p-2 rounded-lg ${
                    activity.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                    activity.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    activity.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getSeverityDot(activity.severity)}`} />
                      <p className="text-sm font-medium truncate">{activity.message}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{activity.source}</p>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Type Distribution */}
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <FileWarning className="w-5 h-5 text-purple-400" />
            Top Detected Data Types
          </h3>

          <div className="space-y-4">
            {[
              { type: 'Credit Card Numbers', count: 234, percent: 28, color: 'bg-red-500' },
              { type: 'Email Addresses', count: 189, percent: 23, color: 'bg-orange-500' },
              { type: 'Social Security Numbers', count: 156, percent: 19, color: 'bg-yellow-500' },
              { type: 'API Keys', count: 98, percent: 12, color: 'bg-purple-500' },
              { type: 'Phone Numbers', count: 78, percent: 9, color: 'bg-blue-500' },
              { type: 'Other PII', count: 73, percent: 9, color: 'bg-cyan-500' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{item.type}</span>
                  <span className="text-slate-400">{item.count} ({item.percent}%)</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Score Indicator */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-purple-400" />
          Organization Risk Score
        </h3>

        <div className="flex items-center gap-8">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#334155"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${0.72 * 440} 440`}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">72</span>
              <span className="text-sm text-slate-400">Medium Risk</span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-400">Compliance Score</p>
              <p className="text-xl font-bold text-green-400">85%</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-400">Policy Coverage</p>
              <p className="text-xl font-bold text-purple-400">92%</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-400">Response Time</p>
              <p className="text-xl font-bold text-cyan-400">4.2m</p>
            </div>
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-400">Threat Level</p>
              <p className="text-xl font-bold text-yellow-400">Medium</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DLPDashboard;
