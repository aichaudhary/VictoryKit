import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  Target,
  AlertTriangle,
  FileText,
  Settings,
  Activity,
  Network,
  Database,
  Sparkles
} from 'lucide-react';

const Navigation: React.FC = () => {
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/scan', icon: Target, label: 'Vulnerability Scan' },
    { path: '/network', icon: Network, label: 'Network Scan' },
    { path: '/vulnerabilities', icon: AlertTriangle, label: 'Vulnerabilities' },
    { path: '/assets', icon: Database, label: 'Asset Management' },
    { path: '/compliance', icon: Shield, label: 'Compliance' },
    { path: '/live', icon: Activity, label: 'Live Monitoring' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="w-64 min-h-screen bg-gradient-to-b from-vuln-darker to-vuln-dark border-r border-vuln-primary/20">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-vuln-gradient rounded-xl flex items-center justify-center shadow-glow-blue animate-glow">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">VulnScan</h1>
            <p className="text-xs text-vuln-accent">Security Scanner</p>
          </div>
        </div>

        {/* Navigation Links */}
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-vuln-gradient text-white shadow-glow-blue'
                      : 'text-gray-400 hover:text-white hover:bg-vuln-primary/10'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* AI Assistant */}
        <div className="mt-8 p-4 bg-gradient-to-br from-vuln-accent/20 to-vuln-primary/20 rounded-xl border border-vuln-accent/30">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-5 h-5 text-vuln-accent" />
            <h3 className="font-semibold text-white">Maula AI</h3>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            AI vulnerability analysis assistant
          </p>
          <a
            href="/maula-ai"
            className="block w-full text-center py-2 bg-vuln-gradient text-white rounded-lg font-medium hover:shadow-lg hover:shadow-vuln-primary/30 transition-all"
          >
            Open Assistant
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
