/**
 * XDR Risk Scoring Dashboard Component
 * Entity risk scores with contributing factors
 */

import React, { useState, useEffect } from 'react';
import type { EntityRiskProfile } from '../types/xdr.types';
import { xdrApi } from '../api/xdr.api';

// ============================================================================
// Helper Functions
// ============================================================================

const getRiskColor = (score: number): string => {
  if (score >= 80) return '#ff4757';
  if (score >= 60) return '#ff6b35';
  if (score >= 40) return '#ffa502';
  if (score >= 20) return '#3742fa';
  return '#2ed573';
};

const getRiskLevel = (score: number): string => {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  if (score >= 20) return 'Low';
  return 'Minimal';
};

const getEntityIcon = (type: string): string => {
  switch (type) {
    case 'user': return '👤';
    case 'host': return '🖥️';
    case 'ip': return '🌐';
    case 'domain': return '🔗';
    case 'file': return '📁';
    case 'process': return '⚙️';
    default: return '📦';
  }
};

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

// ============================================================================
// Risk Gauge Component
// ============================================================================

interface RiskGaugeProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ score, size = 120, showLabel = true }) => {
  const strokeWidth = size / 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI * 2;
  const progress = circumference * (1 - score / 100);
  
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getRiskColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: size / 3, fontWeight: 700, color: getRiskColor(score) }}>
          {score}
        </div>
        {showLabel && (
          <div style={{ fontSize: size / 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            {getRiskLevel(score)}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Risk Entity Card
// ============================================================================

interface RiskEntityCardProps {
  profile: EntityRiskProfile;
  onView: (profile: EntityRiskProfile) => void;
}

const RiskEntityCard: React.FC<RiskEntityCardProps> = ({ profile, onView }) => {
  return (
    <div
      onClick={() => onView(profile)}
      style={{
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        border: `1px solid ${getRiskColor(profile.riskScore)}22`,
        borderLeft: `4px solid ${getRiskColor(profile.riskScore)}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <RiskGauge score={profile.riskScore} size={60} showLabel={false} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '18px' }}>{getEntityIcon(profile.entityType)}</span>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{profile.entityName}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '10px',
              textTransform: 'uppercase',
            }}>
              {profile.entityType}
            </span>
            {profile.alertCount > 0 && (
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 71, 87, 0.15)',
                color: '#ff4757',
                fontSize: '10px',
              }}>
                {profile.alertCount} alerts
              </span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
            Last assessed: {formatTimeAgo(profile.lastAssessed)}
          </div>
        </div>
        <div style={{
          textAlign: 'right',
          color: getRiskColor(profile.riskScore),
          fontSize: '12px',
          fontWeight: 600,
        }}>
          {getRiskLevel(profile.riskScore)}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Risk Factor Bar
// ============================================================================

interface RiskFactorBarProps {
  factor: { name: string; weight: number; description: string };
}

const RiskFactorBar: React.FC<RiskFactorBarProps> = ({ factor }) => {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ color: '#fff', fontSize: '13px' }}>{factor.name}</span>
        <span style={{ color: getRiskColor(factor.weight), fontSize: '13px', fontWeight: 600 }}>
          +{factor.weight}
        </span>
      </div>
      <div style={{
        height: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${factor.weight}%`,
          backgroundColor: getRiskColor(factor.weight),
          borderRadius: '4px',
          transition: 'width 0.3s ease',
        }} />
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
        {factor.description}
      </div>
    </div>
  );
};

// ============================================================================
// Entity Detail Panel
// ============================================================================

interface EntityDetailProps {
  profile: EntityRiskProfile | null;
  onClose: () => void;
}

const EntityDetail: React.FC<EntityDetailProps> = ({ profile, onClose }) => {
  if (!profile) return null;
  
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>Risk Profile</h3>
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
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '32px',
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
      }}>
        <RiskGauge score={profile.riskScore} size={100} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '28px' }}>{getEntityIcon(profile.entityType)}</span>
            <span style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>{profile.entityName}</span>
          </div>
          <span style={{
            padding: '4px 10px',
            borderRadius: '4px',
            backgroundColor: `${getRiskColor(profile.riskScore)}22`,
            color: getRiskColor(profile.riskScore),
            fontSize: '12px',
            fontWeight: 600,
          }}>
            {getRiskLevel(profile.riskScore)} Risk
          </span>
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(255, 71, 87, 0.1)',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#ff4757' }}>
            {profile.openAlertCount || 0}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Open Alerts</div>
        </div>
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(255, 165, 2, 0.1)',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffa502' }}>
            {profile.alertCount || 0}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Total Alerts</div>
        </div>
      </div>
      
      {profile.factors && profile.factors.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '16px' }}>
            Risk Factors
          </h4>
          {profile.factors.map((factor, i) => (
            <RiskFactorBar key={i} factor={factor} />
          ))}
        </div>
      )}
      
      {profile.history && profile.history.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '16px' }}>
            Risk Trend (7 days)
          </h4>
          <div style={{
            height: '100px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '8px',
            padding: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
          }}>
            {profile.history.map((point, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '100%',
                  height: `${point.score}%`,
                  backgroundColor: getRiskColor(point.score),
                  borderRadius: '4px 4px 0 0',
                  minHeight: '4px',
                }} />
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>
                  {new Date(point.timestamp).toLocaleDateString(undefined, { weekday: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div style={{
        padding: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <span style={{
          fontSize: '20px',
          color: typeof profile.trend === 'string' && profile.trend === 'increasing' ? '#ff4757' 
            : typeof profile.trend === 'string' && profile.trend === 'decreasing' ? '#2ed573' 
            : '#ffa502',
        }}>
          {typeof profile.trend === 'string' && profile.trend === 'increasing' ? '📈' 
            : typeof profile.trend === 'string' && profile.trend === 'decreasing' ? '📉' 
            : '➡️'}
        </span>
        <div>
          <div style={{ color: '#fff', fontSize: '14px' }}>
            Risk Trend: {typeof profile.trend === 'string' ? profile.trend.charAt(0).toUpperCase() + profile.trend.slice(1) : 'Stable'}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
            Last assessed: {formatTimeAgo(profile.lastAssessed)}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const RiskScoringDashboard: React.FC = () => {
  const [riskyEntities, setRiskyEntities] = useState<EntityRiskProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<EntityRiskProfile | null>(null);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('all');
  
  useEffect(() => {
    loadRiskyEntities();
  }, []);
  
  const loadRiskyEntities = async () => {
    setLoading(true);
    try {
      const data = await xdrApi.getRiskyEntities(30);
      setRiskyEntities(data);
    } catch (err) {
      console.error('Failed to load risky entities:', err);
    } finally {
      setLoading(false);
    }
  };
  
  let filteredEntities = riskyEntities;
  
  if (entityTypeFilter !== 'all') {
    filteredEntities = filteredEntities.filter(e => e.entityType === entityTypeFilter);
  }
  
  if (riskLevelFilter !== 'all') {
    filteredEntities = filteredEntities.filter(e => {
      const level = getRiskLevel(e.riskScore).toLowerCase();
      return level === riskLevelFilter;
    });
  }
  
  const criticalCount = riskyEntities.filter(e => e.riskScore >= 80).length;
  const highCount = riskyEntities.filter(e => e.riskScore >= 60 && e.riskScore < 80).length;
  const mediumCount = riskyEntities.filter(e => e.riskScore >= 40 && e.riskScore < 60).length;
  const averageScore = riskyEntities.length > 0
    ? Math.round(riskyEntities.reduce((sum, e) => sum + e.riskScore, 0) / riskyEntities.length)
    : 0;
  
  const entityTypes = ['user', 'host', 'ip', 'domain', 'file'];
  const riskLevels = ['critical', 'high', 'medium', 'low', 'minimal'];
  
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
        Loading risk scores...
      </div>
    );
  }
  
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: '#fff', fontSize: '24px' }}>⚠️ Risk Scoring Dashboard</h2>
        <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
          Entity risk scores based on behavioral analysis
        </p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(255, 71, 87, 0.1)',
          borderRadius: '12px',
          borderLeft: '4px solid #ff4757',
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#ff4757' }}>{criticalCount}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Critical Risk</div>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(255, 107, 53, 0.1)',
          borderRadius: '12px',
          borderLeft: '4px solid #ff6b35',
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#ff6b35' }}>{highCount}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>High Risk</div>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(255, 165, 2, 0.1)',
          borderRadius: '12px',
          borderLeft: '4px solid #ffa502',
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffa502' }}>{mediumCount}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Medium Risk</div>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
        }}>
          <RiskGauge score={averageScore} size={70} showLabel={false} />
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Average</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: getRiskColor(averageScore) }}>
              {averageScore}
            </div>
          </div>
        </div>
      </div>
      
      <div style={{
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        marginBottom: '24px',
      }}>
        <h3 style={{ margin: '0 0 16px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase' }}>
          Risk Distribution
        </h3>
        <div style={{ display: 'flex', gap: '4px', height: '40px', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{
            flex: criticalCount || 0.5,
            backgroundColor: '#ff4757',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
          }}>
            {criticalCount > 0 && criticalCount}
          </div>
          <div style={{
            flex: highCount || 0.5,
            backgroundColor: '#ff6b35',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
          }}>
            {highCount > 0 && highCount}
          </div>
          <div style={{
            flex: mediumCount || 0.5,
            backgroundColor: '#ffa502',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            fontSize: '12px',
            fontWeight: 600,
          }}>
            {mediumCount > 0 && mediumCount}
          </div>
          <div style={{
            flex: riskyEntities.length - criticalCount - highCount - mediumCount || 0.5,
            backgroundColor: '#2ed573',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            fontSize: '12px',
            fontWeight: 600,
          }}>
            {riskyEntities.length - criticalCount - highCount - mediumCount > 0 && riskyEntities.length - criticalCount - highCount - mediumCount}
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginRight: '8px', textTransform: 'uppercase' }}>Entity Type:</span>
          <div style={{ display: 'inline-flex', gap: '6px' }}>
            <button
              onClick={() => setEntityTypeFilter('all')}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: entityTypeFilter === 'all' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: entityTypeFilter === 'all' ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              All
            </button>
            {entityTypes.map(type => (
              <button
                key={type}
                onClick={() => setEntityTypeFilter(type)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: entityTypeFilter === type ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: entityTypeFilter === type ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {getEntityIcon(type)} {type}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginRight: '8px', textTransform: 'uppercase' }}>Risk Level:</span>
          <div style={{ display: 'inline-flex', gap: '6px' }}>
            <button
              onClick={() => setRiskLevelFilter('all')}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: riskLevelFilter === 'all' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: riskLevelFilter === 'all' ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              All
            </button>
            {riskLevels.map(level => (
              <button
                key={level}
                onClick={() => setRiskLevelFilter(level)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: riskLevelFilter === level ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: riskLevelFilter === level ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '12px' }}>
        {filteredEntities.map((profile, i) => (
          <RiskEntityCard
            key={i}
            profile={profile}
            onView={setSelectedProfile}
          />
        ))}
      </div>
      
      {filteredEntities.length === 0 && (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <div style={{ color: '#2ed573', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
            No High-Risk Entities
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            All monitored entities are within acceptable risk thresholds
          </div>
        </div>
      )}
      
      {selectedProfile && (
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
            onClick={() => setSelectedProfile(null)}
          />
          <EntityDetail
            profile={selectedProfile}
            onClose={() => setSelectedProfile(null)}
          />
        </>
      )}
    </div>
  );
};

export default RiskScoringDashboard;
