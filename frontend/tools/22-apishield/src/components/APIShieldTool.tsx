import React, { useState, useEffect } from 'react';
import { 
  Shield, Activity, AlertTriangle, RefreshCw, Settings, 
  Lock, Eye, Zap, TrendingUp, Search, Download,
  Play, Pause, Bell, Terminal, Key, Code, Database, ArrowLeft
} from 'lucide-react';

interface Stats {
  endpoints: number;
  requests: number;
  blocked: number;
  rateLimit: number;
}

interface Alert {
  id: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
}

const APIShieldTool: React.FC = () => {
  const [isActive, setIsActive] = useState(true);
  const [stats, setStats] = useState<Stats>({
    endpoints: 156,
    requests: 2456789,
    blocked: 3421,
    rateLimit: 12
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedTab, setSelectedTab] = useState('dashboard');

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        endpoints: prev.endpoints,
        requests: prev.requests + Math.floor(Math.random() * 1000),
        blocked: prev.blocked + (Math.random() > 0.8 ? 1 : 0),
        rateLimit: Math.max(0, prev.rateLimit + (Math.random() > 0.7 ? 1 : -1))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setAlerts([
      { id: '1', message: 'Unauthorized API key detected on /api/v2/users', severity: 'critical', timestamp: '1 min ago' },
      { id: '2', message: 'Rate limit exceeded for client app-mobile-ios', severity: 'high', timestamp: '3 min ago' },
      { id: '3', message: 'Deprecated endpoint /api/v1/auth accessed', severity: 'medium', timestamp: '10 min ago' },
      { id: '4', message: 'New API key generated for production', severity: 'low', timestamp: '1 hour ago' },
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
    { icon: Key, title: 'API Key Management', desc: 'Secure key rotation' },
    { icon: Zap, title: 'Rate Limiting', desc: 'Granular controls' },
    { icon: Lock, title: 'OAuth 2.0', desc: 'Token validation' },
    { icon: Code, title: 'Schema Validation', desc: 'Request/Response' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      <header className="border-b border-purple-500/20 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="https://maula.ai/#tool-22" className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Back to MAULA.AI">
              <ArrowLeft className="w-6 h-6 text-gray-400 hover:text-white" />
            </a>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Lock className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                API Shield
              </h1>
              <p className="text-sm text-gray-400">API Security & Rate Limiting Platform</p>
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
              {isActive ? 'Shield Active' : 'Shield Paused'}
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-purple-500/20 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {['dashboard', 'endpoints', 'keys', 'analytics', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-all ${
                  selectedTab === tab
                    ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-6 h-6 text-purple-400" />
              <span className="text-xs text-purple-400">Monitored</span>
            </div>
            <p className="text-3xl font-bold">{stats.endpoints}</p>
            <p className="text-sm text-gray-400">API Endpoints</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-6 h-6 text-blue-400" />
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400">{(stats.requests / 1000000).toFixed(2)}M</p>
            <p className="text-sm text-gray-400">Total Requests</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-red-500/20">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-red-400">{stats.blocked.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Requests Blocked</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-yellow-500/20">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-yellow-400">{stats.rateLimit}</p>
            <p className="text-sm text-gray-400">Rate Limited</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-gray-800/50 rounded-xl border border-purple-500/20">
            <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-400" />
                API Security Events
              </h2>
              <button className="text-sm text-purple-400 hover:underline">View All</button>
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

          <div className="bg-gray-800/50 rounded-xl border border-purple-500/20">
            <div className="p-4 border-b border-gray-700/50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Quick Actions
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <button className="w-full p-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center gap-3 transition-colors">
                <Key className="w-5 h-5 text-purple-400" />
                <span>Generate API Key</span>
              </button>
              <button className="w-full p-3 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 rounded-lg flex items-center gap-3 transition-colors">
                <Search className="w-5 h-5 text-gray-400" />
                <span>Inspect Endpoint</span>
              </button>
              <button className="w-full p-3 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 rounded-lg flex items-center gap-3 transition-colors">
                <Download className="w-5 h-5 text-gray-400" />
                <span>Export OpenAPI</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <div key={i} className="p-4 bg-gray-800/30 rounded-xl border border-purple-500/10 hover:border-purple-500/30 transition-all group cursor-pointer">
              <feature.icon className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default APIShieldTool;
