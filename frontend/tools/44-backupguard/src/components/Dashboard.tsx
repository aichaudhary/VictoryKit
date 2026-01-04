import React from 'react';
import { HardDrive, Database, Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, Server } from 'lucide-react';
import { DashboardStats } from '../types';
import { formatBytes } from '../constants';

interface DashboardProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const overview = stats?.overview || {
    totalBackups: 0,
    completedBackups: 0,
    failedBackups: 0,
    runningBackups: 0,
    successRate: 100,
    totalStorageUsed: 0,
    pendingAlerts: 0,
    criticalAlerts: 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<HardDrive className="w-6 h-6 text-cyan-400" />}
          label="Total Backups"
          value={overview.totalBackups.toString()}
          color="cyan"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6 text-green-400" />}
          label="Success Rate"
          value={`${overview.successRate}%`}
          color="green"
        />
        <StatCard
          icon={<Database className="w-6 h-6 text-purple-400" />}
          label="Storage Used"
          value={formatBytes(overview.totalStorageUsed)}
          color="purple"
        />
        <StatCard
          icon={<AlertTriangle className="w-6 h-6 text-red-400" />}
          label="Active Alerts"
          value={overview.pendingAlerts.toString()}
          color={overview.criticalAlerts > 0 ? 'red' : 'yellow'}
        />
      </div>

      {/* Running Backups */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white">Running Now</h3>
          </div>
          <div className="text-3xl font-bold text-blue-400">{overview.runningBackups}</div>
          <p className="text-slate-400 text-sm">Active backup jobs</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-medium text-white">Completed</h3>
          </div>
          <div className="text-3xl font-bold text-green-400">{overview.completedBackups}</div>
          <p className="text-slate-400 text-sm">Successful backups</p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-medium text-white">Failed</h3>
          </div>
          <div className="text-3xl font-bold text-red-400">{overview.failedBackups}</div>
          <p className="text-slate-400 text-sm">Require attention</p>
        </div>
      </div>

      {/* Storage Locations */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-medium text-white">Storage Locations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats?.storageLocations?.map((storage) => (
            <div key={storage._id} className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">{storage.name}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  storage.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {storage.status}
                </span>
              </div>
              <div className="text-sm text-slate-400">{storage.type.toUpperCase()}</div>
              {storage.capacity && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Used</span>
                    <span>{formatBytes(storage.capacity.usedBytes)} / {formatBytes(storage.capacity.totalBytes)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                      style={{ width: `${(storage.capacity.usedBytes / storage.capacity.totalBytes) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Backups */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-medium text-white">Recent Backups</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                <th className="pb-3">Name</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentBackups?.slice(0, 5).map((backup) => (
                <tr key={backup._id} className="border-b border-slate-700/50">
                  <td className="py-3 text-white">{backup.name}</td>
                  <td className="py-3 text-slate-400 capitalize">{backup.type}</td>
                  <td className="py-3">
                    <StatusBadge status={backup.status} />
                  </td>
                  <td className="py-3 text-slate-400">
                    {new Date(backup.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/50 transition-colors">
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400',
    running: 'bg-blue-500/20 text-blue-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    failed: 'bg-red-500/20 text-red-400',
    cancelled: 'bg-gray-500/20 text-gray-400',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs ${colors[status] || colors.pending}`}>
      {status}
    </span>
  );
};

export default Dashboard;
