import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Globe,
  Search,
  Plus,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Clock,
  MapPin,
  Building2,
} from 'lucide-react';
import { reputationApi } from '../services/api';
import { IPReputation } from '../types';
import toast from 'react-hot-toast';

export default function IPReputationPage() {
  const [activeTab, setActiveTab] = useState<'lookup' | 'blacklist' | 'whitelist'>('lookup');
  const [searchIP, setSearchIP] = useState('');
  const [lookupResult, setLookupResult] = useState<IPReputation | null>(null);
  const [newIP, setNewIP] = useState('');
  const [newReason, setNewReason] = useState('');
  const queryClient = useQueryClient();

  const { data: blacklistData } = useQuery({
    queryKey: ['blacklist'],
    queryFn: reputationApi.getBlacklist,
  });

  const { data: whitelistData } = useQuery({
    queryKey: ['whitelist'],
    queryFn: reputationApi.getWhitelist,
  });

  const lookupMutation = useMutation({
    mutationFn: reputationApi.getComprehensive,
    onSuccess: (result) => {
      setLookupResult(result.data);
    },
    onError: () => {
      toast.error('Failed to lookup IP');
    },
  });

  const addBlacklistMutation = useMutation({
    mutationFn: ({ ip, reason }: { ip: string; reason: string }) =>
      reputationApi.addToBlacklist(ip, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blacklist'] });
      setNewIP('');
      setNewReason('');
      toast.success('Added to blacklist');
    },
  });

  const removeBlacklistMutation = useMutation({
    mutationFn: reputationApi.removeFromBlacklist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blacklist'] });
      toast.success('Removed from blacklist');
    },
  });

  const addWhitelistMutation = useMutation({
    mutationFn: ({ ip, reason }: { ip: string; reason: string }) =>
      reputationApi.addToWhitelist(ip, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whitelist'] });
      setNewIP('');
      setNewReason('');
      toast.success('Added to whitelist');
    },
  });

  const removeWhitelistMutation = useMutation({
    mutationFn: reputationApi.removeFromWhitelist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whitelist'] });
      toast.success('Removed from whitelist');
    },
  });

  // Demo data
  const demoBlacklist = [
    { ip: '192.168.1.100', reason: 'Credential stuffing attack', addedAt: new Date().toISOString() },
    { ip: '10.0.0.50', reason: 'DDoS source', addedAt: new Date().toISOString() },
    { ip: '172.16.0.25', reason: 'Scraping abuse', addedAt: new Date().toISOString() },
  ];

  const demoWhitelist = [
    { ip: '66.249.66.1', reason: 'Googlebot', addedAt: new Date().toISOString() },
    { ip: '157.55.39.1', reason: 'Bingbot', addedAt: new Date().toISOString() },
    { ip: '199.16.156.1', reason: 'Twitterbot', addedAt: new Date().toISOString() },
  ];

  const blacklist = blacklistData?.data || demoBlacklist;
  const whitelist = whitelistData?.data || demoWhitelist;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 50) return 'text-orange-400';
    if (score >= 20) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 50) return 'bg-orange-500';
    if (score >= 20) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">IP Reputation</h1>
          <p className="text-slate-400 mt-1">Lookup and manage IP reputation data</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-800 rounded-lg p-1 w-fit">
        {[
          { id: 'lookup', label: 'IP Lookup', icon: Search },
          { id: 'blacklist', label: 'Blacklist', icon: XCircle },
          { id: 'whitelist', label: 'Whitelist', icon: CheckCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-orange-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* IP Lookup Tab */}
      {activeTab === 'lookup' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">IP Reputation Lookup</h3>
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Enter IP address (e.g., 192.168.1.1)"
                  value={searchIP}
                  onChange={(e) => setSearchIP(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
              </div>
              <button
                onClick={() => lookupMutation.mutate(searchIP)}
                disabled={!searchIP || lookupMutation.isPending}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center space-x-2"
              >
                {lookupMutation.isPending ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <Search size={18} />
                )}
                <span>Lookup</span>
              </button>
            </div>
          </div>

          {/* Lookup Result */}
          {lookupResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-xl border border-slate-700 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${
                    lookupResult.riskScore >= 50 ? 'bg-red-500/20' : 'bg-green-500/20'
                  }`}>
                    <Globe size={24} className={
                      lookupResult.riskScore >= 50 ? 'text-red-400' : 'text-green-400'
                    } />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-mono">{lookupResult.ipAddress}</h3>
                    <p className="text-slate-400">{lookupResult.country} • {lookupResult.isp || 'Unknown ISP'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Risk Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor(lookupResult.riskScore)}`}>
                    {lookupResult.riskScore}%
                  </p>
                </div>
              </div>

              {/* Score Bar */}
              <div className="mb-6">
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${lookupResult.riskScore}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${getScoreBg(lookupResult.riskScore)}`}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-slate-500">
                  <span>Safe</span>
                  <span>Low Risk</span>
                  <span>Medium Risk</span>
                  <span>High Risk</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <MapPin size={14} />
                    <span className="text-sm">Location</span>
                  </div>
                  <p className="text-white">{lookupResult.country}, {lookupResult.city || 'Unknown'}</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Building2 size={14} />
                    <span className="text-sm">ISP</span>
                  </div>
                  <p className="text-white truncate">{lookupResult.isp || 'Unknown'}</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Shield size={14} />
                    <span className="text-sm">Type</span>
                  </div>
                  <p className="text-white capitalize">{lookupResult.ipType || 'Residential'}</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Clock size={14} />
                    <span className="text-sm">Last Updated</span>
                  </div>
                  <p className="text-white">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Flags */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'VPN/Proxy', value: lookupResult.isVpn, danger: true },
                  { label: 'Tor Exit Node', value: lookupResult.isTor, danger: true },
                  { label: 'Datacenter', value: lookupResult.isDatacenter, danger: false },
                  { label: 'Known Bot', value: lookupResult.isKnownBot, danger: true },
                ].map((flag) => (
                  <div
                    key={flag.label}
                    className={`p-3 rounded-lg border ${
                      flag.value
                        ? flag.danger
                          ? 'bg-red-500/10 border-red-500/30'
                          : 'bg-orange-500/10 border-orange-500/30'
                        : 'bg-slate-700/50 border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{flag.label}</span>
                      {flag.value ? (
                        <AlertTriangle size={16} className={flag.danger ? 'text-red-400' : 'text-orange-400'} />
                      ) : (
                        <CheckCircle size={16} className="text-green-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Abuse Reports */}
              {lookupResult.abuseReports && lookupResult.abuseReports > 0 && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-400">
                    <AlertTriangle size={18} />
                    <span className="font-medium">{lookupResult.abuseReports} abuse reports found</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-slate-700">
                <button
                  onClick={() => {
                    if (lookupResult.ipAddress) {
                      addBlacklistMutation.mutate({ ip: lookupResult.ipAddress, reason: 'Added from lookup' });
                    }
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                >
                  <XCircle size={18} />
                  <span>Add to Blacklist</span>
                </button>
                <button
                  onClick={() => {
                    if (lookupResult.ipAddress) {
                      addWhitelistMutation.mutate({ ip: lookupResult.ipAddress, reason: 'Added from lookup' });
                    }
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                >
                  <CheckCircle size={18} />
                  <span>Add to Whitelist</span>
                </button>
                <a
                  href={`https://www.abuseipdb.com/check/${lookupResult.ipAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
                >
                  <ExternalLink size={18} />
                  <span>AbuseIPDB</span>
                </a>
              </div>
            </motion.div>
          )}

          {/* Demo Lookup */}
          {!lookupResult && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
              <Globe size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Enter an IP to lookup</h3>
              <p className="text-slate-400 mb-4">
                Get comprehensive reputation data from multiple sources including IPQualityScore, AbuseIPDB, and more.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['8.8.8.8', '1.1.1.1', '185.220.101.1'].map((ip) => (
                  <button
                    key={ip}
                    onClick={() => {
                      setSearchIP(ip);
                      lookupMutation.mutate(ip);
                    }}
                    className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 text-sm font-mono"
                  >
                    {ip}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Blacklist Tab */}
      {activeTab === 'blacklist' && (
        <div className="space-y-6">
          {/* Add to Blacklist */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add to Blacklist</h3>
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="IP Address"
                value={newIP}
                onChange={(e) => setNewIP(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 font-mono"
              />
              <input
                type="text"
                placeholder="Reason"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={() => addBlacklistMutation.mutate({ ip: newIP, reason: newReason })}
                disabled={!newIP}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Blacklist Table */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Blacklisted IPs ({blacklist.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">IP Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Added</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {blacklist.map((item: any) => (
                    <tr key={item.ip} className="hover:bg-slate-700/30">
                      <td className="px-4 py-4 text-white font-mono">{item.ip}</td>
                      <td className="px-4 py-4 text-slate-300">{item.reason}</td>
                      <td className="px-4 py-4 text-slate-400 text-sm">
                        {new Date(item.addedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => removeBlacklistMutation.mutate(item.ip)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Whitelist Tab */}
      {activeTab === 'whitelist' && (
        <div className="space-y-6">
          {/* Add to Whitelist */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add to Whitelist</h3>
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="IP Address"
                value={newIP}
                onChange={(e) => setNewIP(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 font-mono"
              />
              <input
                type="text"
                placeholder="Reason (e.g., Googlebot)"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={() => addWhitelistMutation.mutate({ ip: newIP, reason: newReason })}
                disabled={!newIP}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Whitelist Table */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Whitelisted IPs ({whitelist.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">IP Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Added</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {whitelist.map((item: any) => (
                    <tr key={item.ip} className="hover:bg-slate-700/30">
                      <td className="px-4 py-4 text-white font-mono">{item.ip}</td>
                      <td className="px-4 py-4 text-slate-300">{item.reason}</td>
                      <td className="px-4 py-4 text-slate-400 text-sm">
                        {new Date(item.addedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => removeWhitelistMutation.mutate(item.ip)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
