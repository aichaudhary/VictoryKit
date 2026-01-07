import { useState } from 'react';
import {
  Settings,
  Building2,
  Globe,
  Bell,
  Shield,
  Sparkles,
  Mail,
  Clock,
  Save,
  RotateCcw,
  Key,
  Link,
  Database,
  AlertTriangle,
} from 'lucide-react';
import type { RiskScoreSettings, Industry, OrganizationSize } from '../types';
import { INDUSTRIES, DEFAULT_SETTINGS } from '../constants';

export function SettingsPanel() {
  const [settings, setSettings] = useState<RiskScoreSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'integrations' | 'ai'>('general');

  const handleSave = () => {
    // API call would go here
    console.log('Saving settings:', settings);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Link },
    { id: 'ai', label: 'AI Settings', icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-amber-500" />
            Settings
          </h1>
          <p className="text-gray-400 mt-1">Configure your RiskScoreAI preferences</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setSettings(DEFAULT_SETTINGS)}
            className="flex items-center gap-2 px-4 py-2 border border-[#2A2A2F] rounded-lg text-gray-400 hover:text-white hover:bg-[#252529] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-amber-500/20 text-amber-500'
                : 'text-gray-400 hover:text-white hover:bg-[#252529]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-6">
        {activeTab === 'general' && (
          <GeneralSettings settings={settings} setSettings={setSettings} />
        )}
        {activeTab === 'notifications' && (
          <NotificationSettings settings={settings} setSettings={setSettings} />
        )}
        {activeTab === 'integrations' && <IntegrationSettings />}
        {activeTab === 'ai' && (
          <AISettings settings={settings} setSettings={setSettings} />
        )}
      </div>
    </div>
  );
}

function GeneralSettings({
  settings,
  setSettings,
}: {
  settings: RiskScoreSettings;
  setSettings: React.Dispatch<React.SetStateAction<RiskScoreSettings>>;
}) {
  const sizes: { value: OrganizationSize; label: string }[] = [
    { value: 'small', label: 'Small (1-50 employees)' },
    { value: 'medium', label: 'Medium (51-500 employees)' },
    { value: 'large', label: 'Large (501-5000 employees)' },
    { value: 'enterprise', label: 'Enterprise (5000+ employees)' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Building2 className="w-5 h-5 text-amber-500" />
        Organization Settings
      </h3>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-400 text-sm mb-2">Organization Name</label>
          <input
            type="text"
            value={settings.organization_name}
            onChange={(e) => setSettings({ ...settings, organization_name: e.target.value })}
            placeholder="Enter organization name"
            className="w-full bg-[#252529] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">Primary Domain</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={settings.primary_domain}
              onChange={(e) => setSettings({ ...settings, primary_domain: e.target.value })}
              placeholder="example.com"
              className="w-full bg-[#252529] border border-[#2A2A2F] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">Industry</label>
          <select
            value={settings.industry}
            onChange={(e) => setSettings({ ...settings, industry: e.target.value as Industry })}
            className="w-full bg-[#252529] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            {INDUSTRIES.map((ind) => (
              <option key={ind.value} value={ind.value}>
                {ind.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">Organization Size</label>
          <select
            value={settings.organization_size}
            onChange={(e) => setSettings({ ...settings, organization_size: e.target.value as OrganizationSize })}
            className="w-full bg-[#252529] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            {sizes.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">Annual Revenue (for risk quantification)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={settings.annual_revenue || ''}
              onChange={(e) => setSettings({ ...settings, annual_revenue: parseInt(e.target.value) || undefined })}
              placeholder="50000000"
              className="w-full bg-[#252529] border border-[#2A2A2F] rounded-lg pl-8 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">Scan Frequency</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <select
              value={settings.scan_frequency}
              onChange={(e) => setSettings({ ...settings, scan_frequency: e.target.value as 'daily' | 'weekly' | 'monthly' })}
              className="w-full bg-[#252529] border border-[#2A2A2F] rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings({
  settings,
  setSettings,
}: {
  settings: RiskScoreSettings;
  setSettings: React.Dispatch<React.SetStateAction<RiskScoreSettings>>;
}) {
  const [newEmail, setNewEmail] = useState('');

  const addEmail = () => {
    if (newEmail && !settings.email_recipients.includes(newEmail)) {
      setSettings({
        ...settings,
        email_recipients: [...settings.email_recipients, newEmail],
      });
      setNewEmail('');
    }
  };

  const removeEmail = (email: string) => {
    setSettings({
      ...settings,
      email_recipients: settings.email_recipients.filter((e) => e !== email),
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Bell className="w-5 h-5 text-amber-500" />
        Notification Settings
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-[#252529] rounded-lg">
          <div>
            <p className="text-white font-medium">Enable Notifications</p>
            <p className="text-gray-500 text-sm">Receive alerts for score changes and new findings</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, notifications_enabled: !settings.notifications_enabled })}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.notifications_enabled ? 'bg-amber-500' : 'bg-[#2A2A2F]'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.notifications_enabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">Alert Threshold</label>
          <p className="text-gray-500 text-sm mb-3">
            Receive alerts when score drops below this value
          </p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.alert_threshold}
              onChange={(e) => setSettings({ ...settings, alert_threshold: parseInt(e.target.value) })}
              className="flex-1 accent-amber-500"
            />
            <span className="text-white font-medium w-12">{settings.alert_threshold}</span>
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">Email Recipients</label>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-[#252529] border border-[#2A2A2F] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                onKeyPress={(e) => e.key === 'Enter' && addEmail()}
              />
            </div>
            <button
              onClick={addEmail}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.email_recipients.map((email) => (
              <span
                key={email}
                className="flex items-center gap-2 px-3 py-1 bg-[#252529] rounded-full text-gray-300"
              >
                {email}
                <button
                  onClick={() => removeEmail(email)}
                  className="text-gray-500 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationSettings() {
  const integrations = [
    { id: 'slack', name: 'Slack', description: 'Send alerts to Slack channels', connected: true },
    { id: 'teams', name: 'Microsoft Teams', description: 'Send alerts to Teams channels', connected: false },
    { id: 'jira', name: 'Jira', description: 'Create tickets for findings', connected: true },
    { id: 'servicenow', name: 'ServiceNow', description: 'Sync with ITSM workflows', connected: false },
    { id: 'splunk', name: 'Splunk', description: 'Export data to Splunk SIEM', connected: false },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Link className="w-5 h-5 text-amber-500" />
        Integrations
      </h3>

      <div className="space-y-3">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="flex items-center justify-between p-4 bg-[#252529] rounded-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#2A2A2F] rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-white font-medium">{integration.name}</p>
                <p className="text-gray-500 text-sm">{integration.description}</p>
              </div>
            </div>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                integration.connected
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'border border-[#2A2A2F] text-gray-400 hover:text-white hover:bg-[#2A2A2F]'
              }`}
            >
              {integration.connected ? 'Connected' : 'Connect'}
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
        <Key className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-500 font-medium">API Access</p>
          <p className="text-gray-400 text-sm mt-1">
            Access the RiskScoreAI API to integrate with your custom workflows.
          </p>
          <button className="mt-2 text-amber-500 hover:text-amber-400 text-sm font-medium">
            Generate API Key →
          </button>
        </div>
      </div>
    </div>
  );
}

function AISettings({
  settings,
  setSettings,
}: {
  settings: RiskScoreSettings;
  setSettings: React.Dispatch<React.SetStateAction<RiskScoreSettings>>;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-500" />
        AI Settings
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-[#252529] rounded-lg">
          <div>
            <p className="text-white font-medium">AI Recommendations</p>
            <p className="text-gray-500 text-sm">Get AI-powered remediation suggestions</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, ai_recommendations: !settings.ai_recommendations })}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.ai_recommendations ? 'bg-amber-500' : 'bg-[#2A2A2F]'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.ai_recommendations ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#252529] rounded-lg">
          <div>
            <p className="text-white font-medium">Auto-Remediation</p>
            <p className="text-gray-500 text-sm">Automatically create remediation tickets for critical findings</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, auto_remediation: !settings.auto_remediation })}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.auto_remediation ? 'bg-amber-500' : 'bg-[#2A2A2F]'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                settings.auto_remediation ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div className="p-4 bg-[#252529] rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-amber-500" />
            <p className="text-white font-medium">AI Model</p>
          </div>
          <p className="text-gray-400 text-sm mb-3">
            RiskScoreAI uses advanced machine learning models trained on millions of security data points
            to provide accurate risk scoring and intelligent recommendations.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">Model: v3.2</span>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Last updated: 2024-03-01</span>
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-500 font-medium">Privacy Notice</p>
            <p className="text-gray-400 text-sm mt-1">
              AI analysis is performed on our secure servers. Your data is encrypted and never used for 
              training without explicit consent. Review our privacy policy for more details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
