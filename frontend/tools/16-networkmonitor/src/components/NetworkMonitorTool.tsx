/**
 * NetworkMonitor Tool Component - Tool 16 - Network Traffic Analysis
 */
import { useState, useEffect } from 'react';
import { networkMonitorApi, simulatedData, type NetworkDevice, type NetworkDashboard, type NetworkAlert } from '../api/networkmonitor.api';

type TabType = 'dashboard' | 'devices' | 'alerts' | 'topology';

export default function NetworkMonitorTool() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboard, setDashboard] = useState<NetworkDashboard | null>(null);
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingSimulated, setUsingSimulated] = useState(false);

  useEffect(() => { loadDashboard(); }, []);
  useEffect(() => { if (activeTab === 'devices') loadDevices(); }, [activeTab]);

  async function loadDashboard() {
    setLoading(true);
    try { const r = await networkMonitorApi.getDashboard(); if (r.success && r.data) { setDashboard(r.data); setUsingSimulated(false); } else { setDashboard(simulatedData.dashboard); setUsingSimulated(true); } }
    catch { setDashboard(simulatedData.dashboard); setUsingSimulated(true); } finally { setLoading(false); }
  }

  async function loadDevices() {
    setLoading(true);
    try { const r = await networkMonitorApi.getDevices(); if (r.success && r.data) { setDevices(r.data); setUsingSimulated(false); } else { setDevices(simulatedData.devices); setUsingSimulated(true); } }
    catch { setDevices(simulatedData.devices); setUsingSimulated(true); } finally { setLoading(false); }
  }

  function renderDashboard() {
    if (!dashboard) return <div className="text-gray-400">Loading...</div>;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-teal-500/20"><p className="text-gray-400 text-sm">Devices Online</p><p className="text-2xl font-bold text-teal-400">{dashboard.overview.devicesOnline}</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-red-500/20"><p className="text-gray-400 text-sm">Devices Offline</p><p className="text-2xl font-bold text-red-400">{dashboard.overview.devicesOffline}</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-yellow-500/20"><p className="text-gray-400 text-sm">Active Alerts</p><p className="text-2xl font-bold text-yellow-400">{dashboard.overview.activeAlerts}</p></div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-blue-500/20"><p className="text-gray-400 text-sm">Bandwidth (Mbps)</p><p className="text-2xl font-bold text-blue-400">{(dashboard.overview.totalBandwidth/1000).toFixed(1)}K</p></div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Recent Alerts</h3>
          <div className="space-y-3">{dashboard.recentAlerts.map(a => (<div key={a._id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"><div className="flex items-center gap-3"><span className={`w-3 h-3 rounded-full ${a.severity === 'critical' ? 'bg-red-500' : a.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}`} /><div><p className="text-white">{a.message}</p><p className="text-gray-500 text-sm">{a.source} • {a.type}</p></div></div><span className="text-gray-400 text-sm">{new Date(a.timestamp).toLocaleTimeString()}</span></div>))}</div>
        </div>
      </div>
    );
  }

  function renderDevices() {
    return (
      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full"><thead className="bg-gray-900/50"><tr><th className="text-left p-4 text-gray-400">Device</th><th className="text-left p-4 text-gray-400">IP</th><th className="text-left p-4 text-gray-400">Type</th><th className="text-left p-4 text-gray-400">Status</th><th className="text-left p-4 text-gray-400">Bandwidth</th></tr></thead>
            <tbody>{devices.map(d => (<tr key={d._id} className="border-t border-gray-700 hover:bg-gray-800/50"><td className="p-4 text-white">{d.name}</td><td className="p-4 text-teal-400 font-mono text-sm">{d.ip}</td><td className="p-4 text-gray-400 capitalize">{d.type}</td><td className="p-4"><span className={`px-2 py-1 rounded text-sm ${d.status === 'online' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{d.status}</span></td><td className="p-4 text-gray-400">↓{d.bandwidth.in} ↑{d.bandwidth.out}</td></tr>))}</tbody>
          </table>
        </div>
      </div>
    );
  }

  const tabs = [{ id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' }, { id: 'devices' as TabType, label: 'Devices', icon: '🖥️' }, { id: 'alerts' as TabType, label: 'Alerts', icon: '🚨' }, { id: 'topology' as TabType, label: 'Topology', icon: '🕸️' }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-teal-950 text-white">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">🌐</div><div><h1 className="text-xl font-bold">NetworkMonitor</h1><p className="text-gray-400 text-sm">Network Traffic Analysis</p></div></div>{usingSimulated && <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-500/30 text-yellow-400 rounded-full text-sm">🔄 Simulation Mode</span>}</div>
          <nav className="flex gap-2 mt-4">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg ${activeTab === tab.id ? 'bg-teal-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'}`}><span className="mr-2">{tab.icon}</span>{tab.label}</button>))}</nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>}
        {!loading && activeTab === 'dashboard' && renderDashboard()}
        {!loading && activeTab === 'devices' && renderDevices()}
        {!loading && activeTab === 'alerts' && <div className="text-gray-400 text-center py-12">Alerts view coming soon...</div>}
        {!loading && activeTab === 'topology' && <div className="text-gray-400 text-center py-12">Network topology visualization coming soon...</div>}
      </main>
      <footer className="border-t border-gray-800 py-4 mt-12"><div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">NetworkMonitor Tool 16 • VictoryKit Security Platform</div></footer>
    </div>
  );
}
