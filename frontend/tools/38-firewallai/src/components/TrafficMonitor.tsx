import React, { useState, useEffect } from 'react';
import { Monitor, Play, Pause, Filter, Download, AlertTriangle, Activity, TrendingUp } from 'lucide-react';

interface TrafficMonitorProps {
  logs: any[];
  realTimeData: any;
  isRealTimeEnabled: boolean;
  onToggleRealTime: () => void;
}

const TrafficMonitor: React.FC<TrafficMonitorProps> = ({
  logs,
  realTimeData,
  isRealTimeEnabled,
  onToggleRealTime
}) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' ||
      (filter === 'threats' && log.threat_level !== 'low') ||
      (filter === 'blocked' && log.action === 'blocked') ||
      (filter === 'allowed' && log.action === 'allowed');

    const matchesSearch = !searchTerm ||
      log.source_ip.includes(searchTerm) ||
      log.destination_ip.includes(searchTerm) ||
      log.protocol.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const stats = [
    { label: 'Total Traffic', value: logs.length, color: 'text-blue-400' },
    { label: 'Blocked', value: logs.filter(l => l.action === 'blocked').length, color: 'text-red-400' },
    { label: 'Threats Detected', value: logs.filter(l => l.threat_level !== 'low').length, color: 'text-yellow-400' },
    { label: 'Throughput', value: `${realTimeData?.throughput || 0} Mbps`, color: 'text-green-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleRealTime}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isRealTimeEnabled
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-slate-800 text-gray-400 hover:text-white border border-slate-700'
            }`}
          >
            {isRealTimeEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRealTimeEnabled ? 'Pause' : 'Resume'} Live
          </button>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800 border border-blue-500/30 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Traffic</option>
            <option value="threats">Threats Only</option>
            <option value="blocked">Blocked Only</option>
            <option value="allowed">Allowed Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search IP, protocol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800 border border-blue-500/30 rounded-lg text-sm w-64"
            />
          </div>

          <button className="p-2 bg-slate-800 border border-blue-500/30 rounded-lg hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <Activity className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Traffic Table */}
      <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-blue-500/20">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-400" />
            Live Traffic Monitor
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Destination</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Protocol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Port</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Threat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Bytes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredLogs.slice(0, 50).map((log, index) => (
                <tr
                  key={index}
                  className={`hover:bg-slate-700/30 cursor-pointer transition-colors ${
                    selectedLog?.id === log.id ? 'bg-blue-500/10' : ''
                  }`}
                  onClick={() => setSelectedLog(log)}
                >
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 font-mono">
                    {log.source_ip}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 font-mono">
                    {log.destination_ip}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {log.protocol}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {log.port}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      log.action === 'blocked'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        log.threat_level === 'high' ? 'bg-red-500' :
                        log.threat_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <span className={`text-xs ${
                        log.threat_level === 'high' ? 'text-red-400' :
                        log.threat_level === 'medium' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {log.threat_level}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {log.bytes?.toLocaleString() || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Monitor className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-gray-400">No traffic logs found</p>
          </div>
        )}
      </div>

      {/* Log Details Panel */}
      {selectedLog && (
        <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Traffic Log Details</h3>
            <button
              onClick={() => setSelectedLog(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Source IP</label>
                <p className="font-mono text-white">{selectedLog.source_ip}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Destination IP</label>
                <p className="font-mono text-white">{selectedLog.destination_ip}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Protocol</label>
                <p className="text-white">{selectedLog.protocol}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Port</label>
                <p className="text-white">{selectedLog.port}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Action</label>
                <p className={`font-medium ${
                  selectedLog.action === 'blocked' ? 'text-red-400' : 'text-green-400'
                }`}>
                  {selectedLog.action}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Threat Level</label>
                <p className={`font-medium ${
                  selectedLog.threat_level === 'high' ? 'text-red-400' :
                  selectedLog.threat_level === 'medium' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {selectedLog.threat_level}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Bytes Transferred</label>
                <p className="text-white">{selectedLog.bytes?.toLocaleString() || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Timestamp</label>
                <p className="text-white">{new Date(selectedLog.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {selectedLog.threat_details && (
            <div className="mt-6">
              <label className="text-sm text-gray-400">Threat Analysis</label>
              <div className="mt-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{selectedLog.threat_details}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrafficMonitor;