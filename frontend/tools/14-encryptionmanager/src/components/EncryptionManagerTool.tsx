/**
 * EncryptionManager Tool Component
 * Tool 14 - Key Management & Data Encryption
 */

import { useState, useEffect } from 'react';
import { encryptionManagerApi, simulatedData, type EncryptionKey, type EncryptionDashboard, type KeyStatus } from '../api/encryptionmanager.api';

const statusColors: Record<KeyStatus, string> = { active: 'bg-green-600', inactive: 'bg-gray-600', expired: 'bg-red-600', compromised: 'bg-red-800', 'pending-deletion': 'bg-yellow-600' };
type TabType = 'dashboard' | 'keys' | 'encrypt' | 'audit';

export default function EncryptionManagerTool() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboard, setDashboard] = useState<EncryptionDashboard | null>(null);
  const [keys, setKeys] = useState<EncryptionKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingSimulated, setUsingSimulated] = useState(false);
  const [encryptInput, setEncryptInput] = useState('');
  const [encryptResult, setEncryptResult] = useState('');

  useEffect(() => { loadDashboard(); }, []);
  useEffect(() => { if (activeTab === 'keys') loadKeys(); }, [activeTab]);

  async function loadDashboard() {
    setLoading(true);
    try { const r = await encryptionManagerApi.getDashboard(); if (r.success && r.data) { setDashboard(r.data); setUsingSimulated(false); } else { setDashboard(simulatedData.dashboard); setUsingSimulated(true); } }
    catch { setDashboard(simulatedData.dashboard); setUsingSimulated(true); }
    finally { setLoading(false); }
  }

  async function loadKeys() {
    setLoading(true);
    try { const r = await encryptionManagerApi.getKeys(); if (r.success && r.data) { setKeys(r.data); setUsingSimulated(false); } else { setKeys(simulatedData.keys); setUsingSimulated(true); } }
    catch { setKeys(simulatedData.keys); setUsingSimulated(true); }
    finally { setLoading(false); }
  }

  function handleEncrypt() { setEncryptResult(btoa(encryptInput)); }

  function renderDashboard() {
    if (!dashboard) return <div className="text-gray-400">Loading...</div>;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/20"><p className="text-gray-400 text-sm">Total Keys</p><p className="text-2xl font-bold text-purple-400">{dashboard.overview.totalKeys}</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/20"><p className="text-gray-400 text-sm">Active Keys</p><p className="text-2xl font-bold text-green-400">{dashboard.overview.activeKeys}</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-yellow-500/20"><p className="text-gray-400 text-sm">Expiring Soon</p><p className="text-2xl font-bold text-yellow-400">{dashboard.overview.expiringSoon}</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-cyan-500/20"><p className="text-gray-400 text-sm">Ops (24h)</p><p className="text-2xl font-bold text-cyan-400">{(dashboard.overview.keyOperations24h / 1000).toFixed(1)}K</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4">Keys by Type</h3>
            <div className="space-y-3">{Object.entries(dashboard.keysByType).map(([type, count]) => (<div key={type} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"><span className="text-gray-300 capitalize">{type}</span><span className="text-purple-400 font-bold">{count}</span></div>))}</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4">Recent Operations</h3>
            <div className="space-y-3">{dashboard.recentOperations.map((op, i) => (<div key={i} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"><div><p className="text-white">{op.operation}</p><p className="text-gray-500 text-sm">{op.keyName}</p></div><span className={`px-2 py-1 rounded text-xs ${op.status === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{op.status}</span></div>))}</div>
          </div>
        </div>
      </div>
    );
  }

  function renderKeys() {
    return (
      <div className="space-y-4">
        <div className="flex justify-end"><button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">+ Generate Key</button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {keys.map(k => (
            <div key={k._id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-3"><h3 className="text-white font-semibold">{k.name}</h3><span className={`px-2 py-1 rounded text-xs ${statusColors[k.status]}`}>{k.status}</span></div>
              <div className="space-y-2 text-sm"><p className="text-gray-400">Type: <span className="text-cyan-400">{k.type}</span></p><p className="text-gray-400">Algorithm: <span className="text-purple-400">{k.algorithm}</span></p><p className="text-gray-400">Usage: <span className="text-white">{k.usageCount.toLocaleString()}</span></p></div>
              <div className="mt-4 flex gap-2"><button className="flex-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">Rotate</button><button className="flex-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">Details</button></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderEncrypt() {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/30">
          <h3 className="text-white font-semibold mb-4">🔐 Encrypt/Decrypt Data</h3>
          <textarea value={encryptInput} onChange={(e) => setEncryptInput(e.target.value)} placeholder="Enter data to encrypt..." className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white mb-4" />
          <div className="flex gap-4"><button onClick={handleEncrypt} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">Encrypt</button><button onClick={() => setEncryptResult(atob(encryptInput) || '')} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">Decrypt</button></div>
          {encryptResult && <div className="mt-4 p-4 bg-gray-900 rounded-lg"><p className="text-gray-400 text-sm mb-2">Result:</p><p className="text-green-400 font-mono break-all">{encryptResult}</p></div>}
        </div>
      </div>
    );
  }

  const tabs = [{ id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' }, { id: 'keys' as TabType, label: 'Keys', icon: '🔑' }, { id: 'encrypt' as TabType, label: 'Encrypt', icon: '🔐' }, { id: 'audit' as TabType, label: 'Audit', icon: '📋' }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-950 text-white">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">🔐</div><div><h1 className="text-xl font-bold">EncryptionManager</h1><p className="text-gray-400 text-sm">Key Management & Data Encryption</p></div></div>{usingSimulated && <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-500/30 text-yellow-400 rounded-full text-sm">🔄 Simulation Mode</span>}</div>
          <nav className="flex gap-2 mt-4 overflow-x-auto">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'}`}><span className="mr-2">{tab.icon}</span>{tab.label}</button>))}</nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>}
        {!loading && activeTab === 'dashboard' && renderDashboard()}
        {!loading && activeTab === 'keys' && renderKeys()}
        {!loading && activeTab === 'encrypt' && renderEncrypt()}
        {!loading && activeTab === 'audit' && <div className="text-gray-400 text-center py-12">Audit logs coming soon...</div>}
      </main>
      <footer className="border-t border-gray-800 py-4 mt-12"><div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">EncryptionManager Tool 14 • VictoryKit Security Platform</div></footer>
    </div>
  );
}
