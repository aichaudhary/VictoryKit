import React, { useState, useEffect } from 'react';
import {
  Globe,
  Shield,
  AlertTriangle,
  Server,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Wifi,
  Database,
  Cloud,
  Mail,
  Key,
  ExternalLink,
  RefreshCw,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Search,
} from 'lucide-react';

interface ExposedAsset {
  id: string;
  type: 'domain' | 'ip' | 'port' | 'service' | 'ssl' | 'cloud' | 'api' | 'email';
  name: string;
  value: string;
  risk: 'critical' | 'high' | 'medium' | 'low' | 'info';
  exposure: string;
  firstSeen: string;
  lastSeen: string;
  details: string;
  remediation: string;
}

const EXPOSED_ASSETS: ExposedAsset[] = [
  {
    id: 'A1',
    type: 'port',
    name: 'SSH Exposed',
    value: '22/tcp',
    risk: 'high',
    exposure: 'Internet-facing SSH server without key-only auth',
    firstSeen: '2024-01-10',
    lastSeen: '2024-01-15',
    details: 'Server: web-prod-01 (34.102.x.x)',
    remediation: 'Disable password auth, use SSH keys only, consider VPN',
  },
  {
    id: 'A2',
    type: 'ssl',
    name: 'Weak SSL/TLS',
    value: 'api.company.com',
    risk: 'medium',
    exposure: 'TLS 1.0/1.1 still enabled',
    firstSeen: '2024-01-08',
    lastSeen: '2024-01-15',
    details: 'Grade: B, Missing HSTS header',
    remediation: 'Disable TLS 1.0/1.1, enable HSTS',
  },
  {
    id: 'A3',
    type: 'domain',
    name: 'Subdomain Takeover',
    value: 'old-staging.company.com',
    risk: 'critical',
    exposure: 'Dangling DNS pointing to unclaimed resource',
    firstSeen: '2024-01-12',
    lastSeen: '2024-01-15',
    details: 'CNAME → deleted-app.herokuapp.com',
    remediation: 'Remove DNS record or reclaim the resource',
  },
  {
    id: 'A4',
    type: 'api',
    name: 'Open API Endpoint',
    value: '/api/v1/internal',
    risk: 'high',
    exposure: 'Internal API accessible without authentication',
    firstSeen: '2024-01-11',
    lastSeen: '2024-01-15',
    details: 'Exposes user data, no rate limiting',
    remediation: 'Add authentication, implement rate limiting',
  },
  {
    id: 'A5',
    type: 'cloud',
    name: 'S3 Bucket Public',
    value: 'company-backups',
    risk: 'critical',
    exposure: 'AWS S3 bucket allows public listing',
    firstSeen: '2024-01-09',
    lastSeen: '2024-01-15',
    details: 'Contains database backups',
    remediation: 'Make bucket private, enable encryption',
  },
  {
    id: 'A6',
    type: 'email',
    name: 'Email Spoofing',
    value: 'company.com',
    risk: 'high',
    exposure: 'Missing DMARC policy',
    firstSeen: '2024-01-07',
    lastSeen: '2024-01-15',
    details: 'SPF: softfail, DKIM: missing',
    remediation: 'Configure DMARC with reject policy',
  },
  {
    id: 'A7',
    type: 'port',
    name: 'Database Exposed',
    value: '3306/tcp',
    risk: 'critical',
    exposure: 'MySQL directly accessible from internet',
    firstSeen: '2024-01-06',
    lastSeen: '2024-01-15',
    details: 'Server: db-prod (34.103.x.x)',
    remediation: 'Block port via firewall, use VPN for access',
  },
  {
    id: 'A8',
    type: 'service',
    name: 'Admin Panel',
    value: '/admin',
    risk: 'medium',
    exposure: 'Admin interface accessible without IP restrictions',
    firstSeen: '2024-01-13',
    lastSeen: '2024-01-15',
    details: 'Login page visible, brute-force possible',
    remediation: 'Add IP allowlist, implement MFA',
  },
  {
    id: 'A9',
    type: 'ip',
    name: 'DNS Zone Transfer',
    value: 'ns1.company.com',
    risk: 'medium',
    exposure: 'Zone transfer allowed to any IP',
    firstSeen: '2024-01-14',
    lastSeen: '2024-01-15',
    details: 'Exposes internal DNS records',
    remediation: 'Restrict zone transfers to specific IPs',
  },
  {
    id: 'A10',
    type: 'ssl',
    name: 'Certificate Expiring',
    value: 'portal.company.com',
    risk: 'medium',
    exposure: 'SSL certificate expires in 7 days',
    firstSeen: '2024-01-15',
    lastSeen: '2024-01-15',
    details: "Issuer: Let's Encrypt",
    remediation: 'Renew certificate before expiration',
  },
];

const AttackSurfaceMonitor: React.FC = () => {
  const [assets, setAssets] = useState<ExposedAsset[]>(EXPOSED_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<ExposedAsset | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = {
    total: assets.length,
    critical: assets.filter((a) => a.risk === 'critical').length,
    high: assets.filter((a) => a.risk === 'high').length,
    medium: assets.filter((a) => a.risk === 'medium').length,
  };

  const getTypeIcon = (type: ExposedAsset['type']) => {
    switch (type) {
      case 'domain':
        return <Globe className="w-4 h-4" />;
      case 'ip':
        return <Server className="w-4 h-4" />;
      case 'port':
        return <Wifi className="w-4 h-4" />;
      case 'service':
        return <Database className="w-4 h-4" />;
      case 'ssl':
        return <Lock className="w-4 h-4" />;
      case 'cloud':
        return <Cloud className="w-4 h-4" />;
      case 'api':
        return <Key className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
    }
  };

  const getRiskColor = (risk: ExposedAsset['risk']) => {
    switch (risk) {
      case 'critical':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'info':
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const filteredAssets = assets.filter((a) => {
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    const matchesRisk = riskFilter === 'all' || a.risk === riskFilter;
    const matchesSearch =
      searchQuery === '' ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.value.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesRisk && matchesSearch;
  });

  const runScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  const handleAddDomain = () => {
    if (newDomain) {
      const newAsset: ExposedAsset = {
        id: `A${Date.now()}`,
        type: 'domain',
        name: 'New Domain',
        value: newDomain,
        risk: 'info',
        exposure: 'Pending scan...',
        firstSeen: new Date().toISOString().split('T')[0],
        lastSeen: new Date().toISOString().split('T')[0],
        details: 'Asset added, waiting for scan',
        remediation: 'Run attack surface scan',
      };
      setAssets([newAsset, ...assets]);
      setNewDomain('');
      setShowAddDomain(false);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-red-500/20 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-red-500/20 bg-gradient-to-r from-slate-800 to-slate-800/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Attack Surface Monitor</h3>
              <p className="text-xs text-gray-400">External exposure & asset discovery</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddDomain(true)}
              className="p-2 rounded-lg bg-slate-700 text-gray-400 hover:bg-slate-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={runScan}
              disabled={isScanning}
              className={`p-2 rounded-lg transition-colors ${
                isScanning
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-500">Assets</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-red-400">{stats.critical}</div>
            <div className="text-xs text-gray-500">Critical</div>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-orange-400">{stats.high}</div>
            <div className="text-xs text-gray-500">High</div>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-yellow-400">{stats.medium}</div>
            <div className="text-xs text-gray-500">Medium</div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500/50"
            >
              <option value="all">All Types</option>
              <option value="domain">Domain</option>
              <option value="ip">IP Address</option>
              <option value="port">Open Port</option>
              <option value="service">Service</option>
              <option value="ssl">SSL/TLS</option>
              <option value="cloud">Cloud</option>
              <option value="api">API</option>
              <option value="email">Email</option>
            </select>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500/50"
            >
              <option value="all">All Risk</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => setSelectedAsset(asset)}
            className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.01] ${getRiskColor(asset.risk)}`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={`p-1.5 rounded ${getRiskColor(asset.risk)}`}>
                  {getTypeIcon(asset.type)}
                </span>
                <div>
                  <div className="text-sm font-medium text-white">{asset.name}</div>
                  <div className="text-xs text-gray-400 font-mono">{asset.value}</div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getRiskColor(asset.risk)}`}
              >
                {asset.risk}
              </span>
            </div>
            <div className="text-xs text-gray-400 mb-2">{asset.exposure}</div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>First: {asset.firstSeen}</span>
              <span>Last: {asset.lastSeen}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Domain Modal */}
      {showAddDomain && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddDomain(false)}
        >
          <div
            className="bg-slate-800 rounded-xl border border-orange-500/30 max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Add Domain to Monitor</h3>
              <button
                onClick={() => setShowAddDomain(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Enter domain (e.g., example.com)"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddDomain(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDomain}
                disabled={!newDomain}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add & Scan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAsset(null)}
        >
          <div
            className="bg-slate-800 rounded-xl border border-orange-500/30 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`p-2 rounded-lg ${getRiskColor(selectedAsset.risk)}`}>
                    {getTypeIcon(selectedAsset.type)}
                  </span>
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase mb-1 ${getRiskColor(selectedAsset.risk)}`}
                    >
                      {selectedAsset.risk} Risk
                    </span>
                    <h3 className="text-lg font-bold text-white">{selectedAsset.name}</h3>
                    <span className="text-cyan-400 font-mono text-sm">{selectedAsset.value}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Exposure</div>
                  <p className="text-gray-300">{selectedAsset.exposure}</p>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Details</div>
                  <p className="text-gray-300">{selectedAsset.details}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">First Seen</div>
                    <div className="text-sm text-white">{selectedAsset.firstSeen}</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Last Seen</div>
                    <div className="text-sm text-white">{selectedAsset.lastSeen}</div>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-1">
                    <Shield className="w-4 h-4" /> Recommended Remediation
                  </div>
                  <p className="text-gray-300 text-sm">{selectedAsset.remediation}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
                  Mark as Resolved
                </button>
                <button className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttackSurfaceMonitor;
