/**
 * Visual Policy Builder Component
 * Drag-and-drop style IF/THEN policy rule creation
 */

import React, { useState } from 'react';
import type { Policy, PolicyRule, PolicyCondition } from '../types/iam.types';
import { mockPolicies, mockResources, mockRoles } from '../api/iam.api';

interface DraftRule {
  id: string;
  conditions: PolicyCondition[];
  effect: 'allow' | 'deny';
  actions: string[];
  resources: string[];
}

const PolicyBuilder: React.FC = () => {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [draftRules, setDraftRules] = useState<DraftRule[]>([]);
  const [newPolicyName, setNewPolicyName] = useState('');
  const [newPolicyDescription, setNewPolicyDescription] = useState('');

  const conditionTypes = [
    { type: 'role', label: 'User Role', icon: '👤' },
    { type: 'department', label: 'Department', icon: '🏢' },
    { type: 'time', label: 'Time of Day', icon: '🕐' },
    { type: 'mfa', label: 'MFA Status', icon: '🔐' },
    { type: 'ip', label: 'IP Address', icon: '🌐' },
    { type: 'risk', label: 'Risk Score', icon: '⚠️' },
    { type: 'location', label: 'Location', icon: '📍' },
  ];

  const operators = [
    { value: 'equals', label: '=' },
    { value: 'not_equals', label: '≠' },
    { value: 'in', label: 'in' },
    { value: 'not_in', label: 'not in' },
    { value: 'greater_than', label: '>' },
    { value: 'less_than', label: '<' },
    { value: 'contains', label: 'contains' },
  ];

  const actions = [
    'read', 'write', 'delete', 'execute', 'deploy', 'approve', 'admin'
  ];

  const addRule = () => {
    setDraftRules([
      ...draftRules,
      {
        id: `rule-${Date.now()}`,
        conditions: [],
        effect: 'allow',
        actions: [],
        resources: [],
      }
    ]);
  };

  const updateRule = (ruleId: string, updates: Partial<DraftRule>) => {
    setDraftRules(draftRules.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  const addCondition = (ruleId: string) => {
    setDraftRules(draftRules.map(rule => {
      if (rule.id === ruleId) {
        return {
          ...rule,
          conditions: [
            ...rule.conditions,
            { attribute: 'role', operator: 'equals', value: '' }
          ]
        };
      }
      return rule;
    }));
  };

  const updateCondition = (ruleId: string, condIndex: number, updates: Partial<PolicyCondition>) => {
    setDraftRules(draftRules.map(rule => {
      if (rule.id === ruleId) {
        const newConditions = [...rule.conditions];
        newConditions[condIndex] = { ...newConditions[condIndex], ...updates };
        return { ...rule, conditions: newConditions };
      }
      return rule;
    }));
  };

  const removeCondition = (ruleId: string, condIndex: number) => {
    setDraftRules(draftRules.map(rule => {
      if (rule.id === ruleId) {
        return {
          ...rule,
          conditions: rule.conditions.filter((_, i) => i !== condIndex)
        };
      }
      return rule;
    }));
  };

  const removeRule = (ruleId: string) => {
    setDraftRules(draftRules.filter(r => r.id !== ruleId));
  };

  const RuleCard: React.FC<{ rule: DraftRule; index: number }> = ({ rule, index }) => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
      {/* Rule Header */}
      <div className={`p-4 flex items-center justify-between ${
        rule.effect === 'allow' ? 'bg-green-900/20' : 'bg-red-900/20'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-lg">{rule.effect === 'allow' ? '✅' : '🚫'}</span>
          <h4 className="font-semibold text-white">Rule {index + 1}</h4>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={rule.effect}
            onChange={(e) => updateRule(rule.id, { effect: e.target.value as 'allow' | 'deny' })}
            className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
          >
            <option value="allow">ALLOW</option>
            <option value="deny">DENY</option>
          </select>
          <button
            onClick={() => removeRule(rule.id)}
            className="p-1 text-red-400 hover:text-red-300 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* IF Section - Conditions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm font-semibold">IF</span>
            <span className="text-sm text-gray-400">All conditions are true</span>
          </div>
          
          <div className="space-y-2 ml-4">
            {rule.conditions.map((cond, condIndex) => (
              <div key={condIndex} className="flex items-center gap-2 flex-wrap">
                {condIndex > 0 && (
                  <span className="text-yellow-400 text-sm font-semibold">AND</span>
                )}
                <select
                  value={cond.attribute}
                  onChange={(e) => updateCondition(rule.id, condIndex, { attribute: e.target.value })}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  {conditionTypes.map(ct => (
                    <option key={ct.type} value={ct.type}>{ct.icon} {ct.label}</option>
                  ))}
                </select>
                <select
                  value={cond.operator}
                  onChange={(e) => updateCondition(rule.id, condIndex, { operator: e.target.value as PolicyCondition['operator'] })}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={cond.value as string}
                  onChange={(e) => updateCondition(rule.id, condIndex, { value: e.target.value })}
                  placeholder="value"
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-cyan-500 w-40"
                />
                <button
                  onClick={() => removeCondition(rule.id, condIndex)}
                  className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => addCondition(rule.id)}
              className="px-3 py-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <span>+</span> Add Condition
            </button>
          </div>
        </div>

        {/* THEN Section - Actions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm font-semibold">THEN</span>
            <span className={`text-sm ${rule.effect === 'allow' ? 'text-green-400' : 'text-red-400'}`}>
              {rule.effect === 'allow' ? 'Allow' : 'Deny'} these actions
            </span>
          </div>
          
          <div className="ml-4 flex flex-wrap gap-2">
            {actions.map(action => (
              <button
                key={action}
                onClick={() => {
                  const newActions = rule.actions.includes(action)
                    ? rule.actions.filter(a => a !== action)
                    : [...rule.actions, action];
                  updateRule(rule.id, { actions: newActions });
                }}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  rule.actions.includes(action)
                    ? rule.effect === 'allow' 
                      ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                      : 'bg-red-500/30 text-red-400 border border-red-500/50'
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                }`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* ON Section - Resources */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-sm font-semibold">ON</span>
            <span className="text-sm text-gray-400">These resources</span>
          </div>
          
          <div className="ml-4 flex flex-wrap gap-2">
            {mockResources.map(resource => (
              <button
                key={resource.id}
                onClick={() => {
                  const newResources = rule.resources.includes(resource.id)
                    ? rule.resources.filter(r => r !== resource.id)
                    : [...rule.resources, resource.id];
                  updateRule(rule.id, { resources: newResources });
                }}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  rule.resources.includes(resource.id)
                    ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-500/50'
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                }`}
              >
                {resource.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rule Preview */}
      <div className="p-4 bg-gray-800/50 border-t border-gray-700">
        <p className="text-xs text-gray-500 mb-1">Rule Preview</p>
        <p className="text-sm text-gray-300 font-mono">
          <span className="text-purple-400">IF</span>{' '}
          {rule.conditions.length > 0 
            ? rule.conditions.map((c, i) => (
                <span key={i}>
                  {i > 0 && <span className="text-yellow-400"> AND </span>}
                  <span className="text-gray-400">{c.attribute}</span>
                  <span className="text-blue-400"> {c.operator} </span>
                  <span className="text-green-400">"{c.value}"</span>
                </span>
              ))
            : <span className="text-gray-500">(no conditions)</span>
          }
          {' '}<span className="text-blue-400">THEN</span>{' '}
          <span className={rule.effect === 'allow' ? 'text-green-400' : 'text-red-400'}>
            {rule.effect.toUpperCase()}
          </span>{' '}
          <span className="text-cyan-400">[{rule.actions.join(', ') || 'no actions'}]</span>
          {' '}<span className="text-orange-400">ON</span>{' '}
          <span className="text-gray-400">[{rule.resources.join(', ') || 'no resources'}]</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/20">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <span className="text-2xl">🏗️</span>
          Visual Policy Builder
        </h2>
        <p className="text-gray-400">
          Create access policies using IF/THEN rules. Build complex conditions without writing code.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Existing Policies */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Policies</h3>
            <button
              onClick={() => {
                setIsCreatingNew(true);
                setSelectedPolicy(null);
                setDraftRules([]);
              }}
              className="px-3 py-1 text-sm bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 transition-colors"
            >
              + New
            </button>
          </div>
          
          <div className="space-y-2">
            {mockPolicies.map(policy => (
              <button
                key={policy.id}
                onClick={() => {
                  setSelectedPolicy(policy);
                  setIsCreatingNew(false);
                  setDraftRules([]);
                }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedPolicy?.id === policy.id 
                    ? 'bg-cyan-500/20 border border-cyan-500/50' 
                    : 'bg-gray-900/50 hover:bg-gray-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${policy.enabled ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span className="text-white font-medium text-sm">{policy.name}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{policy.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">{policy.rules.length} rules</span>
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    policy.priority < 50 ? 'bg-red-500/20 text-red-400' :
                    policy.priority < 100 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    P{policy.priority}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Policy Editor */}
        <div className="lg:col-span-3 space-y-6">
          {isCreatingNew ? (
            <>
              {/* New Policy Form */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Create New Policy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Policy Name</label>
                    <input
                      type="text"
                      value={newPolicyName}
                      onChange={(e) => setNewPolicyName(e.target.value)}
                      placeholder="e.g., Production Access Control"
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                    <input
                      type="text"
                      value={newPolicyDescription}
                      onChange={(e) => setNewPolicyDescription(e.target.value)}
                      placeholder="Brief description of the policy"
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Rules Builder */}
              <div className="space-y-4">
                {draftRules.map((rule, index) => (
                  <RuleCard key={rule.id} rule={rule} index={index} />
                ))}
                
                <button
                  onClick={addRule}
                  className="w-full py-4 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:border-cyan-500 hover:text-cyan-400 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-xl">+</span> Add Rule
                </button>
              </div>

              {/* Save Button */}
              {draftRules.length > 0 && (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setIsCreatingNew(false);
                      setDraftRules([]);
                    }}
                    className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all"
                  >
                    Save Policy
                  </button>
                </div>
              )}
            </>
          ) : selectedPolicy ? (
            <>
              {/* View Existing Policy */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedPolicy.name}</h3>
                    <p className="text-gray-400 text-sm">{selectedPolicy.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded text-sm ${
                      selectedPolicy.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {selectedPolicy.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors">
                      Edit Policy
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <p className="text-2xl font-bold text-white">{selectedPolicy.rules.length}</p>
                    <p className="text-xs text-gray-400">Rules</p>
                  </div>
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <p className="text-2xl font-bold text-cyan-400">P{selectedPolicy.priority}</p>
                    <p className="text-xs text-gray-400">Priority</p>
                  </div>
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-400">{selectedPolicy.version}</p>
                    <p className="text-xs text-gray-400">Version</p>
                  </div>
                </div>
              </div>

              {/* Existing Rules */}
              <div className="space-y-4">
                {selectedPolicy.rules.map((rule, index) => (
                  <div key={index} className="bg-gray-900/50 rounded-xl border border-gray-700 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded font-semibold ${
                        rule.effect === 'allow' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {rule.effect.toUpperCase()}
                      </span>
                      <span className="text-white font-medium">Rule {index + 1}</span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-purple-400 font-semibold">IF </span>
                        {rule.conditions.map((cond, i) => (
                          <span key={i}>
                            {i > 0 && <span className="text-yellow-400"> AND </span>}
                            <code className="text-gray-300">{cond.attribute} {cond.operator} "{cond.value}"</code>
                          </span>
                        ))}
                      </div>
                      <div>
                        <span className="text-blue-400 font-semibold">ACTIONS: </span>
                        <span className="text-cyan-400">{rule.actions.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-orange-400 font-semibold">RESOURCES: </span>
                        <span className="text-gray-400">{rule.resources?.join(', ') || rule.resource}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-gray-800/50 rounded-xl p-12 border border-gray-700 text-center">
              <span className="text-4xl">📋</span>
              <p className="text-gray-400 mt-4">Select a policy to view or create a new one</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Examples */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Policy Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: 'Time-based Access',
              description: 'Allow database access only during business hours',
              rule: 'IF time >= 9:00 AND time <= 17:00 THEN ALLOW read, write ON database'
            },
            {
              name: 'Role-based Access',
              description: 'Only admins can access production',
              rule: 'IF role = admin THEN ALLOW * ON production-*'
            },
            {
              name: 'MFA Required',
              description: 'Require MFA for sensitive operations',
              rule: 'IF mfa = false THEN DENY write, delete ON financial-*'
            }
          ].map((example, idx) => (
            <div key={idx} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <h4 className="text-white font-medium mb-1">{example.name}</h4>
              <p className="text-sm text-gray-400 mb-3">{example.description}</p>
              <code className="text-xs text-cyan-400 font-mono">{example.rule}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PolicyBuilder;
