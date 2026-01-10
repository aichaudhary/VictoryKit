import React, { useState, useEffect } from 'react';
import { 
  Shield, Activity, AlertTriangle, RefreshCw, Settings, 
  Lock, Eye, Zap, TrendingUp, Search, Download,
  Play, Pause, Bell, Terminal, Server, Database, Globe,
  Network, FileText, Users, Key, Code, Cpu, HardDrive
} from 'lucide-react';

interface Stats { total: number; active: number; blocked: number; pending: number; }
interface Alert { id: string; message: string; severity: 'critical' | 'high' | 'medium' | 'low'; timestamp: string; }

const GDPRComplianceTool: React.FC = () => {
  const [isActive, setIsActive] = useState(true);
  const [stats, setStats] = useState<Stats>({ total: 31053, active: 31765 % 500, blocked: 3786 % 1000, pending: 18536 % 50 });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedTab, setSelectedTab] = useState('dashboard');

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        total: prev.total + Math.floor(Math.random() * 50),
        active: Math.max(0, prev.active + (Math.random() > 0.5 ? 1 : -1)),
        blocked: prev.blocked + (Math.random() > 0.8 ? 1 : 0),
        pending: Math.max(0, prev.pending + (Math.random() > 0.6 ? 1 : -1))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setAlerts([
      { id: '1', message: 'Security event detected', severity: 'high', timestamp: '2 min ago' },
      { id: '2', message: 'Policy updated successfully', severity: 'low', timestamp: '15 min ago' },
      { id: '3', message: 'Anomaly blocked', severity: 'medium', timestamp: '1 hour ago' },
    ]);
  }, []);

  const severityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-red-500/20 text-red-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-green-500/20 text-green-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-900/20 to-gray-900 text-white">
      <header className="border-b border-violet-500/20 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <FileText className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-violet-200 bg-clip-text text-transparent">GDPR Compliance</h1>
              <p className="text-sm text-gray-400">GDPR Compliance Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsActive(!isActive)} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {isActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isActive ? 'Active' : 'Paused'}
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg"><Settings className="w-5 h-5 text-gray-400" /></button>
          </div>
        </div>
      </header>

      <nav className="border-b border-violet-500/20 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {['dashboard', 'monitor', 'rules', 'analytics', 'settings'].map((tab) => (
              <button key={tab} onClick={() => setSelectedTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize ${selectedTab === tab ? 'text-violet-400 border-b-2 border-violet-500 bg-violet-500/10' : 'text-gray-400 hover:text-white'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-violet-500/20">
            <Database className="w-6 h-6 text-violet-400 mb-2" />
            <p className="text-3xl font-bold">{stats.total.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Total Events</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-green-500/20">
            <Activity className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-3xl font-bold text-green-400">{stats.active}</p>
            <p className="text-sm text-gray-400">Active</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-red-500/20">
            <Shield className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-3xl font-bold text-red-400">{stats.blocked}</p>
            <p className="text-sm text-gray-400">Blocked</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-yellow-500/20">
            <AlertTriangle className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
            <p className="text-sm text-gray-400">Pending</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-gray-800/50 rounded-xl border border-violet-500/20">
            <div className="p-4 border-b border-gray-700/50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-violet-400" />Recent Alerts
              </h2>
            </div>
            <div className="divide-y divide-gray-700/50">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 hover:bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs ${severityColor(alert.severity)}`}>{alert.severity.toUpperCase()}</span>
                    <span className="text-sm">{alert.message}</span>
                  </div>
                  <span className="text-xs text-gray-500">{alert.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl border border-violet-500/20">
            <div className="p-4 border-b border-gray-700/50">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Zap className="w-5 h-5 text-violet-400" />Quick Actions</h2>
            </div>
            <div className="p-4 space-y-3">
              <button className="w-full p-3 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-lg flex items-center gap-3">
                <Search className="w-5 h-5 text-violet-400" /><span>Run Scan</span>
              </button>
              <button className="w-full p-3 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 rounded-lg flex items-center gap-3">
                <Download className="w-5 h-5 text-gray-400" /><span>Export Report</span>
              </button>
              <button className="w-full p-3 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 rounded-lg flex items-center gap-3">
                <Terminal className="w-5 h-5 text-gray-400" /><span>Open Console</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GDPRComplianceTool;
