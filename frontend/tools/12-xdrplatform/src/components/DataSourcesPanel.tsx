/**
 * XDR Data Sources Panel Component
 * Shows connected data sources with health status and event counts
 */

import React, { useState, useEffect } from 'react';
import type { DataSource, DataSourceType, DataSourceVendor } from '../types/xdr.types';
import { xdrApi } from '../api/xdr.api';

// ============================================================================
// Helper Functions
// ============================================================================

const getSourceTypeIcon = (type: DataSourceType): string => {
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
  return icons[type];
};

const getVendorLogo = (vendor: DataSourceVendor): string => {
  // In a real app, these would be actual logo images
  const logos: Record<DataSourceVendor, string> = {
    'crowdstrike': '🦅',
    'microsoft-defender': '🛡️',
    'sentinelone': '🔮',
    'carbon-black': '⚫',
    'okta': '🔐',
    'azure-ad': '☁️',
    'google-workspace': '🔴',
    'aws': '🟠',
    'gcp': '🔵',
    'azure': '🔷',
    'palo-alto': '🔺',
    'fortinet': '🟩',
    'zscaler': '⚡',
    'cisco': '🌉',
    'zeek': '🔍',
    'suricata': '🐱',
    'custom': '⚙️',
  };
  return logos[vendor];
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'connected': return '#2ed573';
    case 'disconnected': return '#ff4757';
    case 'error': return '#ffa502';
    case 'pending': return '#70a1ff';
    default: return '#a4b0be';
  }
};

const getHealthColor = (score: number): string => {
  if (score >= 90) return '#2ed573';
  if (score >= 70) return '#ffa502';
  return '#ff4757';
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// ============================================================================
// Data Source Card Component
// ============================================================================

interface DataSourceCardProps {
  source: DataSource;
  onClick: (source: DataSource) => void;
}

const DataSourceCard: React.FC<DataSourceCardProps> = ({ source, onClick }) => {
  return (
    <div
      onClick={() => onClick(source)}
      style={{
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        {/* Vendor icon */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
        }}>
          {getVendorLogo(source.vendor)}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>{source.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(0, 212, 255, 0.15)',
              color: '#00d4ff',
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}>
              {getSourceTypeIcon(source.type)} {source.type}
            </span>
          </div>
        </div>
        
        {/* Status indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '20px',
          backgroundColor: `${getStatusColor(source.status)}22`,
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(source.status),
            animation: source.status === 'connected' ? 'pulse 2s infinite' : 'none',
          }} />
          <span style={{
            color: getStatusColor(source.status),
            fontSize: '12px',
            fontWeight: 500,
            textTransform: 'capitalize',
          }}>
            {source.status}
          </span>
        </div>
      </div>
      
      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {/* Events 24h */}
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#00d4ff' }}>
            {formatNumber(source.eventsLast24h)}
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginTop: '4px' }}>
            Events 24h
          </div>
        </div>
        
        {/* EPS */}
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>
            {source.eventsPerSecond.toFixed(1)}
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginTop: '4px' }}>
            EPS
          </div>
        </div>
        
        {/* Health */}
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: getHealthColor(source.healthScore) }}>
            {source.healthScore}%
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginTop: '4px' }}>
            Health
          </div>
        </div>
      </div>
      
      {/* Capabilities */}
      <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {source.capabilities.slice(0, 5).map((cap, i) => (
          <span key={i} style={{
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '10px',
          }}>
            {cap}
          </span>
        ))}
        {source.capabilities.length > 5 && (
          <span style={{
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '10px',
          }}>
            +{source.capabilities.length - 5} more
          </span>
        )}
      </div>
      
      {/* Last seen */}
      <div style={{ marginTop: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
        Last event: {new Date(source.lastSeen).toLocaleString()}
      </div>
    </div>
  );
};

// ============================================================================
// Data Source Detail Panel
// ============================================================================

interface DataSourceDetailProps {
  source: DataSource | null;
  onClose: () => void;
}

const DataSourceDetail: React.FC<DataSourceDetailProps> = ({ source, onClose }) => {
  if (!source) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '450px',
      height: '100vh',
      backgroundColor: '#1a1a2e',
      borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '24px',
      overflowY: 'auto',
      zIndex: 1000,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>Data Source Details</h3>
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
      
      {/* Source info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '12px',
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
        }}>
          {getVendorLogo(source.vendor)}
        </div>
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '20px' }}>{source.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span style={{
              padding: '3px 10px',
              borderRadius: '4px',
              backgroundColor: `${getStatusColor(source.status)}22`,
              color: getStatusColor(source.status),
              fontSize: '11px',
              fontWeight: 600,
            }}>
              {source.status}
            </span>
            <span style={{
              padding: '3px 10px',
              borderRadius: '4px',
              backgroundColor: 'rgba(0, 212, 255, 0.15)',
              color: '#00d4ff',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}>
              {source.type}
            </span>
          </div>
        </div>
      </div>
      
      {/* Health gauge */}
      <div style={{
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Health Score</span>
          <span style={{ color: getHealthColor(source.healthScore), fontSize: '24px', fontWeight: 700 }}>
            {source.healthScore}%
          </span>
        </div>
        <div style={{
          height: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${source.healthScore}%`,
            height: '100%',
            backgroundColor: getHealthColor(source.healthScore),
            borderRadius: '4px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>
      
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#00d4ff' }}>
            {formatNumber(source.eventsLast24h)}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
            Events Last 24h
          </div>
        </div>
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>
            {source.eventsPerSecond.toFixed(1)}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
            Events Per Second
          </div>
        </div>
      </div>
      
      {/* Capabilities */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
          Capabilities
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {source.capabilities.map((cap, i) => (
            <span key={i} style={{
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: 'rgba(0, 212, 255, 0.1)',
              color: '#00d4ff',
              fontSize: '12px',
            }}>
              ✓ {cap}
            </span>
          ))}
        </div>
      </div>
      
      {/* Configuration */}
      {source.config && Object.keys(source.config).length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Configuration
          </h4>
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
          }}>
            {Object.entries(source.config).map(([key, value]) => (
              <div key={key} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span style={{ color: '#fff', fontSize: '13px' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button style={{
          flex: 1,
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: 'rgba(0, 212, 255, 0.15)',
          color: '#00d4ff',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
        }}>
          🔄 Test Connection
        </button>
        <button style={{
          flex: 1,
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
        }}>
          ⚙️ Configure
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const DataSourcesPanel: React.FC = () => {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [filterType, setFilterType] = useState<DataSourceType | 'all'>('all');
  
  useEffect(() => {
    loadSources();
  }, []);
  
  const loadSources = async () => {
    setLoading(true);
    try {
      const data = await xdrApi.getDataSources();
      setSources(data);
    } catch (err) {
      console.error('Failed to load data sources:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredSources = filterType === 'all' 
    ? sources 
    : sources.filter(s => s.type === filterType);
  
  // Calculate totals
  const totalEvents = sources.reduce((sum, s) => sum + s.eventsLast24h, 0);
  const totalEPS = sources.reduce((sum, s) => sum + s.eventsPerSecond, 0);
  const connectedCount = sources.filter(s => s.status === 'connected').length;
  const avgHealth = sources.length > 0 
    ? Math.round(sources.reduce((sum, s) => sum + s.healthScore, 0) / sources.length)
    : 0;
  
  // Group by type
  const typeGroups = sources.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {} as Record<DataSourceType, number>);
  
  const types: DataSourceType[] = ['edr', 'ndr', 'identity', 'email', 'cloud', 'firewall', 'dns'];
  
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
        Loading data sources...
      </div>
    );
  }
  
  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: '#fff', fontSize: '24px' }}>Data Sources</h2>
        <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
          {connectedCount} of {sources.length} sources connected
        </p>
      </div>
      
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#2ed573' }}>
            {connectedCount}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
            Connected Sources
          </div>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#00d4ff' }}>
            {formatNumber(totalEvents)}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
            Events 24h
          </div>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#fff' }}>
            {totalEPS.toFixed(0)}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
            Total EPS
          </div>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: getHealthColor(avgHealth) }}>
            {avgHealth}%
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
            Avg Health
          </div>
        </div>
      </div>
      
      {/* Type filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterType('all')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: filterType === 'all' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: filterType === 'all' ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          All ({sources.length})
        </button>
        {types.map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: filterType === type ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: filterType === type ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {getSourceTypeIcon(type)} {type} ({typeGroups[type] || 0})
          </button>
        ))}
      </div>
      
      {/* Sources grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {filteredSources.map(source => (
          <DataSourceCard
            key={source.id}
            source={source}
            onClick={setSelectedSource}
          />
        ))}
      </div>
      
      {/* Add new source button */}
      <div
        style={{
          marginTop: '20px',
          padding: '24px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
          border: '2px dashed rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>➕</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Add New Data Source</div>
      </div>
      
      {/* Detail panel */}
      {selectedSource && (
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
            onClick={() => setSelectedSource(null)}
          />
          <DataSourceDetail source={selectedSource} onClose={() => setSelectedSource(null)} />
        </>
      )}
      
      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DataSourcesPanel;
