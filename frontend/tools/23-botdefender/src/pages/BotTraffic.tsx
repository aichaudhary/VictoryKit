import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Globe,
  Clock,
  Filter,
  Pause,
  Play,
  RotateCcw,
  Bot,
  User,
  AlertTriangle,
} from 'lucide-react';
import { botApi } from '../services/api';
import { useWebSocket } from '../services/websocket';
import { TrafficEntry } from '../types';

export default function BotTraffic() {
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState<'all' | 'bots' | 'humans' | 'suspicious'>('all');
  const [timeWindow, setTimeWindow] = useState<'1m' | '5m' | '15m' | '1h'>('5m');
  const [trafficData, setTrafficData] = useState<TrafficEntry[]>([]);

  const timeWindowMinutes: Record<string, number> = { '1m': 1, '5m': 5, '15m': 15, '1h': 60 };

  const { data: liveTraffic } = useQuery({
    queryKey: ['live-traffic', timeWindow],
    queryFn: () => botApi.getLiveTraffic(timeWindowMinutes[timeWindow]),
    refetchInterval: isPaused ? false : 2000,
  });

  const { trafficUpdates, botDetections: _botDetections, isConnected } = useWebSocket();

  // Merge real-time updates with query data
  useEffect(() => {
    if (liveTraffic?.data) {
      setTrafficData(liveTraffic.data as TrafficEntry[]);
    }
  }, [liveTraffic]);

  useEffect(() => {
    if (!isPaused && trafficUpdates.length > 0) {
      const latest = trafficUpdates[0];
      setTrafficData(prev => [latest.entry as TrafficEntry, ...prev.slice(0, 99)]);
    }
  }, [trafficUpdates, isPaused]);

  // Demo data
  const demoTraffic: TrafficEntry[] = Array.from({ length: 50 }, (_, i) => ({
    id: `traffic-${i}`,
    timestamp: new Date(Date.now() - i * 2000).toISOString(),
    ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    userAgent: ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'python-requests/2.28.0', 'curl/7.68.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'][Math.floor(Math.random() * 4)],
    path: ['/api/login', '/api/products', '/checkout', '/api/users', '/search'][Math.floor(Math.random() * 5)],
    method: ['GET', 'POST', 'GET', 'GET', 'GET'][Math.floor(Math.random() * 5)],
    statusCode: [200, 200, 200, 403, 429][Math.floor(Math.random() * 5)],
    responseTime: Math.floor(Math.random() * 500) + 10,
    classification: ['human', 'bot', 'bot', 'suspicious', 'human'][Math.floor(Math.random() * 5)] as 'human' | 'bot' | 'suspicious',
    botScore: Math.random() * 100,
    country: ['US', 'CN', 'RU', 'DE', 'GB', 'FR', 'IN'][Math.floor(Math.random() * 7)],
    requestsPerMinute: Math.floor(Math.random() * 100) + 1,
  }));

  const displayData = trafficData.length > 0 ? trafficData : demoTraffic;
  
  const filteredData = displayData.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'bots') return item.classification === 'bot';
    if (filter === 'humans') return item.classification === 'human';
    if (filter === 'suspicious') return item.classification === 'suspicious';
    return true;
  });

  const stats = {
    total: displayData.length,
    bots: displayData.filter(d => d.classification === 'bot').length,
    humans: displayData.filter(d => d.classification === 'human').length,
    suspicious: displayData.filter(d => d.classification === 'suspicious').length,
    avgResponseTime: Math.round(displayData.reduce((acc, d) => acc + d.responseTime, 0) / displayData.length),
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'bot': return 'text-red-400 bg-red-500/20';
      case 'human': return 'text-green-400 bg-green-500/20';
      case 'suspicious': return 'text-orange-400 bg-orange-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-400';
    if (status >= 400 && status < 500) return 'text-orange-400';
    if (status >= 500) return 'text-red-400';
    return 'text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Live Traffic</h1>
          <p className="text-slate-400 mt-1">Real-time request monitoring and bot detection</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm">{isConnected ? 'Live' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center space-x-2 text-slate-400 mb-1">
            <Activity size={16} />
            <span className="text-sm">Total Requests</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center space-x-2 text-red-400 mb-1">
            <Bot size={16} />
            <span className="text-sm">Bots</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.bots}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center space-x-2 text-green-400 mb-1">
            <User size={16} />
            <span className="text-sm">Humans</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.humans}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center space-x-2 text-orange-400 mb-1">
            <AlertTriangle size={16} />
            <span className="text-sm">Suspicious</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">{stats.suspicious}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center space-x-2 text-blue-400 mb-1">
            <Clock size={16} />
            <span className="text-sm">Avg Response</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{stats.avgResponseTime}ms</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800 rounded-lg border border-slate-700 p-4">
        <div className="flex items-center space-x-4">
          {/* Play/Pause */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isPaused ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
            }`}
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Clear */}
          <button
            onClick={() => setTrafficData([])}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600"
          >
            <RotateCcw size={18} />
            <span>Clear</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2"
            >
              <option value="all">All Traffic</option>
              <option value="bots">Bots Only</option>
              <option value="humans">Humans Only</option>
              <option value="suspicious">Suspicious</option>
            </select>
          </div>

          {/* Time Window */}
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-slate-400" />
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value as typeof timeWindow)}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2"
            >
              <option value="1m">Last 1 min</option>
              <option value="5m">Last 5 mins</option>
              <option value="15m">Last 15 mins</option>
              <option value="1h">Last 1 hour</option>
            </select>
          </div>
        </div>
      </div>

      {/* Traffic Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">IP Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Country</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Path</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Response</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Bot Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              <AnimatePresence>
                {filteredData.slice(0, 50).map((item, index) => (
                  <motion.tr
                    key={item.id || index}
                    initial={{ opacity: 0, backgroundColor: 'rgba(251, 146, 60, 0.1)' }}
                    animate={{ opacity: 1, backgroundColor: 'transparent' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-slate-700/30"
                  >
                    <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-white font-mono whitespace-nowrap">
                      {item.ipAddress}
                    </td>
                    <td className="px-4 py-3 text-sm text-white whitespace-nowrap">
                      <span className="flex items-center space-x-2">
                        <Globe size={14} className="text-slate-400" />
                        <span>{item.country || 'Unknown'}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                        item.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                        item.method === 'PUT' ? 'bg-orange-500/20 text-orange-400' :
                        item.method === 'DELETE' ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {item.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300 max-w-[200px] truncate">
                      {item.path}
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium ${getStatusColor(item.statusCode)}`}>
                      {item.statusCode}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap">
                      {item.responseTime}ms
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              item.botScore > 70 ? 'bg-red-500' : 
                              item.botScore > 40 ? 'bg-orange-500' : 
                              'bg-green-500'
                            }`}
                            style={{ width: `${item.botScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{Math.round(item.botScore)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getClassificationColor(item.classification)}`}>
                        {item.classification === 'bot' ? <Bot size={12} /> : 
                         item.classification === 'human' ? <User size={12} /> : 
                         <AlertTriangle size={12} />}
                        <span className="capitalize">{item.classification}</span>
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
