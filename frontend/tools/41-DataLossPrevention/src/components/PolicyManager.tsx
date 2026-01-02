import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Save, X } from 'lucide-react';
import { dlpAPI } from '../services/dlpAPI';
import { DLPPolicy, PolicyAction, PolicyScopeType } from '../types';
import { DATA_TYPES, SEVERITY_STYLES } from '../constants';

const PolicyManager: React.FC = () => {
  const [policies, setPolicies] = useState<DLPPolicy[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Partial<DLPPolicy> | null>(null);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const data = await dlpAPI.policies.list();
      setPolicies(data);
    } catch (error) {
      // Load sample policies
      setPolicies([
        {
          id: '1',
          name: 'PCI-DSS Compliance',
          description: 'Detect and protect credit card data per PCI-DSS requirements',
          enabled: true,
          severity: 'critical',
          dataTypes: ['credit_card', 'cvv', 'bank_account'],
          patterns: ['/\\b(?:\\d{4}[- ]?){3}\\d{4}\\b/'],
          actions: ['block', 'alert', 'log'],
          scope: ['email', 'cloud', 'endpoint'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'HIPAA Protected Health Information',
          description: 'Protect patient health information and medical records',
          enabled: true,
          severity: 'critical',
          dataTypes: ['medical_record', 'ssn', 'dob'],
          patterns: ['/\\b\\d{3}-\\d{2}-\\d{4}\\b/'],
          actions: ['encrypt', 'alert'],
          scope: ['all'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'GDPR Personal Data',
          description: 'European personal data protection compliance',
          enabled: true,
          severity: 'high',
          dataTypes: ['email', 'phone', 'address', 'passport'],
          patterns: [],
          actions: ['alert', 'log'],
          scope: ['email', 'cloud'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Intellectual Property',
          description: 'Protect confidential business documents and source code',
          enabled: true,
          severity: 'high',
          dataTypes: ['source_code', 'api_key', 'private_key'],
          patterns: ['/CONFIDENTIAL/i', '/SECRET/i'],
          actions: ['block', 'alert'],
          scope: ['cloud', 'endpoint'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '5',
          name: 'Financial Data',
          description: 'Monitor and protect financial records and transactions',
          enabled: false,
          severity: 'medium',
          dataTypes: ['bank_account', 'routing_number', 'iban'],
          patterns: [],
          actions: ['log', 'alert'] as const,
          scope: ['email'] as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ] as DLPPolicy[]);
    }
  };

  const togglePolicy = async (policy: DLPPolicy) => {
    const updated = { ...policy, enabled: !policy.enabled };
    setPolicies(prev => prev.map(p => p.id === policy.id ? updated : p));
  };

  const deletePolicy = async (id: string) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      setPolicies(prev => prev.filter(p => p.id !== id));
    }
  };

  const openEditor = (policy?: DLPPolicy) => {
    setEditingPolicy(policy || {
      name: '',
      description: '',
      enabled: true,
      severity: 'medium',
      dataTypes: [],
      patterns: [],
      actions: ['alert', 'log'],
      scope: ['all'],
    });
    setShowEditor(true);
  };

  const savePolicy = async () => {
    if (!editingPolicy?.name) return;
    
    const policy: DLPPolicy = {
      ...(editingPolicy as DLPPolicy),
      id: editingPolicy.id || String(Date.now()),
      createdAt: editingPolicy.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingPolicy.id) {
      setPolicies(prev => prev.map(p => p.id === policy.id ? policy : p));
    } else {
      setPolicies(prev => [...prev, policy]);
    }
    setShowEditor(false);
    setEditingPolicy(null);
  };

  const activePolicies = policies.filter(p => p.enabled);
  const criticalPolicies = policies.filter(p => p.severity === 'critical' && p.enabled);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4">
          <p className="text-sm text-slate-400">Total Policies</p>
          <p className="text-2xl font-bold mt-1">{policies.length}</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4">
          <p className="text-sm text-slate-400">Active</p>
          <p className="text-2xl font-bold mt-1 text-green-400">{activePolicies.length}</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4">
          <p className="text-sm text-slate-400">Critical Rules</p>
          <p className="text-2xl font-bold mt-1 text-red-400">{criticalPolicies.length}</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4">
          <p className="text-sm text-slate-400">Data Types Protected</p>
          <p className="text-2xl font-bold mt-1 text-purple-400">
            {new Set(policies.flatMap(p => p.dataTypes)).size}
          </p>
        </div>
      </div>

      {/* Policy List */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            DLP Policies
          </h3>
          <button
            onClick={() => openEditor()}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Policy
          </button>
        </div>

        <div className="space-y-3">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className={`p-4 rounded-xl border transition-all ${
                policy.enabled
                  ? 'bg-slate-800/50 border-purple-500/30'
                  : 'bg-slate-900/30 border-slate-700/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{policy.name}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded ${SEVERITY_STYLES[policy.severity]}`}>
                      {policy.severity}
                    </span>
                    {!policy.enabled && (
                      <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-400 rounded">Disabled</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{policy.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {policy.dataTypes.slice(0, 5).map((type, i) => (
                      <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                        {DATA_TYPES.find(d => d.id === type)?.name || type}
                      </span>
                    ))}
                    {policy.dataTypes.length > 5 && (
                      <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded">
                        +{policy.dataTypes.length - 5} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Scope: {policy.scope.join(', ')}</span>
                    <span>Actions: {policy.actions.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => togglePolicy(policy)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {policy.enabled ? (
                      <ToggleRight className="w-6 h-6 text-green-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-500" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditor(policy)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletePolicy(policy.id)}
                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Policy Editor Modal */}
      {showEditor && editingPolicy && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-purple-500/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold">
                {editingPolicy.id ? 'Edit Policy' : 'Create Policy'}
              </h3>
              <button onClick={() => setShowEditor(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Policy Name</label>
                <input
                  type="text"
                  value={editingPolicy.name || ''}
                  onChange={e => setEditingPolicy({ ...editingPolicy, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., PCI-DSS Compliance"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Description</label>
                <textarea
                  value={editingPolicy.description || ''}
                  onChange={e => setEditingPolicy({ ...editingPolicy, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-purple-500 focus:outline-none h-20 resize-none"
                  placeholder="Describe what this policy protects..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Severity</label>
                  <select
                    value={editingPolicy.severity || 'medium'}
                    onChange={e => setEditingPolicy({ ...editingPolicy, severity: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Status</label>
                  <select
                    value={editingPolicy.enabled ? 'enabled' : 'disabled'}
                    onChange={e => setEditingPolicy({ ...editingPolicy, enabled: e.target.value === 'enabled' })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Data Types to Detect</label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-800 border border-slate-700 rounded-lg max-h-40 overflow-y-auto">
                  {DATA_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => {
                        const current = editingPolicy.dataTypes || [];
                        const updated = current.includes(type.id)
                          ? current.filter(t => t !== type.id)
                          : [...current, type.id];
                        setEditingPolicy({ ...editingPolicy, dataTypes: updated });
                      }}
                      className={`px-3 py-1 rounded text-sm transition-all ${
                        editingPolicy.dataTypes?.includes(type.id)
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Actions</label>
                <div className="flex flex-wrap gap-2">
                  {(['block', 'encrypt', 'alert', 'log', 'quarantine'] as PolicyAction[]).map(action => (
                    <button
                      key={action}
                      onClick={() => {
                        const current = editingPolicy.actions || [];
                        const updated = current.includes(action)
                          ? current.filter(a => a !== action)
                          : [...current, action];
                        setEditingPolicy({ ...editingPolicy, actions: updated });
                      }}
                      className={`px-3 py-1 rounded text-sm capitalize transition-all ${
                        editingPolicy.actions?.includes(action)
                          ? 'bg-pink-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Scope</label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'email', 'cloud', 'endpoint', 'web'] as PolicyScopeType[]).map(scope => (
                    <button
                      key={scope}
                      onClick={() => {
                        const current = editingPolicy.scope || [];
                        const updated = current.includes(scope)
                          ? current.filter(s => s !== scope)
                          : [...current, scope];
                        setEditingPolicy({ ...editingPolicy, scope: updated });
                      }}
                      className={`px-3 py-1 rounded text-sm capitalize transition-all ${
                        editingPolicy.scope?.includes(scope)
                          ? 'bg-cyan-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {scope}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700">
              <button
                onClick={() => setShowEditor(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={savePolicy}
                disabled={!editingPolicy.name}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingPolicy.id ? 'Update' : 'Create'} Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyManager;
