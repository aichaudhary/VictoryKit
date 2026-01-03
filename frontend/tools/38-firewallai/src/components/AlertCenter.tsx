import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, XCircle, Clock, Settings, Plus, Filter } from 'lucide-react';

interface AlertCenterProps {
  alerts: any[];
  onCreateAlert: (alert: any) => void;
  onDeleteAlert: (alertId: string) => void;
  onToggleAlert: (alertId: string) => void;
}

const AlertCenter: React.FC<AlertCenterProps> = ({
  alerts,
  onCreateAlert,
  onDeleteAlert,
  onToggleAlert
}) => {
  const [filter, setFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'active') return alert.status === 'active';
    if (filter === 'resolved') return alert.status === 'resolved';
    if (filter === 'critical') return alert.severity === 'critical';
    return true;
  });

  const AlertForm: React.FC<{
    onSubmit: (alert: any) => void;
    onCancel: () => void;
  }> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      severity: 'medium',
      type: 'custom',
      conditions: '',
      actions: [],
      enabled: true
    });

    return (
      <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Create Alert Rule</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Alert Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
              placeholder="Alert title"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Severity</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Alert Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
            >
              <option value="custom">Custom</option>
              <option value="traffic">Traffic Anomaly</option>
              <option value="threat">Threat Detection</option>
              <option value="compliance">Compliance Violation</option>
              <option value="system">System Health</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Conditions</label>
            <input
              type="text"
              value={formData.conditions}
              onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
              placeholder="Alert trigger conditions"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-gray-400 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white h-20"
            placeholder="Alert description and remediation steps"
          />
        </div>

        <div className="flex items-center justify-between mt-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="rounded border-blue-500/30"
            />
            <span className="text-sm text-gray-400">Enable Alert</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit(formData)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:opacity-90 transition-opacity"
            >
              Create Alert
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'acknowledged': return <Clock className="w-4 h-4 text-yellow-400" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Alert Center</h2>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
            {filteredAlerts.length} alerts
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800 border border-blue-500/30 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Alerts</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="critical">Critical</option>
          </select>

          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Alert
          </button>
        </div>
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <AlertForm
          onSubmit={(alert) => {
            onCreateAlert(alert);
            setShowCreateForm(false);
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border backdrop-blur-sm cursor-pointer transition-all ${
              selectedAlert?.id === alert.id
                ? 'bg-blue-500/10 border-blue-500/30'
                : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/30'
            }`}
            onClick={() => setSelectedAlert(alert)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getStatusIcon(alert.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white">{alert.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      alert.status === 'active'
                        ? 'bg-red-500/20 text-red-400'
                        : alert.status === 'resolved'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{alert.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    {alert.source && <span>Source: {alert.source}</span>}
                    {alert.rule_id && <span>Rule: {alert.rule_id}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {alert.status === 'active' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleAlert(alert.id);
                    }}
                    className="p-1 hover:bg-slate-600 rounded text-green-400"
                    title="Resolve Alert"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAlert(alert.id);
                  }}
                  className="p-1 hover:bg-slate-600 rounded text-red-400"
                  title="Delete Alert"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12 bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-gray-400">No alerts found</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:opacity-90 transition-opacity"
            >
              Create Your First Alert
            </button>
          </div>
        )}
      </div>

      {/* Alert Details Panel */}
      {selectedAlert && (
        <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              {getStatusIcon(selectedAlert.status)}
              Alert Details
            </h3>
            <button
              onClick={() => setSelectedAlert(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Alert Title</label>
                <p className="text-white font-medium">{selectedAlert.title}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Severity</label>
                <p className={`font-medium ${getSeverityColor(selectedAlert.severity).split(' ')[0]}`}>
                  {selectedAlert.severity}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Status</label>
                <p className={`font-medium ${
                  selectedAlert.status === 'active' ? 'text-red-400' :
                  selectedAlert.status === 'resolved' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {selectedAlert.status}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Timestamp</label>
                <p className="text-white">{new Date(selectedAlert.timestamp).toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Source</label>
                <p className="text-white">{selectedAlert.source || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Rule ID</label>
                <p className="font-mono text-white">{selectedAlert.rule_id || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Alert Type</label>
                <p className="text-white">{selectedAlert.type || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Actions Taken</label>
                <p className="text-white">{selectedAlert.actions?.join(', ') || 'None'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm text-gray-400">Description</label>
            <div className="mt-2 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
              <p className="text-sm text-white whitespace-pre-wrap">
                {selectedAlert.description}
              </p>
            </div>
          </div>

          {selectedAlert.details && (
            <div className="mt-4">
              <label className="text-sm text-gray-400">Additional Details</label>
              <div className="mt-2 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(selectedAlert.details, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {selectedAlert.status === 'active' && (
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => onToggleAlert(selectedAlert.id)}
                className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
              >
                Mark as Resolved
              </button>
              <button className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors">
                Escalate
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertCenter;