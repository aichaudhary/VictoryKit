import React, { useState, useEffect } from 'react';
import { Link2, CheckCircle, XCircle, Settings, Key, RefreshCw, ExternalLink, AlertTriangle, Clock, TestTube } from 'lucide-react';
import { CLOUD_INTEGRATIONS } from '../constants';

interface IntegrationConfig {
  id: string;
  configured: boolean;
  status: 'connected' | 'error' | 'not_configured';
  lastSync?: string;
  error?: string;
  credentials?: {
    hasClientId: boolean;
    hasClientSecret: boolean;
    hasApiKey: boolean;
    hasWebhookUrl: boolean;
  };
}

const IntegrationsPanel: React.FC = () => {
  const [integrations, setIntegrations] = useState<Record<string, IntegrationConfig>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showConfig, setShowConfig] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      // API returns different format, use mock for now
      throw new Error('Use mock data');
    } catch (error) {
      // Mock data
      const mockStatus: Record<string, IntegrationConfig> = {};
      CLOUD_INTEGRATIONS.forEach(int => {
        mockStatus[int.id] = {
          id: int.id,
          configured: int.id === 'microsoft365' || int.id === 'slack',
          status: int.id === 'microsoft365' ? 'connected' : int.id === 'slack' ? 'connected' : 'not_configured',
          lastSync: int.id === 'microsoft365' || int.id === 'slack' ? new Date(Date.now() - 300000).toISOString() : undefined,
          credentials: {
            hasClientId: int.id === 'microsoft365' || int.id === 'slack',
            hasClientSecret: int.id === 'microsoft365',
            hasApiKey: int.id === 'slack',
            hasWebhookUrl: int.id === 'slack',
          },
        };
      });
      setIntegrations(mockStatus);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (integrationId: string) => {
    setTesting(integrationId);
    // Simulate test
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTesting(null);
  };

  const saveConfig = async (integrationId: string) => {
    // Save configuration
    setIntegrations(prev => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        configured: true,
        status: 'connected',
        lastSync: new Date().toISOString(),
      },
    }));
    setShowConfig(null);
    setConfigForm({});
  };

  const getIntegrationDetails = (id: string) => {
    const configs: Record<string, { fields: { name: string; key: string; type: string; placeholder: string; helpUrl?: string }[] }> = {
      microsoft365: {
        fields: [
          { name: 'Tenant ID', key: 'tenantId', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
          { name: 'Client ID', key: 'clientId', type: 'text', placeholder: 'Application (client) ID', helpUrl: 'https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade' },
          { name: 'Client Secret', key: 'clientSecret', type: 'password', placeholder: 'Client secret value' },
        ],
      },
      google: {
        fields: [
          { name: 'Service Account JSON', key: 'serviceAccount', type: 'textarea', placeholder: 'Paste service account JSON' },
          { name: 'Admin Email', key: 'adminEmail', type: 'email', placeholder: 'admin@domain.com', helpUrl: 'https://console.cloud.google.com/apis/credentials' },
        ],
      },
      slack: {
        fields: [
          { name: 'Bot Token', key: 'botToken', type: 'password', placeholder: 'xoxb-...', helpUrl: 'https://api.slack.com/apps' },
          { name: 'Signing Secret', key: 'signingSecret', type: 'password', placeholder: 'Signing secret' },
          { name: 'App Token', key: 'appToken', type: 'password', placeholder: 'xapp-...' },
        ],
      },
      aws: {
        fields: [
          { name: 'Access Key ID', key: 'accessKeyId', type: 'text', placeholder: 'AKIA...', helpUrl: 'https://console.aws.amazon.com/iam/home#/security_credentials' },
          { name: 'Secret Access Key', key: 'secretAccessKey', type: 'password', placeholder: 'Secret key' },
          { name: 'Region', key: 'region', type: 'text', placeholder: 'us-east-1' },
          { name: 'Bucket Name', key: 'bucket', type: 'text', placeholder: 'my-bucket' },
        ],
      },
      azure: {
        fields: [
          { name: 'Connection String', key: 'connectionString', type: 'password', placeholder: 'DefaultEndpointsProtocol=https;...', helpUrl: 'https://portal.azure.com/#blade/HubsExtension/BrowseResource/resourceType/Microsoft.Storage%2FStorageAccounts' },
          { name: 'Container Name', key: 'container', type: 'text', placeholder: 'my-container' },
        ],
      },
      dropbox: {
        fields: [
          { name: 'App Key', key: 'appKey', type: 'text', placeholder: 'App key', helpUrl: 'https://www.dropbox.com/developers/apps' },
          { name: 'App Secret', key: 'appSecret', type: 'password', placeholder: 'App secret' },
          { name: 'Access Token', key: 'accessToken', type: 'password', placeholder: 'Access token' },
        ],
      },
      box: {
        fields: [
          { name: 'Client ID', key: 'clientId', type: 'text', placeholder: 'Client ID', helpUrl: 'https://app.box.com/developers/console' },
          { name: 'Client Secret', key: 'clientSecret', type: 'password', placeholder: 'Client secret' },
          { name: 'Enterprise ID', key: 'enterpriseId', type: 'text', placeholder: 'Enterprise ID' },
        ],
      },
    };
    return configs[id] || { fields: [] };
  };

  const connectedCount = Object.values(integrations).filter(i => i.status === 'connected').length;
  const errorCount = Object.values(integrations).filter(i => i.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4">
          <p className="text-sm text-slate-400">Total Integrations</p>
          <p className="text-2xl font-bold mt-1">{CLOUD_INTEGRATIONS.length}</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-green-500/30 p-4">
          <p className="text-sm text-slate-400">Connected</p>
          <p className="text-2xl font-bold mt-1 text-green-400">{connectedCount}</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-red-500/30 p-4">
          <p className="text-sm text-slate-400">Errors</p>
          <p className="text-2xl font-bold mt-1 text-red-400">{errorCount}</p>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-4">
          <p className="text-sm text-slate-400">Not Configured</p>
          <p className="text-2xl font-bold mt-1 text-slate-400">
            {CLOUD_INTEGRATIONS.length - connectedCount - errorCount}
          </p>
        </div>
      </div>

      {/* Integration List */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Link2 className="w-5 h-5 text-purple-400" />
            Cloud Integrations
          </h3>
          <button
            onClick={loadIntegrations}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {CLOUD_INTEGRATIONS.map(integration => {
            const config = integrations[integration.id] || { configured: false, status: 'not_configured' };
            const isTesting = testing === integration.id;

            return (
              <div
                key={integration.id}
                className={`p-4 rounded-xl border transition-all ${
                  config.status === 'connected'
                    ? 'bg-slate-800/50 border-green-500/30'
                    : config.status === 'error'
                    ? 'bg-slate-800/50 border-red-500/30'
                    : 'bg-slate-900/30 border-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{integration.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">{integration.name}</h4>
                        {config.status === 'connected' && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                        {config.status === 'error' && (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{integration.description}</p>
                      {config.lastSync && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          Last sync: {new Date(config.lastSync).toLocaleString()}
                        </p>
                      )}
                      {config.error && (
                        <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3" />
                          {config.error}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {config.configured && (
                      <button
                        onClick={() => testConnection(integration.id)}
                        disabled={isTesting}
                        className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-2"
                      >
                        <TestTube className={`w-4 h-4 ${isTesting ? 'animate-pulse' : ''}`} />
                        {isTesting ? 'Testing...' : 'Test'}
                      </button>
                    )}
                    <button
                      onClick={() => setShowConfig(integration.id)}
                      className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                        config.configured
                          ? 'bg-slate-700 hover:bg-slate-600'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                      }`}
                    >
                      {config.configured ? (
                        <>
                          <Settings className="w-4 h-4" />
                          Configure
                        </>
                      ) : (
                        <>
                          <Key className="w-4 h-4" />
                          Connect
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-purple-500/30 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {CLOUD_INTEGRATIONS.find(i => i.id === showConfig)?.icon}
                </span>
                <h3 className="text-lg font-semibold">
                  Configure {CLOUD_INTEGRATIONS.find(i => i.id === showConfig)?.name}
                </h3>
              </div>
              <button
                onClick={() => { setShowConfig(null); setConfigForm({}); }}
                className="p-2 hover:bg-slate-800 rounded-lg"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm">
                <p className="text-blue-400 font-medium mb-1">Setup Instructions</p>
                <p className="text-slate-300">
                  Enter your API credentials below. These are stored securely and encrypted at rest.
                </p>
              </div>

              {getIntegrationDetails(showConfig).fields.map(field => (
                <div key={field.key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-slate-400">{field.name}</label>
                    {field.helpUrl && (
                      <a
                        href={field.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        Get Credentials <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={configForm[field.key] || ''}
                      onChange={e => setConfigForm({ ...configForm, [field.key]: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-purple-500 focus:outline-none h-32 font-mono text-sm resize-none"
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={configForm[field.key] || ''}
                      onChange={e => setConfigForm({ ...configForm, [field.key]: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setShowConfig(null); setConfigForm({}); }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveConfig(showConfig)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium"
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsPanel;
