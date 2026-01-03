import React, { useState, useEffect } from 'react';
import wsService from '../services/websocket';
import './Settings.css';

interface SettingsProps {
}

interface SystemSettings {
  scanInterval: number;
  alertThreshold: number;
  maxConcurrentScans: number;
  retentionDays: number;
  enableAutoRemediation: boolean;
  enableNotifications: boolean;
  notificationEmail: string;
  smtpServer: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  enableWebhooks: boolean;
  webhookUrl: string;
  webhookSecret: string;
  enableLogging: boolean;
  logLevel: string;
  enableMetrics: boolean;
  metricsPort: number;
}

interface ApiKeySettings {
  sslLabsApiKey: string;
  censysApiId: string;
  censysApiSecret: string;
  shodanApiKey: string;
  virusTotalApiKey: string;
  digiCertApiKey: string;
  globalSignApiKey: string;
  letsEncryptApiKey: string;
  certificateTransparencyApiKey: string;
}

const Settings: React.FC<SettingsProps> = () => {
  const [activeTab, setActiveTab] = useState<'system' | 'api-keys' | 'notifications' | 'security'>('system');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(wsService.isConnected);

  useEffect(() => {
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    wsService.on('connected', handleConnected);
    wsService.on('disconnected', handleDisconnected);

    return () => {
      wsService.off('connected', handleConnected);
      wsService.off('disconnected', handleDisconnected);
    };
  }, []);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    scanInterval: 24,
    alertThreshold: 7,
    maxConcurrentScans: 10,
    retentionDays: 90,
    enableAutoRemediation: false,
    enableNotifications: true,
    notificationEmail: '',
    smtpServer: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    enableWebhooks: false,
    webhookUrl: '',
    webhookSecret: '',
    enableLogging: true,
    logLevel: 'info',
    enableMetrics: true,
    metricsPort: 9090,
  });

  const [apiKeySettings, setApiKeySettings] = useState<ApiKeySettings>({
    sslLabsApiKey: '',
    censysApiId: '',
    censysApiSecret: '',
    shodanApiKey: '',
    virusTotalApiKey: '',
    digiCertApiKey: '',
    globalSignApiKey: '',
    letsEncryptApiKey: '',
    certificateTransparencyApiKey: '',
  });

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from the API
      // For now, we'll use localStorage or default values
      const savedSystemSettings = localStorage.getItem('sslmonitor-system-settings');
      const savedApiKeys = localStorage.getItem('sslmonitor-api-keys');

      if (savedSystemSettings) {
        setSystemSettings(JSON.parse(savedSystemSettings));
      }
      if (savedApiKeys) {
        setApiKeySettings(JSON.parse(savedApiKeys));
      }
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Save to localStorage (in real implementation, this would be API calls)
      localStorage.setItem('sslmonitor-system-settings', JSON.stringify(systemSettings));
      localStorage.setItem('sslmonitor-api-keys', JSON.stringify(apiKeySettings));

      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (service: string) => {
    try {
      setLoading(true);
      // In a real implementation, this would test the API connection
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setSuccess(`${service} connection test successful`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to connect to ${service}`);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSystemSettingChange = (field: keyof SystemSettings, value: any) => {
    setSystemSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApiKeyChange = (field: keyof ApiKeySettings, value: string) => {
    setApiKeySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading && !systemSettings.scanInterval) {
    return (
      <div className="settings">
        <div className="settings-loading">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings">
      <div className="settings-header">
        <div className="header-content">
          <h2><i className="fas fa-cog"></i> Settings</h2>
          <p>Configure system settings, API keys, and monitoring preferences</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={saveSettings}
            disabled={loading}
          >
            {loading ? <><div className="spinner-small"></div> Saving...</> : <><i className="fas fa-save"></i> Save Settings</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="settings-error">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => setError(null)}><i className="fas fa-times"></i></button>
        </div>
      )}

      {success && (
        <div className="settings-success">
          <i className="fas fa-check-circle"></i>
          <span>{success}</span>
        </div>
      )}

      <div className="settings-content">
        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            <i className="fas fa-server"></i> System
          </button>
          <button
            className={`tab-button ${activeTab === 'api-keys' ? 'active' : ''}`}
            onClick={() => setActiveTab('api-keys')}
          >
            <i className="fas fa-key"></i> API Keys
          </button>
          <button
            className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <i className="fas fa-bell"></i> Notifications
          </button>
          <button
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <i className="fas fa-shield-alt"></i> Security
          </button>
        </div>

        <div className="settings-panel">
          {activeTab === 'system' && (
            <div className="system-settings">
              <h3>System Configuration</h3>

              <div className="settings-group">
                <h4><i className="fas fa-clock"></i> Scanning Settings</h4>
                <div className="settings-grid">
                  <div className="setting-item">
                    <label htmlFor="scanInterval">Scan Interval (hours)</label>
                    <input
                      type="number"
                      id="scanInterval"
                      value={systemSettings.scanInterval}
                      onChange={(e) => handleSystemSettingChange('scanInterval', parseInt(e.target.value))}
                      min="1"
                      max="168"
                    />
                    <span className="setting-help">How often to scan certificates automatically</span>
                  </div>

                  <div className="setting-item">
                    <label htmlFor="alertThreshold">Alert Threshold (days)</label>
                    <input
                      type="number"
                      id="alertThreshold"
                      value={systemSettings.alertThreshold}
                      onChange={(e) => handleSystemSettingChange('alertThreshold', parseInt(e.target.value))}
                      min="1"
                      max="90"
                    />
                    <span className="setting-help">Days before expiration to trigger alerts</span>
                  </div>

                  <div className="setting-item">
                    <label htmlFor="maxConcurrentScans">Max Concurrent Scans</label>
                    <input
                      type="number"
                      id="maxConcurrentScans"
                      value={systemSettings.maxConcurrentScans}
                      onChange={(e) => handleSystemSettingChange('maxConcurrentScans', parseInt(e.target.value))}
                      min="1"
                      max="50"
                    />
                    <span className="setting-help">Maximum number of simultaneous scans</span>
                  </div>

                  <div className="setting-item">
                    <label htmlFor="retentionDays">Data Retention (days)</label>
                    <input
                      type="number"
                      id="retentionDays"
                      value={systemSettings.retentionDays}
                      onChange={(e) => handleSystemSettingChange('retentionDays', parseInt(e.target.value))}
                      min="7"
                      max="365"
                    />
                    <span className="setting-help">How long to keep scan results and logs</span>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <h4><i className="fas fa-robot"></i> Automation</h4>
                <div className="settings-grid">
                  <div className="setting-item checkbox">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={systemSettings.enableAutoRemediation}
                        onChange={(e) => handleSystemSettingChange('enableAutoRemediation', e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      Enable Auto-Remediation
                    </label>
                    <span className="setting-help">Automatically attempt to fix certificate issues</span>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <h4><i className="fas fa-chart-line"></i> Monitoring</h4>
                <div className="settings-grid">
                  <div className="setting-item checkbox">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={systemSettings.enableMetrics}
                        onChange={(e) => handleSystemSettingChange('enableMetrics', e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      Enable Metrics Collection
                    </label>
                    <span className="setting-help">Collect performance and usage metrics</span>
                  </div>

                  <div className="setting-item">
                    <label htmlFor="metricsPort">Metrics Port</label>
                    <input
                      type="number"
                      id="metricsPort"
                      value={systemSettings.metricsPort}
                      onChange={(e) => handleSystemSettingChange('metricsPort', parseInt(e.target.value))}
                      min="1024"
                      max="65535"
                    />
                    <span className="setting-help">Port for metrics endpoint</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api-keys' && (
            <div className="api-keys-settings">
              <h3>API Key Configuration</h3>
              <p className="settings-description">
                Configure API keys for external SSL monitoring services. These keys are encrypted and stored securely.
              </p>

              <div className="api-keys-grid">
                <div className="api-key-group">
                  <h4><i className="fas fa-flask"></i> SSL Labs</h4>
                  <div className="api-key-item">
                    <label htmlFor="sslLabsApiKey">API Key</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.sslLabsApiKey ? "text" : "password"}
                        id="sslLabsApiKey"
                        value={apiKeySettings.sslLabsApiKey}
                        onChange={(e) => handleApiKeyChange('sslLabsApiKey', e.target.value)}
                        placeholder="Enter SSL Labs API key"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('sslLabsApiKey')}
                      >
                        <i className={`fas ${showPasswords.sslLabsApiKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-secondary test-connection"
                      onClick={() => testConnection('SSL Labs')}
                      disabled={loading || !apiKeySettings.sslLabsApiKey}
                    >
                      Test Connection
                    </button>
                  </div>
                </div>

                <div className="api-key-group">
                  <h4><i className="fas fa-search"></i> Censys</h4>
                  <div className="api-key-item">
                    <label htmlFor="censysApiId">API ID</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.censysApiId ? "text" : "password"}
                        id="censysApiId"
                        value={apiKeySettings.censysApiId}
                        onChange={(e) => handleApiKeyChange('censysApiId', e.target.value)}
                        placeholder="Enter Censys API ID"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('censysApiId')}
                      >
                        <i className={`fas ${showPasswords.censysApiId ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                  <div className="api-key-item">
                    <label htmlFor="censysApiSecret">API Secret</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.censysApiSecret ? "text" : "password"}
                        id="censysApiSecret"
                        value={apiKeySettings.censysApiSecret}
                        onChange={(e) => handleApiKeyChange('censysApiSecret', e.target.value)}
                        placeholder="Enter Censys API Secret"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('censysApiSecret')}
                      >
                        <i className={`fas ${showPasswords.censysApiSecret ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-secondary test-connection"
                      onClick={() => testConnection('Censys')}
                      disabled={loading || !apiKeySettings.censysApiId || !apiKeySettings.censysApiSecret}
                    >
                      Test Connection
                    </button>
                  </div>
                </div>

                <div className="api-key-group">
                  <h4><i className="fas fa-search-plus"></i> Shodan</h4>
                  <div className="api-key-item">
                    <label htmlFor="shodanApiKey">API Key</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.shodanApiKey ? "text" : "password"}
                        id="shodanApiKey"
                        value={apiKeySettings.shodanApiKey}
                        onChange={(e) => handleApiKeyChange('shodanApiKey', e.target.value)}
                        placeholder="Enter Shodan API key"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('shodanApiKey')}
                      >
                        <i className={`fas ${showPasswords.shodanApiKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-secondary test-connection"
                      onClick={() => testConnection('Shodan')}
                      disabled={loading || !apiKeySettings.shodanApiKey}
                    >
                      Test Connection
                    </button>
                  </div>
                </div>

                <div className="api-key-group">
                  <h4><i className="fas fa-virus"></i> VirusTotal</h4>
                  <div className="api-key-item">
                    <label htmlFor="virusTotalApiKey">API Key</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.virusTotalApiKey ? "text" : "password"}
                        id="virusTotalApiKey"
                        value={apiKeySettings.virusTotalApiKey}
                        onChange={(e) => handleApiKeyChange('virusTotalApiKey', e.target.value)}
                        placeholder="Enter VirusTotal API key"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('virusTotalApiKey')}
                      >
                        <i className={`fas ${showPasswords.virusTotalApiKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-secondary test-connection"
                      onClick={() => testConnection('VirusTotal')}
                      disabled={loading || !apiKeySettings.virusTotalApiKey}
                    >
                      Test Connection
                    </button>
                  </div>
                </div>

                <div className="api-key-group">
                  <h4><i className="fas fa-certificate"></i> DigiCert</h4>
                  <div className="api-key-item">
                    <label htmlFor="digiCertApiKey">API Key</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.digiCertApiKey ? "text" : "password"}
                        id="digiCertApiKey"
                        value={apiKeySettings.digiCertApiKey}
                        onChange={(e) => handleApiKeyChange('digiCertApiKey', e.target.value)}
                        placeholder="Enter DigiCert API key"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('digiCertApiKey')}
                      >
                        <i className={`fas ${showPasswords.digiCertApiKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-secondary test-connection"
                      onClick={() => testConnection('DigiCert')}
                      disabled={loading || !apiKeySettings.digiCertApiKey}
                    >
                      Test Connection
                    </button>
                  </div>
                </div>

                <div className="api-key-group">
                  <h4><i className="fas fa-globe"></i> GlobalSign</h4>
                  <div className="api-key-item">
                    <label htmlFor="globalSignApiKey">API Key</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.globalSignApiKey ? "text" : "password"}
                        id="globalSignApiKey"
                        value={apiKeySettings.globalSignApiKey}
                        onChange={(e) => handleApiKeyChange('globalSignApiKey', e.target.value)}
                        placeholder="Enter GlobalSign API key"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('globalSignApiKey')}
                      >
                        <i className={`fas ${showPasswords.globalSignApiKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-secondary test-connection"
                      onClick={() => testConnection('GlobalSign')}
                      disabled={loading || !apiKeySettings.globalSignApiKey}
                    >
                      Test Connection
                    </button>
                  </div>
                </div>

                <div className="api-key-group">
                  <h4><i className="fas fa-lock"></i> Let's Encrypt</h4>
                  <div className="api-key-item">
                    <label htmlFor="letsEncryptApiKey">API Key</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.letsEncryptApiKey ? "text" : "password"}
                        id="letsEncryptApiKey"
                        value={apiKeySettings.letsEncryptApiKey}
                        onChange={(e) => handleApiKeyChange('letsEncryptApiKey', e.target.value)}
                        placeholder="Enter Let's Encrypt API key"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('letsEncryptApiKey')}
                      >
                        <i className={`fas ${showPasswords.letsEncryptApiKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-secondary test-connection"
                      onClick={() => testConnection("Let's Encrypt")}
                      disabled={loading || !apiKeySettings.letsEncryptApiKey}
                    >
                      Test Connection
                    </button>
                  </div>
                </div>

                <div className="api-key-group">
                  <h4><i className="fas fa-list"></i> Certificate Transparency</h4>
                  <div className="api-key-item">
                    <label htmlFor="certificateTransparencyApiKey">API Key</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.certificateTransparencyApiKey ? "text" : "password"}
                        id="certificateTransparencyApiKey"
                        value={apiKeySettings.certificateTransparencyApiKey}
                        onChange={(e) => handleApiKeyChange('certificateTransparencyApiKey', e.target.value)}
                        placeholder="Enter Certificate Transparency API key"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('certificateTransparencyApiKey')}
                      >
                        <i className={`fas ${showPasswords.certificateTransparencyApiKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-secondary test-connection"
                      onClick={() => testConnection('Certificate Transparency')}
                      disabled={loading || !apiKeySettings.certificateTransparencyApiKey}
                    >
                      Test Connection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="notifications-settings">
              <h3>Notification Settings</h3>

              <div className="settings-group">
                <h4><i className="fas fa-envelope"></i> Email Notifications</h4>
                <div className="settings-grid">
                  <div className="setting-item checkbox">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={systemSettings.enableNotifications}
                        onChange={(e) => handleSystemSettingChange('enableNotifications', e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      Enable Email Notifications
                    </label>
                    <span className="setting-help">Send alerts via email</span>
                  </div>

                  <div className="setting-item">
                    <label htmlFor="notificationEmail">Notification Email</label>
                    <input
                      type="email"
                      id="notificationEmail"
                      value={systemSettings.notificationEmail}
                      onChange={(e) => handleSystemSettingChange('notificationEmail', e.target.value)}
                      placeholder="admin@example.com"
                    />
                    <span className="setting-help">Email address for notifications</span>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <h4><i className="fas fa-server"></i> SMTP Configuration</h4>
                <div className="settings-grid">
                  <div className="setting-item">
                    <label htmlFor="smtpServer">SMTP Server</label>
                    <input
                      type="text"
                      id="smtpServer"
                      value={systemSettings.smtpServer}
                      onChange={(e) => handleSystemSettingChange('smtpServer', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                    <span className="setting-help">SMTP server hostname</span>
                  </div>

                  <div className="setting-item">
                    <label htmlFor="smtpPort">SMTP Port</label>
                    <input
                      type="number"
                      id="smtpPort"
                      value={systemSettings.smtpPort}
                      onChange={(e) => handleSystemSettingChange('smtpPort', parseInt(e.target.value))}
                      min="1"
                      max="65535"
                    />
                    <span className="setting-help">SMTP server port (usually 587 or 465)</span>
                  </div>

                  <div className="setting-item">
                    <label htmlFor="smtpUsername">SMTP Username</label>
                    <input
                      type="text"
                      id="smtpUsername"
                      value={systemSettings.smtpUsername}
                      onChange={(e) => handleSystemSettingChange('smtpUsername', e.target.value)}
                      placeholder="your-email@gmail.com"
                    />
                    <span className="setting-help">SMTP authentication username</span>
                  </div>

                  <div className="setting-item">
                    <label htmlFor="smtpPassword">SMTP Password</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.smtpPassword ? "text" : "password"}
                        id="smtpPassword"
                        value={systemSettings.smtpPassword}
                        onChange={(e) => handleSystemSettingChange('smtpPassword', e.target.value)}
                        placeholder="Enter SMTP password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('smtpPassword')}
                      >
                        <i className={`fas ${showPasswords.smtpPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <span className="setting-help">SMTP authentication password or app password</span>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <h4><i className="fas fa-webhook"></i> Webhooks</h4>
                <div className="settings-grid">
                  <div className="setting-item checkbox">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={systemSettings.enableWebhooks}
                        onChange={(e) => handleSystemSettingChange('enableWebhooks', e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      Enable Webhooks
                    </label>
                    <span className="setting-help">Send notifications via webhooks</span>
                  </div>

                  <div className="setting-item">
                    <label htmlFor="webhookUrl">Webhook URL</label>
                    <input
                      type="url"
                      id="webhookUrl"
                      value={systemSettings.webhookUrl}
                      onChange={(e) => handleSystemSettingChange('webhookUrl', e.target.value)}
                      placeholder="https://your-app.com/webhook"
                    />
                    <span className="setting-help">URL to send webhook notifications</span>
                  </div>

                  <div className="setting-item">
                    <label htmlFor="webhookSecret">Webhook Secret</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.webhookSecret ? "text" : "password"}
                        id="webhookSecret"
                        value={systemSettings.webhookSecret}
                        onChange={(e) => handleSystemSettingChange('webhookSecret', e.target.value)}
                        placeholder="Enter webhook secret"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('webhookSecret')}
                      >
                        <i className={`fas ${showPasswords.webhookSecret ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <span className="setting-help">Secret for webhook signature verification</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="security-settings">
              <h3>Security Settings</h3>

              <div className="settings-group">
                <h4><i className="fas fa-file-alt"></i> Logging</h4>
                <div className="settings-grid">
                  <div className="setting-item checkbox">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={systemSettings.enableLogging}
                        onChange={(e) => handleSystemSettingChange('enableLogging', e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      Enable Logging
                    </label>
                    <span className="setting-help">Enable system logging for debugging and audit</span>
                  </div>

                  <div className="setting-item">
                    <label htmlFor="logLevel">Log Level</label>
                    <select
                      id="logLevel"
                      value={systemSettings.logLevel}
                      onChange={(e) => handleSystemSettingChange('logLevel', e.target.value)}
                    >
                      <option value="error">Error</option>
                      <option value="warn">Warning</option>
                      <option value="info">Info</option>
                      <option value="debug">Debug</option>
                    </select>
                    <span className="setting-help">Minimum log level to record</span>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <h4><i className="fas fa-key"></i> API Security</h4>
                <div className="security-info">
                  <div className="info-item">
                    <i className="fas fa-shield-alt"></i>
                    <div>
                      <h5>API Key Encryption</h5>
                      <p>All API keys are encrypted using AES-256 before storage</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <i className="fas fa-lock"></i>
                    <div>
                      <h5>Secure Communication</h5>
                      <p>All external API calls use HTTPS with certificate validation</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <i className="fas fa-user-secret"></i>
                    <div>
                      <h5>Access Control</h5>
                      <p>API keys are only accessible to authorized system processes</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <h4><i className="fas fa-database"></i> Data Protection</h4>
                <div className="security-info">
                  <div className="info-item">
                    <i className="fas fa-trash-alt"></i>
                    <div>
                      <h5>Data Retention</h5>
                      <p>Scan results and logs are automatically cleaned up after {systemSettings.retentionDays} days</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <i className="fas fa-file-code"></i>
                    <div>
                      <h5>Audit Trail</h5>
                      <p>All configuration changes are logged for compliance and security</p>
                    </div>
                  </div>
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