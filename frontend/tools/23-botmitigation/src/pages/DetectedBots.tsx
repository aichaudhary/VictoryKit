import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Bot,
  Search,
  Filter,
  Ban,
  Eye,
  CheckCircle,
  AlertTriangle,
  Globe,
  Clock,
  Activity,
  X,
  Fingerprint,
} from 'lucide-react';
import { botApi } from '../services/api';
import { Bot as BotType } from '../types';
import toast from 'react-hot-toast';

export default function DetectedBots() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClassification, setFilterClassification] = useState<string>('all');
  const [selectedBots, setSelectedBots] = useState<string[]>([]);
  const [selectedBot, setSelectedBot] = useState<BotType | null>(null);
  const queryClient = useQueryClient();

  const { data: botsData, isLoading } = useQuery({
    queryKey: ['bots', filterStatus, filterClassification],
    queryFn: () => botApi.getAll({ status: filterStatus, classification: filterClassification }),
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({ action, reason }: { action: string; reason: string }) =>
      botApi.bulkAction(selectedBots, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] });
      setSelectedBots([]);
      toast.success('Bulk action completed');
    },
  });

  const updateBotMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      botApi.update(id, { action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] });
      toast.success('Bot updated');
    },
  });

  // Demo data
  const demoBots: BotType[] = Array.from({ length: 20 }, (_, i) => ({
    _id: `bot-${i}`,
    ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    userAgent: ['python-requests/2.28.0', 'curl/7.68.0', 'Scrapy/2.8.0', 'Selenium WebDriver', 'Headless Chrome'][Math.floor(Math.random() * 5)],
    classification: ['bad', 'good', 'suspicious', 'unknown'][Math.floor(Math.random() * 4)] as 'bad' | 'good' | 'suspicious' | 'unknown',
    category: ['scraper', 'crawler', 'spam', 'credential_stuffing', 'click_fraud'][Math.floor(Math.random() * 5)],
    botScore: Math.floor(Math.random() * 100),
    detectionMethod: ['behavioral', 'fingerprint', 'rate_limit', 'ip_reputation'][Math.floor(Math.random() * 4)],
    action: ['block', 'allow', 'challenge', 'monitor'][Math.floor(Math.random() * 4)] as 'block' | 'allow' | 'challenge' | 'monitor',
    firstSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastSeen: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
    requestCount: Math.floor(Math.random() * 10000) + 100,
    country: ['US', 'CN', 'RU', 'DE', 'IN', 'BR'][Math.floor(Math.random() * 6)],
    metadata: {
      fingerprint: `fp_${Math.random().toString(36).substring(7)}`,
      sessions: Math.floor(Math.random() * 50) + 1,
    },
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const bots = botsData?.data || demoBots;

  const filteredBots = bots.filter((bot: BotType) => {
    if (search && !bot.ipAddress.includes(search) && !bot.userAgent?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const toggleSelectBot = (id: string) => {
    setSelectedBots(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedBots.length === filteredBots.length) {
      setSelectedBots([]);
    } else {
      setSelectedBots(filteredBots.map((b: BotType) => b._id));
    }
  };

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'bad':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'good':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'suspicious':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getActionString = (action: BotType['action']): string => {
    if (!action) return 'unknown';
    if (typeof action === 'string') return action;
    return action.current || 'unknown';
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'block':
        return 'bg-red-500/20 text-red-400';
      case 'allow':
        return 'bg-green-500/20 text-green-400';
      case 'challenge':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Detected Bots</h1>
          <p className="text-slate-400 mt-1">Manage and take action on detected bot traffic</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium">
            {filteredBots.filter((b: BotType) => b.classification === 'bad').length} Bad Bots
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 bg-slate-800 rounded-lg border border-slate-700 p-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by IP or User Agent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Filter by Classification */}
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterClassification}
            onChange={(e) => setFilterClassification(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2"
          >
            <option value="all">All Classifications</option>
            <option value="bad">Bad Bots</option>
            <option value="good">Good Bots</option>
            <option value="suspicious">Suspicious</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {/* Filter by Action */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2"
        >
          <option value="all">All Actions</option>
          <option value="block">Blocked</option>
          <option value="allow">Allowed</option>
          <option value="challenge">Challenged</option>
          <option value="monitor">Monitoring</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedBots.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-orange-500/20 border border-orange-500/30 rounded-lg p-4"
        >
          <span className="text-orange-400 font-medium">
            {selectedBots.length} bot(s) selected
          </span>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => bulkActionMutation.mutate({ action: 'block', reason: 'Bulk action' })}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center space-x-2"
            >
              <Ban size={16} />
              <span>Block All</span>
            </button>
            <button
              onClick={() => bulkActionMutation.mutate({ action: 'allow', reason: 'Bulk action' })}
              className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 flex items-center space-x-2"
            >
              <CheckCircle size={16} />
              <span>Allow All</span>
            </button>
            <button
              onClick={() => setSelectedBots([])}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
            >
              Clear
            </button>
          </div>
        </motion.div>
      )}

      {/* Bots Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedBots.length === filteredBots.length && filteredBots.length > 0}
                      onChange={selectAll}
                      className="w-4 h-4 rounded border-slate-500 text-orange-500 focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Bot Info</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Classification</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Bot Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Detection</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Requests</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Last Seen</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredBots.map((bot: BotType) => (
                  <motion.tr
                    key={bot._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-700/30"
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedBots.includes(bot._id)}
                        onChange={() => toggleSelectBot(bot._id)}
                        className="w-4 h-4 rounded border-slate-500 text-orange-500 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-700 rounded-lg">
                          <Bot size={20} className="text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm font-mono text-white">{bot.ipAddress}</p>
                          <p className="text-xs text-slate-400 flex items-center space-x-1">
                            <Globe size={12} />
                            <span>{bot.country || 'Unknown'}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getClassificationBadge(bot.classification)}`}>
                        {bot.classification.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-slate-300 capitalize">{bot.category?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              bot.botScore > 70 ? 'bg-red-500' : 
                              bot.botScore > 40 ? 'bg-orange-500' : 
                              'bg-green-500'
                            }`}
                            style={{ width: `${bot.botScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{bot.botScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-400 capitalize">{bot.detectionMethod?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-1 text-sm text-white">
                        <Activity size={14} className="text-slate-400" />
                        <span>{bot.requestCount?.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-1 text-xs text-slate-400">
                        <Clock size={12} />
                        <span>{bot.lastSeen ? new Date(bot.lastSeen).toLocaleString() : '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getActionBadge(getActionString(bot.action))}`}>
                        {getActionString(bot.action)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedBot(bot)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => updateBotMutation.mutate({ id: bot._id, action: getActionString(bot.action) === 'block' ? 'allow' : 'block' })}
                          className={`p-2 rounded ${
                            getActionString(bot.action) === 'block' 
                              ? 'text-green-400 hover:bg-green-500/20' 
                              : 'text-red-400 hover:bg-red-500/20'
                          }`}
                        >
                          {getActionString(bot.action) === 'block' ? <CheckCircle size={16} /> : <Ban size={16} />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bot Detail Modal */}
      {selectedBot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <Bot className="w-8 h-8 text-orange-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedBot.ipAddress}</h2>
                  <p className="text-sm text-slate-400">{selectedBot.country}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBot(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Classification & Score */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Classification</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getClassificationBadge(selectedBot.classification)}`}>
                    {selectedBot.classification.toUpperCase()}
                  </span>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Bot Score</p>
                  <div className="flex items-center space-x-3">
                    <span className={`text-2xl font-bold ${
                      selectedBot.botScore > 70 ? 'text-red-400' : 
                      selectedBot.botScore > 40 ? 'text-orange-400' : 
                      'text-green-400'
                    }`}>{selectedBot.botScore}%</span>
                    <div className="flex-1 h-3 bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          selectedBot.botScore > 70 ? 'bg-red-500' : 
                          selectedBot.botScore > 40 ? 'bg-orange-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${selectedBot.botScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* User Agent */}
              <div>
                <p className="text-sm text-slate-400 mb-2">User Agent</p>
                <p className="text-sm text-white font-mono bg-slate-700/50 p-3 rounded-lg break-all">
                  {selectedBot.userAgent}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Category</p>
                  <p className="text-white capitalize">{selectedBot.category?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Detection Method</p>
                  <p className="text-white capitalize">{selectedBot.detectionMethod?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Total Requests</p>
                  <p className="text-white">{selectedBot.requestCount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Current Action</p>
                  <span className={`inline-flex px-2 py-1 rounded text-sm font-medium ${getActionBadge(getActionString(selectedBot.action))}`}>
                    {getActionString(selectedBot.action)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">First Seen</p>
                  <p className="text-white">{selectedBot.firstSeen ? new Date(selectedBot.firstSeen).toLocaleString() : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Last Seen</p>
                  <p className="text-white">{selectedBot.lastSeen ? new Date(selectedBot.lastSeen).toLocaleString() : '-'}</p>
                </div>
              </div>

              {/* Fingerprint */}
              {selectedBot.metadata?.fingerprint && (
                <div className="flex items-center space-x-2 p-3 bg-slate-700/50 rounded-lg">
                  <Fingerprint size={20} className="text-purple-400" />
                  <div>
                    <p className="text-sm text-slate-400">Device Fingerprint</p>
                    <p className="text-white font-mono text-sm">{selectedBot.metadata.fingerprint}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-3 pt-4 border-t border-slate-700">
                <button
                  onClick={() => {
                    updateBotMutation.mutate({ id: selectedBot._id, action: 'block' });
                    setSelectedBot(null);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                >
                  <Ban size={18} />
                  <span>Block</span>
                </button>
                <button
                  onClick={() => {
                    updateBotMutation.mutate({ id: selectedBot._id, action: 'challenge' });
                    setSelectedBot(null);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30"
                >
                  <AlertTriangle size={18} />
                  <span>Challenge</span>
                </button>
                <button
                  onClick={() => {
                    updateBotMutation.mutate({ id: selectedBot._id, action: 'allow' });
                    setSelectedBot(null);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                >
                  <CheckCircle size={18} />
                  <span>Allow</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
