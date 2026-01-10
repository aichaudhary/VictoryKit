import React, { useState, useEffect } from 'react';
import {
  Code,
  Shield,
  AlertTriangle,
  GitBranch,
  FileSearch,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  TrendingDown,
  Play,
  Eye,
  FileCode,
  Lock,
  Bug,
  Zap,
} from 'lucide-react';

interface DashboardStats {
  totalScans: number;
  vulnerabilities: number;
  codeQuality: number;
  secureRepos: number;
}

interface RecentScan {
  id: string;
  repository: string;
  branch: string;
  status: 'completed' | 'running' | 'failed';
  vulnerabilities: { critical: number; high: number; medium: number; low: number };
  timestamp: string;
}

interface VulnerabilityCategory {
  name: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalScans: 1847,
    vulnerabilities: 156,
    codeQuality: 94.2,
    secureRepos: 38,
  });

  const [recentScans, setRecentScans] = useState<RecentScan[]>([
    { id: '1', repository: 'api-gateway', branch: 'main', status: 'completed', vulnerabilities: { critical: 0, high: 2, medium: 5, low: 8 }, timestamp: '5 mins ago' },
    { id: '2', repository: 'auth-service', branch: 'develop', status: 'running', vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 }, timestamp: '12 mins ago' },
    { id: '3', repository: 'payment-module', branch: 'feature/stripe', status: 'completed', vulnerabilities: { critical: 1, high: 3, medium: 7, low: 12 }, timestamp: '1 hour ago' },
    { id: '4', repository: 'user-service', branch: 'main', status: 'failed', vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 }, timestamp: '2 hours ago' },
    { id: '5', repository: 'frontend-app', branch: 'release/v2', status: 'completed', vulnerabilities: { critical: 0, high: 1, medium: 3, low: 5 }, timestamp: '3 hours ago' },
  ]);

  const vulnerabilityCategories: VulnerabilityCategory[] = [
    { name: 'SQL Injection', count: 12, trend: 'down', icon: <Bug size={18} />, color: 'text-red-400' },
    { name: 'XSS', count: 28, trend: 'down', icon: <Code size={18} />, color: 'text-orange-400' },
    { name: 'Hardcoded Secrets', count: 8, trend: 'up', icon: <Lock size={18} />, color: 'text-yellow-400' },
    { name: 'Insecure Dependencies', count: 45, trend: 'stable', icon: <GitBranch size={18} />, color: 'text-purple-400' },
    { name: 'Buffer Overflow', count: 3, trend: 'down', icon: <Zap size={18} />, color: 'text-pink-400' },
    { name: 'Path Traversal', count: 7, trend: 'stable', icon: <FileCode size={18} />, color: 'text-cyan-400' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-codesentinel-400" />;
      case 'running': return <Clock size={16} className="text-blue-400 animate-pulse" />;
      case 'failed': return <XCircle size={16} className="text-red-400" />;
      default: return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={14} className="text-red-400" />;
      case 'down': return <TrendingDown size={14} className="text-codesentinel-400" />;
      default: return <span className="text-gray-500">—</span>;
    }
  };

  return (
    <div className="min-h-screen bg-codesentinel-darker p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Security Dashboard</h1>
        <p className="text-gray-400">Continuous code security analysis and vulnerability detection</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-codesentinel-dark/50 rounded-xl p-6 border border-codesentinel-800/50 hover:border-codesentinel-600/50 transition-all hover:shadow-glow-green">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-codesentinel-600/20 rounded-lg">
              <FileSearch size={24} className="text-codesentinel-400" />
            </div>
            <span className="text-xs text-codesentinel-400 font-semibold bg-codesentinel-600/20 px-2 py-1 rounded">+12%</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Total Scans</h3>
          <p className="text-3xl font-bold text-white">{stats.totalScans.toLocaleString()}</p>
        </div>

        <div className="bg-codesentinel-dark/50 rounded-xl p-6 border border-codesentinel-800/50 hover:border-yellow-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <AlertTriangle size={24} className="text-yellow-400" />
            </div>
            <span className="text-xs text-red-400 font-semibold bg-red-500/20 px-2 py-1 rounded">-8%</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Vulnerabilities</h3>
          <p className="text-3xl font-bold text-white">{stats.vulnerabilities}</p>
        </div>

        <div className="bg-codesentinel-dark/50 rounded-xl p-6 border border-codesentinel-800/50 hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Code size={24} className="text-blue-400" />
            </div>
            <span className="text-xs text-codesentinel-400 font-semibold bg-codesentinel-600/20 px-2 py-1 rounded">A+</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Code Quality</h3>
          <p className="text-3xl font-bold text-white">{stats.codeQuality}%</p>
        </div>

        <div className="bg-codesentinel-dark/50 rounded-xl p-6 border border-codesentinel-800/50 hover:border-codesentinel-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-codesentinel-500/20 rounded-lg">
              <Shield size={24} className="text-codesentinel-400" />
            </div>
            <span className="text-xs text-codesentinel-400 font-semibold bg-codesentinel-600/20 px-2 py-1 rounded">95%</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Secure Repos</h3>
          <p className="text-3xl font-bold text-white">{stats.secureRepos}/40</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Scans */}
        <div className="lg:col-span-2 bg-codesentinel-dark/50 rounded-xl border border-codesentinel-800/50">
          <div className="p-6 border-b border-codesentinel-800/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Recent Scans</h2>
              <button className="text-sm text-codesentinel-400 hover:text-codesentinel-300 transition-colors">View All</button>
            </div>
          </div>
          <div className="divide-y divide-codesentinel-800/50">
            {recentScans.map((scan) => (
              <div key={scan.id} className="p-4 hover:bg-codesentinel-800/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(scan.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{scan.repository}</span>
                        <span className="text-xs text-gray-500 bg-codesentinel-800/50 px-2 py-0.5 rounded">{scan.branch}</span>
                      </div>
                      <span className="text-xs text-gray-500">{scan.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {scan.status === 'completed' && (
                      <div className="flex items-center gap-2 text-xs">
                        {scan.vulnerabilities.critical > 0 && <span className="text-red-400 font-semibold">{scan.vulnerabilities.critical}C</span>}
                        {scan.vulnerabilities.high > 0 && <span className="text-orange-400 font-semibold">{scan.vulnerabilities.high}H</span>}
                        {scan.vulnerabilities.medium > 0 && <span className="text-yellow-400">{scan.vulnerabilities.medium}M</span>}
                        {scan.vulnerabilities.low > 0 && <span className="text-gray-400">{scan.vulnerabilities.low}L</span>}
                      </div>
                    )}
                    <button className="p-2 hover:bg-codesentinel-700/30 rounded-lg text-gray-400 hover:text-codesentinel-400 transition-colors">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vulnerability Categories */}
        <div className="bg-codesentinel-dark/50 rounded-xl border border-codesentinel-800/50">
          <div className="p-6 border-b border-codesentinel-800/50">
            <h2 className="text-xl font-semibold text-white">Vulnerability Types</h2>
          </div>
          <div className="p-4 space-y-3">
            {vulnerabilityCategories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-codesentinel-800/20 hover:bg-codesentinel-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={cat.color}>{cat.icon}</span>
                  <span className="text-sm text-gray-300">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{cat.count}</span>
                  {getTrendIcon(cat.trend)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-codesentinel-gradient rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:shadow-glow-green transition-all">
          <Play size={20} />
          Start New Scan
        </button>
        <button className="p-4 bg-codesentinel-dark/50 border border-codesentinel-600/50 rounded-xl text-codesentinel-400 font-semibold flex items-center justify-center gap-2 hover:bg-codesentinel-800/30 transition-all">
          <GitBranch size={20} />
          Connect Repository
        </button>
        <button className="p-4 bg-codesentinel-dark/50 border border-codesentinel-600/50 rounded-xl text-codesentinel-400 font-semibold flex items-center justify-center gap-2 hover:bg-codesentinel-800/30 transition-all">
          <FileCode size={20} />
          Import Config
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
