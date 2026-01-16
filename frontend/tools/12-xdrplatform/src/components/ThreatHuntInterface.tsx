/**
 * XDR Threat Hunt Interface Component
 * Query builder for threat hunting across normalized data
 */

import React, { useState, useEffect } from 'react';
import type { Hunt, NormalizedEvent, DataSourceType, MitreMapping } from '../types/xdr.types';
import { xdrApi } from '../api/xdr.api';

// ============================================================================
// Helper Functions
// ============================================================================

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    authentication: '🔐',
    process: '⚙️',
    network: '🌐',
    file: '📁',
    registry: '📋',
    dns: '🌍',
    email: '📧',
    cloud: '☁️',
    iam: '👤',
    web: '🔗',
  };
  return icons[category] || '📝';
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
// Query Builder Component
// ============================================================================

interface QueryCondition {
  field: string;
  operator: string;
  value: string;
}

interface QueryBuilderProps {
  conditions: QueryCondition[];
  onConditionsChange: (conditions: QueryCondition[]) => void;
}

const QueryBuilder: React.FC<QueryBuilderProps> = ({ conditions, onConditionsChange }) => {
  const fields = [
    { value: 'user.name', label: 'User Name' },
    { value: 'user.email', label: 'User Email' },
    { value: 'host.name', label: 'Host Name' },
    { value: 'host.ip', label: 'Host IP' },
    { value: 'process.name', label: 'Process Name' },
    { value: 'process.command_line', label: 'Command Line' },
    { value: 'process.parent.name', label: 'Parent Process' },
    { value: 'file.name', label: 'File Name' },
    { value: 'file.path', label: 'File Path' },
    { value: 'file.hash.sha256', label: 'File Hash (SHA256)' },
    { value: 'network.destination_ip', label: 'Destination IP' },
    { value: 'network.destination_port', label: 'Destination Port' },
    { value: 'dns.query', label: 'DNS Query' },
    { value: 'event.category', label: 'Event Category' },
    { value: 'event.action', label: 'Event Action' },
    { value: 'source.type', label: 'Data Source' },
  ];
  
  const operators = [
    { value: 'equals', label: '=' },
    { value: 'not_equals', label: '!=' },
    { value: 'contains', label: 'contains' },
    { value: 'starts_with', label: 'starts with' },
    { value: 'ends_with', label: 'ends with' },
    { value: 'matches', label: 'matches (regex)' },
    { value: 'in', label: 'in (list)' },
    { value: 'exists', label: 'exists' },
  ];
  
  const addCondition = () => {
    onConditionsChange([...conditions, { field: 'process.name', operator: 'contains', value: '' }]);
  };
  
  const updateCondition = (index: number, field: keyof QueryCondition, value: string) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    onConditionsChange(updated);
  };
  
  const removeCondition = (index: number) => {
    onConditionsChange(conditions.filter((_, i) => i !== index));
  };
  
  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '12px',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h4 style={{ margin: 0, color: '#fff', fontSize: '14px' }}>Query Builder</h4>
        <button
          onClick={addCondition}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'rgba(0, 212, 255, 0.15)',
            color: '#00d4ff',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          + Add Condition
        </button>
      </div>
      
      {conditions.length === 0 ? (
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
          No conditions added. Click "Add Condition" to start building your query.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {conditions.map((condition, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {index > 0 && (
                <span style={{ color: '#00d4ff', fontSize: '12px', fontWeight: 600, width: '40px' }}>AND</span>
              )}
              {index === 0 && <span style={{ width: '40px' }} />}
              
              <select
                value={condition.field}
                onChange={(e) => updateCondition(index, 'field', e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  color: '#fff',
                  fontSize: '13px',
                }}
              >
                {fields.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              
              <select
                value={condition.operator}
                onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                style={{
                  width: '120px',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  color: '#fff',
                  fontSize: '13px',
                }}
              >
                {operators.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              
              {condition.operator !== 'exists' && (
                <input
                  type="text"
                  value={condition.value}
                  onChange={(e) => updateCondition(index, 'value', e.target.value)}
                  placeholder="Value..."
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    color: '#fff',
                    fontSize: '13px',
                  }}
                />
              )}
              
              <button
                onClick={() => removeCondition(index)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'rgba(255, 71, 87, 0.15)',
                  color: '#ff4757',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Saved Hunts Panel
// ============================================================================

interface SavedHuntsPanelProps {
  hunts: Hunt[];
  onSelectHunt: (hunt: Hunt) => void;
  selectedHuntId?: string;
}

const SavedHuntsPanel: React.FC<SavedHuntsPanelProps> = ({ hunts, onSelectHunt, selectedHuntId }) => {
  return (
    <div style={{
      width: '280px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '12px',
      padding: '16px',
      height: 'fit-content',
    }}>
      <h4 style={{ margin: '0 0 16px', color: '#fff', fontSize: '14px' }}>Saved Hunts</h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {hunts.map(hunt => (
          <div
            key={hunt.id}
            onClick={() => onSelectHunt(hunt)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: selectedHuntId === hunt.id ? 'rgba(0, 212, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)',
              border: `1px solid ${selectedHuntId === hunt.id ? 'rgba(0, 212, 255, 0.3)' : 'rgba(255,255,255,0.05)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ color: '#fff', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
              {hunt.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(0, 212, 255, 0.15)',
                color: '#00d4ff',
                fontSize: '10px',
                textTransform: 'uppercase',
              }}>
                {hunt.queryLanguage}
              </span>
              {hunt.resultCount !== undefined && (
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                  {hunt.resultCount} results
                </span>
              )}
            </div>
            {hunt.lastRun && (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '6px' }}>
                Last run: {formatTimeAgo(hunt.lastRun)}
              </div>
            )}
            {hunt.mitre && hunt.mitre.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                {hunt.mitre.slice(0, 2).map((m, i) => (
                  <span key={i} style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(155, 89, 182, 0.15)',
                    color: '#9b59b6',
                    fontSize: '9px',
                  }}>
                    {m.techniqueId}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {hunts.length === 0 && (
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
          No saved hunts yet
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Hunt Results Component
// ============================================================================

interface HuntResultsProps {
  results: NormalizedEvent[];
  loading: boolean;
  query: string;
}

const HuntResults: React.FC<HuntResultsProps> = ({ results, loading, query }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  if (loading) {
    return (
      <div style={{
        padding: '60px',
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
      }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔍</div>
        <div style={{ color: '#00d4ff', fontSize: '14px', marginBottom: '4px' }}>Hunting in progress...</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Searching across all data sources</div>
      </div>
    );
  }
  
  if (!query) {
    return (
      <div style={{
        padding: '60px',
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
        <div style={{ color: '#fff', fontSize: '16px', marginBottom: '8px' }}>Ready to Hunt</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
          Build a query above or select a saved hunt to get started
        </div>
      </div>
    );
  }
  
  if (results.length === 0) {
    return (
      <div style={{
        padding: '60px',
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
        <div style={{ color: '#2ed573', fontSize: '16px', marginBottom: '8px' }}>No Results Found</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
          No matches for your query. Try broadening your search criteria.
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '16px',
        padding: '12px 16px',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        borderRadius: '8px',
      }}>
        <span style={{ color: '#00d4ff', fontSize: '14px' }}>
          Found {results.length} results
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            fontSize: '12px',
            cursor: 'pointer',
          }}>
            📋 Export CSV
          </button>
          <button style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'rgba(255, 71, 87, 0.15)',
            color: '#ff4757',
            fontSize: '12px',
            cursor: 'pointer',
          }}>
            🚨 Create Alert Rule
          </button>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {results.map(event => (
          <div
            key={event.id}
            onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
            style={{
              padding: '14px 16px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px' }}>{getCategoryIcon(event.category)}</span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(0, 212, 255, 0.15)',
                color: '#00d4ff',
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}>
                {event.source}
              </span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: event.outcome === 'success' ? 'rgba(46, 213, 115, 0.15)' : 'rgba(255, 71, 87, 0.15)',
                color: event.outcome === 'success' ? '#2ed573' : '#ff4757',
                fontSize: '10px',
              }}>
                {event.outcome}
              </span>
              <span style={{ flex: 1, color: '#fff', fontSize: '13px' }}>
                {event.category} / {event.action.replace('-', ' ')}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                {new Date(event.timestamp).toLocaleString()}
              </span>
            </div>
            
            {/* Expanded details */}
            {expandedId === event.id && (
              <div style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}>
                {event.user && (
                  <div>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>User: </span>
                    <span style={{ color: '#fff', fontSize: '13px' }}>{event.user.name}</span>
                  </div>
                )}
                {event.host && (
                  <div>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Host: </span>
                    <span style={{ color: '#fff', fontSize: '13px' }}>{event.host.name}</span>
                  </div>
                )}
                {event.process && (
                  <>
                    <div>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Process: </span>
                      <span style={{ color: '#fff', fontSize: '13px' }}>{event.process.name}</span>
                    </div>
                    {event.process.commandLine && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Command: </span>
                        <div style={{
                          marginTop: '4px',
                          padding: '8px',
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          color: '#00d4ff',
                          wordBreak: 'break-all',
                        }}>
                          {event.process.commandLine}
                        </div>
                      </div>
                    )}
                  </>
                )}
                {event.network && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Network: </span>
                    <span style={{ color: '#fff', fontSize: '13px' }}>
                      {event.network.sourceIp} → {event.network.destinationIp}:{event.network.destinationPort}
                    </span>
                  </div>
                )}
                {event.dns && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>DNS: </span>
                    <span style={{ color: '#fff', fontSize: '13px' }}>
                      {event.dns.query} ({event.dns.queryType})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const ThreatHuntInterface: React.FC = () => {
  const [rawQuery, setRawQuery] = useState('');
  const [conditions, setConditions] = useState<QueryCondition[]>([]);
  const [queryMode, setQueryMode] = useState<'builder' | 'raw'>('builder');
  const [timeRange, setTimeRange] = useState('7d');
  const [sources, setSources] = useState<DataSourceType[]>([]);
  const [savedHunts, setSavedHunts] = useState<Hunt[]>([]);
  const [selectedHunt, setSelectedHunt] = useState<Hunt | null>(null);
  const [results, setResults] = useState<NormalizedEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  useEffect(() => {
    loadSavedHunts();
  }, []);
  
  const loadSavedHunts = async () => {
    try {
      const hunts = await xdrApi.getHunts();
      setSavedHunts(hunts);
    } catch (err) {
      console.error('Failed to load saved hunts:', err);
    }
  };
  
  const handleSelectHunt = (hunt: Hunt) => {
    setSelectedHunt(hunt);
    setRawQuery(hunt.query);
    setQueryMode('raw');
    if (hunt.sources) {
      setSources(hunt.sources);
    }
  };
  
  const buildQueryFromConditions = (): string => {
    if (conditions.length === 0) return '';
    
    return conditions.map(c => {
      switch (c.operator) {
        case 'equals':
          return `${c.field}: "${c.value}"`;
        case 'not_equals':
          return `NOT ${c.field}: "${c.value}"`;
        case 'contains':
          return `${c.field}: *${c.value}*`;
        case 'starts_with':
          return `${c.field}: ${c.value}*`;
        case 'ends_with':
          return `${c.field}: *${c.value}`;
        case 'matches':
          return `${c.field}: /${c.value}/`;
        case 'in':
          return `${c.field}: (${c.value})`;
        case 'exists':
          return `${c.field}: *`;
        default:
          return '';
      }
    }).filter(Boolean).join(' AND ');
  };
  
  const executeHunt = async () => {
    const query = queryMode === 'builder' ? buildQueryFromConditions() : rawQuery;
    if (!query.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const now = new Date();
      const start = new Date();
      
      switch (timeRange) {
        case '1h': start.setHours(start.getHours() - 1); break;
        case '24h': start.setHours(start.getHours() - 24); break;
        case '7d': start.setDate(start.getDate() - 7); break;
        case '30d': start.setDate(start.getDate() - 30); break;
        default: start.setDate(start.getDate() - 7);
      }
      
      const data = await xdrApi.executeHunt(query, {
        start: start.toISOString(),
        end: now.toISOString(),
      });
      setResults(data);
    } catch (err) {
      console.error('Hunt execution failed:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const allSources: DataSourceType[] = ['edr', 'ndr', 'identity', 'email', 'cloud', 'dns', 'firewall'];
  
  const toggleSource = (source: DataSourceType) => {
    if (sources.includes(source)) {
      setSources(sources.filter(s => s !== source));
    } else {
      setSources([...sources, source]);
    }
  };
  
  return (
    <div style={{ padding: '20px', display: 'flex', gap: '24px' }}>
      {/* Saved hunts sidebar */}
      <SavedHuntsPanel
        hunts={savedHunts}
        onSelectHunt={handleSelectHunt}
        selectedHuntId={selectedHunt?.id}
      />
      
      {/* Main content */}
      <div style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '24px' }}>🎯 Threat Hunt</h2>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            Search across all data sources for indicators of compromise
          </p>
        </div>
        
        {/* Query mode toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            onClick={() => setQueryMode('builder')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: queryMode === 'builder' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: queryMode === 'builder' ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            🔧 Query Builder
          </button>
          <button
            onClick={() => setQueryMode('raw')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: queryMode === 'raw' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: queryMode === 'raw' ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            📝 Raw Query
          </button>
        </div>
        
        {/* Query builder or raw input */}
        {queryMode === 'builder' ? (
          <QueryBuilder conditions={conditions} onConditionsChange={setConditions} />
        ) : (
          <div style={{
            padding: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            marginBottom: '20px',
          }}>
            <h4 style={{ margin: '0 0 12px', color: '#fff', fontSize: '14px' }}>Query (KQL)</h4>
            <textarea
              value={rawQuery}
              onChange={(e) => setRawQuery(e.target.value)}
              placeholder='Enter your query, e.g.: process.name: "powershell.exe" AND process.command_line: *-enc*'
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: '#00d4ff',
                fontSize: '13px',
                fontFamily: 'monospace',
                resize: 'vertical',
              }}
            />
          </div>
        )}
        
        {/* Filters row */}
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}>
          {/* Time range */}
          <div>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginRight: '8px' }}>Time Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: '#fff',
                fontSize: '13px',
              }}
            >
              <option value="1h">Last 1 hour</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
          
          {/* Source filters */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginRight: '4px' }}>Sources:</span>
            {allSources.map(source => (
              <button
                key={source}
                onClick={() => toggleSource(source)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: sources.includes(source) || sources.length === 0
                    ? 'rgba(0, 212, 255, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: sources.includes(source) || sources.length === 0
                    ? '#00d4ff'
                    : 'rgba(255, 255, 255, 0.3)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {source}
              </button>
            ))}
          </div>
          
          {/* Execute button */}
          <button
            onClick={executeHunt}
            disabled={loading || (queryMode === 'builder' ? conditions.length === 0 : !rawQuery.trim())}
            style={{
              marginLeft: 'auto',
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#00d4ff',
              color: '#000',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              opacity: loading || (queryMode === 'builder' ? conditions.length === 0 : !rawQuery.trim()) ? 0.5 : 1,
            }}
          >
            {loading ? '🔍 Hunting...' : '🎯 Execute Hunt'}
          </button>
        </div>
        
        {/* Results */}
        <HuntResults
          results={results}
          loading={loading}
          query={hasSearched ? (queryMode === 'builder' ? buildQueryFromConditions() : rawQuery) : ''}
        />
      </div>
    </div>
  );
};

export default ThreatHuntInterface;
