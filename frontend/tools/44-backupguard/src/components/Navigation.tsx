import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  HardDrive,
  Calendar,
  ShieldCheck,
  Shield,
  FileCheck2,
  RotateCcw,
  Settings,
  Sparkles
} from 'lucide-react';

const Navigation: React.FC = () => {
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/backups', icon: Database, label: 'Backups' },
    { path: '/storage', icon: HardDrive, label: 'Storage' },
    { path: '/jobs', icon: Calendar, label: 'Jobs' },
    { path: '/integrity', icon: ShieldCheck, label: 'Integrity' },
    { path: '/ransomware', icon: Shield, label: 'Ransomware' },
    { path: '/compliance', icon: FileCheck2, label: 'Compliance' },
    { path: '/recovery', icon: RotateCcw, label: 'Recovery' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="w-64 min-h-screen bg-gradient-to-b from-backupguard-darker to-backupguard-dark border-r border-backupguard-primary/20">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-backup-gradient rounded-xl flex items-center justify-center glow-blue">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">BackupGuard</h1>
            <p className="text-xs text-backupguard-secondary">Enterprise Backup</p>
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
                      ? 'bg-backup-gradient text-white glow-blue'
                      : 'text-gray-400 hover:text-white hover:bg-backupguard-primary/10'
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
        <div className="mt-8 p-4 bg-gradient-to-br from-backupguard-accent/20 to-backupguard-primary/20 rounded-xl border border-backupguard-accent/30">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-5 h-5 text-backupguard-accent" />
            <h3 className="font-semibold text-white">Maula AI</h3>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Your backup security assistant
          </p>
          <a
            href="/maula-ai"
            className="block w-full text-center py-2 bg-backup-gradient text-white rounded-lg font-medium hover:shadow-lg hover:shadow-backupguard-primary/20 transition-all"
          >
            Open Assistant
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
