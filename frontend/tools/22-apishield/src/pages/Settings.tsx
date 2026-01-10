import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Key,
  Globe,
  Server,
  Database,
  Mail,
  Slack,
  Webhook,
  Save,
  RefreshCw,
  Check,
  X,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import clsx from 'clsx';

interface APIKeyConfig {
  id: string;
  name: string;
  key: string;
  scopes: string[];
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'revoked';
}

interface IntegrationConfig {
  id: string;
  name: string;
  type: string;
  icon: React.ElementType;
  connected: boolean;
  config: Record<string, string>;
}

// Mock API Keys
const mockAPIKeys: APIKeyConfig[] = [
  {
    id: 'key-1',
    name: 'Production API Key',
    key: 'ag_prod_sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    scopes: ['read:apis', 'write:apis', 'read:policies', 'write:policies'],
    createdAt: '2024-01-15T10:00:00Z',
    lastUsed: '2024-03-12T11:30:00Z',
    status: 'active',
  },
  {
    id: 'key-2',
    name: 'CI/CD Pipeline',
    key: 'ag_ci_sk_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
    scopes: ['read:apis', 'read:policies', 'read:analytics'],
    createdAt: '2024-02-20T14:00:00Z',
    lastUsed: '2024-03-12T08:15:00Z',
    status: 'active',
  },
  {
    id: 'key-3',
    name: 'Old Integration',
    key: 'ag_old_sk_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
    scopes: ['read:apis'],
    createdAt: '2023-06-01T09:00:00Z',
    lastUsed: '2023-12-15T16:45:00Z',
    status: 'revoked',
  },
];

// Mock Integrations
const mockIntegrations: IntegrationConfig[] = [
  {
    id: 'slack',
    name: 'Slack',
    type: 'notification',
    icon: Slack,
    connected: true,
    config: { webhook: 'https://hooks.slack.com/services/xxx/yyy/zzz' },
  },
  {
    id: 'email',
    name: 'Email Notifications',
    type: 'notification',
    icon: Mail,
    connected: true,
    config: { recipients: 'team@company.com, security@company.com' },
  },
  {
    id: 'webhook',
    name: 'Custom Webhook',
    type: 'notification',
    icon: Webhook,
    connected: false,
    config: {},
  },
];

const settingsSections = [
  { id: 'general', name: 'General', icon: SettingsIcon },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'api-keys', name: 'API Keys', icon: Key },
  { id: 'integrations', name: 'Integrations', icon: Globe },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  
  // General Settings
  const [orgName, setOrgName] = useState('Acme Corporation');
  const [timezone, setTimezone] = useState('America/New_York');
  const [dataRetention, setDataRetention] = useState('90');
  
  // Security Settings
  const [mfaRequired, setMfaRequired] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [ipWhitelist, setIpWhitelist] = useState('');
  const [auditLogging, setAuditLogging] = useState(true);
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(true);
  const [notifyOnCritical, setNotifyOnCritical] = useState(true);
  const [notifyOnHigh, setNotifyOnHigh] = useState(true);
  const [notifyOnMedium, setNotifyOnMedium] = useState(false);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderGeneral = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-api-muted mb-2">Organization Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="api-input w-full max-w-md"
            />
          </div>
          
          <div>
            <label className="block text-sm text-api-muted mb-2">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="api-input w-full max-w-md"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="UTC">UTC</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-api-muted mb-2">Data Retention (days)</label>
            <select
              value={dataRetention}
              onChange={(e) => setDataRetention(e.target.value)}
              className="api-input w-full max-w-md"
            >
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="365">1 year</option>
            </select>
            <p className="text-xs text-api-muted mt-1">
              Historical analytics and logs will be retained for this period
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-api-border pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Danger Zone</h3>
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-red-400">Reset All Settings</p>
              <p className="text-xs text-api-muted mt-1">
                This will reset all configurations to their default values
              </p>
            </div>
            <button className="api-btn bg-red-500/20 text-red-400 border border-red-500/30 text-sm">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-api-dark rounded-lg">
          <div>
            <p className="text-sm font-medium text-white">Require MFA for all users</p>
            <p className="text-xs text-api-muted mt-1">
              Users must enable two-factor authentication
            </p>
          </div>
          <button
            onClick={() => setMfaRequired(!mfaRequired)}
            className={clsx(
              'relative w-12 h-6 rounded-full transition-colors',
              mfaRequired ? 'bg-api-primary' : 'bg-gray-600'
            )}
          >
            <span
              className={clsx(
                'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                mfaRequired ? 'translate-x-7' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-api-dark rounded-lg">
          <div>
            <p className="text-sm font-medium text-white">Audit Logging</p>
            <p className="text-xs text-api-muted mt-1">
              Log all user actions and API changes
            </p>
          </div>
          <button
            onClick={() => setAuditLogging(!auditLogging)}
            className={clsx(
              'relative w-12 h-6 rounded-full transition-colors',
              auditLogging ? 'bg-api-primary' : 'bg-gray-600'
            )}
          >
            <span
              className={clsx(
                'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                auditLogging ? 'translate-x-7' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        <div>
          <label className="block text-sm text-api-muted mb-2">Session Timeout (minutes)</label>
          <select
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(e.target.value)}
            className="api-input w-full max-w-md"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="480">8 hours</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-api-muted mb-2">IP Whitelist</label>
          <textarea
            value={ipWhitelist}
            onChange={(e) => setIpWhitelist(e.target.value)}
            placeholder="Enter IP addresses or CIDR ranges, one per line"
            rows={4}
            className="api-input w-full max-w-md resize-none"
          />
          <p className="text-xs text-api-muted mt-1">
            Leave empty to allow access from any IP
          </p>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Notification Settings</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-api-dark rounded-lg">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-api-muted" />
            <div>
              <p className="text-sm font-medium text-white">Email Notifications</p>
              <p className="text-xs text-api-muted">Receive alerts via email</p>
            </div>
          </div>
          <button
            onClick={() => setEmailNotifications(!emailNotifications)}
            className={clsx(
              'relative w-12 h-6 rounded-full transition-colors',
              emailNotifications ? 'bg-api-primary' : 'bg-gray-600'
            )}
          >
            <span
              className={clsx(
                'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                emailNotifications ? 'translate-x-7' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-api-dark rounded-lg">
          <div className="flex items-center gap-3">
            <Slack className="w-5 h-5 text-api-muted" />
            <div>
              <p className="text-sm font-medium text-white">Slack Notifications</p>
              <p className="text-xs text-api-muted">Send alerts to Slack channel</p>
            </div>
          </div>
          <button
            onClick={() => setSlackNotifications(!slackNotifications)}
            className={clsx(
              'relative w-12 h-6 rounded-full transition-colors',
              slackNotifications ? 'bg-api-primary' : 'bg-gray-600'
            )}
          >
            <span
              className={clsx(
                'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                slackNotifications ? 'translate-x-7' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      </div>

      <div className="border-t border-api-border pt-6">
        <h4 className="text-sm font-semibold text-white mb-4">Alert Severity Levels</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyOnCritical}
              onChange={(e) => setNotifyOnCritical(e.target.checked)}
              className="w-4 h-4 rounded border-api-border"
            />
            <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">Critical</span>
            <span className="text-sm text-api-muted">Always notify for critical issues</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyOnHigh}
              onChange={(e) => setNotifyOnHigh(e.target.checked)}
              className="w-4 h-4 rounded border-api-border"
            />
            <span className="px-2 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded">High</span>
            <span className="text-sm text-api-muted">Notify for high severity issues</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyOnMedium}
              onChange={(e) => setNotifyOnMedium(e.target.checked)}
              className="w-4 h-4 rounded border-api-border"
            />
            <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">Medium</span>
            <span className="text-sm text-api-muted">Notify for medium severity issues</span>
          </label>
        </div>
      </div>

      <div className="border-t border-api-border pt-6">
        <h4 className="text-sm font-semibold text-white mb-4">Reports</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={dailyDigest}
              onChange={(e) => setDailyDigest(e.target.checked)}
              className="w-4 h-4 rounded border-api-border"
            />
            <span className="text-sm text-white">Daily Digest</span>
            <span className="text-xs text-api-muted">Sent every day at 9:00 AM</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={weeklyReport}
              onChange={(e) => setWeeklyReport(e.target.checked)}
              className="w-4 h-4 rounded border-api-border"
            />
            <span className="text-sm text-white">Weekly Report</span>
            <span className="text-xs text-api-muted">Sent every Monday at 9:00 AM</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAPIKeys = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">API Keys</h3>
        <button className="api-btn api-btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Generate New Key
        </button>
      </div>

      <div className="space-y-4">
        {mockAPIKeys.map((apiKey) => (
          <div
            key={apiKey.id}
            className={clsx(
              'p-4 bg-api-dark rounded-lg border',
              apiKey.status === 'active' ? 'border-api-border' : 'border-red-500/30'
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{apiKey.name}</span>
                  <span className={clsx(
                    'px-2 py-0.5 text-xs rounded capitalize',
                    apiKey.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  )}>
                    {apiKey.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <code className="text-xs text-api-muted font-mono">
                    {showApiKey === apiKey.id
                      ? apiKey.key
                      : apiKey.key.replace(/./g, '•').slice(0, 20) + '...'}
                  </code>
                  <button
                    onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                    className="p-1 text-api-muted hover:text-white"
                  >
                    {showApiKey === apiKey.id ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(apiKey.key)}
                    className="p-1 text-api-muted hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {apiKey.scopes.map((scope) => (
                    <span
                      key={scope}
                      className="px-2 py-0.5 text-xs bg-api-card rounded text-api-muted"
                    >
                      {scope}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs text-api-muted">
                  <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                  <span>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                </div>
              </div>

              {apiKey.status === 'active' && (
                <button className="p-2 text-api-muted hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Integrations</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockIntegrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <div
              key={integration.id}
              className="p-4 bg-api-dark rounded-lg border border-api-border"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-api-card rounded-lg">
                    <Icon className="w-5 h-5 text-api-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{integration.name}</p>
                    <p className="text-xs text-api-muted capitalize">{integration.type}</p>
                  </div>
                </div>
                <span className={clsx(
                  'flex items-center gap-1 text-xs',
                  integration.connected ? 'text-green-400' : 'text-api-muted'
                )}>
                  {integration.connected ? (
                    <>
                      <Check className="w-3 h-3" />
                      Connected
                    </>
                  ) : (
                    <>
                      <X className="w-3 h-3" />
                      Not connected
                    </>
                  )}
                </span>
              </div>

              <div className="mt-4">
                {integration.connected ? (
                  <button className="api-btn bg-api-card text-api-muted text-sm w-full">
                    Configure
                  </button>
                ) : (
                  <button className="api-btn api-btn-primary text-sm w-full">
                    Connect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-api-border pt-6">
        <h4 className="text-sm font-semibold text-white mb-4">Available Integrations</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'PagerDuty', icon: Bell },
            { name: 'Datadog', icon: Server },
            { name: 'Splunk', icon: Database },
            { name: 'Jira', icon: ExternalLink },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className="p-4 bg-api-dark rounded-lg border border-api-border hover:border-api-primary/50 transition-colors text-center"
              >
                <Icon className="w-6 h-6 text-api-muted mx-auto mb-2" />
                <p className="text-sm text-white">{item.name}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <div className="lg:w-64 flex-shrink-0">
        <div className="api-card p-2 lg:sticky lg:top-6">
          <nav className="space-y-1">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                    activeSection === section.id
                      ? 'bg-api-primary/20 text-api-primary'
                      : 'text-api-muted hover:bg-api-dark hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{section.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="api-card p-6">
          {activeSection === 'general' && renderGeneral()}
          {activeSection === 'security' && renderSecurity()}
          {activeSection === 'notifications' && renderNotifications()}
          {activeSection === 'api-keys' && renderAPIKeys()}
          {activeSection === 'integrations' && renderIntegrations()}

          {/* Save Button */}
          {activeSection !== 'api-keys' && activeSection !== 'integrations' && (
            <div className="mt-8 pt-6 border-t border-api-border">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="api-btn api-btn-primary flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </motion.div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
