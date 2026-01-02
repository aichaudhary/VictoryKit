import React, { useState, useEffect } from 'react';
import { Monitor, Wifi, WifiOff, Activity, HardDrive, Usb, Clipboard, Printer, Camera, RefreshCw } from 'lucide-react';
import { dlpAPI } from '../services/dlpAPI';
import { EndpointAgent } from '../types';

const EndpointMonitor: React.FC = () => {
  const [endpoints, setEndpoints] = useState<EndpointAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointAgent | null>(null);

  useEffect(() => {
    loadEndpoints();
    // Simulate real-time updates
    const interval = setInterval(updateEndpointStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadEndpoints = async () => {
    try {
      const data = await dlpAPI.endpoints.list();
      setEndpoints(data);
    } catch (error) {
      // Load sample endpoints
      setEndpoints([
        {
          id: '1',
          hostname: 'LAPTOP-DEV-001',
          os: 'Windows 11 Pro',
          osVersion: '22H2',
          agentVersion: '2.5.1',
          status: 'online',
          lastSeen: new Date().toISOString(),
          user: 'john.doe@company.com',
          ip: '192.168.1.101',
          policyGroups: ['developers', 'default'],
          features: {
            usbMonitoring: true,
            clipboardMonitoring: true,
            printMonitoring: true,
            screenCapture: false,
            fileTransfer: true,
          },
          stats: {
            blockedActions: 12,
            alertsGenerated: 45,
            filesScanned: 1523,
          },
        },
        {
          id: '2',
          hostname: 'DESKTOP-FIN-042',
          os: 'Windows 11 Enterprise',
          osVersion: '22H2',
          agentVersion: '2.5.1',
          status: 'online',
          lastSeen: new Date().toISOString(),
          user: 'jane.smith@company.com',
          ip: '192.168.1.142',
          policyGroups: ['finance', 'pci-dss'],
          features: {
            usbMonitoring: true,
            clipboardMonitoring: true,
            printMonitoring: true,
            screenCapture: true,
            fileTransfer: true,
          },
          stats: {
            blockedActions: 3,
            alertsGenerated: 15,
            filesScanned: 892,
          },
        },
        {
          id: '3',
          hostname: 'MACBOOK-EXEC-007',
          os: 'macOS',
          osVersion: 'Sonoma 14.2',
          agentVersion: '2.5.0',
          status: 'online',
          lastSeen: new Date(Date.now() - 60000).toISOString(),
          user: 'ceo@company.com',
          ip: '192.168.1.50',
          policyGroups: ['executives', 'confidential'],
          features: {
            usbMonitoring: true,
            clipboardMonitoring: false,
            printMonitoring: true,
            screenCapture: false,
            fileTransfer: true,
          },
          stats: {
            blockedActions: 0,
            alertsGenerated: 8,
            filesScanned: 423,
          },
        },
        {
          id: '4',
          hostname: 'LAPTOP-HR-015',
          os: 'Windows 10 Pro',
          osVersion: '22H2',
          agentVersion: '2.4.8',
          status: 'offline',
          lastSeen: new Date(Date.now() - 3600000 * 2).toISOString(),
          user: 'hr.manager@company.com',
          ip: '192.168.1.215',
          policyGroups: ['hr', 'pii-protection'],
          features: {
            usbMonitoring: true,
            clipboardMonitoring: true,
            printMonitoring: true,
            screenCapture: true,
            fileTransfer: true,
          },
          stats: {
            blockedActions: 7,
            alertsGenerated: 23,
            filesScanned: 1102,
          },
        },
        {
          id: '5',
          hostname: 'WORKSTATION-LAB-001',
          os: 'Ubuntu',
          osVersion: '22.04 LTS',
          agentVersion: '2.5.1',
          status: 'warning',
          lastSeen: new Date(Date.now() - 300000).toISOString(),
          user: 'research@company.com',
          ip: '192.168.1.88',
          policyGroups: ['research', 'ip-protection'],
          features: {
            usbMonitoring: true,
            clipboardMonitoring: false,
            printMonitoring: false,
            screenCapture: false,
            fileTransfer: true,
          },
          stats: {
            blockedActions: 25,
            alertsGenerated: 67,
            filesScanned: 3421,
          },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateEndpointStatus = () => {
    setEndpoints(prev => prev.map(ep => ({
      ...ep,
      lastSeen: ep.status === 'online' ? new Date().toISOString() : ep.lastSeen,
    })));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-slate-500';
      case 'warning': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  const getOsIcon = (os: string) => {
    if (os.includes('Windows')) return '🪟';
    if (os.includes('macOS')) return '🍎';
    if (os.includes('Ubuntu') || os.includes('Linux')) return '🐧';
    return '💻';
  };

  const onlineCount = endpoints.filter(e => e.status === 'online').length;
  const warningCount = endpoints.filter(e => e.status === 'warning').length;
  const totalBlocked = endpoints.reduce((sum, e) => sum + (e.stats?.blockedActions || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4">
          <p className="text-sm text-slate-400">Total Endpoints</p>
          <p className="text-2xl font-bold mt-1">{endpoints.length}</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-green-500/30 p-4">
          <p className="text-sm text-slate-400">Online</p>
          <p className="text-2xl font-bold mt-1 text-green-400">{onlineCount}</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-yellow-500/30 p-4">
          <p className="text-sm text-slate-400">Warnings</p>
          <p className="text-2xl font-bold mt-1 text-yellow-400">{warningCount}</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-red-500/30 p-4">
          <p className="text-sm text-slate-400">Blocked Actions</p>
          <p className="text-2xl font-bold mt-1 text-red-400">{totalBlocked}</p>
        </div>
      </div>

      {/* Endpoint Grid */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Monitor className="w-5 h-5 text-purple-400" />
            Endpoint Agents
          </h3>
          <button
            onClick={loadEndpoints}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {endpoints.map(endpoint => (
            <div
              key={endpoint.id}
              onClick={() => setSelectedEndpoint(endpoint)}
              className={`p-4 rounded-xl border cursor-pointer transition-all hover:border-purple-500/50 ${
                endpoint.status === 'online'
                  ? 'bg-slate-800/50 border-green-500/30'
                  : endpoint.status === 'warning'
                  ? 'bg-slate-800/50 border-yellow-500/30'
                  : 'bg-slate-900/50 border-slate-700/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getOsIcon(endpoint.os)}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{endpoint.hostname}</h4>
                      {endpoint.status === 'online' ? (
                        <Wifi className={`w-4 h-4 ${getStatusColor(endpoint.status)}`} />
                      ) : (
                        <WifiOff className={`w-4 h-4 ${getStatusColor(endpoint.status)}`} />
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{endpoint.user}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded capitalize ${
                  endpoint.status === 'online' ? 'bg-green-500/20 text-green-400' :
                  endpoint.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  {endpoint.status}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                <span>{endpoint.os} {endpoint.osVersion}</span>
                <span>•</span>
                <span>Agent v{endpoint.agentVersion}</span>
              </div>

              {/* Feature Icons */}
              <div className="flex items-center gap-2 mb-3">
                {endpoint.features.usbMonitoring && (
                  <div className="p-1.5 bg-purple-500/20 rounded" title="USB Monitoring">
                    <Usb className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                )}
                {endpoint.features.clipboardMonitoring && (
                  <div className="p-1.5 bg-purple-500/20 rounded" title="Clipboard Monitoring">
                    <Clipboard className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                )}
                {endpoint.features.printMonitoring && (
                  <div className="p-1.5 bg-purple-500/20 rounded" title="Print Monitoring">
                    <Printer className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                )}
                {endpoint.features.screenCapture && (
                  <div className="p-1.5 bg-purple-500/20 rounded" title="Screen Capture Detection">
                    <Camera className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                )}
                {endpoint.features.fileTransfer && (
                  <div className="p-1.5 bg-purple-500/20 rounded" title="File Transfer Monitoring">
                    <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className="text-red-400">{endpoint.stats?.blockedActions || 0} blocked</span>
                  <span className="text-yellow-400">{endpoint.stats?.alertsGenerated || 0} alerts</span>
                </div>
                <span className="text-slate-500">
                  {endpoint.status === 'online' ? 'Now' : new Date(endpoint.lastSeen).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Activity */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-green-400 animate-pulse" />
          Real-time Activity
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {[
            { time: 'Just now', endpoint: 'LAPTOP-DEV-001', action: 'File scanned', type: 'scan' },
            { time: '5s ago', endpoint: 'DESKTOP-FIN-042', action: 'USB device blocked', type: 'block' },
            { time: '12s ago', endpoint: 'LAPTOP-DEV-001', action: 'Clipboard monitored', type: 'monitor' },
            { time: '30s ago', endpoint: 'MACBOOK-EXEC-007', action: 'Email attachment scanned', type: 'scan' },
            { time: '1m ago', endpoint: 'WORKSTATION-LAB-001', action: 'Sensitive data alert', type: 'alert' },
          ].map((activity, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 bg-slate-800/50 rounded-lg text-sm">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${
                  activity.type === 'block' ? 'bg-red-400' :
                  activity.type === 'alert' ? 'bg-yellow-400' :
                  'bg-green-400'
                }`} />
                <span className="font-medium">{activity.endpoint}</span>
                <span className="text-slate-400">{activity.action}</span>
              </div>
              <span className="text-xs text-slate-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Endpoint Detail Modal */}
      {selectedEndpoint && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-purple-500/30 w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getOsIcon(selectedEndpoint.os)}</span>
                <div>
                  <h3 className="font-semibold">{selectedEndpoint.hostname}</h3>
                  <p className="text-sm text-slate-400">{selectedEndpoint.user}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEndpoint(null)}
                className="p-2 hover:bg-slate-800 rounded-lg"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Operating System</p>
                  <p>{selectedEndpoint.os} {selectedEndpoint.osVersion}</p>
                </div>
                <div>
                  <p className="text-slate-400">IP Address</p>
                  <p className="font-mono">{selectedEndpoint.ip}</p>
                </div>
                <div>
                  <p className="text-slate-400">Agent Version</p>
                  <p>{selectedEndpoint.agentVersion}</p>
                </div>
                <div>
                  <p className="text-slate-400">Status</p>
                  <p className={getStatusColor(selectedEndpoint.status)}>{selectedEndpoint.status}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-400 mb-2">Policy Groups</p>
                <div className="flex flex-wrap gap-2">
                  {selectedEndpoint.policyGroups.map((group, i) => (
                    <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                      {group}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-400 mb-2">Monitoring Features</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className={`flex items-center gap-2 ${selectedEndpoint.features.usbMonitoring ? 'text-green-400' : 'text-slate-500'}`}>
                    <Usb className="w-4 h-4" /> USB {selectedEndpoint.features.usbMonitoring ? '✓' : '✗'}
                  </div>
                  <div className={`flex items-center gap-2 ${selectedEndpoint.features.clipboardMonitoring ? 'text-green-400' : 'text-slate-500'}`}>
                    <Clipboard className="w-4 h-4" /> Clipboard {selectedEndpoint.features.clipboardMonitoring ? '✓' : '✗'}
                  </div>
                  <div className={`flex items-center gap-2 ${selectedEndpoint.features.printMonitoring ? 'text-green-400' : 'text-slate-500'}`}>
                    <Printer className="w-4 h-4" /> Print {selectedEndpoint.features.printMonitoring ? '✓' : '✗'}
                  </div>
                  <div className={`flex items-center gap-2 ${selectedEndpoint.features.screenCapture ? 'text-green-400' : 'text-slate-500'}`}>
                    <Camera className="w-4 h-4" /> Screen {selectedEndpoint.features.screenCapture ? '✓' : '✗'}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button className="flex-1 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30">
                  View Logs
                </button>
                <button className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">
                  Configure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EndpointMonitor;
