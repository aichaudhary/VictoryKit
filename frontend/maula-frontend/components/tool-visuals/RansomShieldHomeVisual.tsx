import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { AlertTriangle, Activity, Shield, CheckCircle2, Zap, Bug } from 'lucide-react';

const RansomShieldHomeVisual: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Continuous progress animation
      gsap.to({ progress: 0 }, {
        progress: 100,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        onUpdate: function() {
          setScanProgress(Math.floor(this.targets()[0].progress));
        }
      });

      // Floating animation for scanner panel
      gsap.to('[data-float]', {
        y: -5,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: gsap.utils.random(0, 0.5)
      });

      // Pulse animations for metrics
      gsap.to('[data-pulse-metric]', {
        boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
        stagger: 0.2
      });

      // Glow effect on status
      gsap.to('[data-status-glow]', {
        textShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
        duration: 1.5,
        repeat: -1,
        yoyo: true
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950/95 via-purple-950/70 to-slate-950/95 rounded-3xl p-8 border border-purple-500/40 shadow-2xl overflow-hidden">
      
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none' stroke='%23a855f7' stroke-width='0.5'/%3E%3C/svg%3E")`,
        backgroundSize: '40px 40px',
      }} />

      {/* Premium Header */}
      <div className="mb-7 pb-5 border-b border-purple-500/25 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-600/40 border border-purple-400/30">
              <Shield className="w-8 h-8 text-white" />
              <div className="absolute inset-0 rounded-2xl animate-pulse" style={{
                boxShadow: 'inset 0 0 20px rgba(168, 85, 247, 0.2), 0 0 20px rgba(168, 85, 247, 0.3)'
              }} />
            </div>
            <div>
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">RansomShield</div>
              <div className="text-sm text-purple-300 font-semibold tracking-wide">Enterprise Malware Detection</div>
            </div>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-400/40 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <div className="text-sm font-black text-emerald-300">ACTIVE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Stats Grid - 4 Columns */}
      <div className="grid grid-cols-4 gap-3 mb-7">
        {[
          { label: 'Files Analyzed', value: '2.47M', sublabel: 'this month', icon: Activity, gradient: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', text: 'text-blue-300' },
          { label: 'Threats Detected', value: '12.8K', sublabel: 'blocked', icon: AlertTriangle, gradient: 'from-red-500/20 to-red-600/10', border: 'border-red-500/30', text: 'text-red-300' },
          { label: 'Detection Rate', value: '99.96%', sublabel: 'accuracy', icon: CheckCircle2, gradient: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', text: 'text-emerald-300' },
          { label: 'Response Time', value: '< 50ms', sublabel: 'avg', icon: Zap, gradient: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/30', text: 'text-purple-300' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} data-pulse-metric className={`bg-gradient-to-br ${stat.gradient} ${stat.border} rounded-2xl p-4 border backdrop-blur-sm transition-all hover:border-opacity-60`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-5 h-5 ${stat.text}`} />
                <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">{stat.label}</div>
              </div>
              <div className={`text-2xl font-black ${stat.text} mb-1`}>{stat.value}</div>
              <div className="text-[9px] text-gray-500 font-medium">{stat.sublabel}</div>
            </div>
          );
        })}
      </div>

      {/* Scan Type Tabs - Enhanced */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {['File Scanner', 'URL Analysis', 'Hash Lookup', 'Memory Scan'].map((type, i) => (
          <div
            key={i}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer backdrop-blur-sm ${
              i === 0 
                ? 'bg-gradient-to-r from-purple-600/70 to-pink-600/50 border-2 border-purple-400/70 text-white shadow-lg shadow-purple-500/50' 
                : 'bg-slate-800/50 border border-slate-700/50 text-gray-300 hover:border-slate-600 hover:bg-slate-800/70'
            }`}
          >
            {type}
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-2 gap-5 relative z-10">
        
        {/* Left: Real-time Analysis Panel */}
        <div data-float className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 rounded-2xl p-5 border border-purple-500/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-500/15">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-bold text-white">Real-Time Analysis</span>
            </div>
            <span className="px-2 py-1 bg-purple-500/20 border border-purple-400/40 rounded-lg text-[9px] font-semibold text-purple-300">LIVE</span>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3">
            {[
              { name: 'Signature Detection', progress: 92, color: 'from-blue-500 to-blue-400' },
              { name: 'Behavioral Analysis', progress: 85, color: 'from-purple-500 to-purple-400' },
              { name: 'Heuristic Scanning', progress: 78, color: 'from-pink-500 to-pink-400' },
              { name: 'AI Classification', progress: scanProgress, color: 'from-emerald-500 to-emerald-400' }
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-300 font-medium">{item.name}</span>
                  <span className="text-xs font-mono text-purple-300 font-bold">{item.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-700/50 rounded-full overflow-hidden border border-slate-600/30">
                  <div 
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500 shadow-lg`}
                    style={{width: `${item.progress}%`}}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Threat Detection & Status */}
        <div data-float className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 rounded-2xl p-5 border border-red-500/15 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-red-500/15">
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-red-400" />
              <span className="text-sm font-bold text-white">Threat Status</span>
            </div>
            <div data-status-glow className="px-3 py-1 bg-gradient-to-r from-emerald-500/30 to-emerald-600/20 border border-emerald-400/50 rounded-lg flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-emerald-300">PROTECTED</span>
            </div>
          </div>

          {/* Threat Metrics */}
          <div className="space-y-3">
            {[
              { name: 'Ransomware Detected', count: '0', status: 'safe', color: 'emerald' },
              { name: 'Trojans Blocked', count: '2', status: 'warning', color: 'yellow' },
              { name: 'Zero-Days', count: '0', status: 'safe', color: 'emerald' },
              { name: 'Vulnerabilities', count: '5', status: 'monitored', color: 'purple' }
            ].map((threat, i) => {
              const colors: Record<string, string> = {
                emerald: 'text-emerald-400',
                yellow: 'text-yellow-400',
                purple: 'text-purple-400'
              };
              return (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/30 border border-slate-700/30 hover:border-slate-600/50 transition">
                  <span className="text-xs text-gray-300 font-medium">{threat.name}</span>
                  <div className="text-right">
                    <div className={`text-lg font-black ${colors[threat.color]}`}>{threat.count}</div>
                    <div className="text-[8px] text-gray-500 capitalize">{threat.status}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-slate-700/30">
            <div className="text-[9px] text-gray-500 flex items-center justify-between">
              <span>23.8B signatures • AI-Powered</span>
              <span>Updated 2m ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RansomShieldHomeVisual;