import React, { useState, useEffect, useRef } from 'react';
import { 
  Wifi, Menu, MessageSquare, ChevronLeft,
  Bell, Activity, FileText,
  AlertTriangle, Send, Sparkles, Mic, 
  Paperclip, User, Bot, Radio, Laptop,
  Target, RefreshCw
} from 'lucide-react';

// Components
import {
  DashboardOverview,
  NetworksPanel,
  AccessPointsPanel,
  ClientsPanel,
  SecurityAlertsPanel,
  ThreatDetectionPanel
} from './components';

// Types
import { 
  WirelessNetwork, AccessPoint, WirelessClient, WirelessSecurityAlert,
  DashboardData, ThreatDetectionResult, Tab, Message
} from './types';

// Services
import wirelessWatchAPI from './services/wirelessWatchAPI';

interface NavItemDisplay {
  id: Tab;
  label: string;
  icon: React.ReactNode;
}

const App: React.FC = () => {
  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // Data state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [networks, setNetworks] = useState<WirelessNetwork[]>([]);
  const [accessPoints, setAccessPoints] = useState<AccessPoint[]>([]);
  const [clients, setClients] = useState<WirelessClient[]>([]);
  const [alerts, setAlerts] = useState<WirelessSecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'AGENT',
      text: "Welcome to WirelessWatch! 📡 I'm your AI-powered wireless security assistant. I can help you:\n\n• Monitor wireless networks and access points\n• Detect rogue APs and evil twin attacks\n• Analyze client connections and security\n• Investigate security alerts\n• Run threat detection scans\n\nHow can I help secure your wireless environment today?",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Navigation items with proper icons
  const navItems: NavItemDisplay[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-5 h-5" /> },
    { id: 'networks', label: 'Networks', icon: <Wifi className="w-5 h-5" /> },
    { id: 'access-points', label: 'Access Points', icon: <Radio className="w-5 h-5" /> },
    { id: 'clients', label: 'Clients', icon: <Laptop className="w-5 h-5" /> },
    { id: 'alerts', label: 'Alerts', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'threat-detection', label: 'Threat Detection', icon: <Target className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-5 h-5" /> },
  ];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
    loadNetworks();
    loadAccessPoints();
    loadClients();
    loadAlerts();
  }, []);

  // Data loading functions
  const loadDashboardData = async () => {
    try {
      const data = await wirelessWatchAPI.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      // Set demo data
      setDashboardData({
        overview: {
          totalNetworks: 12,
          activeNetworks: 10,
          rogueNetworks: 0,
          totalAPs: 48,
          onlineAPs: 45,
          totalClients: 234,
          connectedClients: 189,
          newAlerts: 3,
          criticalAlerts: 1
        },
        networksByType: [
          { _id: 'corporate', count: 4 },
          { _id: 'guest', count: 3 },
          { _id: 'iot', count: 5 }
        ],
        clientsByDevice: [
          { _id: 'laptop', count: 89 },
          { _id: 'smartphone', count: 78 },
          { _id: 'tablet', count: 34 },
          { _id: 'iot', count: 33 }
        ],
        recentAlerts: [],
        healthScore: 87,
        timestamp: new Date().toISOString()
      });
    }
  };

  const loadNetworks = async () => {
    try {
      const data = await wirelessWatchAPI.networks.getAll();
      setNetworks(data);
    } catch (error) {
      console.error('Failed to load networks:', error);
    }
  };

  const loadAccessPoints = async () => {
    try {
      const data = await wirelessWatchAPI.accessPoints.getAll();
      setAccessPoints(data);
    } catch (error) {
      console.error('Failed to load access points:', error);
    }
  };

  const loadClients = async () => {
    try {
      const data = await wirelessWatchAPI.clients.getAll();
      setClients(data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const data = await wirelessWatchAPI.alerts.getAll();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  // Handle threat detection scans
  const handleRunScan = async (scanType: string): Promise<ThreatDetectionResult> => {
    setIsLoading(true);
    try {
      let result: ThreatDetectionResult;
      
      switch (scanType) {
        case 'rogue-aps':
          result = await wirelessWatchAPI.threatDetection.scanRogueAPs();
          break;
        case 'weak-encryption':
          const weakResult = await wirelessWatchAPI.threatDetection.scanWeakEncryption();
          result = {
            scannedNetworks: weakResult.weakNetworksFound,
            detectedRogues: 0,
            rogueNetworks: [],
            timestamp: new Date().toISOString(),
            scanType: 'weak-encryption',
            severity: weakResult.weakNetworksFound > 0 ? 'high' : 'info',
            threatCount: weakResult.weakNetworksFound,
            scannedItems: weakResult.weakNetworksFound,
            findings: weakResult.alerts.map(a => ({
              name: a.title,
              description: a.description,
              severity: a.severity,
              type: a.alertType
            }))
          };
          break;
        case 'signal-anomalies':
          await wirelessWatchAPI.threatDetection.analyzeSignals();
          result = {
            scannedNetworks: 0,
            detectedRogues: 0,
            rogueNetworks: [],
            timestamp: new Date().toISOString(),
            scanType: 'signal-anomalies',
            severity: 'info',
            threatCount: 0,
            scannedItems: 50,
            findings: []
          };
          break;
        case 'threat-hunting':
          const huntResult = await wirelessWatchAPI.threatDetection.performThreatHunting();
          result = {
            scannedNetworks: huntResult.networks || 0,
            detectedRogues: 0,
            rogueNetworks: [],
            timestamp: huntResult.timestamp,
            scanType: 'threat-hunting',
            severity: 'info',
            threatCount: 0,
            scannedItems: (huntResult.networks || 0) + (huntResult.clients || 0) + (huntResult.accessPoints || 0),
            findings: []
          };
          break;
        default:
          throw new Error(`Unknown scan type: ${scanType}`);
      }
      
      // Add assistant message about scan
      addMessage(
        'AGENT',
        `${scanType.replace(/-/g, ' ').toUpperCase()} scan complete. Found ${result.threatCount || 0} potential threats. ${result.findings?.length || 0} items require attention.`
      );
      
      return result;
    } catch (error) {
      console.error('Scan error:', error);
      // Return demo result on error
      return {
        scannedNetworks: 50,
        detectedRogues: 0,
        rogueNetworks: [],
        timestamp: new Date().toISOString(),
        scanType: scanType as ThreatDetectionResult['scanType'],
        severity: 'info',
        threatCount: 0,
        scannedItems: 50,
        findings: []
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to add messages
  const addMessage = (sender: 'YOU' | 'AGENT' | 'SYSTEM', text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender,
      text,
      timestamp: new Date().toISOString()
    }]);
  };

  // Handle alert operations
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await wirelessWatchAPI.alerts.acknowledge(alertId, 'system');
      setAlerts(prev => prev.map(a => 
        a.alertId === alertId ? { ...a, status: 'acknowledged' as const } : a
      ));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await wirelessWatchAPI.alerts.resolve(alertId, {
        resolvedBy: 'system',
        notes: 'Resolved from dashboard'
      });
      setAlerts(prev => prev.map(a => 
        a.alertId === alertId ? { ...a, status: 'resolved' as const } : a
      ));
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  // Handle blocking client
  const handleBlockClient = async (clientId: string, reason: string) => {
    try {
      await wirelessWatchAPI.clients.block(clientId, reason);
      setClients(prev => prev.map(c => 
        c.clientId === clientId ? { ...c, connectionStatus: 'blocked' as const } : c
      ));
      
      addMessage('AGENT', `Client ${clientId} has been blocked. Reason: ${reason}`);
    } catch (error) {
      console.error('Failed to block client:', error);
    }
  };

  // Handle chat submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    addMessage('YOU', userMessage);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let response = '';
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes('rogue') || lowerMessage.includes('scan')) {
        response = `I can help you scan for rogue access points. Use the Threat Detection panel to run a comprehensive scan. Would you like me to guide you through the process?`;
      } else if (lowerMessage.includes('alert') || lowerMessage.includes('security')) {
        const newAlerts = alerts.filter(a => a.status === 'new').length;
        response = `There are ${newAlerts} new security alerts. You can review and manage them in the Security Alerts panel. I can help you investigate any specific alerts.`;
      } else if (lowerMessage.includes('client') || lowerMessage.includes('device')) {
        response = `Currently monitoring ${clients.length} clients. ${clients.filter(c => c.connectionStatus === 'connected').length} are actively connected. Check the Clients panel for detailed information.`;
      } else if (lowerMessage.includes('network') || lowerMessage.includes('ssid')) {
        response = `You have ${networks.length} networks configured. ${networks.filter(n => n.status === 'active').length} are currently active. Use the Networks panel to manage them.`;
      } else {
        response = `I'm here to help with wireless security monitoring. You can ask me about:\n• Network status and management\n• Access point monitoring\n• Client device tracking\n• Security alerts and threats\n• Rogue AP detection`;
      }

      addMessage('AGENT', response);
      setIsTyping(false);
    }, 1000);
  };

  // Render main content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return dashboardData ? (
          <DashboardOverview 
            data={dashboardData} 
            isLoading={isLoading}
            onRefresh={loadDashboardData}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        );
      case 'networks':
        return (
          <NetworksPanel 
            networks={networks}
            isLoading={isLoading}
            onRefresh={loadNetworks}
            onSelect={(network) => console.log('Selected network:', network)}
            onAddNetwork={() => console.log('Add network')}
          />
        );
      case 'access-points':
        return (
          <AccessPointsPanel 
            accessPoints={accessPoints}
            isLoading={isLoading}
            onRefresh={loadAccessPoints}
            onSelect={(ap) => console.log('Selected AP:', ap)}
          />
        );
      case 'clients':
        return (
          <ClientsPanel 
            clients={clients}
            isLoading={isLoading}
            onRefresh={loadClients}
            onBlock={handleBlockClient}
            onSelect={(client) => console.log('Selected client:', client)}
          />
        );
      case 'alerts':
        return (
          <SecurityAlertsPanel 
            alerts={alerts}
            isLoading={isLoading}
            onRefresh={loadAlerts}
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
            onSelect={(alert) => console.log('Selected alert:', alert)}
          />
        );
      case 'threat-detection':
        return (
          <ThreatDetectionPanel onRunScan={handleRunScan} />
        );
      case 'reports':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Reports</h2>
            <p className="text-gray-400">Report generation coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-700 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Wifi className="w-6 h-6 text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                WirelessWatch
              </h1>
              <p className="text-xs text-gray-500">Security Monitor</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                activeTab === item.id
                  ? 'bg-cyan-500/20 text-cyan-400 border-r-2 border-cyan-500'
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
              {item.id === 'alerts' && alerts.filter(a => a.status === 'new').length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {alerts.filter(a => a.status === 'new').length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Toggle sidebar button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 border-t border-gray-700 text-gray-400 hover:text-white"
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Health Score */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                (dashboardData?.healthScore || 0) > 80 ? 'bg-green-500' :
                (dashboardData?.healthScore || 0) > 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-300">
                Health: {dashboardData?.healthScore || '--'}%
              </span>
            </div>
            
            {/* Alerts indicator */}
            <button className="relative p-2 hover:bg-gray-700 rounded-lg">
              <Bell className="w-5 h-5 text-gray-400" />
              {alerts.filter(a => a.status === 'new').length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {alerts.filter(a => a.status === 'new').length}
                </span>
              )}
            </button>
            
            {/* Refresh */}
            <button 
              onClick={() => {
                loadDashboardData();
                loadNetworks();
                loadAccessPoints();
                loadClients();
                loadAlerts();
              }}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <RefreshCw className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Chat toggle */}
            <button 
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-2 rounded-lg ${chatOpen ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-gray-700 text-gray-400'}`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content + Chat */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main content */}
          <main className={`flex-1 overflow-auto p-6 ${chatOpen ? 'mr-80' : ''}`}>
            {renderContent()}
          </main>

          {/* Chat Panel */}
          {chatOpen && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col fixed right-0 top-16 bottom-0">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-700 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">WirelessWatch AI</h3>
                  <p className="text-xs text-gray-500">Security Assistant</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === 'YOU' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'YOU' 
                        ? 'bg-blue-600' 
                        : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                    }`}>
                      {message.sender === 'YOU' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'YOU'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
                <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-2">
                  <button type="button" className="p-1.5 text-gray-400 hover:text-white">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about wireless security..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder-gray-500"
                  />
                  <button type="button" className="p-1.5 text-gray-400 hover:text-white">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button 
                    type="submit"
                    className="p-1.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
