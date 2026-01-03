/**
 * CryptoVault Tool Component - Tool 15 - Secure Secrets Management
 */
import { useState, useEffect } from 'react';
import { cryptoVaultApi, simulatedData, type Secret, type VaultDashboard } from '../api/cryptovault.api';

type TabType = 'dashboard' | 'secrets' | 'create';

export default function CryptoVaultTool() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboard, setDashboard] = useState<VaultDashboard | null>(null);
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingSimulated, setUsingSimulated] = useState(false);

  useEffect(() => { loadDashboard(); }, []);
  useEffect(() => { if (activeTab === 'secrets') loadSecrets(); }, [activeTab]);

  async function loadDashboard() {
    setLoading(true);
    try { const r = await cryptoVaultApi.getDashboard(); if (r.success && r.data) { setDashboard(r.data); setUsingSimulated(false); } else { setDashboard(simulatedData.dashboard); setUsingSimulated(true); } }
    catch { setDashboard(simulatedData.dashboard); setUsingSimulated(true); } finally { setLoading(false); }
  }

  async function loadSecrets() {
    setLoading(true);
    try { const r = await cryptoVaultApi.getSecrets(); if (r.success && r.data) { setSecrets(r.data); setUsingSimulated(false); } else { setSecrets(simulatedData.secrets); setUsingSimulated(true); } }
    catch { setSecrets(simulatedData.secrets); setUsingSimulated(true); } finally { setLoading(false); }
  }

  function renderDashboard() {
    if (!dashboard) return <div className="text-gray-400">Loading...</div>;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-emerald-500/20"><p className="text-gray-400 text-sm">Total Secrets</p><p className="text-2xl font-bold text-emerald-400">{dashboard.overview.totalSecrets}</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-blue-500/20"><p className="text-gray-400 text-sm">Versions</p><p className="text-2xl font-bold text-blue-400">{dashboard.overview.totalVersions}</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-yellow-500/20"><p className="text-gray-400 text-sm">Expiring Soon</p><p className="text-2xl font-bold text-yellow-400">{dashboard.overview.expiringSoon}</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/20"><p className="text-gray-400 text-sm">Access (24h)</p><p className="text-2xl font-bold text-purple-400">{(dashboard.overview.accessCount24h/1000).toFixed(1)}K</p></div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Recent Access</h3>
          <div className="space-y-3">{dashboard.recentAccess.map((a, i) => (<div key={i} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"><div><p className="text-white font-mono">{a.secret}</p><p className="text-gray-500 text-sm">{a.user} • {a.action}</p></div><span className="text-gray-400 text-sm">{new Date(a.timestamp).toLocaleTimeString()}</span></div>))}</div>
        </div>
      </div>
    );
  }

  function renderSecrets() {
    return (
      <div className="space-y-4">
        <div className="flex justify-end"><button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">+ New Secret</button></div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full"><thead className="bg-gray-900/50"><tr><th className="text-left p-4 text-gray-400">Name</th><th className="text-left p-4 text-gray-400">Path</th><th className="text-left p-4 text-gray-400">Version</th><th className="text-left p-4 text-gray-400">Updated</th><th className="text-left p-4 text-gray-400">Actions</th></tr></thead>
            <tbody>{secrets.map(s => (<tr key={s._id} className="border-t border-gray-700 hover:bg-gray-800/50"><td className="p-4 text-white">{s.name}</td><td className="p-4 text-cyan-400 font-mono text-sm">{s.path}</td><td className="p-4 text-gray-400">v{s.version}</td><td className="p-4 text-gray-400">{new Date(s.updatedAt).toLocaleDateString()}</td><td className="p-4"><button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">View</button></td></tr>))}</tbody>
          </table>
        </div>
      </div>
    );
  }

  const tabs = [{ id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' }, { id: 'secrets' as TabType, label: 'Secrets', icon: '🔒' }, { id: 'create' as TabType, label: 'Create', icon: '➕' }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950 text-white">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">🔒</div><div><h1 className="text-xl font-bold">CryptoVault</h1><p className="text-gray-400 text-sm">Secure Secrets Management</p></div></div>{usingSimulated && <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-500/30 text-yellow-400 rounded-full text-sm">🔄 Simulation Mode</span>}</div>
          <nav className="flex gap-2 mt-4">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg ${activeTab === tab.id ? 'bg-emerald-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'}`}><span className="mr-2">{tab.icon}</span>{tab.label}</button>))}</nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}
        {!loading && activeTab === 'dashboard' && renderDashboard()}
        {!loading && activeTab === 'secrets' && renderSecrets()}
        {!loading && activeTab === 'create' && <div className="text-gray-400 text-center py-12">Create secret form coming soon...</div>}
      </main>
      <footer className="border-t border-gray-800 py-4 mt-12"><div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">CryptoVault Tool 15 • VictoryKit Security Platform</div></footer>
    </div>
  );
}
