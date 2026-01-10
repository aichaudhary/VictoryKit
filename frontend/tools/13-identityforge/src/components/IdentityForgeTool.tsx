/**
 * IdentityForge Tool Component
 * Tool 13 - RBAC & Permission Management
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { accessControlApi, simulatedData, type User, type Role, type AccessDashboard } from '../api/identityforge.api';

type TabType = 'dashboard' | 'users' | 'roles' | 'policies';

interface IdentityForgeToolProps {
  onShowNeuralLink?: () => void;
}

export default function IdentityForgeTool({ onShowNeuralLink }: IdentityForgeToolProps) {
  const navigate = useNavigate();
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
    if (!dashboard) return <div className="text-gray-400">Loading...</div>;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-blue-500/20"><p className="text-gray-400 text-sm">Total Users</p><p className="text-2xl font-bold text-blue-400">{dashboard.overview.totalUsers}</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/20"><p className="text-gray-400 text-sm">Active Users</p><p className="text-2xl font-bold text-green-400">{dashboard.overview.activeUsers}</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/20"><p className="text-gray-400 text-sm">Roles</p><p className="text-2xl font-bold text-purple-400">{dashboard.overview.totalRoles}</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-cyan-500/20"><p className="text-gray-400 text-sm">Policies</p><p className="text-2xl font-bold text-cyan-400">{dashboard.overview.totalPolicies}</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {dashboard.recentActivity.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div><p className="text-white">{a.user}</p><p className="text-gray-500 text-sm">{a.action} → {a.resource}</p></div>
                  <span className={`px-2 py-1 rounded text-xs ${a.result === 'allowed' ? 'bg-green-600' : 'bg-red-600'}`}>{a.result}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4">Role Distribution</h3>
            <div className="space-y-3">
              {dashboard.roleDistribution.map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-gray-300 w-24">{r.role}</span>
                  <div className="flex-1 h-2 bg-gray-700 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${(r.count / dashboard.overview.totalUsers) * 100}%` }} /></div>
                  <span className="text-gray-400 text-sm w-12">{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderUsers() {
    return (
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900/50"><tr><th className="text-left p-4 text-gray-400">User</th><th className="text-left p-4 text-gray-400">Email</th><th className="text-left p-4 text-gray-400">Roles</th><th className="text-left p-4 text-gray-400">Status</th><th className="text-left p-4 text-gray-400">MFA</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-t border-gray-700 hover:bg-gray-800/50">
                <td className="p-4 text-white">{u.username}</td>
                <td className="p-4 text-gray-400">{u.email}</td>
                <td className="p-4">{u.roles.map(r => <span key={r} className="px-2 py-1 bg-blue-600/30 text-blue-400 rounded text-xs mr-1">{r}</span>)}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${u.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}`}>{u.status}</span></td>
                <td className="p-4">{u.mfaEnabled ? '✅' : '❌'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderRoles() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map(r => (
          <div key={r._id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">{r.name}</h3>
              {r.isSystem && <span className="px-2 py-1 bg-purple-600/30 text-purple-400 rounded text-xs">System</span>}
            </div>
            <p className="text-gray-400 text-sm mb-4">{r.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">{r.userCount} users</span>
              <span className="text-blue-400 text-sm">{r.permissions.length} permissions</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const tabs = [{ id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' }, { id: 'users' as TabType, label: 'Users', icon: '👥' }, { id: 'roles' as TabType, label: 'Roles', icon: '🎭' }, { id: 'policies' as TabType, label: 'Policies', icon: '📋' }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-950 text-white">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">🔐</div><div><h1 className="text-xl font-bold">IdentityForge</h1><p className="text-gray-400 text-sm">RBAC & Permission Management</p></div></div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/maula/ai')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <span>✨</span> AI Assistant
              </button>
              {usingSimulated && <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-500/30 text-yellow-400 rounded-full text-sm">🔄 Simulation Mode</span>}
            </div>
          </div>
          <nav className="flex gap-2 mt-4 overflow-x-auto">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'}`}><span className="mr-2">{tab.icon}</span>{tab.label}</button>))}</nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}
        {!loading && activeTab === 'dashboard' && renderDashboard()}
        {!loading && activeTab === 'users' && renderUsers()}
        {!loading && activeTab === 'roles' && renderRoles()}
        {!loading && activeTab === 'policies' && <div className="text-gray-400 text-center py-12">Policy management coming soon...</div>}
      </main>
      <footer className="border-t border-gray-800 py-4 mt-12"><div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">IdentityForge Tool 13 • VictoryKit Security Platform</div></footer>
    </div>
  );
}
