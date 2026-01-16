import React, { useEffect, useRef } from 'react';
import { Shield, Search, Target, Activity, Bug, Clock, Server, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { gsap } from 'gsap';

const VulnScanHomeVisual: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate scan progress
      gsap.to('.scan-progress', {
        width: '85%',
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
      });

      // Pulse vulnerability indicators
      gsap.to('.vuln-indicator', {
        scale: 1.15,
        opacity: 0.7,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
        stagger: 0.2,
      });

      // Animate scan stages
      gsap.to('.scan-stage', {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.3,
        repeat: -1,
        repeatDelay: 2,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-gradient-to-br from-amber-950/40 via-slate-900 to-orange-950/30 relative overflow-hidden">
      {/* Scanning Grid Lines */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent"
            style={{ 
              top: `${i * 8}%`,
              animation: `scanPulse ${2 + (i % 3) * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute h-full w-px bg-gradient-to-b from-transparent via-amber-500/50 to-transparent"
            style={{ left: `${i * 10}%` }}
          />
        ))}
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-1.5 h-1.5 rounded-full vuln-indicator ${
              i % 4 === 0 ? 'bg-red-500' : 
              i % 4 === 1 ? 'bg-orange-500' : 
              i % 4 === 2 ? 'bg-yellow-500' : 'bg-amber-500'
            }`}
            style={{
              left: `${10 + (i * 6) % 80}%`,
              top: `${15 + (i * 7) % 70}%`,
              opacity: 0.4,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-5 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">VulnScan</div>
              <div className="text-gray-400 text-xs">Enterprise Scanner v6.0</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 bg-green-500/20 rounded border border-green-500/30">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[9px] text-green-400 font-mono">SIM</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Scans Today', value: '1,284', icon: Search, color: 'gray' },
            { label: 'Vulns Found', value: '3,847', icon: Bug, color: 'red' },
            { label: 'Avg Scan', value: '12.4s', icon: Clock, color: 'gray' },
            { label: 'Hosts', value: '847', icon: Server, color: 'purple' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-2 text-center">
              <stat.icon className={`w-3 h-3 text-${stat.color}-400 mx-auto mb-1`} />
              <div className={`text-sm font-black ${stat.color === 'red' ? 'text-red-400' : stat.color === 'purple' ? 'text-purple-400' : 'text-white'} tabular-nums`}>
                {stat.value}
              </div>
              <div className="text-[7px] text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main 3-Column Layout */}
        <div className="flex-1 grid grid-cols-3 gap-2">
          {/* Scan Configuration Panel */}
          <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-amber-500/20 rounded flex items-center justify-center">
                <Target className="w-3 h-3 text-amber-400" />
              </div>
              <span className="text-[9px] font-bold text-white">Scan Config</span>
            </div>
            <div className="text-[8px] text-gray-400 mb-2">Scan Type</div>
            <div className="grid grid-cols-2 gap-1 mb-2">
              {['Single Host', 'Network', 'Web App', 'API'].map((type, i) => (
                <div key={i} className={`px-1.5 py-1 rounded text-[7px] text-center ${i === 0 ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-slate-700/30 text-gray-500'}`}>
                  {type}
                </div>
              ))}
            </div>
            <div className="text-[8px] text-gray-400 mb-1">Depth</div>
            <div className="flex gap-1">
              {['Quick', 'Std', 'Deep'].map((depth, i) => (
                <div key={i} className={`flex-1 px-1 py-0.5 rounded text-[7px] text-center ${i === 1 ? 'bg-amber-500 text-white' : 'bg-slate-700/30 text-gray-500'}`}>
                  {depth}
                </div>
              ))}
            </div>
          </div>

          {/* Live Scan Panel */}
          <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500/20 rounded flex items-center justify-center">
                  <Activity className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-[9px] font-bold text-white">Live Scan</span>
              </div>
              <span className="text-[8px] text-gray-400">8/9</span>
            </div>
            <div className="grid grid-cols-3 gap-1 mb-2">
              <div className="text-center">
                <div className="text-[7px] text-gray-500">Ports</div>
                <div className="text-xs font-bold text-white">100</div>
              </div>
              <div className="text-center">
                <div className="text-[7px] text-gray-500">Open</div>
                <div className="text-xs font-bold text-green-400">10</div>
              </div>
              <div className="text-center">
                <div className="text-[7px] text-gray-500">Vulns</div>
                <div className="text-xs font-bold text-red-400">4</div>
              </div>
            </div>
            {/* Open Ports */}
            <div className="space-y-1">
              {[
                { port: '21/FTP', status: '1 CVE', color: 'red' },
                { port: '22/SSH', status: 'Secure', color: 'green' },
                { port: '25/SMTP', status: '1 CVE', color: 'red' },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between px-1.5 py-0.5 bg-slate-900/50 rounded text-[7px]">
                  <span className="text-gray-400 font-mono">{p.port}</span>
                  <span className={`text-${p.color}-400`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Risk Panel */}
          <div className="bg-slate-800/30 rounded-xl p-3 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-[8px] font-bold text-red-400">
                CRITICAL
              </div>
              <Shield className="w-3 h-3 text-red-400" />
            </div>
            <div className="mb-2">
              <div className="text-[8px] text-gray-400 mb-1">Risk Score</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div className="scan-progress h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full" style={{ width: '70%' }} />
                </div>
                <span className="text-xs font-bold text-red-400">85</span>
              </div>
            </div>
            {/* Vulnerability Breakdown */}
            <div className="space-y-1">
              {[
                { level: 'Critical', count: 1, color: 'red' },
                { level: 'High', count: 1, color: 'orange' },
                { level: 'Medium', count: 1, color: 'yellow' },
                { level: 'Low', count: 1, color: 'green' },
              ].map((v, i) => (
                <div key={i} className="flex items-center justify-between text-[7px]">
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full bg-${v.color}-500`} />
                    <span className="text-gray-400">{v.level}</span>
                  </div>
                  <span className={`font-bold text-${v.color}-400`}>{v.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-3 flex items-center justify-between text-[8px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              <span className="text-gray-400">SCANNING: <span className="text-amber-400 font-bold">ACTIVE</span></span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span className="text-gray-400">CVE DB: <span className="text-green-400">Updated</span></span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 font-mono">LIVE</span>
          </div>
        </div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-amber-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-orange-500/10 to-transparent blur-3xl pointer-events-none" />

      <style>{`
        @keyframes scanPulse {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default VulnScanHomeVisual;
