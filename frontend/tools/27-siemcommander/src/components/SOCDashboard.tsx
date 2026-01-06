import React from 'react';
import {
  Activity, AlertTriangle, Shield, Clock, TrendingUp, TrendingDown,
  Minus, Database, Zap, CheckCircle, XCircle, Eye
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { DashboardStats, EventTrendData, ActivityItem } from '../types';
import { SEVERITY_COLORS, CHART_COLORS, formatNumber, formatTimestamp, formatDuration, getSeverityBadgeClass } from '../constants';

// Mock dashboard data
const mockStats: DashboardStats = {
  totalEvents: 2847563,
  eventsLast24h: 156234,
  eventsTrend: 12.5,
  openIncidents: 23,
  criticalIncidents: 5,
  incidentsTrend: -8.2,
  openAlerts: 147,
  criticalAlerts: 12,
  alertsTrend: 15.3,
  mttr: 45,
  mttrTrend: -12.0,
  activeSources: 42,
  totalSources: 48,
  eventsPerSecond: 1847,
  topThreats: [
    { category: 'Brute Force', count: 1234, severity: 'high', trend: 'up' },
    { category: 'Malware', count: 856, severity: 'critical', trend: 'down' },
    { category: 'Phishing', count: 623, severity: 'medium', trend: 'stable' },
    { category: 'Data Exfil', count: 234, severity: 'critical', trend: 'up' },
  ],
  severityDistribution: [
    { severity: 'critical', count: 234, percentage: 15 },
    { severity: 'high', count: 567, percentage: 25 },
    { severity: 'medium', count: 890, percentage: 35 },
    { severity: 'low', count: 456, percentage: 20 },
    { severity: 'info', count: 123, percentage: 5 },
  ],
  eventsBySource: [
    { source: 'firewall', name: 'Firewall', count: 45678, eventsPerSecond: 528 },
    { source: 'endpoint', name: 'Endpoint', count: 34567, eventsPerSecond: 412 },
    { source: 'cloud', name: 'Cloud', count: 23456, eventsPerSecond: 287 },
    { source: 'network', name: 'Network', count: 18234, eventsPerSecond: 198 },
  ],
  recentActivity: [
    { id: '1', timestamp: new Date(), type: 'incident', title: 'Critical: Ransomware detected on workstation', severity: 'critical', status: 'investigating' },
    { id: '2', timestamp: new Date(Date.now() - 300000), type: 'alert', title: 'Multiple failed login attempts from 192.168.1.50', severity: 'high', status: 'open' },
    { id: '3', timestamp: new Date(Date.now() - 600000), type: 'playbook', title: 'Malware Containment playbook executed', status: 'completed' },
    { id: '4', timestamp: new Date(Date.now() - 900000), type: 'event', title: 'Unusual outbound traffic to unknown IP', severity: 'medium', status: 'new' },
  ],
};

const mockTrendData: EventTrendData[] = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  critical: Math.floor(Math.random() * 50) + 10,
  high: Math.floor(Math.random() * 100) + 50,
  medium: Math.floor(Math.random() * 200) + 100,
  low: Math.floor(Math.random() * 300) + 150,
  info: Math.floor(Math.random() * 100) + 50,
}));

const SOCDashboard: React.FC = () => {
  const stats = mockStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">SOC Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time security operations overview</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">{formatNumber(stats.eventsPerSecond)} EPS</span>
          </div>
          <select className="bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-1.5 text-white text-sm">
            <option>Last 24 hours</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          label="Events (24h)"
          value={formatNumber(stats.eventsLast24h)}
          trend={stats.eventsTrend}
          color={CHART_COLORS.info}
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Open Incidents"
          value={stats.openIncidents}
          subValue={`${stats.criticalIncidents} critical`}
          trend={stats.incidentsTrend}
          color={CHART_COLORS.critical}
        />
        <StatCard
          icon={<Shield className="w-5 h-5" />}
          label="Open Alerts"
          value={stats.openAlerts}
          subValue={`${stats.criticalAlerts} critical`}
          trend={stats.alertsTrend}
          color={CHART_COLORS.high}
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="MTTR"
          value={formatDuration(stats.mttr)}
          trend={stats.mttrTrend}
          color={CHART_COLORS.primary}
          invertTrend
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Event Trend Chart */}
        <div className="col-span-2 bg-[#1E293B] rounded-xl border border-[#334155] p-4">
          <h3 className="text-white font-semibold mb-4">Event Trend (24h)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mockTrendData}>
              <defs>
                <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SEVERITY_COLORS.critical} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={SEVERITY_COLORS.critical} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SEVERITY_COLORS.high} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={SEVERITY_COLORS.high} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="mediumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SEVERITY_COLORS.medium} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={SEVERITY_COLORS.medium} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: CHART_COLORS.tooltip, 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Area type="monotone" dataKey="critical" stroke={SEVERITY_COLORS.critical} fill="url(#criticalGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="high" stroke={SEVERITY_COLORS.high} fill="url(#highGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="medium" stroke={SEVERITY_COLORS.medium} fill="url(#mediumGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Distribution */}
        <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-4">
          <h3 className="text-white font-semibold mb-4">Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={stats.severityDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="count"
              >
                {stats.severityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.severity]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {stats.severityDistribution.map((item) => (
              <div key={item.severity} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[item.severity] }} />
                <span className="text-xs text-gray-400 capitalize">{item.severity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Top Threats */}
        <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-4">
          <h3 className="text-white font-semibold mb-4">Top Threats</h3>
          <div className="space-y-3">
            {stats.topThreats.map((threat, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-[#0F172A] rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityBadgeClass(threat.severity)}`}>
                    {threat.severity.toUpperCase()}
                  </span>
                  <span className="text-white text-sm">{threat.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">{formatNumber(threat.count)}</span>
                  {threat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-red-400" />
                  ) : threat.trend === 'down' ? (
                    <TrendingDown className="w-4 h-4 text-green-400" />
                  ) : (
                    <Minus className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Data Sources</h3>
            <span className="text-xs text-gray-400">{stats.activeSources}/{stats.totalSources} active</span>
          </div>
          <div className="space-y-3">
            {stats.eventsBySource.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-violet-400" />
                  <span className="text-gray-300 text-sm">{source.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-[#0F172A] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-violet-500 rounded-full"
                      style={{ width: `${(source.eventsPerSecond / 600) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-400 text-xs w-16 text-right">{source.eventsPerSecond} EPS</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-4">
          <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <ActivityRow key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
function StatCard({ 
  icon, label, value, subValue, trend, color, invertTrend 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  subValue?: string;
  trend?: number; 
  color: string;
  invertTrend?: boolean;
}) {
  const isPositive = invertTrend ? trend && trend < 0 : trend && trend > 0;
  const trendColor = isPositive ? 'text-green-400' : 'text-red-400';
  
  return (
    <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <span style={{ color }}>{icon}</span>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-gray-400 text-sm">{label}</span>
        {subValue && <span className="text-xs text-red-400">{subValue}</span>}
      </div>
    </div>
  );
}

// Activity Row Component
function ActivityRow({ activity }: { activity: ActivityItem }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'incident': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'alert': return <Shield className="w-4 h-4 text-orange-400" />;
      case 'playbook': return <Zap className="w-4 h-4 text-violet-400" />;
      default: return <Eye className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="flex items-start gap-3 p-2 bg-[#0F172A] rounded-lg">
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-300 text-sm truncate">{activity.title}</p>
        <p className="text-gray-500 text-xs mt-0.5">{formatTimestamp(activity.timestamp)}</p>
      </div>
      {activity.status && (
        <span className={`text-xs px-2 py-0.5 rounded ${
          activity.status === 'completed' ? 'bg-green-500/20 text-green-400' :
          activity.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-blue-500/20 text-blue-400'
        }`}>
          {activity.status}
        </span>
      )}
    </div>
  );
}

export default SOCDashboard;
