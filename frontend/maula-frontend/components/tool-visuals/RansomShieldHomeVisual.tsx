import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { AlertTriangle, Activity, Shield, CheckCircle2, Zap, Bug, Flame } from 'lucide-react';

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

      // Gentle floating
      gsap.to('[data-float]', {
        y: -3,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Pulse on key elements
      gsap.to('[data-pulse]', {
        opacity: 0.8,
        duration: 2,
        repeat: -1,
        yoyo: true
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 via-purple-900/40 to-slate-950 rounded-3xl p-6 border border-purple-500/30 shadow-2xl overflow-hidden">
      
      {/* Header */}
      <div className="mb-5 pb-4 border-b border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/40 border border-purple-400/40">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-base font-black text-white">RansomShield</div>
              <div className="text-xs text-purple-300">Malware Detection</div>
            </div>
          </div>
          <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/50 rounded-lg">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-emerald-300">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - 4 columns, clean */}
      <div className="grid grid-cols-4 gap-2.5 mb-5">
        {[
          { label: 'Files', value: '2.47M', icon: Activity, color: 'blue' },
          { label: 'Threats', value: '12.8K', icon: Flame, color: 'red' },
          { label: 'Detection', value: '99.96%', icon: CheckCircle2, color: 'emerald' },
          { label: 'Response', value: '< 50ms', icon: Zap, color: 'purple' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
            blue: { bg: 'from-blue-600/30 to-blue-700/20', text: 'text-blue-300', icon: 'text-blue-400' },
            red: { bg: 'from-red-600/30 to-red-700/20', text: 'text-red-300', icon: 'text-red-400' },
            emerald: { bg: 'from-emerald-600/30 to-emerald-700/20', text: 'text-emerald-300', icon: 'text-emerald-400' },
            purple: { bg: 'from-purple-600/30 to-purple-700/20', text: 'text-purple-300', icon: 'text-purple-400' }
          };
          const colors = colorMap[stat.color];
          return (
            <div key={i} className={`bg-gradient-to-br ${colors.bg} rounded-xl p-3 border border-opacity-40 border-current`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${colors.icon}`} />
                <div className="text-[8px] text-gray-400 font-semibold uppercase">{stat.label}</div>
              </div>
              <div className={`text-lg font-black ${colors.text}`}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs - Clean row */}
      <div className="flex gap-2 mb-5">
        {['File', 'URL', 'Hash', 'Memory'].map((type, i) => (
          <div
            key={i}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              i === 0 
                ? 'bg-gradient-to-r from-purple-600/70 to-pink-600/60 border border-purple-400/70 text-white shadow-lg' 
                : 'bg-slate-800/60 border border-slate-700/40 text-gray-400'
            }`}
          >
            {type}
          </div>
        ))}
      </div>

      {/* Main Content - 2 Columns */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        
        {/* Left: Analysis */}
        <div data-float className="bg-slate-800/40 rounded-2xl p-4 border border-purple-500/20 flex flex-col">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-500/15">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-bold text-white flex-1">Live Analysis</span>
            <span className="px-2 py-0.5 bg-purple-500/30 border border-purple-400/40 rounded text-[8px] font-semibold text-purple-300">LIVE</span>
          </div>

          {/* Progress bars */}
          <div className="space-y-2.5 flex-1">
            {[
              { name: 'Signatures', val: 92 },
              { name: 'Behavior', val: 85 },
              { name: 'Heuristics', val: 78 },
              { name: 'AI Engine', val: scanProgress }
            ].map((p, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">{p.name}</span>
                  <span className="text-xs font-bold text-purple-300">{p.val}%</span>
                </div>
                <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
                    style={{width: `${p.val}%`}}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Threats */}
        <div data-float className="bg-slate-800/40 rounded-2xl p-4 border border-red-500/15 flex flex-col">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-red-500/15">
            <Bug className="w-4 h-4 text-red-400" />
            <span className="text-sm font-bold text-white flex-1">Threats</span>
            <div data-pulse className="px-2 py-0.5 bg-emerald-500/30 border border-emerald-400/50 rounded text-[8px] font-semibold text-emerald-300 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              SAFE
            </div>
          </div>

          {/* Threat items */}
          <div className="space-y-2 flex-1">
            {[
              { name: 'Ransomware', count: '0', color: 'text-emerald-400' },
              { name: 'Trojans', count: '2', color: 'text-yellow-400' },
              { name: 'Zero-Days', count: '0', color: 'text-emerald-400' },
              { name: 'Vulnerabilities', count: '5', color: 'text-purple-400' }
            ].map((threat, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-700/30 hover:border-slate-600/50 transition">
                <span className="text-xs text-gray-300">{threat.name}</span>
                <span className={`text-sm font-black ${threat.color}`}>{threat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RansomShieldHomeVisual;