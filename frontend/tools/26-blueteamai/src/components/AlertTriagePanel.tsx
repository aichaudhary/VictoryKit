import React from 'react';
import { 
  AlertTriangle, Clock, User, Tag, 
  CheckCircle, XCircle, Search, ChevronRight 
} from 'lucide-react';
import { SecurityAlert, AlertSeverity, AlertStatus } from '../types';
import { SEVERITY_COLORS, STATUS_COLORS } from '../constants';

interface AlertTriagePanelProps {
  alerts: SecurityAlert[];
  onSelectAlert: (alert: SecurityAlert) => void;
  onUpdateStatus: (alertId: string, status: AlertStatus) => void;
  selectedAlertId?: string;
}

const AlertTriagePanel: React.FC<AlertTriagePanelProps> = ({
  alerts,
  onSelectAlert,
  onUpdateStatus,
  selectedAlertId
}) => {
  const [filter, setFilter] = React.useState<AlertSeverity | 'all'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === 'all' || alert.severity === filter;
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const severityCounts = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/50 rounded-xl border border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          Alert Triage Queue
        </h2>
        
        {/* Severity Quick Filters */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === 'all' ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All ({alerts.length})
          </button>
          {Object.entries(severityCounts).map(([severity, count]) => (
            <button
              key={severity}
              onClick={() => setFilter(severity as AlertSeverity)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === severity 
                  ? `${SEVERITY_COLORS[severity as AlertSeverity].bg} ${SEVERITY_COLORS[severity as AlertSeverity].text}` 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)} ({count})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => onSelectAlert(alert)}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedAlertId === alert.id 
                ? 'bg-blue-500/20 border-blue-500/50' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${SEVERITY_COLORS[alert.severity].bg} ${SEVERITY_COLORS[alert.severity].text}`}>
                  {alert.severity.toUpperCase()}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[alert.status].bg} ${STATUS_COLORS[alert.status].text}`}>
                  {alert.status.replace('_', ' ')}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </div>
            
            <h3 className="text-sm font-medium text-white mb-1 line-clamp-1">{alert.title}</h3>
            <p className="text-xs text-gray-400 line-clamp-2 mb-2">{alert.description}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {alert.source}
                </span>
              </div>
              {alert.assigned_to && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {alert.assigned_to}
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-3 pt-2 border-t border-white/5">
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdateStatus(alert.id, 'investigating'); }}
                className="flex-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors"
              >
                Investigate
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdateStatus(alert.id, 'false_positive'); }}
                className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs hover:bg-gray-500/30 transition-colors"
              >
                <XCircle className="w-3 h-3" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdateStatus(alert.id, 'resolved'); }}
                className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors"
              >
                <CheckCircle className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No alerts match your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertTriagePanel;
