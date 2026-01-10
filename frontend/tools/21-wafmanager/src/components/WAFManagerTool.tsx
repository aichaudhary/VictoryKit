import React, { useState, useEffect } from 'react';
import { 
  Shield, Activity, AlertTriangle, Check, RefreshCw, Settings, 
  Database, Globe, Lock, Eye, Zap, TrendingUp, FileText, 
  Users, Server, Network, Search, Clock, Filter, Download,
  Play, Pause, BarChart2, Bell, Terminal
} from 'lucide-react';

interface Stats {
  total: number;
  active: number;
  blocked: number;
  pending: number;
}

interface Alert {
  id: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
}

const WAFManagerTool: React.FC = () => {
  const [isActive, setIsActive] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total: 45892,
    active: 234,
    blocked: 1567,
    pending: 23
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedTab, setSelectedTab] = useState('dashboard');

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        total: prev.total + Math.floor(Math.random() * 100),
        active: Math.max(0, prev.active + (Math.random() > 0.5 ? 1 : -1)),
        blocked: prev.blocked + (Math.random() > 0.7 ? 1 : 0),
        pending: Math.max(0, prev.pending + (Math.random() > 0.6 ? 1 : -1))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setAlerts([
      { id: '1', message: 'SQL Injection attempt blocked from 185.234.x.x', severity: 'critical', timestamp: '30 sec ago' },
      { id: '2', message: 'XSS payload detected in POST /api/comments', severity: 'high', timestamp: '2 min ago' },
      { id: '3', message: 'Rate limit exceeded for IP 192.168.x.x', severity: 'medium', timestamp: '5 min ago' },
      { id: '4', message: 'New WAF rule deployed successfully', severity: 'low', timestamp: '15 min ago' },
    ]);
  }, []);

  const severityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const features = [
    { icon: Shield, title: 'Rule Engine', desc: 'Advanced WAF rules' },
    { icon: Activity, title: 'Traffic Analysis', desc: 'Real-time inspection' },
    { icon: Lock, title: 'OWASP Top 10', desc: 'Full protection' },
    { icon: Zap, title: 'Rate Limiting', desc: 'DDoS mitigation' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-blue-500/20 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                WAF Manager
              </h1>
              <p className="text-sm text-gray-400">Web Application Firewall Control Center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsActive(!isActive)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                isActive 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {isActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isActive ? 'Protection Active' : 'Protection Paused'}
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-blue-500/20 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {['dashboard', 'rules', 'traffic', 'logs', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-all ${
                  selectedTab === tab
                    ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <Globe className="w-6 h-6 text-blue-400" />
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-3xl font-bold">{stats.total.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Total Requests</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-6 h-6 text-green-400" />
              <span className="flex h-2 w-2"><span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span></span>
            </div>
            <p className="text-3xl font-bold text-green-400">{stats.active}</p>
            <p className="text-sm text-gray-400">Active Rules</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-red-500/20">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-6 h-6 text-red-400" />
              <span className="text-xs text-red-400">Blocked</span>
            </div>
            <p className="text-3xl font-bold text-red-400">{stats.blocked.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Attacks Blocked</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-yellow-500/20">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
            </div>
            <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
            <p className="text-sm text-gray-400">Pending Analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Alerts Panel */}
          <div className="col-span-2 bg-gray-800/50 rounded-xl border border-blue-500/20">
            <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-400" />
                Security Alerts
              </h2>
              <button className="text-sm text-blue-400 hover:underline">View All</button>
            </div>
            <div className="divide-y divide-gray-700/50">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs border ${severityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-sm">{alert.message}</span>
                  </div>
                  <span className="text-xs text-gray-500">{alert.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800/50 rounded-xl border border-blue-500/20">
            <div className="p-4 border-b border-gray-700/50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                Quick Actions
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <button className="w-full p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center gap-3 transition-colors">
                <Shield className="w-5 h-5 text-blue-400" />
                <span>Deploy New Rule</span>
              </button>
              <button className="w-full p-3 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 rounded-lg flex items-center gap-3 transition-colors">
                <Search className="w-5 h-5 text-gray-400" />
                <span>Search Logs</span>
              </button>
              <button className="w-full p-3 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 rounded-lg flex items-center gap-3 transition-colors">
                <Download className="w-5 h-5 text-gray-400" />
                <span>Export Report</span>
              </button>
              <button className="w-full p-3 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 rounded-lg flex items-center gap-3 transition-colors">
                <Terminal className="w-5 h-5 text-gray-400" />
                <span>Open Console</span>
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <div key={i} className="p-4 bg-gray-800/30 rounded-xl border border-blue-500/10 hover:border-blue-500/30 transition-all group cursor-pointer">
              <feature.icon className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default WAFManagerTool;
