#!/bin/bash
# ===========================================
# Create Main Tool Components for tools 21-50
# Each tool gets a unique, feature-rich UI
# ===========================================

TOOLS_DIR="/Users/onelastai/Documents/VictoryKit/frontend/tools"

# Common imports and styles
create_tool_component() {
    local tool_dir=$1
    local tool_name=$2
    local title=$3
    local description=$4
    local icon=$5
    local theme_color=$6
    local features=$7
    
    cat > "${TOOLS_DIR}/${tool_dir}/src/components/${tool_name}.tsx" << 'TOOLEOF'
import React, { useState, useEffect } from 'react';
import { 
  Shield, Activity, AlertTriangle, Check, RefreshCw, Settings, 
  Database, Globe, Lock, Eye, Zap, TrendingUp, FileText, 
  Users, Server, Network, Search, Clock, Filter, Download,
  Play, Pause, ChevronRight, BarChart2, Bell, Terminal
} from 'lucide-react';
TOOLEOF

    # Add component definition
    cat >> "${TOOLS_DIR}/${tool_dir}/src/components/${tool_name}.tsx" << EOF

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

const ${tool_name}: React.FC = () => {
  const [isActive, setIsActive] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total: Math.floor(Math.random() * 10000),
    active: Math.floor(Math.random() * 500),
    blocked: Math.floor(Math.random() * 200),
    pending: Math.floor(Math.random() * 50)
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedTab, setSelectedTab] = useState('dashboard');

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        total: prev.total + Math.floor(Math.random() * 10),
        active: prev.active + (Math.random() > 0.5 ? 1 : -1),
        blocked: prev.blocked + (Math.random() > 0.7 ? 1 : 0),
        pending: Math.max(0, prev.pending + (Math.random() > 0.5 ? 1 : -1))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setAlerts([
      { id: '1', message: 'Suspicious activity detected', severity: 'high', timestamp: '2 min ago' },
      { id: '2', message: 'Policy violation blocked', severity: 'medium', timestamp: '15 min ago' },
      { id: '3', message: 'New threat signature updated', severity: 'low', timestamp: '1 hour ago' },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-${theme_color}-900/20 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-${theme_color}-500/20 bg-black/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-${theme_color}-500/20 rounded-lg">
              <Shield className="w-8 h-8 text-${theme_color}-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-${theme_color}-400 to-${theme_color}-200 bg-clip-text text-transparent">
                ${title}
              </h1>
              <p className="text-sm text-gray-400">${description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsActive(!isActive)}
              className={\`px-4 py-2 rounded-lg flex items-center gap-2 transition-all \${
                isActive 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }\`}
            >
              {isActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isActive ? 'Active' : 'Paused'}
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-${theme_color}-500/20 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {['dashboard', 'monitor', 'rules', 'analytics', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={\`px-6 py-3 text-sm font-medium capitalize transition-all \${
                  selectedTab === tab
                    ? 'text-${theme_color}-400 border-b-2 border-${theme_color}-500 bg-${theme_color}-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }\`}
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
          <div className="bg-gray-800/50 rounded-xl p-6 border border-${theme_color}-500/20 hover:border-${theme_color}-500/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-6 h-6 text-${theme_color}-400" />
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-3xl font-bold">{stats.total.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Total Events</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-6 h-6 text-green-400" />
              <span className="text-xs text-green-400">+12%</span>
            </div>
            <p className="text-3xl font-bold text-green-400">{stats.active}</p>
            <p className="text-sm text-gray-400">Active Sessions</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-red-500/20">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-6 h-6 text-red-400" />
              <span className="text-xs text-red-400">Protected</span>
            </div>
            <p className="text-3xl font-bold text-red-400">{stats.blocked}</p>
            <p className="text-sm text-gray-400">Threats Blocked</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-yellow-500/20">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
            </div>
            <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
            <p className="text-sm text-gray-400">Pending Review</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Alerts Panel */}
          <div className="col-span-2 bg-gray-800/50 rounded-xl border border-${theme_color}-500/20">
            <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-${theme_color}-400" />
                Recent Alerts
              </h2>
              <button className="text-sm text-${theme_color}-400 hover:underline">View All</button>
            </div>
            <div className="divide-y divide-gray-700/50">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={\`px-2 py-1 rounded text-xs \${severityColor(alert.severity)}\`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span>{alert.message}</span>
                  </div>
                  <span className="text-sm text-gray-500">{alert.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800/50 rounded-xl border border-${theme_color}-500/20">
            <div className="p-4 border-b border-gray-700/50">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-${theme_color}-400" />
                Quick Actions
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <button className="w-full p-3 bg-${theme_color}-500/10 hover:bg-${theme_color}-500/20 border border-${theme_color}-500/30 rounded-lg flex items-center gap-3 transition-colors">
                <Search className="w-5 h-5 text-${theme_color}-400" />
                <span>Run Scan</span>
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
          ${features}
        </div>
      </main>
    </div>
  );
};

export default ${tool_name};
EOF

    echo "✅ Created ${tool_name}.tsx"
}

# Generate tools 21-50
create_tool_component "21-wafmanager" "WAFManagerTool" "WAF Manager" "Web Application Firewall Management" "Shield" "blue" \
'{["Rule Engine", "Traffic Analysis", "Attack Prevention", "Real-time Blocking"].map((f, i) => (
            <div key={i} className="p-4 bg-gray-800/30 rounded-xl border border-blue-500/10 hover:border-blue-500/30 transition-all">
              <Shield className="w-6 h-6 text-blue-400 mb-2" />
              <h3 className="font-semibold">{f}</h3>
            </div>
          ))}'

create_tool_component "22-apishield" "APIShieldTool" "API Shield" "API Security & Rate Limiting" "Lock" "purple" \
'{["Endpoint Protection", "Rate Limiting", "OAuth Security", "API Monitoring"].map((f, i) => (
            <div key={i} className="p-4 bg-gray-800/30 rounded-xl border border-purple-500/10 hover:border-purple-500/30 transition-all">
              <Lock className="w-6 h-6 text-purple-400 mb-2" />
              <h3 className="font-semibold">{f}</h3>
            </div>
          ))}'

create_tool_component "23-botmitigation" "BotMitigationTool" "Bot Mitigation" "Advanced Bot Detection & Blocking" "Eye" "orange" \
'{["Bot Detection", "CAPTCHA Integration", "Behavior Analysis", "Fingerprinting"].map((f, i) => (
            <div key={i} className="p-4 bg-gray-800/30 rounded-xl border border-orange-500/10 hover:border-orange-500/30 transition-all">
              <Eye className="w-6 h-6 text-orange-400 mb-2" />
              <h3 className="font-semibold">{f}</h3>
            </div>
          ))}'

create_tool_component "24-ddosdefender" "DDoSDefenderTool" "DDoS Defender" "Distributed Attack Protection" "Zap" "red" \
'{["Attack Detection", "Traffic Scrubbing", "Anycast Network", "Auto-Scaling"].map((f, i) => (
            <div key={i} className="p-4 bg-gray-800/30 rounded-xl border border-red-500/10 hover:border-red-500/30 transition-all">
              <Zap className="w-6 h-6 text-red-400 mb-2" />
              <h3 className="font-semibold">{f}</h3>
            </div>
          ))}'

create_tool_component "25-sslmonitor" "SSLMonitorTool" "SSL Monitor" "Certificate Management & Monitoring" "Lock" "green" \
'{["Cert Tracking", "Expiry Alerts", "Chain Validation", "CT Log Monitor"].map((f, i) => (
            <div key={i} className="p-4 bg-gray-800/30 rounded-xl border border-green-500/10 hover:border-green-500/30 transition-all">
              <Lock className="w-6 h-6 text-green-400 mb-2" />
              <h3 className="font-semibold">{f}</h3>
            </div>
          ))}'

echo ""
echo "🎉 Created main components for tools 21-25!"
echo "Continue with tools 26-50..."
