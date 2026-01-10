import React from 'react';
import { 
  Wifi, Radio, Laptop, ShieldAlert, Activity, 
  CheckCircle, AlertTriangle, XCircle 
} from 'lucide-react';
import { DashboardData } from '../types';

interface DashboardOverviewProps {
  data: DashboardData | null;
  isLoading: boolean;
  onRefresh: () => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ data, isLoading, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <Wifi className="w-16 h-16 mx-auto text-gray-600 mb-4" />
        <p className="text-gray-400">No dashboard data available</p>
        <button 
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white"
        >
          Refresh Dashboard
        </button>
      </div>
    );
  }

  const { overview } = data;

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/50';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/50';
    if (score >= 40) return 'bg-orange-500/20 border-orange-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  return (
    <div className="space-y-6">
      {/* Health Score Card */}
      <div className={`p-6 rounded-xl border ${getHealthBg(data.healthScore)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white mb-1">Network Health Score</h3>
            <p className="text-gray-400 text-sm">Overall wireless security posture</p>
          </div>
          <div className={`text-5xl font-bold ${getHealthColor(data.healthScore)}`}>
            {data.healthScore}
            <span className="text-2xl">/100</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Networks */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Wifi className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-gray-400 text-sm">Networks</span>
          </div>
          <div className="text-2xl font-bold text-white">{overview.activeNetworks}</div>
          <div className="text-xs text-gray-500">of {overview.totalNetworks} total</div>
          {overview.rogueNetworks > 0 && (
            <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {overview.rogueNetworks} rogue detected
            </div>
          )}
        </div>

        {/* Access Points */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Radio className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-gray-400 text-sm">Access Points</span>
          </div>
          <div className="text-2xl font-bold text-white">{overview.onlineAPs}</div>
          <div className="text-xs text-gray-500">of {overview.totalAPs} online</div>
          {overview.totalAPs - overview.onlineAPs > 0 && (
            <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              {overview.totalAPs - overview.onlineAPs} offline
            </div>
          )}
        </div>

        {/* Connected Clients */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Laptop className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">Clients</span>
          </div>
          <div className="text-2xl font-bold text-white">{overview.connectedClients}</div>
          <div className="text-xs text-gray-500">connected devices</div>
        </div>

        {/* Security Alerts */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-gray-400 text-sm">Alerts</span>
          </div>
          <div className="text-2xl font-bold text-white">{overview.newAlerts}</div>
          <div className="text-xs text-gray-500">new alerts</div>
          {overview.criticalAlerts > 0 && (
            <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {overview.criticalAlerts} critical
            </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Networks by Type */}
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <h4 className="text-white font-medium mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Networks by Type
          </h4>
          <div className="space-y-3">
            {data.networksByType.length > 0 ? (
              data.networksByType.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <span className="text-gray-400 capitalize">{item._id || 'Unknown'}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${Math.min((item.count / overview.totalNetworks) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-white font-medium w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No network data available</p>
            )}
          </div>
        </div>

        {/* Clients by Device Type */}
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <h4 className="text-white font-medium mb-4 flex items-center gap-2">
            <Laptop className="w-5 h-5 text-purple-400" />
            Clients by Device
          </h4>
          <div className="space-y-3">
            {data.clientsByDevice.length > 0 ? (
              data.clientsByDevice.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <span className="text-gray-400 capitalize">{item._id || 'Unknown'}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${Math.min((item.count / overview.totalClients) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-white font-medium w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No client data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
        <h4 className="text-white font-medium mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          Recent Security Alerts
        </h4>
        {data.recentAlerts.length > 0 ? (
          <div className="space-y-3">
            {data.recentAlerts.slice(0, 5).map((alert) => (
              <div 
                key={alert.alertId} 
                className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.severity === 'critical' ? 'bg-red-500' :
                    alert.severity === 'high' ? 'bg-orange-500' :
                    alert.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-white text-sm font-medium">{alert.title}</p>
                    <p className="text-gray-500 text-xs">{alert.alertType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded ${
                    alert.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                    alert.status === 'acknowledged' ? 'bg-yellow-500/20 text-yellow-400' :
                    alert.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {alert.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            No active alerts
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
