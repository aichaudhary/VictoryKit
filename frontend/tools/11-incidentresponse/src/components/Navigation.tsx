import React, { useState } from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  Users,
  Clock,
  BookOpen,
  BarChart3,
  Settings,
  Shield,
  Bot,
  ChevronLeft,
  ChevronRight,
  Siren,
  Activity,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  alert?: boolean;
}

interface NavigationProps {
  activeItem: string;
  onNavigate: (item: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeItem, onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'incidents', label: 'Active Incidents', icon: <Siren size={20} />, badge: 5, alert: true },
    { id: 'alerts', label: 'Alerts', icon: <AlertTriangle size={20} />, badge: 12 },
    { id: 'timeline', label: 'Timeline', icon: <Clock size={20} /> },
    { id: 'playbooks', label: 'Playbooks', icon: <BookOpen size={20} /> },
    { id: 'responders', label: 'Responders', icon: <Users size={20} /> },
    { id: 'forensics', label: 'Forensics', icon: <Activity size={20} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <nav
      className={`h-screen bg-dark-300 border-r border-incident-500/20 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-incident-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-incident-gradient flex items-center justify-center shadow-incident">
            <Shield className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-white">IncidentResponse</h1>
              <p className="text-xs text-gray-400">Rapid Response Platform</p>
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
                    ? 'bg-incident-500/20 text-incident-400 shadow-incident'
                    : 'text-gray-400 hover:bg-dark-100 hover:text-white'
                }`}
              >
                <span className={`${activeItem === item.id ? 'text-incident-400' : 'text-gray-400 group-hover:text-incident-400'}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        item.alert 
                          ? 'bg-critical text-white animate-pulse' 
                          : 'bg-incident-500/30 text-incident-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {isCollapsed && item.badge && (
                  <span className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs rounded-full ${
                    item.alert ? 'bg-critical text-white animate-pulse' : 'bg-incident-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Maula AI Assistant */}
      <div className="p-3 border-t border-incident-500/20">
        <button
          onClick={() => onNavigate('maula-ai')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
            activeItem === 'maula-ai'
              ? 'bg-gradient-to-r from-incident-600 to-incident-500 text-white shadow-incident-lg'
              : 'bg-dark-100 text-gray-300 hover:bg-incident-500/20 hover:text-incident-300'
          }`}
        >
          <Bot size={20} className={activeItem === 'maula-ai' ? 'animate-pulse' : ''} />
          {!isCollapsed && (
            <div className="flex-1 text-left">
              <span className="text-sm font-semibold">Maula AI</span>
              <p className="text-xs opacity-70">Incident Assistant</p>
            </div>
          )}
        </button>
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-incident-500/20">
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
