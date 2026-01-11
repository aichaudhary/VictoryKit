import React, { useState } from 'react';
import {
  Globe,
  Mail,
  Phone,
  Wifi,
  Key,
  Shield,
  Sparkles,
  Activity,
  BarChart3,
  History,
} from 'lucide-react';
import URLScanner from './URLScanner';
import EmailChecker from './EmailChecker';
import PhoneValidator from './PhoneValidator';
import IPChecker from './IPChecker';
import PasswordChecker from './PasswordChecker';

type ScannerType = 'url' | 'email' | 'phone' | 'ip' | 'password';

interface ScannerTab {
  id: ScannerType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}

const scannerTabs: ScannerTab[] = [
  {
    id: 'url',
    label: 'URL Scanner',
    icon: Globe,
    description: 'Check URLs for malware & phishing',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'email',
    label: 'Email Breach',
    icon: Mail,
    description: 'Check email breach exposure',
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'phone',
    label: 'Phone Validator',
    icon: Phone,
    description: 'Validate & check phone numbers',
    color: 'from-green-500 to-teal-600',
  },
  {
    id: 'ip',
    label: 'IP Checker',
    icon: Wifi,
    description: 'Check IP reputation & threats',
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'password',
    label: 'Password Check',
    icon: Key,
    description: 'Check if password is compromised',
    color: 'from-yellow-500 to-orange-600',
  },
];

const PublicScanner: React.FC = () => {
  const [activeScanner, setActiveScanner] = useState<ScannerType>('url');

  const renderScanner = () => {
    switch (activeScanner) {
      case 'url':
        return <URLScanner />;
      case 'email':
        return <EmailChecker />;
      case 'phone':
        return <PhoneValidator />;
      case 'ip':
        return <IPChecker />;
      case 'password':
        return <PasswordChecker />;
      default:
        return <URLScanner />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-full mb-4">
          <Shield className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-300">Free Security Tools</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-red-200 to-pink-200 bg-clip-text text-transparent mb-3">
          Security Scanner Suite
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Protect yourself with our free, professional-grade security scanners. Check URLs, emails, phone numbers, IP addresses, and passwords for threats and vulnerabilities.
        </p>
      </div>

      {/* Scanner Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {scannerTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeScanner === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveScanner(tab.id)}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r ' + tab.color + ' shadow-lg scale-105'
                  : 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <div className="text-left">
                <div className={`font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                  {tab.label}
                </div>
                <div className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
                  {tab.description}
                </div>
              </div>
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-white/10 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Scanner */}
      <div className="min-h-[600px] bg-slate-900/30 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
        {renderScanner()}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="font-medium text-white">AI-Powered Analysis</h3>
          </div>
          <p className="text-sm text-gray-400">
            Our scanners use multiple threat intelligence sources and machine learning to provide accurate results.
          </p>
        </div>
        <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="font-medium text-white">Privacy First</h3>
          </div>
          <p className="text-sm text-gray-400">
            Your data is processed securely. Password checks use k-anonymity - your actual password never leaves your device.
          </p>
        </div>
        <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-medium text-white">Real-Time Results</h3>
          </div>
          <p className="text-sm text-gray-400">
            Get instant results from live threat databases including VirusTotal, AbuseIPDB, Have I Been Pwned, and more.
          </p>
        </div>
      </div>

      {/* Powered By Section */}
      <div className="text-center pt-8 border-t border-slate-800">
        <p className="text-xs text-gray-500 mb-3">Powered by industry-leading security providers</p>
        <div className="flex flex-wrap justify-center gap-6 text-gray-600">
          <span className="text-xs font-mono">VirusTotal</span>
          <span className="text-xs font-mono">Google Safe Browsing</span>
          <span className="text-xs font-mono">Have I Been Pwned</span>
          <span className="text-xs font-mono">AbuseIPDB</span>
          <span className="text-xs font-mono">IPQualityScore</span>
          <span className="text-xs font-mono">URLScan.io</span>
        </div>
      </div>
    </div>
  );
};

export default PublicScanner;
