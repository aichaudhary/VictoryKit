import React, { useState, useEffect, useRef } from 'react';
import NeuralLinkInterface from '../../../neural-link-interface/App';
import { Routes, Route, Navigate } from 'react-router-dom';
import { 
  Shield, Menu, X, MessageSquare, ChevronLeft, ChevronRight, 
  Search, Settings, Bell, LayoutDashboard, FileText, Server,
  Building2, BookOpen, FlaskConical, Users, AlertTriangle,
  BarChart3, Send, Sparkles, Bot, User
} from 'lucide-react';

// Components
import Dashboard from './components/Dashboard';
import PlansList from './components/PlansList';
import SystemsManager from './components/SystemsManager';
import SitesManager from './components/SitesManager';
import RunbooksManager from './components/RunbooksManager';
import TestsManager from './components/TestsManager';
import IncidentsPanel from './components/IncidentsPanel';

// Types and constants
import { 
  Tab, Message, SettingsState, DashboardStats,
  RecoveryPlan, CriticalSystem, RecoverySite, 
  Runbook, DRTest, EmergencyContact, DRIncident
} from './types';
import { NAV_ITEMS, DEFAULT_SETTINGS } from './constants';

// Services
import { drplanAPI } from './services/drplanAPI';

const iconMap: Record<string, React.FC<any>> = {
  LayoutDashboard, FileText, Server, Building2, BookOpen,
  FlaskConical, Users, AlertTriangle, BarChart3, Settings,
};

const DRPlanExperience: React.FC = () => {
  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  
  // Data state
  const [stats, setStats] = useState<DashboardStats>({
    totalPlans: 5, activePlans: 3, totalSystems: 24, criticalSystems: 8,
    systemsAtRisk: 2, upcomingTests: 3, overdueTests: 1, activeIncidents: 0,
    avgRTO: 120, avgRPO: 30, overallReadiness: 87,
  });
  const [plans, setPlans] = useState<RecoveryPlan[]>([]);
  const [systems, setSystems] = useState<CriticalSystem[]>([]);
  const [sites, setSites] = useState<RecoverySite[]>([]);
  const [runbooks, setRunbooks] = useState<Runbook[]>([]);
  const [tests, setTests] = useState<DRTest[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [incidents, setIncidents] = useState<DRIncident[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to DRPlan! I'm your Disaster Recovery AI assistant. I can help you manage recovery plans, monitor systems, schedule DR tests, and respond to incidents. What would you like to do?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load mock data
  useEffect(() => {
    // Mock plans
    setPlans([
      {
        _id: '1', name: 'Enterprise DR Plan', description: 'Main disaster recovery plan for all critical systems',
        version: '2.1', status: 'active', priority: 'critical', scope: ['production', 'staging'],
        objectives: { rto: 60, rpo: 15, mtpd: 480 }, owner: 'John Smith',
        approvers: ['CTO', 'CISO'], systems: ['sys1', 'sys2', 'sys3'], sites: ['site1', 'site2'],
        runbooks: ['rb1', 'rb2'], lastTestedAt: new Date('2024-12-15'), nextTestDate: new Date('2025-03-15'),
        createdAt: new Date('2024-01-10'), updatedAt: new Date('2024-12-20'),
      },
      {
        _id: '2', name: 'Database Recovery Plan', description: 'Recovery procedures for database infrastructure',
        version: '1.3', status: 'active', priority: 'high', scope: ['databases'],
        objectives: { rto: 30, rpo: 5, mtpd: 240 }, owner: 'Jane Doe',
        approvers: ['DBA Lead'], systems: ['db1', 'db2'], sites: ['site1'],
        runbooks: ['rb3'], createdAt: new Date('2024-03-15'), updatedAt: new Date('2024-11-10'),
      },
    ]);

    // Mock systems
    setSystems([
      {
        _id: 'sys1', name: 'Production API Gateway', description: 'Main API gateway for all services',
        tier: 1, category: 'infrastructure', status: 'operational', rto: 15, rpo: 5,
        dependencies: ['sys2', 'sys3'], owner: 'Platform Team', primarySite: 'site1',
        recoverySite: 'site2', recoveryProcedure: 'rb1', healthScore: 98, createdAt: new Date(),
      },
      {
        _id: 'sys2', name: 'Primary Database Cluster', description: 'PostgreSQL primary cluster',
        tier: 1, category: 'database', status: 'operational', rto: 30, rpo: 5,
        dependencies: [], owner: 'DBA Team', primarySite: 'site1',
        recoverySite: 'site2', recoveryProcedure: 'rb2', healthScore: 95, createdAt: new Date(),
      },
      {
        _id: 'sys3', name: 'Authentication Service', description: 'OAuth2/OIDC authentication',
        tier: 1, category: 'security', status: 'degraded', rto: 20, rpo: 10,
        dependencies: ['sys2'], owner: 'Security Team', primarySite: 'site1',
        recoverySite: 'site2', recoveryProcedure: 'rb3', healthScore: 72, createdAt: new Date(),
      },
    ]);

    // Mock sites
    setSites([
      {
        _id: 'site1', name: 'US-East Primary', type: 'primary',
        location: { address: '123 Data Center Dr', city: 'Ashburn', country: 'USA' },
        status: 'active', capacity: { servers: 500, storage: '2 PB', bandwidth: '100 Gbps' },
        failoverTime: 0, contacts: ['ops@company.com'], systems: ['sys1', 'sys2', 'sys3'],
        createdAt: new Date(),
      },
      {
        _id: 'site2', name: 'US-West Hot Site', type: 'hot',
        location: { address: '456 Recovery Blvd', city: 'Phoenix', country: 'USA' },
        status: 'standby', capacity: { servers: 300, storage: '1 PB', bandwidth: '50 Gbps' },
        failoverTime: 15, lastFailoverTest: new Date('2024-11-20'), contacts: ['dr@company.com'],
        systems: [], createdAt: new Date(),
      },
    ]);

    // Mock runbooks
    setRunbooks([
      {
        _id: 'rb1', name: 'API Gateway Failover', description: 'Failover procedure for API Gateway',
        type: 'failover', system: 'sys1', status: 'approved', estimatedTime: 15,
        prerequisites: ['VPN access', 'Admin credentials'], owner: 'Platform Lead',
        executionCount: 12, lastExecuted: new Date('2024-12-01'),
        steps: [
          { order: 1, title: 'Verify DR site status', description: 'Check DR site connectivity', responsible: 'NOC', estimatedTime: 2, isAutomated: true, command: 'ping dr-gateway.company.com', verificationSteps: [], rollbackSteps: [] },
          { order: 2, title: 'Update DNS records', description: 'Point traffic to DR site', responsible: 'Platform Team', estimatedTime: 5, isAutomated: true, command: 'aws route53 change-resource-record-sets --hosted-zone-id Z123 --change-batch file://failover.json', verificationSteps: [], rollbackSteps: [] },
          { order: 3, title: 'Verify traffic routing', description: 'Confirm requests reaching DR', responsible: 'NOC', estimatedTime: 5, isAutomated: false, verificationSteps: [], rollbackSteps: [] },
        ],
        createdAt: new Date(), updatedAt: new Date(),
      },
    ]);

    // Mock tests
    setTests([
      {
        _id: 't1', name: 'Q1 2025 Full DR Test', type: 'simulation', status: 'scheduled',
        plan: '1', scheduledDate: new Date('2025-01-15'), participants: ['John', 'Jane', 'Bob'],
        systems: ['sys1', 'sys2'], objectives: ['Verify RTO < 60min', 'Verify RPO < 15min'],
        createdAt: new Date(),
      },
      {
        _id: 't2', name: 'Database Failover Test', type: 'parallel', status: 'completed',
        plan: '2', scheduledDate: new Date('2024-12-10'), startedAt: new Date('2024-12-10T10:00:00'),
        completedAt: new Date('2024-12-10T11:30:00'), participants: ['DBA Team'],
        systems: ['sys2'], objectives: ['Test replication', 'Verify data integrity'],
        results: { rtoAchieved: 25, rpoAchieved: 3, successRate: 95, issues: ['Minor lag during switchover'], recommendations: ['Increase replication bandwidth'] },
        createdAt: new Date(),
      },
    ]);
  }, []);

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
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you're asking about "${inputValue}". As your DR assistant, I can help you with recovery plans, system monitoring, runbook execution, and incident response. What specific action would you like to take?`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} recentPlans={plans} criticalSystems={systems} onNavigate={setActiveTab} />;
      case 'plans':
        return <PlansList plans={plans} onActivate={(id) => console.log('Activate', id)} onArchive={(id) => console.log('Archive', id)} onClone={(id) => console.log('Clone', id)} onDelete={(id) => console.log('Delete', id)} onExport={(id) => console.log('Export', id)} />;
      case 'systems':
        return <SystemsManager systems={systems} onFailover={(id) => console.log('Failover', id)} onFailback={(id) => console.log('Failback', id)} onDelete={(id) => console.log('Delete', id)} />;
      case 'sites':
        return <SitesManager sites={sites} onTestConnectivity={(id) => console.log('Test', id)} onDelete={(id) => console.log('Delete', id)} />;
      case 'runbooks':
        return <RunbooksManager runbooks={runbooks} onExecute={(id) => console.log('Execute', id)} onValidate={(id) => console.log('Validate', id)} onDelete={(id) => console.log('Delete', id)} />;
      case 'tests':
        return <TestsManager tests={tests} onStart={(id) => console.log('Start', id)} onComplete={(id) => console.log('Complete', id)} onCancel={(id) => console.log('Cancel', id)} onDelete={(id) => console.log('Delete', id)} />;
      case 'incidents':
        return <IncidentsPanel incidents={incidents} onResolve={(id) => console.log('Resolve', id)} onAddUpdate={(id, update) => console.log('Update', id, update)} />;
      default:
        return <div className="text-white text-center py-12">Section coming soon...</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-white">DRPlan</h1>
                <p className="text-xs text-slate-400">Disaster Recovery</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                  activeTab === item.id
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 border-t border-slate-700 text-slate-400 hover:text-white"
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-white capitalize">{activeTab.replace('_', ' ')}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-64 pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-white relative">
              <Bell className="w-5 h-5" />
              {stats.activeIncidents > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-2 rounded-lg transition ${chatOpen ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </main>

          {/* Chat Panel */}
          {chatOpen && (
            <aside className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col">
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                  <h3 className="font-semibold text-white">DR Assistant</h3>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' ? 'bg-orange-600' : 'bg-slate-700'
                    }`}>
                      {message.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-orange-400" />}
                    </div>
                    <div className={`max-w-[80%] p-3 rounded-xl ${
                      message.role === 'user' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-200'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="bg-slate-700 rounded-xl p-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about DR plans, systems..."
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/maula" replace />} />
    <Route path="/maula" element={<DRPlanExperience />} />
    <Route path="/maula/ai" element={<NeuralLinkInterface />} />
    <Route path="/*" element={<Navigate to="/maula" replace />} />
  </Routes>
);

export default App;
