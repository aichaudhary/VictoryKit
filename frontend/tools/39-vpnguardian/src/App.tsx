import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Menu, X, MessageSquare, ChevronLeft, ChevronRight,
  Search, Settings, Bell, TrendingUp, Activity, FileText,
  AlertTriangle, CheckCircle, Clock, Send, Sparkles, Mic,
  Paperclip, MoreHorizontal, User, Bot, Wifi, WifiOff
} from 'lucide-react';

// Components
import VPNSummary from './components/VPNSummary';
import VPNConnectionsList from './components/VPNConnectionsList';
import SecurityAlertsPanel from './components/SecurityAlertsPanel';
import RealTimeCharts from './components/RealTimeCharts';

// Types and constants
import {
  VPNConnection,
  VPNSecurityAlert,
  VPNUser,
  VPNSummaryData,
  Message,
  SettingsState
} from './types';
import { NAV_ITEMS, DEFAULT_SETTINGS } from './constants';

// Services
import { vpnGuardianAPI } from './services/vpnGuardianAPI';

const App: React.FC = () => {
  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);

  // Data state
  const [connections, setConnections] = useState<VPNConnection[]>([]);
  const [alerts, setAlerts] = useState<VPNSecurityAlert[]>([]);
  const [summaryData, setSummaryData] = useState<VPNSummaryData>({
    totalConnections: 0,
    activeConnections: 0,
    securityAlerts: 0,
    bandwidthUsage: 0
  });
  const [realTimeData, setRealTimeData] = useState<Array<{
    timestamp: Date;
    connections: number;
    bandwidth: number;
    alerts: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to VPNGuardian! I'm your AI-powered VPN security assistant. I can help you monitor connections, detect security threats, manage policies, and ensure your VPN infrastructure is secure. How can I assist you today?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize data on mount
  useEffect(() => {
    loadInitialData();
    setupWebSocket();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [connectionsRes, alertsRes, summaryRes] = await Promise.all([
        vpnGuardianAPI.getConnections(),
        vpnGuardianAPI.getAlerts(),
        vpnGuardianAPI.getDashboardSummary()
      ]);

      if (connectionsRes.success) setConnections(connectionsRes.data);
      if (alertsRes.success) setAlerts(alertsRes.data);
      if (summaryRes.success) setSummaryData(summaryRes.data);

      // Generate mock real-time data for demo
      generateMockRealTimeData();
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupWebSocket = () => {
    const ws = vpnGuardianAPI.connectWebSocket((data) => {
      if (data.type === 'connection_update') {
        setConnections(prev => prev.map(conn =>
          conn.id === data.connectionId ? { ...conn, ...data.updates } : conn
        ));
      } else if (data.type === 'alert_new') {
        setAlerts(prev => [data.alert, ...prev]);
        setSummaryData(prev => ({ ...prev, securityAlerts: prev.securityAlerts + 1 }));
      } else if (data.type === 'metrics_update') {
        setSummaryData(prev => ({ ...prev, ...data.metrics }));
        setRealTimeData(prev => [...prev.slice(-19), {
          timestamp: new Date(),
          connections: data.metrics.activeConnections || 0,
          bandwidth: data.metrics.bandwidthUsage || 0,
          alerts: data.metrics.securityAlerts || 0
        }]);
      }
    });
    setWsConnection(ws);
  };

  const generateMockRealTimeData = () => {
    const mockData = [];
    const now = new Date();
    for (let i = 19; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60000); // Every minute for last 20 minutes
      mockData.push({
        timestamp,
        connections: Math.floor(Math.random() * 50) + 10,
        bandwidth: Math.floor(Math.random() * 1000) + 100,
        alerts: Math.floor(Math.random() * 5)
      });
    }
    setRealTimeData(mockData);
  };

  // Handle connection actions
  const handleConnectionClick = (connection: VPNConnection) => {
    setActiveTab('connections');
    // Could open connection details modal here
  };

  const handleConnectVPN = async (connectionId: string) => {
    try {
      await vpnGuardianAPI.connectVPN(connectionId);
      setConnections(prev => prev.map(conn =>
        conn.id === connectionId ? { ...conn, status: 'connecting' } : conn
      ));
    } catch (error) {
      console.error('Failed to connect VPN:', error);
    }
  };

  const handleDisconnectVPN = async (connectionId: string) => {
    try {
      await vpnGuardianAPI.disconnectVPN(connectionId);
      setConnections(prev => prev.map(conn =>
        conn.id === connectionId ? { ...conn, status: 'disconnected' } : conn
      ));
    } catch (error) {
      console.error('Failed to disconnect VPN:', error);
    }
  };

  // Handle alert actions
  const handleAlertClick = (alert: VPNSecurityAlert) => {
    // Could open alert details modal
    console.log('Alert clicked:', alert);
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await vpnGuardianAPI.dismissAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      setSummaryData(prev => ({ ...prev, securityAlerts: Math.max(0, prev.securityAlerts - 1) }));
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
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

    try {
      // Simulate AI response for VPN security queries
      setTimeout(() => {
        const responses = [
          "I've analyzed your VPN connections. Everything looks secure with no critical alerts detected.",
          "Your WireGuard connections are performing optimally. Bandwidth usage is within normal parameters.",
          "Security scan completed. No unauthorized access attempts detected in the last 24 hours.",
          "Policy enforcement is active. All connections are complying with your security policies.",
          "Real-time monitoring shows stable connection health across all VPN endpoints."
        ];

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1000 + Math.random() * 2000);
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
    }
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <VPNSummary data={summaryData} isLoading={isLoading} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VPNConnectionsList
                connections={connections}
                onConnectionClick={handleConnectionClick}
                onConnect={handleConnectVPN}
                onDisconnect={handleDisconnectVPN}
                isLoading={isLoading}
              />
              <SecurityAlertsPanel
                alerts={alerts}
                onAlertClick={handleAlertClick}
                onDismissAlert={handleDismissAlert}
                isLoading={isLoading}
              />
            </div>
            <RealTimeCharts connectionData={realTimeData} isLoading={isLoading} />
          </div>
        );
      case 'connections':
        return (
          <VPNConnectionsList
            connections={connections}
            onConnectionClick={handleConnectionClick}
            onConnect={handleConnectVPN}
            onDisconnect={handleDisconnectVPN}
            isLoading={isLoading}
          />
        );
      case 'alerts':
        return (
          <SecurityAlertsPanel
            alerts={alerts}
            onAlertClick={handleAlertClick}
            onDismissAlert={handleDismissAlert}
            isLoading={isLoading}
          />
        );
      default:
        return (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Feature Coming Soon</h3>
            <p className="text-gray-500">This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-sm border-r transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            {sidebarOpen && <span className="font-bold text-lg">VPNGuardian</span>}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t">
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Settings className="h-5 w-5" />
            {sidebarOpen && <span>Settings</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {NAV_ITEMS.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${wsConnection ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {wsConnection ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Bell className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <User className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {renderMainContent()}
        </main>
      </div>

      {/* Chat Panel */}
      <div className={`${chatOpen ? 'w-80' : 'w-12'} bg-white border-l transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600" />
            {chatOpen && <span className="font-medium">VPNGuardian AI</span>}
          </div>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {chatOpen ? <X className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
          </button>
        </div>

        {chatOpen && (
          <>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about VPN security..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
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
