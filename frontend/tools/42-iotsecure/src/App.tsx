import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Menu, ChevronLeft, Bell, Settings as SettingsIcon,
  Send, Bot, User, Sparkles, Wifi, AlertTriangle,
  RefreshCw, Activity, Lock, Globe, Cpu, Database, Eye
} from 'lucide-react';

// IoT Security Components
import { 
  DeviceInventory, 
  IoTAlertsPanel, 
  VulnerabilityPanel, 
  DashboardCard,
  NetworkTopology,
  ScanManager
} from './components';

// Types and constants
import { DashboardOverview } from './types';
import { NAV_ITEMS } from './constants';

// Services
import { iotSecureAPI } from './services/iotSecureAPI';

// Tab type for navigation
type Tab = 'dashboard' | 'devices' | 'vulnerabilities' | 'alerts' | 'topology' | 'scans';

// Chat message interface (local type for chat UI)
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const App: React.FC = () => {
  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // Data state
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<number>(0);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to IoTSecure! 🛡️ I'm your AI-powered IoT security assistant. I can help you:\n\n• 📡 Discover and inventory IoT devices\n• 🔓 Scan for vulnerabilities\n• 🌐 Visualize network topology\n• 🚨 Manage security alerts\n• 📊 Analyze device behavior\n\nHow can I help secure your IoT environment today?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Fetch dashboard overview for sidebar stats
      const overviewRes = await iotSecureAPI.dashboard.getOverview();
      if (overviewRes.data) {
        setOverview(overviewRes.data);
        setNotifications(overviewRes.data.alerts?.byStatus?.new || 0);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      // Demo data structure matching DashboardOverview type
      setOverview({
        riskScore: 72,
        devices: {
          total: 47,
          byStatus: { online: 42, offline: 5, degraded: 0, maintenance: 0, quarantined: 0, decommissioned: 0 },
          byType: { camera: 12, sensor: 18, controller: 8, gateway: 4, thermostat: 3, router: 2, unknown: 0, switch: 0, access_point: 0, smart_lock: 0, smart_plug: 0, hvac: 0, lighting: 0, medical_device: 0, industrial_plc: 0, scada: 0, building_automation: 0, environmental_sensor: 0, wearable: 0, vehicle: 0, smart_meter: 0, security_system: 0, voice_assistant: 0 },
          byRiskLevel: { low: 20, medium: 15, high: 8, critical: 4 },
          byCriticality: { low: 10, medium: 20, high: 12, critical: 5 }
        },
        vulnerabilities: {
          total: 26,
          bySeverity: { critical: 3, high: 8, medium: 10, low: 5, info: 0 },
          byStatus: { open: 18, in_progress: 5, mitigated: 3, resolved: 0, accepted: 0, false_positive: 0 },
          exploitable: 5
        },
        alerts: {
          total: 5,
          bySeverity: { critical: 1, high: 2, medium: 2, low: 0, info: 0 },
          byStatus: { new: 3, acknowledged: 2, investigating: 0, resolved: 0, false_positive: 0, escalated: 0 },
          byType: {} as Record<string, number>
        },
        scans: {
          total: 10,
          byStatus: { pending: 0, running: 1, completed: 8, failed: 1, cancelled: 0, scheduled: 0 },
          byType: { discovery: 4, vulnerability: 3, firmware: 2, compliance: 1, full: 0, quick: 0 },
          averageDuration: 300
        },
        segments: {
          total: 4,
          byType: {} as Record<string, number>,
          bySecurityLevel: {} as Record<string, number>,
          active: 4
        },
        firmware: {
          total: 47,
          analyzed: 40,
          vulnerable: 8,
          outdated: 12,
          malicious: 0
        },
        lastUpdated: new Date().toISOString()
      });
      setNotifications(3);
    } finally {
      setIsLoading(false);
    }
  };

  // Process user query with AI
  const processUserQuery = async (query: string): Promise<string> => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('discover') || lowerQuery.includes('find devices') || lowerQuery.includes('scan network')) {
      return "🔍 **Starting Device Discovery Scan**\n\nI'm initiating a network scan to discover IoT devices. This will:\n\n1. Scan all network segments\n2. Identify device types and manufacturers\n3. Check for open ports\n4. Fingerprint firmware versions\n\nTrack progress in the **Scan Manager** tab.";
    }
    
    if (lowerQuery.includes('device') && (lowerQuery.includes('list') || lowerQuery.includes('show') || lowerQuery.includes('inventory'))) {
      const deviceCount = overview?.devices?.total || 0;
      return `📡 **Device Inventory Summary**\n\nTotal Devices: ${deviceCount}\n• Online: ${overview?.devices?.byStatus?.online || 0}\n• Offline: ${overview?.devices?.byStatus?.offline || 0}\n\nNavigate to the **Devices** tab for detailed inventory.`;
    }
    
    if (lowerQuery.includes('vulnerab') || lowerQuery.includes('cve') || lowerQuery.includes('security issue')) {
      return `🔓 **Vulnerability Overview**\n\n• Critical: ${overview?.vulnerabilities?.bySeverity?.critical || 0}\n• High: ${overview?.vulnerabilities?.bySeverity?.high || 0}\n• Medium: ${overview?.vulnerabilities?.bySeverity?.medium || 0}\n\nCheck the **Vulnerabilities** tab for details and remediation steps.`;
    }
    
    if (lowerQuery.includes('alert') || lowerQuery.includes('warning') || lowerQuery.includes('notification')) {
      const alertCount = overview?.alerts?.total || 0;
      return `🚨 **Active Alerts: ${alertCount}**\n\nCheck the **Alerts** tab to view and manage security alerts for your IoT devices.`;
    }
    
    if (lowerQuery.includes('network') || lowerQuery.includes('topology') || lowerQuery.includes('map')) {
      return "🌐 **Network Topology**\n\nNavigate to the **Topology** tab to visualize your IoT network structure, device connections, and communication patterns.";
    }
    
    if (lowerQuery.includes('security score') || lowerQuery.includes('score') || lowerQuery.includes('rating')) {
      const score = overview?.riskScore || 0;
      const status = score >= 80 ? 'Good' : score >= 60 ? 'Fair' : 'Needs Improvement';
      return `📊 **Security Score: ${score}/100** (${status})\n\nFactors affecting your score:\n• Unpatched vulnerabilities\n• Default credentials\n• Outdated firmware\n• Network segmentation\n\nView detailed recommendations in the Dashboard.`;
    }
    
    if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
      return "🛡️ **IoTSecure AI Assistant**\n\nI can help you with:\n\n• 📡 **Device Discovery** - Find all IoT devices on your network\n• 🔓 **Vulnerability Scanning** - Identify security weaknesses\n• 🌐 **Network Topology** - Visualize device connections\n• 🚨 **Alert Management** - Monitor and respond to threats\n• 📊 **Security Analysis** - Get actionable insights\n• 🔧 **Firmware Analysis** - Check for outdated firmware\n\nJust ask me anything about your IoT security!";
    }
    
    return "I'm here to help secure your IoT environment! I can discover devices, scan for vulnerabilities, visualize your network, and manage security alerts. What would you like to do?";
  };

  // Handle chat message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await processUserQuery(inputValue);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle scan start
  const handleStartScan = async (type: string) => {
    setIsLoading(true);
    try {
      // Use startDiscovery or startVulnerability based on type
      if (type === 'discovery') {
        await iotSecureAPI.scans.startDiscovery(['*']);
      } else {
        await iotSecureAPI.scans.startVulnerability(['*']);
      }
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to start scan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Main Dashboard Card - fetches its own data */}
            <DashboardCard onNavigate={(section) => setActiveTab(section as Tab)} />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleStartScan('discovery')}
                disabled={isLoading}
                className="p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl hover:border-cyan-400/50 transition-all flex items-center gap-3"
              >
                <Wifi className="w-6 h-6 text-cyan-400" />
                <div className="text-left">
                  <div className="font-bold">Device Discovery</div>
                  <div className="text-sm text-gray-400">Scan for new devices</div>
                </div>
              </button>
              
              <button
                onClick={() => handleStartScan('vulnerability')}
                disabled={isLoading}
                className="p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl hover:border-red-400/50 transition-all flex items-center gap-3"
              >
                <Lock className="w-6 h-6 text-red-400" />
                <div className="text-left">
                  <div className="font-bold">Vulnerability Scan</div>
                  <div className="text-sm text-gray-400">Check for security issues</div>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('topology')}
                className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl hover:border-purple-400/50 transition-all flex items-center gap-3"
              >
                <Globe className="w-6 h-6 text-purple-400" />
                <div className="text-left">
                  <div className="font-bold">Network Map</div>
                  <div className="text-sm text-gray-400">View topology</div>
                </div>
              </button>
            </div>
          </div>
        );

      case 'devices':
        return (
          <DeviceInventory 
            onDeviceSelect={(device) => console.log('Selected device:', device)}
            onScanRequest={() => handleStartScan('discovery')}
          />
        );

      case 'vulnerabilities':
        return (
          <VulnerabilityPanel 
            onVulnSelect={(vuln) => console.log('Selected vulnerability:', vuln)}
          />
        );

      case 'alerts':
        return (
          <IoTAlertsPanel 
            maxItems={20}
            onAlertClick={(alert) => console.log('Clicked alert:', alert)}
          />
        );

      case 'topology':
        return (
          <NetworkTopology 
            onNodeSelect={(node) => console.log('Selected node:', node)}
          />
        );

      case 'scans':
        return (
          <ScanManager 
            onScanComplete={(scan) => console.log('Scan complete:', scan)}
          />
        );

      default:
        return null;
    }
  };

  // Get icon for nav item
  const getNavIcon = (id: string) => {
    const icons: Record<string, any> = {
      'dashboard': Activity,
      'devices': Cpu,
      'vulnerabilities': Lock,
      'alerts': AlertTriangle,
      'topology': Globe,
      'scans': Wifi,
      'firmware': Database,
      'baselines': Eye,
      'settings': SettingsIcon
    };
    return icons[id] || Activity;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/80 backdrop-blur-lg border-b border-cyan-500/30">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">IoTSecure</h1>
                <p className="text-xs text-cyan-400">IoT Security Platform</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Refresh */}
            <button 
              onClick={fetchDashboardData}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            {/* Settings */}
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <SettingsIcon className="w-5 h-5" />
            </button>

            {/* Toggle Chat */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-2 rounded-lg transition-colors ${
                chatOpen ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside 
          className={`fixed left-0 top-16 bottom-0 bg-slate-900/50 backdrop-blur border-r border-cyan-500/20 transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          <nav className="p-4 space-y-2">
            {NAV_ITEMS.slice(0, 6).map((item) => {
              // Map nav items to our tab types
              const tabMap: Record<string, Tab> = {
                'device_inventory': 'devices',
                'vulnerability_scan': 'vulnerabilities',
                'network_topology': 'topology',
                'alerts': 'alerts',
                'firmware_analysis': 'scans',
                'baselines': 'dashboard'
              };
              const tabId = tabMap[item.tool] || 'dashboard';
              const Icon = getNavIcon(item.tool);

              return (
                <button
                  key={item.tool}
                  onClick={() => setActiveTab(tabId)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    activeTab === tabId
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-white'
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
          {sidebarOpen && overview && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/30">
                <h4 className="text-sm font-bold text-white mb-3">Quick Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Devices</span>
                    <span className="text-white font-bold">{overview.devices?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Online</span>
                    <span className="text-green-400 font-bold">{overview.devices?.byStatus?.online || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Alerts</span>
                    <span className="text-yellow-400 font-bold">{overview.alerts?.total || 0}</span>
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
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {activeTab === 'dashboard' ? 'Dashboard' :
                 activeTab === 'devices' ? 'Device Inventory' :
                 activeTab === 'vulnerabilities' ? 'Vulnerability Scan' :
                 activeTab === 'alerts' ? 'Security Alerts' :
                 activeTab === 'topology' ? 'Network Topology' :
                 activeTab === 'scans' ? 'Scan Manager' : 'Dashboard'}
              </h2>
              <p className="text-gray-400 mt-1">
                {activeTab === 'dashboard' && 'Overview of your IoT security posture'}
                {activeTab === 'devices' && 'Manage and monitor IoT devices'}
                {activeTab === 'vulnerabilities' && 'View and remediate security vulnerabilities'}
                {activeTab === 'alerts' && 'Monitor and respond to security alerts'}
                {activeTab === 'topology' && 'Visualize network connections'}
                {activeTab === 'scans' && 'Run and manage security scans'}
              </p>
            </div>

            {/* Tab Content */}
            {renderTabContent()}
          </div>
        </main>

        {/* Chat Panel */}
        {chatOpen && (
          <aside className="fixed right-0 top-16 bottom-0 w-96 bg-slate-900/50 backdrop-blur border-l border-cyan-500/20 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">IoT Security AI</h3>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    Online
                  </p>
                </div>
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
                      : 'bg-gradient-to-br from-cyan-500 to-blue-600'
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
                      : 'bg-slate-800/50 border border-cyan-500/30'
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
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-800/50 border border-cyan-500/30 p-3 rounded-xl">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-cyan-500/20">
              <div className="flex items-center gap-2 bg-slate-800/50 border border-cyan-500/30 rounded-xl p-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about IoT security..."
                  className="flex-1 bg-transparent outline-none text-sm px-2"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-[10px] text-gray-500 text-center mt-2">
                Powered by IoTSecure AI
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default App;
