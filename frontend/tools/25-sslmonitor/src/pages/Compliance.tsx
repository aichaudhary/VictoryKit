import React, { useState, useEffect } from 'react';
import { ComplianceReport, ComplianceStandard, AuditLog } from '../types';
import { complianceAPI, systemAPI } from '../services/api';
import wsService from '../services/websocket';
import './Compliance.css';

const Compliance: React.FC = () => {
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [standards, setStandards] = useState<ComplianceStandard[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStandard, setSelectedStandard] = useState<ComplianceStandard | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditFilter, setAuditFilter] = useState<'all' | 'passed' | 'failed' | 'warning'>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadComplianceData();
    loadStandards();
    loadAuditLogs();

    // Subscribe to real-time compliance updates
    const unsubscribe = wsService.subscribe('compliance_update', (data) => {
      if (data.type === 'compliance_check_complete') {
        updateComplianceData(data);
      }
    });

    return unsubscribe;
  }, [dateRange]);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      const report = await complianceAPI.getComplianceReport();
      setComplianceReport(report);
    } catch (err) {
      setError('Failed to load compliance data');
      console.error('Error loading compliance:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStandards = async () => {
    try {
      const standardsData = await complianceAPI.getComplianceStandards();
      setStandards(standardsData);
    } catch (err) {
      console.error('Error loading standards:', err);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const logs = await complianceAPI.getAuditLogs(dateRange);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    }
  };

  const updateComplianceData = (newData: Partial<ComplianceReport>) => {
    if (complianceReport) {
      setComplianceReport({ ...complianceReport, ...newData });
    }
  };

  const runComplianceCheck = async (standardId: string) => {
    try {
      await complianceAPI.runComplianceCheck(standardId);
      loadComplianceData(); // Refresh data
    } catch (err) {
      console.error('Error running compliance check:', err);
      setError('Failed to run compliance check');
    }
  };

  const exportComplianceReport = async () => {
    try {
      const report = await complianceAPI.exportComplianceReport();
      // Trigger download
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Failed to export compliance report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'success';
      case 'non-compliant': return 'danger';
      case 'warning': return 'warning';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return 'fas fa-check-circle';
      case 'non-compliant': return 'fas fa-times-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'pending': return 'fas fa-clock';
      default: return 'fas fa-question-circle';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const filteredAuditLogs = auditLogs.filter(log => {
    if (auditFilter === 'all') return true;
    return log.result === auditFilter;
  });

  if (loading) {
    return (
      <div className="compliance">
        <div className="compliance-loading">
          <div className="spinner"></div>
          <p>Loading compliance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="compliance">
        <div className="compliance-error">
          <h3>Error</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => { setError(null); loadComplianceData(); }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="compliance">
      <div className="compliance-header">
        <div className="header-content">
          <h2>Compliance Center</h2>
          <p>Monitor regulatory compliance and manage audit requirements</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-outline-secondary"
            onClick={loadComplianceData}
          >
            <i className="fas fa-sync"></i> Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={exportComplianceReport}
          >
            <i className="fas fa-download"></i> Export Report
          </button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="compliance-overview">
        <div className="overview-card">
          <div className="overview-header">
            <h3>Overall Compliance Score</h3>
            <div className="score-display">
              <span className="score-value">{complianceReport?.overallScore || 0}%</span>
              <div className="score-ring">
                <svg width="80" height="80">
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="#333"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="35"
                    stroke="#28a745"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 35 * (complianceReport?.overallScore || 0) / 100} ${2 * Math.PI * 35}`}
                    strokeDashoffset={2 * Math.PI * 35 * 0.25}
                    transform="rotate(-90 40 40)"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="overview-stats">
          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="stat-content">
              <h4>{complianceReport?.compliantStandards || 0}</h4>
              <p>Compliant Standards</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="stat-content">
              <h4>{complianceReport?.violations || 0}</h4>
              <p>Active Violations</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <h4>{complianceReport?.pendingChecks || 0}</h4>
              <p>Pending Checks</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <div className="stat-content">
              <h4>{new Date(complianceReport?.lastAudit || '').toLocaleDateString()}</h4>
              <p>Last Audit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Standards Compliance */}
      <div className="standards-section">
        <div className="section-header">
          <h3>Compliance Standards</h3>
          <div className="section-actions">
            <button className="btn btn-outline-primary">
              <i className="fas fa-plus"></i> Add Standard
            </button>
          </div>
        </div>

        <div className="standards-grid">
          {standards.map(standard => (
            <div key={standard.id} className="standard-card">
              <div className="standard-header">
                <div className="standard-info">
                  <h4>{standard.name}</h4>
                  <p>{standard.description}</p>
                </div>
                <div className={`standard-status status-${getStatusColor(standard.status)}`}>
                  <i className={getStatusIcon(standard.status)}></i>
                  <span>{standard.status}</span>
                </div>
              </div>

              <div className="standard-details">
                <div className="detail-item">
                  <label>Version:</label>
                  <span>{standard.version}</span>
                </div>
                <div className="detail-item">
                  <label>Last Checked:</label>
                  <span>{new Date(standard.lastChecked).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Next Check:</label>
                  <span>{new Date(standard.nextCheck).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Requirements:</label>
                  <span>{standard.requirements?.length || 0} items</span>
                </div>
              </div>

              <div className="standard-actions">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => runComplianceCheck(standard.id)}
                >
                  <i className="fas fa-play"></i> Run Check
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setSelectedStandard(standard)}
                >
                  <i className="fas fa-eye"></i> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs */}
      <div className="audit-section">
        <div className="section-header">
          <h3>Audit Logs</h3>
          <div className="section-actions">
            <select
              className="form-control"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <select
              className="form-control"
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value as 'all' | 'passed' | 'failed' | 'warning')}
            >
              <option value="all">All Results</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="warning">Warnings</option>
            </select>
            <button
              className="btn btn-outline-secondary"
              onClick={() => setShowAuditModal(true)}
            >
              <i className="fas fa-search"></i> Advanced Search
            </button>
          </div>
        </div>

        <div className="audit-logs">
          {filteredAuditLogs.length === 0 ? (
            <div className="no-audit-logs">
              <i className="fas fa-clipboard-list"></i>
              <p>No audit logs found for the selected criteria.</p>
            </div>
          ) : (
            filteredAuditLogs.map(log => (
              <div key={log.id} className="audit-log-item">
                <div className="log-header">
                  <div className="log-info">
                    <h4>{log.checkName}</h4>
                    <div className="log-meta">
                      <span className="log-standard">{log.standard}</span>
                      <span className="log-timestamp">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <span className="log-user">{log.user}</span>
                    </div>
                  </div>
                  <div className={`log-result result-${log.result}`}>
                    <i className={log.result === 'passed' ? 'fas fa-check' : log.result === 'failed' ? 'fas fa-times' : 'fas fa-exclamation'}></i>
                    <span>{log.result}</span>
                  </div>
                </div>

                {log.details && (
                  <div className="log-details">
                    <p>{log.details}</p>
                    {log.violations && log.violations.length > 0 && (
                      <div className="violations-list">
                        <h5>Violations:</h5>
                        <ul>
                          {log.violations.map((violation, index) => (
                            <li key={index}>
                              <span className={`severity-badge severity-${getSeverityColor(violation.severity)}`}>
                                {violation.severity}
                              </span>
                              {violation.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Standard Details Modal */}
      {selectedStandard && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedStandard.name}</h3>
              <button
                className="modal-close"
                onClick={() => setSelectedStandard(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="standard-detail-section">
                <h4>Overview</h4>
                <p>{selectedStandard.description}</p>

                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status-${getStatusColor(selectedStandard.status)}`}>
                      {selectedStandard.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Version:</label>
                    <span>{selectedStandard.version}</span>
                  </div>
                  <div className="detail-item">
                    <label>Category:</label>
                    <span>{selectedStandard.category}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Checked:</label>
                    <span>{new Date(selectedStandard.lastChecked).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedStandard.requirements && (
                <div className="standard-detail-section">
                  <h4>Requirements</h4>
                  <div className="requirements-list">
                    {selectedStandard.requirements.map((req, index) => (
                      <div key={index} className="requirement-item">
                        <div className="requirement-header">
                          <h5>{req.title}</h5>
                          <span className={`requirement-status status-${getStatusColor(req.status)}`}>
                            {req.status}
                          </span>
                        </div>
                        <p>{req.description}</p>
                        {req.evidence && (
                          <div className="requirement-evidence">
                            <strong>Evidence:</strong> {req.evidence}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedStandard(null)}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => runComplianceCheck(selectedStandard.id)}
              >
                Run Compliance Check
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Search Modal */}
      {showAuditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Advanced Audit Search</h3>
              <button
                className="modal-close"
                onClick={() => setShowAuditModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <form className="audit-search-form">
                <div className="form-group">
                  <label>Standard:</label>
                  <select className="form-control">
                    <option value="">All Standards</option>
                    {standards.map(std => (
                      <option key={std.id} value={std.id}>{std.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Result:</label>
                  <select className="form-control">
                    <option value="">All Results</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                    <option value="warning">Warning</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>User:</label>
                  <input type="text" className="form-control" placeholder="Search by user" />
                </div>

                <div className="form-group">
                  <label>Date Range:</label>
                  <div className="date-range">
                    <input type="date" className="form-control" />
                    <span>to</span>
                    <input type="date" className="form-control" />
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowAuditModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary">
                Search
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compliance;