import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, MessageSquare, ChevronLeft, ChevronRight, 
  Search, Settings, Bell, Send, Sparkles, User, Bot, Scale,
  LayoutDashboard, FileText, ShieldCheck, AlertTriangle, GitBranch
} from 'lucide-react';

// Components
import PolicyDashboard from './components/PolicyDashboard';
import PolicyEditor from './components/PolicyEditor';
import ComplianceMapping from './components/ComplianceMapping';
import PolicyViolations from './components/PolicyViolations';
import PolicyWorkflows from './components/PolicyWorkflows';

// Types
interface Policy {
  id: string;
  name: string;
  category: string;
  status: 'draft' | 'pending_approval' | 'active' | 'archived';
  complianceStatus: 'compliant' | 'non_compliant' | 'partial';
  framework: string;
  lastUpdated: Date;
  owner: string;
  controls: string[];
}

interface Violation {
  id: string;
  policyId: string;
  policyName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'remediated' | 'exempted';
  description: string;
  detectedAt: Date;
  resource: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

type Tab = 'dashboard' | 'policies' | 'compliance' | 'violations' | 'workflows';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'policies', label: 'Policy Editor', icon: FileText },
  { id: 'compliance', label: 'Compliance Mapping', icon: ShieldCheck },
  { id: 'violations', label: 'Violations', icon: AlertTriangle },
  { id: 'workflows', label: 'Approval Workflows', icon: GitBranch },
];

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // Data state
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: '1',
      name: 'Access Control Policy',
      category: 'access_control',
      status: 'active',
      complianceStatus: 'compliant',
      framework: 'NIST 800-53',
      lastUpdated: new Date(),
      owner: 'Security Team',
      controls: ['AC-1', 'AC-2', 'AC-3']
    },
    {
      id: '2',
      name: 'Data Protection Policy',
      category: 'data_protection',
      status: 'active',
      complianceStatus: 'partial',
      framework: 'GDPR',
      lastUpdated: new Date(),
      owner: 'Privacy Team',
      controls: ['Article 5', 'Article 6', 'Article 7']
    },
    {
      id: '3',
      name: 'Incident Response Policy',
      category: 'incident_response',
      status: 'pending_approval',
      complianceStatus: 'compliant',
      framework: 'ISO 27001',
      lastUpdated: new Date(),
      owner: 'SOC Team',
      controls: ['A.16.1', 'A.16.2']
    }
  ]);

  const [violations, setViolations] = useState<Violation[]>([
    {
      id: '1',
      policyId: '2',
      policyName: 'Data Protection Policy',
      severity: 'high',
      status: 'open',
      description: 'Unencrypted PII data found in storage bucket',
      detectedAt: new Date(),
      resource: 'storage-bucket-prod-01'
    },
    {
      id: '2',
      policyId: '1',
      policyName: 'Access Control Policy',
      severity: 'medium',
      status: 'acknowledged',
      description: 'Service account with excessive permissions',
      detectedAt: new Date(Date.now() - 86400000),
      resource: 'sa-analytics@project.iam'
    }
  ]);

  const [stats, setStats] = useState({
    totalPolicies: 3,
    activePolicies: 2,
    complianceScore: 78,
    openViolations: 2,
    pendingApprovals: 1,
    frameworksCovered: 3
  });

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to PolicyEngine! I'm your AI-powered security policy management assistant. I can help you create policies based on NIST, ISO 27001, CIS frameworks, detect compliance violations, and manage approval workflows. What would you like to work on?",
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

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        'create': "I can help you create a new security policy. Please specify:\n\n1. Policy name\n2. Category (access_control, data_protection, network_security, etc.)\n3. Compliance framework (NIST, ISO 27001, CIS, GDPR)\n4. Scope (organization, department, system)\n\nOr I can generate a template for you based on best practices.",
        'compliance': "I'll analyze your current policies against compliance frameworks. Your organization shows:\n\n• NIST 800-53: 85% coverage\n• ISO 27001: 78% coverage\n• GDPR: 72% coverage\n\nWould you like me to identify gaps and suggest remediation steps?",
        'violation': "I found 2 open policy violations requiring attention:\n\n1. **HIGH** - Unencrypted PII in storage (Data Protection Policy)\n2. **MEDIUM** - Excessive service account permissions (Access Control Policy)\n\nWould you like me to suggest remediation actions or create exception requests?",
        'default': "I can help you with:\n\n• **Create Policy** - Generate policies from templates or custom requirements\n• **Compliance Mapping** - Map policies to NIST, ISO, CIS, GDPR frameworks\n• **Violation Analysis** - Detect and remediate policy violations\n• **Approval Workflows** - Manage policy review and approval processes\n\nWhat would you like to explore?"
      };

      const input = inputValue.toLowerCase();
      let response = responses['default'];
      if (input.includes('create') || input.includes('new policy')) response = responses['create'];
      else if (input.includes('compliance') || input.includes('framework')) response = responses['compliance'];
      else if (input.includes('violation') || input.includes('alert')) response = responses['violation'];

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
        return <PolicyDashboard policies={policies} stats={stats} violations={violations} />;
      case 'policies':
        return <PolicyEditor policies={policies} />;
      case 'compliance':
        return <ComplianceMapping policies={policies} />;
      case 'violations':
        return <PolicyViolations violations={violations} />;
      case 'workflows':
        return <PolicyWorkflows policies={policies} />;
      default:
        return <PolicyDashboard policies={policies} stats={stats} violations={violations} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">PolicyEngine</h1>
                <p className="text-xs text-gray-400">Security Policy Management</p>
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
                  ? 'bg-violet-600 text-white' 
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
              <span className="text-gray-400">Compliance Score</span>
              <span className={`font-semibold ${stats.complianceScore >= 80 ? 'text-green-400' : stats.complianceScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {stats.complianceScore}%
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${stats.complianceScore >= 80 ? 'bg-green-500' : stats.complianceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${stats.complianceScore}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{stats.activePolicies} Active Policies</span>
              <span>{stats.openViolations} Violations</span>
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
                placeholder="Search policies, frameworks..."
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-violet-500 w-80"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-700 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-400" />
              {stats.openViolations > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  {stats.openViolations}
                </span>
              )}
            </button>
            <button 
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-2 rounded-lg transition-colors ${chatOpen ? 'bg-violet-600' : 'hover:bg-gray-700'}`}
            >
              <MessageSquare className="w-5 h-5" />
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
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Policy AI Assistant</h3>
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
                      message.role === 'user' ? 'bg-violet-600' : 'bg-gray-700'
                    }`}>
                      {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user' ? 'bg-violet-600' : 'bg-gray-700'}`}>
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
                    placeholder="Ask about policies, compliance..."
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-violet-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="p-2 bg-violet-600 hover:bg-violet-700 rounded-lg disabled:opacity-50"
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

export default App;
