/**
 * Access Simulator Component
 * Interactive "Can user X access resource Y?" with visual decision flow
 */

import React, { useState } from 'react';
import type { AccessDecision, EvaluationStep } from '../types/iam.types';
import { mockUsers, mockResources, evaluateAccess } from '../api/iam.api';

const AccessSimulator: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('read');
  const [decision, setDecision] = useState<AccessDecision | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const actions = ['read', 'create', 'update', 'delete', 'execute', 'admin'];

  const handleEvaluate = async () => {
    if (!selectedUser || !selectedResource) return;
    
    setIsEvaluating(true);
    setDecision(null);
    
    // Simulate evaluation delay for visual effect
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = evaluateAccess({
      userId: selectedUser,
      resource: selectedResource,
      action: selectedAction as any,
    });
    
    setDecision(result);
    setIsEvaluating(false);
  };

  const getStepIcon = (step: EvaluationStep): string => {
    switch (step.type) {
      case 'user_lookup': return '👤';
      case 'role_check': return '🎭';
      case 'permission_check': return '🔑';
      case 'policy_eval': return '📋';
      case 'condition_check': return '⚙️';
      case 'final_decision': return '⚖️';
      default: return '•';
    }
  };

  const getStepColor = (result: string): string => {
    switch (result) {
      case 'pass': return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'fail': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'skip': return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
      default: return 'text-gray-400';
    }
  };

  const selectedUserData = mockUsers.find(u => u.id === selectedUser);
  const selectedResourceData = mockResources.find(r => r.path === selectedResource);

  return (
    <div className="space-y-6">
      {/* Simulator Header */}
      <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-xl p-6 border border-blue-500/20">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <span className="text-2xl">🔐</span>
          Access Simulator
        </h2>
        <p className="text-gray-400">
          Test access control decisions in real-time. Select a user, resource, and action to see the evaluation flow.
        </p>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* User Selection */}
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <label className="block text-sm font-medium text-gray-400 mb-3">
            👤 Select User
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">Choose a user...</option>
            {mockUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.displayName} ({user.department})
              </option>
            ))}
          </select>
          
          {selectedUserData && (
            <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
              <div className="text-sm space-y-1">
                <p className="text-gray-400">Status: <span className={`${selectedUserData.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>{selectedUserData.status}</span></p>
                <p className="text-gray-400">Roles: <span className="text-blue-400">{selectedUserData.roles.join(', ') || 'None'}</span></p>
                <p className="text-gray-400">MFA: <span className={selectedUserData.mfaEnabled ? 'text-green-400' : 'text-yellow-400'}>{selectedUserData.mfaEnabled ? 'Enabled' : 'Disabled'}</span></p>
                <p className="text-gray-400">Risk: <span className={`${selectedUserData.riskScore > 50 ? 'text-red-400' : selectedUserData.riskScore > 25 ? 'text-yellow-400' : 'text-green-400'}`}>{selectedUserData.riskScore}%</span></p>
              </div>
            </div>
          )}
        </div>

        {/* Resource Selection */}
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <label className="block text-sm font-medium text-gray-400 mb-3">
            📁 Select Resource
          </label>
          <select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">Choose a resource...</option>
            {mockResources.map(resource => (
              <option key={resource.id} value={resource.path}>
                {resource.name}
              </option>
            ))}
          </select>
          
          {selectedResourceData && (
            <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
              <div className="text-sm space-y-1">
                <p className="text-gray-400">Type: <span className="text-purple-400">{selectedResourceData.type}</span></p>
                <p className="text-gray-400">Path: <span className="text-cyan-400 font-mono text-xs">{selectedResourceData.path}</span></p>
                <p className="text-gray-400">Sensitivity: <span className={`${
                  selectedResourceData.sensitivity === 'critical' ? 'text-red-400' :
                  selectedResourceData.sensitivity === 'high' ? 'text-orange-400' :
                  selectedResourceData.sensitivity === 'medium' ? 'text-yellow-400' : 'text-green-400'
                }`}>{selectedResourceData.sensitivity}</span></p>
                <p className="text-gray-400">Owner: <span className="text-blue-400">{selectedResourceData.owner}</span></p>
              </div>
            </div>
          )}
        </div>

        {/* Action Selection */}
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
          <label className="block text-sm font-medium text-gray-400 mb-3">
            ⚡ Select Action
          </label>
          <div className="grid grid-cols-2 gap-2">
            {actions.map(action => (
              <button
                key={action}
                onClick={() => setSelectedAction(action)}
                className={`p-3 rounded-lg border transition-all ${
                  selectedAction === action
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {action.toUpperCase()}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleEvaluate}
            disabled={!selectedUser || !selectedResource || isEvaluating}
            className={`w-full mt-4 p-4 rounded-lg font-bold transition-all ${
              !selectedUser || !selectedResource || isEvaluating
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-blue-500/25'
            }`}
          >
            {isEvaluating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Evaluating...
              </span>
            ) : (
              '🔍 Evaluate Access'
            )}
          </button>
        </div>
      </div>

      {/* Decision Result */}
      {decision && (
        <div className="space-y-4">
          {/* Result Banner */}
          <div className={`rounded-xl p-6 border ${
            decision.allowed 
              ? 'bg-green-900/20 border-green-500/30' 
              : 'bg-red-900/20 border-red-500/30'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                decision.allowed ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {decision.allowed ? '✅' : '❌'}
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${decision.allowed ? 'text-green-400' : 'text-red-400'}`}>
                  Access {decision.allowed ? 'GRANTED' : 'DENIED'}
                </h3>
                <p className="text-gray-400 mt-1">{decision.reason}</p>
                {decision.matchedPolicy && (
                  <p className="text-sm text-gray-500 mt-1">
                    Matched Policy: <span className="text-purple-400">{decision.matchedPolicy}</span>
                    {decision.matchedRule && <span> → Rule: <span className="text-cyan-400">{decision.matchedRule}</span></span>}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Evaluation Flow */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>📊</span> Evaluation Flow
            </h3>
            <div className="space-y-3">
              {decision.evaluationPath.map((step, index) => (
                <div 
                  key={index}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${getStepColor(step.result)}`}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-xl">
                    {getStepIcon(step)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-gray-900 px-2 py-0.5 rounded text-gray-400">
                        Step {step.step}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        step.result === 'pass' ? 'bg-green-500/20 text-green-400' :
                        step.result === 'fail' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {step.result.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-white font-medium mt-1">{step.description}</p>
                    {step.details && (
                      <p className="text-sm text-gray-400 mt-1">{step.details}</p>
                    )}
                  </div>
                  {index < decision.evaluationPath.length - 1 && (
                    <div className="absolute left-9 mt-14 h-4 w-0.5 bg-gray-700" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Test Scenarios */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">⚡ Quick Test Scenarios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { user: 'usr-001', resource: '/code/*', action: 'read', label: 'Developer reads code', expected: 'allow' },
                { user: 'usr-002', resource: '/deploy/production', action: 'execute', label: 'Analyst deploys to prod', expected: 'deny' },
                { user: 'usr-004', resource: '/admin/users', action: 'delete', label: 'Admin deletes user', expected: 'allow' },
                { user: 'usr-006', resource: '/data/customers', action: 'read', label: 'Intern reads customer data', expected: 'deny' },
                { user: 'usr-008', resource: '/code/project-x', action: 'read', label: 'Contractor reads project', expected: 'allow' },
                { user: 'usr-007', resource: '/code/*', action: 'read', label: 'Offboarded user reads code', expected: 'deny' },
              ].map((scenario, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedUser(scenario.user);
                    setSelectedResource(scenario.resource);
                    setSelectedAction(scenario.action);
                  }}
                  className="p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-all text-left"
                >
                  <p className="text-white font-medium text-sm">{scenario.label}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Expected: <span className={scenario.expected === 'allow' ? 'text-green-400' : 'text-red-400'}>{scenario.expected}</span>
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessSimulator;
