import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Mail,
  Shield,
  Link2,
  AlertTriangle,
  FileText,
  Settings,
  Database,
  Activity,
  Sparkles
} from 'lucide-react';

const Navigation: React.FC = () => {
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/analyze', icon: Mail, label: 'Email Analysis' },
    { path: '/url-scanner', icon: Link2, label: 'URL Scanner' },
    { path: '/detections', icon: AlertTriangle, label: 'Detections' },
    { path: '/quarantine', icon: Shield, label: 'Quarantine' },
    { path: '/campaigns', icon: Database, label: 'Campaigns' },
    { path: '/live', icon: Activity, label: 'Live Monitor' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="w-64 min-h-screen bg-gradient-to-b from-phish-darker to-phish-dark border-r border-phish-primary/20">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-phish-gradient rounded-xl flex items-center justify-center shadow-glow-orange animate-glow">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">PhishGuard</h1>
            <p className="text-xs text-phish-accent">Email Security AI</p>
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
                      ? 'bg-phish-gradient text-white shadow-glow-orange'
                      : 'text-gray-400 hover:text-white hover:bg-phish-primary/10'
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
        <div className="mt-8 p-4 bg-gradient-to-br from-phish-accent/20 to-phish-primary/20 rounded-xl border border-phish-accent/30">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-5 h-5 text-phish-accent" />
            <h3 className="font-semibold text-white">Maula AI</h3>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            AI phishing detection assistant
          </p>
          <a
            href="/maula-ai"
            className="block w-full text-center py-2 bg-phish-gradient text-white rounded-lg font-medium hover:shadow-lg hover:shadow-phish-primary/30 transition-all"
          >
            Open Assistant
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
