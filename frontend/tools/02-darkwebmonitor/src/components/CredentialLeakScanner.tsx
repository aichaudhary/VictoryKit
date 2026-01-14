import React, { useState } from 'react';
import {
  Search,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  Lock,
  Unlock,
  Key,
  Hash,
  Clock,
  Globe,
  Database,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  RefreshCw,
  TrendingUp,
  Zap,
  FileWarning,
} from 'lucide-react';

interface CredentialResult {
  found: boolean;
  source: string;
  password?: string;
  passwordStrength?: 'weak' | 'medium' | 'strong';
  firstSeen: Date;
  lastSeen: Date;
  timesFound: number;
  hashTypes?: string[];
  relatedEmails?: string[];
  recommendations: string[];
}

interface LeakedCredential {
  id: string;
  email: string;
  passwordHash: string;
  passwordPlain?: string;
  source: string;
  breachName: string;
  dateFound: Date;
  hashType: string;
  isDecrypted: boolean;
}

export const CredentialLeakScanner: React.FC = () => {
  const [searchType, setSearchType] = useState<'email' | 'password' | 'hash'>('email');
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [results, setResults] = useState<LeakedCredential[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [passwordStats, setPasswordStats] = useState<{
    totalLeaks: number;
    timesReused: number;
    strength: 'weak' | 'medium' | 'strong';
    isCommon: boolean;
  } | null>(null);

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2500));

    if (searchType === 'password') {
      // For password search, show statistics
      const isWeak = searchValue.length < 8 || /^[a-z]+$|^[0-9]+$/i.test(searchValue);
      const isCommon = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome'].some(
        p => searchValue.toLowerCase().includes(p)
      );

      setPasswordStats({
        totalLeaks: Math.floor(Math.random() * 1000000) + (isCommon ? 500000 : 100),
        timesReused: Math.floor(Math.random() * 10000),
        strength: isWeak ? 'weak' : searchValue.length > 12 ? 'strong' : 'medium',
        isCommon,
      });
      setResults([]);
    } else {
      // For email/hash search
      setPasswordStats(null);
      
      // Random chance of finding credentials
      if (Math.random() > 0.4) {
        const mockResults: LeakedCredential[] = [
          {
            id: '1',
            email: searchType === 'email' ? searchValue : `user***@email.com`,
            passwordHash: 'e99a18c428cb38d5f260853678922e03',
            passwordPlain: '********',
            source: 'Dark Web Forum - BreachForums',
            breachName: 'Collection #5',
            dateFound: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            hashType: 'MD5',
            isDecrypted: true,
          },
          {
            id: '2',
            email: searchType === 'email' ? searchValue : `admin***@company.org`,
            passwordHash: '5f4dcc3b5aa765d61d8327deb882cf99',
            source: 'Telegram Leak Channel',
            breachName: 'Corporate Dump 2024',
            dateFound: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
            hashType: 'SHA256',
            isDecrypted: false,
          },
        ];
        setResults(mockResults.slice(0, Math.floor(Math.random() * 2) + 1));
      } else {
        setResults([]);
      }
    }

    setIsSearching(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStrengthColor = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'weak': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'strong': return 'text-green-400';
    }
  };

  const getStrengthBg = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Key className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Credential Leak Scanner</h2>
            <p className="text-gray-400">Search for leaked credentials across dark web databases</p>
          </div>
        </div>

        {/* Search Type Selector */}
        <div className="flex gap-2 mb-4">
          {[
            { type: 'email' as const, label: 'Email', icon: <Globe className="w-4 h-4" /> },
            { type: 'password' as const, label: 'Password', icon: <Lock className="w-4 h-4" /> },
            { type: 'hash' as const, label: 'Hash', icon: <Hash className="w-4 h-4" /> },
          ].map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => {
                setSearchType(type);
                setSearchValue('');
                setResults([]);
                setPasswordStats(null);
                setHasSearched(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                searchType === type
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                  : 'bg-slate-800/50 border-slate-700/50 text-gray-400 hover:border-slate-600/50'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            {searchType === 'password' ? (
              <>
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter password to check if it's been leaked..."
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg pl-12 pr-12 py-4 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <>
                {searchType === 'email' ? (
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                ) : (
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                )}
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={
                    searchType === 'email'
                      ? 'Enter email address...'
                      : 'Enter MD5, SHA1, or SHA256 hash...'
                  }
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg pl-12 pr-4 py-4 text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-mono"
                />
              </>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchValue.trim()}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Scan Dark Web
              </>
            )}
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
          <Shield className="w-4 h-4 mt-0.5 text-green-400" />
          <span>
            Your {searchType} is never stored. We use secure hashing and k-anonymity to protect your data while scanning leaked databases.
          </span>
        </div>
      </div>

      {/* Password Statistics */}
      {passwordStats && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Password Analysis</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              passwordStats.totalLeaks > 100000 
                ? 'bg-red-500/20 text-red-400' 
                : passwordStats.totalLeaks > 1000 
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-green-500/20 text-green-400'
            }`}>
              {passwordStats.totalLeaks > 100000 ? 'COMPROMISED' : passwordStats.totalLeaks > 1000 ? 'AT RISK' : 'RELATIVELY SAFE'}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Database className="w-4 h-4" />
                Times Found
              </div>
              <div className="text-2xl font-bold text-white">
                {passwordStats.totalLeaks.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <RefreshCw className="w-4 h-4" />
                Reuse Count
              </div>
              <div className="text-2xl font-bold text-orange-400">
                {passwordStats.timesReused.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <Shield className="w-4 h-4" />
                Strength
              </div>
              <div className={`text-2xl font-bold capitalize ${getStrengthColor(passwordStats.strength)}`}>
                {passwordStats.strength}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                <FileWarning className="w-4 h-4" />
                Common Password
              </div>
              <div className={`text-2xl font-bold ${passwordStats.isCommon ? 'text-red-400' : 'text-green-400'}`}>
                {passwordStats.isCommon ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          {/* Strength Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Password Strength</span>
              <span className={getStrengthColor(passwordStats.strength)}>
                {passwordStats.strength === 'weak' ? '25%' : passwordStats.strength === 'medium' ? '50%' : '100%'}
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getStrengthBg(passwordStats.strength)}`}
                style={{
                  width: passwordStats.strength === 'weak' ? '25%' : passwordStats.strength === 'medium' ? '50%' : '100%'
                }}
              />
            </div>
          </div>

          {/* Warning */}
          {passwordStats.totalLeaks > 1000 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-400">This password is compromised!</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    This password has been found in {passwordStats.totalLeaks.toLocaleString()} data breaches.
                    You should never use this password and immediately change any accounts using it.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Recommendations</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Use a password manager to generate unique passwords
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Enable two-factor authentication on all accounts
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Use passwords with at least 16 characters
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Never reuse passwords across different accounts
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Credential Results */}
      {hasSearched && searchType !== 'password' && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Scan Results</h3>
            <span className={`px-3 py-1 rounded-full text-sm ${
              results.length > 0 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-green-500/20 text-green-400'
            }`}>
              {results.length > 0 ? `${results.length} credential(s) found` : 'No leaks found'}
            </span>
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500/30 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-green-400">Good news!</h4>
              <p className="text-gray-400 mt-2">
                No leaked credentials were found for this {searchType}.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {results.map((cred) => (
                <div key={cred.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        cred.isDecrypted ? 'bg-red-500/20' : 'bg-orange-500/20'
                      }`}>
                        {cred.isDecrypted ? (
                          <Unlock className="w-5 h-5 text-red-400" />
                        ) : (
                          <Lock className="w-5 h-5 text-orange-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{cred.email}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            cred.isDecrypted 
                              ? 'bg-red-500/20 text-red-400' 
                              : 'bg-orange-500/20 text-orange-400'
                          }`}>
                            {cred.isDecrypted ? 'DECRYPTED' : 'HASHED'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-gray-500 text-sm">Hash:</span>
                          <code className="px-2 py-1 bg-slate-900/50 rounded text-xs font-mono text-gray-400">
                            {cred.passwordHash}
                          </code>
                          <button
                            onClick={() => copyToClipboard(cred.passwordHash)}
                            className="text-gray-500 hover:text-gray-300"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>

                        {cred.isDecrypted && cred.passwordPlain && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-gray-500 text-sm">Password:</span>
                            <code className="px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-xs font-mono text-red-400">
                              {showPassword ? cred.passwordPlain : '••••••••'}
                            </code>
                            <button
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-gray-500 hover:text-gray-300"
                            >
                              {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span>Source: {cred.source}</span>
                          <span>Breach: {cred.breachName}</span>
                          <span>Hash Type: {cred.hashType}</span>
                          <span>Found: {cred.dateFound.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info Cards */}
      {!hasSearched && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">12B+ Records</h3>
            <p className="text-sm text-gray-400">
              Access to over 12 billion leaked credentials from dark web dumps and data breaches.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-time Scanning</h3>
            <p className="text-sm text-gray-400">
              Instant scanning against continuously updated databases from underground markets.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Zero-Knowledge</h3>
            <p className="text-sm text-gray-400">
              We never see your actual password. All checks use secure k-anonymity protocols.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CredentialLeakScanner;
