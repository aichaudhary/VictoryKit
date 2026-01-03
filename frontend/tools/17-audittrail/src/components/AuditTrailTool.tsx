/**
 * AuditTrail Tool Component - Tool 17 - Compliance Audit Logging
 */
import { useState, useEffect } from 'react';
import { auditTrailApi, simulatedData, type AuditEvent, type AuditDashboard } from '../api/audittrail.api';

type TabType = 'dashboard' | 'events' | 'search' | 'reports';

export default function AuditTrailTool() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboard, setDashboard] = useState<AuditDashboard | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingSimulated, setUsingSimulated] = useState(false);

  useEffect(() => { loadDashboard(); }, []);
  useEffect(() => { if (activeTab === 'events') loadEvents(); }, [activeTab]);

  async function loadDashboard() {
    setLoading(true);
    try { const r = await auditTrailApi.getDashboard(); if (r.success && r.data) { setDashboard(r.data); setUsingSimulated(false); } else { setDashboard(simulatedData.dashboard); setUsingSimulated(true); } }
    catch { setDashboard(simulatedData.dashboard); setUsingSimulated(true); } finally { setLoading(false); }
  }

  async function loadEvents() {
    setLoading(true);
    try { const r = await auditTrailApi.getEvents(); if (r.success && r.data) { setEvents(r.data.events); setUsingSimulated(false); } else { setEvents(simulatedData.events); setUsingSimulated(true); } }
    catch { setEvents(simulatedData.events); setUsingSimulated(true); } finally { setLoading(false); }
  }

  function renderDashboard() {
    if (!dashboard) return <div className="text-gray-400">Loading...</div>;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-pink-500/20"><p className="text-gray-400 text-sm">Total Events</p><p className="text-2xl font-bold text-pink-400">{(dashboard.overview.totalEvents/1000).toFixed(0)}K</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/20"><p className="text-gray-400 text-sm">Success Rate</p><p className="text-2xl font-bold text-green-400">{dashboard.overview.successRate}%</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-blue-500/20"><p className="text-gray-400 text-sm">Unique Actors</p><p className="text-2xl font-bold text-blue-400">{dashboard.overview.uniqueActors}</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-red-500/20"><p className="text-gray-400 text-sm">Critical Events</p><p className="text-2xl font-bold text-red-400">{dashboard.overview.criticalEvents}</p></div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Recent Events</h3>
          <div className="space-y-3">{dashboard.recentEvents.map(e => (<div key={e._id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"><div className="flex items-center gap-3"><span className={`w-3 h-3 rounded-full ${e.outcome === 'success' ? 'bg-green-500' : 'bg-red-500'}`} /><div><p className="text-white"><span className="text-pink-400">{e.action}</span> on {e.resource}</p><p className="text-gray-500 text-sm">{e.actor} • {e.ipAddress}</p></div></div><span className="text-gray-400 text-sm">{new Date(e.timestamp).toLocaleTimeString()}</span></div>))}</div>
        </div>
      </div>
    );
  }

  function renderEvents() {
    return (
      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full"><thead className="bg-gray-900/50"><tr><th className="text-left p-4 text-gray-400">Time</th><th className="text-left p-4 text-gray-400">Action</th><th className="text-left p-4 text-gray-400">Actor</th><th className="text-left p-4 text-gray-400">Resource</th><th className="text-left p-4 text-gray-400">Outcome</th></tr></thead>
            <tbody>{events.map(e => (<tr key={e._id} className="border-t border-gray-700 hover:bg-gray-800/50"><td className="p-4 text-gray-400 text-sm">{new Date(e.timestamp).toLocaleString()}</td><td className="p-4 text-pink-400">{e.action}</td><td className="p-4 text-white">{e.actor}</td><td className="p-4 text-cyan-400">{e.resource}</td><td className="p-4"><span className={`px-2 py-1 rounded text-sm ${e.outcome === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{e.outcome}</span></td></tr>))}</tbody>
          </table>
        </div>
      </div>
    );
  }

  const tabs = [{ id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' }, { id: 'events' as TabType, label: 'Events', icon: '📋' }, { id: 'search' as TabType, label: 'Search', icon: '🔍' }, { id: 'reports' as TabType, label: 'Reports', icon: '📑' }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-pink-950 text-white">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-pink-600 flex items-center justify-center">📋</div><div><h1 className="text-xl font-bold">AuditTrail</h1><p className="text-gray-400 text-sm">Compliance Audit Logging</p></div></div>{usingSimulated && <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-500/30 text-yellow-400 rounded-full text-sm">🔄 Simulation Mode</span>}</div>
          <nav className="flex gap-2 mt-4">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg ${activeTab === tab.id ? 'bg-pink-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'}`}><span className="mr-2">{tab.icon}</span>{tab.label}</button>))}</nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>}
        {!loading && activeTab === 'dashboard' && renderDashboard()}
        {!loading && activeTab === 'events' && renderEvents()}
        {!loading && activeTab === 'search' && <div className="text-gray-400 text-center py-12">Advanced search coming soon...</div>}
        {!loading && activeTab === 'reports' && <div className="text-gray-400 text-center py-12">Compliance reports coming soon...</div>}
      </main>
      <footer className="border-t border-gray-800 py-4 mt-12"><div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">AuditTrail Tool 17 • VictoryKit Security Platform</div></footer>
    </div>
  );
}
