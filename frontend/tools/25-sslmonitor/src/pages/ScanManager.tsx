import React, { useState, useEffect } from 'react';
import { ScanResult, Domain, ScanConfig } from '../types';
import { scanAPI, systemAPI } from '../services/api';
import wsService from '../services/websocket';
import './ScanManager.css';

const ScanManager: React.FC = () => {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);
  const [showNewScanModal, setShowNewScanModal] = useState(false);
  const [scanConfig, setScanConfig] = useState<ScanConfig>({
    domainId: '',
    scanType: 'full',
    priority: 'normal',
    scheduled: false,
    scheduleTime: '',
    includeSubdomains: true,
    checkCertificateTransparency: true,
    vulnerabilityScan: true,
    complianceCheck: true
  });

  useEffect(() => {
    loadScans();
    loadDomains();

    // Subscribe to real-time scan updates
    const unsubscribe = wsService.subscribe('scan_update', (data) => {
      if (data.type === 'scan_progress' || data.type === 'scan_complete') {
        updateScanInList(data.scan);
      }
    });

    return unsubscribe;
  }, []);

  const loadScans = async () => {
    try {
      setLoading(true);
      const scanData = await scanAPI.getScans();
      setScans(scanData);
    } catch (err) {
      setError('Failed to load scans');
      console.error('Error loading scans:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDomains = async () => {
    try {
      const domainData = await apiService.getDomains();
      setDomains(domainData);
    } catch (err) {
      console.error('Error loading domains:', err);
    }
  };

  const updateScanInList = (updatedScan: ScanResult) => {
    setScans(prevScans =>
      prevScans.map(scan =>
        scan.id === updatedScan.id ? updatedScan : scan
      )
    );

    if (selectedScan && selectedScan.id === updatedScan.id) {
      setSelectedScan(updatedScan);
    }
  };

  const handleNewScan = async () => {
    try {
      await apiService.createScan(scanConfig);
      setShowNewScanModal(false);
      resetScanConfig();
      loadScans(); // Refresh the list
    } catch (err) {
      console.error('Error creating scan:', err);
      setError('Failed to create scan');
    }
  };

  const resetScanConfig = () => {
    setScanConfig({
      domainId: '',
      scanType: 'full',
      priority: 'normal',
      scheduled: false,
      scheduleTime: '',
      includeSubdomains: true,
      checkCertificateTransparency: true,
      vulnerabilityScan: true,
      complianceCheck: true
    });
  };

  const handleCancelScan = async (scanId: string) => {
    try {
      await apiService.cancelScan(scanId);
      loadScans();
    } catch (err) {
      console.error('Error canceling scan:', err);
      setError('Failed to cancel scan');
    }
  };

  const handleRetryScan = async (scanId: string) => {
    try {
      await apiService.retryScan(scanId);
      loadScans();
    } catch (err) {
      console.error('Error retrying scan:', err);
      setError('Failed to retry scan');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'primary';
      case 'failed': return 'danger';
      case 'cancelled': return 'secondary';
      case 'queued': return 'warning';
      default: return 'secondary';
    }
  };

  const getScanTypeLabel = (type: string) => {
    switch (type) {
      case 'full': return 'Full Scan';
      case 'certificate': return 'Certificate Only';
      case 'vulnerability': return 'Vulnerability Scan';
      case 'compliance': return 'Compliance Check';
      default: return type;
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  if (loading) {
    return (
      <div className="scan-manager">
        <div className="scan-manager-loading">
          <div className="spinner"></div>
          <p>Loading scans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scan-manager">
        <div className="scan-manager-error">
          <h3>Error</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => { setError(null); loadScans(); }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="scan-manager">
      <div className="manager-header">
        <div className="header-content">
          <h2>Scan Manager</h2>
          <p>Manage SSL certificate scans and monitor scan progress</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowNewScanModal(true)}
          >
            <i className="fas fa-plus"></i> New Scan
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={loadScans}
          >
            <i className="fas fa-sync"></i> Refresh
          </button>
        </div>
      </div>

      {/* Scan Statistics */}
      <div className="scan-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{scans.filter(s => s.status === 'running').length}</h3>
            <p>Running Scans</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-list"></i>
          </div>
          <div className="stat-content">
            <h3>{scans.filter(s => s.status === 'queued').length}</h3>
            <p>Queued Scans</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>{scans.filter(s => s.status === 'completed').length}</h3>
            <p>Completed Today</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-content">
            <h3>{scans.filter(s => s.status === 'failed').length}</h3>
            <p>Failed Scans</p>
          </div>
        </div>
      </div>

      {/* Scan Queue and Results */}
      <div className="scan-content">
        <div className="scan-queue">
          <div className="queue-header">
            <h3>Scan Queue & History</h3>
            <div className="queue-filters">
              <select className="form-control">
                <option value="all">All Scans</option>
                <option value="running">Running</option>
                <option value="queued">Queued</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="scan-items">
            {scans.length === 0 ? (
              <div className="no-scans">
                <i className="fas fa-search"></i>
                <p>No scans found. Create your first scan to get started.</p>
              </div>
            ) : (
              scans.map(scan => (
                <div
                  key={scan.id}
                  className={`scan-item ${selectedScan?.id === scan.id ? 'selected' : ''}`}
                  onClick={() => setSelectedScan(scan)}
                >
                  <div className="scan-header">
                    <div className="scan-info">
                      <h4>{scan.domain}</h4>
                      <div className="scan-meta">
                        <span className={`badge badge-${getStatusColor(scan.status)}`}>
                          {scan.status}
                        </span>
                        <span className="scan-type">{getScanTypeLabel(scan.scanType)}</span>
                        <span className="scan-time">
                          {new Date(scan.startTime).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="scan-actions">
                      {scan.status === 'running' && (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={(e) => { e.stopPropagation(); handleCancelScan(scan.id); }}
                        >
                          Cancel
                        </button>
                      )}
                      {scan.status === 'failed' && (
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={(e) => { e.stopPropagation(); handleRetryScan(scan.id); }}
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>

                  {scan.status === 'running' && scan.progress !== undefined && (
                    <div className="scan-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${scan.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{scan.progress}%</span>
                    </div>
                  )}

                  <div className="scan-duration">
                    Duration: {formatDuration(scan.startTime, scan.endTime)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Scan Details Panel */}
        <div className="scan-details-panel">
          {selectedScan ? (
            <>
              <div className="panel-header">
                <h3>Scan Details</h3>
                <div className="panel-actions">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setSelectedScan(null)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <div className="panel-content">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Domain:</label>
                      <span>{selectedScan.domain}</span>
                    </div>
                    <div className="detail-item">
                      <label>Scan Type:</label>
                      <span>{getScanTypeLabel(selectedScan.scanType)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span className={`status-${selectedScan.status}`}>
                        {selectedScan.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Priority:</label>
                      <span>{selectedScan.priority}</span>
                    </div>
                    <div className="detail-item">
                      <label>Start Time:</label>
                      <span>{new Date(selectedScan.startTime).toLocaleString()}</span>
                    </div>
                    {selectedScan.endTime && (
                      <div className="detail-item">
                        <label>End Time:</label>
                        <span>{new Date(selectedScan.endTime).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <label>Duration:</label>
                      <span>{formatDuration(selectedScan.startTime, selectedScan.endTime)}</span>
                    </div>
                  </div>
                </div>

                {selectedScan.results && (
                  <div className="detail-section">
                    <h4>Scan Results</h4>
                    <div className="scan-results">
                      <div className="result-item">
                        <label>Grade:</label>
                        <span className={`grade grade-${selectedScan.results.grade?.toLowerCase()}`}>
                          {selectedScan.results.grade || 'N/A'}
                        </span>
                      </div>
                      <div className="result-item">
                        <label>Issues Found:</label>
                        <span>{selectedScan.results.issues?.length || 0}</span>
                      </div>
                      <div className="result-item">
                        <label>Vulnerabilities:</label>
                        <span>{selectedScan.results.vulnerabilities?.length || 0}</span>
                      </div>
                      <div className="result-item">
                        <label>Compliance Score:</label>
                        <span>{selectedScan.results.complianceScore || 'N/A'}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedScan.error && (
                  <div className="detail-section">
                    <h4>Error Details</h4>
                    <div className="error-message">
                      <p>{selectedScan.error}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-selection">
              <i className="fas fa-search"></i>
              <p>Select a scan to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* New Scan Modal */}
      {showNewScanModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Scan</h3>
              <button
                className="modal-close"
                onClick={() => setShowNewScanModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <form className="scan-form">
                <div className="form-group">
                  <label>Domain:</label>
                  <select
                    className="form-control"
                    value={scanConfig.domainId}
                    onChange={(e) => setScanConfig({...scanConfig, domainId: e.target.value})}
                  >
                    <option value="">Select Domain</option>
                    {domains.map(domain => (
                      <option key={domain.id} value={domain.id}>
                        {domain.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Scan Type:</label>
                  <select
                    className="form-control"
                    value={scanConfig.scanType}
                    onChange={(e) => setScanConfig({...scanConfig, scanType: e.target.value})}
                  >
                    <option value="full">Full Scan</option>
                    <option value="certificate">Certificate Only</option>
                    <option value="vulnerability">Vulnerability Scan</option>
                    <option value="compliance">Compliance Check</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority:</label>
                  <select
                    className="form-control"
                    value={scanConfig.priority}
                    onChange={(e) => setScanConfig({...scanConfig, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={scanConfig.scheduled}
                      onChange={(e) => setScanConfig({...scanConfig, scheduled: e.target.checked})}
                    />
                    Schedule Scan
                  </label>
                </div>

                {scanConfig.scheduled && (
                  <div className="form-group">
                    <label>Schedule Time:</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={scanConfig.scheduleTime}
                      onChange={(e) => setScanConfig({...scanConfig, scheduleTime: e.target.value})}
                    />
                  </div>
                )}

                <div className="form-options">
                  <label>
                    <input
                      type="checkbox"
                      checked={scanConfig.includeSubdomains}
                      onChange={(e) => setScanConfig({...scanConfig, includeSubdomains: e.target.checked})}
                    />
                    Include Subdomains
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={scanConfig.checkCertificateTransparency}
                      onChange={(e) => setScanConfig({...scanConfig, checkCertificateTransparency: e.target.checked})}
                    />
                    Certificate Transparency Check
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={scanConfig.vulnerabilityScan}
                      onChange={(e) => setScanConfig({...scanConfig, vulnerabilityScan: e.target.checked})}
                    />
                    Vulnerability Scan
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={scanConfig.complianceCheck}
                      onChange={(e) => setScanConfig({...scanConfig, complianceCheck: e.target.checked})}
                    />
                    Compliance Check
                  </label>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowNewScanModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNewScan}
                disabled={!scanConfig.domainId}
              >
                Start Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanManager;