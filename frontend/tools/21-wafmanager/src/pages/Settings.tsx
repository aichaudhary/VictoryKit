import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Globe, 
  Key, 
  Database,
  Webhook,
  Mail,
  Slack,
  Save,
  RefreshCw,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  TestTube,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { getSettings, updateSettings, testIntegration } from '../services/api';

interface IntegrationConfig {
  id: string;
  name: string;
  type: string;
  icon: React.ReactNode;
  connected: boolean;
  apiKey?: string;
  endpoint?: string;
  lastSync?: Date;
}

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved successfully');
    },
    onError: () => {
      toast.error('Failed to save settings');
    },
  });

  // Mock settings
  const [localSettings, setLocalSettings] = useState({
    general: {
      wafMode: 'active',
      logLevel: 'info',
      maxRequestBodySize: 10,
      requestTimeout: 30,
      enableIPv6: true,
      enableHTTP2: true,
    },
    security: {
      defaultAction: 'block',
      sensitivityLevel: 'high',
      enableOWASP: true,
      enableBotProtection: true,
      enableRateLimiting: true,
      rateLimit: 1000,
      rateLimitWindow: 60,
      blockDuration: 3600,
      challengeType: 'captcha',
    },
    notifications: {
      emailEnabled: true,
      emailRecipients: ['security@example.com', 'admin@example.com'],
      slackEnabled: true,
      slackWebhook: 'https://hooks.slack.com/services/xxx/yyy/zzz',
      webhookEnabled: false,
      webhookUrl: '',
      alertThreshold: 'high',
      digestEnabled: true,
      digestFrequency: 'daily',
    },
    integrations: {
      siem: { enabled: true, type: 'splunk', endpoint: 'https://splunk.example.com:8088' },
      threatIntel: { enabled: true, sources: ['abuseipdb', 'virustotal', 'shodan'] },
      cdn: { enabled: true, provider: 'cloudflare', zoneId: 'abc123' },
    },
  });

  const integrations: IntegrationConfig[] = [
    { id: 'cloudflare', name: 'Cloudflare', type: 'CDN/WAF', icon: <Shield className="w-6 h-6" />, connected: true, lastSync: new Date() },
    { id: 'aws-waf', name: 'AWS WAF', type: 'Cloud WAF', icon: <Shield className="w-6 h-6" />, connected: true, lastSync: new Date(Date.now() - 3600000) },
    { id: 'splunk', name: 'Splunk', type: 'SIEM', icon: <Database className="w-6 h-6" />, connected: true, lastSync: new Date() },
    { id: 'abuseipdb', name: 'AbuseIPDB', type: 'Threat Intel', icon: <Globe className="w-6 h-6" />, connected: true, apiKey: 'xxxx-xxxx-xxxx-1234' },
    { id: 'virustotal', name: 'VirusTotal', type: 'Threat Intel', icon: <Shield className="w-6 h-6" />, connected: true, apiKey: 'xxxx-xxxx-xxxx-5678' },
    { id: 'shodan', name: 'Shodan', type: 'Threat Intel', icon: <Globe className="w-6 h-6" />, connected: false },
    { id: 'pagerduty', name: 'PagerDuty', type: 'Alerting', icon: <Bell className="w-6 h-6" />, connected: false },
    { id: 'slack', name: 'Slack', type: 'Notifications', icon: <Slack className="w-6 h-6" />, connected: true, endpoint: 'https://hooks.slack.com/...' },
  ];

  const handleTestIntegration = async (id: string) => {
    setTestingIntegration(id);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`${id} connection successful!`);
    } catch (error) {
      toast.error(`Failed to connect to ${id}`);
    } finally {
      setTestingIntegration(null);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <SettingsIcon className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'integrations', label: 'Integrations', icon: <Webhook className="w-5 h-5" /> },
    { id: 'api', label: 'API Keys', icon: <Key className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-waf-muted mt-1">Configure WAF Manager preferences</p>
        </div>
        <button
          onClick={() => updateMutation.mutate(localSettings)}
          disabled={updateMutation.isPending}
          className="waf-btn-primary"
        >
          {updateMutation.isPending ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-64">
          <nav className="waf-card p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                  activeTab === tab.id
                    ? 'bg-waf-primary text-white'
                    : 'text-waf-muted hover:text-white hover:bg-waf-dark'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* General Settings */}
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="waf-card">
                <h2 className="text-lg font-semibold text-white mb-4">WAF Mode</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'active', label: 'Active', description: 'Block threats in real-time' },
                    { value: 'monitor', label: 'Monitor', description: 'Log only, do not block' },
                    { value: 'off', label: 'Off', description: 'Disable WAF protection' },
                  ].map((mode) => (
                    <label
                      key={mode.value}
                      className={clsx(
                        'p-4 border rounded-lg cursor-pointer transition-all',
                        localSettings.general.wafMode === mode.value
                          ? 'border-waf-primary bg-waf-primary/10'
                          : 'border-waf-border hover:border-waf-primary/50'
                      )}
                    >
                      <input
                        type="radio"
                        name="wafMode"
                        value={mode.value}
                        checked={localSettings.general.wafMode === mode.value}
                        onChange={(e) => setLocalSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, wafMode: e.target.value }
                        }))}
                        className="sr-only"
                      />
                      <p className="font-medium text-white">{mode.label}</p>
                      <p className="text-sm text-waf-muted mt-1">{mode.description}</p>
                    </label>
                  ))}
                </div>
              </div>

              <div className="waf-card">
                <h2 className="text-lg font-semibold text-white mb-4">Request Handling</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-waf-muted mb-2 block">Max Request Body Size (MB)</label>
                    <input
                      type="number"
                      value={localSettings.general.maxRequestBodySize}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, maxRequestBodySize: parseInt(e.target.value) }
                      }))}
                      className="waf-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-waf-muted mb-2 block">Request Timeout (seconds)</label>
                    <input
                      type="number"
                      value={localSettings.general.requestTimeout}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, requestTimeout: parseInt(e.target.value) }
                      }))}
                      className="waf-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-waf-muted mb-2 block">Log Level</label>
                    <select
                      value={localSettings.general.logLevel}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, logLevel: e.target.value }
                      }))}
                      className="waf-select"
                    >
                      <option value="debug">Debug</option>
                      <option value="info">Info</option>
                      <option value="warn">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.general.enableIPv6}
                        onChange={(e) => setLocalSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, enableIPv6: e.target.checked }
                        }))}
                        className="waf-checkbox"
                      />
                      <span className="text-white">Enable IPv6 Support</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.general.enableHTTP2}
                        onChange={(e) => setLocalSettings(prev => ({
                          ...prev,
                          general: { ...prev.general, enableHTTP2: e.target.checked }
                        }))}
                        className="waf-checkbox"
                      />
                      <span className="text-white">Enable HTTP/2</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="waf-card">
                <h2 className="text-lg font-semibold text-white mb-4">Protection Settings</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-waf-muted mb-2 block">Default Action</label>
                      <select
                        value={localSettings.security.defaultAction}
                        onChange={(e) => setLocalSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, defaultAction: e.target.value }
                        }))}
                        className="waf-select"
                      >
                        <option value="block">Block</option>
                        <option value="challenge">Challenge</option>
                        <option value="log">Log Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-waf-muted mb-2 block">Sensitivity Level</label>
                      <select
                        value={localSettings.security.sensitivityLevel}
                        onChange={(e) => setLocalSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, sensitivityLevel: e.target.value }
                        }))}
                        className="waf-select"
                      >
                        <option value="low">Low (Less false positives)</option>
                        <option value="medium">Medium (Balanced)</option>
                        <option value="high">High (Maximum protection)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center gap-3 p-4 bg-waf-dark rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.security.enableOWASP}
                        onChange={(e) => setLocalSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, enableOWASP: e.target.checked }
                        }))}
                        className="waf-checkbox"
                      />
                      <div>
                        <p className="text-white font-medium">OWASP Core Rule Set</p>
                        <p className="text-xs text-waf-muted">Industry standard protection</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-waf-dark rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.security.enableBotProtection}
                        onChange={(e) => setLocalSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, enableBotProtection: e.target.checked }
                        }))}
                        className="waf-checkbox"
                      />
                      <div>
                        <p className="text-white font-medium">Bot Protection</p>
                        <p className="text-xs text-waf-muted">Detect malicious bots</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-waf-dark rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.security.enableRateLimiting}
                        onChange={(e) => setLocalSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, enableRateLimiting: e.target.checked }
                        }))}
                        className="waf-checkbox"
                      />
                      <div>
                        <p className="text-white font-medium">Rate Limiting</p>
                        <p className="text-xs text-waf-muted">Prevent DDoS attacks</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="waf-card">
                <h2 className="text-lg font-semibold text-white mb-4">Rate Limiting Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm text-waf-muted mb-2 block">Max Requests</label>
                    <input
                      type="number"
                      value={localSettings.security.rateLimit}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, rateLimit: parseInt(e.target.value) }
                      }))}
                      className="waf-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-waf-muted mb-2 block">Time Window (seconds)</label>
                    <input
                      type="number"
                      value={localSettings.security.rateLimitWindow}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, rateLimitWindow: parseInt(e.target.value) }
                      }))}
                      className="waf-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-waf-muted mb-2 block">Block Duration (seconds)</label>
                    <input
                      type="number"
                      value={localSettings.security.blockDuration}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, blockDuration: parseInt(e.target.value) }
                      }))}
                      className="waf-input"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="waf-card">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-waf-primary" />
                  Email Notifications
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={localSettings.notifications.emailEnabled}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, emailEnabled: e.target.checked }
                      }))}
                      className="waf-checkbox"
                    />
                    <span className="text-white">Enable email alerts</span>
                  </label>
                  <div>
                    <label className="text-sm text-waf-muted mb-2 block">Recipients (one per line)</label>
                    <textarea
                      value={localSettings.notifications.emailRecipients.join('\n')}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        notifications: { 
                          ...prev.notifications, 
                          emailRecipients: e.target.value.split('\n').filter(Boolean)
                        }
                      }))}
                      rows={3}
                      className="waf-input font-mono text-sm resize-none"
                      placeholder="security@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="waf-card">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Slack className="w-5 h-5 text-waf-primary" />
                  Slack Integration
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={localSettings.notifications.slackEnabled}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, slackEnabled: e.target.checked }
                      }))}
                      className="waf-checkbox"
                    />
                    <span className="text-white">Enable Slack notifications</span>
                  </label>
                  <div>
                    <label className="text-sm text-waf-muted mb-2 block">Webhook URL</label>
                    <input
                      type="url"
                      value={localSettings.notifications.slackWebhook}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, slackWebhook: e.target.value }
                      }))}
                      className="waf-input font-mono text-sm"
                      placeholder="https://hooks.slack.com/services/..."
                    />
                  </div>
                </div>
              </div>

              <div className="waf-card">
                <h2 className="text-lg font-semibold text-white mb-4">Alert Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-waf-muted mb-2 block">Alert Threshold</label>
                    <select
                      value={localSettings.notifications.alertThreshold}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, alertThreshold: e.target.value }
                      }))}
                      className="waf-select"
                    >
                      <option value="critical">Critical Only</option>
                      <option value="high">High and above</option>
                      <option value="medium">Medium and above</option>
                      <option value="all">All alerts</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-waf-muted mb-2 block">Daily Digest</label>
                    <select
                      value={localSettings.notifications.digestFrequency}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, digestFrequency: e.target.value }
                      }))}
                      className="waf-select"
                    >
                      <option value="disabled">Disabled</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Integrations */}
          {activeTab === 'integrations' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="waf-card"
            >
              <h2 className="text-lg font-semibold text-white mb-4">Connected Services</h2>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div
                    key={integration.id}
                    className={clsx(
                      'flex items-center gap-4 p-4 rounded-lg border',
                      integration.connected ? 'border-threat-low/30 bg-threat-low/5' : 'border-waf-border'
                    )}
                  >
                    <div className={clsx(
                      'w-12 h-12 rounded-lg flex items-center justify-center',
                      integration.connected ? 'bg-threat-low/20 text-threat-low' : 'bg-waf-dark text-waf-muted'
                    )}>
                      {integration.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{integration.name}</h3>
                        {integration.connected && <Check className="w-4 h-4 text-threat-low" />}
                      </div>
                      <p className="text-sm text-waf-muted">{integration.type}</p>
                      {integration.lastSync && (
                        <p className="text-xs text-waf-muted mt-1">
                          Last sync: {new Date(integration.lastSync).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {integration.connected ? (
                        <>
                          <button
                            onClick={() => handleTestIntegration(integration.id)}
                            disabled={testingIntegration === integration.id}
                            className="waf-btn-secondary text-sm"
                          >
                            {testingIntegration === integration.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <TestTube className="w-4 h-4" />
                            )}
                            Test
                          </button>
                          <button className="p-2 text-waf-muted hover:text-white hover:bg-waf-dark rounded-lg">
                            <SettingsIcon className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button className="waf-btn-primary text-sm">
                          <Plus className="w-4 h-4" />
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* API Keys */}
          {activeTab === 'api' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="waf-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">API Keys</h2>
                  <button className="waf-btn-primary text-sm">
                    <Plus className="w-4 h-4" />
                    Generate New Key
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { id: '1', name: 'Production API Key', key: 'waf_live_xxxxxxxxxxxxxxxxxxxx', created: new Date(Date.now() - 86400000 * 30), lastUsed: new Date() },
                    { id: '2', name: 'Development Key', key: 'waf_test_yyyyyyyyyyyyyyyyyyyy', created: new Date(Date.now() - 86400000 * 7), lastUsed: new Date(Date.now() - 3600000) },
                  ].map((apiKey) => (
                    <div key={apiKey.id} className="p-4 bg-waf-dark rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-white">{apiKey.name}</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowApiKeys(prev => ({ ...prev, [apiKey.id]: !prev[apiKey.id] }))}
                            className="p-1 text-waf-muted hover:text-white"
                          >
                            {showApiKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button className="p-1 text-waf-muted hover:text-threat-critical">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <code className="text-sm font-mono text-waf-muted">
                        {showApiKeys[apiKey.id] ? apiKey.key : '•'.repeat(32)}
                      </code>
                      <div className="flex items-center gap-4 mt-2 text-xs text-waf-muted">
                        <span>Created: {apiKey.created.toLocaleDateString()}</span>
                        <span>Last used: {apiKey.lastUsed.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="waf-card">
                <h2 className="text-lg font-semibold text-white mb-4">Webhook Endpoints</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-sm text-waf-muted mb-2 block">Webhook URL</label>
                      <input
                        type="url"
                        placeholder="https://your-server.com/webhook"
                        className="waf-input font-mono text-sm"
                      />
                    </div>
                    <button className="waf-btn-secondary mt-6">
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
