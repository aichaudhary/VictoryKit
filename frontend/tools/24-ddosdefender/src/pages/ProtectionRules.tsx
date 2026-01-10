import React, { useState, useEffect } from 'react';
import { protectionAPI } from '../services/api.ts';
import { ProtectionRule } from '../types/index.ts';
import './ProtectionRules.css';

const ProtectionRules: React.FC = () => {
  const [rules, setRules] = useState<ProtectionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRule, setEditingRule] = useState<ProtectionRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'rate-limit',
    threshold: 1000,
    action: 'block',
    duration: 3600,
    enabled: true,
    conditions: {
      sourceIPs: [] as string[],
      countries: [] as string[],
      userAgents: [] as string[],
      paths: [] as string[]
    }
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const response = await protectionAPI.getAll();
      setRules(response.data.data);
    } catch (error) {
      console.error('Failed to load protection rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      await protectionAPI.create(formData);
      setShowCreateForm(false);
      resetForm();
      loadRules();
    } catch (error) {
      console.error('Failed to create rule:', error);
    }
  };

  const handleUpdateRule = async () => {
    if (!editingRule) return;

    try {
      await protectionAPI.update(editingRule._id, formData);
      setEditingRule(null);
      resetForm();
      loadRules();
    } catch (error) {
      console.error('Failed to update rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await protectionAPI.delete(ruleId);
      loadRules();
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      await protectionAPI.update(ruleId, { enabled });
      loadRules();
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'rate-limit',
      threshold: 1000,
      action: 'block',
      duration: 3600,
      enabled: true,
      conditions: {
        sourceIPs: [],
        countries: [],
        userAgents: [],
        paths: []
      }
    });
  };

  const startEdit = (rule: ProtectionRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      type: rule.type,
      threshold: rule.threshold,
      action: rule.action,
      duration: rule.duration,
      enabled: rule.enabled,
      conditions: rule.conditions
    });
  };

  const addCondition = (type: keyof typeof formData.conditions, value: string) => {
    if (!value.trim()) return;

    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [type]: [...prev.conditions[type], value.trim()]
      }
    }));
  };

  const removeCondition = (type: keyof typeof formData.conditions, index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [type]: prev.conditions[type].filter((_, i) => i !== index)
      }
    }));
  };

  const ruleTypes = [
    { value: 'rate-limit', label: 'Rate Limiting', description: 'Limit requests per time window' },
    { value: 'ip-block', label: 'IP Blocking', description: 'Block specific IP addresses' },
    { value: 'geo-block', label: 'Geo Blocking', description: 'Block traffic from countries' },
    { value: 'ua-block', label: 'User Agent Blocking', description: 'Block specific user agents' },
    { value: 'path-block', label: 'Path Blocking', description: 'Block access to specific paths' },
    { value: 'waf', label: 'WAF Rule', description: 'Web Application Firewall rule' }
  ];

  const actions = [
    { value: 'block', label: 'Block', color: '#ff4757' },
    { value: 'challenge', label: 'Challenge', color: '#ffa502' },
    { value: 'log', label: 'Log Only', color: '#3742fa' },
    { value: 'allow', label: 'Allow', color: '#2ed573' }
  ];

  if (loading) {
    return <div className="loading">Loading protection rules...</div>;
  }

  return (
    <div className="protection-rules">
      <div className="rules-header">
        <h1>Protection Rules</h1>
        <div className="header-actions">
          <div className="stats">
            <span>Total Rules: {rules.length}</span>
            <span>Active: {rules.filter(r => r.enabled).length}</span>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            Create Rule
          </button>
        </div>
      </div>

      <div className="rules-content">
        <div className="rules-list">
          {rules.map((rule) => (
            <div key={rule._id} className="rule-card">
              <div className="rule-header">
                <div className="rule-info">
                  <h3>{rule.name}</h3>
                  <div className="rule-meta">
                    <span className="rule-type">{rule.type.replace('-', ' ').toUpperCase()}</span>
                    <span className={`rule-action action-${rule.action}`}>
                      {rule.action.toUpperCase()}
                    </span>
                    <span className={`rule-status ${rule.enabled ? 'enabled' : 'disabled'}`}>
                      {rule.enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                </div>

                <div className="rule-controls">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => handleToggleRule(rule._id, e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>

                  <button
                    onClick={() => startEdit(rule)}
                    className="btn btn-secondary btn-small"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteRule(rule._id)}
                    className="btn btn-danger btn-small"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="rule-details">
                <div className="rule-threshold">
                  <span className="label">Threshold:</span>
                  <span className="value">{rule.threshold}</span>
                  {rule.type === 'rate-limit' && <span className="unit">req/min</span>}
                </div>

                <div className="rule-duration">
                  <span className="label">Duration:</span>
                  <span className="value">{rule.duration}</span>
                  <span className="unit">seconds</span>
                </div>

                <div className="rule-conditions">
                  {rule.conditions.sourceIPs.length > 0 && (
                    <div className="condition">
                      <span className="label">IPs:</span>
                      <span className="value">{rule.conditions.sourceIPs.join(', ')}</span>
                    </div>
                  )}

                  {rule.conditions.countries.length > 0 && (
                    <div className="condition">
                      <span className="label">Countries:</span>
                      <span className="value">{rule.conditions.countries.join(', ')}</span>
                    </div>
                  )}

                  {rule.conditions.userAgents.length > 0 && (
                    <div className="condition">
                      <span className="label">User Agents:</span>
                      <span className="value">{rule.conditions.userAgents.join(', ')}</span>
                    </div>
                  )}

                  {rule.conditions.paths.length > 0 && (
                    <div className="condition">
                      <span className="label">Paths:</span>
                      <span className="value">{rule.conditions.paths.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rule-stats">
                <div className="stat">
                  <span className="label">Hits:</span>
                  <span className="value">{rule.stats?.hits || 0}</span>
                </div>
                <div className="stat">
                  <span className="label">Blocked:</span>
                  <span className="value">{rule.stats?.blocked || 0}</span>
                </div>
                <div className="stat">
                  <span className="label">Last Hit:</span>
                  <span className="value">
                    {rule.stats?.lastHit ? new Date(rule.stats.lastHit).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {rules.length === 0 && (
            <div className="no-rules">
              <h3>No Protection Rules</h3>
              <p>Create your first rule to start protecting your application</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary"
              >
                Create First Rule
              </button>
            </div>
          )}
        </div>

        {(showCreateForm || editingRule) && (
          <div className="rule-form-overlay">
            <div className="rule-form">
              <div className="form-header">
                <h2>{editingRule ? 'Edit Rule' : 'Create New Rule'}</h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingRule(null);
                    resetForm();
                  }}
                  className="close-btn"
                >
                  ×
                </button>
              </div>

              <div className="form-content">
                <div className="form-group">
                  <label>Rule Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter rule name"
                  />
                </div>

                <div className="form-group">
                  <label>Rule Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  >
                    {ruleTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Threshold</label>
                    <input
                      type="number"
                      value={formData.threshold}
                      onChange={(e) => setFormData(prev => ({ ...prev, threshold: Number(e.target.value) }))}
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Action</label>
                    <select
                      value={formData.action}
                      onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
                    >
                      {actions.map(action => (
                        <option key={action.value} value={action.value}>
                          {action.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Duration (seconds)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      min="1"
                    />
                  </div>
                </div>

                <div className="conditions-section">
                  <h3>Conditions</h3>

                  <div className="condition-group">
                    <label>Source IPs</label>
                    <div className="condition-input">
                      <input
                        type="text"
                        placeholder="192.168.1.1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addCondition('sourceIPs', (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addCondition('sourceIPs', input.value);
                          input.value = '';
                        }}
                        className="btn btn-small"
                      >
                        Add
                      </button>
                    </div>
                    <div className="condition-tags">
                      {formData.conditions.sourceIPs.map((ip, index) => (
                        <span key={index} className="tag">
                          {ip}
                          <button onClick={() => removeCondition('sourceIPs', index)}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="condition-group">
                    <label>Countries</label>
                    <div className="condition-input">
                      <input
                        type="text"
                        placeholder="US, CN, RU"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addCondition('countries', (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addCondition('countries', input.value);
                          input.value = '';
                        }}
                        className="btn btn-small"
                      >
                        Add
                      </button>
                    </div>
                    <div className="condition-tags">
                      {formData.conditions.countries.map((country, index) => (
                        <span key={index} className="tag">
                          {country}
                          <button onClick={() => removeCondition('countries', index)}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="condition-group">
                    <label>User Agents</label>
                    <div className="condition-input">
                      <input
                        type="text"
                        placeholder="Bot, Crawler"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addCondition('userAgents', (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addCondition('userAgents', input.value);
                          input.value = '';
                        }}
                        className="btn btn-small"
                      >
                        Add
                      </button>
                    </div>
                    <div className="condition-tags">
                      {formData.conditions.userAgents.map((ua, index) => (
                        <span key={index} className="tag">
                          {ua}
                          <button onClick={() => removeCondition('userAgents', index)}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="condition-group">
                    <label>Paths</label>
                    <div className="condition-input">
                      <input
                        type="text"
                        placeholder="/api/login, /admin/*"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addCondition('paths', (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addCondition('paths', input.value);
                          input.value = '';
                        }}
                        className="btn btn-small"
                      >
                        Add
                      </button>
                    </div>
                    <div className="condition-tags">
                      {formData.conditions.paths.map((path, index) => (
                        <span key={index} className="tag">
                          {path}
                          <button onClick={() => removeCondition('paths', index)}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    onClick={editingRule ? handleUpdateRule : handleCreateRule}
                    className="btn btn-primary"
                  >
                    {editingRule ? 'Update Rule' : 'Create Rule'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingRule(null);
                      resetForm();
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProtectionRules;