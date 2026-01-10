import React, { useState, useEffect } from 'react';
import { incidentAPI, attackAPI } from '../services/api.ts';
import { Incident, Attack } from '../types/index.ts';
import './IncidentResponse.css';

const IncidentResponse: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    status: 'open',
    assignedTo: '',
    relatedAttacks: [] as string[],
    responseActions: [] as string[],
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [incidentsRes, attacksRes] = await Promise.all([
        incidentAPI.getAll(),
        attackAPI.getAll({ status: 'active', limit: 100 })
      ]);

      setIncidents(incidentsRes.data.data);
      setAttacks(attacksRes.data.data);
    } catch (error) {
      console.error('Failed to load incident data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncident = async () => {
    try {
      await incidentAPI.create(formData);
      setShowCreateForm(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to create incident:', error);
    }
  };

  const handleUpdateIncident = async (incidentId: string, updates: Partial<Incident>) => {
    try {
      await incidentAPI.update(incidentId, updates);
      loadData();
    } catch (error) {
      console.error('Failed to update incident:', error);
    }
  };

  const handleDeleteIncident = async (incidentId: string) => {
    try {
      await incidentAPI.delete(incidentId);
      loadData();
    } catch (error) {
      console.error('Failed to delete incident:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      severity: 'medium',
      status: 'open',
      assignedTo: '',
      relatedAttacks: [],
      responseActions: [],
      notes: ''
    });
  };

  const addResponseAction = (action: string) => {
    if (!action.trim()) return;

    setFormData(prev => ({
      ...prev,
      responseActions: [...prev.responseActions, action.trim()]
    }));
  };

  const removeResponseAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      responseActions: prev.responseActions.filter((_, i) => i !== index)
    }));
  };

  const addRelatedAttack = (attackId: string) => {
    if (formData.relatedAttacks.includes(attackId)) return;

    setFormData(prev => ({
      ...prev,
      relatedAttacks: [...prev.relatedAttacks, attackId]
    }));
  };

  const removeRelatedAttack = (attackId: string) => {
    setFormData(prev => ({
      ...prev,
      relatedAttacks: prev.relatedAttacks.filter(id => id !== attackId)
    }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ff4757';
      case 'high': return '#ffa502';
      case 'medium': return '#3742fa';
      case 'low': return '#2ed573';
      default: return '#888';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#ff4757';
      case 'investigating': return '#ffa502';
      case 'mitigating': return '#3742fa';
      case 'resolved': return '#2ed573';
      case 'closed': return '#666';
      default: return '#888';
    }
  };

  const severities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const statuses = [
    { value: 'open', label: 'Open' },
    { value: 'investigating', label: 'Investigating' },
    { value: 'mitigating', label: 'Mitigating' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const responseTemplates = [
    'Block attacking IPs via firewall',
    'Enable rate limiting',
    'Deploy geo-blocking rules',
    'Activate Cloudflare DDoS protection',
    'Scale up server resources',
    'Contact ISP for traffic filtering',
    'Implement WAF rules',
    'Enable bot detection',
    'Update threat intelligence feeds',
    'Notify security team'
  ];

  if (loading) {
    return <div className="loading">Loading incident response...</div>;
  }

  return (
    <div className="incident-response">
      <div className="response-header">
        <h1>Incident Response</h1>
        <div className="header-actions">
          <div className="stats">
            <span>Open: {incidents.filter(i => i.status === 'open').length}</span>
            <span>Active: {incidents.filter(i => ['investigating', 'mitigating'].includes(i.status)).length}</span>
            <span>Resolved: {incidents.filter(i => i.status === 'resolved').length}</span>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            Create Incident
          </button>
        </div>
      </div>

      <div className="response-content">
        <div className="incidents-panel">
          <h2>Security Incidents</h2>
          <div className="incidents-list">
            {incidents.map((incident) => (
              <div
                key={incident._id}
                className={`incident-item ${selectedIncident?._id === incident._id ? 'selected' : ''}`}
                onClick={() => setSelectedIncident(incident)}
              >
                <div className="incident-header">
                  <div className="incident-title">
                    <h3>{incident.title}</h3>
                    <div className="incident-meta">
                      <span className="severity-badge" style={{ backgroundColor: getSeverityColor(incident.severity) }}>
                        {incident.severity.toUpperCase()}
                      </span>
                      <span className="status-badge" style={{ backgroundColor: getStatusColor(incident.status) }}>
                        {incident.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="incident-actions">
                    <select
                      value={incident.status}
                      onChange={(e) => handleUpdateIncident(incident._id, { status: e.target.value })}
                      className="status-select"
                    >
                      {statuses.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleDeleteIncident(incident._id)}
                      className="btn btn-danger btn-small"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="incident-summary">
                  <p>{incident.description}</p>
                  <div className="incident-details">
                    <div className="detail">
                      <span className="label">Created:</span>
                      <span className="value">{new Date(incident.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Assigned:</span>
                      <span className="value">{incident.assignedTo || 'Unassigned'}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Related Attacks:</span>
                      <span className="value">{incident.relatedAttacks.length}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Response Actions:</span>
                      <span className="value">{incident.responseActions.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {incidents.length === 0 && (
              <div className="no-incidents">
                <h3>No Security Incidents</h3>
                <p>All systems operating normally</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn btn-primary"
                >
                  Report Incident
                </button>
              </div>
            )}
          </div>
        </div>

        {selectedIncident && (
          <div className="incident-details-panel">
            <h2>Incident Details</h2>
            <div className="incident-full-details">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Title:</span>
                    <span className="value">{selectedIncident.title}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Severity:</span>
                    <span className="value severity" style={{ color: getSeverityColor(selectedIncident.severity) }}>
                      {selectedIncident.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className="value status" style={{ color: getStatusColor(selectedIncident.status) }}>
                      {selectedIncident.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Assigned To:</span>
                    <span className="value">{selectedIncident.assignedTo || 'Unassigned'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Created:</span>
                    <span className="value">{new Date(selectedIncident.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Last Updated:</span>
                    <span className="value">{new Date(selectedIncident.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Description</h3>
                <p className="description">{selectedIncident.description}</p>
              </div>

              <div className="detail-section">
                <h3>Related Attacks</h3>
                <div className="related-attacks">
                  {selectedIncident.relatedAttacks.map((attackId) => {
                    const attack = attacks.find(a => a._id === attackId);
                    return attack ? (
                      <div key={attackId} className="related-attack">
                        <div className="attack-info">
                          <span className="attack-type">{attack.type.toUpperCase()}</span>
                          <span className="attack-target">{attack.target.ip}:{attack.target.port}</span>
                        </div>
                        <div className="attack-metrics">
                          <span>{attack.metrics.bandwidth.toFixed(2)} Mbps</span>
                          <span>{new Date(attack.detectedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ) : (
                      <div key={attackId} className="related-attack missing">
                        Attack {attackId} (not found)
                      </div>
                    );
                  })}
                  {selectedIncident.relatedAttacks.length === 0 && (
                    <p className="no-related">No related attacks</p>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Response Actions</h3>
                <div className="response-actions">
                  {selectedIncident.responseActions.map((action, index) => (
                    <div key={index} className="response-action">
                      <span className="action-number">{index + 1}.</span>
                      <span className="action-text">{action}</span>
                    </div>
                  ))}
                  {selectedIncident.responseActions.length === 0 && (
                    <p className="no-actions">No response actions taken</p>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Notes</h3>
                <div className="notes">
                  {selectedIncident.notes ? (
                    <p>{selectedIncident.notes}</p>
                  ) : (
                    <p className="no-notes">No additional notes</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {(showCreateForm) && (
        <div className="incident-form-overlay">
          <div className="incident-form">
            <div className="form-header">
              <h2>Create New Incident</h2>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <div className="form-content">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief incident title"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the incident"
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                  >
                    {severities.map(sev => (
                      <option key={sev.value} value={sev.value}>
                        {sev.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Assigned To</label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                    placeholder="Team member name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Related Attacks</label>
                <div className="attacks-selector">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addRelatedAttack(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">Select attack to relate...</option>
                    {attacks.map(attack => (
                      <option key={attack._id} value={attack._id}>
                        {attack.type} - {attack.target.ip}:{attack.target.port} ({attack.metrics.bandwidth.toFixed(2)} Mbps)
                      </option>
                    ))}
                  </select>
                  <div className="selected-attacks">
                    {formData.relatedAttacks.map(attackId => {
                      const attack = attacks.find(a => a._id === attackId);
                      return attack ? (
                        <span key={attackId} className="attack-tag">
                          {attack.type} - {attack.target.ip}
                          <button onClick={() => removeRelatedAttack(attackId)}>×</button>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Response Actions</label>
                <div className="actions-builder">
                  <div className="action-templates">
                    <h4>Quick Actions:</h4>
                    <div className="template-buttons">
                      {responseTemplates.map((template, index) => (
                        <button
                          key={index}
                          onClick={() => addResponseAction(template)}
                          className="template-btn"
                          type="button"
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="custom-action">
                    <input
                      type="text"
                      placeholder="Custom response action"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addResponseAction((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addResponseAction(input.value);
                        input.value = '';
                      }}
                      className="btn btn-small"
                      type="button"
                    >
                      Add
                    </button>
                  </div>

                  <div className="selected-actions">
                    {formData.responseActions.map((action, index) => (
                      <div key={index} className="action-item">
                        <span>{action}</span>
                        <button onClick={() => removeResponseAction(index)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes or observations"
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button
                  onClick={handleCreateIncident}
                  className="btn btn-primary"
                >
                  Create Incident
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentResponse;