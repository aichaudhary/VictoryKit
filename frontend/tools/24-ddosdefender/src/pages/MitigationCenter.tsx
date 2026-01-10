import React, { useState, useEffect } from 'react';
import { attackAPI, protectionAPI } from '../services/api.ts';
import { Attack, ProtectionRule } from '../types/index.ts';
import './MitigationCenter.css';

const MitigationCenter: React.FC = () => {
  const [activeAttacks, setActiveAttacks] = useState<Attack[]>([]);
  const [protectionRules, setProtectionRules] = useState<ProtectionRule[]>([]);
  const [selectedAttack, setSelectedAttack] = useState<Attack | null>(null);
  const [loading, setLoading] = useState(true);
  const [mitigationInProgress, setMitigationInProgress] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [attacksRes, rulesRes] = await Promise.all([
        attackAPI.getAll({ status: 'active', limit: 50 }),
        protectionAPI.getAll()
      ]);

      setActiveAttacks(attacksRes.data.data);
      setProtectionRules(rulesRes.data.data);
    } catch (error) {
      console.error('Failed to load mitigation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMitigateAttack = async (attackId: string, method: string) => {
    setMitigationInProgress(attackId);
    try {
      const mitigation = {
        method,
        provider: getProviderForMethod(method),
        effectiveness: getEffectivenessForMethod(method),
        timestamp: new Date()
      };

      await attackAPI.updateStatus(attackId, 'mitigated', mitigation);

      // Update local state
      setActiveAttacks(prev =>
        prev.map(attack =>
          attack._id === attackId
            ? { ...attack, status: 'mitigated', mitigatedAt: new Date(), mitigation }
            : attack
        )
      );

      setSelectedAttack(null);
    } catch (error) {
      console.error('Failed to mitigate attack:', error);
    } finally {
      setMitigationInProgress(null);
    }
  };

  const getProviderForMethod = (method: string): string => {
    const providers: { [key: string]: string } = {
      'rate-limit': 'ddosdefender',
      'ip-block': 'ddosdefender',
      'geo-block': 'cloudflare',
      'cloudflare': 'cloudflare',
      'akamai': 'akamai',
      'aws-shield': 'aws',
      'azure-ddos': 'azure'
    };
    return providers[method] || 'ddosdefender';
  };

  const getEffectivenessForMethod = (method: string): number => {
    const effectiveness: { [key: string]: number } = {
      'rate-limit': 85,
      'ip-block': 95,
      'geo-block': 90,
      'cloudflare': 98,
      'akamai': 97,
      'aws-shield': 96,
      'azure-ddos': 95
    };
    return effectiveness[method] || 85;
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

  const mitigationMethods = [
    { id: 'rate-limit', name: 'Rate Limiting', description: 'Limit request rate from attacking IPs' },
    { id: 'ip-block', name: 'IP Blocking', description: 'Block specific attacking IP addresses' },
    { id: 'geo-block', name: 'Geo Blocking', description: 'Block traffic from specific countries' },
    { id: 'cloudflare', name: 'Cloudflare DDoS Protection', description: 'Enable Cloudflare DDoS mitigation' },
    { id: 'akamai', name: 'Akamai Kona', description: 'Deploy Akamai DDoS protection rules' },
    { id: 'aws-shield', name: 'AWS Shield Advanced', description: 'Activate AWS Shield Advanced protection' },
    { id: 'azure-ddos', name: 'Azure DDoS Protection', description: 'Enable Azure DDoS protection' }
  ];

  if (loading) {
    return <div className="loading">Loading mitigation center...</div>;
  }

  return (
    <div className="mitigation-center">
      <div className="center-header">
        <h1>Mitigation Center</h1>
        <div className="stats">
          <div className="stat">
            <span className="label">Active Attacks:</span>
            <span className="value">{activeAttacks.length}</span>
          </div>
          <div className="stat">
            <span className="label">Protection Rules:</span>
            <span className="value">{protectionRules.filter(r => r.enabled).length}</span>
          </div>
        </div>
      </div>

      <div className="mitigation-content">
        <div className="attacks-panel">
          <h2>Active Attacks</h2>
          <div className="attacks-list">
            {activeAttacks.map((attack) => (
              <div
                key={attack._id}
                className={`attack-item ${selectedAttack?._id === attack._id ? 'selected' : ''}`}
                onClick={() => setSelectedAttack(attack)}
              >
                <div className="attack-header">
                  <div className="attack-type">
                    <span className="type-badge">{attack.type.toUpperCase()}</span>
                    <span className="severity-badge" style={{ backgroundColor: getSeverityColor(attack.severity) }}>
                      {attack.severity}
                    </span>
                  </div>
                  <div className="attack-target">
                    {attack.target.ip}:{attack.target.port}
                  </div>
                </div>

                <div className="attack-metrics">
                  <div className="metric">
                    <span className="label">Bandwidth:</span>
                    <span className="value">{attack.metrics.bandwidth.toFixed(2)} Mbps</span>
                  </div>
                  <div className="metric">
                    <span className="label">Packets:</span>
                    <span className="value">{attack.metrics.packets.toLocaleString()}/s</span>
                  </div>
                  <div className="metric">
                    <span className="label">Duration:</span>
                    <span className="value">{attack.metrics.duration}s</span>
                  </div>
                </div>

                <div className="attack-sources">
                  <div className="source-count">
                    {attack.source.ips.length} attacking IPs
                  </div>
                  <div className="source-countries">
                    From: {attack.source.countries.slice(0, 3).join(', ')}
                  </div>
                </div>

                <div className="attack-time">
                  Detected: {new Date(attack.detectedAt).toLocaleString()}
                </div>
              </div>
            ))}

            {activeAttacks.length === 0 && (
              <div className="no-attacks">
                <h3>No Active Attacks</h3>
                <p>All systems operating normally</p>
              </div>
            )}
          </div>
        </div>

        {selectedAttack && (
          <div className="mitigation-panel">
            <h2>Mitigation Actions</h2>
            <div className="attack-summary">
              <h3>Attack Summary</h3>
              <div className="summary-details">
                <div className="detail">
                  <span className="label">Type:</span>
                  <span className="value">{selectedAttack.type} - {selectedAttack.subType}</span>
                </div>
                <div className="detail">
                  <span className="label">Target:</span>
                  <span className="value">{selectedAttack.target.ip}:{selectedAttack.target.port}</span>
                </div>
                <div className="detail">
                  <span className="label">Severity:</span>
                  <span className="value severity" style={{ color: getSeverityColor(selectedAttack.severity) }}>
                    {selectedAttack.severity.toUpperCase()}
                  </span>
                </div>
                <div className="detail">
                  <span className="label">Bandwidth:</span>
                  <span className="value">{selectedAttack.metrics.bandwidth} Mbps</span>
                </div>
              </div>
            </div>

            <div className="mitigation-methods">
              <h3>Available Mitigation Methods</h3>
              <div className="methods-grid">
                {mitigationMethods.map((method) => (
                  <div key={method.id} className="method-card">
                    <div className="method-header">
                      <h4>{method.name}</h4>
                      <span className="effectiveness">
                        {getEffectivenessForMethod(method.id)}% effective
                      </span>
                    </div>
                    <p className="method-description">{method.description}</p>
                    <button
                      onClick={() => handleMitigateAttack(selectedAttack._id, method.id)}
                      disabled={mitigationInProgress === selectedAttack._id}
                      className="btn btn-primary"
                    >
                      {mitigationInProgress === selectedAttack._id ? 'Mitigating...' : 'Apply Mitigation'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="actions-grid">
                <button
                  onClick={() => handleMitigateAttack(selectedAttack._id, 'auto')}
                  disabled={mitigationInProgress === selectedAttack._id}
                  className="btn btn-secondary"
                >
                  Auto Mitigate
                </button>
                <button className="btn btn-secondary">
                  Add to Blocklist
                </button>
                <button className="btn btn-secondary">
                  Create Rule
                </button>
                <button className="btn btn-danger">
                  Emergency Block All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MitigationCenter;