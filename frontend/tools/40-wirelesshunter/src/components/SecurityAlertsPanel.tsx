import React, { useState } from 'react';
import { 
  ShieldAlert, AlertTriangle, CheckCircle, 
  Search, RefreshCw,
  Radio, Copy, Zap, Unlock, UserX, WifiOff,
  Calendar, MapPin
} from 'lucide-react';
import { WirelessSecurityAlert } from '../types';

interface SecurityAlertsPanelProps {
  alerts: WirelessSecurityAlert[];
  isLoading: boolean;
  onRefresh: () => void;
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string) => void;
  onSelect: (alert: WirelessSecurityAlert) => void;
}

const SecurityAlertsPanel: React.FC<SecurityAlertsPanelProps> = ({
  alerts,
  isLoading,
  onRefresh,
  onAcknowledge,
  onResolve,
  onSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alertType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/50',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      low: 'bg-green-500/20 text-green-400 border-green-500/50',
      info: 'bg-blue-500/20 text-blue-400 border-blue-500/50'
    };
    return colors[severity] || colors.info;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-500/20 text-blue-400',
      acknowledged: 'bg-yellow-500/20 text-yellow-400',
      investigating: 'bg-purple-500/20 text-purple-400',
      resolved: 'bg-green-500/20 text-green-400',
      'false-positive': 'bg-gray-500/20 text-gray-400'
    };
    return colors[status] || colors.new;
  };

  const getAlertIcon = (alertType: string) => {
    const icons: Record<string, React.ReactNode> = {
      'rogue-access-point': <Radio className="w-5 h-5" />,
      'evil-twin-attack': <Copy className="w-5 h-5" />,
      'deauth-flood': <Zap className="w-5 h-5" />,
      'weak-encryption': <Unlock className="w-5 h-5" />,
      'mac-spoofing': <UserX className="w-5 h-5" />,
      'signal-jamming': <WifiOff className="w-5 h-5" />,
      'channel-interference': <Radio className="w-5 h-5" />,
      'unauthorized-client': <UserX className="w-5 h-5" />,
      'probe-request-flood': <Search className="w-5 h-5" />,
      'beacon-manipulation': <AlertTriangle className="w-5 h-5" />
    };
    return icons[alertType] || <ShieldAlert className="w-5 h-5" />;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Alert stats
  const stats = {
    critical: alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length,
    high: alerts.filter(a => a.severity === 'high' && a.status !== 'resolved').length,
    new: alerts.filter(a => a.status === 'new').length,
    resolved: alerts.filter(a => a.status === 'resolved').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            Security Alerts
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {filteredAlerts.length} alerts • {stats.new} new
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-3">
        {stats.critical > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-sm font-medium">{stats.critical} Critical</span>
          </div>
        )}
        {stats.high > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span className="text-orange-400 text-sm font-medium">{stats.high} High</span>
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-green-400 text-sm font-medium">{stats.resolved} Resolved</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="info">Info</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.alertId}
              className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-cyan-500/50 cursor-pointer transition-all"
              onClick={() => onSelect(alert)}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${
                  alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                  alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {getAlertIcon(alert.alertType)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-white font-medium">{alert.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(alert.status)}`}>
                        {alert.status}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">{alert.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatTime(alert.detectedAt)}
                    </span>
                    {alert.affectedNetwork && (
                      <span className="flex items-center gap-1">
                        <Radio className="w-3 h-3" />
                        {alert.affectedNetwork.ssid}
                      </span>
                    )}
                    {alert.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {alert.location.building}
                      </span>
                    )}
                    {alert.riskAssessment && (
                      <span className="flex items-center gap-1">
                        Risk: {alert.riskAssessment.score}/100
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {alert.status === 'new' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAcknowledge(alert.alertId);
                      }}
                      className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status !== 'resolved' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onResolve(alert.alertId);
                      }}
                      className="px-3 py-1 text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
          <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
          <p className="text-gray-400">No alerts found</p>
          <p className="text-gray-500 text-sm mt-1">Your wireless network is secure</p>
        </div>
      )}
    </div>
  );
};

export default SecurityAlertsPanel;
