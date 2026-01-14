import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import {
  ArrowLeft,
  Eye,
  Globe,
  Database,
  Search,
  ShieldAlert,
  Cpu,
  Network,
  Zap,
} from 'lucide-react';

const DarkWebMonitorDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heroTextRef.current?.children || [], {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power4.out',
      });

      gsap.from(contentRef.current?.children || [], {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.3,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0d0404] text-white selection:bg-red-500/30 font-sans"
    >
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-red-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="flex items-center justify-between mb-24">
          <button
            onClick={() => setView('home')}
            className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
            to Ecosystem
          </button>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">
            DarkWebMonitor v4.2.0
          </span>
        </div>

        {/* Realistic Tool Preview Hero Section */}
        <div className="relative rounded-3xl border border-purple-500/20 bg-gradient-to-br from-[#18132a] to-[#0d0414] shadow-2xl mb-40 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-8 pt-8 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="font-black text-2xl text-white leading-tight">DarkWebMonitor</div>
                <div className="text-xs text-purple-300 font-mono">
                  Advanced Threat Intelligence Platform
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-red-500/20 rounded text-xs font-mono text-red-400">
                12 Critical
              </div>
              <div className="px-3 py-1 bg-orange-500/20 rounded text-xs font-mono text-orange-400">
                43 Active
              </div>
              <button className="px-5 py-2 bg-slate-800/70 border border-slate-700/50 rounded-lg text-white text-xs font-bold flex items-center gap-2 hover:bg-slate-700/80 transition-all">
                <span>Back to Maula</span>
              </button>
              <a
                href="/neural-link/"
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg text-white text-xs font-bold flex items-center gap-2 shadow-lg hover:from-purple-500 hover:to-violet-500 transition-all"
              >
                <span>AI Assistant</span>
              </a>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex items-center gap-2 px-8 pb-2">
            {[
              'Live Threats',
              'Asset Monitor',
              'Breach Check',
              'Leak Scanner',
              'Intel Gather',
              'OSINT Search',
              'Security Score',
            ].map((tab, i) => (
              <div
                key={tab}
                className={`px-4 py-2 rounded-lg text-xs font-bold ${i === 0 ? 'bg-green-600/20 text-green-400' : 'text-gray-400 hover:text-white hover:bg-slate-800/50'} transition-all cursor-pointer`}
              >
                {tab}
              </div>
            ))}
          </div>
          {/* Stats Row */}
          <div className="flex gap-6 px-8 py-4">
            <div className="flex-1 bg-slate-900/60 rounded-xl p-4 flex flex-col items-center">
              <div className="text-3xl font-black text-green-400">847,302</div>
              <div className="text-xs text-gray-400">Global Threats (24h)</div>
            </div>
            <div className="flex-1 bg-slate-900/60 rounded-xl p-4 flex flex-col items-center">
              <div className="text-3xl font-black text-orange-400">12,850</div>
              <div className="text-xs text-gray-400">Active Attacks</div>
            </div>
            <div className="flex-1 bg-slate-900/60 rounded-xl p-4 flex flex-col items-center">
              <div className="text-3xl font-black text-red-400">3,421</div>
              <div className="text-xs text-gray-400">Compromised Systems</div>
            </div>
            <div className="flex-1 bg-slate-900/60 rounded-xl p-4 flex flex-col items-center">
              <div className="text-3xl font-black text-purple-400">127</div>
              <div className="text-xs text-gray-400">Data Breaches (Today)</div>
            </div>
          </div>
          {/* Live Threat Feed & Threat Distribution */}
          <div className="flex gap-8 px-8 pb-8">
            {/* Live Threat Feed */}
            <div className="flex-1 bg-slate-900/60 rounded-2xl p-6">
              <div className="font-bold text-white mb-2">Live Threat Feed</div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-yellow-400 text-xs font-mono">
                  <ShieldAlert className="w-4 h-4" /> Malware{' '}
                  <span className="bg-yellow-700/30 text-yellow-300 px-2 py-0.5 rounded ml-2">
                    MEDIUM
                  </span>{' '}
                  <span className="text-gray-400 ml-2">Supply chain compromise detected</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-mono">
                  <Database className="w-4 h-4" /> Breach{' '}
                  <span className="bg-blue-700/30 text-blue-300 px-2 py-0.5 rounded ml-2">LOW</span>{' '}
                  <span className="text-gray-400 ml-2">Cryptominer deployment blocked</span>
                </div>
                <div className="flex items-center gap-2 text-green-400 text-xs font-mono">
                  <Cpu className="w-4 h-4" /> Apt{' '}
                  <span className="bg-green-700/30 text-green-300 px-2 py-0.5 rounded ml-2">
                    LOW
                  </span>{' '}
                  <span className="text-gray-400 ml-2">Cryptominer deployment blocked</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-400 text-xs font-mono">
                  <ShieldAlert className="w-4 h-4" /> Phishing{' '}
                  <span className="bg-yellow-700/30 text-yellow-300 px-2 py-0.5 rounded ml-2">
                    MEDIUM
                  </span>{' '}
                  <span className="text-gray-400 ml-2">Suspicious login detected</span>
                </div>
              </div>
            </div>
            {/* Threat Distribution */}
            <div className="w-80 bg-slate-900/60 rounded-2xl p-6">
              <div className="font-bold text-white mb-2">Threat Distribution</div>
              <div className="space-y-2">
                {[
                  { label: 'Phishing', value: 4, color: 'bg-green-400' },
                  { label: 'Malware', value: 4, color: 'bg-yellow-400' },
                  { label: 'Ddos', value: 3, color: 'bg-blue-400' },
                  { label: 'Breach', value: 3, color: 'bg-purple-400' },
                  { label: 'Apt', value: 3, color: 'bg-green-300' },
                  { label: 'Ransomware', value: 2, color: 'bg-red-400' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs">
                    <span className="w-20 text-gray-400">{item.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-800">
                      <div
                        className={`${item.color} h-2 rounded-full`}
                        style={{ width: `${item.value * 20}%` }}
                      ></div>
                    </div>
                    <span className="w-6 text-right text-white font-mono">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div ref={contentRef} className="space-y-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-white/10 text-center">
            <div>
              <div className="text-5xl font-black text-red-500 tracking-tighter">50K+</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Data Sources
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white tracking-tighter">Global</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Network Coverage
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white tracking-tighter">Real-time</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Threat Alerts
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white tracking-tighter">24/7</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Monitoring
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                <Eye className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold tracking-tight">Credential Monitoring</h3>
              <p className="text-white/50 leading-relaxed font-medium">
                Detect stolen credentials and compromised accounts before they're exploited by
                threat actors.
              </p>
            </div>
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                <Network className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold tracking-tight">Forum Intelligence</h3>
              <p className="text-white/50 leading-relaxed font-medium">
                Monitor underground forums and encrypted channels for threat actor discussions
                targeting your organization.
              </p>
            </div>
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-red-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold tracking-tight">Data Leak Detection</h3>
              <p className="text-white/50 leading-relaxed font-medium">
                Identify exposed sensitive data and intellectual property on dark web marketplaces
                instantly.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-white/10">
          <button
            onClick={() => setView('home')}
            className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all"
          >
            Return Home
          </button>
          <a
            href="https://darkwebmonitor.maula.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="px-16 py-8 bg-red-500 text-white rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl flex items-center gap-4 text-center"
          >
            Start Monitoring <Zap className="w-5 h-5 fill-current" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DarkWebMonitorDetail;
