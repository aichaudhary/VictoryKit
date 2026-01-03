/**
 * RiskAssess Tool Component - Tool 19 - Risk Assessment & Management
 */
import { useState, useEffect } from 'react';
import { riskAssessApi, simulatedData, type Risk, type RiskDashboard } from '../api/riskassess.api';

type TabType = 'dashboard' | 'risks' | 'matrix' | 'reports';

export default function RiskAssessTool() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboard, setDashboard] = useState<RiskDashboard | null>(null);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingSimulated, setUsingSimulated] = useState(false);

  useEffect(() => { loadDashboard(); }, []);
  useEffect(() => { if (activeTab === 'risks') loadRisks(); }, [activeTab]);

  async function loadDashboard() {
    setLoading(true);
    try { const r = await riskAssessApi.getDashboard(); if (r.success && r.data) { setDashboard(r.data); setUsingSimulated(false); } else { setDashboard(simulatedData.dashboard); setUsingSimulated(true); } }
    catch { setDashboard(simulatedData.dashboard); setUsingSimulated(true); } finally { setLoading(false); }
  }

  async function loadRisks() {
    setLoading(true);
    try { const r = await riskAssessApi.getRisks(); if (r.success && r.data) { setRisks(r.data); setUsingSimulated(false); } else { setRisks(simulatedData.risks); setUsingSimulated(true); } }
    catch { setRisks(simulatedData.risks); setUsingSimulated(true); } finally { setLoading(false); }
  }

  function renderDashboard() {
    if (!dashboard) return <div className="text-gray-400">Loading...</div>;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-violet-500/20"><p className="text-gray-400 text-sm">Total Risks</p><p className="text-2xl font-bold text-violet-400">{dashboard.overview.totalRisks}</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-red-500/20"><p className="text-gray-400 text-sm">High Risks</p><p className="text-2xl font-bold text-red-400">{dashboard.overview.highRisks}</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-yellow-500/20"><p className="text-gray-400 text-sm">Open Risks</p><p className="text-2xl font-bold text-yellow-400">{dashboard.overview.openRisks}</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-blue-500/20"><p className="text-gray-400 text-sm">Avg Score</p><p className="text-2xl font-bold text-blue-400">{dashboard.overview.avgRiskScore.toFixed(1)}</p></div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Top Risks</h3>
          <div className="space-y-3">{dashboard.topRisks.map(r => (<div key={r._id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${r.riskScore >= 8 ? 'bg-red-600' : r.riskScore >= 5 ? 'bg-yellow-600' : 'bg-green-600'}`}>{r.riskScore.toFixed(1)}</div><div><p className="text-white">{r.name}</p><p className="text-gray-500 text-sm">{r.category} • Owner: {r.owner}</p></div></div><span className={`px-2 py-1 rounded text-sm ${r.status === 'mitigated' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>{r.status}</span></div>))}</div>
        </div>
      </div>
    );
  }

  function renderRisks() {
    return (
      <div className="space-y-4">
        <div className="flex justify-end"><button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg">+ New Risk</button></div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full"><thead className="bg-gray-900/50"><tr><th className="text-left p-4 text-gray-400">Risk</th><th className="text-left p-4 text-gray-400">Category</th><th className="text-left p-4 text-gray-400">Score</th><th className="text-left p-4 text-gray-400">Owner</th><th className="text-left p-4 text-gray-400">Status</th></tr></thead>
            <tbody>{risks.map(r => (<tr key={r._id} className="border-t border-gray-700 hover:bg-gray-800/50"><td className="p-4"><div><p className="text-white">{r.name}</p><p className="text-gray-500 text-sm">{r.description}</p></div></td><td className="p-4 text-violet-400">{r.category}</td><td className="p-4"><span className={`px-2 py-1 rounded font-bold ${r.riskScore >= 8 ? 'bg-red-900/30 text-red-400' : r.riskScore >= 5 ? 'bg-yellow-900/30 text-yellow-400' : 'bg-green-900/30 text-green-400'}`}>{r.riskScore.toFixed(1)}</span></td><td className="p-4 text-gray-400">{r.owner}</td><td className="p-4"><span className={`px-2 py-1 rounded text-sm ${r.status === 'mitigated' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>{r.status}</span></td></tr>))}</tbody>
          </table>
        </div>
      </div>
    );
  }

  const tabs = [{ id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' }, { id: 'risks' as TabType, label: 'Risks', icon: '⚠️' }, { id: 'matrix' as TabType, label: 'Matrix', icon: '📈' }, { id: 'reports' as TabType, label: 'Reports', icon: '📑' }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-violet-950 text-white">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">📊</div><div><h1 className="text-xl font-bold">RiskAssess</h1><p className="text-gray-400 text-sm">Risk Assessment & Management</p></div></div>{usingSimulated && <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-500/30 text-yellow-400 rounded-full text-sm">🔄 Simulation Mode</span>}</div>
          <nav className="flex gap-2 mt-4">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg ${activeTab === tab.id ? 'bg-violet-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'}`}><span className="mr-2">{tab.icon}</span>{tab.label}</button>))}</nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>}
        {!loading && activeTab === 'dashboard' && renderDashboard()}
        {!loading && activeTab === 'risks' && renderRisks()}
        {!loading && activeTab === 'matrix' && <div className="text-gray-400 text-center py-12">Risk matrix visualization coming soon...</div>}
        {!loading && activeTab === 'reports' && <div className="text-gray-400 text-center py-12">Risk reports coming soon...</div>}
      </main>
      <footer className="border-t border-gray-800 py-4 mt-12"><div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">RiskAssess Tool 19 • VictoryKit Security Platform</div></footer>
    </div>
  );
}
