import React, { useState } from 'react';
import { ScrollText, User, Clock, Shield, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';
import { AccessLog } from '../types';

interface AccessLogsProps {
  logs: AccessLog[];
  isLoading: boolean;
}

const AccessLogs: React.FC<AccessLogsProps> = ({ logs, isLoading }) => {
  const [filter, setFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'suspicious') return log.suspicious;
    return log.result === filter;
  });

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failure': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'blocked': return <Shield className="w-4 h-4 text-orange-400" />;
      default: return <Activity className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      backup_create: 'Created Backup',
      backup_delete: 'Deleted Backup',
      backup_start: 'Started Backup',
      backup_restore: 'Initiated Restore',
      restore_initiate: 'Initiated Restore',
      storage_create: 'Created Storage',
      storage_delete: 'Deleted Storage',
      policy_create: 'Created Policy',
      policy_update: 'Updated Policy',
      config_update: 'Updated Config',
      login: 'User Login',
      logout: 'User Logout',
    };
    return labels[action] || action.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'success', 'failure', 'blocked', 'suspicious'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">
            {logs.filter((l) => l.result === 'success').length}
          </div>
          <div className="text-xs text-slate-400">Successful</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">
            {logs.filter((l) => l.result === 'failure').length}
          </div>
          <div className="text-xs text-slate-400">Failed</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {logs.filter((l) => l.result === 'blocked').length}
          </div>
          <div className="text-xs text-slate-400">Blocked</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {logs.filter((l) => l.suspicious).length}
          </div>
          <div className="text-xs text-slate-400">Suspicious</div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-slate-400 text-sm border-b border-slate-700 bg-slate-800">
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Result</th>
              <th className="px-4 py-3">Risk</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  <ScrollText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No logs to display</p>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, idx) => (
                <tr
                  key={log._id || idx}
                  className={`border-b border-slate-700/50 hover:bg-slate-700/30 ${
                    log.suspicious ? 'bg-red-500/5' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="text-white capitalize">{getActionLabel(log.action)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{log.user?.email || log.user?.userId || 'System'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {log.resource?.type && (
                      <span className="capitalize">{log.resource.type}: {log.resource.name || log.resource.id}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {getResultIcon(log.result)}
                      <span className={`text-sm capitalize ${
                        log.result === 'success' ? 'text-green-400' :
                        log.result === 'failure' ? 'text-red-400' :
                        log.result === 'blocked' ? 'text-orange-400' : 'text-yellow-400'
                      }`}>
                        {log.result}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {log.suspicious && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-400">{log.riskScore?.toFixed(0)}%</span>
                      </div>
                    )}
                    {!log.suspicious && log.riskScore && (
                      <span className="text-sm text-slate-400">{log.riskScore.toFixed(0)}%</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccessLogs;
