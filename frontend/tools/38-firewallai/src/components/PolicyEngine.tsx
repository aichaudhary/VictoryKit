import React, { useState } from 'react';
import { Lock, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Settings } from 'lucide-react';

interface PolicyEngineProps {
  policies: any[];
  rules: any[];
  onUpdatePolicy: (policyId: string, updates: any) => void;
  onCreatePolicy: (policy: any) => void;
  onDeletePolicy: (policyId: string) => void;
}

const PolicyEngine: React.FC<PolicyEngineProps> = ({
  policies,
  rules,
  onUpdatePolicy,
  onCreatePolicy,
  onDeletePolicy
}) => {
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const PolicyForm: React.FC<{
    policy?: any;
    onSubmit: (policy: any) => void;
    onCancel: () => void;
  }> = ({ policy, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(policy || {
      name: '',
      description: '',
      type: 'access_control',
      rules: [],
      conditions: [],
      actions: [],
      priority: 1,
      enabled: true
    });

    return (
      <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">
          {policy ? 'Edit Policy' : 'Create New Policy'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Policy Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
              placeholder="Enter policy name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Policy Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
            >
              <option value="access_control">Access Control</option>
              <option value="threat_response">Threat Response</option>
              <option value="compliance">Compliance</option>
              <option value="traffic_shaping">Traffic Shaping</option>
              <option value="intrusion_prevention">Intrusion Prevention</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Priority</label>
            <input
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
              min="1"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Associated Rules</label>
            <select
              multiple
              value={formData.rules}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, rules: selected });
              }}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white h-24"
            >
              {rules.map(rule => (
                <option key={rule.id} value={rule.id}>{rule.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-gray-400 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white h-20"
            placeholder="Policy description and purpose"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm text-gray-400 mb-2">Conditions (JSON)</label>
          <textarea
            value={JSON.stringify(formData.conditions, null, 2)}
            onChange={(e) => {
              try {
                const conditions = JSON.parse(e.target.value);
                setFormData({ ...formData, conditions });
              } catch (err) {
                // Invalid JSON, keep as string for now
              }
            }}
            className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white font-mono text-sm h-24"
            placeholder='[{"field": "source_ip", "operator": "in", "value": ["192.168.1.0/24"]}]'
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm text-gray-400 mb-2">Actions (JSON)</label>
          <textarea
            value={JSON.stringify(formData.actions, null, 2)}
            onChange={(e) => {
              try {
                const actions = JSON.parse(e.target.value);
                setFormData({ ...formData, actions });
              } catch (err) {
                // Invalid JSON, keep as string for now
              }
            }}
            className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white font-mono text-sm h-24"
            placeholder='[{"type": "block"}, {"type": "log"}, {"type": "alert", "severity": "high"}]'
          />
        </div>

        <div className="flex items-center justify-between mt-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="rounded border-blue-500/30"
            />
            <span className="text-sm text-gray-400">Enable Policy</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit(formData)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:opacity-90 transition-opacity"
            >
              {policy ? 'Update' : 'Create'} Policy
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Policy Engine</h2>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
            {policies.length} policies
          </span>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Policy
        </button>
      </div>

      {/* Create Policy Form */}
      {showCreateForm && (
        <PolicyForm
          onSubmit={(policy) => {
            if (policy.id) {
              onUpdatePolicy(policy.id, policy);
            } else {
              onCreatePolicy(policy);
            }
            setShowCreateForm(false);
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className={`p-6 rounded-xl border backdrop-blur-sm cursor-pointer transition-all ${
              selectedPolicy?.id === policy.id
                ? 'bg-blue-500/10 border-blue-500/30'
                : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/30'
            }`}
            onClick={() => setSelectedPolicy(policy)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  policy.enabled
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-gray-500/10 border border-gray-500/30'
                }`}>
                  {policy.enabled ? (
                    <ToggleRight className="w-5 h-5 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white">{policy.name}</h3>
                  <p className="text-xs text-gray-400 capitalize">{policy.type.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  #{policy.priority}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
              {policy.description}
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Rules:</span>
                <span className="text-white">{policy.rules?.length || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Conditions:</span>
                <span className="text-white">{policy.conditions?.length || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Actions:</span>
                <span className="text-white">{policy.actions?.length || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdatePolicy(policy.id, { enabled: !policy.enabled });
                  }}
                  className={`p-1 rounded ${
                    policy.enabled ? 'hover:bg-red-500/20' : 'hover:bg-green-500/20'
                  }`}
                >
                  {policy.enabled ? (
                    <ToggleRight className="w-4 h-4 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPolicy(policy);
                  }}
                  className="p-1 hover:bg-blue-500/20 rounded"
                >
                  <Edit className="w-4 h-4 text-blue-400" />
                </button>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePolicy(policy.id);
                }}
                className="p-1 hover:bg-red-500/20 rounded"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        ))}

        {policies.length === 0 && (
          <div className="col-span-full text-center py-12 bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl">
            <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-gray-400 mb-4">No policies configured</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:opacity-90 transition-opacity"
            >
              Create Your First Policy
            </button>
          </div>
        )}
      </div>

      {/* Policy Details Panel */}
      {selectedPolicy && (
        <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Policy Details
            </h3>
            <button
              onClick={() => setSelectedPolicy(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Policy Name</label>
                <p className="text-white font-medium">{selectedPolicy.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Type</label>
                <p className="text-white capitalize">{selectedPolicy.type.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Priority</label>
                <p className="text-white">#{selectedPolicy.priority}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Status</label>
                <p className={`font-medium ${
                  selectedPolicy.enabled ? 'text-green-400' : 'text-red-400'
                }`}>
                  {selectedPolicy.enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Associated Rules</label>
                <p className="text-white">{selectedPolicy.rules?.length || 0} rules</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Conditions</label>
                <p className="text-white">{selectedPolicy.conditions?.length || 0} conditions</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Actions</label>
                <p className="text-white">{selectedPolicy.actions?.length || 0} actions</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Last Modified</label>
                <p className="text-white">
                  {selectedPolicy.updated_at ? new Date(selectedPolicy.updated_at).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm text-gray-400">Description</label>
            <div className="mt-2 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
              <p className="text-sm text-white">{selectedPolicy.description}</p>
            </div>
          </div>

          {selectedPolicy.conditions && selectedPolicy.conditions.length > 0 && (
            <div className="mt-4">
              <label className="text-sm text-gray-400">Conditions</label>
              <div className="mt-2 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(selectedPolicy.conditions, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {selectedPolicy.actions && selectedPolicy.actions.length > 0 && (
            <div className="mt-4">
              <label className="text-sm text-gray-400">Actions</label>
              <div className="mt-2 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(selectedPolicy.actions, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PolicyEngine;