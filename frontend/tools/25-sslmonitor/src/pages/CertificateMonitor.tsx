import React, { useState, useEffect } from 'react';
import { certificateAPI, domainAPI } from '../services/api';
import { Certificate, Domain } from '../types/index';
import wsService from '../services/websocket';
import './CertificateMonitor.css';

const CertificateMonitor: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    loadData();

    // Connect to WebSocket for real-time updates
    wsService.connect();
    wsService.on('certificate_updated', handleCertificateUpdate);
    wsService.on('certificate_created', handleCertificateCreated);
    wsService.on('certificate_deleted', handleCertificateDeleted);

    return () => {
      wsService.off('certificate_updated', handleCertificateUpdate);
      wsService.off('certificate_created', handleCertificateCreated);
      wsService.off('certificate_deleted', handleCertificateDeleted);
    };
  }, []);

  useEffect(() => {
    loadCertificates();
  }, [selectedDomain, searchTerm, filterStatus, filterGrade]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [domainsRes] = await Promise.all([
        domainAPI.getAll()
      ]);

      if (domainsRes.data.success) {
        setDomains(domainsRes.data.data.data);
      }

      await loadCertificates();
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadCertificates = async () => {
    try {
      const params: any = {};
      if (selectedDomain) params.domain = selectedDomain;
      if (searchTerm) params.search = searchTerm;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterGrade !== 'all') params.grade = filterGrade;

      const response = await certificateAPI.getAll(params);
      if (response.data.success) {
        setCertificates(response.data.data.data);
      }
    } catch (err) {
      console.error('Failed to load certificates:', err);
      setError('Failed to load certificates');
    }
  };

  const handleCertificateUpdate = (data: Certificate) => {
    setCertificates(prev =>
      prev.map(cert => cert._id === data._id ? data : cert)
    );
    if (selectedCertificate && selectedCertificate._id === data._id) {
      setSelectedCertificate(data);
    }
  };

  const handleCertificateCreated = (data: Certificate) => {
    setCertificates(prev => [data, ...prev]);
  };

  const handleCertificateDeleted = (data: { _id: string }) => {
    setCertificates(prev => prev.filter(cert => cert._id !== data._id));
    if (selectedCertificate && selectedCertificate._id === data._id) {
      setSelectedCertificate(null);
    }
  };

  const handleScanCertificate = async (certificateId: string) => {
    try {
      await certificateAPI.scan(certificateId);
      // WebSocket will handle the update
    } catch (err) {
      console.error('Failed to scan certificate:', err);
    }
  };

  const handleDeleteCertificate = async (certificateId: string) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) {
      return;
    }

    try {
      await certificateAPI.delete(certificateId);
      // WebSocket will handle the update
    } catch (err) {
      console.error('Failed to delete certificate:', err);
    }
  };

  const getGradeColor = (grade: string) => {
    const colors: { [key: string]: string } = {
      'A+': '#28a745',
      'A': '#28a745',
      'A-': '#28a745',
      'B': '#ffc107',
      'C': '#fd7e14',
      'D': '#dc3545',
      'F': '#dc3545',
      'T': '#6c757d',
      'M': '#6c757d'
    };
    return colors[grade] || '#6c757d';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'valid': '#28a745',
      'expired': '#dc3545',
      'expiring_soon': '#ffc107',
      'invalid': '#dc3545',
      'unknown': '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: { [key: string]: string } = {
      'valid': 'badge-success',
      'expired': 'badge-danger',
      'expiring_soon': 'badge-warning',
      'invalid': 'badge-danger',
      'unknown': 'badge-secondary'
    };
    return classes[status] || 'badge-secondary';
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = !searchTerm ||
      cert.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.issuer?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="certificate-monitor-loading">
        <div className="spinner"></div>
        <p>Loading certificates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="certificate-monitor-error">
        <h3>Error Loading Certificates</h3>
        <p>{error}</p>
        <button onClick={loadData} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="certificate-monitor">
      {/* Header */}
      <div className="monitor-header">
        <h2>Certificate Monitor</h2>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => loadCertificates()}
          >
            🔄 Refresh
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setSelectedCertificate(null)}
          >
            ➕ Add Certificate
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Domain:</label>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="form-control"
          >
            <option value="">All Domains</option>
            {domains.map(domain => (
              <option key={domain._id} value={domain._id}>
                {domain.name}
              </option>
            ))}
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
            <option value="valid">Valid</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="expired">Expired</option>
            <option value="invalid">Invalid</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Grade:</label>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="form-control"
          >
            <option value="all">All Grades</option>
            <option value="A+">A+</option>
            <option value="A">A</option>
            <option value="A-">A-</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="F">F</option>
            <option value="T">T</option>
            <option value="M">M</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search certificates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="monitor-content">
        {/* Certificate List */}
        <div className="certificate-list">
          <div className="list-header">
            <h3>Certificates ({filteredCertificates.length})</h3>
          </div>

          <div className="certificate-grid">
            {filteredCertificates.map((cert) => (
              <div
                key={cert._id}
                className={`certificate-card ${selectedCertificate?._id === cert._id ? 'selected' : ''}`}
                onClick={() => setSelectedCertificate(cert)}
              >
                <div className="certificate-header">
                  <div className="domain-info">
                    <h4>{cert.domain}</h4>
                    <span className="issuer">{cert.issuer}</span>
                  </div>
                  <div className="certificate-badges">
                    <span
                      className={`badge grade-badge`}
                      style={{ backgroundColor: getGradeColor(cert.grade) }}
                    >
                      {cert.grade}
                    </span>
                    <span className={`badge status-badge ${getStatusBadgeClass(cert.status)}`}>
                      {cert.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="certificate-details">
                  <div className="detail-row">
                    <span className="label">Valid From:</span>
                    <span className="value">
                      {new Date(cert.validity.notBefore).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Valid Until:</span>
                    <span className="value">
                      {new Date(cert.validity.notAfter).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Days Remaining:</span>
                    <span className={`value ${cert.validity.daysRemaining <= 30 ? 'warning' : ''}`}>
                      {cert.validity.daysRemaining}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Last Scanned:</span>
                    <span className="value">
                      {cert.lastScanned ? new Date(cert.lastScanned).toLocaleString() : 'Never'}
                    </span>
                  </div>
                </div>

                <div className="certificate-actions">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScanCertificate(cert._id);
                    }}
                  >
                    🔍 Scan
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCertificate(cert._id);
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCertificates.length === 0 && (
            <div className="no-certificates">
              <p>No certificates found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Certificate Details Panel */}
        {selectedCertificate && (
          <div className="certificate-details-panel">
            <div className="panel-header">
              <h3>Certificate Details</h3>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setSelectedCertificate(null)}
              >
                ✕
              </button>
            </div>

            <div className="panel-content">
              <div className="detail-section">
                <h4>Basic Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Domain:</label>
                    <span>{selectedCertificate.domain}</span>
                  </div>
                  <div className="detail-item">
                    <label>Issuer:</label>
                    <span>{selectedCertificate.issuer}</span>
                  </div>
                  <div className="detail-item">
                    <label>Grade:</label>
                    <span style={{ color: getGradeColor(selectedCertificate.grade) }}>
                      {selectedCertificate.grade}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={getStatusBadgeClass(selectedCertificate.status)}>
                      {selectedCertificate.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Validity Period</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Valid From:</label>
                    <span>{new Date(selectedCertificate.validity.notBefore).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Valid Until:</label>
                    <span>{new Date(selectedCertificate.validity.notAfter).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Days Remaining:</label>
                    <span className={selectedCertificate.validity.daysRemaining <= 30 ? 'warning' : ''}>
                      {selectedCertificate.validity.daysRemaining}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Total Validity Days:</label>
                    <span>{selectedCertificate.validity.totalDays}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Technical Details</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Serial Number:</label>
                    <span className="mono">{selectedCertificate.serialNumber}</span>
                  </div>
                  <div className="detail-item">
                    <label>Signature Algorithm:</label>
                    <span>{selectedCertificate.signatureAlgorithm}</span>
                  </div>
                  <div className="detail-item">
                    <label>Key Size:</label>
                    <span>{selectedCertificate.keySize} bits</span>
                  </div>
                  <div className="detail-item">
                    <label>Version:</label>
                    <span>{selectedCertificate.version}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Scan Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Last Scanned:</label>
                    <span>
                      {selectedCertificate.lastScanned
                        ? new Date(selectedCertificate.lastScanned).toLocaleString()
                        : 'Never'
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Scan Status:</label>
                    <span>{selectedCertificate.scanStatus || 'Unknown'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Created:</label>
                    <span>{new Date(selectedCertificate.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Updated:</label>
                    <span>{new Date(selectedCertificate.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedCertificate.vulnerabilities && selectedCertificate.vulnerabilities.length > 0 && (
                <div className="detail-section">
                  <h4>Vulnerabilities</h4>
                  <div className="vulnerabilities-list">
                    {selectedCertificate.vulnerabilities.map((vuln, index) => (
                      <div key={index} className="vulnerability-item">
                        <div className="vulnerability-header">
                          <span className="vulnerability-name">{vuln.name}</span>
                          <span className={`vulnerability-severity severity-${vuln.severity}`}>
                            {vuln.severity}
                          </span>
                        </div>
                        <p className="vulnerability-description">{vuln.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateMonitor;