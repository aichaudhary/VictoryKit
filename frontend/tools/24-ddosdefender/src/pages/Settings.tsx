import React, { useState, useEffect } from 'react';
import './Settings.css';

interface SettingsData {
  general: {
    systemName: string;
    adminEmail: string;
    timezone: string;
    maintenanceMode: boolean;
  };
  apiIntegrations: {
    cloudflare: {
      enabled: boolean;
      apiKey: string;
      zoneId: string;
    };
    akamai: {
      enabled: boolean;
      apiKey: string;
      clientSecret: string;
    };
    awsShield: {
      enabled: boolean;
      accessKey: string;
      secretKey: string;
      region: string;
    };
    azureDdos: {
      enabled: boolean;
      subscriptionId: string;
      clientId: string;
      clientSecret: string;
      tenantId: string;
    };
    imperva: {
      enabled: boolean;
      apiKey: string;
      accountId: string;
    };
    fastly: {
      enabled: boolean;
      apiKey: string;
      serviceId: string;
    };
  };
  monitoring: {
    maxMind: {
      enabled: boolean;
      licenseKey: string;
    };
    ipInfo: {
      enabled: boolean;
      apiKey: string;
    };
    shodan: {
      enabled: boolean;
      apiKey: string;
    };
    greyNoise: {
      enabled: boolean;
      apiKey: string;
    };
  };
  notifications: {
    email: {
      enabled: boolean;
      smtpHost: string;
      smtpPort: number;
      smtpUser: string;
      smtpPass: string;
    };
    slack: {
      enabled: boolean;
      webhookUrl: string;
    };
    webhook: {
      enabled: boolean;
      url: string;
    };
  };
  security: {
    rateLimit: {
      enabled: boolean;
      requestsPerMinute: number;
      burstLimit: number;
    };
    ipWhitelist: string[];
    ipBlacklist: string[];
  };
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        // Load default settings if none exist
        setSettings(getDefaultSettings());
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSettings = (): SettingsData => ({
    general: {
      systemName: 'DDoSDefender Protection Platform',
      adminEmail: 'admin@ddosdefender.com',
      timezone: 'UTC',
      maintenanceMode: false,
    },
    apiIntegrations: {
      cloudflare: { enabled: false, apiKey: '', zoneId: '' },
      akamai: { enabled: false, apiKey: '', clientSecret: '' },
      awsShield: { enabled: false, accessKey: '', secretKey: '', region: 'us-east-1' },
      azureDdos: { enabled: false, subscriptionId: '', clientId: '', clientSecret: '', tenantId: '' },
      imperva: { enabled: false, apiKey: '', accountId: '' },
      fastly: { enabled: false, apiKey: '', serviceId: '' },
    },
    monitoring: {
      maxMind: { enabled: false, licenseKey: '' },
      ipInfo: { enabled: false, apiKey: '' },
      shodan: { enabled: false, apiKey: '' },
      greyNoise: { enabled: false, apiKey: '' },
    },
    notifications: {
      email: { enabled: false, smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '' },
      slack: { enabled: false, webhookUrl: '' },
      webhook: { enabled: false, url: '' },
    },
    security: {
      rateLimit: { enabled: true, requestsPerMinute: 1000, burstLimit: 2000 },
      ipWhitelist: [],
      ipBlacklist: [],
    },
  });

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const testIntegration = async (provider: string) => {
    try {
      const response = await fetch(`/api/settings/test/${provider}`, {
        method: 'POST',
      });

      const result = await response.json();
      setTestResults(prev => ({
        ...prev,
        [provider]: result.success,
      }));

      if (result.success) {
        alert(`${provider} integration test passed!`);
      } else {
        alert(`${provider} integration test failed: ${result.error}`);
      }
    } catch (error) {
      console.error(`Failed to test ${provider}:`, error);
      setTestResults(prev => ({
        ...prev,
        [provider]: false,
      }));
      alert(`Failed to test ${provider} integration.`);
    }
  };

  const updateSetting = (path: string, value: any) => {
    if (!settings) return;

    const keys = path.split('.');
    const updatedSettings = { ...settings };

    let current: any = updatedSettings;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    setSettings(updatedSettings);
  };

  const addToList = (path: string, value: string) => {
    if (!settings || !value.trim()) return;

    const keys = path.split('.');
    const updatedSettings = { ...settings };

    let current: any = updatedSettings;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    const list = current[keys[keys.length - 1]];
    if (!list.includes(value.trim())) {
      current[keys[keys.length - 1]] = [...list, value.trim()];
    }

    setSettings(updatedSettings);
  };

  const removeFromList = (path: string, index: number) => {
    if (!settings) return;

    const keys = path.split('.');
    const updatedSettings = { ...settings };

    let current: any = updatedSettings;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    const list = current[keys[keys.length - 1]];
    current[keys[keys.length - 1]] = list.filter((_: any, i: number) => i !== index);

    setSettings(updatedSettings);
  };

  if (loading) {
    return (
      <div className="settings">
        <div className="loading">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="settings">
        <div className="error">Failed to load settings</div>
      </div>
    );
  }

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>System Settings</h1>
        <button
          className="btn btn-primary"
          onClick={saveSettings}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="settings-content">
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`tab-btn ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('integrations')}
          >
            API Integrations
          </button>
          <button
            className={`tab-btn ${activeTab === 'monitoring' ? 'active' : ''}`}
            onClick={() => setActiveTab('monitoring')}
          >
            Monitoring
          </button>
          <button
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>

        <div className="settings-panel">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>General Settings</h2>

              <div className="form-group">
                <label>System Name</label>
                <input
                  type="text"
                  value={settings.general.systemName}
                  onChange={(e) => updateSetting('general.systemName', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Admin Email</label>
                <input
                  type="email"
                  value={settings.general.adminEmail}
                  onChange={(e) => updateSetting('general.adminEmail', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Timezone</label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => updateSetting('general.timezone', e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.general.maintenanceMode}
                    onChange={(e) => updateSetting('general.maintenanceMode', e.target.checked)}
                  />
                  Maintenance Mode
                </label>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="settings-section">
              <h2>API Integrations</h2>

              <div className="integration-group">
                <h3>Cloudflare</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.apiIntegrations.cloudflare.enabled}
                      onChange={(e) => updateSetting('apiIntegrations.cloudflare.enabled', e.target.checked)}
                    />
                    Enable Cloudflare Integration
                  </label>
                </div>
                {settings.apiIntegrations.cloudflare.enabled && (
                  <>
                    <div className="form-group">
                      <label>API Key</label>
                      <input
                        type="password"
                        value={settings.apiIntegrations.cloudflare.apiKey}
                        onChange={(e) => updateSetting('apiIntegrations.cloudflare.apiKey', e.target.value)}
                        placeholder="Enter Cloudflare API Key"
                      />
                    </div>
                    <div className="form-group">
                      <label>Zone ID</label>
                      <input
                        type="text"
                        value={settings.apiIntegrations.cloudflare.zoneId}
                        onChange={(e) => updateSetting('apiIntegrations.cloudflare.zoneId', e.target.value)}
                        placeholder="Enter Zone ID"
                      />
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => testIntegration('cloudflare')}
                    >
                      Test Connection
                    </button>
                  </>
                )}
              </div>

              <div className="integration-group">
                <h3>Akamai</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.apiIntegrations.akamai.enabled}
                      onChange={(e) => updateSetting('apiIntegrations.akamai.enabled', e.target.checked)}
                    />
                    Enable Akamai Integration
                  </label>
                </div>
                {settings.apiIntegrations.akamai.enabled && (
                  <>
                    <div className="form-group">
                      <label>API Key</label>
                      <input
                        type="password"
                        value={settings.apiIntegrations.akamai.apiKey}
                        onChange={(e) => updateSetting('apiIntegrations.akamai.apiKey', e.target.value)}
                        placeholder="Enter Akamai API Key"
                      />
                    </div>
                    <div className="form-group">
                      <label>Client Secret</label>
                      <input
                        type="password"
                        value={settings.apiIntegrations.akamai.clientSecret}
                        onChange={(e) => updateSetting('apiIntegrations.akamai.clientSecret', e.target.value)}
                        placeholder="Enter Client Secret"
                      />
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => testIntegration('akamai')}
                    >
                      Test Connection
                    </button>
                  </>
                )}
              </div>

              <div className="integration-group">
                <h3>AWS Shield</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.apiIntegrations.awsShield.enabled}
                      onChange={(e) => updateSetting('apiIntegrations.awsShield.enabled', e.target.checked)}
                    />
                    Enable AWS Shield Integration
                  </label>
                </div>
                {settings.apiIntegrations.awsShield.enabled && (
                  <>
                    <div className="form-group">
                      <label>Access Key</label>
                      <input
                        type="password"
                        value={settings.apiIntegrations.awsShield.accessKey}
                        onChange={(e) => updateSetting('apiIntegrations.awsShield.accessKey', e.target.value)}
                        placeholder="Enter AWS Access Key"
                      />
                    </div>
                    <div className="form-group">
                      <label>Secret Key</label>
                      <input
                        type="password"
                        value={settings.apiIntegrations.awsShield.secretKey}
                        onChange={(e) => updateSetting('apiIntegrations.awsShield.secretKey', e.target.value)}
                        placeholder="Enter AWS Secret Key"
                      />
                    </div>
                    <div className="form-group">
                      <label>Region</label>
                      <select
                        value={settings.apiIntegrations.awsShield.region}
                        onChange={(e) => updateSetting('apiIntegrations.awsShield.region', e.target.value)}
                      >
                        <option value="us-east-1">US East (N. Virginia)</option>
                        <option value="us-west-2">US West (Oregon)</option>
                        <option value="eu-west-1">EU West (Ireland)</option>
                        <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                      </select>
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => testIntegration('aws-shield')}
                    >
                      Test Connection
                    </button>
                  </>
                )}
              </div>

              <div className="integration-group">
                <h3>Azure DDoS Protection</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.apiIntegrations.azureDdos.enabled}
                      onChange={(e) => updateSetting('apiIntegrations.azureDdos.enabled', e.target.checked)}
                    />
                    Enable Azure DDoS Integration
                  </label>
                </div>
                {settings.apiIntegrations.azureDdos.enabled && (
                  <>
                    <div className="form-group">
                      <label>Subscription ID</label>
                      <input
                        type="text"
                        value={settings.apiIntegrations.azureDdos.subscriptionId}
                        onChange={(e) => updateSetting('apiIntegrations.azureDdos.subscriptionId', e.target.value)}
                        placeholder="Enter Subscription ID"
                      />
                    </div>
                    <div className="form-group">
                      <label>Client ID</label>
                      <input
                        type="text"
                        value={settings.apiIntegrations.azureDdos.clientId}
                        onChange={(e) => updateSetting('apiIntegrations.azureDdos.clientId', e.target.value)}
                        placeholder="Enter Client ID"
                      />
                    </div>
                    <div className="form-group">
                      <label>Client Secret</label>
                      <input
                        type="password"
                        value={settings.apiIntegrations.azureDdos.clientSecret}
                        onChange={(e) => updateSetting('apiIntegrations.azureDdos.clientSecret', e.target.value)}
                        placeholder="Enter Client Secret"
                      />
                    </div>
                    <div className="form-group">
                      <label>Tenant ID</label>
                      <input
                        type="text"
                        value={settings.apiIntegrations.azureDdos.tenantId}
                        onChange={(e) => updateSetting('apiIntegrations.azureDdos.tenantId', e.target.value)}
                        placeholder="Enter Tenant ID"
                      />
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => testIntegration('azure-ddos')}
                    >
                      Test Connection
                    </button>
                  </>
                )}
              </div>

              <div className="integration-group">
                <h3>Imperva Incapsula</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.apiIntegrations.imperva.enabled}
                      onChange={(e) => updateSetting('apiIntegrations.imperva.enabled', e.target.checked)}
                    />
                    Enable Imperva Integration
                  </label>
                </div>
                {settings.apiIntegrations.imperva.enabled && (
                  <>
                    <div className="form-group">
                      <label>API Key</label>
                      <input
                        type="password"
                        value={settings.apiIntegrations.imperva.apiKey}
                        onChange={(e) => updateSetting('apiIntegrations.imperva.apiKey', e.target.value)}
                        placeholder="Enter Imperva API Key"
                      />
                    </div>
                    <div className="form-group">
                      <label>Account ID</label>
                      <input
                        type="text"
                        value={settings.apiIntegrations.imperva.accountId}
                        onChange={(e) => updateSetting('apiIntegrations.imperva.accountId', e.target.value)}
                        placeholder="Enter Account ID"
                      />
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => testIntegration('imperva')}
                    >
                      Test Connection
                    </button>
                  </>
                )}
              </div>

              <div className="integration-group">
                <h3>Fastly</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.apiIntegrations.fastly.enabled}
                      onChange={(e) => updateSetting('apiIntegrations.fastly.enabled', e.target.checked)}
                    />
                    Enable Fastly Integration
                  </label>
                </div>
                {settings.apiIntegrations.fastly.enabled && (
                  <>
                    <div className="form-group">
                      <label>API Key</label>
                      <input
                        type="password"
                        value={settings.apiIntegrations.fastly.apiKey}
                        onChange={(e) => updateSetting('apiIntegrations.fastly.apiKey', e.target.value)}
                        placeholder="Enter Fastly API Key"
                      />
                    </div>
                    <div className="form-group">
                      <label>Service ID</label>
                      <input
                        type="text"
                        value={settings.apiIntegrations.fastly.serviceId}
                        onChange={(e) => updateSetting('apiIntegrations.fastly.serviceId', e.target.value)}
                        placeholder="Enter Service ID"
                      />
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => testIntegration('fastly')}
                    >
                      Test Connection
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="settings-section">
              <h2>Monitoring Services</h2>

              <div className="integration-group">
                <h3>MaxMind</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.monitoring.maxMind.enabled}
                      onChange={(e) => updateSetting('monitoring.maxMind.enabled', e.target.checked)}
                    />
                    Enable MaxMind Integration
                  </label>
                </div>
                {settings.monitoring.maxMind.enabled && (
                  <>
                    <div className="form-group">
                      <label>License Key</label>
                      <input
                        type="password"
                        value={settings.monitoring.maxMind.licenseKey}
                        onChange={(e) => updateSetting('monitoring.maxMind.licenseKey', e.target.value)}
                        placeholder="Enter MaxMind License Key"
                      />
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => testIntegration('maxmind')}
                    >
                      Test Connection
                    </button>
                  </>
                )}
              </div>

              <div className="integration-group">
                <h3>IPInfo</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.monitoring.ipInfo.enabled}
                      onChange={(e) => updateSetting('monitoring.ipInfo.enabled', e.target.checked)}
                    />
                    Enable IPInfo Integration
                  </label>
                </div>
                {settings.monitoring.ipInfo.enabled && (
                  <>
                    <div className="form-group">
                      <label>API Key</label>
                      <input
                        type="password"
                        value={settings.monitoring.ipInfo.apiKey}
                        onChange={(e) => updateSetting('monitoring.ipInfo.apiKey', e.target.value)}
                        placeholder="Enter IPInfo API Key"
                      />
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => testIntegration('ipinfo')}
                    >
                      Test Connection
                    </button>
                  </>
                )}
              </div>

              <div className="integration-group">
                <h3>Shodan</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.monitoring.shodan.enabled}
                      onChange={(e) => updateSetting('monitoring.shodan.enabled', e.target.checked)}
                    />
                    Enable Shodan Integration
                  </label>
                </div>
                {settings.monitoring.shodan.enabled && (
                  <>
                    <div className="form-group">
                      <label>API Key</label>
                      <input
                        type="password"
                        value={settings.monitoring.shodan.apiKey}
                        onChange={(e) => updateSetting('monitoring.shodan.apiKey', e.target.value)}
                        placeholder="Enter Shodan API Key"
                      />
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => testIntegration('shodan')}
                    >
                      Test Connection
                    </button>
                  </>
                )}
              </div>

              <div className="integration-group">
                <h3>GreyNoise</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.monitoring.greyNoise.enabled}
                      onChange={(e) => updateSetting('monitoring.greyNoise.enabled', e.target.checked)}
                    />
                    Enable GreyNoise Integration
                  </label>
                </div>
                {settings.monitoring.greyNoise.enabled && (
                  <>
                    <div className="form-group">
                      <label>API Key</label>
                      <input
                        type="password"
                        value={settings.monitoring.greyNoise.apiKey}
                        onChange={(e) => updateSetting('monitoring.greyNoise.apiKey', e.target.value)}
                        placeholder="Enter GreyNoise API Key"
                      />
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => testIntegration('greynoise')}
                    >
                      Test Connection
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>

              <div className="integration-group">
                <h3>Email Notifications</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email.enabled}
                      onChange={(e) => updateSetting('notifications.email.enabled', e.target.checked)}
                    />
                    Enable Email Notifications
                  </label>
                </div>
                {settings.notifications.email.enabled && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>SMTP Host</label>
                        <input
                          type="text"
                          value={settings.notifications.email.smtpHost}
                          onChange={(e) => updateSetting('notifications.email.smtpHost', e.target.value)}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div className="form-group">
                        <label>SMTP Port</label>
                        <input
                          type="number"
                          value={settings.notifications.email.smtpPort}
                          onChange={(e) => updateSetting('notifications.email.smtpPort', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>SMTP Username</label>
                      <input
                        type="text"
                        value={settings.notifications.email.smtpUser}
                        onChange={(e) => updateSetting('notifications.email.smtpUser', e.target.value)}
                        placeholder="your-email@gmail.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>SMTP Password</label>
                      <input
                        type="password"
                        value={settings.notifications.email.smtpPass}
                        onChange={(e) => updateSetting('notifications.email.smtpPass', e.target.value)}
                        placeholder="App password"
                      />
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => testIntegration('email')}
                    >
                      Test Email
                    </button>
                  </>
                )}
              </div>

              <div className="integration-group">
                <h3>Slack Notifications</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.slack.enabled}
                      onChange={(e) => updateSetting('notifications.slack.enabled', e.target.checked)}
                    />
                    Enable Slack Notifications
                  </label>
                </div>
                {settings.notifications.slack.enabled && (
                  <>
                    <div className="form-group">
                      <label>Webhook URL</label>
                      <input
                        type="url"
                        value={settings.notifications.slack.webhookUrl}
                        onChange={(e) => updateSetting('notifications.slack.webhookUrl', e.target.value)}
                        placeholder="https://hooks.slack.com/services/..."
                      />
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => testIntegration('slack')}
                    >
                      Test Slack
                    </button>
                  </>
                )}
              </div>

              <div className="integration-group">
                <h3>Webhook Notifications</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.webhook.enabled}
                      onChange={(e) => updateSetting('notifications.webhook.enabled', e.target.checked)}
                    />
                    Enable Webhook Notifications
                  </label>
                </div>
                {settings.notifications.webhook.enabled && (
                  <>
                    <div className="form-group">
                      <label>Webhook URL</label>
                      <input
                        type="url"
                        value={settings.notifications.webhook.url}
                        onChange={(e) => updateSetting('notifications.webhook.url', e.target.value)}
                        placeholder="https://your-webhook-endpoint.com"
                      />
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => testIntegration('webhook')}
                    >
                      Test Webhook
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>

              <div className="integration-group">
                <h3>Rate Limiting</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.security.rateLimit.enabled}
                      onChange={(e) => updateSetting('security.rateLimit.enabled', e.target.checked)}
                    />
                    Enable Rate Limiting
                  </label>
                </div>
                {settings.security.rateLimit.enabled && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Requests per Minute</label>
                      <input
                        type="number"
                        value={settings.security.rateLimit.requestsPerMinute}
                        onChange={(e) => updateSetting('security.rateLimit.requestsPerMinute', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Burst Limit</label>
                      <input
                        type="number"
                        value={settings.security.rateLimit.burstLimit}
                        onChange={(e) => updateSetting('security.rateLimit.burstLimit', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="integration-group">
                <h3>IP Whitelist</h3>
                <div className="form-group">
                  <label>Add IP Address</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      placeholder="192.168.1.1"
                      id="whitelist-input"
                    />
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        const input = document.getElementById('whitelist-input') as HTMLInputElement;
                        addToList('security.ipWhitelist', input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div className="ip-list">
                  {settings.security.ipWhitelist.map((ip, index) => (
                    <div key={index} className="ip-item">
                      <span>{ip}</span>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => removeFromList('security.ipWhitelist', index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="integration-group">
                <h3>IP Blacklist</h3>
                <div className="form-group">
                  <label>Add IP Address</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      placeholder="192.168.1.1"
                      id="blacklist-input"
                    />
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        const input = document.getElementById('blacklist-input') as HTMLInputElement;
                        addToList('security.ipBlacklist', input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div className="ip-list">
                  {settings.security.ipBlacklist.map((ip, index) => (
                    <div key={index} className="ip-item">
                      <span>{ip}</span>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => removeFromList('security.ipBlacklist', index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;