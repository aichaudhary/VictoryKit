import React from 'react';
import { 
  Activity, Shield, AlertTriangle, Clock, Users, 
  Target, TrendingUp, TrendingDown, Zap, Eye 
} from 'lucide-react';
import { DashboardStats, SecurityAlert, Incident } from '../types';
import { SEVERITY_COLORS } from '../constants';

interface DashboardOverviewProps {
  stats: DashboardStats;
  recentAlerts: SecurityAlert[];
  activeIncidents: Incident[];
  onSelectAlert: (alert: SecurityAlert) => void;
  onSelectIncident: (incident: Incident) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  recentAlerts,
  activeIncidents,
  onSelectAlert,
  onSelectIncident
}) => {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard 
          icon={AlertTriangle} 
          label="Open Incidents" 
          value={stats.open_incidents}
          trend={-12}
          color="text-red-400"
          bgColor="bg-red-500/10"
        />
        <StatCard 
          icon={Zap} 
          label="Alerts Today" 
          value={stats.alerts_today}
          trend={8}
          color="text-orange-400"
          bgColor="bg-orange-500/10"
        />
        <StatCard 
          icon={Shield} 
          label="Threats Neutralized" 
          value={stats.threats_neutralized}
          trend={24}
          color="text-green-400"
          bgColor="bg-green-500/10"
        />
        <StatCard 
          icon={Users} 
          label="Team Online" 
          value={stats.team_online}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
        />
      </div>

      {/* MTTD/MTTR */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Mean Time to Detect</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.mean_time_to_detect}m</div>
          <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
            <TrendingDown className="w-3 h-3" />
            <span>15% faster than last week</span>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Mean Time to Respond</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.mean_time_to_respond}m</div>
          <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
            <TrendingDown className="w-3 h-3" />
            <span>8% faster than last week</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-slate-900/50 rounded-xl border border-white/10">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Recent Alerts
            </h3>
            <span className="text-xs text-gray-500">{recentAlerts.length} new</span>
          </div>
          <div className="p-2 max-h-64 overflow-y-auto">
            {recentAlerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                onClick={() => onSelectAlert(alert)}
                className="p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${
                    alert.severity === 'critical' ? 'bg-red-500' :
                    alert.severity === 'high' ? 'bg-orange-500' :
                    alert.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <span className="text-sm text-white font-medium line-clamp-1">{alert.title}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{alert.source}</span>
                  <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Incidents */}
        <div className="bg-slate-900/50 rounded-xl border border-white/10">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-red-400" />
              Active Incidents
            </h3>
            <span className="text-xs text-gray-500">{activeIncidents.length} open</span>
          </div>
          <div className="p-2 max-h-64 overflow-y-auto">
            {activeIncidents.slice(0, 5).map((incident) => (
              <div
                key={incident.id}
                onClick={() => onSelectIncident(incident)}
                className="p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${SEVERITY_COLORS[incident.severity].bg} ${SEVERITY_COLORS[incident.severity].text}`}>
                    {incident.severity.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm text-white font-medium line-clamp-1">{incident.title}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{incident.status.replace('_', ' ')}</span>
                  <span>{incident.assigned_to.length} assigned</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Hunts */}
      <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            Active Threat Hunts
          </h3>
          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-medium">
            {stats.active_hunts} Running
          </span>
        </div>
        <div className="text-sm text-gray-400">
          Proactive threat hunting in progress across {stats.active_hunts} campaigns
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: number;
  trend?: number;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, trend, color, bgColor }) => (
  <div className={`${bgColor} rounded-xl border border-white/10 p-4`}>
    <div className="flex items-center justify-between mb-2">
      <Icon className={`w-5 h-5 ${color}`} />
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-xs text-gray-400 mt-1">{label}</div>
  </div>
);

export default DashboardOverview;
