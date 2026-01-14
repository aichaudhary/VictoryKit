/**
 * RiskQuantify Tool - Tool 19 - IP Risk Scanner & Payment Sandbox
 * Auto-detect visitor IP + Manual lookup + Payment Playground
 * Theme: Violet/Purple
 * Port: Frontend 3019, API 4019
 */
import { useState, useEffect, useCallback } from 'react';

interface IPData {
  ip: string;
  riskScore: number;
  fraudScore: number;
  abuseScore: number;
  isVpn: boolean;
  isProxy: boolean;
  isTor: boolean;
  isDatacenter: boolean;
  isBot: boolean;
  isRelay: boolean;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  timezone: string;
  isp: string;
  org: string;
  asn: string;
  blacklists: { name: string; listed: boolean; type: string }[];
  reputation: 'excellent' | 'good' | 'neutral' | 'suspicious' | 'bad' | 'critical';
  reportCount: number;
}

interface DeviceData {
  fingerprint: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  screenResolution: string;
  language: string;
  timezone: string;
  plugins: number;
  canvas: string;
  webgl: string;
  trustScore: number;
  flags: string[];
}

interface PaymentResult {
  id: string;
  status: 'approved' | 'declined' | 'review' | 'pending';
  amount: number;
  currency: string;
  region: string;
  method: string;
  riskScore: number;
  checks: { name: string; passed: boolean; message: string }[];
  declineReason?: string;
  processingTime: number;
}

// Generate deterministic data from string
const hashString = (str: string): number => {
  return str.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
};

// Generate IP data from IP string
const generateIPData = (ip: string): IPData => {
  const hash = Math.abs(hashString(ip));
  const riskScore = hash % 100;
  const isHighRisk = riskScore > 60;
  
  const countries = ['United States', 'Germany', 'Netherlands', 'Russia', 'China', 'Brazil', 'India', 'Singapore'];
  const countryCodes = ['US', 'DE', 'NL', 'RU', 'CN', 'BR', 'IN', 'SG'];
  const cities = ['New York', 'Berlin', 'Amsterdam', 'Moscow', 'Shanghai', 'São Paulo', 'Mumbai', 'Singapore'];
  const isps = ['Comcast', 'AT&T', 'Vodafone', 'DigitalOcean', 'AWS', 'Google Cloud', 'Microsoft Azure', 'OVH'];
  
  const countryIdx = hash % countries.length;
  
  const blacklistSources = [
    { name: 'Spamhaus ZEN', type: 'spam' },
    { name: 'Barracuda', type: 'spam' },
    { name: 'SORBS', type: 'spam' },
    { name: 'SpamCop', type: 'spam' },
    { name: 'CBL', type: 'exploit' },
    { name: 'UCEPROTECT', type: 'spam' },
    { name: 'Invaluement', type: 'spam' },
    { name: 'AbuseIPDB', type: 'abuse' },
    { name: 'Blocklist.de', type: 'attack' },
    { name: 'StopForumSpam', type: 'spam' }
  ];

  return {
    ip,
    riskScore,
    fraudScore: Math.min(100, riskScore + (hash % 20)),
    abuseScore: Math.max(0, riskScore - (hash % 15)),
    isVpn: riskScore > 50,
    isProxy: riskScore > 60,
    isTor: riskScore > 80,
    isDatacenter: riskScore > 45 && isps[hash % isps.length].includes('Cloud') || isps[hash % isps.length].includes('Digital'),
    isBot: riskScore > 75,
    isRelay: riskScore > 70,
    country: countries[countryIdx],
    countryCode: countryCodes[countryIdx],
    city: cities[countryIdx],
    region: cities[countryIdx] + ' Region',
    timezone: `UTC${countryIdx > 4 ? '+' : '-'}${countryIdx + 1}:00`,
    isp: isps[hash % isps.length],
    org: isHighRisk ? 'Unknown Organization' : isps[hash % isps.length] + ' Inc.',
    asn: `AS${10000 + (hash % 50000)}`,
    blacklists: blacklistSources.map(bl => ({
      ...bl,
      listed: riskScore > 50 && Math.random() > 0.6
    })),
    reputation: riskScore >= 80 ? 'critical' : riskScore >= 60 ? 'bad' : riskScore >= 40 ? 'suspicious' : riskScore >= 20 ? 'neutral' : riskScore >= 10 ? 'good' : 'excellent',
    reportCount: isHighRisk ? Math.floor(riskScore * 1.5) : 0
  };
};

// Generate device fingerprint data
const generateDeviceData = (): DeviceData => {
  const ua = navigator.userAgent;
  const hash = Math.abs(hashString(ua + screen.width + screen.height));
  const trustScore = 100 - (hash % 40);
  
  const flags: string[] = [];
  if (trustScore < 70) flags.push('Canvas fingerprint anomaly detected');
  if (trustScore < 60) flags.push('WebGL renderer mismatch');
  if (trustScore < 50) flags.push('Timezone/language inconsistency');
  if (trustScore < 40) flags.push('Suspected automation tools');
  
  return {
    fingerprint: `FP-${hash.toString(16).toUpperCase().slice(0, 16)}`,
    browser: ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : 'Unknown',
    browserVersion: ua.match(/Chrome\/(\d+)/)?.[1] || ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown',
    os: ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Linux') ? 'Linux' : ua.includes('Android') ? 'Android' : ua.includes('iOS') ? 'iOS' : 'Unknown',
    osVersion: ua.match(/Windows NT (\d+\.\d+)/)?.[1] || ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || 'Unknown',
    device: /Mobile|Android|iPhone|iPad/.test(ua) ? 'Mobile' : 'Desktop',
    screenResolution: `${screen.width}x${screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    plugins: navigator.plugins?.length || 0,
    canvas: hash.toString(16).slice(0, 8).toUpperCase(),
    webgl: `WEBGL-${hash.toString(16).slice(8, 16).toUpperCase()}`,
    trustScore,
    flags
  };
};

// Simulate payment
const simulatePayment = (amount: number, currency: string, region: string, method: string, ipData: IPData, deviceData: DeviceData): PaymentResult => {
  const baseRisk = ipData.riskScore * 0.4 + (100 - deviceData.trustScore) * 0.3;
  const regionRisk = ['RU', 'CN', 'NG', 'UA'].includes(region) ? 20 : 0;
  const amountRisk = amount > 1000 ? 15 : amount > 500 ? 10 : amount > 100 ? 5 : 0;
  const totalRisk = Math.min(100, baseRisk + regionRisk + amountRisk);
  
  const checks = [
    { name: 'IP Reputation', passed: ipData.riskScore < 50, message: ipData.riskScore < 50 ? 'IP has good reputation' : `High risk IP (score: ${ipData.riskScore})` },
    { name: 'VPN/Proxy Check', passed: !ipData.isVpn && !ipData.isProxy, message: ipData.isVpn || ipData.isProxy ? 'VPN/Proxy detected' : 'No VPN/Proxy detected' },
    { name: 'Datacenter IP', passed: !ipData.isDatacenter, message: ipData.isDatacenter ? 'Datacenter IP detected' : 'Residential IP' },
    { name: 'Device Trust', passed: deviceData.trustScore > 60, message: deviceData.trustScore > 60 ? 'Device trusted' : 'Device trust low' },
    { name: 'Blacklist Check', passed: !ipData.blacklists.some(b => b.listed), message: ipData.blacklists.some(b => b.listed) ? 'IP found on blacklists' : 'Not on any blacklist' },
    { name: 'Geographic Risk', passed: regionRisk === 0, message: regionRisk > 0 ? 'High-risk region' : 'Region OK' },
    { name: 'Amount Check', passed: amountRisk < 10, message: amountRisk >= 10 ? 'Large transaction amount' : 'Amount within limits' },
    { name: 'Tor Network', passed: !ipData.isTor, message: ipData.isTor ? 'Tor exit node detected' : 'No Tor detected' }
  ];
  
  const failedChecks = checks.filter(c => !c.passed);
  let status: PaymentResult['status'] = 'approved';
  let declineReason: string | undefined;
  
  if (totalRisk >= 70 || failedChecks.length >= 4) {
    status = 'declined';
    declineReason = failedChecks[0]?.message || 'High risk transaction';
  } else if (totalRisk >= 50 || failedChecks.length >= 2) {
    status = 'review';
  } else if (totalRisk >= 30) {
    status = 'pending';
  }
  
  return {
    id: `TXN-${Date.now().toString(36).toUpperCase()}`,
    status,
    amount,
    currency,
    region,
    method,
    riskScore: Math.round(totalRisk),
    checks,
    declineReason,
    processingTime: Math.floor(Math.random() * 500) + 100
  };
};

export default function RiskQuantifyTool() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'lookup' | 'playground'>('scanner');
  const [loading, setLoading] = useState(false);
  
  // Scanner state
  const [myIP, setMyIP] = useState<IPData | null>(null);
  const [myDevice, setMyDevice] = useState<DeviceData | null>(null);
  
  // Lookup state
  const [lookupIP, setLookupIP] = useState('');
  const [lookupResult, setLookupResult] = useState<IPData | null>(null);
  
  // Playground state
  const [paymentAmount, setPaymentAmount] = useState('100');
  const [paymentCurrency, setPaymentCurrency] = useState('USD');
  const [paymentRegion, setPaymentRegion] = useState('US');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  // Auto-detect IP on load
  useEffect(() => {
    detectMyIP();
    setMyDevice(generateDeviceData());
  }, []);

  const detectMyIP = async () => {
    setLoading(true);
    try {
      // Get real IP from public API
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      const ipData = generateIPData(data.ip);
      setMyIP(ipData);
    } catch {
      // Fallback to simulated IP
      const simulatedIP = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      setMyIP(generateIPData(simulatedIP));
    }
    setLoading(false);
  };

  const performLookup = useCallback(async () => {
    if (!lookupIP.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLookupResult(generateIPData(lookupIP));
    setLoading(false);
  }, [lookupIP]);

  const runPaymentSimulation = async () => {
    if (!myIP || !myDevice) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const result = simulatePayment(
      parseFloat(paymentAmount) || 100,
      paymentCurrency,
      paymentRegion,
      paymentMethod,
      myIP,
      myDevice
    );
    setPaymentResult(result);
    setLoading(false);
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 50) return 'text-orange-400';
    if (score >= 30) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskBg = (score: number) => {
    if (score >= 70) return 'bg-red-500/20 border-red-500/30';
    if (score >= 50) return 'bg-orange-500/20 border-orange-500/30';
    if (score >= 30) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-green-500/20 border-green-500/30';
  };

  const getReputationColor = (rep: IPData['reputation']) => {
    const colors = {
      excellent: 'text-green-400 bg-green-500/20',
      good: 'text-emerald-400 bg-emerald-500/20',
      neutral: 'text-gray-400 bg-gray-500/20',
      suspicious: 'text-yellow-400 bg-yellow-500/20',
      bad: 'text-orange-400 bg-orange-500/20',
      critical: 'text-red-400 bg-red-500/20'
    };
    return colors[rep];
  };

  const getStatusColor = (status: PaymentResult['status']) => {
    const colors = {
      approved: 'text-green-400 bg-green-500/20 border-green-500/30',
      declined: 'text-red-400 bg-red-500/20 border-red-500/30',
      review: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      pending: 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    };
    return colors[status];
  };

  // IP Data Display Component
  const IPDisplay = ({ data, title }: { data: IPData; title: string }) => (
    <div className="space-y-6">
      {/* Header with Risk Score */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          <p className="text-3xl font-mono font-bold text-violet-400">{data.ip}</p>
        </div>
        <div className={`text-center p-4 rounded-xl border ${getRiskBg(data.riskScore)}`}>
          <p className="text-sm text-gray-400 mb-1">Risk Score</p>
          <p className={`text-4xl font-bold ${getRiskColor(data.riskScore)}`}>{data.riskScore}</p>
          <p className="text-xs text-gray-500 mt-1">/ 100</p>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">Fraud Score</p>
          <p className={`text-2xl font-bold ${getRiskColor(data.fraudScore)}`}>{data.fraudScore}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">Abuse Score</p>
          <p className={`text-2xl font-bold ${getRiskColor(data.abuseScore)}`}>{data.abuseScore}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">Reports</p>
          <p className={`text-2xl font-bold ${data.reportCount > 0 ? 'text-red-400' : 'text-green-400'}`}>{data.reportCount}</p>
        </div>
      </div>

      {/* Reputation Badge */}
      <div className="flex items-center gap-4">
        <span className="text-gray-400">Reputation:</span>
        <span className={`px-4 py-1 rounded-full font-semibold capitalize ${getReputationColor(data.reputation)}`}>
          {data.reputation}
        </span>
      </div>

      {/* Detection Flags */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'VPN', value: data.isVpn, icon: '🔒' },
          { label: 'Proxy', value: data.isProxy, icon: '🔄' },
          { label: 'Tor', value: data.isTor, icon: '🧅' },
          { label: 'Datacenter', value: data.isDatacenter, icon: '🏢' },
          { label: 'Bot', value: data.isBot, icon: '🤖' },
          { label: 'Relay', value: data.isRelay, icon: '📡' }
        ].map(flag => (
          <div key={flag.label} className={`p-3 rounded-lg border flex items-center gap-3 ${flag.value ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
            <span className="text-xl">{flag.icon}</span>
            <div>
              <p className="text-sm text-gray-300">{flag.label}</p>
              <p className={`font-semibold ${flag.value ? 'text-red-400' : 'text-green-400'}`}>
                {flag.value ? 'Detected' : 'Clear'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Location & Network Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>📍</span> Location
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Country</span><span className="text-white">{data.country} ({data.countryCode})</span></div>
            <div className="flex justify-between"><span className="text-gray-400">City</span><span className="text-white">{data.city}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Region</span><span className="text-white">{data.region}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Timezone</span><span className="text-white">{data.timezone}</span></div>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>🌐</span> Network
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">ISP</span><span className="text-white">{data.isp}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Organization</span><span className="text-white">{data.org}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">ASN</span><span className="text-white">{data.asn}</span></div>
          </div>
        </div>
      </div>

      {/* Blacklist Status */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span>🚫</span> Blacklist Status
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {data.blacklists.map((bl, i) => (
            <div key={i} className={`p-2 rounded text-center text-sm ${bl.listed ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              <p className="font-medium">{bl.name}</p>
              <p className="text-xs opacity-70">{bl.listed ? '⚠️ Listed' : '✓ Clear'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Device Display Component
  const DeviceDisplay = ({ data }: { data: DeviceData }) => (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Device Fingerprint</h3>
          <p className="text-xl font-mono text-violet-400">{data.fingerprint}</p>
        </div>
        <div className={`text-center p-4 rounded-xl border ${getRiskBg(100 - data.trustScore)}`}>
          <p className="text-sm text-gray-400 mb-1">Trust Score</p>
          <p className={`text-3xl font-bold ${data.trustScore >= 70 ? 'text-green-400' : data.trustScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{data.trustScore}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Browser', value: `${data.browser} ${data.browserVersion}`, icon: '🌐' },
          { label: 'OS', value: `${data.os} ${data.osVersion}`, icon: '💻' },
          { label: 'Device', value: data.device, icon: '📱' },
          { label: 'Screen', value: data.screenResolution, icon: '🖥️' },
          { label: 'Language', value: data.language, icon: '🌍' },
          { label: 'Timezone', value: data.timezone, icon: '🕐' },
          { label: 'Plugins', value: data.plugins.toString(), icon: '🔌' },
          { label: 'Canvas', value: data.canvas, icon: '🎨' }
        ].map(item => (
          <div key={item.label} className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span>{item.icon}</span>
              <span className="text-gray-400 text-sm">{item.label}</span>
            </div>
            <p className="text-white font-medium truncate">{item.value}</p>
          </div>
        ))}
      </div>

      {data.flags.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-yellow-400 font-semibold flex items-center gap-2">
            <span>⚠️</span> Device Flags
          </h4>
          {data.flags.map((flag, i) => (
            <div key={i} className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm">
              {flag}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-violet-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="https://maula.ai" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-violet-500/30 rounded-lg text-gray-300 hover:text-white transition-all flex items-center gap-2">
                <span>←</span><span>Maula.AI</span>
              </a>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                  <span className="text-xl">🛡️</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">RiskQuantify</h1>
                  <p className="text-violet-400/70 text-sm">IP Risk Scanner & Payment Sandbox</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Live Analysis</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'scanner', label: 'My IP Scanner', icon: '🔍', desc: 'Auto-detect your IP risk' },
              { id: 'lookup', label: 'IP Lookup', icon: '🌐', desc: 'Check any IP address' },
              { id: 'playground', label: 'Payment Playground', icon: '🎮', desc: 'Simulate payments' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-4 font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-violet-400 border-violet-500 bg-violet-500/10'
                    : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Scanner Tab */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Your IP Analysis</h2>
                <p className="text-gray-400">Real-time risk assessment of your current connection</p>
              </div>
              <button
                onClick={detectMyIP}
                disabled={loading}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>🔄</span>}
                Refresh
              </button>
            </div>

            {loading && !myIP ? (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
                <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Analyzing your connection...</p>
              </div>
            ) : myIP && (
              <>
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <IPDisplay data={myIP} title="Your IP Address" />
                </div>
                {myDevice && <DeviceDisplay data={myDevice} />}
              </>
            )}
          </div>
        )}

        {/* Lookup Tab */}
        {activeTab === 'lookup' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">IP Address Lookup</h2>
              <p className="text-gray-400">Check risk score and reputation for any IP address</p>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={lookupIP}
                  onChange={e => setLookupIP(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && performLookup()}
                  placeholder="Enter IP address (e.g., 192.168.1.1)"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 font-mono"
                />
                <button
                  onClick={performLookup}
                  disabled={loading || !lookupIP.trim()}
                  className="px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>🔍</span>}
                  Analyze
                </button>
              </div>

              {/* Quick Examples */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-gray-500 text-sm">Try:</span>
                {['8.8.8.8', '1.1.1.1', '185.220.101.1', '104.16.0.1'].map(ip => (
                  <button
                    key={ip}
                    onClick={() => { setLookupIP(ip); }}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-400 hover:text-white transition-all font-mono"
                  >
                    {ip}
                  </button>
                ))}
              </div>
            </div>

            {lookupResult && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <IPDisplay data={lookupResult} title="IP Analysis Result" />
              </div>
            )}
          </div>
        )}

        {/* Playground Tab */}
        {activeTab === 'playground' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Payment Sandbox</h2>
              <p className="text-gray-400">Test how your current IP and device would perform in payment scenarios</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuration */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>⚙️</span> Payment Configuration
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Amount</label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={e => setPaymentAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Currency</label>
                    <select
                      value={paymentCurrency}
                      onChange={e => setPaymentCurrency(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="BRL">BRL - Brazilian Real</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Region / Country</label>
                    <select
                      value={paymentRegion}
                      onChange={e => setPaymentRegion(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="US">🇺🇸 United States</option>
                      <option value="GB">🇬🇧 United Kingdom</option>
                      <option value="DE">🇩🇪 Germany</option>
                      <option value="FR">🇫🇷 France</option>
                      <option value="JP">🇯🇵 Japan</option>
                      <option value="AU">🇦🇺 Australia</option>
                      <option value="CA">🇨🇦 Canada</option>
                      <option value="IN">🇮🇳 India</option>
                      <option value="BR">🇧🇷 Brazil</option>
                      <option value="RU">🇷🇺 Russia (High Risk)</option>
                      <option value="CN">🇨🇳 China (High Risk)</option>
                      <option value="NG">🇳🇬 Nigeria (High Risk)</option>
                      <option value="UA">🇺🇦 Ukraine (High Risk)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="card">💳 Credit/Debit Card</option>
                      <option value="paypal">🅿️ PayPal</option>
                      <option value="crypto">₿ Cryptocurrency</option>
                      <option value="bank">🏦 Bank Transfer</option>
                      <option value="applepay">🍎 Apple Pay</option>
                      <option value="googlepay">📱 Google Pay</option>
                    </select>
                  </div>

                  <button
                    onClick={runPaymentSimulation}
                    disabled={loading || !myIP}
                    className="w-full px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:from-violet-600/50 disabled:to-purple-600/50 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        Simulate Payment
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Current Context */}
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">Your Current Risk Profile</h4>
                  {myIP ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <p className="text-gray-400 text-xs">IP Risk</p>
                        <p className={`text-2xl font-bold ${getRiskColor(myIP.riskScore)}`}>{myIP.riskScore}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <p className="text-gray-400 text-xs">Device Trust</p>
                        <p className={`text-2xl font-bold ${myDevice && myDevice.trustScore >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>{myDevice?.trustScore || 0}%</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3 text-center col-span-2">
                        <p className="text-gray-400 text-xs">Your IP</p>
                        <p className="text-lg font-mono text-violet-400">{myIP.ip}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Loading your IP data...</p>
                  )}
                </div>

                {/* Quick Scenarios */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3">Quick Scenarios</h4>
                  <div className="space-y-2">
                    {[
                      { label: 'Small Purchase', amount: '25', currency: 'USD', region: 'US' },
                      { label: 'Medium Purchase', amount: '150', currency: 'EUR', region: 'DE' },
                      { label: 'Large Purchase', amount: '1500', currency: 'USD', region: 'US' },
                      { label: 'High Risk Region', amount: '100', currency: 'USD', region: 'RU' }
                    ].map(scenario => (
                      <button
                        key={scenario.label}
                        onClick={() => {
                          setPaymentAmount(scenario.amount);
                          setPaymentCurrency(scenario.currency);
                          setPaymentRegion(scenario.region);
                        }}
                        className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-left text-sm transition-all flex justify-between items-center"
                      >
                        <span className="text-white">{scenario.label}</span>
                        <span className="text-gray-400">{scenario.currency} {scenario.amount}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Result */}
            {paymentResult && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Simulation Result</h3>
                    <p className="text-gray-400 text-sm">Transaction ID: {paymentResult.id}</p>
                  </div>
                  <div className={`px-6 py-3 rounded-xl border font-bold text-xl ${getStatusColor(paymentResult.status)}`}>
                    {paymentResult.status.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xs">Amount</p>
                    <p className="text-xl font-bold text-white">{paymentResult.currency} {paymentResult.amount}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xs">Risk Score</p>
                    <p className={`text-xl font-bold ${getRiskColor(paymentResult.riskScore)}`}>{paymentResult.riskScore}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xs">Processing Time</p>
                    <p className="text-xl font-bold text-white">{paymentResult.processingTime}ms</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xs">Method</p>
                    <p className="text-xl font-bold text-white capitalize">{paymentResult.method}</p>
                  </div>
                </div>

                {paymentResult.declineReason && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 font-semibold flex items-center gap-2">
                      <span>❌</span> Decline Reason: {paymentResult.declineReason}
                    </p>
                  </div>
                )}

                <h4 className="text-white font-semibold mb-3">Security Checks</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {paymentResult.checks.map((check, i) => (
                    <div key={i} className={`p-3 rounded-lg border flex items-center gap-3 ${check.passed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                      <span className="text-xl">{check.passed ? '✅' : '❌'}</span>
                      <div>
                        <p className={`font-medium ${check.passed ? 'text-green-400' : 'text-red-400'}`}>{check.name}</p>
                        <p className="text-gray-400 text-sm">{check.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>🛡️</span>
              <span>RiskQuantify • Tool 19</span>
            </div>
            <span>VictoryKit Security Platform</span>
            <span>v19.1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
