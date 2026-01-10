import React, { useState, useEffect } from 'react';
import { attackAPI } from '../services/api.ts';
import { Attack } from '../types/index.ts';
import wsService from '../services/websocket.ts';
import './AttackDetection.css';

const AttackDetection: React.FC = () => {
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [filteredAttacks, setFilteredAttacks] = useState<Attack[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all',
    type: 'all',
    severity: 'all'
  });
  const [selectedAttack, setSelectedAttack] = useState<Attack | null>(null);

  useEffect(() => {
    loadAttacks();
    setupWebSocket();

    return () => {
      wsService.disconnect();
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [attacks, filter]);

  const loadAttacks = async () => {
    try {
      const response = await attackAPI.getAll({ limit: 100 });
      setAttacks(response.data.data);
    } catch (error) {
      console.error('Failed to load attacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    wsService.connect();
    wsService.on('attack_detected', (attack: Attack) => {
      setAttacks(prev => [attack, ...prev]);
    });

    wsService.on('attack_mitigated', (data) => {
      setAttacks(prev =>
        prev.map(attack =>
          attack._id === data.attackId
            ? { ...attack, status: 'mitigated', mitigatedAt: new Date() }
            : attack
        )
      );
    });
  };

  const applyFilters = () => {
    let filtered = attacks;

    if (filter.status !== 'all') {
      filtered = filtered.filter(attack => attack.status === filter.status);
    }

    if (filter.type !== 'all') {
      filtered = filtered.filter(attack => attack.type === filter.type);
    }

    if (filter.severity !== 'all') {
      filtered = filtered.filter(attack => attack.severity === filter.severity);
    }

    setFilteredAttacks(filtered);
  };

  const handleMitigate = async (attackId: string) => {
    try {
      await attackAPI.updateStatus(attackId, 'mitigated', {
        method: 'auto',
        provider: 'ddosdefender',
        effectiveness: 95
      });
      // Update local state
      setAttacks(prev =>
        prev.map(attack =>
          attack._id === attackId
            ? { ...attack, status: 'mitigated', mitigatedAt: new Date() }
            : attack
        )
      );
    } catch (error) {
      console.error('Failed to mitigate attack:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ff4757';
      case 'high': return '#ffa502';
      case 'medium': return '#3742fa';
      case 'low': return '#2ed573';
      default: return '#888';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#ff4757';
      case 'mitigated': return '#00d4aa';
      case 'blocked': return '#ffa502';
      default: return '#888';
    }
  };

  if (loading) {
    return <div className="loading">Loading attack data...</div>;
  }

  return (
    <div className="attack-detection">
      <div className="detection-header">
        <h1>Attack Detection</h1>
        <div className="attack-summary">
          <div className="summary-item">
            <span className="label">Total Attacks:</span>
            <span className="value">{attacks.length}</span>
          </div>
          <div className="summary-item">
            <span className="label">Active:</span>
            <span className="value active">{attacks.filter(a => a.status === 'active').length}</span>
          </div>
          <div className="summary-item">
            <span className="label">Mitigated:</span>
            <span className="value mitigated">{attacks.filter(a => a.status === 'mitigated').length}</span>
          </div>
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            className="form-input"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="mitigated">Mitigated</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Type:</label>
          <select
            value={filter.type}
            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
            className="form-input"
          >
            <option value="all">All Types</option>
            <option value="volumetric">Volumetric</option>
            <option value="protocol">Protocol</option>
            <option value="application">Application</option>
            <option value="amplification">Amplification</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Severity:</label>
          <select
            value={filter.severity}
            onChange={(e) => setFilter(prev => ({ ...prev, severity: e.target.value }))}
            className="form-input"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="attacks-container">
        <div className="attacks-table">
          <div className="table-header">
            <div>Type</div>
            <div>Target</div>
            <div>Source</div>
            <div>Severity</div>
            <div>Bandwidth</div>
            <div>Packets</div>
            <div>Status</div>
            <div>Detected</div>
            <div>Actions</div>
          </div>

          {filteredAttacks.map((attack) => (
            <div
              key={attack._id}
              className={`table-row ${selectedAttack?._id === attack._id ? 'selected' : ''}`}
              onClick={() => setSelectedAttack(attack)}
            >
              <div className="attack-type">
                <span className="type-badge">{attack.type.toUpperCase()}</span>
                <span className="sub-type">{attack.subType}</span>
              </div>

              <div className="target">
                {attack.target.ip}:{attack.target.port}
                {attack.target.domain && <div className="domain">{attack.target.domain}</div>}
              </div>

              <div className="source">
                <div>{attack.source.ips.length} IPs</div>
                <div className="countries">{attack.source.countries.slice(0, 3).join(', ')}</div>
              </div>

              <div className="severity">
                <span
                  className="severity-badge"
                  style={{ backgroundColor: getSeverityColor(attack.severity) }}
                >
                  {attack.severity.toUpperCase()}
                </span>
              </div>

              <div className="metrics">
                {attack.metrics.bandwidth.toFixed(2)} Mbps
              </div>

              <div className="metrics">
                {attack.metrics.packets.toLocaleString()}/s
              </div>

              <div className="status">
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(attack.status) }}
                >
                  {attack.status.toUpperCase()}
                </span>
              </div>

              <div className="timestamp">
                {new Date(attack.detectedAt).toLocaleString()}
              </div>

              <div className="actions">
                {attack.status === 'active' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMitigate(attack._id);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    Mitigate
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAttack(attack);
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedAttack && (
          <div className="attack-details">
            <h3>Attack Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Attack ID:</label>
                <span>{selectedAttack.attackId}</span>
              </div>

              <div className="detail-item">
                <label>Type:</label>
                <span>{selectedAttack.type} - {selectedAttack.subType}</span>
              </div>

              <div className="detail-item">
                <label>Target:</label>
                <span>{selectedAttack.target.ip}:{selectedAttack.target.port}</span>
              </div>

              <div className="detail-item">
                <label>Severity:</label>
                <span className="severity-badge" style={{ backgroundColor: getSeverityColor(selectedAttack.severity) }}>
                  {selectedAttack.severity.toUpperCase()}
                </span>
              </div>

              <div className="detail-item">
                <label>Bandwidth:</label>
                <span>{selectedAttack.metrics.bandwidth} Mbps</span>
              </div>

              <div className="detail-item">
                <label>Packets:</label>
                <span>{selectedAttack.metrics.packets}/s</span>
              </div>

              <div className="detail-item">
                <label>Duration:</label>
                <span>{selectedAttack.metrics.duration}s</span>
              </div>

              <div className="detail-item">
                <label>Status:</label>
                <span className="status-badge" style={{ backgroundColor: getStatusColor(selectedAttack.status) }}>
                  {selectedAttack.status.toUpperCase()}
                </span>
              </div>

              <div className="detail-item full-width">
                <label>Source IPs:</label>
                <div className="ip-list">
                  {selectedAttack.source.ips.map((ip, index) => (
                    <span key={index} className="ip-tag">{ip}</span>
                  ))}
                </div>
              </div>

              <div className="detail-item full-width">
                <label>Source Countries:</label>
                <div className="country-list">
                  {selectedAttack.source.countries.map((country, index) => (
                    <span key={index} className="country-tag">{country}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttackDetection;