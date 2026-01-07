import React, { useState } from 'react';
import {
  LayoutDashboard,
  Search,
  FileText,
  Filter,
  AlertTriangle,
  BarChart3,
  Settings,
  Database,
  Bot,
  ChevronLeft,
  ChevronRight,
  Zap,
  Clock,
  Terminal,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavigationProps {
  activeItem: string;
  onNavigate: (item: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeItem, onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'search', label: 'Log Search', icon: <Search size={20} /> },
    { id: 'live', label: 'Live Stream', icon: <Zap size={20} />, badge: 3 },
    { id: 'sources', label: 'Log Sources', icon: <Database size={20} /> },
    { id: 'parsers', label: 'Parsers', icon: <Terminal size={20} /> },
    { id: 'alerts', label: 'Alerts', icon: <AlertTriangle size={20} />, badge: 8 },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    { id: 'retention', label: 'Retention', icon: <Clock size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <nav
      className={`h-screen bg-dark-300 border-r border-log-500/20 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-log-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-log-gradient flex items-center justify-center shadow-log">
            <FileText className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-white">LogAnalyzer</h1>
              <p className="text-xs text-gray-400">AI Log Intelligence</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  activeItem === item.id
                    ? 'bg-log-500/20 text-log-400 shadow-log'
                    : 'text-gray-400 hover:bg-dark-100 hover:text-white'
                }`}
              >
                <span className={`${activeItem === item.id ? 'text-log-400' : 'text-gray-400 group-hover:text-log-400'}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-log-500/30 text-log-300">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {isCollapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs rounded-full bg-log-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Maula AI Assistant */}
      <div className="p-3 border-t border-log-500/20">
        <button
          onClick={() => onNavigate('maula-ai')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
            activeItem === 'maula-ai'
              ? 'bg-gradient-to-r from-log-600 to-log-500 text-white shadow-log-lg'
              : 'bg-dark-100 text-gray-300 hover:bg-log-500/20 hover:text-log-300'
          }`}
        >
          <Bot size={20} className={activeItem === 'maula-ai' ? 'animate-pulse' : ''} />
          {!isCollapsed && (
            <div className="flex-1 text-left">
              <span className="text-sm font-semibold">Maula AI</span>
              <p className="text-xs opacity-70">Log Assistant</p>
            </div>
          )}
        </button>
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-log-500/20">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-dark-100 rounded-lg transition-all"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!isCollapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
