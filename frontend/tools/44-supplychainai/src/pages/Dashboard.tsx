import React, { useEffect, useState } from 'react';
import {
  Database,
  Activity,
  Shield,
  CheckCircle2,
  TrendingUp,
  HardDrive,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { supplyChainAIAPI } from '../services/api';

interface DashboardStats {
  totalCapacity: number;
  usedCapacity: number;
  activeJobs: number;
  scheduledJobs: number;
  ransomwareBlocked: number;
  complianceScore: number;
  successRate: number;
  dedupRatio: number;
}

interface BackupJob {
  _id: string;
  name: string;
  type: string;
  status: string;
  lastRun: {
    startTime: string;
    endTime?: string;
    status: string;
    bytesProcessed: number;
    duration: number;
  };
  target: {
    type: string;
    name: string;
  };
}

interface StoragePool {
  _id: string;
  name: string;
  type: string;
  tier: string;
  capacity: {
    total: number;
    used: number;
    available: number;
  };
  health: {
    status: string;
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<BackupJob[]>([]);
  const [storagePools, setStoragePools] = useState<StoragePool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, jobsData, storageData] = await Promise.all([
        supplyChainAIAPI.dashboard.getStats(),
        supplyChainAIAPI.jobs.list({ limit: 10, sortBy: 'lastRun.startTime', sortOrder: 'desc' }),
        supplyChainAIAPI.storage.list()
      ]);

      setStats(statsData.data);
      setRecentJobs(jobsData.data.jobs || []);
      setStoragePools(storageData.data.pools || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1e15) return `${(bytes / 1e15).toFixed(2)} PB`;
    if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(2)} TB`;
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
    return `${(bytes / 1e6).toFixed(2)} MB`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      completed: 'text-green-500',
      running: 'text-blue-500',
      failed: 'text-red-500',
      scheduled: 'text-yellow-500',
      healthy: 'text-green-500',
      degraded: 'text-yellow-500'
    };
    return colors[status.toLowerCase()] || 'text-gray-500';
  };

  const getTierColor = (tier: string): string => {
    const colors: Record<string, string> = {
      hot: 'bg-backup-hot text-white',
      warm: 'bg-backup-warm text-white',
      cold: 'bg-backup-cold text-white',
      archive: 'bg-backup-archive text-white'
    };
    return colors[tier.toLowerCase()] || 'bg-gray-500 text-white';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-supplychainai-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Backup Dashboard</h1>
          <p className="text-gray-400">Enterprise backup health and monitoring</p>
        </div>
        <div className="flex items-center space-x-3 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Capacity */}
        <div className="bg-gradient-to-br from-supplychainai-dark to-supplychainai-darker p-6 rounded-2xl border border-supplychainai-primary/20 hover:border-supplychainai-primary/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-backup-gradient rounded-xl flex items-center justify-center glow-blue">
              <Database className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-gray-400">CAPACITY</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">{formatBytes(stats?.totalCapacity || 0)}</h3>
            <p className="text-sm text-gray-400">
              {formatBytes(stats?.usedCapacity || 0)} used
            </p>
            <div className="w-full bg-supplychainai-darker h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-backup-gradient transition-all duration-500"
                style={{ width: `${stats ? (stats.usedCapacity / stats.totalCapacity) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="bg-gradient-to-br from-supplychainai-dark to-supplychainai-darker p-6 rounded-2xl border border-supplychainai-secondary/20 hover:border-supplychainai-secondary/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-supplychainai-secondary to-supplychainai-primary rounded-xl flex items-center justify-center glow-cyan">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-gray-400">JOBS</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">{stats?.activeJobs || 0}</h3>
            <p className="text-sm text-gray-400">
              {stats?.scheduledJobs || 0} scheduled
            </p>
            <div className="flex items-center text-xs text-green-500">
              <TrendingUp className="w-4 h-4 mr-1" />
              Running smoothly
            </div>
          </div>
        </div>

        {/* Ransomware Blocked */}
        <div className="bg-gradient-to-br from-supplychainai-dark to-supplychainai-darker p-6 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-gray-400">THREATS</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">{stats?.ransomwareBlocked || 0}</h3>
            <p className="text-sm text-gray-400">Blocked (24h)</p>
            <div className="flex items-center text-xs text-green-500">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              All backups protected
            </div>
          </div>
        </div>

        {/* Compliance Score */}
        <div className="bg-gradient-to-br from-supplychainai-dark to-supplychainai-darker p-6 rounded-2xl border border-supplychainai-accent/20 hover:border-supplychainai-accent/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-supplychainai-accent to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-supplychainai-accent/20">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-gray-400">COMPLIANCE</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">{stats?.complianceScore || 0}/100</h3>
            <p className="text-sm text-gray-400">Overall score</p>
            <div className="w-full bg-supplychainai-darker h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-supplychainai-accent to-purple-600 transition-all duration-500"
                style={{ width: `${stats?.complianceScore || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Backup Jobs */}
      <div className="bg-gradient-to-br from-supplychainai-dark to-supplychainai-darker p-6 rounded-2xl border border-supplychainai-primary/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Backup Jobs</h2>
          <a href="/jobs" className="text-sm text-supplychainai-primary hover:text-supplychainai-secondary flex items-center">
            View all
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-supplychainai-primary/10">
                <th className="pb-3 font-medium">Job Name</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Target</th>
                <th className="pb-3 font-medium">Data Processed</th>
                <th className="pb-3 font-medium">Duration</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job) => (
                <tr key={job._id} className="border-b border-supplychainai-primary/5 hover:bg-supplychainai-primary/5 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <Database className="w-5 h-5 text-supplychainai-primary" />
                      <span className="font-medium text-white">{job.name}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="px-3 py-1 bg-supplychainai-primary/10 text-supplychainai-primary rounded-full text-xs font-medium">
                      {job.type}
                    </span>
                  </td>
                  <td className="py-4 text-gray-400">{job.target.name}</td>
                  <td className="py-4 text-gray-400">{formatBytes(job.lastRun.bytesProcessed)}</td>
                  <td className="py-4 text-gray-400">{formatDuration(job.lastRun.duration)}</td>
                  <td className="py-4">
                    <span className={`flex items-center ${getStatusColor(job.lastRun.status)}`}>
                      <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
                      {job.lastRun.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Storage Pools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-supplychainai-dark to-supplychainai-darker p-6 rounded-2xl border border-supplychainai-primary/20">
          <h2 className="text-xl font-bold text-white mb-6">Storage Pools</h2>
          <div className="space-y-4">
            {storagePools.slice(0, 5).map((pool) => (
              <div key={pool._id} className="p-4 bg-supplychainai-darker rounded-xl border border-supplychainai-primary/10 hover:border-supplychainai-primary/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <HardDrive className="w-5 h-5 text-supplychainai-primary" />
                    <div>
                      <h3 className="font-medium text-white">{pool.name}</h3>
                      <p className="text-xs text-gray-400">{pool.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(pool.tier)}`}>
                      {pool.tier}
                    </span>
                    <span className={`text-sm ${getStatusColor(pool.health.status)}`}>
                      {pool.health.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{formatBytes(pool.capacity.used)} / {formatBytes(pool.capacity.total)}</span>
                    <span>{((pool.capacity.used / pool.capacity.total) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-supplychainai-darker h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-backup-gradient transition-all duration-500"
                      style={{ width: `${(pool.capacity.used / pool.capacity.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-gradient-to-br from-supplychainai-dark to-supplychainai-darker p-6 rounded-2xl border border-supplychainai-primary/20">
          <h2 className="text-xl font-bold text-white mb-6">Key Metrics</h2>
          <div className="space-y-6">
            {/* Success Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Backup Success Rate</span>
                <span className="text-lg font-bold text-white">{stats?.successRate || 0}%</span>
              </div>
              <div className="w-full bg-supplychainai-darker h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                  style={{ width: `${stats?.successRate || 0}%` }}
                />
              </div>
            </div>

            {/* Deduplication Ratio */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Deduplication Ratio</span>
                <span className="text-lg font-bold text-white">{stats?.dedupRatio || 0}:1</span>
              </div>
              <p className="text-xs text-gray-500">Saving {((1 - 1 / (stats?.dedupRatio || 1)) * 100).toFixed(0)}% storage space</p>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-supplychainai-primary/10">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="px-4 py-3 bg-backup-gradient text-white rounded-xl font-medium hover:shadow-lg hover:shadow-supplychainai-primary/20 transition-all flex items-center justify-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>New Job</span>
                </button>
                <button className="px-4 py-3 bg-supplychainai-primary/10 text-supplychainai-primary border border-supplychainai-primary/20 rounded-xl font-medium hover:bg-supplychainai-primary/20 transition-all flex items-center justify-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Run Test</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert: Deduplication Efficiency */}
      {stats && stats.dedupRatio < 5 && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-500 mb-1">Low Deduplication Ratio</h3>
            <p className="text-sm text-gray-400">
              Consider enabling deduplication on your backup jobs to save storage space.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
