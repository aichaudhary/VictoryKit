import React, { useState } from 'react';
import {
  Search,
  Mail,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Globe,
  Calendar,
  Users,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  XCircle,
} from 'lucide-react';

interface BreachRecord {
  id: string;
  name: string;
  domain: string;
  breachDate: Date;
  addedDate: Date;
  modifiedDate: Date;
  pwnCount: number;
  description: string;
  logoPath?: string;
  dataClasses: string[];
  isVerified: boolean;
  isFabricated: boolean;
  isSensitive: boolean;
  isRetired: boolean;
  isSpamList: boolean;
}

interface PasteRecord {
  id: string;
  source: string;
  title: string;
  date: Date;
  emailCount: number;
}

interface BreachCheckResult {
  email: string;
  isBreached: boolean;
  breachCount: number;
  breaches: BreachRecord[];
  pastes: PasteRecord[];
  firstBreach?: Date;
  lastBreach?: Date;
  exposedDataTypes: string[];
}

// Mock breach database
const MOCK_BREACHES: BreachRecord[] = [
  {
    id: 'linkedin-2021',
    name: 'LinkedIn',
    domain: 'linkedin.com',
    breachDate: new Date('2021-06-22'),
    addedDate: new Date('2021-06-29'),
    modifiedDate: new Date('2021-06-29'),
    pwnCount: 700000000,
    description: 'In June 2021, a scraped LinkedIn database containing 700 million records was leaked. The exposed data includes email addresses, full names, phone numbers, physical addresses, geolocation data, and professional information.',
    dataClasses: ['Email addresses', 'Names', 'Phone numbers', 'Physical addresses', 'Professional data'],
    isVerified: true,
    isFabricated: false,
    isSensitive: false,
    isRetired: false,
    isSpamList: false,
  },
  {
    id: 'facebook-2019',
    name: 'Facebook',
    domain: 'facebook.com',
    breachDate: new Date('2019-04-01'),
    addedDate: new Date('2021-04-06'),
    modifiedDate: new Date('2021-04-06'),
    pwnCount: 533000000,
    description: 'In April 2019, a large dataset of Facebook user records was leaked containing 533 million accounts. The exposed data includes phone numbers, Facebook IDs, full names, locations, birthdates, and email addresses.',
    dataClasses: ['Email addresses', 'Names', 'Phone numbers', 'Dates of birth', 'Locations'],
    isVerified: true,
    isFabricated: false,
    isSensitive: false,
    isRetired: false,
    isSpamList: false,
  },
  {
    id: 'adobe-2013',
    name: 'Adobe',
    domain: 'adobe.com',
    breachDate: new Date('2013-10-04'),
    addedDate: new Date('2013-12-04'),
    modifiedDate: new Date('2013-12-04'),
    pwnCount: 153000000,
    description: 'In October 2013, 153 million Adobe accounts were breached with each containing an internal ID, username, email, encrypted password and a password hint in plain text.',
    dataClasses: ['Email addresses', 'Password hints', 'Passwords', 'Usernames'],
    isVerified: true,
    isFabricated: false,
    isSensitive: false,
    isRetired: false,
    isSpamList: false,
  },
  {
    id: 'dropbox-2012',
    name: 'Dropbox',
    domain: 'dropbox.com',
    breachDate: new Date('2012-07-01'),
    addedDate: new Date('2016-08-31'),
    modifiedDate: new Date('2016-08-31'),
    pwnCount: 68648009,
    description: 'In mid-2012, Dropbox suffered a data breach which exposed the stored credentials of 68 million users. The exposed data includes email addresses and salted hashes of passwords.',
    dataClasses: ['Email addresses', 'Passwords'],
    isVerified: true,
    isFabricated: false,
    isSensitive: false,
    isRetired: false,
    isSpamList: false,
  },
];

const MOCK_PASTES: PasteRecord[] = [
  {
    id: 'paste-1',
    source: 'Pastebin',
    title: 'Credential Dump 2024',
    date: new Date('2024-01-15'),
    emailCount: 50000,
  },
  {
    id: 'paste-2',
    source: 'Ghostbin',
    title: 'Email List',
    date: new Date('2023-11-20'),
    emailCount: 25000,
  },
];

const DataClassBadge: React.FC<{ dataClass: string }> = ({ dataClass }) => {
  const getColor = (type: string) => {
    if (type.toLowerCase().includes('password')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (type.toLowerCase().includes('email')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (type.toLowerCase().includes('phone')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    if (type.toLowerCase().includes('address')) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border ${getColor(dataClass)}`}>
      {dataClass}
    </span>
  );
};

export const BreachDetection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<BreachCheckResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [expandedBreach, setExpandedBreach] = useState<string | null>(null);
  const [recentChecks, setRecentChecks] = useState<string[]>([]);

  const handleCheck = async () => {
    if (!email.trim()) return;

    setIsChecking(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Random chance of being breached for demo
    const isBreached = Math.random() > 0.3;
    const selectedBreaches = isBreached 
      ? MOCK_BREACHES.slice(0, Math.floor(Math.random() * MOCK_BREACHES.length) + 1)
      : [];

    const result: BreachCheckResult = {
      email: email.trim(),
      isBreached,
      breachCount: selectedBreaches.length,
      breaches: selectedBreaches,
      pastes: isBreached && Math.random() > 0.5 ? MOCK_PASTES.slice(0, 1) : [],
      firstBreach: selectedBreaches.length > 0 
        ? new Date(Math.min(...selectedBreaches.map(b => b.breachDate.getTime())))
        : undefined,
      lastBreach: selectedBreaches.length > 0
        ? new Date(Math.max(...selectedBreaches.map(b => b.breachDate.getTime())))
        : undefined,
      exposedDataTypes: [...new Set(selectedBreaches.flatMap(b => b.dataClasses))],
    };

    setResult(result);
    setIsChecking(false);
    setRecentChecks(prev => [email.trim(), ...prev.filter(e => e !== email.trim())].slice(0, 5));
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/30">
            <Database className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Data Breach Detection</h2>
            <p className="text-gray-400">Check if your email has been exposed in known data breaches</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              placeholder="Enter email address to check..."
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg pl-12 pr-4 py-4 text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
            />
          </div>
          <button
            onClick={handleCheck}
            disabled={isChecking || !email.trim()}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg font-medium hover:from-red-500 hover:to-orange-500 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Check Breaches
              </>
            )}
          </button>
        </div>

        {/* Recent Checks */}
        {recentChecks.length > 0 && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Recent:</span>
            {recentChecks.map((e) => (
              <button
                key={e}
                onClick={() => setEmail(e)}
                className="px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-xs text-gray-400 hover:text-white hover:border-slate-600/50 transition-all"
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className={`rounded-xl border p-6 ${
            result.isBreached 
              ? 'bg-red-500/10 border-red-500/30' 
              : 'bg-green-500/10 border-green-500/30'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                result.isBreached ? 'bg-red-500/20' : 'bg-green-500/20'
              }`}>
                {result.isBreached ? (
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${result.isBreached ? 'text-red-400' : 'text-green-400'}`}>
                  {result.isBreached 
                    ? `Oh no! ${result.email} was found in ${result.breachCount} data breach${result.breachCount > 1 ? 'es' : ''}!`
                    : `Good news! ${result.email} was not found in any known breaches.`
                  }
                </h3>
                {result.isBreached && (
                  <p className="text-gray-400 mt-2">
                    Your email was exposed between {result.firstBreach?.toLocaleDateString()} and {result.lastBreach?.toLocaleDateString()}.
                    Take immediate action to secure your accounts.
                  </p>
                )}
              </div>
            </div>

            {/* Exposed Data Summary */}
            {result.isBreached && result.exposedDataTypes.length > 0 && (
              <div className="mt-6 p-4 bg-slate-900/50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Exposed Data Types</h4>
                <div className="flex flex-wrap gap-2">
                  {result.exposedDataTypes.map((type) => (
                    <DataClassBadge key={type} dataClass={type} />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {result.isBreached && (
              <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
                <button className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm hover:border-slate-600/50 transition-all">
                  <Lock className="w-4 h-4 text-green-400" />
                  Change Passwords
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm hover:border-slate-600/50 transition-all">
                  <Shield className="w-4 h-4 text-blue-400" />
                  Enable 2FA
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm hover:border-slate-600/50 transition-all">
                  <Eye className="w-4 h-4 text-purple-400" />
                  Monitor This Email
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm hover:border-slate-600/50 transition-all">
                  <FileText className="w-4 h-4 text-orange-400" />
                  Download Report
                </button>
              </div>
            )}
          </div>

          {/* Breach Details */}
          {result.breaches.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="p-4 border-b border-slate-700/50">
                <h3 className="text-lg font-semibold text-white">Breach Details</h3>
              </div>
              <div className="divide-y divide-slate-700/50">
                {result.breaches.map((breach) => (
                  <div key={breach.id} className="p-4">
                    <div
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => setExpandedBreach(expandedBreach === breach.id ? null : breach.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
                          <Globe className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-semibold text-white">{breach.name}</h4>
                            {breach.isVerified && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">Verified</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {breach.breachDate.toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {formatNumber(breach.pwnCount)} accounts
                            </span>
                          </div>
                        </div>
                      </div>
                      {expandedBreach === breach.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {expandedBreach === breach.id && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-4">
                        <p className="text-gray-400 text-sm">{breach.description}</p>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-300 mb-2">Compromised Data</h5>
                          <div className="flex flex-wrap gap-2">
                            {breach.dataClasses.map((dc) => (
                              <DataClassBadge key={dc} dataClass={dc} />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Domain: {breach.domain}</span>
                          <span>Added: {breach.addedDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paste Sites */}
          {result.pastes.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl border border-orange-500/30 overflow-hidden">
              <div className="p-4 border-b border-slate-700/50 bg-orange-500/10">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-semibold text-white">Found in Paste Sites</h3>
                </div>
              </div>
              <div className="divide-y divide-slate-700/50">
                {result.pastes.map((paste) => (
                  <div key={paste.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{paste.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                        <span>Source: {paste.source}</span>
                        <span>{paste.date.toLocaleDateString()}</span>
                        <span>{formatNumber(paste.emailCount)} emails in paste</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      {!result && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">700+ Breaches</h3>
            <p className="text-sm text-gray-400">
              We continuously monitor and index data from over 700 known data breaches containing billions of records.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Privacy First</h3>
            <p className="text-sm text-gray-400">
              Your email is never stored or logged. We use k-anonymity to check breaches without exposing your data.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Updates</h3>
            <p className="text-sm text-gray-400">
              New breaches are added as they're discovered. Set up monitoring to get instant alerts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreachDetection;
