import React, { useState } from 'react';
import {
  Globe,
  Search,
  AlertTriangle,
  CheckCircle2,
  Shield,
  ExternalLink,
  Clock,
  Eye,
  Loader2,
  Link2,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { scanAPI, URLScanResult } from '../../services/scanAPI';

const URLScanner: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<URLScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deepScan, setDeepScan] = useState(false);

  const handleScan = async () => {
    if (!url.trim()) {
      setError('Please enter a URL to scan');
      return;
    }

    // Basic URL validation
    let urlToScan = url.trim();
    if (!urlToScan.startsWith('http://') && !urlToScan.startsWith('https://')) {
      urlToScan = 'https://' + urlToScan;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      
      const scanResult = await scanAPI.scanURL(urlToScan, { deep_scan: deepScan });
      setResult(scanResult);
    } catch (err: any) {
      setError(err.message || 'Failed to scan URL');
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4 shadow-lg shadow-cyan-500/30">
          <Globe className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">URL Security Scanner</h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          Analyze any website for malware, phishing, and security threats using VirusTotal, Google Safe Browsing, and URLScan.io
        </p>
      </div>

      {/* Search Box */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Link2 className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleScan()}
            placeholder="Enter URL to scan (e.g., example.com)"
            className="w-full pl-12 pr-32 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
          <button
            onClick={handleScan}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Scan
              </>
            )}
          </button>
        </div>

        {/* Options */}
        <div className="flex items-center gap-4 mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={deepScan}
              onChange={(e) => setDeepScan(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500/20"
            />
            <span className="text-sm text-gray-400">Deep scan (includes live website analysis)</span>
          </label>
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
                <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-cyan-500 animate-spin" />
                <Globe className="w-8 h-8 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium">Scanning URL...</p>
                <p className="text-gray-400 text-sm mt-1">Checking against multiple security databases</p>
              </div>
              <div className="flex gap-2 mt-2">
                <div className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-gray-400 animate-pulse">VirusTotal</div>
                <div className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}>Safe Browsing</div>
                <div className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }}>URLScan</div>
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
                    {result.risk_level.toUpperCase()} RISK
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {result.is_safe ? 'This URL appears to be safe' : 'Potential threats detected'}
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

          {/* URL Info */}
          <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span className="font-medium text-white">URL Information</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">Scanned URL</span>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-cyan-400 hover:underline break-all">
                  {result.url}
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              </div>
              {result.final_url && result.final_url !== result.url && (
                <div>
                  <span className="text-xs text-gray-500">Final URL (after redirects)</span>
                  <p className="text-gray-300 break-all">{result.final_url}</p>
                </div>
              )}
              <div>
                <span className="text-xs text-gray-500">Scan ID</span>
                <p className="text-gray-300 font-mono text-sm">{result.scan_id}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Scanned At</span>
                <p className="text-gray-300">{new Date(result.scanned_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Threats */}
          {result.threats.length > 0 && (
            <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="font-medium text-red-300">Detected Threats ({result.threats.length})</span>
              </div>
              <div className="space-y-3">
                {result.threats.map((threat, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/50 rounded-lg border border-red-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white">{threat.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        threat.severity === 'critical' ? 'bg-red-500/30 text-red-300' :
                        threat.severity === 'high' ? 'bg-orange-500/30 text-orange-300' :
                        'bg-yellow-500/30 text-yellow-300'
                      }`}>
                        {threat.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{threat.description || `Detected by ${threat.source}`}</p>
                    <p className="text-xs text-gray-500 mt-1">Source: {threat.source}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {result.categories.length > 0 && (
            <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">Website Categories</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.categories.map((cat, idx) => (
                  <span key={idx} className="px-3 py-1 bg-slate-700/50 rounded-full text-sm text-gray-300">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* VirusTotal */}
            {result.analysis.virustotal && (
              <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-white text-sm">VirusTotal</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Malicious</span>
                    <span className="text-red-400 font-medium">{result.analysis.virustotal.malicious}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Suspicious</span>
                    <span className="text-yellow-400 font-medium">{result.analysis.virustotal.suspicious}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Harmless</span>
                    <span className="text-green-400 font-medium">{result.analysis.virustotal.harmless}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Reputation</span>
                    <span className="text-gray-300 font-medium">{result.analysis.virustotal.reputation}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Safe Browsing */}
            {result.analysis.safe_browsing && (
              <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-white text-sm">Google Safe Browsing</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {result.analysis.safe_browsing.is_safe ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={result.analysis.safe_browsing.is_safe ? 'text-green-400' : 'text-red-400'}>
                    {result.analysis.safe_browsing.is_safe ? 'No threats found' : 'Threats detected'}
                  </span>
                </div>
                {result.analysis.safe_browsing.threats.length > 0 && (
                  <div className="space-y-1">
                    {result.analysis.safe_browsing.threats.map((t, i) => (
                      <div key={i} className="text-sm text-red-300 bg-red-500/10 px-2 py-1 rounded">
                        {t}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* URLScan */}
            {result.analysis.urlscan && (
              <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-5 h-5 text-cyan-400" />
                  <span className="font-medium text-white text-sm">URLScan.io</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Verdict</span>
                    <span className={
                      result.analysis.urlscan.verdict === 'safe' ? 'text-green-400' :
                      result.analysis.urlscan.verdict === 'malicious' ? 'text-red-400' : 'text-yellow-400'
                    }>
                      {result.analysis.urlscan.verdict || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Score</span>
                    <span className="text-gray-300">{result.analysis.urlscan.score}/100</span>
                  </div>
                  {result.analysis.urlscan.screenshot_url && (
                    <a
                      href={result.analysis.urlscan.screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-cyan-400 hover:underline mt-2"
                    >
                      <Eye className="w-3 h-3" />
                      View Screenshot
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default URLScanner;
