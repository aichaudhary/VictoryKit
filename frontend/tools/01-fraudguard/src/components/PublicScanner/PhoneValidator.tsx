import React, { useState } from 'react';
import {
  Phone,
  Search,
  AlertTriangle,
  CheckCircle2,
  Shield,
  MapPin,
  Loader2,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Info,
  Radio,
  Wifi,
  Globe2,
  Clock,
} from 'lucide-react';
import { scanAPI, PhoneValidationResult } from '../../services/scanAPI';

const PhoneValidator: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PhoneValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!phone.trim()) {
      setError('Please enter a phone number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      const validationResult = await scanAPI.validatePhone(
        phone.trim(),
        countryCode.trim() || undefined
      );
      setResult(validationResult);
    } catch (err: any) {
      setError(err.message || 'Failed to validate phone number');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 mb-4 shadow-lg shadow-green-500/30">
          <Phone className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Phone Number Validator</h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          Validate phone numbers and detect spam, VoIP, and fraud indicators using carrier lookup and fraud intelligence
        </p>
      </div>

      {/* Search Box */}
      <div className="max-w-2xl mx-auto">
        <div className="flex gap-2">
          <div className="relative w-28">
            <input
              type="text"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              placeholder="US"
              className="w-full px-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-center"
            />
            <span className="absolute -top-2 left-2 text-xs text-gray-500 bg-slate-900 px-1">Country</span>
          </div>
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
              placeholder="Enter phone number (e.g., +1 555 123 4567)"
              className="w-full pl-12 pr-32 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
            />
            <button
              onClick={handleValidate}
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg font-medium hover:from-green-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Validate
                </>
              )}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Enter the phone number with or without country code. You can specify the country code separately for better accuracy.
        </p>
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
                <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-green-500 animate-spin" />
                <Phone className="w-8 h-8 text-green-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium">Validating phone number...</p>
                <p className="text-gray-400 text-sm mt-1">Checking carrier and fraud databases</p>
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
                    {result.valid ? 'VALID NUMBER' : 'INVALID NUMBER'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {result.formatted?.international || result.phone}
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

          {/* Phone Formats */}
          {result.formatted && (
            <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-green-400" />
                <span className="font-medium text-white">Formatted Numbers</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <span className="text-xs text-gray-500 block mb-1">International</span>
                  <span className="text-white font-mono">{result.formatted.international}</span>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <span className="text-xs text-gray-500 block mb-1">Local</span>
                  <span className="text-white font-mono">{result.formatted.local}</span>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <span className="text-xs text-gray-500 block mb-1">E.164</span>
                  <span className="text-white font-mono">{result.formatted.e164}</span>
                </div>
              </div>
            </div>
          )}

          {/* Location & Carrier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location */}
            {result.location && (
              <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-white">Location</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Globe2 className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-gray-400 text-sm">Country: </span>
                      <span className="text-white">{result.location.country} ({result.location.country_code})</span>
                    </div>
                  </div>
                  {result.location.region && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="text-gray-400 text-sm">Region: </span>
                        <span className="text-white">{result.location.region}</span>
                      </div>
                    </div>
                  )}
                  {result.location.city && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="text-gray-400 text-sm">City: </span>
                        <span className="text-white">{result.location.city}</span>
                      </div>
                    </div>
                  )}
                  {result.location.timezone && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="text-gray-400 text-sm">Timezone: </span>
                        <span className="text-white">{result.location.timezone}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Carrier */}
            {result.carrier && (
              <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Radio className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-white">Carrier Information</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Radio className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-gray-400 text-sm">Carrier: </span>
                      <span className="text-white">{result.carrier.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wifi className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-gray-400 text-sm">Type: </span>
                      <span className="text-white capitalize">{result.carrier.type}</span>
                    </div>
                  </div>
                  {result.line_type && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div>
                        <span className="text-gray-400 text-sm">Line Type: </span>
                        <span className="text-white capitalize">{result.line_type}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Fraud Indicators */}
          {result.fraud_indicators && (
            <div className={`p-5 rounded-xl border ${
              result.fraud_indicators.is_risky || result.fraud_indicators.spam_score > 50
                ? 'bg-orange-500/10 border-orange-500/30'
                : 'bg-slate-800/30 border-slate-700/50'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-orange-400" />
                <span className="font-medium text-white">Fraud Indicators</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                  <div className={`text-2xl font-bold ${
                    result.fraud_indicators.is_voip ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {result.fraud_indicators.is_voip ? 'Yes' : 'No'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">VoIP</div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                  <div className={`text-2xl font-bold ${
                    result.fraud_indicators.is_prepaid ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {result.fraud_indicators.is_prepaid ? 'Yes' : 'No'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Prepaid</div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                  <div className={`text-2xl font-bold ${
                    result.fraud_indicators.is_risky ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {result.fraud_indicators.is_risky ? 'Yes' : 'No'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Risky</div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                  <div className={`text-2xl font-bold ${
                    result.fraud_indicators.spam_score > 50 ? 'text-red-400' : 
                    result.fraud_indicators.spam_score > 25 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {result.fraud_indicators.spam_score}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Spam Score</div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                  <div className={`text-2xl font-bold ${
                    result.fraud_indicators.leak_count > 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {result.fraud_indicators.leak_count}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Data Leaks</div>
                </div>
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

export default PhoneValidator;
