import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Mail, Globe, Link2, Check, AlertCircle, Shield } from 'lucide-react';

const PhishNetAIHomeVisual: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Scan progress animation
      gsap.to({ progress: 0 }, {
        progress: 100,
        duration: 6,
        repeat: -1,
        ease: 'power1.inOut',
        onUpdate: function() {
          setScanProgress(Math.floor(this.targets()[0].progress));
        }
      });

      // Tab rotation
      const tabInterval = setInterval(() => {
        setActiveTab((prev) => (prev + 1) % 4);
      }, 4000);

      // Floating animation
      gsap.to('[data-float]', {
        y: -5,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      return () => clearInterval(tabInterval);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const tabs = [
    { label: 'URL Analysis', icon: Link2, color: 'from-blue-600/70 to-blue-500/50' },
    { label: 'Email Security', icon: Mail, color: 'from-pink-600/70 to-pink-500/50' },
    { label: 'Domain Intel', icon: Globe, color: 'from-emerald-600/70 to-emerald-500/50' },
    { label: 'Bulk Check', icon: Check, color: 'from-purple-600/70 to-purple-500/50' }
  ];

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 via-purple-900/40 to-slate-950 rounded-3xl p-6 border border-emerald-500/30 shadow-2xl overflow-hidden">
      
      {/* Header */}
      <div className="mb-5 pb-4 border-b border-emerald-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 border border-emerald-400/40">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-base font-black text-white">PhishNetAI</div>
              <div className="text-xs text-emerald-300">Phishing Detection</div>
            </div>
          </div>
          <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/50 rounded-lg">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-emerald-300">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {[
          { label: 'Scans Today', value: '12,847', icon: Link2, color: 'text-cyan-400' },
          { label: 'Threats Blocked', value: '2,341', icon: AlertCircle, color: 'text-red-400' },
          { label: 'APIs Live', value: '35', icon: Globe, color: 'text-emerald-400' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-slate-800/40 rounded-xl p-3 border border-emerald-500/15">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <div className="text-[8px] text-gray-400 font-semibold uppercase">{stat.label}</div>
              </div>
              <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map((tab, i) => {
          const TabIcon = tab.icon;
          return (
            <div
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                i === activeTab 
                  ? `bg-gradient-to-r ${tab.color} border border-emerald-400/70 text-white shadow-lg` 
                  : 'bg-slate-800/60 border border-slate-700/40 text-gray-400 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <TabIcon className="w-3 h-3" />
                {tab.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content - Tab Views */}
      <div data-float className="flex-1 flex flex-col gap-3 min-h-0">
        
        {/* URL Analysis */}
        {activeTab === 0 && (
          <div className="flex-1 bg-slate-800/40 rounded-xl p-4 border border-emerald-500/20 flex flex-col">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-500/15">
              <Link2 className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">Analyze Suspicious URL</span>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/40 rounded-lg px-3 py-2 mb-3 text-xs text-gray-400 font-mono">
              https://suspicious-site.com/login/verify
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300">Analysis Progress</span>
                <span className="text-emerald-400 font-bold">{scanProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-300"
                  style={{width: `${scanProgress}%`}}
                />
              </div>
            </div>
          </div>
        )}

        {/* Email Security */}
        {activeTab === 1 && (
          <div className="flex-1 bg-slate-800/40 rounded-xl p-4 border border-pink-500/20 flex flex-col">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-pink-500/15">
              <Mail className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-bold text-white">Email Analysis</span>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/40 rounded-lg px-3 py-2 text-xs text-gray-400 font-mono mb-3 flex-1 overflow-hidden">
              <div className="text-[9px] leading-relaxed">
                From: security@suspicious-bank.com<br/>
                Subject: Verify Account<br/>
                Risk: HIGH
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400 font-semibold">Phishing Detected</span>
            </div>
          </div>
        )}

        {/* Domain Intel */}
        {activeTab === 2 && (
          <div className="flex-1 bg-slate-800/40 rounded-xl p-4 border border-emerald-500/20 flex flex-col">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-500/15">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-white">Domain Intelligence</span>
            </div>
            <div className="space-y-2 text-xs flex-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Domain:</span>
                <span className="text-emerald-400 font-mono">example.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Age:</span>
                <span className="text-emerald-400">1825 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">SSL:</span>
                <span className="text-emerald-400">✓ Valid</span>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Check */}
        {activeTab === 3 && (
          <div className="flex-1 bg-slate-800/40 rounded-xl p-4 border border-purple-500/20 flex flex-col">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-500/15">
              <Check className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-white">Bulk Check</span>
            </div>
            <div className="space-y-2 flex-1">
              {[
                { item: 'URLs', status: 'Clean', color: 'text-emerald-400' },
                { item: 'Emails', status: 'Safe', color: 'text-emerald-400' },
                { item: 'Domains', status: 'Verified', color: 'text-emerald-400' }
              ].map((check, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">{check.item}</span>
                  <span className={`font-semibold ${check.color}`}>✓ {check.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhishNetAIHomeVisual;
