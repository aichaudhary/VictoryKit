import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Smartphone, ScanLine, AlertTriangle, 
  Shield, Zap, Lock, FileCheck, Code, Settings, Bot
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
  { id: 'apps', label: 'Mobile Apps', icon: <Smartphone className="w-5 h-5" />, path: '/apps' },
  { id: 'scans', label: 'Security Scans', icon: <ScanLine className="w-5 h-5" />, path: '/scans' },
  { id: 'vulnerabilities', label: 'Vulnerabilities', icon: <AlertTriangle className="w-5 h-5" />, path: '/vulnerabilities' },
  { id: 'devices', label: 'Devices', icon: <Shield className="w-5 h-5" />, path: '/devices' },
  { id: 'threats', label: 'Threat Intel', icon: <Zap className="w-5 h-5" />, path: '/threats' },
  { id: 'runtime', label: 'Runtime Protection', icon: <Lock className="w-5 h-5" />, path: '/runtime' },
  { id: 'compliance', label: 'Compliance', icon: <FileCheck className="w-5 h-5" />, path: '/compliance' },
  { id: 'code', label: 'Code Analysis', icon: <Code className="w-5 h-5" />, path: '/code' },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings' },
];

export const Navigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="w-64 bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-mobiledefend-primary to-mobiledefend-secondary rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">MobileDefend</h1>
            <p className="text-xs text-gray-400">App Security</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-mobiledefend-primary to-mobiledefend-secondary text-white shadow-lg shadow-mobiledefend-primary/25' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }
              `}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* AI Assistant Link */}
      <div className="p-4 border-t border-gray-800">
        <a
          href="/maula/ai"
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
        >
          <Bot className="w-5 h-5" />
          <span className="font-medium">AI Assistant</span>
        </a>
      </div>
    </div>
  );
};

export default Navigation;
