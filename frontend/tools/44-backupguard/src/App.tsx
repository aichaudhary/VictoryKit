import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Menu, X, MessageSquare, ChevronLeft, ChevronRight,
  LayoutDashboard, HardDrive, Database, FileCheck, Bell, ScrollText, Settings,
  Send, Sparkles, Bot, User, Loader
} from 'lucide-react';

// Components
import Dashboard from './components/Dashboard';
import BackupList from './components/BackupList';
import StorageManager from './components/StorageManager';
import PolicyEditor from './components/PolicyEditor';
import AlertsPanel from './components/AlertsPanel';
import AccessLogs from './components/AccessLogs';

// Types and constants
import { 
  Tab, Backup, StorageLocation, RetentionPolicy, Alert, AccessLog, 
  DashboardStats, Message, SettingsState
} from './types';
import { NAV_ITEMS, DEFAULT_SETTINGS } from './constants';

// Services
import { backupguardAPI } from './services/backupguardAPI';

const App: React.FC = () => {
  // Navigation state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  
  // Data state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>([]);
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to BackupGuard! I'm your AI-powered backup security assistant. I can help you manage backups, monitor storage, verify data integrity, and respond to security alerts. How can I assist you today?",
      timestamp: new Date(),
      provider: settings.selectedProvider,
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load data on mount and tab change
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'dashboard':
          const dashRes = await backupguardAPI.health.getDashboard();
          setDashboardStats(dashRes.data);
          break;
        case 'backups':
          const backupsRes = await backupguardAPI.backups.getAll();
          setBackups(backupsRes.data.backups);
          break;
        case 'storage':
          const storageRes = await backupguardAPI.storage.getAll();
          setStorageLocations(storageRes.data.storageLocations);
          break;
        case 'policies':
          const policiesRes = await backupguardAPI.policies.getAll();
          setPolicies(policiesRes.data.policies);
          break;
        case 'alerts':
          const alertsRes = await backupguardAPI.alerts.getAll();
          setAlerts(alertsRes.data.alerts);
          break;
        case 'logs':
          const logsRes = await backupguardAPI.logs.getAll();
          setAccessLogs(logsRes.data.logs);
          break;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
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
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response (would connect to actual AI backend)
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(inputValue),
        timestamp: new Date(),
        provider: settings.selectedProvider,
      };
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1000);
  };

  const getAIResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('backup') && (q.includes('create') || q.includes('new'))) {
      return "To create a new backup, go to the Backups tab and click 'Create Backup'. You can specify the source, target storage location, backup type (full, incremental, differential), and schedule.";
    }
    if (q.includes('storage') && (q.includes('add') || q.includes('new'))) {
      return "You can add a new storage location from the Storage tab. BackupGuard supports S3, Azure Blob, Google Cloud Storage, NFS, SMB, and SFTP targets. Click 'Add Storage' to get started.";
    }
    if (q.includes('alert') || q.includes('warning')) {
      return `You have ${alerts.filter(a => a.status === 'new').length} active alerts. I recommend reviewing any critical alerts first. Would you like me to summarize the most important ones?`;
    }
    if (q.includes('integrity') || q.includes('verify')) {
      return "Integrity checks verify that your backups are recoverable and uncorrupted. You can run checksum verification, restore tests, or corruption scans from the Backups tab by selecting a backup and clicking 'Verify'.";
    }
    if (q.includes('retention') || q.includes('policy')) {
      return "Retention policies define how long backups are kept using the GFS (Grandfather-Father-Son) strategy. You can configure daily, weekly, monthly, and yearly retention in the Policies tab.";
    }
    return "I can help you with backup management, storage configuration, integrity verification, retention policies, and alert management. What would you like to know more about?";
  };

  // Backup handlers
  const handleStartBackup = async (id: string) => {
    await backupguardAPI.backups.start(id);
    loadData();
  };

  const handleCancelBackup = async (id: string) => {
    await backupguardAPI.backups.cancel(id);
    loadData();
  };

  const handleDeleteBackup = async (id: string) => {
    await backupguardAPI.backups.delete(id);
    loadData();
  };

  const handleVerifyBackup = async (id: string) => {
    await backupguardAPI.backups.verify(id);
    loadData();
  };

  const handleRestoreBackup = async (id: string) => {
    await backupguardAPI.backups.restore(id);
    loadData();
  };

  // Storage handlers
  const handleTestConnection = async (id: string) => {
    await backupguardAPI.storage.testConnection(id);
    loadData();
  };

  const handleDeleteStorage = async (id: string) => {
    await backupguardAPI.storage.delete(id);
    loadData();
  };

  const handleCreateStorage = async (data: Partial<StorageLocation>) => {
    await backupguardAPI.storage.create(data);
    loadData();
  };

  // Policy handlers
  const handleApplyPolicy = async (id: string) => {
    await backupguardAPI.policies.apply(id);
    loadData();
  };

  const handleDeletePolicy = async (id: string) => {
    await backupguardAPI.policies.delete(id);
    loadData();
  };

  const handleCreatePolicy = async (data: Partial<RetentionPolicy>) => {
    await backupguardAPI.policies.create(data);
    loadData();
  };

  // Alert handlers
  const handleAcknowledgeAlert = async (id: string) => {
    await backupguardAPI.alerts.acknowledge(id);
    loadData();
  };

  const handleResolveAlert = async (id: string, action?: string) => {
    await backupguardAPI.alerts.resolve(id, action);
    loadData();
  };

  const handleDismissAlert = async (id: string) => {
    await backupguardAPI.alerts.dismiss(id);
    loadData();
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      LayoutDashboard: <LayoutDashboard className="w-5 h-5" />,
      HardDrive: <HardDrive className="w-5 h-5" />,
      Database: <Database className="w-5 h-5" />,
      FileCheck: <FileCheck className="w-5 h-5" />,
      Bell: <Bell className="w-5 h-5" />,
      ScrollText: <ScrollText className="w-5 h-5" />,
      Settings: <Settings className="w-5 h-5" />,
    };
    return icons[iconName] || <Shield className="w-5 h-5" />;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={dashboardStats} isLoading={isLoading} />;
      case 'backups':
        return (
          <BackupList
            backups={backups}
            onStart={handleStartBackup}
            onCancel={handleCancelBackup}
            onDelete={handleDeleteBackup}
            onView={(backup) => console.log('View backup:', backup)}
            onVerify={handleVerifyBackup}
            onRestore={handleRestoreBackup}
            isLoading={isLoading}
          />
        );
      case 'storage':
        return (
          <StorageManager
            locations={storageLocations}
            onTestConnection={handleTestConnection}
            onDelete={handleDeleteStorage}
            onCreate={handleCreateStorage}
            isLoading={isLoading}
          />
        );
      case 'policies':
        return (
          <PolicyEditor
            policies={policies}
            onApply={handleApplyPolicy}
            onDelete={handleDeletePolicy}
            onCreate={handleCreatePolicy}
            isLoading={isLoading}
          />
        );
      case 'alerts':
        return (
          <AlertsPanel
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
            onDismiss={handleDismissAlert}
            isLoading={isLoading}
          />
        );
      case 'logs':
        return <AccessLogs logs={accessLogs} isLoading={isLoading} />;
      case 'settings':
        return (
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Settings</h2>
            <p className="text-slate-400">Configuration settings for BackupGuard.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-800 border-r border-slate-700 flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">BackupGuard</h1>
                <p className="text-xs text-slate-400">Backup Security</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeTab === item.tab
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {getIcon(item.icon)}
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 border-t border-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-2 rounded-lg transition-colors ${
                chatOpen ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-slate-700'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button className="relative p-2 text-slate-400 hover:bg-slate-700 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {alerts.filter(a => a.status === 'new').length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Panel */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>

          {/* Chat Panel */}
          {chatOpen && (
            <div className="w-96 bg-slate-800/50 border-l border-slate-700 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span className="font-medium">AI Assistant</span>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`p-2 rounded-lg ${msg.role === 'user' ? 'bg-cyan-600' : 'bg-slate-700'}`}>
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block p-3 rounded-lg ${
                        msg.role === 'user' ? 'bg-cyan-600' : 'bg-slate-700'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="p-2 rounded-lg bg-slate-700">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1 p-3 bg-slate-700 rounded-lg">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-slate-400">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about backups, storage, alerts..."
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="p-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
