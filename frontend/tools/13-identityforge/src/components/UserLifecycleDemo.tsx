/**
 * User Lifecycle Demo Component
 * Interactive simulation of user onboarding, role changes, and offboarding
 */

import React, { useState } from 'react';
import type { User } from '../types/iam.types';
import { mockUsers, mockRoles, simulateLifecycleEvent, SimulatedLifecycleEvent } from '../api/iam.api';

type LifecycleAction = 'onboard' | 'promote' | 'demote' | 'transfer' | 'suspend' | 'reactivate' | 'offboard';

interface TimelineEvent extends SimulatedLifecycleEvent {
  displayTimestamp: Date;
}

const UserLifecycleDemo: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentAction, setCurrentAction] = useState<LifecycleAction | null>(null);

  // Create a new hire scenario
  const [newHireForm, setNewHireForm] = useState({
    name: 'New Employee',
    email: 'new.employee@company.com',
    department: 'Engineering',
    role: 'developer',
  });

  const executeAction = async (action: LifecycleAction, _targetRole?: string) => {
    if (!selectedUser) return;
    
    setIsAnimating(true);
    setCurrentAction(action);

    const result = simulateLifecycleEvent(selectedUser.id, action);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newEvent: TimelineEvent = {
      ...result,
      displayTimestamp: new Date(),
    };
    
    setEvents(prev => [newEvent, ...prev]);
    setIsAnimating(false);
    setCurrentAction(null);
  };

  const runOnboardingDemo = async () => {
    setEvents([]);
    setIsAnimating(true);
    
    // Create a new user for demo
    const demoUser: User = {
      id: 'demo-' + Date.now(),
      username: 'demo.user',
      email: newHireForm.email,
      displayName: newHireForm.name,
      status: 'pending',
      department: newHireForm.department,
      title: 'New Hire',
      roles: [],
      groups: [],
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      lastLogin: undefined,
      passwordLastChanged: new Date().toISOString(),
      riskScore: 0,
    };
    
    setSelectedUser(demoUser);

    const demoEvents: TimelineEvent[] = [];

    // Step 1: Account Creation
    await new Promise(resolve => setTimeout(resolve, 1000));
    demoEvents.push({
      eventType: 'onboard',
      userId: demoUser.id,
      performedBy: 'hr-system',
      displayTimestamp: new Date(),
      timestamp: new Date().toISOString(),
      changes: {
        before: { status: 'none' },
        after: { status: 'pending', email: demoUser.email },
      },
      automatedActions: ['Account created', 'Welcome email queued'],
      approvalRequired: false,
      status: 'completed',
    });
    setEvents([...demoEvents]);

    // Step 2: Role Assignment
    await new Promise(resolve => setTimeout(resolve, 1000));
    demoEvents.unshift({
      eventType: 'role_change',
      userId: demoUser.id,
      performedBy: 'hr-system',
      displayTimestamp: new Date(),
      timestamp: new Date().toISOString(),
      changes: {
        before: { roles: [] },
        after: { roles: [newHireForm.role] },
      },
      automatedActions: ['Role assigned', 'Permissions granted'],
      approvalRequired: true,
      approver: 'manager@company.com',
      status: 'completed',
    });
    setEvents([...demoEvents]);

    // Step 3: Group Memberships
    await new Promise(resolve => setTimeout(resolve, 1000));
    demoEvents.unshift({
      eventType: 'group_change',
      userId: demoUser.id,
      performedBy: 'hr-system',
      displayTimestamp: new Date(),
      timestamp: new Date().toISOString(),
      changes: {
        before: { groups: [] },
        after: { groups: ['engineering-team', 'all-employees'] },
      },
      automatedActions: ['Added to department group', 'Added to all-employees'],
      approvalRequired: false,
      status: 'completed',
    });
    setEvents([...demoEvents]);

    // Step 4: MFA Setup
    await new Promise(resolve => setTimeout(resolve, 1000));
    demoEvents.unshift({
      eventType: 'mfa_setup',
      userId: demoUser.id,
      performedBy: demoUser.id,
      displayTimestamp: new Date(),
      timestamp: new Date().toISOString(),
      changes: {
        before: { mfaEnabled: false },
        after: { mfaEnabled: true, mfaMethod: 'authenticator' },
      },
      automatedActions: ['MFA enrolled', 'Recovery codes generated'],
      approvalRequired: false,
      status: 'completed',
    });
    setEvents([...demoEvents]);

    // Step 5: Account Activation
    await new Promise(resolve => setTimeout(resolve, 1000));
    demoEvents.unshift({
      eventType: 'status_change',
      userId: demoUser.id,
      performedBy: 'system',
      displayTimestamp: new Date(),
      timestamp: new Date().toISOString(),
      changes: {
        before: { status: 'pending' },
        after: { status: 'active' },
      },
      automatedActions: ['Account activated', 'Access enabled'],
      approvalRequired: false,
      status: 'completed',
    });
    setEvents([...demoEvents]);

    // Update user status
    setSelectedUser({ ...demoUser, status: 'active', mfaEnabled: true, roles: [newHireForm.role] });
    setIsAnimating(false);
  };

  const getActionColor = (eventType: string): string => {
    switch (eventType) {
      case 'onboard': return 'bg-green-500';
      case 'promote':
      case 'role_change': return 'bg-blue-500';
      case 'demote': return 'bg-yellow-500';
      case 'transfer': return 'bg-purple-500';
      case 'suspend': return 'bg-orange-500';
      case 'offboard': return 'bg-red-500';
      case 'mfa_setup': return 'bg-cyan-500';
      case 'status_change': return 'bg-green-500';
      case 'group_change': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const getActionIcon = (eventType: string): string => {
    switch (eventType) {
      case 'onboard': return '🎉';
      case 'promote':
      case 'role_change': return '⬆️';
      case 'demote': return '⬇️';
      case 'transfer': return '🔄';
      case 'suspend': return '⏸️';
      case 'offboard': return '👋';
      case 'mfa_setup': return '🔐';
      case 'status_change': return '✅';
      case 'group_change': return '👥';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-xl p-6 border border-green-500/20">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <span className="text-2xl">🔄</span>
          User Lifecycle Demo
        </h2>
        <p className="text-gray-400">
          Experience the complete user journey from onboarding to offboarding with automated workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Selection / New Hire Form */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Select or Create User</h3>
          
          {/* Existing Users */}
          <div className="mb-6">
            <h4 className="text-sm text-gray-400 mb-2">Existing Users</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {mockUsers.filter(u => u.status !== 'deleted' && u.status !== 'inactive').map(user => (
                <button
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user);
                    setEvents([]);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedUser?.id === user.id 
                      ? 'bg-cyan-500/20 border border-cyan-500/50' 
                      : 'bg-gray-900/50 hover:bg-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      user.status === 'active' ? 'bg-green-500' : 
                      user.status === 'suspended' ? 'bg-orange-500' : 'bg-gray-500'
                    }`} />
                    <div>
                      <p className="text-white font-medium text-sm">{user.displayName}</p>
                      <p className="text-gray-500 text-xs">{user.title}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* New Hire Form */}
          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-sm text-gray-400 mb-3">Or Create New Hire</h4>
            <div className="space-y-3">
              <input
                type="text"
                value={newHireForm.name}
                onChange={(e) => setNewHireForm({ ...newHireForm, name: e.target.value })}
                placeholder="Full Name"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
              />
              <input
                type="email"
                value={newHireForm.email}
                onChange={(e) => setNewHireForm({ ...newHireForm, email: e.target.value })}
                placeholder="Email"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
              />
              <select
                value={newHireForm.department}
                onChange={(e) => setNewHireForm({ ...newHireForm, department: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="Security">Security</option>
              </select>
              <select
                value={newHireForm.role}
                onChange={(e) => setNewHireForm({ ...newHireForm, role: e.target.value })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
              >
                {mockRoles.filter(r => !r.isPrivileged).map(role => (
                  <option key={role.id} value={role.id}>{role.displayName}</option>
                ))}
              </select>
              <button
                onClick={runOnboardingDemo}
                disabled={isAnimating}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold hover:from-green-500 hover:to-teal-500 transition-all disabled:opacity-50"
              >
                {isAnimating ? '⏳ Processing...' : '🚀 Run Onboarding Demo'}
              </button>
            </div>
          </div>
        </div>

        {/* Actions Panel */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Lifecycle Actions</h3>
          
          {selectedUser ? (
            <div className="space-y-4">
              {/* Current User Info */}
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedUser.status === 'active' ? 'bg-green-500' :
                    selectedUser.status === 'suspended' ? 'bg-orange-500' :
                    selectedUser.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <h4 className="font-semibold text-white">{selectedUser.displayName}</h4>
                </div>
                <p className="text-sm text-gray-400">{selectedUser.email}</p>
                <p className="text-sm text-gray-500">{selectedUser.title} • {selectedUser.department}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedUser.roles.map(role => (
                    <span key={role} className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => executeAction('promote', 'manager')}
                  disabled={isAnimating || selectedUser.status !== 'active'}
                  className="p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-900/50 transition-colors disabled:opacity-50 text-sm"
                >
                  ⬆️ Promote
                </button>
                <button
                  onClick={() => executeAction('demote', 'developer')}
                  disabled={isAnimating || selectedUser.status !== 'active'}
                  className="p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-900/50 transition-colors disabled:opacity-50 text-sm"
                >
                  ⬇️ Demote
                </button>
                <button
                  onClick={() => executeAction('transfer')}
                  disabled={isAnimating || selectedUser.status !== 'active'}
                  className="p-3 bg-purple-900/30 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-900/50 transition-colors disabled:opacity-50 text-sm"
                >
                  🔄 Transfer
                </button>
                <button
                  onClick={() => executeAction(selectedUser.status === 'suspended' ? 'reactivate' : 'suspend')}
                  disabled={isAnimating}
                  className={`p-3 rounded-lg transition-colors disabled:opacity-50 text-sm ${
                    selectedUser.status === 'suspended'
                      ? 'bg-green-900/30 border border-green-500/30 text-green-400 hover:bg-green-900/50'
                      : 'bg-orange-900/30 border border-orange-500/30 text-orange-400 hover:bg-orange-900/50'
                  }`}
                >
                  {selectedUser.status === 'suspended' ? '▶️ Reactivate' : '⏸️ Suspend'}
                </button>
                <button
                  onClick={() => executeAction('offboard')}
                  disabled={isAnimating || selectedUser.status === 'deleted' || selectedUser.status === 'inactive'}
                  className="col-span-2 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-900/50 transition-colors disabled:opacity-50 text-sm"
                >
                  👋 Offboard Employee
                </button>
              </div>

              {/* Animation Indicator */}
              {isAnimating && (
                <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg animate-pulse">
                  <p className="text-cyan-400 text-center">
                    Processing {currentAction}...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl">👤</span>
              <p className="text-gray-400 mt-4">Select a user or create a new hire to see available actions</p>
            </div>
          )}
        </div>

        {/* Event Timeline */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Event Timeline</h3>
            {events.length > 0 && (
              <button
                onClick={() => setEvents([])}
                className="text-xs text-gray-500 hover:text-gray-400"
              >
                Clear
              </button>
            )}
          </div>
          
          {events.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
              {events.map((event, idx) => (
                <div 
                  key={idx} 
                  className={`relative pl-8 pb-4 ${idx < events.length - 1 ? 'border-l-2 border-gray-700' : ''} ml-2`}
                >
                  {/* Timeline dot */}
                  <div className={`absolute -left-2 top-0 w-4 h-4 rounded-full ${getActionColor(event.eventType)} flex items-center justify-center`}>
                    <span className="text-xs">{getActionIcon(event.eventType)}</span>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-white capitalize">
                        {event.eventType.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        event.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        event.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    
                    {/* Changes */}
                    <div className="text-xs space-y-1 mb-2">
                      {Object.keys(event.changes.after).map(key => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-gray-500">{key}:</span>
                          <span className="text-gray-500 line-through">
                            {JSON.stringify(event.changes.before[key] || 'none')}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="text-cyan-400">
                            {JSON.stringify(event.changes.after[key])}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Automated Actions */}
                    {event.automatedActions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Automated:</p>
                        <div className="flex flex-wrap gap-1">
                          {event.automatedActions.map((action, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-gray-800 text-gray-400 rounded">
                              {action}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Approval */}
                    {event.approvalRequired && (
                      <div className="mt-2 text-xs text-orange-400">
                        ⚠️ Required approval from {event.approver}
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-gray-600 mt-2">
                      {event.displayTimestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-4xl">📋</span>
              <p className="text-gray-400 mt-4">No events yet. Perform an action to see the timeline.</p>
            </div>
          )}
        </div>
      </div>

      {/* Lifecycle Diagram */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">User Lifecycle Flow</h3>
        <div className="flex items-center justify-center gap-4 overflow-x-auto pb-4">
          {[
            { state: 'Pending', color: 'yellow', icon: '⏳' },
            { state: 'Active', color: 'green', icon: '✅' },
            { state: 'Suspended', color: 'orange', icon: '⏸️' },
            { state: 'Offboarded', color: 'red', icon: '👋' },
          ].map((stage, idx) => (
            <React.Fragment key={stage.state}>
              <div className={`flex flex-col items-center p-4 rounded-lg border-2 ${
                selectedUser?.status === stage.state.toLowerCase() 
                  ? `border-${stage.color}-500 bg-${stage.color}-900/30`
                  : 'border-gray-700 bg-gray-900/50'
              }`}>
                <span className="text-2xl mb-2">{stage.icon}</span>
                <span className="text-sm font-medium text-white">{stage.state}</span>
              </div>
              {idx < 3 && (
                <div className="text-gray-600 text-2xl">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserLifecycleDemo;
