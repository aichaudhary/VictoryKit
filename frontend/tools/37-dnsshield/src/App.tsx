import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Shield, Menu, X, Search, Settings, Bell, TrendingUp,
  Activity, AlertTriangle, Globe, Filter, BarChart3,
  Clock, Zap, Eye, EyeOff, RefreshCw
} from 'lucide-react';
import { DNSQuery, DNSThreat, DNSAnalytics, DNSAlert, DNSStats } from './types';

// Pages
import LandingPage from './pages/LandingPage';
import NeuralLinkInterface from './components/NeuralLinkInterface';

const DNSShieldExperience: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'queries' | 'threats' | 'rules' | 'analytics' | 'alerts'>('dashboard');
  const [queries, setQueries] = useState<DNSQuery[]>([]);
  const [threats, setThreats] = useState<DNSThreat[]>([]);
  const [analytics, setAnalytics] = useState<DNSAnalytics | null>(null);
  const [alerts, setAlerts] = useState<DNSAlert[]>([]);
  const [stats, setStats] = useState<DNSStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading DNS data
    setStats({
      queriesPerSecond: 1250,
      totalQueries: 2456789,
      blockedPercentage: 3.2,
      activeThreats: 47,
      uptime: 99.9,
      responseTime: 12
    });

    setAnalytics({
      totalQueries: 2456789,
      blockedQueries: 78912,
      maliciousQueries: 15634,
      topDomains: [
        { domain: 'google.com', count: 45678 },
        { domain: 'microsoft.com', count: 34567 },
        { domain: 'amazon.com', count: 23456 }
      ],
      topThreats: [
        { type: 'malware', count: 1234 },
        { type: 'phishing', count: 987 },
        { type: 'botnet', count: 654 }
      ],
      queryTypes: { A: 156789, AAAA: 45678, CNAME: 34567, MX: 12345 },
      timeSeries: []
    });

    setQueries([
      {
        id: '1',
        domain: 'suspicious-domain.ru',
        queryType: 'A',
        sourceIP: '192.168.1.100',
        timestamp: new Date(),
        responseTime: 45,
        status: 'blocked',
        threatLevel: 'high'
      }
    ]);

    setThreats([
      {
        id: '1',
        domain: 'malware-site.com',
        threatType: 'malware',
        severity: 'high',
        confidence: 0.95,
        firstSeen: new Date(Date.now() - 86400000),
        lastSeen: new Date(),
        sources: ['AbuseIPDB', 'MalwareBazaar'],
        indicators: ['Known malware distribution']
      }
    ]);

    setAlerts([
      {
        id: '1',
        title: 'High-volume DNS tunneling detected',
        description: 'Unusual DNS query patterns from 192.168.1.100',
        severity: 'high',
        type: 'threat',
        sourceIP: '192.168.1.100',
        timestamp: new Date(),
        acknowledged: false,
        resolved: false
      }
    ]);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'queries', label: 'DNS Queries', icon: Globe },
    { id: 'threats', label: 'Threats', icon: AlertTriangle },
    { id: 'rules', label: 'Rules', icon: Filter },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'alerts', label: 'Alerts', icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">DNSShield</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search domains..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/maula/ai')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>AI Assistant</span>
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell className="w-5 h-5" />
              {alerts.filter(a => !a.acknowledged).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {alerts.filter(a => !a.acknowledged).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Queries/sec</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.queriesPerSecond.toLocaleString()}</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Queries</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalQueries.toLocaleString()}</p>
                    </div>
                    <Globe className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Blocked</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.blockedPercentage}%</p>
                    </div>
                    <Shield className="w-8 h-8 text-red-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Threats</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.activeThreats}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Recent DNS Queries</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {queries.slice(0, 5).map((query) => (
                      <div key={query.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            query.status === 'blocked' ? 'bg-red-500' :
                            query.status === 'monitored' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-900">{query.domain}</p>
                            <p className="text-sm text-gray-600">{query.sourceIP} • {query.queryType}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{query.responseTime}ms</p>
                          <p className="text-xs text-gray-600">{query.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'queries' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">DNS Query Log</h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Domain</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Source IP</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Response Time</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queries.map((query) => (
                        <tr key={query.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">{query.domain}</td>
                          <td className="py-3 px-4">{query.queryType}</td>
                          <td className="py-3 px-4">{query.sourceIP}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              query.status === 'blocked' ? 'bg-red-100 text-red-800' :
                              query.status === 'monitored' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {query.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{query.responseTime}ms</td>
                          <td className="py-3 px-4">{query.timestamp.toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'threats' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Active Threats</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {threats.map((threat) => (
                    <div key={threat.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{threat.domain}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          threat.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          threat.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          threat.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {threat.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{threat.threatType}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Confidence: {(threat.confidence * 100).toFixed(1)}%</span>
                        <span>Last seen: {threat.lastSeen.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Security Alerts</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{alert.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.severity}
                          </span>
                          {!alert.acknowledged && (
                            <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{alert.timestamp.toLocaleString()}</span>
                        {alert.sourceIP && <span>IP: {alert.sourceIP}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/maula" element={<DNSShieldExperience />} />
      <Route path="/maula/ai" element={<NeuralLinkInterface />} />
    </Routes>
  );
}

export default App;
