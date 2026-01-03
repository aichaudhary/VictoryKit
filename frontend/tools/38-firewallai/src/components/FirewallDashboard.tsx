import React from 'react';
import { Shield, AlertTriangle, Activity, TrendingUp, Clock, Users } from 'lucide-react';

interface FirewallDashboardProps {
  rules: any[];
  alerts: any[];
  trafficLogs: any[];
  realTimeData: any;
  onAnalyzeThreats: () => void;
  isLoading: boolean;
}

const FirewallDashboard: React.FC<FirewallDashboardProps> = ({
  rules,
  alerts,
  trafficLogs,
  realTimeData,
  onAnalyzeThreats,
  isLoading
}) => {
  const activeRules = rules.filter(r => r.enabled);
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const recentLogs = trafficLogs.slice(-10);

  const stats = [
    {
      label: 'Active Rules',
      value: activeRules.length,
      icon: Shield,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    {
      label: 'Critical Alerts',
      value: criticalAlerts.length,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    },
    {
      label: 'Traffic Volume',
      value: realTimeData?.trafficVolume || 0,
      icon: Activity,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      suffix: 'Mbps'
    },
    {
      label: 'Threat Score',
      value: realTimeData?.threatScore || 0,
      icon: TrendingUp,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`p-6 rounded-xl border ${stat.bgColor} ${stat.borderColor} backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}{stat.suffix}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor} ${stat.borderColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Recent Activity
            </h3>
            <button
              onClick={onAnalyzeThreats}
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Threats'}
            </button>
          </div>

          <div className="space-y-3">
            {recentLogs.length > 0 ? (
              recentLogs.map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      log.threat_level === 'high' ? 'bg-red-500' :
                      log.threat_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{log.source_ip} → {log.destination_ip}</p>
                      <p className="text-xs text-gray-400">{log.protocol} • {log.port}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-gray-500">{log.bytes} bytes</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl p-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Active Alerts
          </h3>

          <div className="space-y-3">
            {criticalAlerts.length > 0 ? (
              criticalAlerts.slice(0, 5).map((alert, index) => (
                <div key={index} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-400">{alert.title}</p>
                      <p className="text-xs text-gray-400">{alert.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No critical alerts</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-green-400" />
          System Health
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
            <h4 className="font-bold text-green-400">Firewall Status</h4>
            <p className="text-sm text-gray-400">All systems operational</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="font-bold text-blue-400">Traffic Flow</h4>
            <p className="text-sm text-gray-400">Normal throughput</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-yellow-400" />
            </div>
            <h4 className="font-bold text-yellow-400">Threat Level</h4>
            <p className="text-sm text-gray-400">Low to moderate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirewallDashboard;