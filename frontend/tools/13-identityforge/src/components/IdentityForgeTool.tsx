/**
 * IdentityForge Tool Component
 * Tool 13 - RBAC & Permission Management
 * Interactive IAM learning platform with real-world features
 */

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { accessControlApi, simulatedData, type User, type Role, type AccessDashboard } from '../api/accesscontrol.api';
import { generateDashboard } from '../api/iam.api';
import AccessSimulator from './AccessSimulator';
import PolicyBuilder from './PolicyBuilder';
import RoleHierarchyVisualizer from './RoleHierarchyVisualizer';
import UserLifecycleDemo from './UserLifecycleDemo';
import ComplianceAuditPanel from './ComplianceAuditPanel';

type TabType = 'dashboard' | 'simulator' | 'policies' | 'roles' | 'lifecycle' | 'compliance' | 'users' | 'audit';

interface IdentityForgeToolProps {
  onShowNeuralLink?: () => void;
}

export default function IdentityForgeTool({ onShowNeuralLink: _onShowNeuralLink }: IdentityForgeToolProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboard, setDashboard] = useState<AccessDashboard | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingSimulated, setUsingSimulated] = useState(false);

  useEffect(() => { loadDashboard(); }, []);
  useEffect(() => { if (activeTab === 'users') loadUsers(); if (activeTab === 'roles') loadRoles(); }, [activeTab]);

  async function loadDashboard() {
    setLoading(true);
    try {
      const response = await accessControlApi.getDashboard();
      if (response.success && response.data) { setDashboard(response.data); setUsingSimulated(false); }
      else { setDashboard(simulatedData.dashboard); setUsingSimulated(true); }
    } catch { setDashboard(simulatedData.dashboard); setUsingSimulated(true); }
    finally { setLoading(false); }
  }

  async function loadUsers() {
    setLoading(true);
    try {
      const response = await accessControlApi.getUsers();
      if (response.success && response.data) { setUsers(response.data); setUsingSimulated(false); }
      else { setUsers(simulatedData.users); setUsingSimulated(true); }
    } catch { setUsers(simulatedData.users); setUsingSimulated(true); }
    finally { setLoading(false); }
  }

  async function loadRoles() {
    setLoading(true);
    try {
      const response = await accessControlApi.getRoles();
      if (response.success && response.data) { setRoles(response.data); setUsingSimulated(false); }
      else { setRoles(simulatedData.roles); setUsingSimulated(true); }
    } catch { setRoles(simulatedData.roles); setUsingSimulated(true); }
    finally { setLoading(false); }
  }

  function renderDashboard() {
    const iamDashboard = generateDashboard();
    
    return (
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-cyan-900/40 rounded-2xl p-8 border border-blue-500/20">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome to IdentityForge</h2>
              <p className="text-gray-400 max-w-2xl">
                Your interactive IAM learning platform. Explore access control concepts through hands-on simulations, 
                policy building, and real-world compliance scenarios.
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-cyan-400">{iamDashboard.securityScore}%</div>
              <div className="text-sm text-gray-400">Security Score</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-blue-500/20">
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-blue-400">{iamDashboard.totalUsers}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/20">
            <p className="text-gray-400 text-sm">Active Users</p>
            <p className="text-2xl font-bold text-green-400">{iamDashboard.activeUsers}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/20">
            <p className="text-gray-400 text-sm">Roles</p>
            <p className="text-2xl font-bold text-purple-400">{iamDashboard.totalRoles}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-cyan-500/20">
            <p className="text-gray-400 text-sm">Policies</p>
            <p className="text-2xl font-bold text-cyan-400">{iamDashboard.totalPolicies}</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button 
            onClick={() => setActiveTab('simulator')}
            className="text-left bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-xl p-6 border border-cyan-500/20 hover:border-cyan-500/50 transition-all group"
          >
            <span className="text-3xl">🎯</span>
            <h3 className="text-xl font-bold text-white mt-3 group-hover:text-cyan-400 transition-colors">Access Simulator</h3>
            <p className="text-gray-400 mt-2 text-sm">Test "Can user X access resource Y?" with step-by-step policy evaluation</p>
          </button>

          <button 
            onClick={() => setActiveTab('policies')}
            className="text-left bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/50 transition-all group"
          >
            <span className="text-3xl">🏗️</span>
            <h3 className="text-xl font-bold text-white mt-3 group-hover:text-blue-400 transition-colors">Policy Builder</h3>
            <p className="text-gray-400 mt-2 text-sm">Create IF/THEN policies with a visual drag-and-drop interface</p>
          </button>

          <button 
            onClick={() => setActiveTab('roles')}
            className="text-left bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all group"
          >
            <span className="text-3xl">🌳</span>
            <h3 className="text-xl font-bold text-white mt-3 group-hover:text-purple-400 transition-colors">Role Hierarchy</h3>
            <p className="text-gray-400 mt-2 text-sm">Visualize role inheritance and permission flow through the tree</p>
          </button>

          <button 
            onClick={() => setActiveTab('lifecycle')}
            className="text-left bg-gradient-to-br from-green-900/30 to-teal-900/30 rounded-xl p-6 border border-green-500/20 hover:border-green-500/50 transition-all group"
          >
            <span className="text-3xl">🔄</span>
            <h3 className="text-xl font-bold text-white mt-3 group-hover:text-green-400 transition-colors">User Lifecycle</h3>
            <p className="text-gray-400 mt-2 text-sm">Simulate onboarding, promotions, transfers, and offboarding</p>
          </button>

          <button 
            onClick={() => setActiveTab('compliance')}
            className="text-left bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/50 transition-all group"
          >
            <span className="text-3xl">📊</span>
            <h3 className="text-xl font-bold text-white mt-3 group-hover:text-orange-400 transition-colors">Compliance Audit</h3>
            <p className="text-gray-400 mt-2 text-sm">Run SOC2, HIPAA, GDPR compliance checks with recommendations</p>
          </button>

          <button 
            onClick={() => setActiveTab('users')}
            className="text-left bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all group"
          >
            <span className="text-3xl">👥</span>
            <h3 className="text-xl font-bold text-white mt-3 group-hover:text-gray-300 transition-colors">User Management</h3>
            <p className="text-gray-400 mt-2 text-sm">View and manage all users, their roles, and access permissions</p>
          </button>
        </div>

        {/* Recent Activity */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {dashboard.recentActivity.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="text-white">{a.user}</p>
                      <p className="text-gray-500 text-sm">{a.action} → {a.resource}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${a.result === 'allowed' ? 'bg-green-600' : 'bg-red-600'}`}>
                      {a.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4">Pending Actions</h3>
              <div className="space-y-3">
                {iamDashboard.pendingReviews.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="text-white">{item.type}</p>
                      <p className="text-gray-500 text-sm">{item.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.priority === 'high' ? 'bg-red-600' :
                      item.priority === 'medium' ? 'bg-yellow-600' : 'bg-gray-600'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderUsers() {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-2">User Management</h2>
          <p className="text-gray-400">View all users in the system with their roles and status</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="text-left p-4 text-gray-400">User</th>
                <th className="text-left p-4 text-gray-400">Email</th>
                <th className="text-left p-4 text-gray-400">Roles</th>
                <th className="text-left p-4 text-gray-400">Status</th>
                <th className="text-left p-4 text-gray-400">MFA</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-t border-gray-700 hover:bg-gray-800/50">
                  <td className="p-4 text-white">{u.username}</td>
                  <td className="p-4 text-gray-400">{u.email}</td>
                  <td className="p-4">
                    {u.roles.map(r => (
                      <span key={r} className="px-2 py-1 bg-blue-600/30 text-blue-400 rounded text-xs mr-1">{r}</span>
                    ))}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${u.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4">{u.mfaEnabled ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: '🏠' },
    { id: 'simulator' as TabType, label: 'Access Simulator', icon: '🎯' },
    { id: 'policies' as TabType, label: 'Policy Builder', icon: '🏗️' },
    { id: 'roles' as TabType, label: 'Role Hierarchy', icon: '🌳' },
    { id: 'lifecycle' as TabType, label: 'User Lifecycle', icon: '🔄' },
    { id: 'compliance' as TabType, label: 'Compliance', icon: '📊' },
    { id: 'users' as TabType, label: 'Users', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-950 text-white">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="https://maula.ai" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all">
                <ArrowLeft className="w-4 h-4" />MAULA.AI
              </a>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">🔐</div>
              <div>
                <h1 className="text-xl font-bold">IdentityForge</h1>
                <p className="text-gray-400 text-sm">Interactive IAM Learning Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { window.location.href = '/neural-link'; }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <span>✨</span> AI Assistant
              </button>
              {usingSimulated && (
                <span className="px-3 py-1 bg-green-900/30 border border-green-500/30 text-green-400 rounded-full text-sm">
                  🎓 Learning Mode
                </span>
              )}
            </div>
          </div>
          <nav className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' 
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>{tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && activeTab === 'dashboard' && renderDashboard()}
        {!loading && activeTab === 'simulator' && <AccessSimulator />}
        {!loading && activeTab === 'policies' && <PolicyBuilder />}
        {!loading && activeTab === 'roles' && <RoleHierarchyVisualizer />}
        {!loading && activeTab === 'lifecycle' && <UserLifecycleDemo />}
        {!loading && activeTab === 'compliance' && <ComplianceAuditPanel />}
        {!loading && activeTab === 'users' && renderUsers()}
      </main>
      
      <footer className="border-t border-gray-800 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          IdentityForge Tool 13 • VictoryKit Security Platform • 
          <span className="text-cyan-500 ml-1">Interactive IAM Learning Platform</span>
        </div>
      </footer>
    </div>
  );
}
