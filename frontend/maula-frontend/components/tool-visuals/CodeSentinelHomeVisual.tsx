import React, { useEffect, useRef } from 'react';
import { Code, Shield, GitBranch, FileCode, Package, AlertTriangle, CheckCircle2, Zap, Lock, Globe, Eye } from 'lucide-react';
import { gsap } from 'gsap';

const CodeSentinelHomeVisual: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate analysis stages
      gsap.to('.analysis-stage', {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: 0.3,
        repeat: -1,
        repeatDelay: 2,
      });

      // Pulse score ring
      gsap.to('.score-ring', {
        strokeDashoffset: 0,
        duration: 2,
        repeat: -1,
        repeatDelay: 3,
        ease: 'power2.inOut',
      });

      // Live events animation
      gsap.to('.live-event', {
        y: '-=20',
        opacity: 0,
        duration: 2,
        stagger: 0.4,
        repeat: -1,
        repeatDelay: 1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-gradient-to-br from-emerald-950/40 via-slate-900 to-cyan-950/30 relative overflow-hidden">
      {/* Code matrix background */}
      <div className="absolute inset-0 opacity-5 font-mono text-[8px] text-emerald-500 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="whitespace-nowrap" style={{ marginLeft: `${(i * 7) % 30}px` }}>
            {`const security = await analyze(code); if (vuln) { report(cve); }`}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-base">CodeSentinel</div>
              <div className="text-gray-400 text-[9px]">AI-Powered SAST Engine</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-yellow-500/20 rounded text-[8px] text-yellow-400 border border-yellow-500/30">
              SAST ENGINE
            </div>
            <div className="px-2 py-0.5 bg-emerald-500/20 rounded text-[8px] text-emerald-400 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" /> Active
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-1 mb-3">
          {[
            { label: 'Security Rules', value: '50+' },
            { label: 'CVE Patterns', value: '100+', color: 'orange' },
            { label: 'Secret Types', value: '200+' },
            { label: 'Scan Speed', value: '<1s', color: 'yellow' },
            { label: 'VictoryKit AI', value: '✓', color: 'cyan' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/40 border border-slate-700/30 rounded px-1.5 py-1 text-center">
              <div className={`text-xs font-black ${stat.color ? `text-${stat.color}-400` : 'text-white'} tabular-nums`}>
                {stat.value}
              </div>
              <div className="text-[6px] text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main 3-Panel Layout */}
        <div className="flex-1 grid grid-cols-3 gap-2">
          {/* Code Analysis Panel */}
          <div className="bg-slate-800/30 rounded-xl p-2.5 border border-slate-700/30 overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-emerald-500/20 rounded flex items-center justify-center flex-shrink-0">
                <Code className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <span className="text-[8px] font-bold text-white block truncate">Code Analysis</span>
                <div className="text-[6px] text-gray-500 truncate">Scan for vulnerabilities</div>
              </div>
            </div>
            
            {/* Source Type */}
            <div className="text-[6px] text-gray-400 mb-1">Source Type</div>
            <div className="flex gap-1 mb-2">
              {[
                { icon: FileCode, label: 'Paste', active: false },
                { icon: Globe, label: 'URL', active: false },
                { icon: GitBranch, label: 'Repo', active: true },
              ].map((type, i) => (
                <div key={i} className={`flex-1 flex items-center justify-center gap-0.5 px-1 py-1 rounded text-[6px] ${type.active ? 'bg-emerald-500 text-white' : 'bg-slate-700/30 text-gray-500'}`}>
                  <type.icon className="w-2 h-2" />
                  {type.label}
                </div>
              ))}
            </div>

            {/* Repository URL */}
            <div className="text-[6px] text-gray-400 mb-0.5">Repository URL</div>
            <div className="bg-slate-900/50 rounded px-1.5 py-1 text-[6px] font-mono text-gray-400 mb-1 truncate">
              https://codesentinel.maula.ai/
            </div>

            {/* Branch */}
            <div className="text-[6px] text-gray-400 mb-0.5">Branch</div>
            <div className="bg-slate-900/50 rounded px-1.5 py-1 text-[6px] font-mono text-white mb-1">
              main
            </div>

            {/* Language */}
            <div className="text-[6px] text-gray-400 mb-0.5">Language</div>
            <div className="bg-slate-900/50 rounded px-1.5 py-1 text-[6px] text-gray-400 flex items-center justify-between">
              <span>Auto-detect</span>
              <span className="text-gray-600">▼</span>
            </div>
          </div>

          {/* Live Analysis Panel */}
          <div className="bg-slate-800/30 rounded-xl p-2.5 border border-slate-700/30 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 bg-red-500/20 rounded flex items-center justify-center flex-shrink-0">
                  <Eye className="w-3 h-3 text-red-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-[8px] font-bold text-white block">Live Analysis</span>
                  <div className="text-[6px] text-gray-500">javascript • 1 lines</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[6px] flex-shrink-0">
                <span className="text-gray-400">5</span>
                <span className="text-gray-400">5</span>
                <span className="text-emerald-400">0</span>
              </div>
            </div>

            {/* Analysis Stages */}
            <div className="flex flex-wrap gap-0.5 mb-2">
              {['Parsing', 'SAST', 'Secrets', 'Deps', 'Report'].map((stage, i) => (
                <div key={i} className="analysis-stage flex items-center gap-0.5 px-1 py-0.5 bg-slate-700/50 rounded text-[6px] text-gray-300 border border-slate-600/30">
                  <CheckCircle2 className="w-2 h-2 text-emerald-400" />
                  {stage}
                </div>
              ))}
            </div>

            {/* Code Editor Area */}
            <div className="bg-slate-900/80 rounded p-1.5 font-mono text-[6px] mb-2 h-10">
              <span className="text-gray-500">1</span>
              <span className="text-gray-400 ml-1">// Paste code...</span>
            </div>

            {/* Live Events */}
            <div className="text-[6px] text-gray-400 mb-1">Live Events</div>
            <div className="space-y-0.5">
              {[
                { icon: Zap, label: 'Reporting', color: 'yellow' },
                { icon: Package, label: 'jsonwebtoken', color: 'gray' },
                { icon: Package, label: 'moment', color: 'gray' },
                { icon: Package, label: 'axios', color: 'gray' },
              ].map((event, i) => (
                <div key={i} className="live-event flex items-center gap-1 text-[6px] text-gray-400">
                  <event.icon className={`w-2 h-2 text-${event.color}-400`} />
                  <span className="truncate">{event.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-slate-800/30 rounded-xl p-2.5 border border-emerald-500/20 overflow-hidden">
            {/* Score and Grade Row */}
            <div className="flex items-center justify-between mb-2">
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#1e293b" strokeWidth="3" />
                  <circle
                    className="score-ring"
                    cx="24" cy="24" r="20"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="126"
                    strokeDashoffset="0"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-black text-emerald-400">100</span>
                </div>
              </div>
              <div className="text-right">
                <div className="px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-[7px] font-bold text-emerald-400 mb-0.5 inline-block">
                  Grade A
                </div>
                <div className="text-[6px] text-gray-400">Excellent posture</div>
              </div>
            </div>

            {/* Quick Stats - 2x2 grid */}
            <div className="grid grid-cols-2 gap-1 mb-2">
              {[
                { label: 'Files', value: '5' },
                { label: 'Lines', value: '1' },
                { label: 'Issues', value: '0', color: 'emerald' },
                { label: 'Time', value: '3.2s' },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900/50 rounded p-1 text-center">
                  <div className={`text-xs font-bold ${stat.color ? `text-${stat.color}-400` : 'text-white'}`}>{stat.value}</div>
                  <div className="text-[5px] text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Issues by Severity */}
            <div className="text-[6px] text-gray-400 mb-1 flex items-center gap-0.5">
              <AlertTriangle className="w-2 h-2" /> Issues by Severity
            </div>
            <div className="grid grid-cols-4 gap-0.5 mb-2">
              {[
                { level: 'Crit', count: 0, color: 'red' },
                { level: 'High', count: 0, color: 'orange' },
                { level: 'Med', count: 0, color: 'yellow' },
                { level: 'Low', count: 0, color: 'blue' },
              ].map((sev, i) => (
                <div key={i} className="bg-slate-900/50 rounded p-1 text-center">
                  <div className={`w-1.5 h-1.5 rounded-full bg-${sev.color}-500 mx-auto mb-0.5`} />
                  <div className="text-[8px] font-bold text-gray-400">{sev.count}</div>
                </div>
              ))}
            </div>

            {/* Dependencies */}
            <div className="flex items-center justify-between text-[6px] bg-slate-900/50 rounded p-1.5">
              <div className="flex items-center gap-1 text-gray-400">
                <Package className="w-2.5 h-2.5" /> Vuln Deps
              </div>
              <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-[6px] font-bold">2</span>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-2 flex items-center justify-between text-[7px]">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Engine: <span className="text-emerald-400">Ready</span></span>
            <span className="text-gray-400">Mode: <span className="text-cyan-400">SAST</span></span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-mono">ANALYZING</span>
          </div>
        </div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-emerald-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-cyan-500/10 to-transparent blur-3xl pointer-events-none" />
    </div>
  );
};

export default CodeSentinelHomeVisual;
