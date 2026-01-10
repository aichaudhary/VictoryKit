import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings as SettingsIcon,
  Shield,
  Bot,
  Globe,
  Key,
  Bell,
  Save,
  RefreshCw,
  Zap,
  Clock,
  Lock,
  Eye,
  EyeOff,
  TestTube,
} from 'lucide-react';
import { settingsApi } from '../services/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'detection' | 'integrations' | 'notifications'>('general');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => settingsApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved');
    },
    onError: () => {
      toast.error('Failed to save settings');
    },
  });

  // Default settings
  const [settings, setSettings] = useState({
    general: {
      botProtectionEnabled: true,
      loggingLevel: 'info',
      dataRetentionDays: 90,
      timezone: 'UTC',
    },
    detection: {
      mlThreshold: 0.75,
      rateLimit: { enabled: true, maxRequests: 100, windowSeconds: 60 },
      fingerprinting: { enabled: true, minScore: 0.6 },
      behaviorAnalysis: { enabled: true, sessionTracking: true },
      challengeOnSuspicious: true,
      autoBlockThreshold: 0.9,
      whitelistGoodBots: true,
    },
    integrations: {
      recaptcha: { enabled: true, siteKey: '', secretKey: '', version: 'v3', threshold: 0.5 },
      hcaptcha: { enabled: false, siteKey: '', secretKey: '' },
      turnstile: { enabled: false, siteKey: '', secretKey: '' },
      ipquality: { enabled: true, apiKey: '' },
      abuseipdb: { enabled: true, apiKey: '' },
      greynoise: { enabled: false, apiKey: '' },
      shodan: { enabled: false, apiKey: '' },
    },
    notifications: {
      email: { enabled: true, recipients: ['security@company.com'], threshold: 'high' },
      slack: { enabled: false, webhookUrl: '', channel: '#security-alerts' },
      webhook: { enabled: false, url: '', secret: '' },
    },
  });

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  const toggleSecret = (key: string) => {
    setShowSecrets({ ...showSecrets, [key]: !showSecrets[key] });
  };

  const renderSecretInput = (value: string, onChange: (v: string) => void, key: string, placeholder: string) => (
    <div className="relative">
      <input
        type={showSecrets[key] ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 font-mono text-sm"
      />
      <button
        onClick={() => toggleSecret(key)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-600 rounded"
      >
        {showSecrets[key] ? (
          <EyeOff size={16} className="text-slate-400" />
        ) : (
          <Eye size={16} className="text-slate-400" />
        )}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 mt-1">Configure bot detection and protection settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          {updateMutation.isPending ? (
            <RefreshCw className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          <span>Save Changes</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-800 rounded-lg p-1 w-fit">
        {[
          { id: 'general', label: 'General', icon: SettingsIcon },
          { id: 'detection', label: 'Detection', icon: Shield },
          { id: 'integrations', label: 'Integrations', icon: Key },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-orange-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Shield size={20} className="mr-2 text-orange-400" />
              Bot Protection
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">Bot Protection</p>
                  <p className="text-sm text-slate-400">Enable or disable bot protection globally</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.general.botProtectionEnabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, botProtectionEnabled: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              <div className="p-4 bg-slate-700/50 rounded-lg">
                <label className="block text-white font-medium mb-2">Logging Level</label>
                <select
                  value={settings.general.loggingLevel}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, loggingLevel: e.target.value }
                  })}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warn">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div className="p-4 bg-slate-700/50 rounded-lg">
                <label className="block text-white font-medium mb-2">Data Retention (Days)</label>
                <input
                  type="number"
                  value={settings.general.dataRetentionDays}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, dataRetentionDays: parseInt(e.target.value) }
                  })}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-orange-500"
                />
                <p className="text-sm text-slate-400 mt-1">How long to retain bot detection logs and data</p>
              </div>

              <div className="p-4 bg-slate-700/50 rounded-lg">
                <label className="block text-white font-medium mb-2">Timezone</label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, timezone: e.target.value }
                  })}
                  className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detection Settings */}
      {activeTab === 'detection' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Zap size={20} className="mr-2 text-orange-400" />
              Machine Learning
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white font-medium">ML Detection Threshold</label>
                  <span className="text-orange-400 font-mono">{(settings.detection.mlThreshold * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  value={settings.detection.mlThreshold}
                  onChange={(e) => setSettings({
                    ...settings,
                    detection: { ...settings.detection, mlThreshold: parseFloat(e.target.value) }
                  })}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>More Sensitive</span>
                  <span>More Specific</span>
                </div>
              </div>

              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white font-medium">Auto-Block Threshold</label>
                  <span className="text-red-400 font-mono">{(settings.detection.autoBlockThreshold * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="0.99"
                  step="0.01"
                  value={settings.detection.autoBlockThreshold}
                  onChange={(e) => setSettings({
                    ...settings,
                    detection: { ...settings.detection, autoBlockThreshold: parseFloat(e.target.value) }
                  })}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <p className="text-sm text-slate-400 mt-1">Automatically block requests above this confidence threshold</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Clock size={20} className="mr-2 text-orange-400" />
              Rate Limiting
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">Enable Rate Limiting</p>
                  <p className="text-sm text-slate-400">Limit requests per IP address</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.detection.rateLimit.enabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      detection: {
                        ...settings.detection,
                        rateLimit: { ...settings.detection.rateLimit, enabled: e.target.checked }
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <label className="block text-white font-medium mb-2">Max Requests</label>
                  <input
                    type="number"
                    value={settings.detection.rateLimit.maxRequests}
                    onChange={(e) => setSettings({
                      ...settings,
                      detection: {
                        ...settings.detection,
                        rateLimit: { ...settings.detection.rateLimit, maxRequests: parseInt(e.target.value) }
                      }
                    })}
                    className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <label className="block text-white font-medium mb-2">Window (seconds)</label>
                  <input
                    type="number"
                    value={settings.detection.rateLimit.windowSeconds}
                    onChange={(e) => setSettings({
                      ...settings,
                      detection: {
                        ...settings.detection,
                        rateLimit: { ...settings.detection.rateLimit, windowSeconds: parseInt(e.target.value) }
                      }
                    })}
                    className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Bot size={20} className="mr-2 text-orange-400" />
              Detection Features
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'fingerprinting', label: 'Device Fingerprinting', desc: 'Collect and analyze device fingerprints' },
                { key: 'behaviorAnalysis', label: 'Behavioral Analysis', desc: 'Track user behavior patterns' },
                { key: 'challengeOnSuspicious', label: 'Challenge Suspicious', desc: 'Show CAPTCHA to suspicious requests' },
                { key: 'whitelistGoodBots', label: 'Whitelist Good Bots', desc: 'Allow known search engine bots' },
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{feature.label}</p>
                    <p className="text-sm text-slate-400">{feature.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(settings.detection as any)[feature.key]?.enabled ?? (settings.detection as any)[feature.key]}
                      onChange={(e) => {
                        const value = typeof (settings.detection as any)[feature.key] === 'object'
                          ? { ...(settings.detection as any)[feature.key], enabled: e.target.checked }
                          : e.target.checked;
                        setSettings({
                          ...settings,
                          detection: { ...settings.detection, [feature.key]: value }
                        });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Integrations Settings */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {/* CAPTCHA Providers */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Lock size={20} className="mr-2 text-orange-400" />
              CAPTCHA Providers
            </h3>
            
            <div className="space-y-6">
              {/* reCAPTCHA */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Shield size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Google reCAPTCHA v3</p>
                      <p className="text-sm text-slate-400">Invisible bot detection</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.integrations.recaptcha.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        integrations: {
                          ...settings.integrations,
                          recaptcha: { ...settings.integrations.recaptcha, enabled: e.target.checked }
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
                {settings.integrations.recaptcha.enabled && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Site Key</label>
                      <input
                        type="text"
                        placeholder="Enter site key"
                        value={settings.integrations.recaptcha.siteKey}
                        onChange={(e) => setSettings({
                          ...settings,
                          integrations: {
                            ...settings.integrations,
                            recaptcha: { ...settings.integrations.recaptcha, siteKey: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Secret Key</label>
                      {renderSecretInput(
                        settings.integrations.recaptcha.secretKey,
                        (v) => setSettings({
                          ...settings,
                          integrations: {
                            ...settings.integrations,
                            recaptcha: { ...settings.integrations.recaptcha, secretKey: v }
                          }
                        }),
                        'recaptcha-secret',
                        'Enter secret key'
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* hCaptcha */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Shield size={20} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">hCaptcha</p>
                      <p className="text-sm text-slate-400">Privacy-focused CAPTCHA</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.integrations.hcaptcha.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        integrations: {
                          ...settings.integrations,
                          hcaptcha: { ...settings.integrations.hcaptcha, enabled: e.target.checked }
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              </div>

              {/* Turnstile */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Shield size={20} className="text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Cloudflare Turnstile</p>
                      <p className="text-sm text-slate-400">Cloudflare's CAPTCHA alternative</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.integrations.turnstile.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        integrations: {
                          ...settings.integrations,
                          turnstile: { ...settings.integrations.turnstile, enabled: e.target.checked }
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* IP Intelligence */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Globe size={20} className="mr-2 text-orange-400" />
              IP Intelligence
            </h3>
            
            <div className="space-y-4">
              {[
                { key: 'ipquality', name: 'IPQualityScore', desc: 'Fraud detection and IP scoring' },
                { key: 'abuseipdb', name: 'AbuseIPDB', desc: 'Community-driven abuse reporting' },
                { key: 'greynoise', name: 'GreyNoise', desc: 'Internet scanner detection' },
                { key: 'shodan', name: 'Shodan', desc: 'Internet device intelligence' },
              ].map((provider) => (
                <div key={provider.key} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{provider.name}</p>
                    <p className="text-sm text-slate-400">{provider.desc}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-48">
                      {renderSecretInput(
                        (settings.integrations as any)[provider.key]?.apiKey || '',
                        (v) => setSettings({
                          ...settings,
                          integrations: {
                            ...settings.integrations,
                            [provider.key]: { ...(settings.integrations as any)[provider.key], apiKey: v }
                          }
                        }),
                        `${provider.key}-api`,
                        'API Key'
                      )}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(settings.integrations as any)[provider.key]?.enabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          integrations: {
                            ...settings.integrations,
                            [provider.key]: { ...(settings.integrations as any)[provider.key], enabled: e.target.checked }
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Settings */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Bell size={20} className="mr-2 text-orange-400" />
              Alert Channels
            </h3>
            
            <div className="space-y-6">
              {/* Email */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-sm text-slate-400">Receive alerts via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          email: { ...settings.notifications.email, enabled: e.target.checked }
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
                {settings.notifications.email.enabled && (
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Recipients (comma-separated)</label>
                    <input
                      type="text"
                      value={settings.notifications.email.recipients.join(', ')}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          email: {
                            ...settings.notifications.email,
                            recipients: e.target.value.split(',').map(s => s.trim())
                          }
                        }
                      })}
                      className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}
              </div>

              {/* Slack */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-medium">Slack Notifications</p>
                    <p className="text-sm text-slate-400">Send alerts to Slack channel</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.slack.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          slack: { ...settings.notifications.slack, enabled: e.target.checked }
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
                {settings.notifications.slack.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Webhook URL</label>
                      {renderSecretInput(
                        settings.notifications.slack.webhookUrl,
                        (v) => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            slack: { ...settings.notifications.slack, webhookUrl: v }
                          }
                        }),
                        'slack-webhook',
                        'https://hooks.slack.com/...'
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Channel</label>
                      <input
                        type="text"
                        value={settings.notifications.slack.channel}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            slack: { ...settings.notifications.slack, channel: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Webhook */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-medium">Webhook</p>
                    <p className="text-sm text-slate-400">Send alerts to custom webhook</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.webhook.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          webhook: { ...settings.notifications.webhook, enabled: e.target.checked }
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
                {settings.notifications.webhook.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">URL</label>
                      <input
                        type="text"
                        value={settings.notifications.webhook.url}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            webhook: { ...settings.notifications.webhook, url: e.target.value }
                          }
                        })}
                        placeholder="https://..."
                        className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Secret</label>
                      {renderSecretInput(
                        settings.notifications.webhook.secret,
                        (v) => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            webhook: { ...settings.notifications.webhook, secret: v }
                          }
                        }),
                        'webhook-secret',
                        'HMAC secret'
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alert Threshold */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Alert Threshold</h3>
            <p className="text-slate-400 mb-4">Minimum severity level for sending notifications</p>
            <div className="flex space-x-4">
              {['low', 'medium', 'high', 'critical'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      email: { ...settings.notifications.email, threshold: level }
                    }
                  })}
                  className={`flex-1 py-3 rounded-lg font-medium capitalize transition-colors ${
                    settings.notifications.email.threshold === level
                      ? level === 'critical' ? 'bg-red-500 text-white' :
                        level === 'high' ? 'bg-orange-500 text-white' :
                        level === 'medium' ? 'bg-yellow-500 text-black' :
                        'bg-green-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Test Notification */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Test Notifications</h3>
                <p className="text-slate-400 mt-1">Send a test alert to verify your configuration</p>
              </div>
              <button
                onClick={() => toast.success('Test notification sent!')}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
              >
                <TestTube size={18} />
                <span>Send Test</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
