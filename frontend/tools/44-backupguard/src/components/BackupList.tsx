import React, { useState } from 'react';
import { HardDrive, Play, Square, RotateCcw, Trash2, Eye, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import { Backup } from '../types';
import { formatBytes, formatDuration, STATUS_COLORS } from '../constants';

interface BackupListProps {
  backups: Backup[];
  onStart: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (backup: Backup) => void;
  onVerify: (id: string) => void;
  onRestore: (id: string) => void;
  isLoading: boolean;
}

const BackupList: React.FC<BackupListProps> = ({
  backups,
  onStart,
  onCancel,
  onDelete,
  onView,
  onVerify,
  onRestore,
  isLoading,
}) => {
  const [filter, setFilter] = useState<string>('all');

  const filteredBackups = backups.filter((b) => filter === 'all' || b.status === filter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'running': return <Loader className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      default: return <HardDrive className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'completed', 'running', 'failed', 'pending'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Backup Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      ) : filteredBackups.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <HardDrive className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No backups found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBackups.map((backup) => (
            <div
              key={backup._id}
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-cyan-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-700 rounded-lg">
                    <HardDrive className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{backup.name}</h3>
                    <p className="text-sm text-slate-400">{backup.source?.hostname} - {backup.source?.path}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="capitalize">{backup.type}</span>
                      {backup.execution?.bytesProcessed && (
                        <span>{formatBytes(backup.execution.bytesProcessed)}</span>
                      )}
                      {backup.execution?.duration && (
                        <span>{formatDuration(backup.execution.duration)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-700">
                    {getStatusIcon(backup.status)}
                    <span className="text-sm text-slate-300 capitalize">{backup.status}</span>
                  </div>
                </div>
              </div>

              {/* Progress bar for running backups */}
              {backup.status === 'running' && backup.execution?.progress && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{backup.execution.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
                      style={{ width: `${backup.execution.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-700">
                <button
                  onClick={() => onView(backup)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
                >
                  <Eye className="w-4 h-4" /> View
                </button>
                {backup.status === 'pending' && (
                  <button
                    onClick={() => onStart(backup._id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-500 transition-colors"
                  >
                    <Play className="w-4 h-4" /> Start
                  </button>
                )}
                {backup.status === 'running' && (
                  <button
                    onClick={() => onCancel(backup._id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-600 text-white rounded hover:bg-orange-500 transition-colors"
                  >
                    <Square className="w-4 h-4" /> Cancel
                  </button>
                )}
                {backup.status === 'completed' && (
                  <>
                    <button
                      onClick={() => onVerify(backup._id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-500 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Verify
                    </button>
                    <button
                      onClick={() => onRestore(backup._id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-cyan-600 text-white rounded hover:bg-cyan-500 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" /> Restore
                    </button>
                  </>
                )}
                <button
                  onClick={() => onDelete(backup._id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600/20 text-red-400 rounded hover:bg-red-600/40 transition-colors ml-auto"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BackupList;
