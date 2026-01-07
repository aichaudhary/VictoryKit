import React, { useEffect, useState } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Target,
  ArrowUpRight,
  Zap,
  Network,
  Server,
  Activity
} from 'lucide-react';
import { vulnScanAPI } from '../services/api';

interface DashboardStats {
  totalAssets: number;
  vulnerabilitiesFound: number;
  criticalVulns: number;
  highVulns: number;
  mediumVulns: number;
  lowVulns: number;
  patchedVulns: number;
  activeScan: number;
  riskScore: number;
  lastScanTime: string;
}

interface RecentVulnerability {
  _id: string;
  title: string;
  cve: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  asset: string;
  status: string;
  detectedAt: string;
  cvss: number;
}

interface AssetCategory {
  name: string;
  count: number;
  vulnerable: number;
  percentage: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<RecentVulnerability[]>([]);
  const [assets, setAssets] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, vulnsData, assetsData] = await Promise.all([
        vulnScanAPI.dashboard.getStats(),
        vulnScanAPI.vulnerabilities.list({ limit: 5, status: 'open' }),
        vulnScanAPI.analytics.getAssetCategories()
      ]);

      setStats(statsData.data);
      setVulnerabilities(vulnsData.data.vulnerabilities || []);
      setAssets(assetsData.data.categories || []);
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
      low: 'text-blue-500 bg-blue-500/10'
    };
    return colors[severity] || 'text-gray-500 bg-gray-500/10';
  };

  const getSeverityBadge = (severity: string): string => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    };
    return colors[severity] || 'bg-gray-500';
  };

  const getRiskScoreColor = (score: number): string => {
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <Target className="w-16 h-16 text-vuln-primary animate-radar-sweep" />
          <div className="absolute inset-0 rounded-full border-2 border-vuln-primary/30 animate-ping"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">VulnScan</h1>
          <p className="text-gray-400">Vulnerability scanning & asset management</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Last scan: {stats?.lastScanTime ? new Date(stats.lastScanTime).toLocaleTimeString() : 'Never'}</span>
          </div>
          <button className="px-4 py-2 bg-vuln-gradient text-white rounded-lg font-medium hover:shadow-lg hover:shadow-vuln-primary/30 transition-all flex items-center space-x-2 animate-glow">
            <Target className="w-4 h-4" />
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Critical Vulnerabilities */}
        <div className="bg-gradient-to-br from-vuln-dark to-vuln-darker p-6 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-critical-gradient rounded-xl flex items-center justify-center shadow-glow-critical group-hover:animate-vulnPulse">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-gray-400">CRITICAL</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{stats?.criticalVulns || 0}</h3>
          <p className="text-sm text-gray-400">Critical vulnerabilities</p>
          <div className="mt-3 flex items-center text-xs text-red-500">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Immediate action required
          </div>
        </div>

        {/* High Priority */}
        <div className="bg-gradient-to-br from-vuln-dark to-vuln-darker p-6 rounded-2xl border border-orange-500/20 hover:border-orange-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-gray-400">HIGH</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{stats?.highVulns || 0}</h3>
          <p className="text-sm text-gray-400">High priority</p>
          <div className="mt-3 flex items-center text-xs text-orange-500">
            <Clock className="w-4 h-4 mr-1" />
            Patch soon
          </div>
        </div>

        {/* Total Assets */}
        <div className="bg-gradient-to-br from-vuln-dark to-vuln-darker p-6 rounded-2xl border border-vuln-primary/20 hover:border-vuln-primary/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-vuln-gradient rounded-xl flex items-center justify-center shadow-glow-blue">
              <Server className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-gray-400">ASSETS</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{stats?.totalAssets || 0}</h3>
          <p className="text-sm text-gray-400">Monitored assets</p>
          <div className="mt-3 flex items-center text-xs text-vuln-accent">
            <Network className="w-4 h-4 mr-1" />
            {stats?.activeScan || 0} scanning now
          </div>
        </div>

        {/* Risk Score */}
        <div className="bg-gradient-to-br from-vuln-dark to-vuln-darker p-6 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-gray-400">RISK</span>
          </div>
          <h3 className={`text-2xl font-bold ${getRiskScoreColor(stats?.riskScore || 0)}`}>
            {stats?.riskScore || 0}/100
          </h3>
          <p className="text-sm text-gray-400">Overall risk score</p>
          <div className="mt-3 w-full bg-vuln-darker h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                (stats?.riskScore || 0) >= 80 ? 'bg-red-500' :
                (stats?.riskScore || 0) >= 60 ? 'bg-orange-500' :
                (stats?.riskScore || 0) >= 40 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${stats?.riskScore || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Vulnerabilities & Asset Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Vulnerabilities */}
        <div className="bg-gradient-to-br from-vuln-dark to-vuln-darker p-6 rounded-2xl border border-vuln-primary/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Vulnerabilities</h2>
            <a href="/vulnerabilities" className="text-sm text-vuln-primary hover:text-vuln-accent flex items-center">
              View all
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </a>
          </div>
          <div className="space-y-4">
            {vulnerabilities.map((vuln) => (
              <div key={vuln._id} className="p-4 bg-vuln-darker rounded-xl border border-vuln-primary/10 hover:border-vuln-primary/30 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className={`w-3 h-3 rounded-full ${getSeverityBadge(vuln.severity)} animate-pulse`}></span>
                    <div>
                      <h3 className="font-medium text-white truncate max-w-[200px] group-hover:text-vuln-accent transition-colors">
                        {vuln.title}
                      </h3>
                      <span className="text-xs text-gray-500">{vuln.cve}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(vuln.severity)}`}>
                      {vuln.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-vuln-accent mt-1">CVSS {vuln.cvss}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span className="truncate max-w-[150px]">{vuln.asset}</span>
                  <span>{new Date(vuln.detectedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {vulnerabilities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>No open vulnerabilities</p>
              </div>
            )}
          </div>
        </div>

        {/* Asset Categories */}
        <div className="bg-gradient-to-br from-vuln-dark to-vuln-darker p-6 rounded-2xl border border-vuln-primary/20">
          <h2 className="text-xl font-bold text-white mb-6">Asset Categories</h2>
          <div className="space-y-4">
            {assets.length > 0 ? assets.map((asset, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{asset.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">{asset.count}</span>
                    <span className="text-xs text-red-500">({asset.vulnerable} vulnerable)</span>
                  </div>
                </div>
                <div className="w-full bg-vuln-darker h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-vuln-gradient transition-all duration-500"
                    style={{ width: `${asset.percentage}%` }}
                  />
                </div>
              </div>
            )) : (
              <div className="space-y-4">
                {['Web Servers', 'Databases', 'Network Devices', 'Workstations', 'Cloud Services'].map((name, i) => (
                  <div key={name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{name}</span>
                      <span className="text-white font-medium">{Math.floor(Math.random() * 50) + 10}</span>
                    </div>
                    <div className="w-full bg-vuln-darker h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-vuln-gradient"
                        style={{ width: `${90 - i * 15}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vulnerability Distribution */}
      <div className="bg-gradient-to-br from-vuln-dark to-vuln-darker p-6 rounded-2xl border border-vuln-primary/20">
        <h2 className="text-xl font-bold text-white mb-6">Vulnerability Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="text-3xl font-bold text-red-500">{stats?.criticalVulns || 0}</div>
            <div className="text-sm text-gray-400 mt-1">Critical</div>
          </div>
          <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
            <div className="text-3xl font-bold text-orange-500">{stats?.highVulns || 0}</div>
            <div className="text-sm text-gray-400 mt-1">High</div>
          </div>
          <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="text-3xl font-bold text-yellow-500">{stats?.mediumVulns || 0}</div>
            <div className="text-sm text-gray-400 mt-1">Medium</div>
          </div>
          <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="text-3xl font-bold text-blue-500">{stats?.lowVulns || 0}</div>
            <div className="text-sm text-gray-400 mt-1">Low</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-vuln-dark to-vuln-darker p-6 rounded-2xl border border-vuln-primary/20">
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-vuln-gradient text-white rounded-xl font-medium hover:shadow-lg hover:shadow-vuln-primary/30 transition-all flex flex-col items-center space-y-2">
            <Target className="w-6 h-6" />
            <span>Quick Scan</span>
          </button>
          <button className="p-4 bg-vuln-primary/10 text-vuln-primary border border-vuln-primary/20 rounded-xl font-medium hover:bg-vuln-primary/20 transition-all flex flex-col items-center space-y-2">
            <Network className="w-6 h-6" />
            <span>Network Scan</span>
          </button>
          <button className="p-4 bg-vuln-primary/10 text-vuln-primary border border-vuln-primary/20 rounded-xl font-medium hover:bg-vuln-primary/20 transition-all flex flex-col items-center space-y-2">
            <Server className="w-6 h-6" />
            <span>Add Asset</span>
          </button>
          <button className="p-4 bg-vuln-primary/10 text-vuln-primary border border-vuln-primary/20 rounded-xl font-medium hover:bg-vuln-primary/20 transition-all flex flex-col items-center space-y-2">
            <Zap className="w-6 h-6" />
            <span>Auto-Remediate</span>
          </button>
        </div>
      </div>

      {/* Monitoring Status */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-500 font-medium">Continuous Monitoring Active</span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>{stats?.totalAssets || 0} assets monitored</span>
          <span>•</span>
          <span>{stats?.patchedVulns || 0} patched this month</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
