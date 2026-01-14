import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Zap,
  Globe,
  Clock,
  Shield,
  AlertOctagon,
  Bug,
  ExternalLink,
  Filter,
  Pause,
  Play,
  RefreshCw,
  TrendingUp,
  Database,
  Server,
} from 'lucide-react';

interface ZeroDayThreat {
  id: string;
  cve: string | null;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  vendor: string;
  product: string;
  exploitAvailable: boolean;
  exploitedInWild: boolean;
  patchAvailable: boolean;
  cvss: number;
  timestamp: number;
  source: string;
  affectedVersions: string[];
  attackVector: string;
  complexity: string;
  references: string[];
}

const VENDORS = [
  'Microsoft',
  'Apple',
  'Google',
  'Adobe',
  'Cisco',
  'Oracle',
  'VMware',
  'Fortinet',
  'Palo Alto',
  'F5',
  'Citrix',
  'Atlassian',
  'SolarWinds',
  'Ivanti',
];
const PRODUCTS = [
  'Windows',
  'macOS',
  'Chrome',
  'Firefox',
  'Exchange',
  'Outlook',
  'Active Directory',
  'vCenter',
  'FortiOS',
  'PAN-OS',
  'BIG-IP',
  'NetScaler',
  'Confluence',
  'Orion',
  'EPMM',
];
const THREAT_TYPES = [
  'Remote Code Execution',
  'Privilege Escalation',
  'Authentication Bypass',
  'SQL Injection',
  'Buffer Overflow',
  'Memory Corruption',
  'Information Disclosure',
  'Denial of Service',
  'Command Injection',
  'Path Traversal',
];
const ATTACK_VECTORS = ['Network', 'Adjacent Network', 'Local', 'Physical'];
const SOURCES = [
  'CISA KEV',
  'NVD',
  'ZDI',
  'Project Zero',
  'Microsoft Security',
  'Palo Alto Unit 42',
  'CrowdStrike',
  'Mandiant',
];

const generateZeroDay = (): ZeroDayThreat => {
  const severity =
    Math.random() > 0.7
      ? 'critical'
      : Math.random() > 0.5
        ? 'high'
        : Math.random() > 0.3
          ? 'medium'
          : 'low';
  const cvssBase =
    severity === 'critical' ? 9 : severity === 'high' ? 7 : severity === 'medium' ? 4 : 2;
  const cvss = Math.round((cvssBase + Math.random() * 1.5) * 10) / 10;
  const vendor = VENDORS[Math.floor(Math.random() * VENDORS.length)];
  const exploitedInWild = Math.random() > 0.6;

  return {
    id: `ZD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    cve:
      Math.random() > 0.2
        ? `CVE-2024-${Math.floor(Math.random() * 99999)
            .toString()
            .padStart(5, '0')}`
        : null,
    name: `${THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)]} in ${vendor} ${PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)]}`,
    description: `A ${severity} severity vulnerability allows ${Math.random() > 0.5 ? 'remote attackers' : 'authenticated users'} to ${Math.random() > 0.5 ? 'execute arbitrary code' : 'escalate privileges'} via specially crafted ${Math.random() > 0.5 ? 'network packets' : 'input data'}.`,
    severity,
    type: THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)],
    vendor,
    product: PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)],
    exploitAvailable: Math.random() > 0.4,
    exploitedInWild,
    patchAvailable: Math.random() > 0.5,
    cvss,
    timestamp: Date.now() - Math.floor(Math.random() * 86400000),
    source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
    affectedVersions: ['< 1.2.3', '< 2.0.0', 'All versions'].slice(
      0,
      Math.floor(Math.random() * 3) + 1
    ),
    attackVector: ATTACK_VECTORS[Math.floor(Math.random() * ATTACK_VECTORS.length)],
    complexity: Math.random() > 0.5 ? 'Low' : 'High',
    references: [`https://nvd.nist.gov/vuln/detail/CVE-2024-${Math.floor(Math.random() * 99999)}`],
  };
};

const ZeroDayThreatFeed: React.FC = () => {
  const [threats, setThreats] = useState<ZeroDayThreat[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'exploited' | 'unpatched'>('all');
  const [selectedThreat, setSelectedThreat] = useState<ZeroDayThreat | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    exploitedInWild: 0,
    unpatched: 0,
  });

  const addThreat = useCallback(() => {
    const newThreat = generateZeroDay();
    setThreats((prev) => [newThreat, ...prev].slice(0, 100));
    setStats((prev) => ({
      total: prev.total + 1,
      critical: prev.critical + (newThreat.severity === 'critical' ? 1 : 0),
      exploitedInWild: prev.exploitedInWild + (newThreat.exploitedInWild ? 1 : 0),
      unpatched: prev.unpatched + (!newThreat.patchAvailable ? 1 : 0),
    }));
  }, []);

  useEffect(() => {
    // Initial threats
    const initial = Array.from({ length: 20 }, generateZeroDay);
    setThreats(initial);
    setStats({
      total: initial.length,
      critical: initial.filter((t) => t.severity === 'critical').length,
      exploitedInWild: initial.filter((t) => t.exploitedInWild).length,
      unpatched: initial.filter((t) => !t.patchAvailable).length,
    });
  }, []);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.3) addThreat();
    }, 4000);
    return () => clearInterval(interval);
  }, [isLive, addThreat]);

  const filteredThreats = threats.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'critical') return t.severity === 'critical';
    if (filter === 'exploited') return t.exploitedInWild;
    if (filter === 'unpatched') return !t.patchAvailable;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-red-500/20 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-red-500/20 bg-gradient-to-r from-slate-800 to-slate-800/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                Zero-Day Threat Feed
                {isLive && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    LIVE
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-400">Real-time global vulnerability intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`p-2 rounded-lg transition-colors ${
                isLive ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-gray-400'
              }`}
            >
              {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={addThreat}
              className="p-2 rounded-lg bg-slate-700 text-gray-400 hover:bg-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-slate-900/50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-red-400">{stats.critical}</div>
            <div className="text-xs text-gray-500">Critical</div>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-orange-400">{stats.exploitedInWild}</div>
            <div className="text-xs text-gray-500">In Wild</div>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-yellow-400">{stats.unpatched}</div>
            <div className="text-xs text-gray-500">Unpatched</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mt-3">
          {[
            { key: 'all', label: 'All' },
            { key: 'critical', label: 'Critical' },
            { key: 'exploited', label: 'Exploited' },
            { key: 'unpatched', label: 'Unpatched' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === f.key
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Threat List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredThreats.map((threat, index) => (
          <div
            key={threat.id}
            onClick={() => setSelectedThreat(threat)}
            className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.01] ${
              index === 0 && isLive ? 'animate-slideIn' : ''
            } ${getSeverityColor(threat.severity)}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`w-4 h-4 ${
                    threat.severity === 'critical'
                      ? 'text-red-400'
                      : threat.severity === 'high'
                        ? 'text-orange-400'
                        : threat.severity === 'medium'
                          ? 'text-yellow-400'
                          : 'text-blue-400'
                  }`}
                />
                <span className="text-xs font-medium text-white truncate max-w-[200px]">
                  {threat.name}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getSeverityColor(threat.severity)}`}
              >
                {threat.severity}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              {threat.cve && (
                <span className="px-2 py-0.5 rounded bg-slate-900/50 text-cyan-400 font-mono">
                  {threat.cve}
                </span>
              )}
              <span className="px-2 py-0.5 rounded bg-slate-900/50 text-purple-400">
                CVSS {threat.cvss}
              </span>
              {threat.exploitedInWild && (
                <span className="px-2 py-0.5 rounded bg-red-900/50 text-red-300 flex items-center gap-1">
                  <Bug className="w-3 h-3" /> In Wild
                </span>
              )}
              {!threat.patchAvailable && (
                <span className="px-2 py-0.5 rounded bg-yellow-900/50 text-yellow-300">
                  No Patch
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> {threat.source}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatTime(threat.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedThreat && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedThreat(null)}
        >
          <div
            className="bg-slate-800 rounded-xl border border-red-500/30 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 ${getSeverityColor(selectedThreat.severity)}`}
                  >
                    {selectedThreat.severity}
                  </span>
                  <h3 className="text-xl font-bold text-white">{selectedThreat.name}</h3>
                  {selectedThreat.cve && (
                    <span className="text-cyan-400 font-mono text-sm">{selectedThreat.cve}</span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedThreat(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <p className="text-gray-300 mb-4">{selectedThreat.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">CVSS Score</div>
                  <div
                    className={`text-2xl font-bold ${selectedThreat.cvss >= 9 ? 'text-red-400' : selectedThreat.cvss >= 7 ? 'text-orange-400' : 'text-yellow-400'}`}
                  >
                    {selectedThreat.cvss}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Attack Vector</div>
                  <div className="text-lg font-medium text-white">
                    {selectedThreat.attackVector}
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Vendor</div>
                  <div className="text-lg font-medium text-white">{selectedThreat.vendor}</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Product</div>
                  <div className="text-lg font-medium text-white">{selectedThreat.product}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {selectedThreat.exploitAvailable && (
                  <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm flex items-center gap-1">
                    <Zap className="w-4 h-4" /> Exploit Available
                  </span>
                )}
                {selectedThreat.exploitedInWild && (
                  <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm flex items-center gap-1">
                    <Bug className="w-4 h-4" /> Exploited in Wild
                  </span>
                )}
                {selectedThreat.patchAvailable ? (
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm flex items-center gap-1">
                    <Shield className="w-4 h-4" /> Patch Available
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm flex items-center gap-1">
                    <AlertOctagon className="w-4 h-4" /> No Patch
                  </span>
                )}
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Affected Versions</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedThreat.affectedVersions.map((v, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded bg-slate-900 text-gray-300 text-sm font-mono"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors">
                  Create Alert
                </button>
                <button className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ZeroDayThreatFeed;
