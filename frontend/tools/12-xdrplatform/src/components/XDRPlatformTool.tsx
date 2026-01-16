/**
 * XDRPlatform Tool Component
 * Tool 12 - Enterprise Extended Detection & Response (XDR) Platform
 * 
 * Unified detection across EDR, NDR, Identity, Email, and Cloud with:
 * - MITRE ATT&CK mapping
 * - Entity timelines
 * - Threat hunting
 * - Response playbooks
 * - Risk scoring
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { XDRDashboard, Alert, AlertSeverity } from '../types/xdr.types';
import { xdrApi } from '../api/xdr.api';
import { AlertsDashboard } from './AlertsDashboard';
import { EntityTimeline } from './EntityTimeline';
import { DataSourcesPanel } from './DataSourcesPanel';
import { ThreatHuntInterface } from './ThreatHuntInterface';
import { ResponsePlaybooks } from './ResponsePlaybooks';
import { DetectionRulesPanel } from './DetectionRulesPanel';
import { RiskScoringDashboard } from './RiskScoringDashboard';

// ============================================================================
// Types
// ============================================================================

type TabType = 'overview' | 'alerts' | 'entities' | 'hunt' | 'rules' | 'playbooks' | 'risk' | 'sources';

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

const formatNumber = (n: number): string => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
};

// ============================================================================
// Overview Dashboard Component
// ============================================================================

interface OverviewDashboardProps {
  dashboard: XDRDashboard;
  onNavigateTab: (tab: TabType) => void;
}

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ dashboard, onNavigateTab }) => {
  return (
    <div style={{ padding: '20px' }}>
      {/* Header Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {/* Active Alerts */}
        <div
          onClick={() => onNavigateTab('alerts')}
          style={{
            padding: '20px',
            backgroundColor: 'rgba(255, 71, 87, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 71, 87, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
            Active Alerts
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#ff4757' }}>
            {dashboard.alertsByStatus.open + dashboard.alertsByStatus.investigating}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <span style={{ fontSize: '12px', color: '#ff4757' }}>
              {dashboard.alertsBySeverity.critical} critical
            </span>
            <span style={{ fontSize: '12px', color: '#ff6b35' }}>
              {dashboard.alertsBySeverity.high} high
            </span>
          </div>
        </div>
        
        {/* Detection Rules */}
        <div
          onClick={() => onNavigateTab('rules')}
          style={{
            padding: '20px',
            backgroundColor: 'rgba(0, 212, 255, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
            Detection Rules
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#00d4ff' }}>
            {dashboard.rulesEnabled}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
            Active & monitoring
          </div>
        </div>
        
        {/* Data Sources */}
        <div
          onClick={() => onNavigateTab('sources')}
          style={{
            padding: '20px',
            backgroundColor: 'rgba(46, 213, 115, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(46, 213, 115, 0.2)',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
            Data Sources
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#2ed573' }}>
            {dashboard.dataSourcesConnected}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
            {formatNumber(dashboard.eventsPerSecond)} EPS
          </div>
        </div>
        
        {/* MTTR */}
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(155, 89, 182, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(155, 89, 182, 0.2)',
        }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
            Mean Time to Respond
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#9b59b6' }}>
            {dashboard.meanTimeToRespond}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
            Target: &lt; 30m
          </div>
        </div>
      </div>
      
      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Recent Critical Alerts */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>🚨 Recent Critical Alerts</h3>
            <button
              onClick={() => onNavigateTab('alerts')}
              style={{
                background: 'none',
                border: 'none',
                color: '#00d4ff',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              View all →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dashboard.recentAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').slice(0, 5).map((alert, i) => (
              <div key={i} style={{
                padding: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                borderLeft: `3px solid ${getSeverityColor(alert.severity)}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: '#fff', fontSize: '13px', marginBottom: '4px' }}>
                      {alert.title}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: `${getSeverityColor(alert.severity)}22`,
                        color: getSeverityColor(alert.severity),
                        fontSize: '10px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}>
                        {alert.severity}
                      </span>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                        {alert.source}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Alert Trend */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: '16px' }}>📈 Alert Trend (24h)</h3>
          <div style={{
            height: '180px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '4px',
            padding: '0 8px',
          }}>
            {dashboard.alertTrend.map((point, i) => {
              const maxCount = Math.max(...dashboard.alertTrend.map(p => p.count));
              const height = maxCount > 0 ? (point.count / maxCount) * 100 : 0;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '100%',
                    height: `${height}%`,
                    minHeight: '4px',
                    backgroundColor: point.count > 10 ? '#ff4757' : point.count > 5 ? '#ffa502' : '#00d4ff',
                    borderRadius: '4px 4px 0 0',
                  }} />
                  {i % 4 === 0 && (
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>
                      {new Date(point.timestamp).getHours()}h
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Top MITRE Techniques */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: '16px' }}>🎯 Top MITRE Techniques</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dashboard.topMitreTechniques.map((tech, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(155, 89, 182, 0.15)',
                  color: '#9b59b6',
                  fontSize: '11px',
                  fontWeight: 600,
                  minWidth: '50px',
                  textAlign: 'center',
                }}>
                  {tech.techniqueId}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontSize: '12px', marginBottom: '4px' }}>
                    {tech.technique}
                  </div>
                  <div style={{
                    height: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(tech.count / dashboard.topMitreTechniques[0].count) * 100}%`,
                      backgroundColor: '#9b59b6',
                      borderRadius: '3px',
                    }} />
                  </div>
                </div>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600, minWidth: '30px', textAlign: 'right' }}>
                  {tech.count}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Risky Entities */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>⚠️ Risky Entities</h3>
            <button
              onClick={() => onNavigateTab('risk')}
              style={{
                background: 'none',
                border: 'none',
                color: '#00d4ff',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              View all →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dashboard.riskyEntities.slice(0, 5).map((item, i) => {
              const getRiskColor = (score: number) => {
                if (score >= 80) return '#ff4757';
                if (score >= 60) return '#ff6b35';
                if (score >= 40) return '#ffa502';
                return '#2ed573';
              };
              const getEntityIcon = (type: string) => {
                switch (type) {
                  case 'user': return '👤';
                  case 'host': return '🖥️';
                  case 'ip': return '🌐';
                  default: return '📦';
                }
              };
              return (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: `${getRiskColor(item.riskScore)}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                  }}>
                    {getEntityIcon(item.entity.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontSize: '13px' }}>
                      {item.entity.type === 'user' && 'username' in item.entity
                        ? (item.entity as any).username
                        : item.entity.type === 'host' && 'hostname' in item.entity
                        ? (item.entity as any).hostname
                        : item.entity.id}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      {item.entity.type} • {item.alertCount} alerts
                    </div>
                  </div>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: `${getRiskColor(item.riskScore)}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: getRiskColor(item.riskScore),
                    fontSize: '14px',
                    fontWeight: 700,
                  }}>
                    {item.riskScore}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export default function XDRPlatformTool() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [dashboard, setDashboard] = useState<XDRDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await xdrApi.getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'alerts', label: 'Alerts', icon: '🚨' },
    { id: 'entities', label: 'Entities', icon: '👤' },
    { id: 'hunt', label: 'Threat Hunt', icon: '🔍' },
    { id: 'rules', label: 'Detection Rules', icon: '📜' },
    { id: 'playbooks', label: 'Playbooks', icon: '📋' },
    { id: 'risk', label: 'Risk Scores', icon: '⚠️' },
    { id: 'sources', label: 'Data Sources', icon: '🔌' },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(0, 212, 255, 0.2)',
            borderTopColor: '#00d4ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return dashboard ? <OverviewDashboard dashboard={dashboard} onNavigateTab={setActiveTab} /> : null;
      case 'alerts':
        return <AlertsDashboard />;
      case 'entities':
        return <EntityTimeline />;
      case 'hunt':
        return <ThreatHuntInterface />;
      case 'rules':
        return <DetectionRulesPanel />;
      case 'playbooks':
        return <ResponsePlaybooks />;
      case 'risk':
        return <RiskScoringDashboard />;
      case 'sources':
        return <DataSourcesPanel />;
      default:
        return null;
    }
  };
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f0f1a',
      color: '#fff',
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '16px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <a
                href="https://maula.ai"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
              >
                <ArrowLeft style={{ width: '16px', height: '16px' }} />
                MAULA.AI
              </a>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}>
                🛡️
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>XDR Platform</h1>
                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px' }}>
                  Extended Detection & Response
                </p>
              </div>
            </div>
            
            <button
              onClick={() => { window.location.href = '/neural-link'; }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0, 212, 255, 0.3)',
              }}
            >
              <span>✨</span>
              <span>AI Assistant</span>
            </button>
          </div>
          
          {/* Navigation tabs */}
          <nav style={{
            display: 'flex',
            gap: '8px',
            marginTop: '16px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === tab.id
                    ? 'rgba(0, 212, 255, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: activeTab === tab.id ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ marginRight: '8px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main style={{
        maxWidth: '1600px',
        margin: '0 auto',
      }}>
        {renderContent()}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px',
        marginTop: '40px',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '13px',
      }}>
        XDR Platform Tool 12 • VictoryKit Security Platform • Powered by MAULA.AI
      </footer>
    </div>
  );
}
