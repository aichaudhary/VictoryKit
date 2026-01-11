import React, { useState } from 'react';
import {
  Mail,
  Search,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Calendar,
  Database,
  Loader2,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Info,
  Lock,
  Users,
  Eye,
  EyeOff,
} from 'lucide-react';
import { scanAPI, EmailCheckResult } from '../../services/scanAPI';

const EmailChecker: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      const checkResult = await scanAPI.checkEmail(email.trim());
      setResult(checkResult);
    } catch (err: any) {
      setError(err.message || 'Failed to check email');
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

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 mb-4 shadow-lg shadow-purple-500/30">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Email Breach Checker</h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          Check if your email has been exposed in data breaches using Have I Been Pwned and advanced fraud detection
        </p>
      </div>

      {/* Search Box */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
            placeholder="Enter email address to check"
            className="w-full pl-12 pr-32 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
          <button
            onClick={handleCheck}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-purple-500 animate-spin" />
                <Mail className="w-8 h-8 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium">Checking email...</p>
                <p className="text-gray-400 text-sm mt-1">Searching breach databases</p>
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
                    {result.total_breaches === 0 ? 'NO BREACHES FOUND' : `${result.total_breaches} BREACH${result.total_breaches > 1 ? 'ES' : ''} FOUND`}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {result.email}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${getRiskColor(result.risk_level)}`}>
                  {result.risk_score}
                </div>
                <div className="text-xs text-gray-500">Risk Score / 100</div>
              </div>
            </div>
          </div>

          {/* Email Validation */}
          {result.email_validation && (
            <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">Email Analysis</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    {result.email_validation.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-sm text-gray-400">Valid</span>
                  </div>
                  <span className={result.email_validation.valid ? 'text-green-400' : 'text-red-400'}>
                    {result.email_validation.valid ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    {!result.email_validation.disposable ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-400" />
                    )}
                    <span className="text-sm text-gray-400">Disposable</span>
                  </div>
                  <span className={!result.email_validation.disposable ? 'text-green-400' : 'text-orange-400'}>
                    {result.email_validation.disposable ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-400">Deliverability</span>
                  </div>
                  <span className="text-gray-300 capitalize">{result.email_validation.deliverability}</span>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-400">Fraud Score</span>
                  </div>
                  <span className={result.email_validation.fraud_score > 75 ? 'text-red-400' : 
                    result.email_validation.fraud_score > 50 ? 'text-yellow-400' : 'text-green-400'}>
                    {result.email_validation.fraud_score}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Breaches */}
          {result.breaches.length > 0 && (
            <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-red-400" />
                  <span className="font-medium text-red-300">Data Breaches</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {result.earliest_breach && (
                    <span className="text-gray-400">
                      Earliest: {new Date(result.earliest_breach).toLocaleDateString()}
                    </span>
                  )}
                  {result.latest_breach && (
                    <span className="text-gray-400">
                      Latest: {new Date(result.latest_breach).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {result.breaches.map((breach, idx) => (
                  <div key={idx} className="p-4 bg-slate-900/50 rounded-lg border border-red-500/20">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-white">{breach.name}</h4>
                        <p className="text-sm text-gray-400">{breach.domain}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {breach.is_verified && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300">
                            Verified
                          </span>
                        )}
                        {breach.is_sensitive && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/30 text-red-300">
                            Sensitive
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-400">Breached: {new Date(breach.breach_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-400">Affected: {formatNumber(breach.pwn_count)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {breach.data_classes.map((dc, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-700/50 text-gray-300">
                          {dc}
                        </span>
                      ))}
                    </div>
                    {breach.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{breach.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exposed Data Types */}
          {result.exposed_data_types.length > 0 && (
            <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-yellow-400" />
                <span className="font-medium text-white">Types of Data Exposed</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.exposed_data_types.map((type, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-300">
                    {type}
                  </span>
                ))}
              </div>
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
        </div>
      )}
    </div>
  );
};

export default EmailChecker;
