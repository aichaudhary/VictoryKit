
import React from 'react';
import { Search, Filter, Download, Terminal } from 'lucide-react';

const ActivityLogs: React.FC = () => {
  const logs = [
    { time: '14:22:01', event: 'SSH Login Attempt', source: '45.12.8.212', action: 'BLOCKED', risk: 'High' },
    { time: '14:21:45', event: 'API Key Rotated', source: 'System', action: 'SUCCESS', risk: 'Low' },
    { time: '14:20:12', event: 'Large Data Transfer', source: 'Node-12', action: 'AUDITED', risk: 'Med' },
    { time: '14:19:33', event: 'DDoS Burst Detected', source: 'Global-Botnet', action: 'MITIGATED', risk: 'Critical' },
    { time: '14:18:10', event: 'User Permission Change', source: 'Admin', action: 'LOGGED', risk: 'Low' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center glass p-4 rounded-2xl border border-white/10">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input type="text" placeholder="Search logs..." className="bg-black/40 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs w-64" />
          </div>
          <button className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase border border-white/10">
            <Filter className="w-3 h-3" /> Filters
          </button>
        </div>
        <button className="flex items-center gap-2 text-[10px] font-bold uppercase text-purple-400">
          <Download className="w-3 h-3" /> Export CSV
        </button>
      </div>

      <div className="glass rounded-[2rem] border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/30">
            <tr>
              <th className="p-6">Timestamp</th>
              <th className="p-6">Event Type</th>
              <th className="p-6">Origin</th>
              <th className="p-6">Action</th>
              <th className="p-6">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {logs.map((log, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="p-6 font-mono text-white/40">{log.time}</td>
                <td className="p-6 font-bold">{log.event}</td>
                <td className="p-6 text-white/60">{log.source}</td>
                <td className="p-6">
                  <span className={`px-2 py-1 rounded-md text-[9px] font-black ${
                    log.action === 'BLOCKED' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="p-6">
                  <div className={`w-2 h-2 rounded-full ${
                    log.risk === 'Critical' ? 'bg-red-500' : log.risk === 'High' ? 'bg-orange-500' : 'bg-blue-500'
                  }`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityLogs;
