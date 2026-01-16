import React, { useEffect, useState } from 'react';
import {
  Shield,
  Lock,
  Key,
  Search,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Eye,
  EyeOff,
  Globe,
  Trash2,
  User,
  Fingerprint,
} from 'lucide-react';

const DataGuardianHomeVisual: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [breachCount, setBreachCount] = useState(6);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const tabTimer = setInterval(() => {
      setActiveTab((t) => (t + 1) % 6);
    }, 3000);
    return () => clearInterval(tabTimer);
  }, []);

  const tabs = [
    { icon: Lock, label: 'Breach Check', active: true },
    { icon: Key, label: 'Password', active: false },
    { icon: Shield, label: 'Privacy', active: false },
    { icon: Globe, label: 'Dark Web', active: false },
    { icon: Fingerprint, label: 'Footprint', active: false },
    { icon: Trash2, label: 'Removal', active: false },
  ];

  const platforms = [
    { name: 'Google', risk: 'High', tags: ['Search', 'Location', 'YouTube'] },
    { name: 'Facebook', risk: 'High', tags: ['Posts', 'Photos', 'Friends'] },
    { name: 'Amazon', risk: 'Medium', tags: ['Orders', 'Payments'] },
    { name: 'LinkedIn', risk: 'Medium', tags: ['Profile', 'Connections'] },
  ];

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-slate-800/50 rounded text-[8px] text-gray-400 flex items-center gap-1">
            ← Maula.AI
          </div>
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <Shield className="w-3 h-3 text-white" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-white">DataGuardian</span>
            <div className="text-[6px] text-emerald-400">Personal Data Protection Hub</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[6px] text-gray-400">Protected by Maula.AI</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-800/30 overflow-x-auto">
        {tabs.map((tab, i) => (
          <div
            key={i}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[7px] whitespace-nowrap transition-all ${
              i === activeTab
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-2.5 h-2.5" />
            {tab.label}
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-3 overflow-hidden">
        {/* Breach Check Section */}
        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800/50 mb-2">
          <h3 className="text-[9px] font-bold text-white mb-1">Check Your Data Protection Status</h3>
          <p className="text-[7px] text-gray-500 mb-2">Enter your email to scan for breaches, privacy risks, and more.</p>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-800/50 border border-emerald-500/30 rounded-lg px-3 py-2 flex items-center">
              <Mail className="w-3 h-3 text-gray-500 mr-2" />
              <span className="text-[8px] text-gray-300">test@maula.ai</span>
            </div>
            <button className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-[8px] text-white font-medium flex items-center gap-1 transition-colors">
              <Search className="w-3 h-3" /> Scan Now
            </button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          {/* Breach Status */}
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-2.5">
            <div className="text-[7px] text-gray-400 mb-1">Breach Status for test@maula.ai</div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-bold text-amber-400">Found in {breachCount} Breaches</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[6px] text-gray-500">Risk Level</span>
              <span className="text-[8px] font-bold text-amber-400">High</span>
            </div>
          </div>

          {/* Password Strength */}
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-2.5">
            <div className="text-[8px] font-medium text-white mb-1">Password Strength</div>
            <div className="text-[11px] font-bold text-emerald-400 mb-1">Excellent</div>
            <div className="text-[6px] text-gray-500 mb-1">Time to crack: 10,000+ years</div>
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-full" />
            </div>
          </div>
        </div>

        {/* Digital Footprint */}
        <div className="bg-slate-900/50 rounded-xl p-2.5 border border-slate-800/50 mb-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[8px] font-bold text-white">Your Digital Footprint</div>
              <div className="text-[6px] text-gray-500">Accounts and platforms where your data exists</div>
            </div>
            <div className="text-right">
              <div className="text-[14px] font-bold text-emerald-400">6</div>
              <div className="text-[6px] text-gray-500">Accounts Found</div>
            </div>
          </div>

          {/* Platform Grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {platforms.map((platform, i) => (
              <div
                key={i}
                className={`p-1.5 rounded-lg border ${
                  platform.risk === 'High'
                    ? 'bg-red-900/10 border-red-500/20'
                    : 'bg-amber-900/10 border-amber-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[7px] font-medium text-white">{platform.name}</span>
                  <span className={`text-[5px] px-1 py-0.5 rounded ${
                    platform.risk === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {platform.risk} Risk
                  </span>
                </div>
                <div className="flex flex-wrap gap-0.5">
                  {platform.tags.map((tag, j) => (
                    <span key={j} className="px-1 py-0.5 bg-slate-800/50 rounded text-[5px] text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Removal Section */}
        <div className="bg-slate-900/50 rounded-xl p-2 border border-slate-800/50">
          <div className="text-[8px] font-bold text-white mb-1.5">Request Data Removal</div>
          <div className="grid grid-cols-4 gap-1">
            {[
              { name: 'GDPR', region: '🇪🇺 EU' },
              { name: 'CCPA', region: '🇺🇸 USA' },
              { name: 'PIPEDA', region: '🇨🇦 Canada' },
              { name: 'LGPD', region: '🇧🇷 Brazil' },
            ].map((law, i) => (
              <div key={i} className="bg-slate-800/50 rounded p-1.5 text-center border border-slate-700/30">
                <div className="text-[7px] font-bold text-white">{law.name}</div>
                <div className="text-[5px] text-gray-500">{law.region}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-slate-800/30 flex items-center justify-between text-[6px]">
        <span className="text-gray-500">Privacy Score: <span className="text-emerald-400">85/100</span></span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400">PROTECTION ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default DataGuardianHomeVisual;
