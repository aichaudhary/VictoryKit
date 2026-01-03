import React, { useState, useEffect } from 'react';
import { domainAPI, certificateAPI } from '../services/api';
import { Domain, Certificate } from '../types/index';
import wsService from '../services/websocket';
import './DomainManager.css';

const DomainManager: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'website',
    priority: 'medium',
    monitoringEnabled: true,
    scanFrequency: 'daily',
    alertThresholds: {
      expiryWarning: 30,
      expiryCritical: 7,
      gradeThreshold: 'B'
    },
    tags: [] as string[]
  });

  useEffect(() => {
    loadData();

    // Connect to WebSocket for real-time updates
    wsService.connect();
    wsService.on('domain_updated', handleDomainUpdate);
    wsService.on('domain_created', handleDomainCreated);
    wsService.on('domain_deleted', handleDomainDeleted);
    wsService.on('certificate_updated', handleCertificateUpdate);

    return () => {
      wsService.off('domain_updated', handleDomainUpdate);
      wsService.off('domain_created', handleDomainCreated);
      wsService.off('domain_deleted', handleDomainDeleted);
      wsService.off('certificate_updated', handleCertificateUpdate);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [domainsRes, certsRes] = await Promise.all([
        domainAPI.getAll(),
        certificateAPI.getAll()
      ]);

      if (domainsRes.data.success) {
        setDomains(domainsRes.data.data.data);
      }

      if (certsRes.data.success) {
        setCertificates(certsRes.data.data.data);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDomainUpdate = (data: Domain) => {
    setDomains(prev =>
      prev.map(domain => domain._id === data._id ? data : domain)
    );
    if (selectedDomain && selectedDomain._id === data._id) {
      setSelectedDomain(data);
    }
  };

  const handleDomainCreated = (data: Domain) => {
    setDomains(prev => [data, ...prev]);
  };

  const handleDomainDeleted = (data: { _id: string }) => {
    setDomains(prev => prev.filter(domain => domain._id !== data._id));
    if (selectedDomain && selectedDomain._id === data._id) {
      setSelectedDomain(null);
    }
  };

  const handleCertificateUpdate = (data: Certificate) => {
    setCertificates(prev =>
      prev.map(cert => cert._id === data._id ? data : cert)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (selectedDomain) {
        // Update existing domain
        await domainAPI.update(selectedDomain._id, formData);
      } else {
        // Create new domain
        await domainAPI.create(formData);
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'website',
        priority: 'medium',
        monitoringEnabled: true,
        scanFrequency: 'daily',
        alertThresholds: {
          expiryWarning: 30,
          expiryCritical: 7,
          gradeThreshold: 'B'
        },
        tags: []
      });
      setSelectedDomain(null);
      setShowAddForm(false);

      // WebSocket will handle the update
    } catch (err) {
      console.error('Failed to save domain:', err);
      setError('Failed to save domain');
    }
  };

  const handleEdit = (domain: Domain) => {
    setSelectedDomain(domain);
    setFormData({
      name: domain.name,
      description: domain.description || '',
      category: domain.category || 'website',
      priority: domain.priority || 'medium',
      monitoringEnabled: domain.monitoringEnabled !== false,
      scanFrequency: domain.scanFrequency || 'daily',
      alertThresholds: domain.alertThresholds || {
        expiryWarning: 30,
        expiryCritical: 7,
        gradeThreshold: 'B'
      },
      tags: domain.tags || []
    });
    setShowAddForm(true);
  };

  const handleDelete = async (domainId: string) => {
    if (!window.confirm('Are you sure you want to delete this domain? This will also remove all associated certificates.')) {
      return;
    }

    try {
      await domainAPI.delete(domainId);
      // WebSocket will handle the update
    } catch (err) {
      console.error('Failed to delete domain:', err);
      setError('Failed to delete domain');
    }
  };

  const handleScanDomain = async (domainId: string) => {
    try {
      await domainAPI.scan(domainId);
      // WebSocket will handle the update
    } catch (err) {
      console.error('Failed to scan domain:', err);
    }
  };

  const getDomainCertificates = (domainId: string) => {
    return certificates.filter(cert => cert.domainId === domainId);
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'low': '#28a745',
      'medium': '#ffc107',
      'high': '#fd7e14',
      'critical': '#dc3545'
    };
    return colors[priority] || '#6c757d';
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'website': '🌐',
      'api': '🔌',
      'email': '📧',
      'internal': '🏢',
      'external': '🌍'
    };
    return icons[category] || '📄';
  };

  const filteredDomains = domains.filter(domain =>
    domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (domain.description && domain.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="domain-manager-loading">
        <div className="spinner"></div>
        <p>Loading domains...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="domain-manager-error">
        <h3>Error Loading Domains</h3>
        <p>{error}</p>
        <button onClick={loadData} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="domain-manager">
      {/* Header */}
      <div className="manager-header">
        <h2>Domain Manager</h2>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '✕ Cancel' : '➕ Add Domain'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => loadData()}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="domain-form">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Domain Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="example.com"
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Optional description"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="form-control"
                >
                  <option value="website">Website</option>
                  <option value="api">API</option>
                  <option value="email">Email</option>
                  <option value="internal">Internal</option>
                  <option value="external">External</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="form-control"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Scan Frequency</label>
                <select
                  value={formData.scanFrequency}
                  onChange={(e) => setFormData({...formData, scanFrequency: e.target.value})}
                  className="form-control"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.monitoringEnabled}
                    onChange={(e) => setFormData({...formData, monitoringEnabled: e.target.checked})}
                  />
                  Enable Monitoring
                </label>
              </div>
            </div>

            <div className="form-section">
              <h4>Alert Thresholds</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Expiry Warning (days)</label>
                  <input
                    type="number"
                    value={formData.alertThresholds.expiryWarning}
                    onChange={(e) => setFormData({
                      ...formData,
                      alertThresholds: {
                        ...formData.alertThresholds,
                        expiryWarning: parseInt(e.target.value)
                      }
                    })}
                    min="1"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Critical (days)</label>
                  <input
                    type="number"
                    value={formData.alertThresholds.expiryCritical}
                    onChange={(e) => setFormData({
                      ...formData,
                      alertThresholds: {
                        ...formData.alertThresholds,
                        expiryCritical: parseInt(e.target.value)
                      }
                    })}
                    min="1"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Grade Threshold</label>
                  <select
                    value={formData.alertThresholds.gradeThreshold}
                    onChange={(e) => setFormData({
                      ...formData,
                      alertThresholds: {
                        ...formData.alertThresholds,
                        gradeThreshold: e.target.value
                      }
                    })}
                    className="form-control"
                  >
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="A-">A-</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {selectedDomain ? 'Update Domain' : 'Add Domain'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedDomain(null);
                  setFormData({
                    name: '',
                    description: '',
                    category: 'website',
                    priority: 'medium',
                    monitoringEnabled: true,
                    scanFrequency: 'daily',
                    alertThresholds: {
                      expiryWarning: 30,
                      expiryCritical: 7,
                      gradeThreshold: 'B'
                    },
                    tags: []
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search domains..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control search-input"
        />
      </div>

      {/* Domain List */}
      <div className="domain-list">
        <div className="list-header">
          <h3>Domains ({filteredDomains.length})</h3>
        </div>

        <div className="domain-grid">
          {filteredDomains.map((domain) => {
            const domainCerts = getDomainCertificates(domain._id);
            const validCerts = domainCerts.filter(cert => cert.status === 'valid').length;
            const expiringCerts = domainCerts.filter(cert => cert.status === 'expiring_soon').length;
            const expiredCerts = domainCerts.filter(cert => cert.status === 'expired').length;

            return (
              <div key={domain._id} className="domain-card">
                <div className="domain-header">
                  <div className="domain-info">
                    <div className="domain-name">
                      <span className="category-icon">{getCategoryIcon(domain.category || 'website')}</span>
                      <h4>{domain.name}</h4>
                    </div>
                    {domain.description && (
                      <p className="domain-description">{domain.description}</p>
                    )}
                  </div>
                  <div className="domain-badges">
                    <span
                      className="badge priority-badge"
                      style={{ backgroundColor: getPriorityColor(domain.priority || 'medium') }}
                    >
                      {domain.priority || 'medium'}
                    </span>
                    {!domain.monitoringEnabled && (
                      <span className="badge badge-secondary">Monitoring Off</span>
                    )}
                  </div>
                </div>

                <div className="domain-stats">
                  <div className="stat-item">
                    <span className="stat-label">Certificates:</span>
                    <span className="stat-value">{domainCerts.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Valid:</span>
                    <span className="stat-value valid">{validCerts}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Expiring:</span>
                    <span className="stat-value warning">{expiringCerts}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Expired:</span>
                    <span className="stat-value danger">{expiredCerts}</span>
                  </div>
                </div>

                <div className="domain-details">
                  <div className="detail-row">
                    <span className="label">Category:</span>
                    <span className="value">{domain.category || 'website'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Scan Frequency:</span>
                    <span className="value">{domain.scanFrequency || 'daily'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Last Scanned:</span>
                    <span className="value">
                      {domain.lastScanned ? new Date(domain.lastScanned).toLocaleString() : 'Never'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Created:</span>
                    <span className="value">{new Date(domain.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="domain-actions">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleScanDomain(domain._id)}
                  >
                    🔍 Scan
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleEdit(domain)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(domain._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDomains.length === 0 && (
          <div className="no-domains">
            <p>No domains found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainManager;