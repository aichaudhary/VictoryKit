import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  RefreshCw,
  AlertTriangle,
  Shield,
  Globe,
  Clock,
  Eye,
  Trash2,
  ExternalLink,
  Activity,
  Target,
  Fingerprint,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { getThreatIndicators, checkIPReputation, addThreatIndicator } from '../services/api';
import type { ThreatIndicator } from '../types';

const indicatorTypes: Record<string, { label: string; icon: string; color: string }> = {
  ip: { label: 'IP Address', icon: '🌐', color: 'text-threat-critical bg-threat-critical/20' },
  domain: { label: 'Domain', icon: '🔗', color: 'text-threat-high bg-threat-high/20' },
  url: { label: 'URL', icon: '📎', color: 'text-threat-medium bg-threat-medium/20' },
  hash: { label: 'File Hash', icon: '🔑', color: 'text-threat-info bg-threat-info/20' },
  email: { label: 'Email', icon: '📧', color: 'text-waf-primary bg-waf-primary/20' },
};

const threatCategories = [
  { value: 'malware', label: 'Malware', color: 'text-threat-critical' },
  { value: 'phishing', label: 'Phishing', color: 'text-threat-high' },
  { value: 'botnet', label: 'Botnet', color: 'text-threat-medium' },
  { value: 'spam', label: 'Spam', color: 'text-threat-low' },
  { value: 'tor', label: 'Tor Exit Node', color: 'text-threat-info' },
  { value: 'vpn', label: 'VPN/Proxy', color: 'text-waf-primary' },
  { value: 'scanner', label: 'Scanner', color: 'text-waf-muted' },
];

export default function ThreatIntelligence() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [ipToCheck, setIpToCheck] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [ipCheckResult, setIpCheckResult] = useState<any>(null);
  const [isCheckingIP, setIsCheckingIP] = useState(false);

  const { data: indicators = [], isLoading, refetch } = useQuery({
    queryKey: ['threatIndicators', selectedType],
    queryFn: () => getThreatIndicators({ type: selectedType || undefined }),
  });

  // Mock data
  const mockIndicators: ThreatIndicator[] = [
    { _id: '1', type: 'ip', value: '185.234.218.45', source: 'AbuseIPDB', confidence: 95, category: 'malware', firstSeen: new Date(Date.now() - 86400000 * 30), lastSeen: new Date(), description: 'Known malware distribution server', tags: ['emotet', 'c2'], isActive: true },
    { _id: '2', type: 'ip', value: '45.155.205.233', source: 'Shodan', confidence: 88, category: 'scanner', firstSeen: new Date(Date.now() - 86400000 * 7), lastSeen: new Date(), description: 'Active vulnerability scanner', tags: ['aggressive'], isActive: true },
    { _id: '3', type: 'domain', value: 'malicious-example.com', source: 'PhishTank', confidence: 99, category: 'phishing', firstSeen: new Date(Date.now() - 86400000 * 14), lastSeen: new Date(Date.now() - 86400000 * 2), description: 'Phishing domain impersonating banks', tags: ['banking', 'credential-theft'], isActive: true },
    { _id: '4', type: 'ip', value: '103.155.92.12', source: 'Spamhaus', confidence: 76, category: 'spam', firstSeen: new Date(Date.now() - 86400000 * 60), lastSeen: new Date(Date.now() - 86400000), description: 'Spam source', tags: ['email-spam'], isActive: true },
    { _id: '5', type: 'hash', value: 'a1b2c3d4e5f6789012345678901234567890abcd', source: 'VirusTotal', confidence: 92, category: 'malware', firstSeen: new Date(Date.now() - 86400000 * 3), lastSeen: new Date(), description: 'Ransomware payload SHA-256', tags: ['ransomware', 'lockbit'], isActive: true },
    { _id: '6', type: 'ip', value: '192.42.116.16', source: 'TorProject', confidence: 100, category: 'tor', firstSeen: new Date(Date.now() - 86400000 * 90), lastSeen: new Date(), description: 'Known Tor exit node', tags: ['anonymous'], isActive: true },
    { _id: '7', type: 'domain', value: 'suspicious-cdn.xyz', source: 'URLhaus', confidence: 85, category: 'malware', firstSeen: new Date(Date.now() - 86400000 * 5), lastSeen: new Date(), description: 'Hosting malicious JavaScript', tags: ['cryptominer', 'js-miner'], isActive: true },
    { _id: '8', type: 'ip', value: '51.77.52.216', source: 'Internal', confidence: 70, category: 'botnet', firstSeen: new Date(Date.now() - 86400000 * 21), lastSeen: new Date(Date.now() - 86400000 * 3), description: 'Part of Mirai botnet', tags: ['mirai', 'ddos'], isActive: false },
  ];

  const displayIndicators = indicators.length > 0 ? indicators : mockIndicators;
  const filteredIndicators = displayIndicators.filter(ind => 
    !searchQuery || 
    ind.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ind.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ind.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCheckIP = async () => {
    if (!ipToCheck) {
      toast.error('Please enter an IP address');
      return;
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ipToCheck)) {
      toast.error('Invalid IP address format');
      return;
    }

    setIsCheckingIP(true);
    setIpCheckResult(null);

    try {
      // Mock API response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResult = {
        ip: ipToCheck,
        riskScore: Math.floor(Math.random() * 100),
        country: ['US', 'CN', 'RU', 'DE', 'NL'][Math.floor(Math.random() * 5)],
        isp: 'Example ISP Inc.',
        isVPN: Math.random() > 0.7,
        isTor: Math.random() > 0.9,
        isProxy: Math.random() > 0.8,
        isHosting: Math.random() > 0.6,
        abuseReports: Math.floor(Math.random() * 50),
        lastReportedAt: new Date(Date.now() - Math.random() * 86400000 * 30),
        categories: ['scanner', 'spam', 'malware'].filter(() => Math.random() > 0.5),
        sources: ['AbuseIPDB', 'Shodan', 'VirusTotal'].filter(() => Math.random() > 0.5),
      };

      setIpCheckResult(mockResult);
    } catch (error) {
      toast.error('Failed to check IP');
    } finally {
      setIsCheckingIP(false);
    }
  };

  const stats = {
    total: filteredIndicators.length,
    active: filteredIndicators.filter(i => i.isActive).length,
    critical: filteredIndicators.filter(i => i.confidence > 80).length,
    sources: [...new Set(filteredIndicators.map(i => i.source))].length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Threat Intelligence</h1>
          <p className="text-waf-muted mt-1">Manage threat indicators and IP reputation</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()} className="waf-btn-secondary">
            <RefreshCw className="w-5 h-5" />
            Sync Feeds
          </button>
          <button onClick={() => setShowAddModal(true)} className="waf-btn-primary">
            <Plus className="w-5 h-5" />
            Add Indicator
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="waf-card py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-waf-primary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-waf-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-waf-muted">Total Indicators</p>
            </div>
          </div>
        </div>
        <div className="waf-card py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-threat-low/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-threat-low" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-sm text-waf-muted">Active</p>
            </div>
          </div>
        </div>
        <div className="waf-card py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-threat-critical/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-threat-critical" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.critical}</p>
              <p className="text-sm text-waf-muted">High Confidence</p>
            </div>
          </div>
        </div>
        <div className="waf-card py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-threat-info/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-threat-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.sources}</p>
              <p className="text-sm text-waf-muted">Sources</p>
            </div>
          </div>
        </div>
      </div>

      {/* IP Reputation Check */}
      <div className="waf-card">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-waf-primary" />
          IP Reputation Lookup
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-waf-muted" />
            <input
              type="text"
              placeholder="Enter IP address to check (e.g., 8.8.8.8)"
              value={ipToCheck}
              onChange={(e) => setIpToCheck(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckIP()}
              className="waf-input pl-10 font-mono"
            />
          </div>
          <button
            onClick={handleCheckIP}
            disabled={isCheckingIP}
            className="waf-btn-primary"
          >
            {isCheckingIP ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Check Reputation
              </>
            )}
          </button>
        </div>

        {/* IP Check Result */}
        {ipCheckResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-waf-dark rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xl font-mono text-white">{ipCheckResult.ip}</span>
                <span className="text-sm px-2 py-0.5 bg-waf-card rounded text-waf-muted">{ipCheckResult.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={clsx(
                  'text-lg font-bold',
                  ipCheckResult.riskScore > 70 ? 'text-threat-critical' :
                  ipCheckResult.riskScore > 40 ? 'text-threat-medium' :
                  'text-threat-low'
                )}>
                  Risk Score: {ipCheckResult.riskScore}/100
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-waf-card rounded-lg p-3">
                <p className="text-sm text-waf-muted mb-1">ISP</p>
                <p className="text-white text-sm">{ipCheckResult.isp}</p>
              </div>
              <div className="bg-waf-card rounded-lg p-3">
                <p className="text-sm text-waf-muted mb-1">Abuse Reports</p>
                <p className="text-white text-sm">{ipCheckResult.abuseReports} reports</p>
              </div>
              <div className="bg-waf-card rounded-lg p-3">
                <p className="text-sm text-waf-muted mb-1">Flags</p>
                <div className="flex flex-wrap gap-1">
                  {ipCheckResult.isVPN && <span className="text-xs px-2 py-0.5 bg-threat-medium/20 text-threat-medium rounded">VPN</span>}
                  {ipCheckResult.isTor && <span className="text-xs px-2 py-0.5 bg-threat-high/20 text-threat-high rounded">Tor</span>}
                  {ipCheckResult.isProxy && <span className="text-xs px-2 py-0.5 bg-threat-info/20 text-threat-info rounded">Proxy</span>}
                  {ipCheckResult.isHosting && <span className="text-xs px-2 py-0.5 bg-waf-primary/20 text-waf-primary rounded">Hosting</span>}
                  {!ipCheckResult.isVPN && !ipCheckResult.isTor && !ipCheckResult.isProxy && (
                    <span className="text-xs px-2 py-0.5 bg-threat-low/20 text-threat-low rounded">Clean</span>
                  )}
                </div>
              </div>
              <div className="bg-waf-card rounded-lg p-3">
                <p className="text-sm text-waf-muted mb-1">Sources</p>
                <p className="text-white text-sm">{ipCheckResult.sources.join(', ') || 'None'}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button className="waf-btn-secondary text-sm">
                <Plus className="w-4 h-4" />
                Add to Blocklist
              </button>
              <a
                href={`https://www.abuseipdb.com/check/${ipCheckResult.ip}`}
                target="_blank"
                rel="noopener noreferrer"
                className="waf-btn-secondary text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                View on AbuseIPDB
              </a>
            </div>
          </motion.div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedType(null)}
          className={clsx(
            'px-4 py-2 rounded-lg font-medium transition-all',
            !selectedType
              ? 'bg-waf-primary text-white'
              : 'bg-waf-card text-waf-muted hover:text-white border border-waf-border'
          )}
        >
          All Types
        </button>
        {Object.entries(indicatorTypes).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setSelectedType(selectedType === key ? null : key)}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
              selectedType === key
                ? 'bg-waf-primary text-white'
                : 'bg-waf-card text-waf-muted hover:text-white border border-waf-border'
            )}
          >
            <span>{config.icon}</span>
            {config.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="waf-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-waf-muted" />
          <input
            type="text"
            placeholder="Search indicators, tags, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="waf-input pl-10"
          />
        </div>
      </div>

      {/* Indicators List */}
      <div className="space-y-4">
        {filteredIndicators.map((indicator, index) => {
          const typeConfig = indicatorTypes[indicator.type] || { label: indicator.type, icon: '❓', color: 'text-waf-muted bg-waf-dark' };
          const categoryConfig = threatCategories.find(c => c.value === indicator.category);

          return (
            <motion.div
              key={indicator._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={clsx(
                'waf-card hover:border-waf-primary/50 transition-all',
                !indicator.isActive && 'opacity-60'
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={clsx('px-2 py-1 rounded text-sm font-medium', typeConfig.color)}>
                      {typeConfig.icon} {typeConfig.label}
                    </span>
                    <code className="text-white font-mono text-sm truncate">{indicator.value}</code>
                    {!indicator.isActive && (
                      <span className="text-xs px-2 py-0.5 bg-waf-dark text-waf-muted rounded">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-waf-muted mb-3">{indicator.description}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    {categoryConfig && (
                      <span className={clsx('text-sm font-medium', categoryConfig.color)}>
                        {categoryConfig.label}
                      </span>
                    )}
                    <span className="text-sm text-waf-muted">
                      Source: <span className="text-waf-text">{indicator.source}</span>
                    </span>
                    <span className={clsx(
                      'text-sm font-medium',
                      indicator.confidence > 80 ? 'text-threat-critical' :
                      indicator.confidence > 50 ? 'text-threat-medium' :
                      'text-threat-low'
                    )}>
                      {indicator.confidence}% confidence
                    </span>
                  </div>
                  {indicator.tags && indicator.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {indicator.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 bg-waf-dark rounded-lg text-waf-muted">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <p className="text-waf-muted">Last seen</p>
                    <p className="text-waf-text">{new Date(indicator.lastSeen).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-waf-muted hover:text-white hover:bg-waf-dark rounded-lg transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-waf-muted hover:text-threat-critical hover:bg-threat-critical/10 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredIndicators.length === 0 && (
        <div className="waf-card py-12 text-center">
          <Target className="w-12 h-12 text-waf-muted mx-auto mb-4" />
          <p className="text-waf-muted">No threat indicators found</p>
        </div>
      )}

      {/* Add Indicator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-waf-card border border-waf-border rounded-xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-waf-border">
              <h2 className="text-xl font-bold text-white">Add Threat Indicator</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-waf-muted mb-2 block">Type</label>
                <select className="waf-select">
                  {Object.entries(indicatorTypes).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-waf-muted mb-2 block">Value</label>
                <input type="text" placeholder="IP, domain, URL, or hash" className="waf-input font-mono" />
              </div>
              <div>
                <label className="text-sm text-waf-muted mb-2 block">Category</label>
                <select className="waf-select">
                  {threatCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-waf-muted mb-2 block">Description</label>
                <textarea rows={2} className="waf-input resize-none" placeholder="Describe the threat..." />
              </div>
              <div>
                <label className="text-sm text-waf-muted mb-2 block">Tags (comma-separated)</label>
                <input type="text" className="waf-input" placeholder="malware, ransomware, etc." />
              </div>
            </div>
            <div className="p-6 border-t border-waf-border flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="waf-btn-secondary">Cancel</button>
              <button className="waf-btn-primary">
                <Plus className="w-5 h-5" />
                Add Indicator
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
