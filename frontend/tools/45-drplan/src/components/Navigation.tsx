import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  Power,
  TestTube,
  Clock,
  BookOpen,
  TrendingDown,
  Settings,
  Sparkles
} from 'lucide-react';

const Navigation: React.FC = () => {
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/dr-plans', icon: FileText, label: 'DR Plans' },
    { path: '/recovery-strategies', icon: GitBranch, label: 'Strategies' },
    { path: '/failover', icon: Power, label: 'Failover' },
    { path: '/testing', icon: TestTube, label: 'DR Testing' },
    { path: '/rto-rpo', icon: Clock, label: 'RTO/RPO' },
    { path: '/runbooks', icon: BookOpen, label: 'Runbooks' },
    { path: '/impact-analysis', icon: TrendingDown, label: 'Impact Analysis' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="w-64 min-h-screen bg-gradient-to-b from-drplan-darker to-drplan-dark border-r border-drplan-primary/20">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-dr-gradient rounded-xl flex items-center justify-center glow-green">
            <Power className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">DRPlan</h1>
            <p className="text-xs text-drplan-accent">Disaster Recovery</p>
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
                      ? 'bg-dr-gradient text-white glow-green'
                      : 'text-gray-400 hover:text-white hover:bg-drplan-primary/10'
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
        <div className="mt-8 p-4 bg-gradient-to-br from-drplan-accent/20 to-drplan-primary/20 rounded-xl border border-drplan-accent/30">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-5 h-5 text-drplan-accent" />
            <h3 className="font-semibold text-white">Maula AI</h3>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Your DR planning assistant
          </p>
          <a
            href="/maula-ai"
            className="block w-full text-center py-2 bg-dr-gradient text-white rounded-lg font-medium hover:shadow-lg hover:shadow-drplan-primary/20 transition-all"
          >
            Open Assistant
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
