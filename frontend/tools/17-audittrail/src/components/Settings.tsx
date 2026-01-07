import React, { useState } from 'react';
import { Cog6ToothIcon, ShieldCheckIcon, DatabaseIcon, BellIcon } from '@heroicons/react/24/outline';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    realTimeStreaming: true,
    integrityVerification: true,
    retentionPolicies: true,
    complianceReporting: true,
    securityEvents: true,
    emailNotifications: false,
    slackNotifications: false,
    retentionPeriod: 2555,
    maxConnections: 1000,
    logLevel: 'info',
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // In a real implementation, this would save to backend
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-gray-600">
              Configure AuditTrail system preferences and policies
            </p>
          </div>
          <button
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Cog6ToothIcon className="h-5 w-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Feature Configuration</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[
            { key: 'realTimeStreaming', label: 'Real-time Streaming', description: 'Enable WebSocket streaming for live updates' },
            { key: 'integrityVerification', label: 'Integrity Verification', description: 'Enable cryptographic verification of audit logs' },
            { key: 'retentionPolicies', label: 'Retention Policies', description: 'Automatically manage log retention and deletion' },
            { key: 'complianceReporting', label: 'Compliance Reporting', description: 'Generate automated compliance reports' },
            { key: 'securityEvents', label: 'Security Events', description: 'Monitor and alert on security events' },
          ].map((feature) => (
            <div key={feature.key} className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-900">{feature.label}</label>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  checked={settings[feature.key as keyof typeof settings] as boolean}
                  onChange={(e) => handleSettingChange(feature.key, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <BellIcon className="h-5 w-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Send alerts via email' },
            { key: 'slackNotifications', label: 'Slack Notifications', description: 'Send alerts to Slack channels' },
          ].map((notification) => (
            <div key={notification.key} className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-900">{notification.label}</label>
                <p className="text-sm text-gray-500">{notification.description}</p>
              </div>
              <div className="ml-4">
                <input
                  type="checkbox"
                  checked={settings[notification.key as keyof typeof settings] as boolean}
                  onChange={(e) => handleSettingChange(notification.key, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <DatabaseIcon className="h-5 w-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Data Management</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Default Retention Period (days)</label>
            <input
              type="number"
              value={settings.retentionPeriod}
              onChange={(e) => handleSettingChange('retentionPeriod', parseInt(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              min="1"
              max="10000"
            />
            <p className="mt-1 text-sm text-gray-500">How long to keep audit logs before automatic deletion</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Maximum WebSocket Connections</label>
            <input
              type="number"
              value={settings.maxConnections}
              onChange={(e) => handleSettingChange('maxConnections', parseInt(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              min="1"
              max="10000"
            />
            <p className="mt-1 text-sm text-gray-500">Maximum concurrent real-time connections</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Log Level</label>
            <select
              value={settings.logLevel}
              onChange={(e) => handleSettingChange('logLevel', e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">Minimum log level to record</p>
          </div>
        </div>
      </div>

      {/* Compliance Frameworks */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Compliance Frameworks</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['GDPR', 'HIPAA', 'PCI-DSS', 'SOX', 'ISO-27001', 'NIST'].map((framework) => (
              <div key={framework} className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-900">{framework}</label>
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Select which compliance frameworks to monitor and report on
          </p>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Version Information</h4>
            <dl className="mt-2 space-y-1">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">AuditTrail API:</dt>
                <dd className="text-sm text-gray-900">v2.0.0</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Frontend:</dt>
                <dd className="text-sm text-gray-900">v2.0.0</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">AI Assistant:</dt>
                <dd className="text-sm text-gray-900">v1.0.0</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">ML Engine:</dt>
                <dd className="text-sm text-gray-900">v1.0.0</dd>
              </div>
            </dl>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">System Status</h4>
            <dl className="mt-2 space-y-1">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Database:</dt>
                <dd className="text-sm text-green-600">Connected</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">WebSocket:</dt>
                <dd className="text-sm text-green-600">Active</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">AI Services:</dt>
                <dd className="text-sm text-green-600">Online</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">ML Engine:</dt>
                <dd className="text-sm text-green-600">Running</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;