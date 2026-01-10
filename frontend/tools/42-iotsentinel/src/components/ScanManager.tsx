import React, { useState, useEffect } from 'react';
import { Scan, ScanStatus, ScanType } from '../types';
import { iotSentinelAPI } from '../services/iotSentinelAPI';

interface ScanManagerProps {
  onScanComplete?: (scan: Scan) => void;
}

export const ScanManager: React.FC<ScanManagerProps> = ({ onScanComplete }) => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningScans, setRunningScans] = useState<Scan[]>([]);
  const [scanType, setScanType] = useState<ScanType>('discovery');
  const [targetNetworks, setTargetNetworks] = useState('192.168.1.0/24');

  useEffect(() => {
    fetchScans();
    const interval = setInterval(fetchRunningScans, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchScans = async () => {
    try {
      setLoading(true);
      const response = await iotSentinelAPI.scans.getAll({ limit: 20 });
      setScans(response.data || []);
    } catch (err) {
      console.error('Failed to fetch scans:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRunningScans = async () => {
    try {
      const response = await iotSentinelAPI.scans.getRunning();
      setRunningScans(response.data || []);
    } catch (err) {
      console.error('Failed to fetch running scans:', err);
    }
  };

  const startScan = async () => {
    try {
      const networks = targetNetworks.split(',').map(n => n.trim());
      let response;
      
      switch (scanType) {
        case 'discovery':
          response = await iotSentinelAPI.scans.startDiscovery(networks);
          break;
        case 'vulnerability':
          response = await iotSentinelAPI.scans.startVulnerability([]);
          break;
        default:
          response = await iotSentinelAPI.scans.startQuick(networks);
      }
      
      if (response.data) {
        setRunningScans(prev => [...prev, response.data]);
      }
      fetchScans();
    } catch (err) {
      console.error('Failed to start scan:', err);
    }
  };

  const cancelScan = async (scanId: string) => {
    try {
      await iotSentinelAPI.scans.cancel(scanId);
      fetchRunningScans();
      fetchScans();
    } catch (err) {
      console.error('Failed to cancel scan:', err);
    }
  };

  const getScanTypeIcon = (type: ScanType) => {
    const icons: Record<ScanType, string> = {
      discovery: '🔍',
      vulnerability: '🔓',
      compliance: '📋',
      full: '🔬',
      quick: '⚡',
      custom: '⚙️'
    };
    return icons[type] || '📡';
  };

  const getStatusStyles = (status: ScanStatus) => {
    const styles: Record<ScanStatus, { bg: string; text: string; icon: string }> = {
      pending: { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: '⏳' },
      running: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', icon: '🔄' },
      completed: { bg: 'bg-green-500/20', text: 'text-green-400', icon: '✅' },
      failed: { bg: 'bg-red-500/20', text: 'text-red-400', icon: '❌' },
      cancelled: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: '🚫' }
    };
    return styles[status] || styles.pending;
  };

  const formatDuration = (start: string, end?: string) => {
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const duration = Math.floor((endTime - startTime) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
          <span className="text-2xl">🔍</span>
          Scan Manager
        </h2>

        {/* New Scan Form */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Start New Scan</h3>
          <div className="flex flex-wrap gap-3">
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value as ScanType)}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="discovery">🔍 Discovery Scan</option>
              <option value="vulnerability">🔓 Vulnerability Scan</option>
              <option value="compliance">📋 Compliance Scan</option>
              <option value="quick">⚡ Quick Scan</option>
              <option value="full">🔬 Full Scan</option>
            </select>
            <input
              type="text"
              value={targetNetworks}
              onChange={(e) => setTargetNetworks(e.target.value)}
              placeholder="Target networks (comma-separated)"
              className="flex-1 min-w-[200px] px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-mono text-sm"
            />
            <button
              onClick={startScan}
              className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2"
            >
              <span>▶️</span> Start Scan
            </button>
          </div>
        </div>
      </div>

      {/* Running Scans */}
      {runningScans.length > 0 && (
        <div className="p-4 border-b border-slate-700/50 bg-cyan-500/5">
          <h3 className="text-sm font-medium text-cyan-400 mb-3 flex items-center gap-2">
            <span className="animate-spin">🔄</span>
            Running Scans ({runningScans.length})
          </h3>
          <div className="space-y-3">
            {runningScans.map((scan) => (
              <div
                key={scan._id}
                className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getScanTypeIcon(scan.type)}</span>
                    <span className="font-medium text-white">{scan.name || `${scan.type} scan`}</span>
                    <span className="text-xs text-slate-400">
                      {formatDuration(scan.startTime)}
                    </span>
                  </div>
                  <button
                    onClick={() => cancelScan(scan._id)}
                    className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                  >
                    Cancel
                  </button>
                </div>
                
                {/* Progress Bar */}
                <div className="relative">
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all animate-pulse"
                      style={{ width: `${scan.progress?.percentage || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs">
                    <span className="text-slate-400">
                      {scan.progress?.currentTarget || 'Scanning...'}
                    </span>
                    <span className="text-cyan-400">
                      {scan.progress?.percentage || 0}%
                    </span>
                  </div>
                </div>

                {/* Results Preview */}
                {scan.results && (
                  <div className="flex gap-4 mt-3 text-xs">
                    <span className="text-green-400">
                      📡 {scan.results.devicesFound || 0} devices
                    </span>
                    <span className="text-orange-400">
                      🔓 {scan.results.vulnerabilitiesFound || 0} vulnerabilities
                    </span>
                    <span className="text-red-400">
                      🚨 {scan.results.alertsGenerated || 0} alerts
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scan History */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Recent Scans</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">📡</span>
            <p className="text-slate-400">No scans found</p>
            <p className="text-sm text-slate-500 mt-1">Start a scan to discover devices</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {scans.map((scan) => {
              const status = getStatusStyles(scan.status);
              
              return (
                <div
                  key={scan._id}
                  className="bg-slate-700/30 rounded-lg p-3 hover:bg-slate-700/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getScanTypeIcon(scan.type)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {scan.name || `${scan.type} scan`}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded ${status.bg} ${status.text}`}>
                            {status.icon} {scan.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {new Date(scan.startTime).toLocaleString()}
                          {scan.endTime && ` • Duration: ${formatDuration(scan.startTime, scan.endTime)}`}
                        </div>
                      </div>
                    </div>
                    
                    {scan.results && (
                      <div className="flex gap-3 text-xs">
                        <span className="text-green-400">
                          📡 {scan.results.devicesFound}
                        </span>
                        <span className="text-orange-400">
                          🔓 {scan.results.vulnerabilitiesFound}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanManager;
