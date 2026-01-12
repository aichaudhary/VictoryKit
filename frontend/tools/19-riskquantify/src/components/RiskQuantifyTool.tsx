/**
 * RiskQuantify Tool - Tool 19 - Payment Risk Checker
 * User-facing tool to check payment declines, fraud flags, device risk scores
 * Theme: Violet/Purple
 * Port: Frontend 3019, API 4019
 */
import { useState } from 'react';

interface RiskCheckResult {
  transactionId: string;
  status: 'approved' | 'declined' | 'flagged' | 'pending';
  riskScore: number;
  deviceTrust: number;
  checks: {
    vpnDetected: boolean;
    proxyDetected: boolean;
    torDetected: boolean;
    datacenterIp: boolean;
    locationMismatch: boolean;
    deviceAnomaly: boolean;
    velocityFlag: boolean;
    blacklistedDevice: boolean;
  };
  deviceInfo: {
    fingerprint: string;
    browser: string;
    os: string;
    device: string;
    ip: string;
    location: string;
    isp: string;
  };
  flags: string[];
  recommendations: string[];
  timestamp: string;
}

export default function RiskQuantifyTool() {
  const [searchType, setSearchType] = useState<'transaction' | 'email' | 'device'>('transaction');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RiskCheckResult | null>(null);
  const [error, setError] = useState('');

  // Simulated check - in production this calls actual API
  const performRiskCheck = async () => {
    if (!searchValue.trim()) {
      setError('Please enter a value to search');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate simulated result based on input
    const hash = searchValue.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
    const riskScore = Math.abs(hash % 100);
    const deviceTrust = 100 - Math.abs((hash * 7) % 60);

    const statuses: ('approved' | 'declined' | 'flagged' | 'pending')[] = ['approved', 'declined', 'flagged', 'pending'];
    const statusIndex = riskScore > 70 ? 1 : riskScore > 50 ? 2 : riskScore > 30 ? 3 : 0;

    const result: RiskCheckResult = {
      transactionId: searchType === 'transaction' ? searchValue : `TXN-${Math.abs(hash).toString(16).toUpperCase().slice(0, 8)}`,
      status: statuses[statusIndex],
      riskScore,
      deviceTrust,
      checks: {
        vpnDetected: riskScore > 60,
        proxyDetected: riskScore > 70,
        torDetected: riskScore > 85,
        datacenterIp: riskScore > 55,
        locationMismatch: riskScore > 45,
        deviceAnomaly: riskScore > 65,
        velocityFlag: riskScore > 75,
        blacklistedDevice: riskScore > 90
      },
      deviceInfo: {
        fingerprint: `FP-${Math.abs(hash).toString(16).toUpperCase().slice(0, 12)}`,
        browser: 'Chrome 120.0',
        os: 'Windows 11',
        device: 'Desktop',
        ip: `${Math.abs(hash % 255)}.${Math.abs((hash * 2) % 255)}.${Math.abs((hash * 3) % 255)}.${Math.abs((hash * 4) % 255)}`,
        location: riskScore > 50 ? 'Unknown Region' : 'New York, US',
        isp: riskScore > 60 ? 'DataCenter Provider' : 'Comcast Cable'
      },
      flags: [
        ...(riskScore > 60 ? ['VPN/Proxy connection detected'] : []),
        ...(riskScore > 70 ? ['High-risk IP address'] : []),
        ...(riskScore > 50 ? ['Location does not match billing address'] : []),
        ...(riskScore > 65 ? ['Device fingerprint anomaly'] : []),
        ...(riskScore > 75 ? ['Multiple failed attempts detected'] : []),
        ...(riskScore > 80 ? ['Suspicious transaction velocity'] : []),
        ...(riskScore > 90 ? ['Device previously flagged for fraud'] : [])
      ],
      recommendations: [
        ...(riskScore > 60 ? ['Disable VPN or proxy before making payment'] : []),
        ...(riskScore > 50 ? ['Verify your billing address matches your location'] : []),
        ...(riskScore > 70 ? ['Try using a residential internet connection'] : []),
        ...(riskScore > 65 ? ['Clear browser cookies and try again'] : []),
        ...(riskScore > 75 ? ['Wait 24 hours before attempting another transaction'] : []),
        ...(riskScore > 80 ? ['Contact support for manual verification'] : []),
        ...(riskScore < 40 ? ['Your payment should process normally'] : [])
      ],
      timestamp: new Date().toISOString()
    };

    setResult(result);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'declined': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'flagged': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'pending': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 50) return 'text-yellow-400';
    if (score >= 30) return 'text-orange-400';
    return 'text-green-400';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return 'High Risk';
    if (score >= 50) return 'Medium Risk';
    if (score >= 30) return 'Low Risk';
    return 'Very Low Risk';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-violet-500/20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <a
                href="https://maula.ai"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-violet-500/30 rounded-lg text-gray-300 hover:text-white transition-all flex items-center gap-2"
              >
                <span>←</span>
                <span>Maula.AI</span>
              </a>
              
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                  <span className="text-xl">🛡️</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">RiskQuantify</h1>
                  <p className="text-violet-400/70 text-sm">Payment Risk Checker</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>System Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Check Payment Risk</h2>
          <p className="text-gray-400 mb-6">
            Enter your transaction ID, email, or device ID to check why your payment was declined or flagged.
          </p>

          {/* Search Type Tabs */}
          <div className="flex gap-2 mb-4">
            {[
              { id: 'transaction', label: 'Transaction ID', icon: '🔢' },
              { id: 'email', label: 'Email', icon: '📧' },
              { id: 'device', label: 'Device ID', icon: '📱' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSearchType(tab.id as typeof searchType)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  searchType === tab.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && performRiskCheck()}
              placeholder={
                searchType === 'transaction' ? 'Enter transaction ID (e.g., TXN-ABC123)' :
                searchType === 'email' ? 'Enter email address' :
                'Enter device fingerprint ID'
              }
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
            <button
              onClick={performRiskCheck}
              disabled={loading}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span>Check Risk</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-red-400 text-sm">{error}</p>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`rounded-xl border p-4 ${getStatusColor(result.status)}`}>
                <p className="text-sm opacity-70 mb-1">Payment Status</p>
                <p className="text-2xl font-bold capitalize">{result.status}</p>
              </div>
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <p className="text-gray-400 text-sm mb-1">Risk Score</p>
                <p className={`text-2xl font-bold ${getRiskColor(result.riskScore)}`}>
                  {result.riskScore}/100
                </p>
                <p className={`text-sm ${getRiskColor(result.riskScore)}`}>{getRiskLevel(result.riskScore)}</p>
              </div>
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <p className="text-gray-400 text-sm mb-1">Device Trust</p>
                <p className={`text-2xl font-bold ${result.deviceTrust >= 70 ? 'text-green-400' : result.deviceTrust >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {result.deviceTrust}%
                </p>
              </div>
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <p className="text-gray-400 text-sm mb-1">Transaction ID</p>
                <p className="text-lg font-mono text-violet-400">{result.transactionId}</p>
              </div>
            </div>

            {/* Security Checks */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>🔒</span>
                Security Checks
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'VPN Detection', value: result.checks.vpnDetected, icon: '🌐' },
                  { label: 'Proxy Detection', value: result.checks.proxyDetected, icon: '🔄' },
                  { label: 'Tor Network', value: result.checks.torDetected, icon: '🧅' },
                  { label: 'Datacenter IP', value: result.checks.datacenterIp, icon: '🏢' },
                  { label: 'Location Mismatch', value: result.checks.locationMismatch, icon: '📍' },
                  { label: 'Device Anomaly', value: result.checks.deviceAnomaly, icon: '⚠️' },
                  { label: 'Velocity Flag', value: result.checks.velocityFlag, icon: '⚡' },
                  { label: 'Blacklisted Device', value: result.checks.blacklistedDevice, icon: '🚫' }
                ].map((check, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${check.value ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{check.icon}</span>
                      <span className="text-sm text-gray-300">{check.label}</span>
                    </div>
                    <p className={`font-semibold ${check.value ? 'text-red-400' : 'text-green-400'}`}>
                      {check.value ? 'Detected' : 'Clear'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Information */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📱</span>
                Device Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Fingerprint', value: result.deviceInfo.fingerprint },
                  { label: 'Browser', value: result.deviceInfo.browser },
                  { label: 'Operating System', value: result.deviceInfo.os },
                  { label: 'Device Type', value: result.deviceInfo.device },
                  { label: 'IP Address', value: result.deviceInfo.ip },
                  { label: 'Location', value: result.deviceInfo.location },
                  { label: 'ISP', value: result.deviceInfo.isp }
                ].map((info, i) => (
                  <div key={i} className="p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">{info.label}</p>
                    <p className="text-white font-medium">{info.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Flags */}
            {result.flags.length > 0 && (
              <div className="bg-gray-900 rounded-xl border border-red-500/30 p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                  <span>🚨</span>
                  Risk Flags ({result.flags.length})
                </h3>
                <div className="space-y-2">
                  {result.flags.map((flag, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg">
                      <span className="text-red-400">⚠️</span>
                      <span className="text-red-300">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="bg-gray-900 rounded-xl border border-green-500/30 p-6">
                <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                  <span>💡</span>
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span className="text-green-300">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Need Help */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Still having issues?</h3>
              <p className="text-gray-400 mb-4">
                If your payment continues to be declined after following the recommendations, contact our support team.
              </p>
              <div className="flex gap-3">
                <a
                  href="mailto:support@maula.ai"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-all"
                >
                  📧 Contact Support
                </a>
                <a
                  href="https://maula.ai/help"
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
                >
                  📚 Help Center
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Check Your Payment Status</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Enter your transaction ID, email, or device ID above to check why your payment might have been declined or flagged.
            </p>
          </div>
        )}

        {/* Common Issues Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-6">Common Payment Issues</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: '🌐',
                title: 'VPN/Proxy Detection',
                desc: 'Payments from VPN or proxy connections may be blocked to prevent fraud.'
              },
              {
                icon: '📍',
                title: 'Location Mismatch',
                desc: 'Your current location doesn\'t match your billing address on file.'
              },
              {
                icon: '📱',
                title: 'New Device',
                desc: 'First-time payments from a new device may require additional verification.'
              },
              {
                icon: '⚡',
                title: 'Too Many Attempts',
                desc: 'Multiple failed payment attempts can trigger temporary blocks.'
              },
              {
                icon: '💳',
                title: 'Card Issues',
                desc: 'Expired card, insufficient funds, or bank restrictions.'
              },
              {
                icon: '🔒',
                title: 'Security Holds',
                desc: 'Your bank may have placed a security hold on the transaction.'
              }
            ].map((issue, i) => (
              <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{issue.icon}</span>
                  <h3 className="font-semibold text-white">{issue.title}</h3>
                </div>
                <p className="text-gray-400 text-sm">{issue.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>🛡️</span>
              <span>RiskQuantify • Tool 19</span>
            </div>
            <span>VictoryKit Security Platform</span>
            <span>v19.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
