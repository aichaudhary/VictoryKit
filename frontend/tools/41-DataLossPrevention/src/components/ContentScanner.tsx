import React, { useState } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { ScanResult } from '../types';
import { SEVERITY_STYLES, DATA_TYPE_CATEGORIES } from '../constants';

interface Props {
  onScan: (content: string) => Promise<ScanResult>;
  isLoading: boolean;
  results?: ScanResult[];
}

const ContentScanner: React.FC<Props> = ({ onScan, isLoading }) => {
  const [content, setContent] = useState('');
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [showRedacted, setShowRedacted] = useState(true);

  const handleScan = async () => {
    if (!content.trim()) return;
    try {
      const result = await onScan(content);
      setCurrentResult(result);
    } catch (error) {
      console.error('Scan failed:', error);
    }
  };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setContent(text);
  };

  const handleClear = () => {
    setContent('');
    setCurrentResult(null);
  };

  // Sample data for testing
  const loadSampleData = () => {
    setContent(`Customer Information:
Name: John Smith
Email: john.smith@example.com
Phone: (555) 123-4567

Payment Details:
Credit Card: 4532-1234-5678-9012
Expiration: 12/25
CVV: 123

Social Security: 123-45-6789
Driver License: D1234567

API Configuration:
AWS_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
DATABASE_PASSWORD=SuperSecret123!

Medical Record: MRN-2024-001234
Insurance ID: INS-9876543210`);
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'text-red-400',
      high: 'text-orange-400',
      medium: 'text-yellow-400',
      low: 'text-green-400',
    };
    return colors[severity] || 'text-slate-400';
  };


  return (
    <div className="space-y-6">
      {/* Scanner Input */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Search className="w-5 h-5 text-purple-400" />
            Content Scanner
          </h3>
          <div className="flex gap-2">
            <button
              onClick={loadSampleData}
              className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Load Sample
            </button>
            <button
              onClick={handlePaste}
              className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Paste
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste or type content to scan for sensitive data (PII, credit cards, SSN, API keys, etc.)..."
          className="w-full h-48 bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-sm font-mono resize-none focus:outline-none focus:border-purple-500/50 placeholder-slate-500"
        />

        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-slate-500">
            {content.length} characters • {content.split(/\s+/).filter(Boolean).length} words
          </p>
          <button
            onClick={handleScan}
            disabled={!content.trim() || isLoading}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Scan Content
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scan Result */}
      {currentResult && (
        <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Scan Results</h3>
            <button
              onClick={() => setShowRedacted(!showRedacted)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"
            >
              {showRedacted ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showRedacted ? 'Show Original' : 'Show Redacted'}
            </button>
          </div>

          {/* Risk Score */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(currentResult.riskScore / 100) * 251.2} 251.2`}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{currentResult.riskScore}</span>
              </div>
            </div>

            <div className="flex-1">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${SEVERITY_STYLES[currentResult.riskLevel]} border mb-2`}>
                {currentResult.riskLevel.toUpperCase()} RISK
              </div>
              <p className="text-slate-400 text-sm">
                {currentResult.findings?.length || 0} sensitive data patterns detected
              </p>
            </div>
          </div>

          {/* Findings */}
          {currentResult.findings && currentResult.findings.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-slate-300">Detected Sensitive Data:</h4>
              {currentResult.findings.map((finding, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-4 h-4 ${getSeverityColor(finding.severity)}`} />
                      <span className="font-medium">{finding.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${SEVERITY_STYLES[finding.severity]} border`}>
                        {finding.severity}
                      </span>
                    </div>
                    <span className="text-sm text-slate-400">{finding.count} found</span>
                  </div>
                  <p className="text-xs text-slate-500">Category: {finding.category}</p>
                  {finding.redactedSample && (
                    <p className="text-xs font-mono mt-2 text-slate-400 bg-slate-900 rounded px-2 py-1">
                      Sample: {finding.redactedSample}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <p className="font-medium text-green-400">No Sensitive Data Detected</p>
                <p className="text-sm text-slate-400">The scanned content appears to be clean.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Data Types Reference */}
      <div className="bg-slate-900/50 rounded-xl border border-purple-500/20 p-6">
        <h3 className="text-lg font-semibold mb-4">Detectable Data Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(DATA_TYPE_CATEGORIES).map(([category, types]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-purple-400">{category}</h4>
              <div className="space-y-1">
                {types.slice(0, 4).map((type: { id: string; name: string; icon: string }) => (
                  <div key={type.id} className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{type.icon}</span>
                    <span>{type.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentScanner;
