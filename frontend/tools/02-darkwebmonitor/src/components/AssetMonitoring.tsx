import React, { useState, useEffect } from 'react';
import {
  Globe,
  Server,
  Plus,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Eye,
  Bell,
  Settings,
  Activity,
  Lock,
  Unlock,
  ExternalLink,
  Copy,
  XCircle,
  Loader2,
} from 'lucide-react';

interface MonitoredAsset {
  id: string;
  type: 'domain' | 'ip' | 'email' | 'keyword';
  value: string;
  status: 'monitoring' | 'alert' | 'clean' | 'pending';
  lastCheck: Date;
  findings: number;
  addedAt: Date;
  alertsEnabled: boolean;
}

interface Finding {
  id: string;
  assetId: string;
  type: 'credential_leak' | 'dark_web_mention' | 'data_breach' | 'malware_association' | 'phishing_kit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
}

// Demo data generator
const generateMockAssets = (): MonitoredAsset[] => [
  {
    id: '1',
    type: 'domain',
    value: 'yourcompany.com',
    status: 'clean',
    lastCheck: new Date(),
    findings: 0,
    addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    alertsEnabled: true,
  },
  {
    id: '2',
    type: 'email',
    value: 'admin@yourcompany.com',
    status: 'alert',
    lastCheck: new Date(),
    findings: 3,
    addedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    alertsEnabled: true,
  },
  {
    id: '3',
    type: 'ip',
    value: '203.0.113.50',
    status: 'monitoring',
    lastCheck: new Date(Date.now() - 60000),
    findings: 0,
    addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    alertsEnabled: false,
  },
  {
    id: '4',
    type: 'keyword',
    value: 'YourCompany API Key',
    status: 'alert',
    lastCheck: new Date(),
    findings: 1,
    addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    alertsEnabled: true,
  },
];

const generateMockFindings = (): Finding[] => [
  {
    id: 'f1',
    assetId: '2',
    type: 'credential_leak',
    severity: 'critical',
    source: 'Dark Web Forum - BreachForums',
    description: 'Email and hashed password found in credential dump (Collection #8)',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    resolved: false,
  },
  {
    id: 'f2',
    assetId: '2',
    type: 'data_breach',
    severity: 'high',
    source: 'HaveIBeenPwned Database',
    description: 'Associated with LinkedIn breach (2021)',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    resolved: false,
  },
  {
    id: 'f3',
    assetId: '2',
    type: 'dark_web_mention',
    severity: 'medium',
    source: 'Telegram Channel - DataLeaks',
    description: 'Email mentioned in discussion about corporate targets',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    resolved: true,
  },
  {
    id: 'f4',
    assetId: '4',
    type: 'credential_leak',
    severity: 'critical',
    source: 'GitHub Public Repository',
    description: 'API key found exposed in public repository',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    resolved: false,
  },
];

const AssetTypeIcon: React.FC<{ type: MonitoredAsset['type']; className?: string }> = ({ type, className = 'w-4 h-4' }) => {
  switch (type) {
    case 'domain': return <Globe className={className} />;
    case 'ip': return <Server className={className} />;
    case 'email': return <span className={`${className} flex items-center justify-center`}>@</span>;
    case 'keyword': return <Eye className={className} />;
    default: return <Globe className={className} />;
  }
};

const StatusBadge: React.FC<{ status: MonitoredAsset['status'] }> = ({ status }) => {
  const styles = {
    monitoring: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    alert: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse',
    clean: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };

  const icons = {
    monitoring: <Activity className="w-3 h-3" />,
    alert: <AlertTriangle className="w-3 h-3" />,
    clean: <CheckCircle2 className="w-3 h-3" />,
    pending: <Clock className="w-3 h-3" />,
  };

  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const SeverityBadge: React.FC<{ severity: Finding['severity'] }> = ({ severity }) => {
  const styles = {
    low: 'bg-blue-500/20 text-blue-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-orange-500/20 text-orange-400',
    critical: 'bg-red-500/20 text-red-400',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[severity]}`}>
      {severity.toUpperCase()}
    </span>
  );
};

export const AssetMonitoring: React.FC = () => {
  const [assets, setAssets] = useState<MonitoredAsset[]>(generateMockAssets());
  const [findings, setFindings] = useState<Finding[]>(generateMockFindings());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<MonitoredAsset | null>(null);
  const [newAsset, setNewAsset] = useState({ type: 'domain' as MonitoredAsset['type'], value: '' });
  const [isScanning, setIsScanning] = useState(false);

  const totalFindings = findings.filter(f => !f.resolved).length;
  const criticalFindings = findings.filter(f => f.severity === 'critical' && !f.resolved).length;

  const handleAddAsset = () => {
    if (!newAsset.value.trim()) return;

    const asset: MonitoredAsset = {
      id: Date.now().toString(),
      type: newAsset.type,
      value: newAsset.value.trim(),
      status: 'pending',
      lastCheck: new Date(),
      findings: 0,
      addedAt: new Date(),
      alertsEnabled: true,
    };

    setAssets(prev => [asset, ...prev]);
    setNewAsset({ type: 'domain', value: '' });
    setShowAddModal(false);

    // Simulate scanning
    setTimeout(() => {
      setAssets(prev => prev.map(a => 
        a.id === asset.id ? { ...a, status: 'monitoring' as const } : a
      ));
    }, 2000);
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    setFindings(prev => prev.filter(f => f.assetId !== id));
    if (selectedAsset?.id === id) setSelectedAsset(null);
  };

  const handleScanAll = () => {
    setIsScanning(true);
    setTimeout(() => {
      setAssets(prev => prev.map(a => ({
        ...a,
        lastCheck: new Date(),
        status: Math.random() > 0.7 ? 'alert' as const : 'clean' as const,
      })));
      setIsScanning(false);
    }, 3000);
  };

  const handleResolve = (findingId: string) => {
    setFindings(prev => prev.map(f => 
      f.id === findingId ? { ...f, resolved: true } : f
    ));
  };

  const assetFindings = selectedAsset 
    ? findings.filter(f => f.assetId === selectedAsset.id)
    : findings;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{assets.length}</div>
              <div className="text-xs text-gray-400">Monitored Assets</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-red-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">{totalFindings}</div>
              <div className="text-xs text-gray-400">Active Alerts</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-orange-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Unlock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">{criticalFindings}</div>
              <div className="text-xs text-gray-400">Critical Issues</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-emerald-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">
                {assets.filter(a => a.status === 'clean').length}
              </div>
              <div className="text-xs text-gray-400">Clean Assets</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
          <button
            onClick={handleScanAll}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg hover:border-slate-500/50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Scan All'}
          </button>
        </div>
        <div className="text-sm text-gray-400">
          Last full scan: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Assets List */}
        <div className="lg:col-span-1 bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50">
            <h3 className="text-lg font-semibold text-white">Monitored Assets</h3>
          </div>
          <div className="divide-y divide-slate-700/50 max-h-[500px] overflow-y-auto">
            {assets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`p-4 cursor-pointer transition-all hover:bg-slate-700/30 ${
                  selectedAsset?.id === asset.id ? 'bg-slate-700/50 border-l-2 border-green-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                      <AssetTypeIcon type={asset.type} className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white truncate max-w-[150px]">
                        {asset.value}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">{asset.type}</div>
                    </div>
                  </div>
                  <StatusBadge status={asset.status} />
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {asset.lastCheck.toLocaleTimeString()}
                  </span>
                  {asset.findings > 0 && (
                    <span className="text-red-400">{asset.findings} findings</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Findings Panel */}
        <div className="lg:col-span-2 bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {selectedAsset ? `Findings for ${selectedAsset.value}` : 'All Findings'}
            </h3>
            {selectedAsset && (
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Show All
              </button>
            )}
          </div>
          <div className="divide-y divide-slate-700/50 max-h-[500px] overflow-y-auto">
            {assetFindings.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500/30 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-400">No Active Findings</h4>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedAsset 
                    ? 'This asset is clean - no threats detected.'
                    : 'All monitored assets are currently clean.'}
                </p>
              </div>
            ) : (
              assetFindings.map((finding) => (
                <div
                  key={finding.id}
                  className={`p-4 ${finding.resolved ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        finding.severity === 'critical' ? 'bg-red-500/20' :
                        finding.severity === 'high' ? 'bg-orange-500/20' :
                        finding.severity === 'medium' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                      }`}>
                        {finding.resolved ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertTriangle className={`w-5 h-5 ${
                            finding.severity === 'critical' ? 'text-red-400' :
                            finding.severity === 'high' ? 'text-orange-400' :
                            finding.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                          }`} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white capitalize">
                            {finding.type.replace(/_/g, ' ')}
                          </span>
                          <SeverityBadge severity={finding.severity} />
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{finding.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span>Source: {finding.source}</span>
                          <span>•</span>
                          <span>{finding.timestamp.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    {!finding.resolved && (
                      <button
                        onClick={() => handleResolve(finding.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs hover:bg-green-500/30 transition-all"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Add Asset to Monitor</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Asset Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['domain', 'ip', 'email', 'keyword'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewAsset(prev => ({ ...prev, type }))}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                          newAsset.type === type
                            ? 'bg-green-500/20 border-green-500/50 text-green-400'
                            : 'bg-slate-800/50 border-slate-700/50 text-gray-400 hover:border-slate-600/50'
                        }`}
                      >
                        <AssetTypeIcon type={type} className="w-5 h-5" />
                        <span className="text-xs capitalize">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {newAsset.type === 'domain' && 'Domain Name'}
                    {newAsset.type === 'ip' && 'IP Address'}
                    {newAsset.type === 'email' && 'Email Address'}
                    {newAsset.type === 'keyword' && 'Keyword / Secret'}
                  </label>
                  <input
                    type="text"
                    value={newAsset.value}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, value: e.target.value }))}
                    placeholder={
                      newAsset.type === 'domain' ? 'example.com' :
                      newAsset.type === 'ip' ? '192.168.1.1' :
                      newAsset.type === 'email' ? 'user@example.com' :
                      'API Key, Password, etc.'
                    }
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-green-500 focus:outline-none"
                  />
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-gray-400">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-green-400 mt-0.5" />
                    <span>
                      We'll continuously scan the dark web, data breaches, paste sites, and underground forums for any mentions of this asset.
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAddAsset}
                  disabled={!newAsset.value.trim()}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-medium hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Monitoring
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetMonitoring;
