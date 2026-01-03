import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Menu, MessageSquare, ChevronLeft,
  Bell, FileText, AlertTriangle, 
  Send, Sparkles, Paperclip, User, Bot, 
  Scan, Monitor, Link2, BarChart3,
  RefreshCw, X, Minimize2, Maximize2,
  Settings
} from 'lucide-react';

// Import components
import DLPDashboard from './components/DLPDashboard';
import ContentScanner from './components/ContentScanner';
import PolicyManager from './components/PolicyManager';
import IncidentPanel from './components/IncidentPanel';
import EndpointMonitor from './components/EndpointMonitor';
import ReportsPanel from './components/ReportsPanel';
import IntegrationsPanel from './components/IntegrationsPanel';

// Types
import { Message, DLPTab, DashboardStats, ScanResult } from './types';

// API Service
import { dlpAPI } from './services/dlpAPI';

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4041';

// Navigation items
interface NavItem {
  id: DLPTab;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const App: React.FC = () => {
  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<DLPTab>('dashboard');
  
  // Data state
  const [stats, setStats] = useState<DashboardStats>({
    totalScans: 0,
    totalViolations: 0,
    activeIncidents: 0,
    policiesEnabled: 0,
    riskScore: 0,
    dataTypesProtected: 0,
    endpointsMonitored: 0,
    cloudAppsConnected: 0
  });
  const [incidentCount, setIncidentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'AGENT',
      text: "Welcome to Data Loss Prevention! 🛡️ I'm your AI-powered DLP assistant. I can help you:\n\n• Scan content and files for sensitive data\n• Create and manage DLP policies\n• Investigate data leak incidents\n• Monitor cloud services and endpoints\n• Generate compliance reports\n\nHow can I help protect your data today?",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Navigation items
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'scan', label: 'Content Scanner', icon: <Scan className="w-5 h-5" /> },
    { id: 'policies', label: 'Policies', icon: <FileText className="w-5 h-5" /> },
    { id: 'incidents', label: 'Incidents', icon: <AlertTriangle className="w-5 h-5" />, badge: incidentCount },
    { id: 'integrations', label: 'Integrations', icon: <Link2 className="w-5 h-5" /> },
    { id: 'endpoints', label: 'Endpoints', icon: <Monitor className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-5 h-5" /> },
  ];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load initial data
  useEffect(() => {
    loadDashboardStats();
    loadIncidentCount();
  }, []);

  // Load dashboard stats
  const loadDashboardStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/dlp/dashboard/stats`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Load incident count for badge
  const loadIncidentCount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/dlp/incidents?status=open&limit=1`);
      if (response.ok) {
        const data = await response.json();
        setIncidentCount(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to load incidents:', error);
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

  // Process chat message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue.trim();
    addMessage('YOU', userMessage);
    setInputValue('');
    setIsTyping(true);

    try {
      const lowerMessage = userMessage.toLowerCase();

      // Handle various commands
      if (lowerMessage.includes('scan') && (lowerMessage.includes('content') || lowerMessage.includes('text'))) {
        setActiveTab('scan');
        addMessage('AGENT', "I've opened the Content Scanner tab. You can paste text content there to scan for sensitive data like:\n\n• Credit card numbers\n• Social Security Numbers\n• API keys and secrets\n• Personal health information\n• Email addresses and phone numbers\n\nWould you like me to explain how the scanning works?");
      }
      else if (lowerMessage.includes('policy') || lowerMessage.includes('policies')) {
        setActiveTab('policies');
        const response = await fetch(`${API_URL}/api/v1/dlp/policies`);
        if (response.ok) {
          const data = await response.json();
          addMessage('AGENT', `📋 You have ${data.pagination?.total || 0} DLP policies configured. I've opened the Policy Manager where you can:\n\n• Create new policies for data protection\n• Enable/disable existing policies\n• Configure detection patterns\n• Set up automated responses\n\nWould you like help creating a new policy?`);
        } else {
          addMessage('AGENT', "I've opened the Policy Manager tab. Here you can create and manage your data protection policies.");
        }
      }
      else if (lowerMessage.includes('incident') || lowerMessage.includes('alert') || lowerMessage.includes('violation')) {
        setActiveTab('incidents');
        const response = await fetch(`${API_URL}/api/v1/dlp/incidents?limit=5`);
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            const incidents = data.data.map((i: any) => `• ${i.incidentId || i.id} - ${i.severity} - ${i.status}`).join('\n');
            addMessage('AGENT', `🚨 Found ${data.pagination?.total || data.data.length} incidents. Recent ones:\n\n${incidents}\n\nI've opened the Incidents panel for investigation. Click on any incident for details.`);
          } else {
            addMessage('AGENT', "✅ Great news! No active incidents found. Your data is currently secure. I've opened the Incidents panel for monitoring.");
          }
        }
      }
      else if (lowerMessage.includes('cloud') || lowerMessage.includes('integration') || lowerMessage.includes('connect')) {
        setActiveTab('integrations');
        addMessage('AGENT', "I've opened the Integrations panel. Here you can connect to:\n\n☁️ **Cloud Services**\n• Microsoft 365 (OneDrive, SharePoint, Teams)\n• Google Workspace (Drive, Gmail)\n• Dropbox, Box, Slack\n\n🔒 **Security Platforms**\n• SIEM systems (Splunk, Sentinel)\n• Endpoint protection (CrowdStrike, Defender)\n• Email security gateways\n\nWhich service would you like to configure?");
      }
      else if (lowerMessage.includes('endpoint') || lowerMessage.includes('device') || lowerMessage.includes('agent')) {
        setActiveTab('endpoints');
        addMessage('AGENT', "I've opened the Endpoint Monitor. Here you can:\n\n• View all registered DLP agents\n• Monitor endpoint activity\n• Configure USB/clipboard/print blocking\n• Deploy agents to new endpoints\n\nNeed help deploying agents or configuring endpoint policies?");
      }
      else if (lowerMessage.includes('report') || lowerMessage.includes('compliance')) {
        setActiveTab('reports');
        addMessage('AGENT', "I've opened the Reports panel. Available reports include:\n\n📊 **Executive Summary** - High-level DLP metrics\n📋 **Compliance Report** - GDPR, HIPAA, PCI-DSS status\n🔍 **Incident Report** - Detailed violation analysis\n📈 **Trend Analysis** - Data exposure trends\n\nWhich report would you like to generate?");
      }
      else if (lowerMessage.includes('status') || lowerMessage.includes('health') || lowerMessage.includes('overview')) {
        setActiveTab('dashboard');
        await loadDashboardStats();
        addMessage('AGENT', `📊 **DLP System Status**\n\n• Total Scans: ${stats.totalScans.toLocaleString()}\n• Active Incidents: ${stats.activeIncidents}\n• Policies Enabled: ${stats.policiesEnabled}\n• Data Types Protected: ${stats.dataTypesProtected}\n• Endpoints Monitored: ${stats.endpointsMonitored}\n• Cloud Apps: ${stats.cloudAppsConnected}\n• Risk Score: ${stats.riskScore}/100\n\nThe dashboard is now showing the latest data.`);
      }
      else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
        addMessage('AGENT', "🛡️ **DLP Assistant Capabilities**\n\n**Scanning**\n• Say 'scan content' to analyze text for sensitive data\n• Upload files for deep content inspection\n• Scan cloud storage for policy violations\n\n**Policy Management**\n• Create custom detection rules\n• Configure automated responses (block, alert, encrypt)\n• Apply policies to specific data types\n\n**Incident Response**\n• View and investigate violations\n• Remediate incidents\n• Generate forensic reports\n\n**Monitoring**\n• Real-time endpoint monitoring\n• Cloud app activity tracking\n• Data flow visualization\n\nWhat would you like to do?");
      }
      else {
        // Default response - try to be helpful
        addMessage('AGENT', `I understand you're asking about "${userMessage}". Let me help you with that.\n\nI can assist with:\n• **scan** - Analyze content for sensitive data\n• **policies** - Manage protection rules\n• **incidents** - View and investigate violations\n• **integrations** - Connect cloud services\n• **endpoints** - Monitor devices\n• **reports** - Generate compliance reports\n\nCould you tell me more about what you need?`);
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage('AGENT', "I encountered an issue processing your request. The DLP API may be offline. Please ensure the backend is running on port 4041.");
    } finally {
      setIsTyping(false);
    }
  };

  // Handle content scan
  const handleContentScan = async (content: string): Promise<ScanResult> => {
    setIsLoading(true);
    try {
      const result = await dlpAPI.scan.content(content);
      if (result.findings && result.findings.length > 0) {
        addMessage('AGENT', `🔍 Content scan complete:\n\n• Risk Level: ${result.riskLevel}\n• Findings: ${result.findings.length}\n• Status: ${result.status}\n\nSensitive data types detected: ${result.findings.map(f => f.type).join(', ')}`);
      }
      return result;
    } catch (error) {
      // Return mock result for demo
      return {
        id: Date.now().toString(),
        scanId: `scan-${Date.now()}`,
        source: 'content',
        riskScore: 0,
        riskLevel: 'low',
        findings: [],
        timestamp: new Date().toISOString(),
        status: 'clean'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Render main content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DLPDashboard />;
      case 'scan':
        return <ContentScanner onScan={handleContentScan} isLoading={isLoading} />;
      case 'policies':
        return <PolicyManager />;
      case 'incidents':
        return <IncidentPanel />;
      case 'integrations':
        return <IntegrationsPanel />;
      case 'endpoints':
        return <EndpointMonitor />;
      case 'reports':
        return <ReportsPanel />;
      default:
        return <DLPDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-900 border-r border-purple-500/20 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-purple-500/20 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                DataLossPrevention
              </h1>
              <p className="text-xs text-slate-500">Enterprise DLP</p>
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
                  ? 'bg-purple-500/20 text-purple-400 border-r-2 border-purple-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
              {item.badge && item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Quick Stats */}
        {sidebarOpen && (
          <div className="p-4 border-t border-purple-500/20 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Active Incidents</span>
              <span className="text-red-400">{stats.activeIncidents}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Policies Active</span>
              <span className="text-green-400">{stats.policiesEnabled}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Risk Score</span>
              <span className={stats.riskScore > 70 ? 'text-red-400' : stats.riskScore > 40 ? 'text-yellow-400' : 'text-green-400'}>
                {stats.riskScore}/100
              </span>
            </div>
          </div>
        )}

        {/* Toggle sidebar button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 border-t border-purple-500/20 text-slate-400 hover:text-white flex items-center justify-center"
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-slate-900 border-b border-purple-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold capitalize">
              {activeTab === 'scan' ? 'Content Scanner' : activeTab.replace(/-/g, ' ')}
            </h2>
            <button 
              onClick={loadDashboardStats}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
              <Bell className="w-5 h-5" />
              {incidentCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            
            {/* Settings */}
            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
              <Settings className="w-5 h-5" />
            </button>

            {/* Toggle Chat */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-2 rounded-lg transition-colors ${chatOpen ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Panel */}
          <div className={`flex-1 overflow-auto p-6 ${chatOpen && !chatMinimized ? 'pr-0' : ''}`}>
            {renderContent()}
          </div>

          {/* AI Chat Panel */}
          {chatOpen && (
            <div className={`${chatMinimized ? 'w-80' : 'w-96'} bg-slate-900 border-l border-purple-500/20 flex flex-col transition-all duration-300`}>
              {/* Chat Header */}
              <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">DLP Assistant</h3>
                    <p className="text-xs text-slate-500">Powered by AI</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setChatMinimized(!chatMinimized)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  >
                    {chatMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setChatOpen(false)}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!chatMinimized && (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.sender === 'YOU' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          message.sender === 'YOU' 
                            ? 'bg-blue-500' 
                            : 'bg-gradient-to-br from-purple-500 to-pink-600'
                        }`}>
                          {message.sender === 'YOU' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`max-w-[85%] rounded-lg p-3 ${
                          message.sender === 'YOU'
                            ? 'bg-blue-500/20 text-blue-100'
                            : 'bg-slate-800 text-slate-200'
                        }`}>
                          <pre className="whitespace-pre-wrap text-sm font-sans">{message.text}</pre>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-purple-500/20">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask about DLP..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping}
                        className="p-2 bg-purple-500 hover:bg-purple-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => setInputValue('scan content')}
                        className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-400"
                      >
                        Scan Content
                      </button>
                      <button 
                        onClick={() => setInputValue('show incidents')}
                        className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-400"
                      >
                        Incidents
                      </button>
                      <button 
                        onClick={() => setInputValue('status')}
                        className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-400"
                      >
                        Status
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
