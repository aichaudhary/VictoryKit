import React, { useState, useEffect } from 'react';
import { 
  Shield, Smartphone, AlertTriangle, CheckCircle, 
  TrendingUp, Activity, Zap, Clock, FileText, Users 
} from 'lucide-react';
import { mobileShieldAPI } from '../services/api';

interface DashboardStats {
  totalApps: number;
  iosApps: number;
  androidApps: number;
  criticalVulnerabilities: number;
  activeThreats: number;
  complianceScore: number;
  scansToday: number;
  devicesEnrolled: number;
}

interface RecentScan {
  scanId: string;
  appName: string;
  platform: string;
  status: string;
  findings: number;
  timestamp: string;
}

interface ThreatActivity {
  threatId: string;
  appName: string;
  type: string;
  severity: string;
  timestamp: string;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [threatActivity, setThreatActivity] = useState<ThreatActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, scansRes, threatsRes] = await Promise.all([
        mobileShieldAPI.dashboard.getStats(),
        mobileShieldAPI.dashboard.getRecentScans(),
        mobileShieldAPI.dashboard.getThreats()
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (scansRes.data) setRecentScans(scansRes.data);
      if (threatsRes.data) setThreatActivity(threatsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'text-red-500 bg-red-500/10',
      high: 'text-orange-500 bg-orange-500/10',
      medium: 'text-yellow-500 bg-yellow-500/10',
      low: 'text-blue-500 bg-blue-500/10'
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mobileshield-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mobile Security Dashboard</h1>
          <p className="text-gray-400">Real-time overview of your mobile application security posture</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-600 bg-gray-700 text-mobileshield-primary focus:ring-mobileshield-primary"
            />
            Auto-refresh (30s)
          </label>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-mobileshield-primary text-white rounded-lg hover:bg-mobileshield-primary/80 transition-colors"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Apps */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-mobileshield-primary/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-mobileshield-primary/10 rounded-lg">
              <Smartphone className="w-6 h-6 text-mobileshield-primary" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Total Apps</h3>
          <p className="text-3xl font-bold text-white mb-2">{stats?.totalApps || 0}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              iOS: {stats?.iosApps || 0}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Android: {stats?.androidApps || 0}
            </span>
          </div>
        </div>

        {/* Critical Vulnerabilities */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-red-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <Activity className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Critical Vulnerabilities</h3>
          <p className="text-3xl font-bold text-white mb-2">{stats?.criticalVulnerabilities || 0}</p>
          <p className="text-xs text-red-400">Requires immediate attention</p>
        </div>

        {/* Active Threats */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-orange-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Zap className="w-6 h-6 text-orange-500" />
            </div>
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Active Threats</h3>
          <p className="text-3xl font-bold text-white mb-2">{stats?.activeThreats || 0}</p>
          <p className="text-xs text-orange-400">Last 24 hours</p>
        </div>

        {/* Compliance Score */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-green-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <Shield className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Compliance Score</h3>
          <p className="text-3xl font-bold text-white mb-2">{stats?.complianceScore || 0}%</p>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats?.complianceScore || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recent Scans & Threat Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scans */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-mobileshield-primary" />
              Recent Scans
            </h2>
            <span className="text-sm text-gray-400">{stats?.scansToday || 0} today</span>
          </div>
          <div className="space-y-3">
            {recentScans.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent scans</p>
            ) : (
              recentScans.map((scan) => (
                <div
                  key={scan.scanId}
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/30 hover:border-mobileshield-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-mobileshield-primary/10 rounded-lg">
                      <Smartphone className="w-5 h-5 text-mobileshield-primary" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{scan.appName}</p>
                      <p className="text-sm text-gray-400">{scan.platform} • {scan.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{scan.findings} findings</p>
                    <p className="text-xs text-gray-500">{new Date(scan.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Threat Activity */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Threat Activity
            </h2>
            <span className="text-sm text-gray-400">Live feed</span>
          </div>
          <div className="space-y-3">
            {threatActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active threats</p>
            ) : (
              threatActivity.map((threat) => (
                <div
                  key={threat.threatId}
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/30 hover:border-orange-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getSeverityColor(threat.severity)}`}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{threat.appName}</p>
                      <p className="text-sm text-gray-400">{threat.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                      {threat.severity}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{new Date(threat.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-6 bg-gradient-to-br from-mobileshield-primary to-mobileshield-secondary rounded-xl text-white hover:shadow-lg hover:shadow-mobileshield-primary/25 transition-all">
          <Smartphone className="w-8 h-8 mb-2" />
          <h3 className="font-bold mb-1">Upload New App</h3>
          <p className="text-sm opacity-90">Scan IPA/APK file</p>
        </button>
        <button className="p-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl text-white hover:shadow-lg transition-all">
          <Activity className="w-8 h-8 mb-2" />
          <h3 className="font-bold mb-1">Run SAST Scan</h3>
          <p className="text-sm opacity-90">Static analysis</p>
        </button>
        <button className="p-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl text-white hover:shadow-lg transition-all">
          <FileText className="w-8 h-8 mb-2" />
          <h3 className="font-bold mb-1">Generate Report</h3>
          <p className="text-sm opacity-90">Compliance audit</p>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
