/**
 * NetworkMonitor Tool Component - Tool 16 - Real-Time Network Traffic Analysis
 * Enhanced with WebSocket real-time updates, full alerts management, and topology view
 */
import { useState, useEffect, useCallback } from 'react';
import { 
  networkMonitorApi, 
  wsManager,
  simulatedData, 
  formatBytes, 
  formatUptime,
  type NetworkDevice, 
  type DashboardOverview, 
  type NetworkAlert 
} from '../api/networkmonitor.api';

type TabType = 'dashboard' | 'devices' | 'alerts' | 'topology' | 'traffic';

// Device type icons
const deviceIcons: Record<string, string> = {
  router: '🌐', switch: '🔀', server: '🖥️', firewall: '🛡️', 
  endpoint: '💻', ap: '📶', printer: '🖨️', iot: '📡', other: '❓'
};

// Severity colors
const severityColors: Record<string, string> = {
  critical: 'bg-red-600 text-white', high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black', low: 'bg-blue-500 text-white'
};

const statusColors: Record<string, string> = {
  online: 'bg-green-500', offline: 'bg-red-500', warning: 'bg-yellow-500', 
  critical: 'bg-red-600', unknown: 'bg-gray-500'
};

export default function NetworkMonitorTool() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [alerts, setAlerts] = useState<NetworkAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingSimulated, setUsingSimulated] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  const [deviceFilter, setDeviceFilter] = useState({ status: '', type: '', search: '' });
  const [alertFilter, setAlertFilter] = useState({ severity: '', status: '', type: '' });
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    wsManager.connect();
    wsManager.on('connected', () => setWsConnected(true));
    wsManager.on('disconnected', () => setWsConnected(false));
    wsManager.on('device-update', (data: unknown) => {
      const update = data as { device: NetworkDevice };
      setDevices(prev => prev.map(d => d._id === update.device._id ? update.device : d));
    });
    wsManager.on('alert', (data: unknown) => {
      const alertData = data as { alert: NetworkAlert };
      setAlerts(prev => [alertData.alert, ...prev].slice(0, 100));
    });
    wsManager.on('metrics', () => loadDashboard());

    // Subscribe to topics
    wsManager.subscribe('devices');
    wsManager.subscribe('alerts');
    wsManager.subscribe('metrics');

    return () => {
      wsManager.disconnect();
    };
  }, []);

  // Load data on tab change
  useEffect(() => { loadDashboard(); }, []);
  useEffect(() => { if (activeTab === 'devices') loadDevices(); }, [activeTab, deviceFilter]);
  useEffect(() => { if (activeTab === 'alerts') loadAlerts(); }, [activeTab, alertFilter]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(() => {
        if (activeTab === 'dashboard') loadDashboard();
        else if (activeTab === 'devices') loadDevices();
        else if (activeTab === 'alerts') loadAlerts();
      }, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, activeTab]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const r = await networkMonitorApi.getDashboardOverview();
      if (r.success && r.data) { setDashboard(r.data); setUsingSimulated(false); }
      else { setDashboard(simulatedData.dashboard); setUsingSimulated(true); }
    } catch { setDashboard(simulatedData.dashboard); setUsingSimulated(true); }
    finally { setLoading(false); }
  }, []);

  const loadDevices = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (deviceFilter.status) params.status = deviceFilter.status;
      if (deviceFilter.type) params.type = deviceFilter.type;
      if (deviceFilter.search) params.search = deviceFilter.search;
      const r = await networkMonitorApi.getDevices(params);
      if (r.success && r.data) { setDevices(r.data); setUsingSimulated(false); }
      else { setDevices(simulatedData.devices); setUsingSimulated(true); }
    } catch { setDevices(simulatedData.devices); setUsingSimulated(true); }
    finally { setLoading(false); }
  }, [deviceFilter]);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | boolean | number> = { limit: 50 };
      if (alertFilter.severity) params.severity = alertFilter.severity;
      if (alertFilter.status) params.status = alertFilter.status;
      if (alertFilter.type) params.type = alertFilter.type;
      const r = await networkMonitorApi.getAlerts(params);
      if (r.success && r.data) { setAlerts(r.data); setUsingSimulated(false); }
      else { setAlerts(simulatedData.alerts); setUsingSimulated(true); }
    } catch { setAlerts(simulatedData.alerts); setUsingSimulated(true); }
    finally { setLoading(false); }
  }, [alertFilter]);

  const acknowledgeAlert = async (alertId: string) => {
    const r = await networkMonitorApi.acknowledgeAlert(alertId);
    if (r.success) loadAlerts();
  };

  const resolveAlert = async (alertId: string) => {
    const r = await networkMonitorApi.resolveAlert(alertId);
    if (r.success) loadAlerts();
  };

  const checkDeviceStatus = async (deviceId: string) => {
    const r = await networkMonitorApi.checkDeviceStatus(deviceId);
    if (r.success) loadDevices();
  };

  const discoverDevices = async () => {
    const subnet = prompt('Enter subnet to scan (e.g., 10.0.0.0/24):');
    if (subnet) {
      setLoading(true);
      await networkMonitorApi.autoDiscoverDevices(subnet);
      loadDevices();
    }
  };

  function renderDashboard() {
    if (!dashboard) return <div className="text-gray-400">Loading...</div>;
    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-teal-500/20">
            <p className="text-gray-400 text-sm">Total Devices</p>
            <p className="text-2xl font-bold text-white">{dashboard.devices.total}</p>
            <p className="text-teal-400 text-sm">{dashboard.devices.healthPercent}% healthy</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/20">
            <p className="text-gray-400 text-sm">Online</p>
            <p className="text-2xl font-bold text-green-400">{dashboard.devices.online}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-red-500/20">
            <p className="text-gray-400 text-sm">Offline</p>
            <p className="text-2xl font-bold text-red-400">{dashboard.devices.offline}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-yellow-500/20">
            <p className="text-gray-400 text-sm">Open Alerts</p>
            <p className="text-2xl font-bold text-yellow-400">{dashboard.alerts.open}</p>
            <p className="text-red-400 text-sm">{dashboard.alerts.critical} critical</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-blue-500/20">
            <p className="text-gray-400 text-sm">Traffic/Hour</p>
            <p className="text-2xl font-bold text-blue-400">{dashboard.traffic.bytesFormatted}</p>
            <p className="text-gray-500 text-sm">{dashboard.traffic.flowsLastHour.toLocaleString()} flows</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-purple-500/20">
            <p className="text-gray-400 text-sm">Live Clients</p>
            <p className="text-2xl font-bold text-purple-400">{dashboard.wsClients}</p>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {wsConnected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">🚨</span> Recent Alerts
            </h3>
            <div className="space-y-3">
              {dashboard.recentAlerts.slice(0, 5).map(a => (
                <div key={a._id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${severityColors[a.severity]}`}>
                      {a.severity.toUpperCase()}
                    </span>
                    <div>
                      <p className="text-white font-medium">{a.title}</p>
                      <p className="text-gray-500 text-sm">{a.source?.ip} • {a.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 text-sm">{new Date(a.timestamp).toLocaleTimeString()}</span>
                    <p className="text-gray-500 text-xs">{a.occurrenceCount}x</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Devices by Traffic */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">📊</span> Top Devices by Traffic
            </h3>
            <div className="space-y-3">
              {dashboard.topDevices.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 font-mono w-6">{idx + 1}</span>
                    <div>
                      <p className="text-white font-medium">{item.device.name}</p>
                      <p className="text-teal-400 text-sm font-mono">{item.device.ip}</p>
                    </div>
                  </div>
                  <span className="text-gray-400">{formatBytes(item.bytes)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderDevices() {
    return (
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search devices..."
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-teal-500 focus:outline-none"
            value={deviceFilter.search}
            onChange={e => setDeviceFilter(prev => ({ ...prev, search: e.target.value }))}
          />
          <select 
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            value={deviceFilter.status}
            onChange={e => setDeviceFilter(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <select 
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            value={deviceFilter.type}
            onChange={e => setDeviceFilter(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="">All Types</option>
            <option value="router">Router</option>
            <option value="switch">Switch</option>
            <option value="server">Server</option>
            <option value="firewall">Firewall</option>
            <option value="endpoint">Endpoint</option>
            <option value="ap">Access Point</option>
          </select>
          <button 
            onClick={discoverDevices}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-white flex items-center gap-2"
          >
            <span>🔍</span> Discover
          </button>
          <button 
            onClick={() => loadDevices()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Device Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map(d => (
            <div 
              key={d._id} 
              className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-teal-500/50 cursor-pointer transition-colors"
              onClick={() => setSelectedDevice(d)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{deviceIcons[d.type] || '❓'}</span>
                  <div>
                    <p className="text-white font-semibold">{d.name}</p>
                    <p className="text-teal-400 font-mono text-sm">{d.ip}</p>
                  </div>
                </div>
                <span className={`w-3 h-3 rounded-full ${statusColors[d.status]}`}></span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="text-gray-300 capitalize">{d.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Vendor</p>
                  <p className="text-gray-300">{d.vendor || 'Unknown'}</p>
                </div>
                {d.uptime !== undefined && d.uptime > 0 && (
                  <div>
                    <p className="text-gray-500">Uptime</p>
                    <p className="text-gray-300">{formatUptime(d.uptime)}</p>
                  </div>
                )}
                {d.metrics?.cpu !== undefined && (
                  <div>
                    <p className="text-gray-500">CPU</p>
                    <p className={`${d.metrics.cpu > 80 ? 'text-red-400' : d.metrics.cpu > 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {d.metrics.cpu}%
                    </p>
                  </div>
                )}
              </div>
              {d.bandwidth && (
                <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between text-sm">
                  <span className="text-green-400">↓ {formatBytes(d.bandwidth.in)}/s</span>
                  <span className="text-blue-400">↑ {formatBytes(d.bandwidth.out)}/s</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Device Detail Modal */}
        {selectedDevice && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDevice(null)}>
            <div className="bg-gray-800 rounded-xl p-6 max-w-lg w-full border border-gray-700" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{deviceIcons[selectedDevice.type]}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedDevice.name}</h3>
                    <p className="text-teal-400 font-mono">{selectedDevice.ip}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedDevice(null)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><p className="text-gray-500 text-sm">MAC Address</p><p className="text-white font-mono">{selectedDevice.mac || 'N/A'}</p></div>
                <div><p className="text-gray-500 text-sm">Status</p><p className={`inline-block px-2 py-1 rounded text-sm ${selectedDevice.status === 'online' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{selectedDevice.status}</p></div>
                <div><p className="text-gray-500 text-sm">Vendor</p><p className="text-white">{selectedDevice.vendor || 'Unknown'}</p></div>
                <div><p className="text-gray-500 text-sm">Type</p><p className="text-white capitalize">{selectedDevice.type}</p></div>
                {selectedDevice.uptime !== undefined && <div><p className="text-gray-500 text-sm">Uptime</p><p className="text-white">{formatUptime(selectedDevice.uptime)}</p></div>}
                {selectedDevice.metrics?.latency !== undefined && <div><p className="text-gray-500 text-sm">Latency</p><p className="text-white">{selectedDevice.metrics.latency}ms</p></div>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => checkDeviceStatus(selectedDevice._id)} className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-white">Check Status</button>
                <button onClick={() => setSelectedDevice(null)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderAlerts() {
    return (
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <select 
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            value={alertFilter.severity}
            onChange={e => setAlertFilter(prev => ({ ...prev, severity: e.target.value }))}
          >
            <option value="">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select 
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            value={alertFilter.status}
            onChange={e => setAlertFilter(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>
          <select 
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            value={alertFilter.type}
            onChange={e => setAlertFilter(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="">All Types</option>
            <option value="intrusion">Intrusion</option>
            <option value="anomaly">Anomaly</option>
            <option value="threshold">Threshold</option>
            <option value="connectivity">Connectivity</option>
          </select>
          <button onClick={() => loadAlerts()} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">🔄 Refresh</button>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {alerts.map(a => (
            <div key={a._id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${severityColors[a.severity]}`}>
                    {a.severity.toUpperCase()}
                  </span>
                  <div>
                    <p className="text-white font-semibold">{a.title}</p>
                    <p className="text-gray-400 mt-1">{a.message}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>📍 {a.source?.ip || 'Unknown'}</span>
                      <span>📋 {a.type}</span>
                      <span>🔁 {a.occurrenceCount}x</span>
                      <span>🕐 {new Date(a.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <span className={`px-2 py-1 rounded text-xs ${
                    a.status === 'open' ? 'bg-red-900/30 text-red-400' :
                    a.status === 'acknowledged' ? 'bg-yellow-900/30 text-yellow-400' :
                    a.status === 'investigating' ? 'bg-blue-900/30 text-blue-400' :
                    'bg-green-900/30 text-green-400'
                  }`}>
                    {a.status}
                  </span>
                  {!a.resolved && (
                    <div className="flex gap-2">
                      {!a.acknowledged && (
                        <button onClick={() => acknowledgeAlert(a._id)} className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-xs">
                          ACK
                        </button>
                      )}
                      <button onClick={() => resolveAlert(a._id)} className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-xs">
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderTopology() {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <span className="text-xl">🕸️</span> Network Topology
          </h3>
          <button onClick={() => loadDevices()} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-white text-sm">
            Refresh Map
          </button>
        </div>
        {/* Simple Network Map Visualization */}
        <div className="min-h-[400px] bg-gray-900/50 rounded-lg p-6 flex items-center justify-center">
          <div className="relative w-full max-w-2xl">
            {/* Central Node */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-teal-500/20 z-10">
              🌐
            </div>
            {/* Orbiting Nodes */}
            {devices.slice(0, 6).map((device, idx) => {
              const angle = (idx / 6) * 2 * Math.PI - Math.PI / 2;
              const radius = 140;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              return (
                <div
                  key={device._id}
                  className={`absolute w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-lg cursor-pointer transition-transform hover:scale-110 ${
                    device.status === 'online' ? 'bg-green-600' : device.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ 
                    left: `calc(50% + ${x}px - 28px)`, 
                    top: `calc(50% + ${y}px - 28px)` 
                  }}
                  title={`${device.name} (${device.ip})`}
                  onClick={() => setSelectedDevice(device)}
                >
                  {deviceIcons[device.type]}
                </div>
              );
            })}
            {/* Connection Lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: '320px' }}>
              {devices.slice(0, 6).map((device, idx) => {
                const angle = (idx / 6) * 2 * Math.PI - Math.PI / 2;
                const radius = 140;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                return (
                  <line
                    key={device._id}
                    x1="50%"
                    y1="50%"
                    x2={`calc(50% + ${x}px)`}
                    y2={`calc(50% + ${y}px)`}
                    stroke={device.status === 'online' ? '#10b981' : device.status === 'warning' ? '#f59e0b' : '#ef4444'}
                    strokeWidth="2"
                    strokeDasharray={device.status === 'offline' ? '5,5' : 'none'}
                    opacity="0.5"
                  />
                );
              })}
            </svg>
          </div>
        </div>
        <p className="text-gray-500 text-sm text-center mt-4">Click on a device to view details • Showing first 6 devices</p>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: '📊' },
    { id: 'devices' as TabType, label: 'Devices', icon: '🖥️', badge: devices.length },
    { id: 'alerts' as TabType, label: 'Alerts', icon: '🚨', badge: alerts.filter(a => !a.resolved).length },
    { id: 'topology' as TabType, label: 'Topology', icon: '🕸️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-teal-950 text-white">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-xl">🌐</div>
              <div>
                <h1 className="text-xl font-bold">NetworkMonitor</h1>
                <p className="text-gray-400 text-sm">Real-Time Network Traffic Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span className="text-gray-400 text-sm">{wsConnected ? 'Live' : 'Offline'}</span>
              </div>
              <select 
                className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white"
                value={refreshInterval || ''}
                onChange={e => setRefreshInterval(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Manual Refresh</option>
                <option value="5">5s Auto</option>
                <option value="15">15s Auto</option>
                <option value="30">30s Auto</option>
                <option value="60">1m Auto</option>
              </select>
              {usingSimulated && (
                <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-500/30 text-yellow-400 rounded-full text-sm">
                  🔄 Demo Mode
                </span>
              )}
            </div>
          </div>
          <nav className="flex gap-2 mt-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  activeTab === tab.id ? 'bg-teal-600 text-white' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-2 py-0.5 bg-gray-700 rounded-full text-xs">{tab.badge}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && activeTab === 'dashboard' && renderDashboard()}
        {!loading && activeTab === 'devices' && renderDevices()}
        {!loading && activeTab === 'alerts' && renderAlerts()}
        {!loading && activeTab === 'topology' && renderTopology()}
      </main>

      <footer className="border-t border-gray-800 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          NetworkMonitor Tool 16 • VictoryKit Security Platform • Real-Time Network Monitoring
        </div>
      </footer>
    </div>
  );
}
