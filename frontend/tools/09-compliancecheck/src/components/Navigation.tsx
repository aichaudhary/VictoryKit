import React, { useState } from 'react';
import {
  LayoutDashboard,
  Shield,
  FileCheck,
  ClipboardList,
  FileText,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckSquare,
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
    { id: 'frameworks', label: 'Frameworks', icon: <Shield size={20} />, href: '/frameworks' },
    { id: 'assessments', label: 'Assessments', icon: <ClipboardList size={20} />, href: '/assessments', badge: 5 },
    { id: 'controls', label: 'Controls', icon: <CheckSquare size={20} />, href: '/controls' },
    { id: 'audits', label: 'Audit Logs', icon: <FileCheck size={20} />, href: '/audits' },
    { id: 'gaps', label: 'Gap Analysis', icon: <AlertTriangle size={20} />, href: '/gaps', badge: 12 },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} />, href: '/reports' },
    { id: 'policies', label: 'Policies', icon: <FileText size={20} />, href: '/policies' },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, href: '/settings' },
  ];

  return (
    <nav className={`bg-compliance-darker border-r border-primary-800/50 h-screen flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-4 border-b border-primary-800/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-compliance-gradient flex items-center justify-center shadow-glow-indigo">
                <Shield size={18} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">ComplianceCheck</span>
            </div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 rounded-lg hover:bg-primary-800/30 text-primary-400">
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
                ? 'bg-primary-600/20 text-primary-400 shadow-glow-indigo'
                : 'text-gray-400 hover:bg-primary-800/20 hover:text-primary-300'
            }`}
          >
            <span className={activeItem === item.id ? 'text-primary-400' : 'text-gray-500 group-hover:text-primary-400'}>
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
      <div className="p-4 border-t border-primary-800/50">
        <a
          href="/maula-ai"
          className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary-600/20 to-violet-600/20 border border-primary-500/30 hover:border-primary-400/50 transition-all group ${isCollapsed ? 'justify-center' : ''}`}
        >
          <Bot size={20} className="text-primary-400 group-hover:text-primary-300" />
          {!isCollapsed && (
            <div>
              <span className="text-sm font-semibold text-white">Maula AI</span>
              <p className="text-xs text-gray-500">Compliance Assistant</p>
            </div>
          )}
        </a>
      </div>
    </nav>
  );
};

export default Navigation;
