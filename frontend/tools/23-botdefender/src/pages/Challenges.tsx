import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Lock,
  CheckCircle,
  XCircle,
  Shield,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { captchaApi, challengeApi } from '../services/api';
import { Challenge } from '../types';

export default function Challenges() {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview');

  const { data: challenges } = useQuery({
    queryKey: ['challenges'],
    queryFn: challengeApi.getAll,
  });

  const { data: _captchaConfig } = useQuery({
    queryKey: ['captcha-config'],
    queryFn: captchaApi.getConfig,
  });

  // Demo data
  const demoStats = {
    totalChallenges: 12543,
    successRate: 78.5,
    failedAttempts: 2698,
    blockedAfterFail: 1845,
    avgSolveTime: 4.2,
  };

  const demoChallenges: Challenge[] = Array.from({ length: 15 }, (_, i) => ({
    _id: `challenge-${i}`,
    type: ['recaptcha', 'hcaptcha', 'turnstile', 'js_challenge'][Math.floor(Math.random() * 4)] as Challenge['type'],
    ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    status: ['pending', 'solved', 'failed', 'expired'][Math.floor(Math.random() * 4)] as Challenge['status'],
    attempts: Math.floor(Math.random() * 3) + 1,
    solveTime: Math.random() * 10 + 1,
    issuedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    solvedAt: Math.random() > 0.3 ? new Date().toISOString() : undefined,
    metadata: {},
    createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const challengesList = challenges?.data || demoChallenges;

  const captchaProviders = [
    {
      id: 'recaptcha',
      name: 'Google reCAPTCHA v3',
      description: 'Invisible bot detection with risk scoring',
      icon: '🔵',
      enabled: true,
      threshold: 0.5,
    },
    {
      id: 'hcaptcha',
      name: 'hCaptcha',
      description: 'Privacy-focused challenge with visual puzzles',
      icon: '🟣',
      enabled: true,
      threshold: 0.7,
    },
    {
      id: 'turnstile',
      name: 'Cloudflare Turnstile',
      description: 'Non-interactive challenge with privacy',
      icon: '🟠',
      enabled: false,
      threshold: 0.5,
    },
    {
      id: 'js_challenge',
      name: 'JavaScript Challenge',
      description: 'Browser-based proof-of-work challenge',
      icon: '🟡',
      enabled: true,
      threshold: null,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'solved':
        return 'bg-green-500/20 text-green-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      case 'pending':
        return 'bg-orange-500/20 text-orange-400';
      case 'expired':
        return 'bg-slate-500/20 text-slate-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'recaptcha':
        return 'bg-blue-500/20 text-blue-400';
      case 'hcaptcha':
        return 'bg-purple-500/20 text-purple-400';
      case 'turnstile':
        return 'bg-orange-500/20 text-orange-400';
      case 'js_challenge':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Challenges</h1>
          <p className="text-slate-400 mt-1">CAPTCHA and challenge configuration</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-800 rounded-lg p-1 w-fit">
        {['overview', 'history', 'settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-orange-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-lg border border-slate-700 p-4"
            >
              <div className="flex items-center space-x-2 text-slate-400 mb-2">
                <Lock size={18} />
                <span className="text-sm">Total Challenges</span>
              </div>
              <p className="text-2xl font-bold text-white">{demoStats.totalChallenges.toLocaleString()}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800 rounded-lg border border-slate-700 p-4"
            >
              <div className="flex items-center space-x-2 text-green-400 mb-2">
                <CheckCircle size={18} />
                <span className="text-sm">Success Rate</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{demoStats.successRate}%</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800 rounded-lg border border-slate-700 p-4"
            >
              <div className="flex items-center space-x-2 text-red-400 mb-2">
                <XCircle size={18} />
                <span className="text-sm">Failed Attempts</span>
              </div>
              <p className="text-2xl font-bold text-red-400">{demoStats.failedAttempts.toLocaleString()}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800 rounded-lg border border-slate-700 p-4"
            >
              <div className="flex items-center space-x-2 text-orange-400 mb-2">
                <Shield size={18} />
                <span className="text-sm">Blocked After Fail</span>
              </div>
              <p className="text-2xl font-bold text-orange-400">{demoStats.blockedAfterFail.toLocaleString()}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-800 rounded-lg border border-slate-700 p-4"
            >
              <div className="flex items-center space-x-2 text-blue-400 mb-2">
                <Clock size={18} />
                <span className="text-sm">Avg Solve Time</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{demoStats.avgSolveTime}s</p>
            </motion.div>
          </div>

          {/* CAPTCHA Providers */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">CAPTCHA Providers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {captchaProviders.map((provider) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-lg border ${
                    provider.enabled 
                      ? 'bg-slate-700/50 border-slate-600' 
                      : 'bg-slate-800/50 border-slate-700 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{provider.icon}</span>
                      <div>
                        <h4 className="text-white font-medium">{provider.name}</h4>
                        <p className="text-xs text-slate-400">{provider.description}</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                      provider.enabled ? 'bg-green-500' : 'bg-slate-600'
                    }`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        provider.enabled ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                  {provider.threshold !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Threshold</span>
                      <span className="text-white">{provider.threshold}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Challenge Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Challenge by Type</h3>
              <div className="space-y-4">
                {[
                  { type: 'reCAPTCHA v3', count: 5234, percentage: 42, color: 'blue' },
                  { type: 'hCaptcha', count: 4123, percentage: 33, color: 'purple' },
                  { type: 'Turnstile', count: 1876, percentage: 15, color: 'orange' },
                  { type: 'JS Challenge', count: 1310, percentage: 10, color: 'yellow' },
                ].map((item) => (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-400">{item.type}</span>
                      <span className="text-sm text-white">{item.count.toLocaleString()} ({item.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full bg-${item.color}-500 rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Challenge Outcomes</h3>
              <div className="space-y-4">
                {[
                  { status: 'Solved', count: 9850, percentage: 78, color: 'green' },
                  { status: 'Failed', count: 1890, percentage: 15, color: 'red' },
                  { status: 'Expired', count: 628, percentage: 5, color: 'slate' },
                  { status: 'Pending', count: 175, percentage: 2, color: 'orange' },
                ].map((item) => (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-400">{item.status}</span>
                      <span className="text-sm text-white">{item.count.toLocaleString()} ({item.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full bg-${item.color}-500 rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">IP Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Attempts</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Solve Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Issued At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {challengesList.map((challenge: Challenge) => (
                  <tr key={challenge._id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-4 text-sm text-white font-mono">{challenge.ipAddress}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getTypeBadge(challenge.type)}`}>
                        {challenge.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${getStatusBadge(challenge.status)}`}>
                        {challenge.status === 'solved' ? <CheckCircle size={12} /> : 
                         challenge.status === 'failed' ? <XCircle size={12} /> : 
                         <Clock size={12} />}
                        <span className="capitalize">{challenge.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-400">{challenge.attempts}</td>
                    <td className="px-4 py-4 text-sm text-slate-400">
                      {challenge.solveTime ? `${challenge.solveTime.toFixed(1)}s` : '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-400">
                      {challenge.issuedAt ? new Date(challenge.issuedAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">Auto Challenge Suspicious IPs</p>
                  <p className="text-sm text-slate-400">Automatically issue challenges to suspicious traffic</p>
                </div>
                <div className="w-12 h-6 rounded-full p-1 cursor-pointer bg-green-500">
                  <div className="w-4 h-4 rounded-full bg-white translate-x-6" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">Block After Failed Challenges</p>
                  <p className="text-sm text-slate-400">Block IPs that fail challenges multiple times</p>
                </div>
                <div className="w-12 h-6 rounded-full p-1 cursor-pointer bg-green-500">
                  <div className="w-4 h-4 rounded-full bg-white translate-x-6" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Challenge Expiry (seconds)</label>
                  <input
                    type="number"
                    defaultValue={300}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Max Attempts</label>
                  <input
                    type="number"
                    defaultValue={3}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Provider Configuration */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Provider Configuration</h3>
            <div className="space-y-4">
              {/* reCAPTCHA */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-xl">🔵</span>
                  <h4 className="text-white font-medium">Google reCAPTCHA v3</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Site Key</label>
                    <input
                      type="text"
                      placeholder="6Lc..."
                      className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Score Threshold</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      defaultValue={0.5}
                      className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* hCaptcha */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-xl">🟣</span>
                  <h4 className="text-white font-medium">hCaptcha</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Site Key</label>
                    <input
                      type="text"
                      placeholder="..."
                      className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Difficulty</label>
                    <select className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-orange-500">
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="difficult">Difficult</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Turnstile */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-xl">🟠</span>
                  <h4 className="text-white font-medium">Cloudflare Turnstile</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Site Key</label>
                    <input
                      type="text"
                      placeholder="0x..."
                      className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Mode</label>
                    <select className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:border-orange-500">
                      <option value="managed">Managed</option>
                      <option value="non-interactive">Non-Interactive</option>
                      <option value="invisible">Invisible</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center space-x-2">
              <RefreshCw size={18} />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
