import React, { useState, useEffect } from 'react';
import { Alert, AlertStatus, AlertSeverity } from '../types';
import { iotSentinelAPI } from '../services/iotSentinelAPI';

interface IoTAlertsPanelProps {
  maxItems?: number;
  onAlertClick?: (alert: Alert) => void;
}

export const IoTAlertsPanel: React.FC<IoTAlertsPanelProps> = ({
  maxItems = 10,
  onAlertClick
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AlertStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');

  useEffect(() => {
    fetchAlerts();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [filter, severityFilter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { limit: maxItems };
      if (filter !== 'all') params.status = filter;
      if (severityFilter !== 'all') params.severity = severityFilter;
      
      const response = await iotSentinelAPI.alerts.getAll(params);
      setAlerts(response.data || []);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await iotSentinelAPI.alerts.acknowledge(alertId);
      fetchAlerts();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleResolve = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await iotSentinelAPI.alerts.resolve(alertId, 'Resolved via dashboard');
      fetchAlerts();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const getSeverityStyles = (severity: AlertSeverity) => {
    const styles: Record<AlertSeverity, { bg: string; border: string; icon: string }> = {
      critical: { bg: 'bg-red-500/10', border: 'border-red-500/50', icon: '🚨' },
      high: { bg: 'bg-orange-500/10', border: 'border-orange-500/50', icon: '⚠️' },
      medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', icon: '📢' },
      low: { bg: 'bg-blue-500/10', border: 'border-blue-500/50', icon: 'ℹ️' },
      info: { bg: 'bg-slate-500/10', border: 'border-slate-500/50', icon: '📋' }
    };
    return styles[severity] || styles.info;
  };

  const getStatusBadge = (status: AlertStatus) => {
    const badges: Record<AlertStatus, { text: string; class: string }> = {
      new: { text: 'NEW', class: 'bg-red-500 text-white' },
      acknowledged: { text: 'ACK', class: 'bg-yellow-500 text-black' },
      investigating: { text: 'INVESTIGATING', class: 'bg-blue-500 text-white' },
      resolved: { text: 'RESOLVED', class: 'bg-green-500 text-white' },
      false_positive: { text: 'FALSE POSITIVE', class: 'bg-gray-500 text-white' }
    };
    return badges[status] || badges.new;
  };

  const getAlertTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      device_offline: '📴',
      new_device: '📲',
      vulnerability_detected: '🔓',
      suspicious_activity: '👁️',
      firmware_outdated: '📦',
      anomaly_detected: '📊',
      brute_force: '🔨',
      unauthorized_access: '🚫',
      data_exfiltration: '📤',
      malware_detected: '🦠',
      configuration_change: '⚙️',
      network_scan: '🌐'
    };
    return icons[type] || '⚡';
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="text-2xl">🚨</span>
            Security Alerts
            {alerts.filter(a => a.status === 'new').length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full animate-pulse">
                {alerts.filter(a => a.status === 'new').length} new
              </span>
            )}
          </h2>
          <button
            onClick={() => fetchAlerts()}
            className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as AlertStatus | 'all')}
            className="px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as AlertSeverity | 'all')}
            className="px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="divide-y divide-slate-700/30 max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">✅</span>
            <p className="text-slate-400">No alerts found</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const severity = getSeverityStyles(alert.severity);
            const status = getStatusBadge(alert.status);
            
            return (
              <div
                key={alert._id}
                onClick={() => onAlertClick?.(alert)}
                className={`p-4 ${severity.bg} border-l-4 ${severity.border} hover:bg-slate-700/30 cursor-pointer transition-colors`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getAlertTypeIcon(alert.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 text-xs rounded ${status.class}`}>
                        {status.text}
                      </span>
                      <span className="text-xs text-slate-400 uppercase">
                        {alert.severity}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatTimeAgo(alert.createdAt)}
                      </span>
                    </div>
                    <h4 className="font-medium text-white truncate">{alert.title}</h4>
                    <p className="text-sm text-slate-400 line-clamp-2 mt-1">
                      {alert.message}
                    </p>
                    {alert.device && (
                      <p className="text-xs text-slate-500 mt-1">
                        Device: {typeof alert.device === 'string' ? alert.device : alert.device.name}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {alert.status === 'new' && (
                      <button
                        onClick={(e) => handleAcknowledge(alert._id, e)}
                        className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 transition-colors"
                      >
                        ACK
                      </button>
                    )}
                    {alert.status !== 'resolved' && (
                      <button
                        onClick={(e) => handleResolve(alert._id, e)}
                        className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default IoTAlertsPanel;
