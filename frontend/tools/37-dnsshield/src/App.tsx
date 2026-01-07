import React, { useState, useEffect } from 'react';
import {
  Shield, Menu, X, Search, Settings, Bell, TrendingUp,
  Activity, AlertTriangle, Globe, Filter, BarChart3,
  Clock, Zap, Eye, EyeOff, RefreshCw
} from 'lucide-react';
import { DNSQuery, DNSThreat, DNSAnalytics, DNSAlert, DNSStats } from './types';

const App: React.FC = () => {
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

export default App;
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle transaction analysis
  const handleAnalyzeTransaction = async (transaction: Transaction) => {
    setIsLoading(true);
    try {
      const score = await fraudguardAPI.transactions.analyze(transaction);
      setCurrentScore(score);
      setFraudScores((prev) => ({ ...prev, [transaction.transaction_id]: score }));
      setTransactions((prev) => [transaction, ...prev]);
      
      // Add assistant message about analysis
      const riskColor = score.risk_level === 'critical' ? 'red' : 
                       score.risk_level === 'high' ? 'orange' : 
                       score.risk_level === 'medium' ? 'yellow' : 'green';
      
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Transaction analyzed. Risk Score: ${score.score}/100 (${score.risk_level.toUpperCase()}). ${score.indicators.length} risk indicators detected.`,
        timestamp: new Date(),
        provider: settings.selectedProvider,
      }]);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle chat message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response (would connect to real AI service)
    setTimeout(async () => {
      // Check for tool-related keywords
      let response = '';
      
      if (inputValue.toLowerCase().includes('analyze') && inputValue.toLowerCase().includes('transaction')) {
        response = "I can help you analyze a transaction. Please use the Transaction Form on the left to enter the transaction details, or provide me with the transaction data and I'll analyze it for you.";
      } else if (inputValue.toLowerCase().includes('alert')) {
        response = "You can manage fraud alerts from the Alerts panel. Would you like me to create a new alert rule? Just tell me the alert type, threshold score, and notification channels you'd like to use.";
      } else if (inputValue.toLowerCase().includes('report') || inputValue.toLowerCase().includes('export')) {
        response = "I can help you export reports. Go to the Export section to generate PDF or CSV reports with your fraud analysis data. You can filter by date range and risk levels.";
      } else if (inputValue.toLowerCase().includes('score') || inputValue.toLowerCase().includes('risk')) {
        response = `Based on my analysis, the current risk assessment shows ${transactions.length} transactions processed with an average risk score. Would you like me to break down the risk factors or show you the visualization?`;
      } else {
        response = "I'm here to help with fraud detection and analysis. I can:\n\n• Analyze transactions for fraud risk\n• Show risk visualizations and patterns\n• Create and manage fraud alerts\n• Export detailed reports\n\nWhat would you like to do?";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        provider: settings.selectedProvider,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Handle alert operations
  const handleCreateAlert = async (alert: Omit<Alert, 'id' | 'created_at' | 'triggered_count'>) => {
    try {
      const newAlert = await fraudguardAPI.alerts.create(alert);
      setAlerts((prev) => [...prev, newAlert]);
    } catch (error) {
      // For demo, create locally
      const localAlert: Alert = {
        ...alert,
        id: `alert_${Date.now()}`,
        created_at: new Date().toISOString(),
        triggered_count: 0,
      };
      setAlerts((prev) => [...prev, localAlert]);
    }
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleAlert = (id: string, active: boolean) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, active } : a));
  };

  // Handle report export
  const handleExport = async (format: 'pdf' | 'csv', options: any) => {
    // Simulate export
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('Exporting:', format, options);
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'analyze':
        return (
          <div className="space-y-6">
            <TransactionForm onSubmit={handleAnalyzeTransaction} isLoading={isLoading} />
            {currentScore && (
              <FraudScoreCard 
                score={currentScore} 
                onApprove={() => console.log('Approved')}
                onDecline={() => console.log('Declined')}
                onReview={() => console.log('Review')}
              />
            )}
          </div>
        );
      case 'visualize':
        return (
          <RiskVisualization 
            data={[
              { label: 'Card Mismatch', value: 35, color: '#EF4444' },
              { label: 'High Velocity', value: 25, color: '#F97316' },
              { label: 'New Device', value: 20, color: '#EAB308' },
              { label: 'Location Risk', value: 15, color: '#22C55E' },
              { label: 'Amount Flag', value: 5, color: '#3B82F6' },
            ]}
            chartType="risk_breakdown"
          />
        );
      case 'history':
        return (
          <TransactionHistory 
            transactions={transactions}
            fraudScores={fraudScores}
            onSelectTransaction={(t) => {
              const score = fraudScores[t.transaction_id];
              if (score) setCurrentScore(score);
              setActiveTab('analyze');
            }}
          />
        );
      case 'alerts':
        return (
          <AlertsPanel 
            alerts={alerts}
            onCreateAlert={handleCreateAlert}
            onDeleteAlert={handleDeleteAlert}
            onToggleAlert={handleToggleAlert}
          />
        );
      case 'reports':
        return (
          <ExportReport 
            transactions={transactions}
            fraudScores={fraudScores}
            onExport={handleExport}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/80 backdrop-blur-lg border-b border-red-500/30">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">FraudGuard</h1>
                <p className="text-xs text-red-400">AI Fraud Detection</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Workspace Mode Selector */}
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setWorkspaceMode('fraud-detection')}
                className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                  workspaceMode === 'fraud-detection' 
                    ? 'bg-red-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Detection
              </button>
              <button
                onClick={() => setWorkspaceMode('analytics')}
                className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                  workspaceMode === 'analytics' 
                    ? 'bg-cyan-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setWorkspaceMode('monitoring')}
                className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                  workspaceMode === 'monitoring' 
                    ? 'bg-yellow-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monitoring
              </button>
            </div>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {alerts.filter(a => a.active).length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Settings */}
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>

            {/* Toggle Chat */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-2 rounded-lg transition-colors ${
                chatOpen ? 'bg-red-500/20 text-red-400' : 'hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside 
          className={`fixed left-0 top-16 bottom-0 bg-slate-900/50 backdrop-blur border-r border-red-500/20 transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          <nav className="p-4 space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = {
                'search': Search,
                'analyze': Activity,
                'visualize': TrendingUp,
                'history': Clock,
                'alerts': AlertTriangle,
                'reports': FileText,
                'settings': Settings,
              }[item.id] || Activity;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 text-white'
                      : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Quick Stats */}
          {sidebarOpen && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="p-4 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl border border-red-500/30">
                <h4 className="text-sm font-bold text-white mb-3">Quick Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Analyzed Today</span>
                    <span className="text-white font-bold">{transactions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">High Risk</span>
                    <span className="text-red-400 font-bold">
                      {Object.values(fraudScores).filter(s => s.risk_level === 'high' || s.risk_level === 'critical').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Alerts</span>
                    <span className="text-yellow-400 font-bold">{alerts.filter(a => a.active).length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main 
          className={`flex-1 p-6 transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-16'
          } ${chatOpen ? 'mr-96' : ''}`}
        >
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {NAV_ITEMS.find(n => n.id === activeTab)?.label || 'FraudGuard'}
              </h2>
              <p className="text-gray-400 mt-1">
                {activeTab === 'analyze' && 'Analyze transactions for potential fraud'}
                {activeTab === 'visualize' && 'Visualize risk patterns and trends'}
                {activeTab === 'history' && 'View and manage transaction history'}
                {activeTab === 'alerts' && 'Configure and manage fraud alerts'}
                {activeTab === 'reports' && 'Generate and export reports'}
              </p>
            </div>

            {/* Tab Content */}
            {renderTabContent()}
          </div>
        </main>

        {/* Chat Panel */}
        {chatOpen && (
          <aside className="fixed right-0 top-16 bottom-0 w-96 bg-slate-900/50 backdrop-blur border-l border-red-500/20 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-red-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">AI Assistant</h3>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                      Online
                    </p>
                  </div>
                </div>
                <select 
                  value={settings.selectedProvider}
                  onChange={(e) => setSettings({ ...settings, selectedProvider: e.target.value as any })}
                  className="bg-slate-800 border border-red-500/30 rounded-lg px-2 py-1 text-sm"
                >
                  {Object.entries(PROVIDER_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-cyan-500/20' 
                      : 'bg-gradient-to-br from-red-500 to-pink-500'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`max-w-[80%] p-3 rounded-xl ${
                    message.role === 'user'
                      ? 'bg-cyan-500/20 border border-cyan-500/30'
                      : 'bg-slate-800/50 border border-red-500/30'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-800/50 border border-red-500/30 p-3 rounded-xl">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-red-500/20">
              <div className="flex items-center gap-2 bg-slate-800/50 border border-red-500/30 rounded-xl p-2">
                <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                </button>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about fraud detection..."
                  className="flex-1 bg-transparent outline-none text-sm"
                />
                <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                  <Mic className="w-4 h-4 text-gray-400" />
                </button>
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-[10px] text-gray-500 text-center mt-2">
                Powered by {PROVIDER_CONFIG[settings.selectedProvider]?.name || 'AI'}
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default App;
