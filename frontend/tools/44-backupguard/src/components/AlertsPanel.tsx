import React, { useState } from 'react';
import { Bell, AlertTriangle, ShieldAlert, Check, X, Eye, Clock } from 'lucide-react';
import { Alert } from '../types';
import { SEVERITY_COLORS } from '../constants';

interface AlertsPanelProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string, action?: string) => void;
  onDismiss: (id: string) => void;
  isLoading: boolean;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onAcknowledge,
  onResolve,
  onDismiss,
  isLoading,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'active') return a.status === 'new' || a.status === 'acknowledged';
    return a.severity === filter;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'medium': return <Bell className="w-5 h-5 text-yellow-400" />;
      default: return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const getSeverityClass = (severity: string) => {
    const classes: Record<string, string> = {
      critical: 'border-l-red-500 bg-red-500/10',
      high: 'border-l-orange-500 bg-orange-500/10',
      medium: 'border-l-yellow-500 bg-yellow-500/10',
      low: 'border-l-blue-500 bg-blue-500/10',
      info: 'border-l-gray-500 bg-gray-500/10',
    };
    return classes[severity] || classes.info;
  };

  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      backup_failure: 'Backup Failed',
      storage_full: 'Storage Full',
      integrity_failed: 'Integrity Check Failed',
      ransomware_detected: 'Ransomware Detected',
      policy_violation: 'Policy Violation',
      unauthorized_access: 'Unauthorized Access',
      connection_lost: 'Connection Lost',
      schedule_missed: 'Scheduled Backup Missed',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'active', 'critical', 'high', 'medium', 'low'].map((f) => (
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
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">
            {alerts.filter((a) => a.severity === 'critical' && a.status === 'new').length}
          </div>
          <div className="text-xs text-slate-400">Critical</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {alerts.filter((a) => a.severity === 'high' && a.status === 'new').length}
          </div>
          <div className="text-xs text-slate-400">High</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {alerts.filter((a) => a.severity === 'medium' && a.status === 'new').length}
          </div>
          <div className="text-xs text-slate-400">Medium</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {alerts.filter((a) => a.status === 'resolved').length}
          </div>
          <div className="text-xs text-slate-400">Resolved</div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-2">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No alerts to display</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert._id}
              className={`border-l-4 rounded-lg p-4 ${getSeverityClass(alert.severity)} ${
                !alert.read ? 'ring-1 ring-cyan-500/30' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(alert.severity)}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">{alert.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        alert.status === 'new' ? 'bg-red-500/20 text-red-400' :
                        alert.status === 'acknowledged' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>{getAlertTypeLabel(alert.type)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                {alert.status === 'new' && (
                  <button
                    onClick={() => onAcknowledge(alert._id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-500 transition-colors"
                  >
                    <Eye className="w-4 h-4" /> Acknowledge
                  </button>
                )}
                {(alert.status === 'new' || alert.status === 'acknowledged') && (
                  <button
                    onClick={() => onResolve(alert._id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-500 transition-colors"
                  >
                    <Check className="w-4 h-4" /> Resolve
                  </button>
                )}
                <button
                  onClick={() => onDismiss(alert._id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors ml-auto"
                >
                  <X className="w-4 h-4" /> Dismiss
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
