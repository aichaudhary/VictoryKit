import React, { useState } from 'react';
import {
  LayoutDashboard,
  Shield,
  Database,
  Lock,
  Eye,
  FileSearch,
  Settings,
  BarChart3,
  Users,
  Bot,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

const Navigation: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
    { id: 'discovery', label: 'Data Discovery', icon: <FileSearch size={20} />, href: '/discovery', badge: 12 },
    { id: 'classification', label: 'Classification', icon: <Database size={20} />, href: '/classification' },
    { id: 'protection', label: 'Protection', icon: <Shield size={20} />, href: '/protection' },
    { id: 'encryption', label: 'Encryption', icon: <Lock size={20} />, href: '/encryption' },
    { id: 'access', label: 'Access Control', icon: <Users size={20} />, href: '/access' },
    { id: 'monitoring', label: 'Monitoring', icon: <Eye size={20} />, href: '/monitoring', badge: 3 },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} />, href: '/reports' },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, href: '/settings' },
  ];

  return (
    <nav className={`bg-guardian-darker border-r border-guardian-800/50 h-screen flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-4 border-b border-guardian-800/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-guardian-gradient flex items-center justify-center shadow-glow-emerald">
                <Shield size={18} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">DataGuardian</span>
            </div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 rounded-lg hover:bg-guardian-800/30 text-guardian-primary">
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            onClick={(e) => { e.preventDefault(); setActiveItem(item.id); }}
            className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 group ${
              activeItem === item.id
                ? 'bg-guardian-primary/20 text-guardian-accent shadow-glow-emerald'
                : 'text-gray-400 hover:bg-guardian-800/20 hover:text-guardian-accent'
            }`}
          >
            <span className={activeItem === item.id ? 'text-guardian-accent' : 'text-gray-500 group-hover:text-guardian-accent'}>
              {item.icon}
            </span>
            {!isCollapsed && (
              <>
                <span className="flex-1 font-medium">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-yellow-500/20 text-yellow-400">
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </a>
        ))}
      </div>

      {/* AI Assistant */}
      <div className="p-4 border-t border-guardian-800/50">
        <a
          href="/maula-ai"
          className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-guardian-primary/20 to-teal-600/20 border border-guardian-primary/30 hover:border-guardian-accent/50 transition-all group ${isCollapsed ? 'justify-center' : ''}`}
        >
          <Bot size={20} className="text-guardian-accent group-hover:text-guardian-300" />
          {!isCollapsed && (
            <div>
              <span className="text-sm font-semibold text-white">Maula AI</span>
              <p className="text-xs text-gray-500">Data Protection Assistant</p>
            </div>
          )}
        </a>
      </div>
    </nav>
  );
};

export default Navigation;
