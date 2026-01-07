import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radar,
  Shield,
  AlertTriangle,
  Target,
  Activity,
  Globe,
  FileText,
  Settings,
  Sparkles
} from 'lucide-react';

const Navigation: React.FC = () => {
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/scan', icon: Radar, label: 'Threat Scan' },
    { path: '/threats', icon: AlertTriangle, label: 'Active Threats' },
    { path: '/intelligence', icon: Globe, label: 'Threat Intel' },
    { path: '/targets', icon: Target, label: 'Attack Surface' },
    { path: '/monitoring', icon: Activity, label: 'Live Monitoring' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/defense', icon: Shield, label: 'Defense Center' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="w-64 min-h-screen bg-gradient-to-b from-threatradar-darker to-threatradar-dark border-r border-threatradar-primary/20">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-threat-gradient rounded-xl flex items-center justify-center shadow-glow-red animate-pulse-glow">
            <Radar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ThreatRadar</h1>
            <p className="text-xs text-threatradar-accent">Threat Intelligence</p>
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
                      ? 'bg-threat-gradient text-white shadow-glow-red'
                      : 'text-gray-400 hover:text-white hover:bg-threatradar-primary/10'
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
        <div className="mt-8 p-4 bg-gradient-to-br from-threatradar-accent/20 to-threatradar-primary/20 rounded-xl border border-threatradar-accent/30">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-5 h-5 text-threatradar-accent" />
            <h3 className="font-semibold text-white">Maula AI</h3>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            AI-powered threat hunting
          </p>
          <a
            href="/maula-ai"
            className="block w-full text-center py-2 bg-threat-gradient text-white rounded-lg font-medium hover:shadow-lg hover:shadow-threatradar-primary/30 transition-all"
          >
            Open Assistant
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
