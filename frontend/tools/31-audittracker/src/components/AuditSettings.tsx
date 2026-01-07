import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Database, Clock, Bell, Shield, Download,
  Save, AlertTriangle, Eye, EyeOff, Plus, Trash2, RefreshCw, Check
} from 'lucide-react';

const AuditSettings: React.FC = () => {
  const [retentionDays, setRetentionDays] = useState(365);
  const [alertThreshold, setAlertThreshold] = useState('error');
  const [autoExport, setAutoExport] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [realTimeAlerts, setRealTimeAlerts] = useState(true);
  const [sensitiveDataMasking, setSensitiveDataMasking] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportFormats = [
    { id: 'json', name: 'JSON', enabled: true },
    { id: 'csv', name: 'CSV', enabled: true },
    { id: 'pdf', name: 'PDF', enabled: false },
    { id: 'syslog', name: 'Syslog', enabled: true },
  ];

  const alertRecipients = [
    { email: 'security-team@company.com', severity: 'all' },
    { email: 'admin@company.com', severity: 'critical' },
    { email: 'compliance@company.com', severity: 'warning' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Settings</h1>
          <p className="text-gray-400 mt-1">Configure audit logging and retention policies</p>
        </div>
        <button 
          onClick={handleSave}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-2"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention Settings */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold">Retention Policy</h2>
              <p className="text-sm text-gray-400">Configure log storage duration</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Retention Period</label>
              <select
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500"
              >
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={180}>180 days</option>
                <option value={365}>1 year</option>
                <option value={730}>2 years</option>
                <option value={1095}>3 years</option>
                <option value={2555}>7 years (Compliance)</option>
              </select>
            </div>
            
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage Used</span>
                <span className="text-sm font-medium">124.5 GB / 500 GB</span>
              </div>
              <div className="h-2 bg-gray-600 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-teal-500" style={{ width: '24.9%' }} />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Auto-Archive</p>
                  <p className="text-xs text-gray-400">Archive logs older than retention period</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="font-semibold">Notifications</h2>
              <p className="text-sm text-gray-400">Configure alert channels</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Alert Threshold</label>
              <select
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500"
              >
                <option value="all">All Events</option>
                <option value="info">Info and above</option>
                <option value="warning">Warning and above</option>
                <option value="error">Error and above</option>
                <option value="critical">Critical only</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-sm">Email Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm">Slack Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={slackNotifications}
                    onChange={(e) => setSlackNotifications(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-sm">Real-time Alerts</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={realTimeAlerts}
                    onChange={(e) => setRealTimeAlerts(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="font-semibold">Security</h2>
              <p className="text-sm text-gray-400">Data protection settings</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                {sensitiveDataMasking ? 
                  <EyeOff className="w-5 h-5 text-gray-400" /> : 
                  <Eye className="w-5 h-5 text-gray-400" />
                }
                <div>
                  <p className="text-sm font-medium">Sensitive Data Masking</p>
                  <p className="text-xs text-gray-400">Mask PII and sensitive fields in logs</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={sensitiveDataMasking}
                  onChange={(e) => setSensitiveDataMasking(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
            
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-400">Compliance Note</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Ensure retention settings comply with your regulatory requirements 
                    (SOC 2, HIPAA, GDPR, PCI DSS).
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Encryption</label>
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-400">AES-256 Encryption Enabled</p>
                  <p className="text-xs text-gray-400">All logs are encrypted at rest</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Settings */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="font-semibold">Export Configuration</h2>
              <p className="text-sm text-gray-400">Configure log export options</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Automatic Export</p>
                <p className="text-xs text-gray-400">Export logs daily to external storage</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={autoExport}
                  onChange={(e) => setAutoExport(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Export Formats</label>
              <div className="grid grid-cols-2 gap-2">
                {exportFormats.map(format => (
                  <label 
                    key={format.id}
                    className={`flex items-center justify-center gap-2 p-2 rounded-lg border cursor-pointer ${
                      format.enabled 
                        ? 'bg-teal-500/20 border-teal-500' 
                        : 'bg-gray-700/50 border-gray-600'
                    }`}
                  >
                    <input type="checkbox" className="sr-only" defaultChecked={format.enabled} />
                    <span className="text-sm">{format.name}</span>
                    {format.enabled && <Check className="w-4 h-4 text-teal-400" />}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Export Destination</label>
              <input
                type="text"
                placeholder="s3://bucket-name/audit-logs/"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500 font-mono text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alert Recipients */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold">Alert Recipients</h2>
              <p className="text-sm text-gray-400">Configure notification recipients</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Add Recipient
          </button>
        </div>
        
        <div className="space-y-3">
          {alertRecipients.map((recipient, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">{recipient.email.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-medium">{recipient.email}</p>
                  <p className="text-xs text-gray-400">
                    Receives: {recipient.severity === 'all' ? 'All alerts' : `${recipient.severity} and above`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-1 text-sm">
                  <option value="all">All</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning+</option>
                </select>
                <button className="p-2 hover:bg-gray-600 rounded-lg text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuditSettings;
