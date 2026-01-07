import React, { useState } from 'react';
import {
  Save, RefreshCw, User, Bell, Shield, Database, Palette,
  Globe, Clock, Key, Mail, Slack, Monitor, ChevronRight
} from 'lucide-react';
import type { Settings } from '../types';
import { DEFAULT_SETTINGS, THEME } from '../constants';

const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', name: 'General', icon: Monitor },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'integrations', name: 'Integrations', icon: Database },
    { id: 'appearance', name: 'Appearance', icon: Palette },
  ];

  const updateSettings = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar */}
      <div className="w-64 bg-[#1E293B] rounded-xl border border-[#334155] p-4">
        <h2 className="text-lg font-semibold text-white mb-4">Settings</h2>
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-gray-400 hover:bg-[#334155] hover:text-white'
              }`}
            >
              <section.icon className="w-5 h-5" />
              <span>{section.name}</span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white capitalize">{activeSection} Settings</h1>
            <p className="text-gray-400 text-sm mt-1">Configure your SIEMCommander preferences</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>

        {/* General Settings */}
        {activeSection === 'general' && (
          <div className="space-y-6">
            <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6 space-y-6">
              <h3 className="text-lg font-semibold text-white">Display Preferences</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateSettings('timezone', e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Date Format</label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => updateSettings('dateFormat', e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Default Time Range</label>
                <select
                  value={settings.defaultTimeRange}
                  onChange={(e) => updateSettings('defaultTimeRange', e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="15m">Last 15 minutes</option>
                  <option value="1h">Last 1 hour</option>
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                </select>
              </div>
            </div>

            <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6 space-y-6">
              <h3 className="text-lg font-semibold text-white">Dashboard Settings</h3>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Refresh Interval</label>
                <select
                  value={settings.refreshInterval}
                  onChange={(e) => updateSettings('refreshInterval', parseInt(e.target.value))}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500"
                >
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                  <option value={0}>Manual only</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Auto-refresh enabled</p>
                  <p className="text-gray-400 text-sm">Automatically refresh dashboard data</p>
                </div>
                <button
                  onClick={() => updateSettings('autoRefresh', !settings.autoRefresh)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.autoRefresh ? 'bg-violet-600' : 'bg-[#334155]'
                  }`}
                >
                  <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.autoRefresh ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeSection === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6 space-y-6">
              <h3 className="text-lg font-semibold text-white">Alert Notifications</h3>
              
              {[
                { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive critical alerts via email', icon: Mail },
                { key: 'slackAlerts', label: 'Slack Notifications', desc: 'Send alerts to Slack channels', icon: Slack },
                { key: 'soundEnabled', label: 'Sound Alerts', desc: 'Play sound for new critical alerts', icon: Bell },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#0F172A] rounded-lg">
                      <item.icon className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateSettings(item.key as keyof Settings, !settings[item.key as keyof Settings])}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings[item.key as keyof Settings] ? 'bg-violet-600' : 'bg-[#334155]'
                    }`}
                  >
                    <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      settings[item.key as keyof Settings] ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6 space-y-6">
              <h3 className="text-lg font-semibold text-white">Notification Thresholds</h3>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Minimum Severity for Notifications</label>
                <select className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500">
                  <option value="critical">Critical only</option>
                  <option value="high">High and above</option>
                  <option value="medium">Medium and above</option>
                  <option value="all">All severities</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeSection === 'security' && (
          <div className="space-y-6">
            <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6 space-y-6">
              <h3 className="text-lg font-semibold text-white">Authentication</h3>
              
              <div className="flex items-center justify-between p-4 bg-[#0F172A] rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-violet-400" />
                  <div>
                    <p className="text-white font-medium">Two-Factor Authentication</p>
                    <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm">
                  Enable 2FA
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0F172A] rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-violet-400" />
                  <div>
                    <p className="text-white font-medium">Session Timeout</p>
                    <p className="text-gray-400 text-sm">Auto-logout after inactivity</p>
                  </div>
                </div>
                <select className="bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none">
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="240">4 hours</option>
                </select>
              </div>
            </div>

            <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6 space-y-6">
              <h3 className="text-lg font-semibold text-white">API Access</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">API Key</p>
                  <p className="text-gray-400 text-sm">For programmatic access</p>
                </div>
                <button className="px-4 py-2 bg-[#334155] text-gray-300 rounded-lg hover:bg-[#475569] transition-colors text-sm">
                  Generate New Key
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Integrations */}
        {activeSection === 'integrations' && (
          <div className="space-y-6">
            <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Connected Services</h3>
              
              {[
                { name: 'Slack', status: 'connected', icon: Slack },
                { name: 'Microsoft Teams', status: 'disconnected', icon: Monitor },
                { name: 'PagerDuty', status: 'connected', icon: Bell },
                { name: 'ServiceNow', status: 'disconnected', icon: Database },
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#0F172A] rounded-lg">
                  <div className="flex items-center gap-3">
                    <service.icon className="w-5 h-5 text-violet-400" />
                    <span className="text-white">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${
                      service.status === 'connected' ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {service.status}
                    </span>
                    <button className="px-3 py-1.5 bg-[#334155] text-gray-300 rounded-lg hover:bg-[#475569] transition-colors text-sm">
                      {service.status === 'connected' ? 'Configure' : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appearance */}
        {activeSection === 'appearance' && (
          <div className="space-y-6">
            <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-6 space-y-6">
              <h3 className="text-lg font-semibold text-white">Theme</h3>
              
              <div className="grid grid-cols-3 gap-4">
                {['Dark', 'Light', 'System'].map((theme) => (
                  <button
                    key={theme}
                    className={`p-4 rounded-lg border transition-colors ${
                      theme === 'Dark' 
                        ? 'border-violet-500 bg-violet-500/10' 
                        : 'border-[#334155] hover:border-violet-500'
                    }`}
                  >
                    <span className="text-white">{theme}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-3">Accent Color</label>
                <div className="flex gap-3">
                  {['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'].map((color) => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-lg border-2 transition-transform hover:scale-110 ${
                        color === THEME.primary ? 'border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
