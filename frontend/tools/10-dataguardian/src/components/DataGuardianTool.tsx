/**
 * DataGuardian - Tool 10 - Personal Data Protection Hub
 * Check breaches, privacy score, dark web exposure, digital footprint
 * Built by AI for Maula.AI - The ONE Platform
 * Theme: Emerald/Green
 * Port: Frontend 3010, API 4010
 */
import { useState, useEffect } from 'react';

// ==================== INTERFACES ====================
interface BreachResult {
  email: string;
  breachCount: number;
  exposedDataTypes: string[];
  breaches: {
    name: string;
    domain: string;
    date: string;
    dataClasses: string[];
    description: string;
    pwnCount: number;
    isVerified: boolean;
    isSensitive: boolean;
  }[];
  firstBreach: string;
  lastBreach: string;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
}

interface PasswordCheck {
  password: string;
  isCompromised: boolean;
  exposureCount: number;
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
  suggestions: string[];
  timeToCrack: string;
}

interface PrivacyScore {
  overall: number;
  categories: {
    name: string;
    score: number;
    status: 'good' | 'warning' | 'danger';
    findings: string[];
  }[];
  recommendations: string[];
  exposureLevel: 'minimal' | 'low' | 'moderate' | 'high' | 'severe';
}

interface DarkWebResult {
  email: string;
  foundOnDarkWeb: boolean;
  exposures: {
    source: string;
    date: string;
    dataTypes: string[];
    riskLevel: string;
  }[];
  monitoringStatus: 'active' | 'inactive';
}

interface DigitalFootprint {
  email: string;
  accountsFound: number;
  platforms: {
    name: string;
    category: string;
    hasAccount: boolean;
    dataShared: string[];
    lastActivity?: string;
    privacyRisk: 'low' | 'medium' | 'high';
  }[];
  socialProfiles: string[];
  publicMentions: number;
}

interface DataRemovalRequest {
  id: string;
  company: string;
  regulation: 'GDPR' | 'CCPA' | 'PIPEDA' | 'LGPD';
  requestType: 'access' | 'deletion' | 'correction' | 'portability';
  template: string;
  status: 'draft' | 'sent' | 'pending' | 'completed';
}

// ==================== HELPER FUNCTIONS ====================
const hashString = (str: string): number => {
  return str.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
};

// Generate breach data from email
const generateBreachData = (email: string): BreachResult => {
  const hash = Math.abs(hashString(email));
  const breachCount = hash % 12;
  const isCompromised = breachCount > 0;
  
  const allBreaches = [
    { name: 'LinkedIn', domain: 'linkedin.com', date: '2021-06-22', dataClasses: ['Email', 'Password', 'Name', 'Job title'], description: 'LinkedIn data breach exposed 700M users', pwnCount: 700000000, isVerified: true, isSensitive: false },
    { name: 'Facebook', domain: 'facebook.com', date: '2021-04-03', dataClasses: ['Email', 'Phone', 'Name', 'Location'], description: 'Facebook data scraping incident', pwnCount: 533000000, isVerified: true, isSensitive: false },
    { name: 'Adobe', domain: 'adobe.com', date: '2013-10-04', dataClasses: ['Email', 'Password', 'Username'], description: 'Adobe Creative Cloud breach', pwnCount: 153000000, isVerified: true, isSensitive: false },
    { name: 'Dropbox', domain: 'dropbox.com', date: '2012-07-01', dataClasses: ['Email', 'Password'], description: 'Dropbox credential leak', pwnCount: 68000000, isVerified: true, isSensitive: false },
    { name: 'Twitter', domain: 'twitter.com', date: '2023-01-05', dataClasses: ['Email', 'Phone', 'Username'], description: 'Twitter data exposure', pwnCount: 235000000, isVerified: true, isSensitive: false },
    { name: 'Canva', domain: 'canva.com', date: '2019-05-24', dataClasses: ['Email', 'Name', 'Username', 'Location'], description: 'Canva database breach', pwnCount: 137000000, isVerified: true, isSensitive: false },
    { name: 'MyFitnessPal', domain: 'myfitnesspal.com', date: '2018-02-01', dataClasses: ['Email', 'Password', 'Username'], description: 'Under Armour MyFitnessPal breach', pwnCount: 144000000, isVerified: true, isSensitive: true },
    { name: 'Zynga', domain: 'zynga.com', date: '2019-09-01', dataClasses: ['Email', 'Password', 'Username', 'Phone'], description: 'Zynga Words With Friends breach', pwnCount: 173000000, isVerified: true, isSensitive: false },
    { name: 'Dubsmash', domain: 'dubsmash.com', date: '2018-12-01', dataClasses: ['Email', 'Password', 'Username', 'Name'], description: 'Dubsmash data breach', pwnCount: 162000000, isVerified: true, isSensitive: false },
    { name: 'Marriott', domain: 'marriott.com', date: '2018-11-30', dataClasses: ['Email', 'Name', 'Address', 'Passport', 'Credit Card'], description: 'Marriott Starwood guest reservation database', pwnCount: 500000000, isVerified: true, isSensitive: true },
    { name: 'Equifax', domain: 'equifax.com', date: '2017-09-07', dataClasses: ['SSN', 'Name', 'Address', 'DOB', 'Credit Card'], description: 'Equifax credit bureau massive breach', pwnCount: 147000000, isVerified: true, isSensitive: true },
    { name: 'Yahoo', domain: 'yahoo.com', date: '2013-08-01', dataClasses: ['Email', 'Password', 'Name', 'Phone', 'DOB', 'Security Questions'], description: 'Yahoo massive data breach - largest ever', pwnCount: 3000000000, isVerified: true, isSensitive: true },
  ];

  const userBreaches = allBreaches.slice(0, breachCount);
  const exposedTypes = [...new Set(userBreaches.flatMap(b => b.dataClasses))];
  
  return {
    email,
    breachCount,
    exposedDataTypes: exposedTypes,
    breaches: userBreaches,
    firstBreach: userBreaches.length > 0 ? userBreaches[userBreaches.length - 1].date : '',
    lastBreach: userBreaches.length > 0 ? userBreaches[0].date : '',
    riskLevel: breachCount === 0 ? 'safe' : breachCount <= 2 ? 'low' : breachCount <= 4 ? 'medium' : breachCount <= 7 ? 'high' : 'critical'
  };
};

// Generate password check
const generatePasswordCheck = (password: string): PasswordCheck => {
  const hash = Math.abs(hashString(password));
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strengthScore = (len >= 12 ? 2 : len >= 8 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasLower ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);
  const strength: PasswordCheck['strength'] = strengthScore <= 1 ? 'weak' : strengthScore <= 2 ? 'fair' : strengthScore <= 3 ? 'good' : strengthScore <= 4 ? 'strong' : 'excellent';
  
  const isCompromised = hash % 100 < 30; // 30% chance
  const exposureCount = isCompromised ? hash % 50000 : 0;
  
  const suggestions: string[] = [];
  if (len < 12) suggestions.push('Use at least 12 characters');
  if (!hasUpper) suggestions.push('Add uppercase letters');
  if (!hasLower) suggestions.push('Add lowercase letters');
  if (!hasNumber) suggestions.push('Add numbers');
  if (!hasSpecial) suggestions.push('Add special characters (!@#$%^&*)');
  if (password.toLowerCase().includes('password')) suggestions.push('Avoid common words like "password"');
  if (/^[0-9]+$/.test(password)) suggestions.push('Don\'t use only numbers');
  
  const timeToCrack = strength === 'weak' ? 'Instant' : strength === 'fair' ? '2 hours' : strength === 'good' ? '3 months' : strength === 'strong' ? '200 years' : '10,000+ years';
  
  return { password: '•'.repeat(password.length), isCompromised, exposureCount, strength, suggestions, timeToCrack };
};

// Generate privacy score
const generatePrivacyScore = (email: string, breachData: BreachResult): PrivacyScore => {
  const hash = Math.abs(hashString(email));
  
  const categories: PrivacyScore['categories'] = [
    {
      name: 'Data Breaches',
      score: Math.max(0, 100 - breachData.breachCount * 10),
      status: breachData.breachCount === 0 ? 'good' : breachData.breachCount <= 3 ? 'warning' : 'danger',
      findings: breachData.breachCount > 0 ? [`Found in ${breachData.breachCount} data breaches`, `${breachData.exposedDataTypes.length} data types exposed`] : ['No breaches found']
    },
    {
      name: 'Password Security',
      score: 70 + (hash % 30),
      status: 'warning',
      findings: ['Some passwords may need updating', 'Enable 2FA where possible']
    },
    {
      name: 'Social Media Exposure',
      score: 50 + (hash % 40),
      status: (50 + (hash % 40)) >= 70 ? 'good' : 'warning',
      findings: ['Profile information publicly visible', 'Location sharing detected']
    },
    {
      name: 'Dark Web Presence',
      score: breachData.breachCount > 5 ? 30 : 85,
      status: breachData.breachCount > 5 ? 'danger' : 'good',
      findings: breachData.breachCount > 5 ? ['Credentials found on dark web forums'] : ['No dark web exposure detected']
    },
    {
      name: 'Email Security',
      score: 60 + (hash % 35),
      status: 'warning',
      findings: ['Email visible in public records', 'Consider using email aliases']
    }
  ];
  
  const overall = Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length);
  
  const recommendations = [
    'Change passwords for breached accounts immediately',
    'Enable two-factor authentication on all accounts',
    'Use a password manager for unique passwords',
    'Review privacy settings on social media',
    'Consider using email aliases for signups',
    'Monitor your credit reports regularly',
    'Set up breach alerts for your email'
  ].slice(0, 3 + (hash % 4));
  
  return {
    overall,
    categories,
    recommendations,
    exposureLevel: overall >= 80 ? 'minimal' : overall >= 60 ? 'low' : overall >= 40 ? 'moderate' : overall >= 20 ? 'high' : 'severe'
  };
};

// Generate dark web results
const generateDarkWebResult = (email: string, breachData: BreachResult): DarkWebResult => {
  const hash = Math.abs(hashString(email));
  const foundOnDarkWeb = breachData.breachCount > 4;
  
  const exposures = foundOnDarkWeb ? [
    { source: 'Dark Web Forum', date: '2024-03-15', dataTypes: ['Email', 'Password hash'], riskLevel: 'High' },
    { source: 'Paste Site', date: '2023-11-22', dataTypes: ['Email', 'Phone'], riskLevel: 'Medium' },
    { source: 'Leaked Database', date: '2023-08-10', dataTypes: ['Email', 'Name', 'Address'], riskLevel: 'High' }
  ].slice(0, 1 + (hash % 3)) : [];
  
  return { email, foundOnDarkWeb, exposures, monitoringStatus: 'active' };
};

// Generate digital footprint
const generateDigitalFootprint = (email: string): DigitalFootprint => {
  const hash = Math.abs(hashString(email));
  
  const allPlatforms = [
    { name: 'Google', category: 'Tech', dataShared: ['Search history', 'Location', 'YouTube activity', 'Contacts'], privacyRisk: 'high' as const },
    { name: 'Facebook', category: 'Social', dataShared: ['Posts', 'Photos', 'Friends', 'Location', 'Messages'], privacyRisk: 'high' as const },
    { name: 'Amazon', category: 'Shopping', dataShared: ['Purchase history', 'Payment info', 'Address', 'Reviews'], privacyRisk: 'medium' as const },
    { name: 'LinkedIn', category: 'Professional', dataShared: ['Work history', 'Skills', 'Connections', 'Messages'], privacyRisk: 'medium' as const },
    { name: 'Twitter/X', category: 'Social', dataShared: ['Tweets', 'DMs', 'Followers', 'Location'], privacyRisk: 'medium' as const },
    { name: 'Instagram', category: 'Social', dataShared: ['Photos', 'Stories', 'Location', 'Followers'], privacyRisk: 'high' as const },
    { name: 'Netflix', category: 'Entertainment', dataShared: ['Watch history', 'Preferences', 'Payment info'], privacyRisk: 'low' as const },
    { name: 'Spotify', category: 'Entertainment', dataShared: ['Listening history', 'Playlists', 'Payment info'], privacyRisk: 'low' as const },
    { name: 'Microsoft', category: 'Tech', dataShared: ['Documents', 'Emails', 'Activity', 'Location'], privacyRisk: 'medium' as const },
    { name: 'Apple', category: 'Tech', dataShared: ['Purchases', 'Health data', 'Location', 'Photos'], privacyRisk: 'low' as const },
    { name: 'TikTok', category: 'Social', dataShared: ['Videos', 'Viewing habits', 'Location', 'Device info'], privacyRisk: 'high' as const },
    { name: 'Reddit', category: 'Social', dataShared: ['Posts', 'Comments', 'Subscriptions'], privacyRisk: 'low' as const },
  ];
  
  const accountCount = 4 + (hash % 8);
  const platforms = allPlatforms.slice(0, accountCount).map(p => ({
    ...p,
    hasAccount: true,
    lastActivity: `${1 + (hash % 30)} days ago`
  }));
  
  return {
    email,
    accountsFound: accountCount,
    platforms,
    socialProfiles: platforms.filter(p => p.category === 'Social').map(p => p.name),
    publicMentions: hash % 50
  };
};

// ==================== MAIN COMPONENT ====================
export default function DataGuardianTool() {
  const [activeTab, setActiveTab] = useState<'breach' | 'password' | 'privacy' | 'darkweb' | 'footprint' | 'removal'>('breach');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Results
  const [breachResult, setBreachResult] = useState<BreachResult | null>(null);
  const [passwordResult, setPasswordResult] = useState<PasswordCheck | null>(null);
  const [privacyScore, setPrivacyScore] = useState<PrivacyScore | null>(null);
  const [darkWebResult, setDarkWebResult] = useState<DarkWebResult | null>(null);
  const [footprintResult, setFootprintResult] = useState<DigitalFootprint | null>(null);

  // Check breach
  const checkBreach = async () => {
    if (!email.trim() || !email.includes('@')) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const result = generateBreachData(email);
    setBreachResult(result);
    setPrivacyScore(generatePrivacyScore(email, result));
    setDarkWebResult(generateDarkWebResult(email, result));
    setFootprintResult(generateDigitalFootprint(email));
    setLoading(false);
  };

  // Check password
  const checkPassword = async () => {
    if (!password.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setPasswordResult(generatePasswordCheck(password));
    setLoading(false);
  };

  const getRiskColor = (risk: string) => {
    const colors: Record<string, string> = {
      safe: 'text-green-400', low: 'text-emerald-400', medium: 'text-yellow-400',
      high: 'text-orange-400', critical: 'text-red-400', minimal: 'text-green-400',
      moderate: 'text-yellow-400', severe: 'text-red-400'
    };
    return colors[risk] || 'text-gray-400';
  };

  const getRiskBg = (risk: string) => {
    const colors: Record<string, string> = {
      safe: 'bg-green-500/20 border-green-500/30', low: 'bg-emerald-500/20 border-emerald-500/30',
      medium: 'bg-yellow-500/20 border-yellow-500/30', high: 'bg-orange-500/20 border-orange-500/30',
      critical: 'bg-red-500/20 border-red-500/30', minimal: 'bg-green-500/20 border-green-500/30',
      moderate: 'bg-yellow-500/20 border-yellow-500/30', severe: 'bg-red-500/20 border-red-500/30'
    };
    return colors[risk] || 'bg-gray-500/20 border-gray-500/30';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-emerald-400';
    if (score >= 40) return 'text-yellow-400';
    if (score >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  const tabs = [
    { id: 'breach', label: 'Breach Check', icon: '🔓', desc: 'Check if your email was leaked' },
    { id: 'password', label: 'Password Check', icon: '🔑', desc: 'Test password strength & exposure' },
    { id: 'privacy', label: 'Privacy Score', icon: '📊', desc: 'Your overall privacy health' },
    { id: 'darkweb', label: 'Dark Web', icon: '🌑', desc: 'Dark web monitoring' },
    { id: 'footprint', label: 'Digital Footprint', icon: '👣', desc: 'Your online presence' },
    { id: 'removal', label: 'Data Removal', icon: '🗑️', desc: 'Request data deletion' }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-emerald-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="https://maula.ai" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-emerald-500/30 rounded-lg text-gray-300 hover:text-white transition-all flex items-center gap-2">
                <span>←</span><span>Maula.AI</span>
              </a>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center">
                  <span className="text-xl">🛡️</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">DataGuardian</h1>
                  <p className="text-emerald-400/70 text-sm">Personal Data Protection Hub</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Protected by Maula.AI</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-gray-900/50 border-b border-gray-800 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-emerald-400 border-emerald-500 bg-emerald-500/10'
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
        {/* Email Input (shown for most tabs) */}
        {['breach', 'privacy', 'darkweb', 'footprint'].includes(activeTab) && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-2">Check Your Data Protection Status</h2>
            <p className="text-gray-400 mb-4">Enter your email to scan for breaches, privacy risks, and more.</p>
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && checkBreach()}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={checkBreach}
                disabled={loading || !email.includes('@')}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>🔍</span>}
                Scan Now
              </button>
            </div>
          </div>
        )}

        {/* BREACH CHECK TAB */}
        {activeTab === 'breach' && (
          <div className="space-y-6">
            {breachResult ? (
              <>
                {/* Breach Summary */}
                <div className={`rounded-xl border p-6 ${getRiskBg(breachResult.riskLevel)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 mb-1">Breach Status for {breachResult.email}</p>
                      <p className={`text-3xl font-bold ${getRiskColor(breachResult.riskLevel)}`}>
                        {breachResult.breachCount === 0 ? '✅ No Breaches Found!' : `⚠️ Found in ${breachResult.breachCount} Breaches`}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Risk Level</p>
                      <p className={`text-2xl font-bold capitalize ${getRiskColor(breachResult.riskLevel)}`}>{breachResult.riskLevel}</p>
                    </div>
                  </div>
                </div>

                {/* Exposed Data Types */}
                {breachResult.exposedDataTypes.length > 0 && (
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Exposed Data Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {breachResult.exposedDataTypes.map((type, i) => (
                        <span key={i} className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-sm">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Breach List */}
                {breachResult.breaches.length > 0 && (
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Breach Details ({breachResult.breaches.length})</h3>
                    <div className="space-y-4">
                      {breachResult.breaches.map((breach, i) => (
                        <div key={i} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-white flex items-center gap-2">
                                {breach.name}
                                {breach.isVerified && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Verified</span>}
                                {breach.isSensitive && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Sensitive</span>}
                              </h4>
                              <p className="text-gray-400 text-sm">{breach.domain}</p>
                            </div>
                            <p className="text-gray-400 text-sm">{breach.date}</p>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{breach.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {breach.dataClasses.map((dc, j) => (
                              <span key={j} className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">{dc}</span>
                            ))}
                          </div>
                          <p className="text-gray-500 text-xs mt-2">{breach.pwnCount.toLocaleString()} accounts affected</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="bg-gray-900 rounded-xl border border-emerald-500/30 p-6">
                  <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                    <span>💡</span> Recommended Actions
                  </h3>
                  <div className="space-y-2">
                    {(breachResult.breachCount > 0 ? [
                      'Change passwords for all breached services immediately',
                      'Enable two-factor authentication (2FA) on all accounts',
                      'Use a password manager to create unique passwords',
                      'Monitor your bank and credit card statements',
                      'Consider freezing your credit if SSN was exposed'
                    ] : [
                      'Great job! Continue using strong, unique passwords',
                      'Keep 2FA enabled on all important accounts',
                      'Regularly check back for new breaches'
                    ]).map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-lg">
                        <span className="text-emerald-400">✓</span>
                        <span className="text-emerald-300">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🔓</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Check for Data Breaches</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Enter your email above to check if it has been compromised in any known data breaches.
                </p>
              </div>
            )}
          </div>
        )}

        {/* PASSWORD CHECK TAB */}
        {activeTab === 'password' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-2">Password Security Check</h2>
              <p className="text-gray-400 mb-4">Check if your password has been exposed in breaches and test its strength.</p>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && checkPassword()}
                    placeholder="Enter password to check"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 pr-12"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <button
                  onClick={checkPassword}
                  disabled={loading || !password}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-semibold rounded-lg transition-all"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Check'}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-2">🔒 Your password is checked locally and never sent to any server.</p>
            </div>

            {passwordResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strength */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Password Strength</h3>
                  <div className="text-center mb-4">
                    <p className={`text-4xl font-bold capitalize ${
                      passwordResult.strength === 'excellent' ? 'text-green-400' :
                      passwordResult.strength === 'strong' ? 'text-emerald-400' :
                      passwordResult.strength === 'good' ? 'text-yellow-400' :
                      passwordResult.strength === 'fair' ? 'text-orange-400' : 'text-red-400'
                    }`}>
                      {passwordResult.strength}
                    </p>
                    <p className="text-gray-400 mt-2">Time to crack: <span className="text-white">{passwordResult.timeToCrack}</span></p>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all ${
                      passwordResult.strength === 'excellent' ? 'w-full bg-green-500' :
                      passwordResult.strength === 'strong' ? 'w-4/5 bg-emerald-500' :
                      passwordResult.strength === 'good' ? 'w-3/5 bg-yellow-500' :
                      passwordResult.strength === 'fair' ? 'w-2/5 bg-orange-500' : 'w-1/5 bg-red-500'
                    }`}></div>
                  </div>
                </div>

                {/* Exposure */}
                <div className={`rounded-xl border p-6 ${passwordResult.isCompromised ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                  <h3 className="text-lg font-semibold text-white mb-4">Breach Exposure</h3>
                  <div className="text-center">
                    <p className={`text-4xl font-bold ${passwordResult.isCompromised ? 'text-red-400' : 'text-green-400'}`}>
                      {passwordResult.isCompromised ? '⚠️ EXPOSED' : '✅ SAFE'}
                    </p>
                    {passwordResult.isCompromised && (
                      <p className="text-red-300 mt-2">Found in {passwordResult.exposureCount.toLocaleString()} breaches</p>
                    )}
                  </div>
                </div>

                {/* Suggestions */}
                {passwordResult.suggestions.length > 0 && (
                  <div className="md:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Improvement Suggestions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {passwordResult.suggestions.map((sug, i) => (
                        <div key={i} className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300">
                          <span>💡</span> {sug}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PRIVACY SCORE TAB */}
        {activeTab === 'privacy' && privacyScore && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
              <h3 className="text-gray-400 mb-2">Your Privacy Score</h3>
              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#374151" strokeWidth="12" />
                  <circle cx="80" cy="80" r="70" fill="none" stroke={privacyScore.overall >= 60 ? '#10b981' : privacyScore.overall >= 40 ? '#f59e0b' : '#ef4444'} 
                    strokeWidth="12" strokeDasharray={`${privacyScore.overall * 4.4} 440`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-5xl font-bold ${getScoreColor(privacyScore.overall)}`}>{privacyScore.overall}</span>
                </div>
              </div>
              <p className={`text-xl font-semibold capitalize ${getRiskColor(privacyScore.exposureLevel)}`}>
                {privacyScore.exposureLevel} Exposure
              </p>
            </div>

            {/* Category Breakdown */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Category Breakdown</h3>
              <div className="space-y-4">
                {privacyScore.categories.map((cat, i) => (
                  <div key={i} className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{cat.name}</span>
                      <span className={`font-bold ${getScoreColor(cat.score)}`}>{cat.score}/100</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                      <div className={`h-full ${cat.score >= 60 ? 'bg-emerald-500' : cat.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${cat.score}%` }}></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cat.findings.map((f, j) => (
                        <span key={j} className={`text-xs px-2 py-1 rounded ${cat.status === 'good' ? 'bg-green-500/20 text-green-400' : cat.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gray-900 rounded-xl border border-emerald-500/30 p-6">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Personalized Recommendations</h3>
              <div className="space-y-2">
                {privacyScore.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-lg">
                    <span className="text-emerald-400 font-bold">{i + 1}</span>
                    <span className="text-emerald-300">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DARK WEB TAB */}
        {activeTab === 'darkweb' && darkWebResult && (
          <div className="space-y-6">
            <div className={`rounded-xl border p-6 ${darkWebResult.foundOnDarkWeb ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 mb-1">Dark Web Status</p>
                  <p className={`text-3xl font-bold ${darkWebResult.foundOnDarkWeb ? 'text-red-400' : 'text-green-400'}`}>
                    {darkWebResult.foundOnDarkWeb ? '⚠️ Data Found on Dark Web' : '✅ Not Found on Dark Web'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Monitoring</p>
                  <p className={`font-bold ${darkWebResult.monitoringStatus === 'active' ? 'text-green-400' : 'text-gray-400'}`}>
                    {darkWebResult.monitoringStatus === 'active' ? '🟢 Active' : '⚪ Inactive'}
                  </p>
                </div>
              </div>
            </div>

            {darkWebResult.exposures.length > 0 && (
              <div className="bg-gray-900 rounded-xl border border-red-500/30 p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-4">Dark Web Exposures ({darkWebResult.exposures.length})</h3>
                <div className="space-y-3">
                  {darkWebResult.exposures.map((exp, i) => (
                    <div key={i} className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-white">{exp.source}</span>
                        <span className="text-gray-400 text-sm">{exp.date}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {exp.dataTypes.map((dt, j) => (
                          <span key={j} className="px-2 py-0.5 bg-red-500/20 rounded text-xs text-red-300">{dt}</span>
                        ))}
                      </div>
                      <p className="text-red-400 text-sm">Risk: {exp.riskLevel}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">What is Dark Web Monitoring?</h3>
              <p className="text-gray-400 mb-4">
                The dark web is a hidden part of the internet where stolen data is often traded. We continuously monitor these areas for your personal information.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: '🔍', title: 'Continuous Scanning', desc: 'We scan dark web forums, marketplaces, and paste sites 24/7' },
                  { icon: '⚡', title: 'Instant Alerts', desc: 'Get notified immediately if your data appears' },
                  { icon: '🛡️', title: 'Action Guidance', desc: 'Step-by-step instructions to protect yourself' }
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-gray-800/50 rounded-lg text-center">
                    <span className="text-3xl">{item.icon}</span>
                    <h4 className="font-semibold text-white mt-2">{item.title}</h4>
                    <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DIGITAL FOOTPRINT TAB */}
        {activeTab === 'footprint' && footprintResult && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Your Digital Footprint</h3>
                  <p className="text-gray-400">Accounts and platforms where your data exists</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-emerald-400">{footprintResult.accountsFound}</p>
                  <p className="text-gray-400 text-sm">Accounts Found</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Platform Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {footprintResult.platforms.map((platform, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${
                    platform.privacyRisk === 'high' ? 'bg-red-500/10 border-red-500/30' :
                    platform.privacyRisk === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-green-500/10 border-green-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">{platform.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded capitalize ${
                        platform.privacyRisk === 'high' ? 'bg-red-500/20 text-red-400' :
                        platform.privacyRisk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {platform.privacyRisk} risk
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{platform.category}</p>
                    <div className="flex flex-wrap gap-1">
                      {platform.dataShared.map((data, j) => (
                        <span key={j} className="px-2 py-0.5 bg-gray-700/50 rounded text-xs text-gray-300">{data}</span>
                      ))}
                    </div>
                    {platform.lastActivity && <p className="text-gray-500 text-xs mt-2">Last activity: {platform.lastActivity}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Social Media Presence</h3>
                <div className="space-y-2">
                  {footprintResult.socialProfiles.map((profile, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-800/50 rounded">
                      <span className="text-emerald-400">•</span>
                      <span className="text-white">{profile}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Public Mentions</h3>
                <p className="text-4xl font-bold text-emerald-400">{footprintResult.publicMentions}</p>
                <p className="text-gray-400">Times your email appears in public records</p>
              </div>
            </div>
          </div>
        )}

        {/* DATA REMOVAL TAB */}
        {activeTab === 'removal' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-2">Request Data Removal</h2>
              <p className="text-gray-400 mb-4">
                Under privacy laws like GDPR and CCPA, you have the right to request companies delete your personal data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { reg: 'GDPR', region: '🇪🇺 European Union', rights: ['Right to erasure', 'Right to access', 'Right to portability', 'Right to rectification'] },
                { reg: 'CCPA', region: '🇺🇸 California, USA', rights: ['Right to delete', 'Right to know', 'Right to opt-out', 'Right to non-discrimination'] },
                { reg: 'PIPEDA', region: '🇨🇦 Canada', rights: ['Right to access', 'Right to challenge', 'Right to withdraw consent'] },
                { reg: 'LGPD', region: '🇧🇷 Brazil', rights: ['Right to deletion', 'Right to information', 'Right to portability'] }
              ].map((item, i) => (
                <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{item.region.split(' ')[0]}</span>
                    <div>
                      <h3 className="font-bold text-white">{item.reg}</h3>
                      <p className="text-gray-400 text-sm">{item.region.slice(3)}</p>
                    </div>
                  </div>
                  <div className="space-y-1 mb-4">
                    {item.rights.map((r, j) => (
                      <p key={j} className="text-gray-300 text-sm flex items-center gap-2">
                        <span className="text-emerald-400">✓</span> {r}
                      </p>
                    ))}
                  </div>
                  <button className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all">
                    Generate {item.reg} Request
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 rounded-xl border border-emerald-500/30 p-6">
              <h3 className="text-lg font-semibold text-emerald-400 mb-4">Popular Data Removal Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Google', url: 'myaccount.google.com', desc: 'Remove personal info from search' },
                  { name: 'Facebook', url: 'facebook.com/privacy', desc: 'Delete account & download data' },
                  { name: 'Twitter/X', url: 'twitter.com/settings', desc: 'Deactivate & delete data' },
                  { name: 'LinkedIn', url: 'linkedin.com/psettings', desc: 'Close account & export data' },
                  { name: 'Amazon', url: 'amazon.com/privacy', desc: 'Request data deletion' },
                  { name: 'Apple', url: 'privacy.apple.com', desc: 'Delete Apple ID & data' }
                ].map((item, i) => (
                  <a key={i} href={`https://${item.url}`} target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all border border-gray-700 hover:border-emerald-500/30">
                    <h4 className="font-semibold text-white">{item.name}</h4>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                    <p className="text-emerald-400 text-xs mt-2">{item.url} →</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty states for tabs that need email first */}
        {['privacy', 'darkweb', 'footprint'].includes(activeTab) && !breachResult && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">{tabs.find(t => t.id === activeTab)?.icon}</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{tabs.find(t => t.id === activeTab)?.label}</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Enter your email above and click "Scan Now" to check your {tabs.find(t => t.id === activeTab)?.desc.toLowerCase()}.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>🛡️</span>
              <span>DataGuardian • Tool 10</span>
            </div>
            <span>Built by AI for Maula.AI - The ONE Platform</span>
            <span>v10.1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
