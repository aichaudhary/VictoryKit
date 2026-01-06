/**
 * Navigation Component
 * Sidebar navigation for DataLossPrevention
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shield, 
  AlertTriangle, 
  Search, 
  Users, 
  FileCheck,
  Settings,
  Bot
} from 'lucide-react';

const Navigation: React.FC = () => {
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/policies', icon: Shield, label: 'Policies' },
    { path: '/incidents', icon: AlertTriangle, label: 'Incidents' },
    { path: '/discovery', icon: Search, label: 'Discovery' },
    { path: '/users', icon: Users, label: 'Users & Risk' },
    { path: '/compliance', icon: FileCheck, label: 'Compliance' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-dlp-dark to-dlp-darker border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-dlp-primary to-dlp-accent rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">DataLossPrevention</h1>
            <p className="text-gray-400 text-xs">Enterprise DLP</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-dlp-primary to-dlp-accent text-white shadow-glow-blue'
                  : 'text-gray-400 hover:text-white hover:bg-dlp-darker'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* AI Assistant Link */}
      <div className="p-4 border-t border-gray-700">
        <a
          href="/maula-ai"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r from-dlp-accent to-dlp-secondary text-white hover:shadow-glow-purple transition-all"
        >
          <Bot className="w-5 h-5" />
          <span className="font-medium">AI Assistant</span>
        </a>
      </div>
    </nav>
  );
};

export default Navigation;
