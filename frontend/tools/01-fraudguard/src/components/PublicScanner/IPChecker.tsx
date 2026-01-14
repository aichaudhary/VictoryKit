import React, { useState } from 'react';
import {
  Wifi,
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
  Globe2,
  Server,
  Activity,
  Flag,
  Eye,
  Ban,
} from 'lucide-react';
import { scanAPI, IPCheckResult } from '../../services/scanAPI';

const IPChecker: React.FC = () => {
  const [ip, setIP] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IPCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!ip.trim()) {
      setError('Please enter an IP address');
      return;
    }

    // Basic IP validation
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (!ipv4Regex.test(ip.trim()) && !ipv6Regex.test(ip.trim())) {
      setError('Please enter a valid IPv4 or IPv6 address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      const checkResult = await scanAPI.checkIP(ip.trim());
      setResult(checkResult);
    } catch (err: any) {
      setError(err.message || 'Failed to check IP address');
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

  const checkMyIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setIP(data.ip);
    } catch (err) {
      setError('Could not detect your IP address');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 mb-4 shadow-lg shadow-orange-500/30">
          <Wifi className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">IP Reputation Checker</h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          Analyze IP addresses for abuse reports, proxy/VPN detection, and threat intelligence using AbuseIPDB and IPQualityScore
        </p>
      </div>

      {/* Search Box */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Wifi className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIP(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
            placeholder="Enter IP address (e.g., 8.8.8.8)"
            className="w-full pl-12 pr-48 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
            <button
              onClick={checkMyIP}
              className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-gray-300 transition-all"
            >
              My IP
            </button>
            <button
              onClick={handleCheck}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-medium hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-orange-500 animate-spin" />
                <Wifi className="w-8 h-8 text-orange-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium">Checking IP reputation...</p>
                <p className="text-gray-400 text-sm mt-1">Analyzing threat intelligence databases</p>
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
                    {result.is_threat ? 'THREAT DETECTED' : 'NO THREATS FOUND'}
                  </h3>
                  <p className="text-gray-400 text-sm font-mono">
                    {result.ip}
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

          {/* Geolocation & ISP */}
          {result.geolocation && (
            <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">Geolocation & Network</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-400">Country</span>
                  </div>
                  <span className="text-white">
                    {result.geolocation.country} ({result.geolocation.country_code})
                  </span>
                </div>
                {result.geolocation.region && (
                  <div className="p-3 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-400">Region</span>
                    </div>
                    <span className="text-white">{result.geolocation.region}</span>
                  </div>
                )}
                {result.geolocation.city && (
                  <div className="p-3 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-400">City</span>
                    </div>
                    <span className="text-white">{result.geolocation.city}</span>
                  </div>
                )}
                {result.geolocation.isp && (
                  <div className="p-3 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Server className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-400">ISP</span>
                    </div>
                    <span className="text-white">{result.geolocation.isp}</span>
                  </div>
                )}
                {result.geolocation.org && (
                  <div className="p-3 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Server className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-400">Organization</span>
                    </div>
                    <span className="text-white">{result.geolocation.org}</span>
                  </div>
                )}
                {result.geolocation.asn && (
                  <div className="p-3 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-400">ASN</span>
                    </div>
                    <span className="text-white font-mono">{result.geolocation.asn}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Threat Intelligence */}
          {result.threat_intel && (
            <div className={`p-5 rounded-xl border ${
              result.threat_intel.abuse_confidence > 50 || result.threat_intel.total_reports > 10
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-slate-800/30 border-slate-700/50'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-orange-400" />
                <span className="font-medium text-white">Threat Intelligence</span>
              </div>

              {/* Abuse Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                  <div className={`text-2xl font-bold ${
                    result.threat_intel.abuse_confidence > 75 ? 'text-red-400' :
                    result.threat_intel.abuse_confidence > 50 ? 'text-orange-400' :
                    result.threat_intel.abuse_confidence > 25 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {result.threat_intel.abuse_confidence}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Abuse Confidence</div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                  <div className={`text-2xl font-bold ${
                    result.threat_intel.total_reports > 100 ? 'text-red-400' :
                    result.threat_intel.total_reports > 10 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {result.threat_intel.total_reports}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Abuse Reports</div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                  <div className={`text-2xl font-bold ${
                    result.threat_intel.is_whitelisted ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {result.threat_intel.is_whitelisted ? 'Yes' : 'No'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Whitelisted</div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg text-center">
                  <div className={`text-2xl font-bold ${
                    result.threat_intel.is_bot ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {result.threat_intel.is_bot ? 'Yes' : 'No'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Bot Detected</div>
                </div>
              </div>

              {/* Detection Flags */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  result.threat_intel.is_tor ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-slate-900/50'
                }`}>
                  <Eye className={`w-4 h-4 ${result.threat_intel.is_tor ? 'text-purple-400' : 'text-gray-500'}`} />
                  <div>
                    <div className="text-xs text-gray-500">TOR Exit</div>
                    <div className={result.threat_intel.is_tor ? 'text-purple-400' : 'text-gray-400'}>
                      {result.threat_intel.is_tor ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  result.threat_intel.is_proxy ? 'bg-orange-500/20 border border-orange-500/30' : 'bg-slate-900/50'
                }`}>
                  <Server className={`w-4 h-4 ${result.threat_intel.is_proxy ? 'text-orange-400' : 'text-gray-500'}`} />
                  <div>
                    <div className="text-xs text-gray-500">Proxy</div>
                    <div className={result.threat_intel.is_proxy ? 'text-orange-400' : 'text-gray-400'}>
                      {result.threat_intel.is_proxy ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  result.threat_intel.is_vpn ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-slate-900/50'
                }`}>
                  <Shield className={`w-4 h-4 ${result.threat_intel.is_vpn ? 'text-blue-400' : 'text-gray-500'}`} />
                  <div>
                    <div className="text-xs text-gray-500">VPN</div>
                    <div className={result.threat_intel.is_vpn ? 'text-blue-400' : 'text-gray-400'}>
                      {result.threat_intel.is_vpn ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  result.threat_intel.is_datacenter ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-slate-900/50'
                }`}>
                  <Server className={`w-4 h-4 ${result.threat_intel.is_datacenter ? 'text-cyan-400' : 'text-gray-500'}`} />
                  <div>
                    <div className="text-xs text-gray-500">Datacenter</div>
                    <div className={result.threat_intel.is_datacenter ? 'text-cyan-400' : 'text-gray-400'}>
                      {result.threat_intel.is_datacenter ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              {result.threat_intel.categories && result.threat_intel.categories.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-gray-400 mb-2">Abuse Categories</div>
                  <div className="flex flex-wrap gap-2">
                    {result.threat_intel.categories.map((cat, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Reports */}
              {result.threat_intel.recent_reports && result.threat_intel.recent_reports.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-gray-400 mb-2">Recent Abuse Reports</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {result.threat_intel.recent_reports.slice(0, 5).map((report, idx) => (
                      <div key={idx} className="p-3 bg-slate-900/50 rounded-lg flex items-start gap-3">
                        <Flag className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm text-white">{report.category}</div>
                          {report.comment && (
                            <p className="text-xs text-gray-500 mt-1">{report.comment}</p>
                          )}
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date(report.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
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
        </div>
      )}
    </div>
  );
};

export default IPChecker;
