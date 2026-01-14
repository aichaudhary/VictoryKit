import React, { useState } from 'react';
import {
  Lock,
  Search,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Loader2,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Info,
  Eye,
  EyeOff,
  Key,
} from 'lucide-react';
import { scanAPI, PasswordCheckResult } from '../../services/scanAPI';

const PasswordChecker: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PasswordCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!password) {
      setError('Please enter a password to check');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      const checkResult = await scanAPI.checkPassword(password);
      setResult(checkResult);
    } catch (err: any) {
      setError(err.message || 'Failed to check password');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'safe': return 'text-green-400';
      case 'low': return 'text-blue-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'safe': return 'bg-green-500/20 border-green-500/30';
      case 'low': return 'bg-blue-500/20 border-blue-500/30';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'high': return 'bg-orange-500/20 border-orange-500/30';
      case 'critical': return 'bg-red-500/20 border-red-500/30';
      default: return 'bg-slate-500/20 border-slate-500/30';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'safe': return <ShieldCheck className="w-8 h-8 text-green-400" />;
      case 'low': return <Shield className="w-8 h-8 text-blue-400" />;
      case 'medium': return <AlertCircle className="w-8 h-8 text-yellow-400" />;
      case 'high': return <ShieldAlert className="w-8 h-8 text-orange-400" />;
      case 'critical': return <AlertTriangle className="w-8 h-8 text-red-400" />;
      default: return <Shield className="w-8 h-8 text-gray-400" />;
    }
  };

  const formatExposureCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 mb-4 shadow-lg shadow-yellow-500/30">
          <Key className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Password Breach Checker</h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          Check if your password has been exposed in data breaches. Uses secure k-anonymity - your full password is never sent over the network.
        </p>
      </div>

      {/* Security Notice */}
      <div className="max-w-2xl mx-auto p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-300">Your password is secure</h4>
            <p className="text-sm text-gray-400 mt-1">
              We use the k-anonymity model. Only the first 5 characters of the password hash are sent to check against breached passwords. Your actual password never leaves your device.
            </p>
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
            placeholder="Enter password to check"
            className="w-full pl-12 pr-44 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-gray-300 transition-all"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={handleCheck}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Check
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-red-300">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="max-w-2xl mx-auto">
          <div className="p-8 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-yellow-500 animate-spin" />
                <Lock className="w-8 h-8 text-yellow-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium">Checking password...</p>
                <p className="text-gray-400 text-sm mt-1">Securely comparing against breach database</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          {/* Risk Score Card */}
          <div className={`p-6 rounded-xl border ${getRiskBg(result.risk_level)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getRiskIcon(result.risk_level)}
                <div>
                  <h3 className={`text-xl font-bold ${getRiskColor(result.risk_level)}`}>
                    {result.is_compromised ? 'PASSWORD COMPROMISED!' : 'PASSWORD NOT FOUND IN BREACHES'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {result.is_compromised
                      ? 'This password has been exposed in data breaches'
                      : 'This password was not found in known data breaches'}
                  </p>
                </div>
              </div>
              {result.is_compromised && (
                <div className="text-right">
                  <div className="text-4xl font-bold text-red-400">
                    {formatExposureCount(result.exposure_count)}
                  </div>
                  <div className="text-xs text-gray-500">Times Exposed</div>
                </div>
              )}
            </div>
          </div>

          {/* Exposure Details */}
          {result.is_compromised && (
            <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="font-medium text-red-300">Exposure Details</span>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <p className="text-gray-300">
                  This password has appeared <strong className="text-red-400">{result.exposure_count.toLocaleString()}</strong> times in known data breaches.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Attackers frequently use lists of compromised passwords in brute-force attacks. You should immediately change any account using this password.
                </p>
              </div>
            </div>
          )}

          {/* Password Strength */}
          {result.strength && (
            <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">Password Strength</span>
              </div>
              
              {/* Strength Meter */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Strength Score</span>
                  <span className={`font-medium ${
                    result.strength.score >= 4 ? 'text-green-400' :
                    result.strength.score >= 3 ? 'text-blue-400' :
                    result.strength.score >= 2 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {result.strength.score}/4
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      result.strength.score >= 4 ? 'bg-green-500' :
                      result.strength.score >= 3 ? 'bg-blue-500' :
                      result.strength.score >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(result.strength.score / 4) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Weak</span>
                  <span>Strong</span>
                </div>
              </div>

              {/* Feedback */}
              {result.strength.feedback.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm text-gray-400">Suggestions</span>
                  {result.strength.feedback.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-slate-900/50 rounded-lg">
                      <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="p-5 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-blue-300">Recommendations</span>
              </div>
              <ul className="space-y-2">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Best Practices */}
          <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-yellow-400" />
              <span className="font-medium text-white">Password Best Practices</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2 p-3 bg-slate-900/50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">Use at least 12 characters</span>
              </div>
              <div className="flex items-start gap-2 p-3 bg-slate-900/50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">Mix uppercase, lowercase, numbers, symbols</span>
              </div>
              <div className="flex items-start gap-2 p-3 bg-slate-900/50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">Use a unique password for each account</span>
              </div>
              <div className="flex items-start gap-2 p-3 bg-slate-900/50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">Consider using a password manager</span>
              </div>
              <div className="flex items-start gap-2 p-3 bg-slate-900/50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">Enable two-factor authentication</span>
              </div>
              <div className="flex items-start gap-2 p-3 bg-slate-900/50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">Avoid personal info in passwords</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordChecker;
