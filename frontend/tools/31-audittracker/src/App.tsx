import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Menu, X, MessageSquare, ChevronLeft, ChevronRight, 
  Search, Settings, Bell, Send, Sparkles, User, Bot,
  LayoutDashboard, FileSearch, Clock, Filter, Activity, BookOpen,
  Download, Calendar, Shield, Eye, AlertTriangle, CheckCircle
} from 'lucide-react';

// Pages
import LandingPage from './pages/LandingPage';
import NeuralLinkInterface from './components/NeuralLinkInterface';

// Components
import AuditDashboard from './components/AuditDashboard';
import AuditLogs from './components/AuditLogs';
import AuditTimeline from './components/AuditTimeline';
import ComplianceReports from './components/ComplianceReports';
import AuditSettings from './components/AuditSettings';

// Types
interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  category: 'authentication' | 'authorization' | 'data_access' | 'configuration' | 'security' | 'system';
  severity: 'info' | 'warning' | 'error' | 'critical';
  user: string;
  resource: string;
  ip: string;
  details: string;
  outcome: 'success' | 'failure';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type Tab = 'dashboard' | 'logs' | 'timeline' | 'reports' | 'settings';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'logs', label: 'Audit Logs', icon: FileSearch },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'reports', label: 'Compliance Reports', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const AuditTrackerExperience: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // Sample data
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: '1',
      timestamp: new Date(),
      action: 'User Login',
      category: 'authentication',
      severity: 'info',
      user: 'admin@company.com',
      resource: '/auth/login',
      ip: '192.168.1.100',
      details: 'Successful authentication via SSO',
      outcome: 'success'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000),
      action: 'Permission Denied',
      category: 'authorization',
      severity: 'warning',
      user: 'user@company.com',
      resource: '/api/admin/users',
      ip: '192.168.1.105',
      details: 'Attempted access to admin endpoint without privileges',
      outcome: 'failure'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000),
      action: 'Database Query',
      category: 'data_access',
      severity: 'info',
      user: 'api-service',
      resource: 'users_table',
      ip: '10.0.0.50',
      details: 'SELECT query on users table (1000 rows)',
      outcome: 'success'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 900000),
      action: 'Failed Login Attempt',
      category: 'authentication',
      severity: 'error',
      user: 'unknown',
      resource: '/auth/login',
      ip: '203.0.113.50',
      details: 'Multiple failed login attempts detected',
      outcome: 'failure'
    }
  ]);

  const [stats, setStats] = useState({
    totalEvents: 15847,
    todayEvents: 342,
    warningEvents: 23,
    criticalEvents: 5,
    complianceScore: 94,
    retentionDays: 365
  });

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to AuditTracker! I'm your AI-powered audit log analyst. I can help you search through audit logs, identify suspicious patterns, generate compliance reports, and investigate security incidents. What would you like to analyze?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const responses: Record<string, string> = {
        'search': "I'll search the audit logs for you. I found:\n\n• **342 events today**\n• **23 warnings** requiring attention\n• **5 critical alerts** from failed auth attempts\n\nWould you like me to drill down into any specific category?",
        'suspicious': "I've analyzed the logs and detected suspicious patterns:\n\n1. **Brute Force Attempt** - 15 failed logins from IP 203.0.113.50\n2. **Unusual Access** - Admin API accessed outside business hours\n3. **Data Export** - Large data query from new user account\n\nShould I generate an incident report?",
        'compliance': "Based on current audit data, your compliance status:\n\n• **SOC 2:** 96% compliant\n• **HIPAA:** 94% compliant\n• **GDPR:** 92% compliant\n\nGaps identified in data retention policies. Would you like a detailed report?",
        'default': "I can help you with:\n\n• **Search Logs** - Find specific events by user, action, or time\n• **Detect Anomalies** - Identify suspicious patterns\n• **Compliance Reports** - Generate audit documentation\n• **Investigate Incidents** - Trace security events\n\nWhat would you like to explore?"
      };

      const input = inputValue.toLowerCase();
      let response = responses['default'];
      if (input.includes('search') || input.includes('find')) response = responses['search'];
      else if (input.includes('suspicious') || input.includes('anomal') || input.includes('threat')) response = responses['suspicious'];
      else if (input.includes('compliance') || input.includes('report') || input.includes('soc')) response = responses['compliance'];

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AuditDashboard logs={logs} stats={stats} />;
      case 'logs':
        return <AuditLogs logs={logs} />;
      case 'timeline':
        return <AuditTimeline logs={logs} />;
      case 'reports':
        return <ComplianceReports />;
      case 'settings':
        return <AuditSettings />;
      default:
        return <AuditDashboard logs={logs} stats={stats} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <FileSearch className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">AuditTracker</h1>
                <p className="text-xs text-gray-400">Security Audit Logs</p>
              </div>
            )}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-gray-700 rounded">
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === item.id 
                  ? 'bg-teal-600 text-white' 
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-gray-700 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Today's Events</span>
              <span className="font-semibold text-teal-400">{stats.todayEvents}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Warnings</span>
              <span className="font-semibold text-yellow-400">{stats.warningEvents}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Critical</span>
              <span className="font-semibold text-red-400">{stats.criticalEvents}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text"
                placeholder="Search audit logs..."
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-teal-500 w-80"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-700 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-400" />
              {stats.criticalEvents > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  {stats.criticalEvents}
                </span>
              )}
            </button>
            <button 
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-2 rounded-lg transition-colors ${chatOpen ? 'bg-teal-600' : 'hover:bg-gray-700'}`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/maula/ai')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-lg font-medium transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Assistant</span>
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto p-6">
            {renderContent()}
          </div>

          {chatOpen && (
            <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Audit AI Assistant</h3>
                    <p className="text-xs text-gray-400">Powered by Neural Link</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-gray-700 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' ? 'bg-teal-600' : 'bg-gray-700'
                    }`}>
                      {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user' ? 'bg-teal-600' : 'bg-gray-700'}`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about audit logs..."
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="p-2 bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/maula" element={<AuditTrackerExperience />} />
      <Route path="/maula/ai" element={<NeuralLinkInterface />} />
    </Routes>
  );
}

export default App;
