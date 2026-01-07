import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, Menu, X, MessageSquare, ChevronLeft, ChevronRight,
  Search, Settings, Bell, TrendingUp, Activity, FileText,
  AlertTriangle, CheckCircle, Clock, Send, Sparkles, Mic,
  Paperclip, MoreHorizontal, User, Bot, Network, Zap,
  Eye, Lock, Globe, Server, Database, Wifi, WifiOff,
  BarChart3, PieChart, LineChart, Filter, RefreshCw,
  Play, Pause, Square, Monitor, Cpu, HardDrive
} from 'lucide-react';

// Components
import FirewallDashboard from './components/FirewallDashboard';
import TrafficMonitor from './components/TrafficMonitor';
import RuleManager from './components/RuleManager';
import ThreatAnalysis from './components/ThreatAnalysis';
import AlertCenter from './components/AlertCenter';
import PolicyEngine from './components/PolicyEngine';
import RealTimeCharts from './components/RealTimeCharts';
import VendorManagement from './components/VendorManagement';

// Types and constants
import {
  FirewallRule, TrafficLog, Alert, Tab, SettingsState,
  Message, Vendor, ThreatAnalysis as ThreatAnalysisType,
  Policy, RealTimeData
} from './types';
import { NAV_ITEMS, DEFAULT_SETTINGS, VENDOR_CONFIG } from './constants';

// Services
import { firewallAPI } from './services/firewallAPI';
import { executeTool, getToolDefinitions } from './services/firewall-tools';

const App: React.FC = () => {
  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);

  // Data state
  const [firewallRules, setFirewallRules] = useState<FirewallRule[]>([]);
  const [trafficLogs, setTrafficLogs] = useState<TrafficLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [threatAnalysis, setThreatAnalysis] = useState<ThreatAnalysisType | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'AGENT',
      text: "Welcome to FirewallAI! I'm your Advanced Firewall Management and Threat Detection Platform. I can help you monitor network traffic, manage firewall rules, analyze threats with AI/ML, and orchestrate security responses. How can I assist you today?",
      timestamp: new Date().toISOString(),
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
    if (isRealTimeEnabled) {
      startRealTimeUpdates();
    }
  }, []);

  // Load initial data
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [rules, logs, alertsData, vendorsData, policiesData] = await Promise.all([
        firewallAPI.rules.getAll(),
        firewallAPI.logs.getRecent(100),
        firewallAPI.alerts.getActive(),
        firewallAPI.vendors.getAll(),
        firewallAPI.policies.getAll()
      ]);

      setFirewallRules(rules);
      setTrafficLogs(logs);
      setAlerts(alertsData);
      setVendors(vendorsData);
      setPolicies(policiesData);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time updates
  const startRealTimeUpdates = () => {
    const interval = setInterval(async () => {
      try {
        const [newLogs, newAlerts, realTimeStats] = await Promise.all([
          firewallAPI.logs.getRecent(10),
          firewallAPI.alerts.getActive(),
          firewallAPI.analytics.getRealTimeStats()
        ]);

        setTrafficLogs(prev => [...newLogs, ...prev.slice(0, 90)]);
        setAlerts(newAlerts);
        setRealTimeData(realTimeStats);
      } catch (error) {
        console.error('Real-time update failed:', error);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  };

  // Handle firewall rule operations
  const handleCreateRule = async (rule: Omit<FirewallRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newRule = await firewallAPI.rules.create(rule);
      setFirewallRules(prev => [newRule, ...prev]);

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'AGENT',
        text: `Firewall rule "${rule.name}" created successfully with ${rule.action} action.`,
        timestamp: new Date().toISOString(),
      }]);
    } catch (error) {
      console.error('Failed to create rule:', error);
    }
  };

  const handleUpdateRule = async (ruleId: string, updates: Partial<FirewallRule>) => {
    try {
      const updatedRule = await firewallAPI.rules.update(ruleId, updates);
      setFirewallRules(prev => prev.map(rule =>
        rule.id === ruleId ? updatedRule : rule
      ));
    } catch (error) {
      console.error('Failed to update rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await firewallAPI.rules.delete(ruleId);
      setFirewallRules(prev => prev.filter(rule => rule.id !== ruleId));
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  // Handle threat analysis
  const handleAnalyzeThreats = async () => {
    setIsLoading(true);
    try {
      const analysis = await firewallAPI.threats.analyze(trafficLogs.slice(0, 1000));
      setThreatAnalysis(analysis);

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'AGENT',
        text: `Threat analysis completed. Detected ${analysis.threats.length} active threats with ${analysis.anomalies.length} anomalies. Overall risk level: ${analysis.overallRisk}.`,
        timestamp: new Date().toISOString(),
      }]);
    } catch (error) {
      console.error('Threat analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle chat message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'YOU',
      text: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response (would connect to real AI service)
    setTimeout(async () => {
      let response = '';

      if (inputValue.toLowerCase().includes('analyze') && inputValue.toLowerCase().includes('threat')) {
        response = "I'll run a comprehensive threat analysis on recent traffic logs. This will use AI/ML to detect anomalies, correlate threats, and provide actionable insights.";
        handleAnalyzeThreats();
      } else if (inputValue.toLowerCase().includes('rule') || inputValue.toLowerCase().includes('policy')) {
        response = "You can manage firewall rules and policies from the Rule Manager and Policy Engine sections. I can help you create new rules, update existing ones, or analyze your current rule set for optimization opportunities.";
      } else if (inputValue.toLowerCase().includes('traffic') || inputValue.toLowerCase().includes('monitor')) {
        response = "The Traffic Monitor shows real-time network traffic with AI-powered anomaly detection. You can filter by protocol, source/destination, and view detailed packet analysis.";
      } else if (inputValue.toLowerCase().includes('alert') || inputValue.toLowerCase().includes('incident')) {
        response = "The Alert Center displays all active security alerts with automated response capabilities. I can help you investigate alerts, create incident response playbooks, or configure automated remediation actions.";
      } else if (inputValue.toLowerCase().includes('vendor') || inputValue.toLowerCase().includes('integration')) {
        response = "FirewallAI supports multi-vendor firewall management including pfSense, Palo Alto, Fortinet, Check Point, and Cisco ASA. You can manage all your firewalls from a single interface.";
      } else {
        response = "I'm here to help with advanced firewall management and threat detection. I can:\n\n• Monitor real-time network traffic with AI analysis\n• Manage firewall rules across multiple vendors\n• Detect and analyze security threats\n• Orchestrate automated incident responses\n• Generate compliance reports\n• Optimize firewall policies\n\nWhat would you like to do?";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'AGENT',
        text: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Handle alert operations
  const handleCreateAlert = async (alert: Omit<Alert, 'id' | 'timestamp' | 'status'>) => {
    try {
      const newAlert = await firewallAPI.alerts.create(alert);
      setAlerts((prev) => [newAlert, ...prev]);
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

  // Handle policy operations
  const handleUpdatePolicy = async (policyId: string, updates: Partial<Policy>) => {
    try {
      const updatedPolicy = await firewallAPI.policies.update(policyId, updates);
      setPolicies((prev) => prev.map((p) => p.id === policyId ? updatedPolicy : p));
    } catch (error) {
      // For demo, update locally
      setPolicies((prev) => prev.map((p) => p.id === policyId ? { ...p, ...updates } : p));
    }
  };

  const handleCreatePolicy = async (policy: Omit<Policy, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newPolicy = await firewallAPI.policies.create(policy);
      setPolicies((prev) => [newPolicy, ...prev]);
    } catch (error) {
      // For demo, create locally
      const localPolicy: Policy = {
        ...policy,
        id: `policy_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setPolicies((prev) => [...prev, localPolicy]);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    try {
      await firewallAPI.policies.delete(policyId);
      setPolicies((prev) => prev.filter((p) => p.id !== policyId));
    } catch (error) {
      // For demo, delete locally
      setPolicies((prev) => prev.filter((p) => p.id !== policyId));
    }
  };

  // Handle vendor operations
  const handleUpdateVendor = async (vendorId: string, updates: Partial<Vendor>) => {
    try {
      const updatedVendor = await firewallAPI.vendors.update(vendorId, updates);
      setVendors((prev) => prev.map((v) => v.id === vendorId ? updatedVendor : v));
    } catch (error) {
      // For demo, update locally
      setVendors((prev) => prev.map((v) => v.id === vendorId ? { ...v, ...updates } : v));
    }
  };

  const handleCreateVendor = async (vendor: Omit<Vendor, 'id' | 'created_at' | 'last_sync'>) => {
    try {
      const newVendor = await firewallAPI.vendors.create(vendor);
      setVendors((prev) => [newVendor, ...prev]);
    } catch (error) {
      // For demo, create locally
      const localVendor: Vendor = {
        ...vendor,
        id: `vendor_${Date.now()}`,
        created_at: new Date().toISOString(),
        last_sync: new Date().toISOString(),
      };
      setVendors((prev) => [...prev, localVendor]);
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    try {
      await firewallAPI.vendors.delete(vendorId);
      setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    } catch (error) {
      // For demo, delete locally
      setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    }
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
      case 'dashboard':
        return (
          <FirewallDashboard
            rules={firewallRules}
            alerts={alerts}
            trafficLogs={trafficLogs}
            realTimeData={realTimeData}
            onAnalyzeThreats={handleAnalyzeThreats}
            isLoading={isLoading}
          />
        );
      case 'monitor':
        return (
          <TrafficMonitor
            logs={trafficLogs}
            realTimeData={realTimeData}
            isRealTimeEnabled={isRealTimeEnabled}
            onToggleRealTime={setIsRealTimeEnabled}
          />
        );
      case 'rules':
        return (
          <RuleManager
            rules={firewallRules}
            vendors={vendors}
            onCreateRule={handleCreateRule}
            onUpdateRule={handleUpdateRule}
            onDeleteRule={handleDeleteRule}
          />
        );
      case 'threats':
        return (
          <ThreatAnalysis
            analysis={threatAnalysis}
            logs={trafficLogs}
            onAnalyze={handleAnalyzeThreats}
            isLoading={isLoading}
          />
        );
      case 'alerts':
        return (
          <AlertCenter
            alerts={alerts}
            onCreateAlert={handleCreateAlert}
            onDeleteAlert={handleDeleteAlert}
            onToggleAlert={handleToggleAlert}
          />
        );
      case 'policies':
        return (
          <PolicyEngine
            policies={policies}
            rules={firewallRules}
            onUpdatePolicy={handleUpdatePolicy}
            onCreatePolicy={handleCreatePolicy}
            onDeletePolicy={handleDeletePolicy}
          />
        );
      case 'analytics':
        return (
          <RealTimeCharts
            data={realTimeData}
            logs={trafficLogs}
            alerts={alerts}
          />
        );
      case 'vendors':
        return (
          <VendorManagement
            vendors={vendors}
            onUpdateVendor={handleUpdateVendor}
            onCreateVendor={handleCreateVendor}
            onDeleteVendor={handleDeleteVendor}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900/80 backdrop-blur-lg border-b border-blue-500/30">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">FirewallAI</h1>
                <p className="text-xs text-blue-400">Advanced Firewall Management</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Real-time Toggle */}
            <button
              onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                isRealTimeEnabled
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-slate-800 text-gray-400 hover:text-white'
              }`}
            >
              {isRealTimeEnabled ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isRealTimeEnabled ? 'Live' : 'Paused'}
            </button>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {alerts.filter(a => a.status === 'new').length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
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
                chatOpen ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-slate-800'
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
          className={`fixed left-0 top-16 bottom-0 bg-slate-900/50 backdrop-blur border-r border-blue-500/20 transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          <nav className="p-4 space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = {
                'dashboard': BarChart3,
                'monitor': Monitor,
                'rules': Shield,
                'threats': AlertTriangle,
                'alerts': Bell,
                'policies': Lock,
                'analytics': TrendingUp,
                'vendors': Server,
              }[item.id] || Activity;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-white'
                      : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* System Status */}
          {sidebarOpen && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/30">
                <h4 className="text-sm font-bold text-white mb-3">System Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Traffic Monitor</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400 text-xs">Active</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Threat Detection</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400 text-xs">Active</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Rules</span>
                    <span className="text-white font-bold">{firewallRules.filter(r => r.enabled).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Alerts</span>
                    <span className="text-yellow-400 font-bold">{alerts.filter(a => a.status === 'new').length}</span>
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
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {NAV_ITEMS.find(n => n.id === activeTab)?.label || 'FirewallAI'}
              </h2>
              <p className="text-gray-400 mt-1">
                {activeTab === 'dashboard' && 'Comprehensive firewall management and threat monitoring dashboard'}
                {activeTab === 'monitor' && 'Real-time network traffic monitoring with AI-powered anomaly detection'}
                {activeTab === 'rules' && 'Multi-vendor firewall rule management and policy enforcement'}
                {activeTab === 'threats' && 'Advanced threat analysis with ML correlation and behavioral detection'}
                {activeTab === 'alerts' && 'Intelligent alert management with automated incident response'}
                {activeTab === 'policies' && 'Policy engine for automated security orchestration'}
                {activeTab === 'analytics' && 'Real-time analytics and performance monitoring'}
                {activeTab === 'vendors' && 'Multi-vendor firewall integration and management'}
              </p>
            </div>

            {/* Tab Content */}
            {renderTabContent()}
          </div>
        </main>

        {/* Chat Panel */}
        {chatOpen && (
          <aside className="fixed right-0 top-16 bottom-0 w-96 bg-slate-900/50 backdrop-blur border-l border-blue-500/20 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-blue-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
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
                  className="bg-slate-800 border border-blue-500/30 rounded-lg px-2 py-1 text-sm"
                >
                  {Object.entries(VENDOR_CONFIG).map(([key, config]) => (
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
                      : 'bg-gradient-to-br from-blue-500 to-cyan-500'
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
                      : 'bg-slate-800/50 border border-blue-500/30'
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
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-800/50 border border-blue-500/30 p-3 rounded-xl">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-blue-500/20">
              <div className="flex items-center gap-2 bg-slate-800/50 border border-blue-500/30 rounded-xl p-2">
                <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                </button>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about firewall management..."
                  className="flex-1 bg-transparent outline-none text-sm"
                />
                <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                  <Mic className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-[10px] text-gray-500 text-center mt-2">
                Powered by Advanced AI Firewall Engine
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default App;
