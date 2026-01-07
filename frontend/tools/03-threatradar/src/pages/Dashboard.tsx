import React, { useEffect, useState } from 'react';
import {
  Radar,
  AlertTriangle,
  Shield,
  Activity,
  TrendingUp,
  Globe,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { threatRadarAPI } from '../services/api';

interface DashboardStats {
  activeThreats: number;
  criticalThreats: number;
  highThreats: number;
  mediumThreats: number;
  lowThreats: number;
  threatsBlocked24h: number;
  attackSurface: number;
  vulnerabilities: number;
  threatScore: number;
  lastScan: string;
}

interface ThreatItem {
  _id: string;
  threatId: string;
  name: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  status: string;
  detectedAt: string;
  indicators: string[];
}

interface AttackVector {
  vector: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [threats, setThreats] = useState<ThreatItem[]>([]);
  const [attackVectors, setAttackVectors] = useState<AttackVector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 15000); // Update every 15s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, threatsData, vectorsData] = await Promise.all([
        threatRadarAPI.dashboard.getStats(),
        threatRadarAPI.threats.list({ limit: 5, status: 'active' }),
        threatRadarAPI.intelligence.getAttackVectors()
      ]);

      setStats(statsData.data);
      setThreats(threatsData.data.threats || []);
      setAttackVectors(vectorsData.data.vectors || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      critical: 'text-red-500 bg-red-500/10',
      high: 'text-orange-500 bg-orange-500/10',
      medium: 'text-yellow-500 bg-yellow-500/10',
      low: 'text-green-500 bg-green-500/10'
    };
    return colors[severity] || 'text-gray-500 bg-gray-500/10';
  };

  const getSeverityBadge = (severity: string): string => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[severity] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <Radar className="w-16 h-16 text-threatradar-primary animate-radar-sweep" />
          <div className="absolute inset-0 rounded-full border-2 border-threatradar-primary/30 animate-ping"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Threat Radar</h1>
          <p className="text-gray-400">Real-time threat detection and intelligence</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Last scan: {stats?.lastScan ? new Date(stats.lastScan).toLocaleTimeString() : 'Never'}</span>
          </div>
          <button className="px-4 py-2 bg-threat-gradient text-white rounded-lg font-medium hover:shadow-lg hover:shadow-threatradar-primary/30 transition-all flex items-center space-x-2 animate-pulse-glow">
            <Radar className="w-4 h-4" />
            <span>Full Scan</span>
          </button>
        </div>
      </div>

      {/* Threat Score Banner */}
      <div className="bg-gradient-to-r from-threatradar-dark to-threatradar-darker p-6 rounded-2xl border border-threatradar-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-threatradar-primary/5 rounded-full blur-3xl"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-gray-400 mb-1">Organization Threat Score</p>
            <div className="flex items-center space-x-4">
              <span className="text-5xl font-bold text-white">{stats?.threatScore || 0}</span>
              <span className="text-gray-500">/100</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                (stats?.threatScore || 0) < 30 ? 'bg-green-500/20 text-green-500' :
                (stats?.threatScore || 0) < 60 ? 'bg-yellow-500/20 text-yellow-500' :
                (stats?.threatScore || 0) < 80 ? 'bg-orange-500/20 text-orange-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                {(stats?.threatScore || 0) < 30 ? 'Low Risk' :
                 (stats?.threatScore || 0) < 60 ? 'Moderate' :
                 (stats?.threatScore || 0) < 80 ? 'Elevated' : 'Critical'}
              </span>
            </div>
          </div>
          <div className="w-48 h-48 relative">
            <div className="absolute inset-0 border-4 border-threatradar-primary/20 rounded-full"></div>
            <div className="absolute inset-4 border-4 border-threatradar-primary/30 rounded-full"></div>
            <div className="absolute inset-8 border-4 border-threatradar-primary/40 rounded-full flex items-center justify-center">
              <Radar className="w-12 h-12 text-threatradar-primary animate-radar-sweep" />
            </div>
            <div className="absolute top-1/2 left-1/2 w-1 h-16 bg-threat-gradient origin-bottom -translate-x-1/2 animate-radar-sweep"></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Threats */}
        <div className="bg-gradient-to-br from-threatradar-dark to-threatradar-darker p-6 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-threat-gradient rounded-xl flex items-center justify-center shadow-glow-red group-hover:animate-pulse-glow">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-gray-400">THREATS</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{stats?.activeThreats || 0}</h3>
          <p className="text-sm text-gray-400">Active threats</p>
          <div className="mt-3 flex space-x-2">
            <span className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-500">{stats?.criticalThreats || 0} critical</span>
            <span className="px-2 py-1 text-xs rounded bg-orange-500/20 text-orange-500">{stats?.highThreats || 0} high</span>
          </div>
        </div>

        {/* Threats Blocked */}
        <div className="bg-gradient-to-br from-threatradar-dark to-threatradar-darker p-6 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-gray-400">24H</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{stats?.threatsBlocked24h || 0}</h3>
          <p className="text-sm text-gray-400">Threats blocked</p>
          <div className="mt-3 flex items-center text-xs text-green-500">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Auto-remediated
          </div>
        </div>

        {/* Attack Surface */}
        <div className="bg-gradient-to-br from-threatradar-dark to-threatradar-darker p-6 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-gray-400">EXPOSURE</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{stats?.attackSurface || 0}</h3>
          <p className="text-sm text-gray-400">Attack surface points</p>
          <div className="mt-3 flex items-center text-xs text-yellow-500">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {stats?.vulnerabilities || 0} vulnerabilities
          </div>
        </div>

        {/* Threat Intelligence */}
        <div className="bg-gradient-to-br from-threatradar-dark to-threatradar-darker p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-gray-400">INTEL</span>
          </div>
          <h3 className="text-2xl font-bold text-white">Live</h3>
          <p className="text-sm text-gray-400">Threat feeds active</p>
          <div className="mt-3 flex items-center text-xs text-green-500">
            <Activity className="w-4 h-4 mr-1 animate-pulse" />
            Synced 2m ago
          </div>
        </div>
      </div>

      {/* Active Threats & Attack Vectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Threats List */}
        <div className="bg-gradient-to-br from-threatradar-dark to-threatradar-darker p-6 rounded-2xl border border-threatradar-primary/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Active Threats</h2>
            <a href="/threats" className="text-sm text-threatradar-primary hover:text-threatradar-accent flex items-center">
              View all
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </a>
          </div>
          <div className="space-y-4">
            {threats.map((threat) => (
              <div key={threat._id} className="p-4 bg-threatradar-darker rounded-xl border border-threatradar-primary/10 hover:border-threatradar-primary/30 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className={`w-3 h-3 rounded-full ${getSeverityBadge(threat.severity)} animate-pulse`}></span>
                    <h3 className="font-medium text-white group-hover:text-threatradar-accent transition-colors">{threat.name}</h3>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(threat.severity)}`}>
                    {threat.severity.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{threat.type}</span>
                  <span>{new Date(threat.detectedAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {threats.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>No active threats detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Attack Vectors */}
        <div className="bg-gradient-to-br from-threatradar-dark to-threatradar-darker p-6 rounded-2xl border border-threatradar-primary/20">
          <h2 className="text-xl font-bold text-white mb-6">Attack Vectors</h2>
          <div className="space-y-4">
            {attackVectors.map((vector, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{vector.vector}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">{vector.count}</span>
                    <span className={`text-xs ${
                      vector.trend === 'up' ? 'text-red-500' : 
                      vector.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                    }`}>
                      {vector.trend === 'up' ? '↑' : vector.trend === 'down' ? '↓' : '→'}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-threatradar-darker h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-threat-gradient transition-all duration-500"
                    style={{ width: `${vector.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            {attackVectors.length === 0 && (
              <div className="space-y-4">
                {['Phishing', 'Malware', 'DDoS', 'SQL Injection', 'XSS'].map((name, i) => (
                  <div key={name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{name}</span>
                      <span className="text-white font-medium">{Math.floor(Math.random() * 50) + 10}</span>
                    </div>
                    <div className="w-full bg-threatradar-darker h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-threat-gradient"
                        style={{ width: `${80 - i * 15}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-threatradar-dark to-threatradar-darker p-6 rounded-2xl border border-threatradar-primary/20">
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-threat-gradient text-white rounded-xl font-medium hover:shadow-lg hover:shadow-threatradar-primary/30 transition-all flex flex-col items-center space-y-2">
            <Radar className="w-6 h-6" />
            <span>Run Scan</span>
          </button>
          <button className="p-4 bg-threatradar-primary/10 text-threatradar-primary border border-threatradar-primary/20 rounded-xl font-medium hover:bg-threatradar-primary/20 transition-all flex flex-col items-center space-y-2">
            <Globe className="w-6 h-6" />
            <span>Update Intel</span>
          </button>
          <button className="p-4 bg-threatradar-primary/10 text-threatradar-primary border border-threatradar-primary/20 rounded-xl font-medium hover:bg-threatradar-primary/20 transition-all flex flex-col items-center space-y-2">
            <Shield className="w-6 h-6" />
            <span>Block Threats</span>
          </button>
          <button className="p-4 bg-threatradar-primary/10 text-threatradar-primary border border-threatradar-primary/20 rounded-xl font-medium hover:bg-threatradar-primary/20 transition-all flex flex-col items-center space-y-2">
            <Zap className="w-6 h-6" />
            <span>Auto-Respond</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
