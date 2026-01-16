/**
 * XDR Detection Rules Panel Component
 * Sigma-based detection rules mapped to MITRE ATT&CK
 */

import React, { useState, useEffect } from 'react';
import type { DetectionRule, AlertSeverity, DataSourceType, MitreTactic } from '../types/xdr.types';
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

const getRuleTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    sigma: '📜',
    vendor: '🏢',
    custom: '✏️',
    ml: '🤖',
    correlation: '🔗',
  };
  return icons[type] || '📋';
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

const getTacticColor = (tactic: MitreTactic): string => {
  const colors: Partial<Record<MitreTactic, string>> = {
    'initial-access': '#e74c3c',
    'execution': '#e67e22',
    'persistence': '#f1c40f',
    'privilege-escalation': '#2ecc71',
    'defense-evasion': '#1abc9c',
    'credential-access': '#3498db',
    'discovery': '#9b59b6',
    'lateral-movement': '#e91e63',
    'collection': '#795548',
    'command-and-control': '#607d8b',
    'exfiltration': '#ff5722',
    'impact': '#f44336',
  };
  return colors[tactic] || '#9b59b6';
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

// ============================================================================
// Rule Card Component
// ============================================================================

interface RuleCardProps {
  rule: DetectionRule;
  onToggle: (id: string, enabled: boolean) => void;
  onView: (rule: DetectionRule) => void;
}

const RuleCard: React.FC<RuleCardProps> = ({ rule, onToggle, onView }) => {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        border: `1px solid ${rule.enabled ? 'rgba(46, 213, 115, 0.2)' : 'rgba(255, 255, 255, 0.05)'}`,
        transition: 'all 0.2s ease',
        opacity: rule.enabled ? 1 : 0.7,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        {/* Toggle */}
        <label style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={rule.enabled}
            onChange={(e) => onToggle(rule.id, e.target.checked)}
            style={{ display: 'none' }}
          />
          <div style={{
            width: '44px',
            height: '24px',
            borderRadius: '12px',
            backgroundColor: rule.enabled ? '#2ed573' : 'rgba(255,255,255,0.1)',
            position: 'relative',
            transition: 'all 0.2s ease',
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              position: 'absolute',
              top: '2px',
              left: rule.enabled ? '22px' : '2px',
              transition: 'all 0.2s ease',
            }} />
          </div>
        </label>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '16px' }}>{getRuleTypeIcon(rule.type)}</span>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{rule.name}</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
            {rule.description}
          </div>
        </div>
        
        {/* Severity badge */}
        <div style={{
          padding: '4px 10px',
          borderRadius: '4px',
          backgroundColor: `${getSeverityColor(rule.severity)}22`,
          color: getSeverityColor(rule.severity),
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
        }}>
          {rule.severity}
        </div>
      </div>
      
      {/* MITRE mappings */}
      {rule.mitre && rule.mitre.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
          {rule.mitre.map((m, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: `${getTacticColor(m.tactic)}22`,
              border: `1px solid ${getTacticColor(m.tactic)}33`,
            }}>
              <span style={{ color: getTacticColor(m.tactic), fontSize: '10px', fontWeight: 600 }}>
                {m.tacticId}
              </span>
              <span style={{ color: '#fff', fontSize: '11px' }}>{m.techniqueId}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Data sources */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        {rule.sources.map((source, i) => (
          <span key={i} style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(0, 212, 255, 0.15)',
            color: '#00d4ff',
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}>
            {getSourceIcon(source)} {source}
          </span>
        ))}
      </div>
      
      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: '16px',
        padding: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '8px',
        marginBottom: '12px',
      }}>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Alerts 24h: </span>
          <span style={{ color: rule.alertsLast24h && rule.alertsLast24h > 0 ? '#ff4757' : '#2ed573', fontSize: '14px', fontWeight: 600 }}>
            {rule.alertsLast24h || 0}
          </span>
        </div>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>FP Rate: </span>
          <span style={{
            color: (rule.falsePositiveRate || 0) > 20 ? '#ff4757' : (rule.falsePositiveRate || 0) > 10 ? '#ffa502' : '#2ed573',
            fontSize: '14px',
            fontWeight: 600,
          }}>
            {rule.falsePositiveRate || 0}%
          </span>
        </div>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Type: </span>
          <span style={{ color: '#fff', fontSize: '12px', textTransform: 'uppercase' }}>
            {rule.type}
          </span>
        </div>
      </div>
      
      {/* Tags */}
      {rule.tags && rule.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
          {rule.tags.map((tag, i) => (
            <span key={i} style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '10px',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
          {rule.author && `By ${rule.author} • `}
          Updated {formatTimeAgo(rule.updatedAt)}
        </div>
        <button
          onClick={() => onView(rule)}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'rgba(0, 212, 255, 0.15)',
            color: '#00d4ff',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Rule Detail Panel
// ============================================================================

interface RuleDetailProps {
  rule: DetectionRule | null;
  onClose: () => void;
  onToggle: (id: string, enabled: boolean) => void;
}

const RuleDetail: React.FC<RuleDetailProps> = ({ rule, onClose, onToggle }) => {
  if (!rule) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '550px',
      height: '100vh',
      backgroundColor: '#1a1a2e',
      borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '24px',
      overflowY: 'auto',
      zIndex: 1000,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>Detection Rule</h3>
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
      
      {/* Rule name and status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          backgroundColor: `${getSeverityColor(rule.severity)}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
        }}>
          {getRuleTypeIcon(rule.type)}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 8px', color: '#fff', fontSize: '18px' }}>{rule.name}</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: rule.enabled ? 'rgba(46, 213, 115, 0.15)' : 'rgba(255, 71, 87, 0.15)',
              color: rule.enabled ? '#2ed573' : '#ff4757',
              fontSize: '11px',
              fontWeight: 600,
            }}>
              {rule.enabled ? 'ENABLED' : 'DISABLED'}
            </span>
            <span style={{
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: `${getSeverityColor(rule.severity)}22`,
              color: getSeverityColor(rule.severity),
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}>
              {rule.severity}
            </span>
            <span style={{
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '11px',
              textTransform: 'uppercase',
            }}>
              {rule.type}
            </span>
          </div>
        </div>
      </div>
      
      {/* Description */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>
          Description
        </h4>
        <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 }}>
          {rule.description}
        </p>
      </div>
      
      {/* MITRE ATT&CK Mapping */}
      {rule.mitre && rule.mitre.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
            MITRE ATT&CK Mapping
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rule.mitre.map((m, i) => (
              <div key={i} style={{
                padding: '12px',
                backgroundColor: `${getTacticColor(m.tactic)}11`,
                borderRadius: '8px',
                border: `1px solid ${getTacticColor(m.tactic)}33`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: `${getTacticColor(m.tactic)}33`,
                    color: getTacticColor(m.tactic),
                    fontSize: '10px',
                    fontWeight: 600,
                  }}>
                    {m.tacticId}
                  </span>
                  <span style={{ color: getTacticColor(m.tactic), fontSize: '12px', textTransform: 'capitalize' }}>
                    {m.tactic.replace('-', ' ')}
                  </span>
                </div>
                <div style={{ color: '#fff', fontSize: '13px' }}>
                  <strong>{m.techniqueId}:</strong> {m.technique}
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
      
      {/* Detection Logic */}
      {rule.logic && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Detection Logic
          </h4>
          {rule.logic.query && (
            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#00d4ff',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>
              {rule.logic.query}
            </div>
          )}
          {rule.logic.threshold && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
            }}>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Threshold: </span>
                <span style={{ color: '#ffa502', fontSize: '12px' }}>{rule.logic.threshold.count} events</span>
              </div>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Time Window: </span>
                <span style={{ color: '#fff', fontSize: '12px' }}>{rule.logic.threshold.timeWindow}</span>
              </div>
              {rule.logic.threshold.groupBy && (
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Group By: </span>
                  <span style={{ color: '#fff', fontSize: '12px' }}>{rule.logic.threshold.groupBy.join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Data Sources */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
          Data Sources
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {rule.sources.map((source, i) => (
            <span key={i} style={{
              padding: '8px 14px',
              borderRadius: '6px',
              backgroundColor: 'rgba(0, 212, 255, 0.1)',
              color: '#00d4ff',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
            }}>
              {getSourceIcon(source)} {source}
            </span>
          ))}
        </div>
      </div>
      
      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: rule.alertsLast24h ? '#ff4757' : '#2ed573' }}>
            {rule.alertsLast24h || 0}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Alerts 24h</div>
        </div>
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: (rule.falsePositiveRate || 0) > 20 ? '#ff4757' : (rule.falsePositiveRate || 0) > 10 ? '#ffa502' : '#2ed573',
          }}>
            {rule.falsePositiveRate || 0}%
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>False Positive Rate</div>
        </div>
      </div>
      
      {/* References */}
      {rule.references && rule.references.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px' }}>
            References
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {rule.references.map((ref, i) => (
              <a
                key={i}
                href={ref}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#00d4ff',
                  fontSize: '12px',
                  textDecoration: 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                🔗 {ref}
              </a>
            ))}
          </div>
        </div>
      )}
      
      {/* Metadata */}
      <div style={{
        padding: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Author</span>
          <span style={{ color: '#fff', fontSize: '12px' }}>{rule.author || 'Unknown'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Created</span>
          <span style={{ color: '#fff', fontSize: '12px' }}>{new Date(rule.createdAt).toLocaleDateString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Updated</span>
          <span style={{ color: '#fff', fontSize: '12px' }}>{new Date(rule.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
      
      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button style={{
          flex: 1,
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '13px',
          cursor: 'pointer',
        }}>
          ✏️ Edit Rule
        </button>
        <button
          onClick={() => onToggle(rule.id, !rule.enabled)}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: rule.enabled ? 'rgba(255, 71, 87, 0.15)' : 'rgba(46, 213, 115, 0.15)',
            color: rule.enabled ? '#ff4757' : '#2ed573',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {rule.enabled ? '⏸️ Disable' : '▶️ Enable'}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const DetectionRulesPanel: React.FC = () => {
  const [rules, setRules] = useState<DetectionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<DetectionRule | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    loadRules();
  }, []);
  
  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await xdrApi.getDetectionRules();
      setRules(data);
    } catch (err) {
      console.error('Failed to load detection rules:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleRule = async (id: string, enabled: boolean) => {
    try {
      const updated = await xdrApi.toggleRule(id, enabled);
      setRules(prev => prev.map(r => r.id === id ? updated : r));
      if (selectedRule?.id === id) {
        setSelectedRule(updated);
      }
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  };
  
  // Filter rules
  let filteredRules = rules;
  
  if (filterType !== 'all') {
    filteredRules = filteredRules.filter(r => r.type === filterType);
  }
  
  if (filterSeverity !== 'all') {
    filteredRules = filteredRules.filter(r => r.severity === filterSeverity);
  }
  
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredRules = filteredRules.filter(r =>
      r.name.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.tags?.some(t => t.toLowerCase().includes(query))
    );
  }
  
  // Stats
  const enabledCount = rules.filter(r => r.enabled).length;
  const totalAlerts = rules.reduce((sum, r) => sum + (r.alertsLast24h || 0), 0);
  const avgFpRate = rules.length > 0
    ? Math.round(rules.reduce((sum, r) => sum + (r.falsePositiveRate || 0), 0) / rules.length)
    : 0;
  
  const ruleTypes = ['sigma', 'vendor', 'custom', 'ml', 'correlation'];
  const severities: AlertSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];
  
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
        Loading detection rules...
      </div>
    );
  }
  
  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '24px' }}>📜 Detection Rules</h2>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            {enabledCount} of {rules.length} rules enabled
          </p>
        </div>
        
        <button style={{
          padding: '10px 20px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#00d4ff',
          color: '#000',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          + Create Rule
        </button>
      </div>
      
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#00d4ff' }}>{rules.length}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Total Rules</div>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#2ed573' }}>{enabledCount}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Enabled</div>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#ff4757' }}>{totalAlerts}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Alerts 24h</div>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 700,
            color: avgFpRate > 20 ? '#ff4757' : avgFpRate > 10 ? '#ffa502' : '#2ed573',
          }}>
            {avgFpRate}%
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Avg FP Rate</div>
        </div>
      </div>
      
      {/* Filters */}
      <div style={{ marginBottom: '20px' }}>
        {/* Search */}
        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Search rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              color: '#fff',
              fontSize: '14px',
            }}
          />
        </div>
        
        {/* Type & Severity filters */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginRight: '8px', textTransform: 'uppercase' }}>Type:</span>
            <div style={{ display: 'inline-flex', gap: '6px' }}>
              <button
                onClick={() => setFilterType('all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: filterType === 'all' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: filterType === 'all' ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                All
              </button>
              {ruleTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: filterType === type ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    color: filterType === type ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  {getRuleTypeIcon(type)} {type}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginRight: '8px', textTransform: 'uppercase' }}>Severity:</span>
            <div style={{ display: 'inline-flex', gap: '6px' }}>
              <button
                onClick={() => setFilterSeverity('all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: filterSeverity === 'all' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: filterSeverity === 'all' ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                All
              </button>
              {severities.map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: filterSeverity === sev ? `${getSeverityColor(sev)}33` : 'rgba(255, 255, 255, 0.05)',
                    color: filterSeverity === sev ? getSeverityColor(sev) : 'rgba(255, 255, 255, 0.5)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Rules grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '16px' }}>
        {filteredRules.map(rule => (
          <RuleCard
            key={rule.id}
            rule={rule}
            onToggle={handleToggleRule}
            onView={setSelectedRule}
          />
        ))}
      </div>
      
      {filteredRules.length === 0 && (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            No rules match your filters
          </div>
        </div>
      )}
      
      {/* Detail panel */}
      {selectedRule && (
        <>
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
            onClick={() => setSelectedRule(null)}
          />
          <RuleDetail
            rule={selectedRule}
            onClose={() => setSelectedRule(null)}
            onToggle={handleToggleRule}
          />
        </>
      )}
    </div>
  );
};

export default DetectionRulesPanel;
