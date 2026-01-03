import React, { useState, useEffect } from 'react';
import { alertAPI } from '../services/api';
import { Alert } from '../types/index';
import wsService from '../services/websocket';
import './AlertCenter.css';

const AlertCenter: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAlerts();

    // Connect to WebSocket for real-time updates
    wsService.connect();
    wsService.on('alert_created', handleAlertCreated);
    wsService.on('alert_updated', handleAlertUpdated);

    return () => {
      wsService.off('alert_created', handleAlertCreated);
      wsService.off('alert_updated', handleAlertUpdated);
    };
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, filterSeverity, filterStatus, searchTerm]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await alertAPI.getAll();
      if (response.data.success) {
        setAlerts(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const filterAlerts = () => {
    let filtered = alerts;

    // Filter by severity
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === filterSeverity);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(alert => alert.acknowledged === (filterStatus === 'acknowledged'));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.domain?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAlerts(filtered);
  };

  const handleAlertCreated = (data: Alert) => {
    setAlerts(prev => [data, ...prev]);
  };

  const handleAlertUpdated = (data: Alert) => {
    setAlerts(prev =>
      prev.map(alert => alert._id === data._id ? data : alert)
    );
    if (selectedAlert && selectedAlert._id === data._id) {
      setSelectedAlert(data);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await alertAPI.acknowledge(alertId);
      // WebSocket will handle the update
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleBulkAcknowledge = async () => {
    const unacknowledgedAlerts = filteredAlerts.filter(alert => !alert.acknowledged);
    if (unacknowledgedAlerts.length === 0) return;

    if (!window.confirm(`Acknowledge ${unacknowledgedAlerts.length} alerts?`)) {
      return;
    }

    try {
      await Promise.all(
        unacknowledgedAlerts.filter(alert => alert._id).map(alert => alertAPI.acknowledge(alert._id!))
      );
      // WebSocket will handle the updates
    } catch (err) {
      console.error('Failed to bulk acknowledge alerts:', err);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!window.confirm('Are you sure you want to resolve this alert?')) {
      return;
    }

    try {
      await alertAPI.resolve(alertId);
      setAlerts(prev => prev.filter(alert => alert._id !== alertId));
      if (selectedAlert && selectedAlert._id === alertId) {
        setSelectedAlert(null);
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      'low': '#28a745',
      'medium': '#ffc107',
      'high': '#fd7e14',
      'critical': '#dc3545'
    };
    return colors[severity] || '#6c757d';
  };

  const getSeverityIcon = (severity: string) => {
    const icons: { [key: string]: string } = {
      'low': 'ℹ️',
      'medium': '⚠️',
      'high': '🚨',
      'critical': '🔴'
    };
    return icons[severity] || '📢';
  };

  const getAlertStats = () => {
    const total = alerts.length;
    const acknowledged = alerts.filter(alert => alert.acknowledged).length;
    const unacknowledged = total - acknowledged;
    const critical = alerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged).length;
    const high = alerts.filter(alert => alert.severity === 'high' && !alert.acknowledged).length;
    const medium = alerts.filter(alert => alert.severity === 'medium' && !alert.acknowledged).length;
    const low = alerts.filter(alert => alert.severity === 'low' && !alert.acknowledged).length;

    return { total, acknowledged, unacknowledged, critical, high, medium, low };
  };

  const stats = getAlertStats();

  if (loading) {
    return (
      <div className="alert-center-loading">
        <div className="spinner"></div>
        <p>Loading alerts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-center-error">
        <h3>Error Loading Alerts</h3>
        <p>{error}</p>
        <button onClick={loadAlerts} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="alert-center">
      {/* Header */}
      <div className="center-header">
        <h2>Alert Center</h2>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={handleBulkAcknowledge}
            disabled={stats.unacknowledged === 0}
          >
            ✅ Acknowledge All ({stats.unacknowledged})
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => loadAlerts()}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="alert-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Alerts</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.acknowledged}</h3>
            <p>Acknowledged</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.unacknowledged}</h3>
            <p>Unacknowledged</p>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">🔴</div>
          <div className="stat-content">
            <h3>{stats.critical}</h3>
            <p>Critical</p>
          </div>
        </div>

        <div className="stat-card high">
          <div className="stat-icon">🟠</div>
          <div className="stat-content">
            <h3>{stats.high}</h3>
            <p>High</p>
          </div>
        </div>

        <div className="stat-card medium">
          <div className="stat-icon">🟡</div>
          <div className="stat-content">
            <h3>{stats.medium}</h3>
            <p>Medium</p>
          </div>
        </div>

        <div className="stat-card low">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <h3>{stats.low}</h3>
            <p>Low</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Severity:</label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="form-control"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-control"
          >
            <option value="all">All Status</option>
            <option value="unacknowledged">Unacknowledged</option>
            <option value="acknowledged">Acknowledged</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      {/* Alert List and Details */}
      <div className="alerts-content">
        {/* Alert List */}
        <div className="alert-list">
          <div className="list-header">
            <h3>Alerts ({filteredAlerts.length})</h3>
          </div>

          <div className="alert-items">
            {filteredAlerts.map((alert) => (
              <div
                key={alert._id}
                className={`alert-item ${alert.severity} ${selectedAlert?._id === alert._id ? 'selected' : ''} ${alert.acknowledged ? 'acknowledged' : 'unacknowledged'}`}
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="alert-header">
                  <div className="alert-icon">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="alert-info">
                    <h4>{alert.title}</h4>
                    <div className="alert-meta">
                      <span className="domain">{alert.domain?.name || 'System'}</span>
                      <span className="timestamp">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="alert-badges">
                    <span
                      className={`badge severity-badge ${alert.severity}`}
                      style={{ backgroundColor: getSeverityColor(alert.severity) }}
                    >
                      {alert.severity}
                    </span>
                    {alert.acknowledged ? (
                      <span className="badge badge-success">✓ Acknowledged</span>
                    ) : (
                      <span className="badge badge-warning">New</span>
                    )}
                  </div>
                </div>

                <div className="alert-message">
                  <p>{alert.message}</p>
                </div>

                <div className="alert-actions">
                  {!alert.acknowledged && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcknowledgeAlert(alert._id!);
                      }}
                    >
                      ✅ Acknowledge
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAlert(alert._id!);
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredAlerts.length === 0 && (
            <div className="no-alerts">
              <p>No alerts found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Alert Details Panel */}
        {selectedAlert && (
          <div className="alert-details-panel">
            <div className="panel-header">
              <h3>Alert Details</h3>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setSelectedAlert(null)}
              >
                ✕
              </button>
            </div>

            <div className="panel-content">
              <div className="alert-detail-section">
                <h4>Basic Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Title:</label>
                    <span>{selectedAlert.title}</span>
                  </div>
                  <div className="detail-item">
                    <label>Severity:</label>
                    <span className={`severity-text ${selectedAlert.severity}`}>
                      {selectedAlert.severity}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={selectedAlert.acknowledged ? 'status-acknowledged' : 'status-unacknowledged'}>
                      {selectedAlert.acknowledged ? 'Acknowledged' : 'Unacknowledged'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Domain:</label>
                    <span>{selectedAlert.domain?.name || 'System'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Created:</label>
                    <span>{new Date(selectedAlert.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedAlert.acknowledgedAt && (
                    <div className="detail-item">
                      <label>Acknowledged:</label>
                      <span>{new Date(selectedAlert.acknowledgedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="alert-detail-section">
                <h4>Message</h4>
                <div className="alert-message-detail">
                  <p>{selectedAlert.message}</p>
                </div>
              </div>

              <div className="alert-detail-section">
                <h4>Actions</h4>
                <div className="alert-actions-detail">
                  {!selectedAlert.acknowledged && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleAcknowledgeAlert(selectedAlert._id!)}
                    >
                      ✅ Acknowledge Alert
                    </button>
                  )}
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => handleDeleteAlert(selectedAlert._id)}
                  >
                    🗑️ Delete Alert
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertCenter;