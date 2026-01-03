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
