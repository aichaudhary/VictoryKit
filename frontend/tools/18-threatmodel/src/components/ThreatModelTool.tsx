/**
 * ThreatModel Tool Component - Tool 18 - Threat Modeling & Analysis
 */
import { useState, useEffect } from 'react';
import { threatModelApi, simulatedData, type Threat, type ThreatDashboard, type ThreatModel } from '../api/threatmodel.api';

type TabType = 'dashboard' | 'models' | 'threats' | 'analysis';

export default function ThreatModelTool() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboard, setDashboard] = useState<ThreatDashboard | null>(null);
  const [models, setModels] = useState<ThreatModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingSimulated, setUsingSimulated] = useState(false);

  useEffect(() => { loadDashboard(); }, []);
  useEffect(() => { if (activeTab === 'models') loadModels(); }, [activeTab]);

  async function loadDashboard() {
    setLoading(true);
    try { const r = await threatModelApi.getDashboard(); if (r.success && r.data) { setDashboard(r.data); setUsingSimulated(false); } else { setDashboard(simulatedData.dashboard); setUsingSimulated(true); } }
    catch { setDashboard(simulatedData.dashboard); setUsingSimulated(true); } finally { setLoading(false); }
  }

  async function loadModels() {
    setLoading(true);
    try { const r = await threatModelApi.getModels(); if (r.success && r.data) { setModels(r.data); setUsingSimulated(false); } else { setModels(simulatedData.models); setUsingSimulated(true); } }
    catch { setModels(simulatedData.models); setUsingSimulated(true); } finally { setLoading(false); }
  }

  function renderDashboard() {
    if (!dashboard) return <div className="text-gray-400">Loading...</div>;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-orange-500/20"><p className="text-gray-400 text-sm">Total Models</p><p className="text-2xl font-bold text-orange-400">{dashboard.overview.totalModels}</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-yellow-500/20"><p className="text-gray-400 text-sm">Total Threats</p><p className="text-2xl font-bold text-yellow-400">{dashboard.overview.totalThreats}</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/20"><p className="text-gray-400 text-sm">Mitigated</p><p className="text-2xl font-bold text-green-400">{dashboard.overview.mitigatedThreats}</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-red-500/20"><p className="text-gray-400 text-sm">Critical</p><p className="text-2xl font-bold text-red-400">{dashboard.overview.criticalThreats}</p></div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Recent Threats</h3>
          <div className="space-y-3">{dashboard.recentThreats.map(t => (<div key={t._id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"><div className="flex items-center gap-3"><span className={`w-3 h-3 rounded-full ${t.severity === 'critical' ? 'bg-red-500' : t.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}`} /><div><p className="text-white">{t.name}</p><p className="text-gray-500 text-sm">{t.category} • {t.type}</p></div></div><span className={`px-2 py-1 rounded text-sm ${t.status === 'mitigated' ? 'bg-green-900/30 text-green-400' : 'bg-orange-900/30 text-orange-400'}`}>{t.status}</span></div>))}</div>
        </div>
      </div>
    );
  }

  function renderModels() {
    return (
      <div className="space-y-4">
        <div className="flex justify-end"><button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg">+ New Model</button></div>
        <div className="grid gap-4">{models.map(m => (<div key={m._id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"><div className="flex justify-between items-start"><div><h3 className="text-white font-semibold text-lg">{m.name}</h3><p className="text-gray-400 mt-1">{m.description}</p><p className="text-gray-500 text-sm mt-2">Scope: {m.scope} • Assets: {m.assets.length} • Threats: {m.threats.length}</p></div><button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">View</button></div></div>))}</div>
      </div>
    );
  }

  const tabs = [{ id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' }, { id: 'models' as TabType, label: 'Models', icon: '🗂️' }, { id: 'threats' as TabType, label: 'Threats', icon: '⚠️' }, { id: 'analysis' as TabType, label: 'Analysis', icon: '🔬' }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-orange-950 text-white">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center">🎯</div><div><h1 className="text-xl font-bold">ThreatModel</h1><p className="text-gray-400 text-sm">Threat Modeling & Analysis</p></div></div>{usingSimulated && <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-500/30 text-yellow-400 rounded-full text-sm">🔄 Simulation Mode</span>}</div>
          <nav className="flex gap-2 mt-4">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg ${activeTab === tab.id ? 'bg-orange-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'}`}><span className="mr-2">{tab.icon}</span>{tab.label}</button>))}</nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>}
        {!loading && activeTab === 'dashboard' && renderDashboard()}
        {!loading && activeTab === 'models' && renderModels()}
        {!loading && activeTab === 'threats' && <div className="text-gray-400 text-center py-12">Threat library coming soon...</div>}
        {!loading && activeTab === 'analysis' && <div className="text-gray-400 text-center py-12">AI threat analysis coming soon...</div>}
      </main>
      <footer className="border-t border-gray-800 py-4 mt-12"><div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">ThreatModel Tool 18 • VictoryKit Security Platform</div></footer>
    </div>
  );
}
