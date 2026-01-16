/**
 * XDR Alerts Dashboard Component
 * Unified view of all security alerts across data sources
 */

import React, { useState, useEffect } from 'react';
import type { Alert, AlertSeverity, AlertStatus, DataSourceType } from '../types/xdr.types';
import { xdrApi } from '../api/xdr.api';

// ============================================================================
// Helper Functions
// ============================================================================

const getSeverityColor = (severity: AlertSeverity): string => {
  const colors: Record<AlertSeverity, string> = {
    critical: '#ff4757',
    high: '#ff6b35',
    medium: '#ffa502',
    low: '#3742fa',
    info: '#70a1ff',
  };
  return colors[severity];
};

const getSeverityBg = (severity: AlertSeverity): string => {
  const colors: Record<AlertSeverity, string> = {
    critical: 'rgba(255, 71, 87, 0.15)',
    high: 'rgba(255, 107, 53, 0.15)',
    medium: 'rgba(255, 165, 2, 0.15)',
    low: 'rgba(55, 66, 250, 0.15)',
    info: 'rgba(112, 161, 255, 0.15)',
  };
  return colors[severity];
};

const getStatusColor = (status: AlertStatus): string => {
  const colors: Record<AlertStatus, string> = {
    'new': '#ff4757',
    'in-progress': '#ffa502',
    'resolved': '#2ed573',
    'false-positive': '#a4b0be',
    'suppressed': '#747d8c',
  };
  return colors[status];
};

const getSourceIcon = (source: DataSourceType): string => {
  const icons: Record<DataSourceType, string> = {
    edr: '🖥️',
    ndr: '🌐',
    identity: '👤',
    email: '📧',
    cloud: '☁️',
    firewall: '🔥',
    proxy: '🔗',
    dns: '🌍',
    siem: '📊',
    custom: '⚙️',
  };
  return icons[source];
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

// ============================================================================
// Sub-components
// ============================================================================

interface FilterBarProps {
  filters: {
    severity: AlertSeverity[];
    status: AlertStatus[];
    source: DataSourceType[];
    search: string;
  };
  onFilterChange: (filters: FilterBarProps['filters']) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  const severities: AlertSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];
  const statuses: AlertStatus[] = ['new', 'in-progress', 'resolved', 'false-positive'];
  const sources: DataSourceType[] = ['edr', 'ndr', 'identity', 'email', 'cloud', 'dns', 'firewall'];
  
  const toggleSeverity = (sev: AlertSeverity) => {
    const newSeverities = filters.severity.includes(sev)
      ? filters.severity.filter(s => s !== sev)
      : [...filters.severity, sev];
    onFilterChange({ ...filters, severity: newSeverities });
  };
  
  const toggleStatus = (status: AlertStatus) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFilterChange({ ...filters, status: newStatuses });
  };
  
  const toggleSource = (source: DataSourceType) => {
    const newSources = filters.source.includes(source)
      ? filters.source.filter(s => s !== source)
      : [...filters.source, source];
    onFilterChange({ ...filters, source: newSources });
  };
  
  return (
    <div style={{
      padding: '16px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '8px',
      marginBottom: '16px',
    }}>
      {/* Search */}
      <div style={{ marginBottom: '12px' }}>
        <input
          type="text"
          placeholder="Search alerts..."
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          style={{
            width: '100%',
            padding: '10px 14px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '14px',
          }}
        />
      </div>
      
      {/* Filter Groups */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Severity */}
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', textTransform: 'uppercase' }}>
            Severity
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {severities.map(sev => (
              <button
                key={sev}
                onClick={() => toggleSeverity(sev)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: filters.severity.includes(sev) || filters.severity.length === 0
                    ? getSeverityBg(sev)
                    : 'rgba(255, 255, 255, 0.05)',
                  color: filters.severity.includes(sev) || filters.severity.length === 0
                    ? getSeverityColor(sev)
                    : 'rgba(255, 255, 255, 0.3)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                }}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
        
        {/* Status */}
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', textTransform: 'uppercase' }}>
            Status
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: filters.status.includes(status) || filters.status.length === 0
                    ? `${getStatusColor(status)}22`
                    : 'rgba(255, 255, 255, 0.05)',
                  color: filters.status.includes(status) || filters.status.length === 0
                    ? getStatusColor(status)
                    : 'rgba(255, 255, 255, 0.3)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                }}
              >
                {status.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
        
        {/* Source */}
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', textTransform: 'uppercase' }}>
            Source
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {sources.map(source => (
              <button
                key={source}
                onClick={() => toggleSource(source)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: filters.source.includes(source) || filters.source.length === 0
                    ? 'rgba(0, 212, 255, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: filters.source.includes(source) || filters.source.length === 0
                    ? '#00d4ff'
                    : 'rgba(255, 255, 255, 0.3)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s ease',
                }}
              >
                {getSourceIcon(source)} {source}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface AlertCardProps {
  alert: Alert;
  selected: boolean;
  onSelect: (id: string) => void;
  onStatusChange: (id: string, status: AlertStatus) => void;
  onViewDetails: (alert: Alert) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, selected, onSelect, onStatusChange, onViewDetails }) => {
  return (
    <div
      style={{
        backgroundColor: selected ? 'rgba(0, 212, 255, 0.1)' : 'rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '8px',
        border: `1px solid ${selected ? 'rgba(0, 212, 255, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onClick={() => onViewDetails(alert)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(alert.id);
          }}
          style={{ marginTop: '4px', cursor: 'pointer' }}
        />
        
        {/* Severity indicator */}
        <div
          style={{
            width: '4px',
            height: '60px',
            borderRadius: '2px',
            backgroundColor: getSeverityColor(alert.severity),
            flexShrink: 0,
          }}
        />
        
        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            {/* Source badge */}
            <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(0, 212, 255, 0.15)',
              color: '#00d4ff',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}>
              {getSourceIcon(alert.source)} {alert.source}
            </span>
            
            {/* Severity badge */}
            <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: getSeverityBg(alert.severity),
              color: getSeverityColor(alert.severity),
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}>
              {alert.severity}
            </span>
            
            {/* Status badge */}
            <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: `${getStatusColor(alert.status)}22`,
              color: getStatusColor(alert.status),
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'capitalize',
            }}>
              {alert.status.replace('-', ' ')}
            </span>
            
            {/* MITRE badges */}
            {alert.mitre?.map((m, i) => (
              <span
                key={i}
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(155, 89, 182, 0.15)',
                  color: '#9b59b6',
                  fontSize: '10px',
                  fontWeight: 500,
                }}
                title={`${m.technique} (${m.techniqueId})`}
              >
                {m.tacticId}
              </span>
            ))}
            
            <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
              {formatTimeAgo(alert.timestamp)}
            </span>
          </div>
          
          {/* Title */}
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#fff',
            marginBottom: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {alert.title}
          </div>
          
          {/* Description */}
          <div style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.6)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {alert.description}
          </div>
          
          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
            {/* Entities */}
            <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
              {alert.entities.users?.length ? (
                <span>👤 {alert.entities.users.length} user(s)</span>
              ) : null}
              {alert.entities.hosts?.length ? (
                <span>🖥️ {alert.entities.hosts.length} host(s)</span>
              ) : null}
              {alert.entities.ips?.length ? (
                <span>🌐 {alert.entities.ips.length} IP(s)</span>
              ) : null}
            </div>
            
            {/* Event count */}
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
              {alert.eventCount} events
            </span>
            
            {/* Actions */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
              <select
                value={alert.status}
                onChange={(e) => onStatusChange(alert.id, e.target.value as AlertStatus)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="false-positive">False Positive</option>
                <option value="suppressed">Suppressed</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AlertDetailPanelProps {
  alert: Alert | null;
  onClose: () => void;
  onRunPlaybook: (alertId: string, playbookId: string) => void;
}

const AlertDetailPanel: React.FC<AlertDetailPanelProps> = ({ alert, onClose, onRunPlaybook }) => {
  if (!alert) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '500px',
      height: '100vh',
      backgroundColor: '#1a1a2e',
      borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '24px',
      overflowY: 'auto',
      zIndex: 1000,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>Alert Details</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '24px',
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      </div>
      
      {/* Severity & Status */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <span style={{
          padding: '4px 12px',
          borderRadius: '4px',
          backgroundColor: getSeverityBg(alert.severity),
          color: getSeverityColor(alert.severity),
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
        }}>
          {alert.severity}
        </span>
        <span style={{
          padding: '4px 12px',
          borderRadius: '4px',
          backgroundColor: `${getStatusColor(alert.status)}22`,
          color: getStatusColor(alert.status),
          fontSize: '12px',
          fontWeight: 500,
        }}>
          {alert.status.replace('-', ' ')}
        </span>
      </div>
      
      {/* Title */}
      <h4 style={{ color: '#fff', marginBottom: '12px' }}>{alert.title}</h4>
      
      {/* Description */}
      <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '20px' }}>
        {alert.description}
      </p>
      
      {/* MITRE ATT&CK */}
      {alert.mitre && alert.mitre.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>
            MITRE ATT&CK
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {alert.mitre.map((m, i) => (
              <div
                key={i}
                style={{
                  padding: '10px',
                  backgroundColor: 'rgba(155, 89, 182, 0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(155, 89, 182, 0.2)',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(155, 89, 182, 0.2)',
                    color: '#9b59b6',
                    fontSize: '10px',
                    fontWeight: 600,
                  }}>
                    {m.tacticId}
                  </span>
                  <span style={{ color: '#9b59b6', fontSize: '12px', textTransform: 'capitalize' }}>
                    {m.tactic.replace('-', ' ')}
                  </span>
                </div>
                <div style={{ color: '#fff', fontSize: '13px' }}>
                  {m.techniqueId}: {m.technique}
                  {m.subTechnique && (
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {' → '}{m.subTechniqueId}: {m.subTechnique}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Entities */}
      <div style={{ marginBottom: '20px' }}>
        <h5 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>
          Entities Involved
        </h5>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {alert.entities.users?.map((u, i) => (
            <span key={i} style={{
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: 'rgba(46, 213, 115, 0.15)',
              color: '#2ed573',
              fontSize: '12px',
            }}>
              👤 {u}
            </span>
          ))}
          {alert.entities.hosts?.map((h, i) => (
            <span key={i} style={{
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: 'rgba(0, 212, 255, 0.15)',
              color: '#00d4ff',
              fontSize: '12px',
            }}>
              🖥️ {h}
            </span>
          ))}
          {alert.entities.ips?.map((ip, i) => (
            <span key={i} style={{
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 107, 53, 0.15)',
              color: '#ff6b35',
              fontSize: '12px',
            }}>
              🌐 {ip}
            </span>
          ))}
        </div>
      </div>
      
      {/* Detection Info */}
      <div style={{ marginBottom: '20px' }}>
        <h5 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>
          Detection
        </h5>
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '6px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Rule</span>
            <span style={{ color: '#fff', fontSize: '12px' }}>{alert.detection.ruleName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Type</span>
            <span style={{ color: '#fff', fontSize: '12px', textTransform: 'uppercase' }}>{alert.detection.ruleType}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Confidence</span>
            <span style={{ color: alert.detection.confidence >= 80 ? '#2ed573' : '#ffa502', fontSize: '12px' }}>
              {alert.detection.confidence}%
            </span>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div>
        <h5 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>
          Quick Actions
        </h5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {alert.entities.users && alert.entities.users.length > 0 && (
            <button
              onClick={() => onRunPlaybook(alert.id, 'playbook-001')}
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'rgba(255, 71, 87, 0.15)',
                color: '#ff4757',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              🚫 Disable Compromised User
            </button>
          )}
          {alert.entities.hosts && alert.entities.hosts.length > 0 && (
            <button
              onClick={() => onRunPlaybook(alert.id, 'playbook-002')}
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'rgba(255, 165, 2, 0.15)',
                color: '#ffa502',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              🔒 Isolate Infected Host
            </button>
          )}
          {alert.entities.ips && alert.entities.ips.length > 0 && (
            <button
              onClick={() => onRunPlaybook(alert.id, 'playbook-003')}
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'rgba(0, 212, 255, 0.15)',
                color: '#00d4ff',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              🛡️ Block Malicious IP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

interface AlertsDashboardProps {
  onNavigateToEntity?: (entityType: string, entityId: string) => void;
}

export const AlertsDashboard: React.FC<AlertsDashboardProps> = ({ onNavigateToEntity: _onNavigateToEntity }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filters, setFilters] = useState({
    severity: [] as AlertSeverity[],
    status: [] as AlertStatus[],
    source: [] as DataSourceType[],
    search: '',
  });
  
  useEffect(() => {
    loadAlerts();
  }, [filters]);
  
  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await xdrApi.getAlerts({
        severity: filters.severity.length ? filters.severity : undefined,
        status: filters.status.length ? filters.status : undefined,
        source: filters.source.length ? filters.source : undefined,
        search: filters.search || undefined,
      });
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectAlert = (id: string) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAlerts(newSelected);
  };
  
  const handleSelectAll = () => {
    if (selectedAlerts.size === alerts.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(alerts.map(a => a.id)));
    }
  };
  
  const handleStatusChange = async (id: string, status: AlertStatus) => {
    try {
      await xdrApi.updateAlertStatus(id, status);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a));
    } catch (err) {
      console.error('Failed to update alert status:', err);
    }
  };
  
  const handleBulkStatusChange = async (status: AlertStatus) => {
    for (const id of selectedAlerts) {
      await handleStatusChange(id, status);
    }
    setSelectedAlerts(new Set());
  };
  
  const handleRunPlaybook = async (alertId: string, playbookId: string) => {
    try {
      const execution = await xdrApi.executePlaybook(playbookId, alertId);
      console.log('Playbook execution started:', execution);
      alert(`Playbook execution ${execution.status === 'awaiting-approval' ? 'awaiting approval' : 'started'}`);
    } catch (err) {
      console.error('Failed to run playbook:', err);
    }
  };
  
  // Count alerts by severity
  const severityCounts = alerts.reduce((acc, a) => {
    acc[a.severity] = (acc[a.severity] || 0) + 1;
    return acc;
  }, {} as Record<AlertSeverity, number>);
  
  return (
    <div style={{ padding: '20px', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '24px' }}>Security Alerts</h2>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            {alerts.length} alerts • {alerts.filter(a => a.status === 'new').length} new
          </p>
        </div>
        
        {/* Severity summary */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {(['critical', 'high', 'medium', 'low'] as AlertSeverity[]).map(sev => (
            <div key={sev} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 700,
                color: getSeverityColor(sev),
              }}>
                {severityCounts[sev] || 0}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                {sev}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Filters */}
      <FilterBar filters={filters} onFilterChange={setFilters} />
      
      {/* Bulk actions */}
      {selectedAlerts.size > 0 && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <span style={{ color: '#00d4ff', fontSize: '14px' }}>
            {selectedAlerts.size} alert(s) selected
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleBulkStatusChange('in-progress')}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'rgba(255, 165, 2, 0.2)',
                color: '#ffa502',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Mark In Progress
            </button>
            <button
              onClick={() => handleBulkStatusChange('resolved')}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'rgba(46, 213, 115, 0.2)',
                color: '#2ed573',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Mark Resolved
            </button>
            <button
              onClick={() => handleBulkStatusChange('false-positive')}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'rgba(164, 176, 190, 0.2)',
                color: '#a4b0be',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              False Positive
            </button>
          </div>
          <button
            onClick={() => setSelectedAlerts(new Set())}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Clear selection
          </button>
        </div>
      )}
      
      {/* Select all */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <input
          type="checkbox"
          checked={selectedAlerts.size === alerts.length && alerts.length > 0}
          onChange={handleSelectAll}
          style={{ cursor: 'pointer' }}
        />
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
          Select all
        </span>
      </div>
      
      {/* Alerts list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
          Loading alerts...
        </div>
      ) : alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
          No alerts match your filters
        </div>
      ) : (
        <div>
          {alerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              selected={selectedAlerts.has(alert.id)}
              onSelect={handleSelectAlert}
              onStatusChange={handleStatusChange}
              onViewDetails={setSelectedAlert}
            />
          ))}
        </div>
      )}
      
      {/* Detail panel */}
      {selectedAlert && (
        <>
          {/* Overlay */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
            }}
            onClick={() => setSelectedAlert(null)}
          />
          <AlertDetailPanel
            alert={selectedAlert}
            onClose={() => setSelectedAlert(null)}
            onRunPlaybook={handleRunPlaybook}
          />
        </>
      )}
    </div>
  );
};

export default AlertsDashboard;
