/**
 * XDR Response Playbooks Component
 * Automated response playbooks with approval gates
 */

import React, { useState, useEffect } from 'react';
import type { Playbook, PlaybookExecution, PlaybookActionType, PlaybookAction } from '../types/xdr.types';
import { xdrApi } from '../api/xdr.api';

// ============================================================================
// Helper Functions
// ============================================================================

const getActionIcon = (type: PlaybookActionType): string => {
  const icons: Record<PlaybookActionType, string> = {
    'isolate-host': '🔒',
    'unisolate-host': '🔓',
    'disable-user': '🚫',
    'enable-user': '✅',
    'reset-password': '🔑',
    'revoke-sessions': '⏹️',
    'block-ip': '🛡️',
    'unblock-ip': '✅',
    'block-domain': '🌐',
    'block-hash': '📛',
    'quarantine-email': '📧',
    'delete-email': '🗑️',
    'create-ticket': '🎫',
    'notify-slack': '💬',
    'notify-teams': '👥',
    'notify-email': '📨',
    'run-script': '⚡',
    'collect-forensics': '🔍',
  };
  return icons[type] || '⚙️';
};

const getTriggerColor = (type: string): string => {
  switch (type) {
    case 'automatic': return '#2ed573';
    case 'manual': return '#00d4ff';
    case 'scheduled': return '#ffa502';
    default: return '#a4b0be';
  }
};

const formatDuration = (duration: string): string => {
  return duration;
};

// ============================================================================
// Playbook Card Component
// ============================================================================

interface PlaybookCardProps {
  playbook: Playbook;
  onView: (playbook: Playbook) => void;
  onExecute: (playbook: Playbook) => void;
}

const PlaybookCard: React.FC<PlaybookCardProps> = ({ playbook, onView, onExecute }) => {
  const hasApprovalGate = playbook.actions.some(a => a.requiresApproval);
  
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          backgroundColor: playbook.enabled ? 'rgba(46, 213, 115, 0.15)' : 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
        }}>
          {playbook.enabled ? '▶️' : '⏸️'}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>{playbook.name}</span>
            {!playbook.enabled && (
              <span style={{
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '10px',
              }}>
                DISABLED
              </span>
            )}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
            {playbook.description}
          </div>
        </div>
        
        {/* Trigger badge */}
        <div style={{
          padding: '4px 10px',
          borderRadius: '20px',
          backgroundColor: `${getTriggerColor(playbook.trigger.type)}22`,
          color: getTriggerColor(playbook.trigger.type),
          fontSize: '11px',
          fontWeight: 500,
          textTransform: 'capitalize',
        }}>
          {playbook.trigger.type}
        </div>
      </div>
      
      {/* Actions preview */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', textTransform: 'uppercase' }}>
          Actions ({playbook.actions.length})
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {playbook.actions.map((action, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              border: action.requiresApproval ? '1px solid rgba(255, 165, 2, 0.3)' : '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{ fontSize: '14px' }}>{getActionIcon(action.type)}</span>
              <span style={{ color: '#fff', fontSize: '12px' }}>{action.name}</span>
              {action.requiresApproval && (
                <span style={{ color: '#ffa502', fontSize: '10px' }}>🔐</span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        {playbook.executionsLast24h !== undefined && (
          <div>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Runs 24h: </span>
            <span style={{ color: '#00d4ff', fontSize: '14px', fontWeight: 600 }}>{playbook.executionsLast24h}</span>
          </div>
        )}
        {playbook.successRate !== undefined && (
          <div>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Success: </span>
            <span style={{ color: '#2ed573', fontSize: '14px', fontWeight: 600 }}>{playbook.successRate}%</span>
          </div>
        )}
        {playbook.avgDuration && (
          <div>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Avg Time: </span>
            <span style={{ color: '#fff', fontSize: '14px' }}>{playbook.avgDuration}</span>
          </div>
        )}
      </div>
      
      {/* Tags */}
      {playbook.tags && playbook.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {playbook.tags.map((tag, i) => (
            <span key={i} style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(0, 212, 255, 0.15)',
              color: '#00d4ff',
              fontSize: '10px',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Footer */}
      <div style={{ display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={() => onView(playbook)}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          View Details
        </button>
        <button
          onClick={() => onExecute(playbook)}
          disabled={!playbook.enabled}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: playbook.enabled ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            color: playbook.enabled ? '#00d4ff' : 'rgba(255, 255, 255, 0.3)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: playbook.enabled ? 'pointer' : 'not-allowed',
          }}
        >
          {hasApprovalGate ? '▶️ Run (Approval Required)' : '▶️ Run Now'}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Playbook Detail Panel
// ============================================================================

interface PlaybookDetailProps {
  playbook: Playbook | null;
  onClose: () => void;
  onExecute: (playbook: Playbook) => void;
}

const PlaybookDetail: React.FC<PlaybookDetailProps> = ({ playbook, onClose, onExecute }) => {
  if (!playbook) return null;
  
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>Playbook Details</h3>
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
      
      {/* Name and status */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px', color: '#fff', fontSize: '20px' }}>{playbook.name}</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            padding: '4px 10px',
            borderRadius: '4px',
            backgroundColor: playbook.enabled ? 'rgba(46, 213, 115, 0.15)' : 'rgba(255, 71, 87, 0.15)',
            color: playbook.enabled ? '#2ed573' : '#ff4757',
            fontSize: '11px',
            fontWeight: 600,
          }}>
            {playbook.enabled ? 'ENABLED' : 'DISABLED'}
          </span>
          <span style={{
            padding: '4px 10px',
            borderRadius: '4px',
            backgroundColor: `${getTriggerColor(playbook.trigger.type)}22`,
            color: getTriggerColor(playbook.trigger.type),
            fontSize: '11px',
            fontWeight: 500,
            textTransform: 'uppercase',
          }}>
            {playbook.trigger.type}
          </span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '12px', lineHeight: 1.6 }}>
          {playbook.description}
        </p>
      </div>
      
      {/* Trigger conditions */}
      {playbook.trigger.conditions && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Trigger Conditions
          </h4>
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
          }}>
            {playbook.trigger.conditions.severity && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Severity: </span>
                <span style={{ color: '#fff', fontSize: '12px' }}>{playbook.trigger.conditions.severity.join(', ')}</span>
              </div>
            )}
            {playbook.trigger.conditions.sources && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Sources: </span>
                <span style={{ color: '#fff', fontSize: '12px', textTransform: 'uppercase' }}>
                  {playbook.trigger.conditions.sources.join(', ')}
                </span>
              </div>
            )}
            {playbook.trigger.conditions.mitreTactics && (
              <div>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>MITRE Tactics: </span>
                <span style={{ color: '#9b59b6', fontSize: '12px' }}>
                  {playbook.trigger.conditions.mitreTactics.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
          Actions Sequence
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {playbook.actions.map((action, index) => (
            <div key={action.id} style={{
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              border: action.requiresApproval ? '1px solid rgba(255, 165, 2, 0.3)' : '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 212, 255, 0.2)',
                  color: '#00d4ff',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {index + 1}
                </span>
                <span style={{ fontSize: '18px' }}>{getActionIcon(action.type)}</span>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>{action.name}</span>
                {action.requiresApproval && (
                  <span style={{
                    marginLeft: 'auto',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 165, 2, 0.15)',
                    color: '#ffa502',
                    fontSize: '10px',
                    fontWeight: 600,
                  }}>
                    🔐 APPROVAL REQUIRED
                  </span>
                )}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginLeft: '36px' }}>
                {action.description}
              </div>
              {action.approvers && action.approvers.length > 0 && (
                <div style={{ marginTop: '8px', marginLeft: '36px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Approvers: </span>
                  <span style={{ color: '#ffa502', fontSize: '11px' }}>{action.approvers.join(', ')}</span>
                </div>
              )}
              {action.timeout && (
                <div style={{ marginTop: '4px', marginLeft: '36px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Timeout: </span>
                  <span style={{ color: '#fff', fontSize: '11px' }}>{action.timeout}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#00d4ff' }}>
            {playbook.executionsLast24h || 0}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Runs 24h</div>
        </div>
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#2ed573' }}>
            {playbook.successRate || 0}%
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Success Rate</div>
        </div>
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>
            {playbook.avgDuration || '-'}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Avg Duration</div>
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
          ⚙️ Edit Playbook
        </button>
        <button
          onClick={() => onExecute(playbook)}
          disabled={!playbook.enabled}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: playbook.enabled ? '#00d4ff' : 'rgba(255, 255, 255, 0.05)',
            color: playbook.enabled ? '#000' : 'rgba(255, 255, 255, 0.3)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: playbook.enabled ? 'pointer' : 'not-allowed',
          }}
        >
          ▶️ Execute Playbook
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Execute Playbook Modal
// ============================================================================

interface ExecuteModalProps {
  playbook: Playbook | null;
  onClose: () => void;
  onConfirm: (targetId: string) => void;
}

const ExecuteModal: React.FC<ExecuteModalProps> = ({ playbook, onClose, onConfirm }) => {
  const [targetId, setTargetId] = useState('');
  const [executing, setExecuting] = useState(false);
  
  if (!playbook) return null;
  
  const handleConfirm = async () => {
    if (!targetId.trim()) return;
    setExecuting(true);
    await onConfirm(targetId);
    setExecuting(false);
  };
  
  const hasApprovalGate = playbook.actions.some(a => a.requiresApproval);
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1001,
    }}>
      <div style={{
        width: '450px',
        backgroundColor: '#1a1a2e',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <h3 style={{ margin: '0 0 20px', color: '#fff', fontSize: '18px' }}>
          Execute Playbook: {playbook.name}
        </h3>
        
        {hasApprovalGate && (
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(255, 165, 2, 0.1)',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 165, 2, 0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffa502', fontSize: '13px' }}>
              <span>🔐</span>
              <span>This playbook requires approval before execution</span>
            </div>
          </div>
        )}
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
            Target Entity ID (User ID, Host ID, etc.)
          </label>
          <input
            type="text"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder="e.g., user-001 or host-002"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              color: '#fff',
              fontSize: '14px',
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase' }}>
            Actions to be executed:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {playbook.actions.map((action, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '6px',
              }}>
                <span>{i + 1}.</span>
                <span style={{ fontSize: '14px' }}>{getActionIcon(action.type)}</span>
                <span style={{ color: '#fff', fontSize: '13px' }}>{action.name}</span>
                {action.requiresApproval && <span style={{ color: '#ffa502', fontSize: '10px' }}>🔐</span>}
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!targetId.trim() || executing}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: hasApprovalGate ? '#ffa502' : '#00d4ff',
              color: '#000',
              fontSize: '14px',
              fontWeight: 600,
              cursor: targetId.trim() && !executing ? 'pointer' : 'not-allowed',
              opacity: !targetId.trim() || executing ? 0.5 : 1,
            }}
          >
            {executing ? 'Executing...' : hasApprovalGate ? 'Submit for Approval' : 'Execute Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const ResponsePlaybooks: React.FC = () => {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [executingPlaybook, setExecutingPlaybook] = useState<Playbook | null>(null);
  const [filterTrigger, setFilterTrigger] = useState<'all' | 'manual' | 'automatic' | 'scheduled'>('all');
  
  useEffect(() => {
    loadPlaybooks();
  }, []);
  
  const loadPlaybooks = async () => {
    setLoading(true);
    try {
      const data = await xdrApi.getPlaybooks();
      setPlaybooks(data);
    } catch (err) {
      console.error('Failed to load playbooks:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleExecute = async (targetId: string) => {
    if (!executingPlaybook) return;
    
    try {
      const execution = await xdrApi.executePlaybook(executingPlaybook.id, targetId);
      console.log('Playbook execution:', execution);
      
      alert(
        execution.status === 'awaiting-approval'
          ? 'Playbook submitted for approval. You will be notified when approved.'
          : 'Playbook execution started successfully!'
      );
      
      setExecutingPlaybook(null);
    } catch (err) {
      console.error('Failed to execute playbook:', err);
      alert('Failed to execute playbook. Please try again.');
    }
  };
  
  const filteredPlaybooks = filterTrigger === 'all'
    ? playbooks
    : playbooks.filter(p => p.trigger.type === filterTrigger);
  
  // Stats
  const enabledCount = playbooks.filter(p => p.enabled).length;
  const autoCount = playbooks.filter(p => p.trigger.type === 'automatic').length;
  const totalExecutions = playbooks.reduce((sum, p) => sum + (p.executionsLast24h || 0), 0);
  
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
        Loading playbooks...
      </div>
    );
  }
  
  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '24px' }}>🎭 Response Playbooks</h2>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            Automated response workflows with approval gates
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
          + Create Playbook
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
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#00d4ff' }}>{playbooks.length}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Total Playbooks</div>
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
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffa502' }}>{autoCount}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Automatic</div>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#fff' }}>{totalExecutions}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Runs 24h</div>
        </div>
      </div>
      
      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['all', 'manual', 'automatic', 'scheduled'] as const).map(trigger => (
          <button
            key={trigger}
            onClick={() => setFilterTrigger(trigger)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: filterTrigger === trigger ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: filterTrigger === trigger ? '#00d4ff' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {trigger === 'all' ? 'All Playbooks' : trigger}
          </button>
        ))}
      </div>
      
      {/* Playbooks grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
        {filteredPlaybooks.map(playbook => (
          <PlaybookCard
            key={playbook.id}
            playbook={playbook}
            onView={setSelectedPlaybook}
            onExecute={setExecutingPlaybook}
          />
        ))}
      </div>
      
      {filteredPlaybooks.length === 0 && (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎭</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            No playbooks match your filter
          </div>
        </div>
      )}
      
      {/* Detail panel */}
      {selectedPlaybook && (
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
            onClick={() => setSelectedPlaybook(null)}
          />
          <PlaybookDetail
            playbook={selectedPlaybook}
            onClose={() => setSelectedPlaybook(null)}
            onExecute={setExecutingPlaybook}
          />
        </>
      )}
      
      {/* Execute modal */}
      {executingPlaybook && (
        <ExecuteModal
          playbook={executingPlaybook}
          onClose={() => setExecutingPlaybook(null)}
          onConfirm={handleExecute}
        />
      )}
    </div>
  );
};

export default ResponsePlaybooks;
