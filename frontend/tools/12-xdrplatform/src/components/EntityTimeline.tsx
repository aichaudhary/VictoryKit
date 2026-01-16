/**
 * XDR Entity Timeline Component
 * Shows cross-source events for a specific entity (user/host/IP)
 */

import React, { useState, useEffect } from 'react';
import type { Entity, NormalizedEvent, EntityRiskProfile, UserEntity, HostEntity, IPEntity, EntityType } from '../types/xdr.types';
import { xdrApi } from '../api/xdr.api';

// ============================================================================
// Helper Functions
// ============================================================================

const getRiskColor = (level: string): string => {
  const colors: Record<string, string> = {
    critical: '#ff4757',
    high: '#ff6b35',
    medium: '#ffa502',
    low: '#3742fa',
    info: '#70a1ff',
  };
  return colors[level] || '#70a1ff';
};

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

const getActionColor = (action: string, outcome: string): string => {
  if (outcome === 'failure') return '#ff4757';
  
  const suspiciousActions = ['login-failed', 'process-inject', 'permission-change', 'policy-change'];
  if (suspiciousActions.includes(action)) return '#ffa502';
  
  return '#2ed573';
};

const formatTimestamp = (ts: string): string => {
  const date = new Date(ts);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
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
// Entity Card Components
// ============================================================================

interface EntityHeaderProps {
  entity: Entity;
  riskProfile?: EntityRiskProfile;
}

const EntityHeader: React.FC<EntityHeaderProps> = ({ entity, riskProfile }) => {
  const getEntityIcon = () => {
    switch (entity.type) {
      case 'user': return '👤';
      case 'host': return '🖥️';
      case 'ip': return '🌐';
      default: return '📦';
    }
  };
  
  return (
    <div style={{
      padding: '24px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '12px',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
        {/* Entity Icon & Risk Score */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: `${getRiskColor(entity.riskLevel)}22`,
          border: `3px solid ${getRiskColor(entity.riskLevel)}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: '24px' }}>{getEntityIcon()}</span>
          <span style={{
            fontSize: '18px',
            fontWeight: 700,
            color: getRiskColor(entity.riskLevel),
          }}>
            {entity.riskScore}
          </span>
        </div>
        
        {/* Entity Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h2 style={{ margin: 0, color: '#fff', fontSize: '20px' }}>{entity.displayName}</h2>
            <span style={{
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: `${getRiskColor(entity.riskLevel)}22`,
              color: getRiskColor(entity.riskLevel),
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}>
              {entity.riskLevel} risk
            </span>
          </div>
          
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '12px' }}>
            {entity.name}
          </div>
          
          {/* Entity-specific details */}
          {entity.type === 'user' && (
            <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
              <span>📧 {(entity as UserEntity).email}</span>
              <span>🏢 {(entity as UserEntity).department}</span>
              <span>📍 {(entity as UserEntity).location}</span>
              {(entity as UserEntity).privileged && (
                <span style={{ color: '#ffa502' }}>⚠️ Privileged</span>
              )}
            </div>
          )}
          
          {entity.type === 'host' && (
            <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
              <span>🖥️ {(entity as HostEntity).os}</span>
              <span>🌐 {(entity as HostEntity).ipAddresses.join(', ')}</span>
              <span style={{
                color: (entity as HostEntity).agentStatus === 'online' ? '#2ed573' : '#ff4757',
              }}>
                ● {(entity as HostEntity).agentStatus}
              </span>
            </div>
          )}
          
          {entity.type === 'ip' && (
            <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
              {(entity as IPEntity).geoLocation && (
                <span>📍 {(entity as IPEntity).geoLocation?.country}, {(entity as IPEntity).geoLocation?.city}</span>
              )}
              {(entity as IPEntity).organization && (
                <span>🏢 {(entity as IPEntity).organization}</span>
              )}
              <span style={{
                color: (entity as IPEntity).reputation === 'malicious' ? '#ff4757' : 
                       (entity as IPEntity).reputation === 'suspicious' ? '#ffa502' : '#2ed573',
              }}>
                ● {(entity as IPEntity).reputation}
              </span>
            </div>
          )}
          
          {/* Tags */}
          {entity.tags && entity.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
              {entity.tags.map((tag, i) => (
                <span key={i} style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(0, 212, 255, 0.15)',
                  color: '#00d4ff',
                  fontSize: '11px',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Stats */}
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#ff4757' }}>
              {entity.alertCount}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
              Alerts
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#00d4ff' }}>
              {entity.eventCount.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
              Events
            </div>
          </div>
        </div>
      </div>
      
      {/* Risk Factors */}
      {riskProfile && riskProfile.factors.length > 0 && (
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <h4 style={{ margin: '0 0 12px', color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase' }}>
            Risk Factors
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {riskProfile.factors.map(factor => (
              <div key={factor.id} style={{
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 71, 87, 0.1)',
                border: '1px solid rgba(255, 71, 87, 0.2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(255, 71, 87, 0.2)',
                    color: '#ff4757',
                    fontSize: '10px',
                    fontWeight: 600,
                  }}>
                    +{factor.weight}
                  </span>
                  <span style={{ color: '#fff', fontSize: '13px' }}>{factor.name}</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '4px' }}>
                  {factor.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Timeline Event Component
// ============================================================================

interface TimelineEventProps {
  event: NormalizedEvent;
  isFirst: boolean;
  isLast: boolean;
}

const TimelineEvent: React.FC<TimelineEventProps> = ({ event, isFirst, isLast }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getEventSummary = (): string => {
    switch (event.category) {
      case 'authentication':
        return `${event.action.replace('-', ' ')} ${event.outcome === 'success' ? 'succeeded' : 'failed'} for ${event.user?.name || 'unknown user'}`;
      case 'process':
        return `${event.process?.name || 'Unknown process'} ${event.action.replace('-', ' ')}`;
      case 'network':
        return `${event.network?.direction} connection to ${event.network?.destinationIp}:${event.network?.destinationPort}`;
      case 'dns':
        return `DNS query for ${event.dns?.query} (${event.dns?.queryType})`;
      case 'file':
        return `${event.action.replace('-', ' ')}: ${event.file?.name}`;
      case 'cloud':
        return `${event.cloud?.service} ${event.cloud?.action} in ${event.cloud?.region}`;
      case 'iam':
        return `${event.action.replace('-', ' ')} on ${event.user?.name || 'unknown'}`;
      default:
        return event.message || event.action;
    }
  };
  
  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      {/* Timeline line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px' }}>
        {!isFirst && <div style={{ width: '2px', height: '20px', backgroundColor: 'rgba(255,255,255,0.1)' }} />}
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: getActionColor(event.action, event.outcome),
          border: '2px solid rgba(0,0,0,0.3)',
          flexShrink: 0,
        }} />
        {!isLast && <div style={{ width: '2px', flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', minHeight: '40px' }} />}
      </div>
      
      {/* Event content */}
      <div
        style={{
          flex: 1,
          padding: '12px 16px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          marginBottom: '8px',
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.05)',
          transition: 'all 0.2s ease',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
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
            fontWeight: 500,
          }}>
            {event.outcome}
          </span>
          <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
            {formatTimestamp(event.timestamp)}
          </span>
        </div>
        
        {/* Summary */}
        <div style={{ color: '#fff', fontSize: '14px', marginBottom: '4px' }}>
          {getEventSummary()}
        </div>
        
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
          {event.category} • {event.action.replace('-', ' ')}
        </div>
        
        {/* Expanded details */}
        {expanded && (
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            {event.user && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>User: </span>
                <span style={{ color: '#fff', fontSize: '13px' }}>{event.user.name}</span>
              </div>
            )}
            {event.host && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Host: </span>
                <span style={{ color: '#fff', fontSize: '13px' }}>{event.host.name} ({event.host.ip})</span>
              </div>
            )}
            {event.process && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Process: </span>
                <span style={{ color: '#fff', fontSize: '13px' }}>{event.process.name} (PID: {event.process.pid})</span>
                {event.process.commandLine && (
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
                )}
              </div>
            )}
            {event.network && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Network: </span>
                <span style={{ color: '#fff', fontSize: '13px' }}>
                  {event.network.sourceIp}:{event.network.sourcePort} → {event.network.destinationIp}:{event.network.destinationPort} ({event.network.protocol})
                </span>
              </div>
            )}
            {event.dns && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>DNS: </span>
                <span style={{ color: '#fff', fontSize: '13px' }}>
                  {event.dns.query} ({event.dns.queryType}) → {event.dns.responseCode}
                </span>
              </div>
            )}
            {event.file && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>File: </span>
                <span style={{ color: '#fff', fontSize: '13px' }}>
                  {event.file.path || event.file.name}
                </span>
              </div>
            )}
            {event.cloud && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Cloud: </span>
                <span style={{ color: '#fff', fontSize: '13px' }}>
                  {event.cloud.provider.toUpperCase()} {event.cloud.service}:{event.cloud.action}
                </span>
              </div>
            )}
            {event.geo && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Location: </span>
                <span style={{ color: '#fff', fontSize: '13px' }}>{event.geo.city}, {event.geo.country}</span>
              </div>
            )}
            {event.threatIntel && event.threatIntel.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ color: '#ff4757', fontSize: '11px', fontWeight: 600 }}>⚠️ THREAT INTEL MATCH</span>
                {event.threatIntel.map((ti, i) => (
                  <div key={i} style={{
                    marginTop: '4px',
                    padding: '8px',
                    backgroundColor: 'rgba(255, 71, 87, 0.1)',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}>
                    <div style={{ color: '#ff4757' }}>{ti.indicator} ({ti.source})</div>
                    {ti.description && <div style={{ color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{ti.description}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Entity List Component
// ============================================================================

interface EntityListProps {
  entities: Entity[];
  selectedEntity: Entity | null;
  onSelectEntity: (entity: Entity) => void;
  entityType: EntityType;
  onTypeChange: (type: EntityType) => void;
}

const EntityList: React.FC<EntityListProps> = ({ entities, selectedEntity, onSelectEntity, entityType, onTypeChange }) => {
  const types: EntityType[] = ['user', 'host', 'ip'];
  
  return (
    <div style={{
      width: '300px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '12px',
      padding: '16px',
      height: 'fit-content',
      position: 'sticky',
      top: '20px',
    }}>
      <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: '16px' }}>Entities</h3>
      
      {/* Type tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {types.map(type => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: entityType === type ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: entityType === type ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {type === 'user' ? '👤' : type === 'host' ? '🖥️' : '🌐'} {type}s
          </button>
        ))}
      </div>
      
      {/* Entity list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {entities.map(entity => (
          <div
            key={entity.id}
            onClick={() => onSelectEntity(entity)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: selectedEntity?.id === entity.id ? 'rgba(0, 212, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)',
              border: `1px solid ${selectedEntity?.id === entity.id ? 'rgba(0, 212, 255, 0.3)' : 'rgba(255,255,255,0.05)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Risk indicator */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: `${getRiskColor(entity.riskLevel)}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                color: getRiskColor(entity.riskLevel),
              }}>
                {entity.riskScore}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {entity.displayName}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '11px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {entity.alertCount} alerts • {formatTimeAgo(entity.lastSeen)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

interface EntityTimelineProps {
  initialEntityId?: string;
  initialEntityType?: EntityType;
}

export const EntityTimeline: React.FC<EntityTimelineProps> = ({ initialEntityId, initialEntityType = 'user' }) => {
  const [entityType, setEntityType] = useState<EntityType>(initialEntityType);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [riskProfile, setRiskProfile] = useState<EntityRiskProfile | null>(null);
  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  
  useEffect(() => {
    loadEntities();
  }, [entityType]);
  
  useEffect(() => {
    if (selectedEntity) {
      loadEntityDetails();
    }
  }, [selectedEntity]);
  
  const loadEntities = async () => {
    setLoading(true);
    try {
      const data = await xdrApi.getEntities(entityType);
      const filtered = data.filter(e => e.type === entityType);
      setEntities(filtered);
      
      // Select initial entity if provided
      if (initialEntityId) {
        const initial = filtered.find(e => e.id === initialEntityId);
        if (initial) setSelectedEntity(initial);
      } else if (filtered.length > 0) {
        setSelectedEntity(filtered[0]);
      }
    } catch (err) {
      console.error('Failed to load entities:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const loadEntityDetails = async () => {
    if (!selectedEntity) return;
    
    setLoadingEvents(true);
    try {
      const [profile, timeline] = await Promise.all([
        xdrApi.getEntityRiskProfile(selectedEntity.id),
        xdrApi.getEntityTimeline(selectedEntity.id),
      ]);
      setRiskProfile(profile);
      setEvents(timeline);
    } catch (err) {
      console.error('Failed to load entity details:', err);
    } finally {
      setLoadingEvents(false);
    }
  };
  
  const handleTypeChange = (type: EntityType) => {
    setEntityType(type);
    setSelectedEntity(null);
    setRiskProfile(null);
    setEvents([]);
  };
  
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
        Loading entities...
      </div>
    );
  }
  
  return (
    <div style={{ padding: '20px', display: 'flex', gap: '24px' }}>
      {/* Entity list sidebar */}
      <EntityList
        entities={entities}
        selectedEntity={selectedEntity}
        onSelectEntity={setSelectedEntity}
        entityType={entityType}
        onTypeChange={handleTypeChange}
      />
      
      {/* Main content */}
      <div style={{ flex: 1 }}>
        {selectedEntity ? (
          <>
            {/* Entity header */}
            <EntityHeader entity={selectedEntity} riskProfile={riskProfile || undefined} />
            
            {/* Timeline */}
            <div>
              <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>
                Activity Timeline
                {loadingEvents && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginLeft: '10px' }}>Loading...</span>}
              </h3>
              
              {events.length === 0 && !loadingEvents ? (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '12px',
                }}>
                  No events found for this entity
                </div>
              ) : (
                <div style={{ paddingLeft: '10px' }}>
                  {events.map((event, index) => (
                    <TimelineEvent
                      key={event.id}
                      event={event}
                      isFirst={index === 0}
                      isLast={index === events.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{
            padding: '80px 40px',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {entityType === 'user' ? '👤' : entityType === 'host' ? '🖥️' : '🌐'}
            </div>
            <div style={{ fontSize: '16px' }}>Select an entity to view timeline</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityTimeline;
