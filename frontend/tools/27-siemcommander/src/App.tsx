import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, AlertTriangle, Bell, Target,
  Zap, Shield, Database, BarChart2, Bot, Settings,
  Search, ChevronRight, User, X, Activity, Crosshair, GitBranch
} from 'lucide-react';
import {
  SOCDashboard,
  EventsPanel,
  IncidentsPanel,
  AlertsPanel,
  ThreatHuntingPanel,
  PlaybooksPanel,
  RulesPanel,
  DataSourcesPanel,
  ReportsPanel,
  AIAssistantPanel,
  SettingsPanel
} from './components';
import type { Tab } from './types';
import { NAV_ITEMS } from './constants';
import NeuralLinkInterface from '../../../neural-link-interface/App';

const BASE_PATH = '/maula';

const CoreApp: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      'LayoutDashboard': <LayoutDashboard className="w-5 h-5" />,
      'Activity': <Activity className="w-5 h-5" />,
      'AlertTriangle': <AlertTriangle className="w-5 h-5" />,
      'Bell': <Bell className="w-5 h-5" />,
      'Crosshair': <Crosshair className="w-5 h-5" />,
      'GitBranch': <GitBranch className="w-5 h-5" />,
      'Shield': <Shield className="w-5 h-5" />,
      'Database': <Database className="w-5 h-5" />,
      'FileText': <FileText className="w-5 h-5" />,
      'Bot': <Bot className="w-5 h-5" />,
      'Settings': <Settings className="w-5 h-5" />,
      'Target': <Target className="w-5 h-5" />,
      'Zap': <Zap className="w-5 h-5" />,
      'BarChart2': <BarChart2 className="w-5 h-5" />,
    };
    return icons[iconName] || <FileText className="w-5 h-5" />;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <SOCDashboard />;
      case 'events': return <EventsPanel />;
      case 'incidents': return <IncidentsPanel />;
      case 'alerts': return <AlertsPanel />;
      case 'threatHunting': return <ThreatHuntingPanel />;
      case 'playbooks': return <PlaybooksPanel />;
      case 'rules': return <RulesPanel />;
      case 'dataSources': return <DataSourcesPanel />;
      case 'reports': return <ReportsPanel />;
      case 'assistant': return <AIAssistantPanel />;
      case 'settings': return <SettingsPanel />;
      default: return <SOCDashboard />;
    }
  };

  const currentNavItem = NAV_ITEMS.find(item => item.id === activeTab);

  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-[#1E293B] border-r border-[#334155] transition-all duration-300 z-50 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#334155]">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold">SIEMCommander</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-[#334155] transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            ) : (
              <X className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-gray-400 hover:bg-[#334155] hover:text-white'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {getIcon(item.icon)}
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[#334155]">
          <button 
            className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#334155] transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
              <User className="w-4 h-4 text-violet-400" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 text-left">
                <p className="text-white text-sm font-medium">SOC Analyst</p>
                <p className="text-gray-400 text-xs">analyst@company.com</p>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Top Bar */}
        <header className="h-16 bg-[#1E293B] border-b border-[#334155] flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-white font-semibold text-lg">
              {currentNavItem?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events, incidents..."
                className="w-64 bg-[#0F172A] border border-[#334155] rounded-lg pl-10 pr-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-[#334155] transition-colors" title="Notifications">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* AI Assistant Quick Access */}
            <button 
              onClick={() => setActiveTab('assistant')}
              className="flex items-center gap-2 px-3 py-2 bg-violet-500/20 text-violet-400 rounded-lg hover:bg-violet-500/30 transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span className="text-sm">AI Assistant</span>
            </button>

            <button
              onClick={() => navigate(`${BASE_PATH}/ai`)}
              className="flex items-center gap-2 px-3 py-2 bg-violet-500/10 text-violet-300 rounded-lg hover:bg-violet-500/20 transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm">Neural Link AI</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 h-[calc(100vh-4rem)] overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to={BASE_PATH} replace />} />
      <Route path={`${BASE_PATH}`} element={<CoreApp />} />
      <Route path={`${BASE_PATH}/ai`} element={<NeuralLinkInterface />} />
      <Route path="*" element={<Navigate to={BASE_PATH} replace />} />
    </Routes>
  </Router>
);

export default App;
