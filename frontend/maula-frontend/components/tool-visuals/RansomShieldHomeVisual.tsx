import React, { useEffect, useRef, useState } from 'react';
import { Shield, Zap, FileText, Globe, Hash, HardDrive, Activity, AlertTriangle } from 'lucide-react';
import { gsap } from 'gsap';

const RansomShieldHomeVisual: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate scan progress
      const progressTl = gsap.timeline({ repeat: -1 });
      progressTl
        .to({}, {
          duration: 5,
          onUpdate: function() {
            setProgress(Math.floor(this.progress() * 100));
          },
        })
        .to({}, { duration: 1 });

      // Cycle through analysis stages
      const stageInterval = setInterval(() => {
        setActiveStage((prev) => (prev + 1) % 6);
      }, 1500);

      // Pulse threat indicators
      gsap.to('.threat-pulse', {
        scale: 1.2,
        opacity: 0.6,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
      });

      return () => {
        clearInterval(stageInterval);
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const analysisStages = [
    { name: 'Initializing Engine', icon: Shield, complete: true },
    { name: 'Signature Scan', icon: FileText, complete: true },
    { name: 'Heuristic Analysis', icon: Activity, complete: true },
    { name: 'Behavioral Detection', icon: AlertTriangle, complete: true },
    { name: 'Sandbox Execution', icon: HardDrive, complete: true },
    { name: 'YARA Rules', icon: Hash, complete: progress > 80 },
  ];

  return (
    <div ref={containerRef} className="w-full h-full bg-gradient-to-br from-purple-950/40 via-slate-900 to-pink-950/30 relative overflow-hidden">
      {/* Hexagonal Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%23a855f7' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 h-full grid grid-cols-2 gap-4">
        {/* Left Column - Malware Scanner */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl flex items-center justify-center border border-purple-500/30">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">RansomShield</div>
              <div className="text-gray-400 text-xs">Malware Detection Engine</div>
            </div>
          </div>

          {/* Scanner Card */}
          <div className="bg-slate-800/40 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white">Malware Scanner</span>
              <span className="text-xs text-purple-400">AI-Powered</span>
            </div>

            {/* Scan Type Tabs */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { icon: FileText, label: 'File', active: false },
                { icon: Globe, label: 'URL', active: true },
                { icon: Hash, label: 'Hash', active: false },
                { icon: HardDrive, label: 'Memory', active: false },
              ].map((tab, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    tab.active
                      ? 'bg-purple-500/20 border border-purple-500/40'
                      : 'bg-slate-700/30 border border-slate-600/30'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${tab.active ? 'text-purple-400' : 'text-gray-500'}`} />
                  <span className={`text-[8px] ${tab.active ? 'text-purple-400' : 'text-gray-500'}`}>
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            {/* URL Input */}
            <div className="mb-3">
              <div className="text-[9px] text-gray-400 mb-1">Enter URL to Scan</div>
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2">
                <div className="text-[10px] font-mono text-white">https://ransomshield.maula.ai/</div>
              </div>
            </div>

            {/* Scan Depth */}
            <div className="mb-3">
              <div className="text-[9px] text-gray-400 mb-2">Scan Depth</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Quick', time: '~10 sec', active: false },
                  { label: 'Standard', time: '~30 sec', active: true },
                  { label: 'Deep', time: '~2 min', active: false },
                ].map((depth, i) => (
                  <button
                    key={i}
                    className={`p-2 rounded-lg text-center transition-all ${
                      depth.active
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-700/30 text-gray-400'
                    }`}
                  >
                    <div className="text-[10px] font-bold">{depth.label}</div>
                    <div className="text-[8px] opacity-60">{depth.time}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 hover:brightness-110 transition">
              <Zap className="w-4 h-4" />
              Start Malware Scan
            </button>

            {/* Stats */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/30">
              <span className="text-[8px] text-gray-500">12.8M signatures</span>
              <span className="text-[8px] text-green-400">● Real-time protection</span>
            </div>
          </div>
        </div>

        {/* Right Column - Live Analysis & Results */}
        <div className="space-y-4">
          {/* Live Analysis */}
          <div className="bg-slate-800/40 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-bold text-white">Live Analysis</div>
                <div className="text-[9px] text-gray-500">Awaiting scan command</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-purple-400">10/10</div>
                <div className="text-[8px] text-gray-500">STEPS</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-2">
                <div className="text-xs text-gray-400 mb-1">Files Scanned</div>
                <div className="text-lg font-black text-white">1</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                <div className="text-xs text-red-400 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Threats Found
                </div>
                <div className="text-lg font-black text-red-400">3</div>
                <div className="text-[8px] text-red-400">⚠ Action Required</div>
              </div>
            </div>

            {/* Analysis Stages */}
            <div className="space-y-2">
              <div className="text-[9px] text-gray-400 mb-2 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                ANALYSIS STAGES
              </div>
              {analysisStages.map((stage, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                    i === activeStage
                      ? 'bg-purple-500/20 border border-purple-500/40'
                      : stage.complete
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-slate-900/30 border border-slate-700/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      stage.complete ? 'bg-green-500/20' : 'bg-slate-700/50'
                    }`}>
                      <stage.icon className={`w-3 h-3 ${
                        stage.complete ? 'text-green-400' : 'text-gray-500'
                      }`} />
                    </div>
                    <div>
                      <div className={`text-[10px] font-medium ${
                        stage.complete ? 'text-white' : 'text-gray-500'
                      }`}>
                        {stage.name}
                      </div>
                      <div className="text-[8px] text-gray-500">
                        {stage.complete ? '✓ Complete' : 'Pending'}
                      </div>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    stage.complete ? 'bg-green-400' : 'bg-gray-600'
                  }`} />
                </div>
              ))}
            </div>
          </div>

          {/* Scan Results Preview */}
          <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-bold text-white">Scan Results</div>
                <div className="text-[9px] text-gray-400">Completed in 20.0s</div>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-400 threat-pulse" />
            </div>

            {/* Risk Score */}
            <div className="flex items-center gap-4 mb-3">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-slate-700"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-red-500"
                    strokeDasharray={`${(40 / 100) * 175.93} 175.93`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-2xl font-black text-red-400">40</div>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-gray-400">Malware</span>
                  <span className="text-[10px] font-bold text-red-400">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-gray-400">Suspicious</span>
                  <span className="text-[10px] font-bold text-yellow-400">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-gray-400">Threats</span>
                  <span className="text-[10px] font-bold text-red-400">3</span>
                </div>
              </div>
            </div>

            {/* Detected Threats Preview */}
            <div className="text-[9px] text-red-400 mb-2 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              DETECTED THREATS
            </div>
            <div className="space-y-1">
              {[
                { name: 'Adware.BrowserModifier', severity: 'CRITICAL' },
                { name: 'Rootkit.MBR.Infection', severity: 'HIGH' },
              ].map((threat, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-slate-900/50 border border-red-500/20 rounded"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <span className="text-[9px] text-white font-mono">{threat.name}</span>
                  </div>
                  <span className="text-[8px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                    {threat.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-purple-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-pink-500/10 to-transparent blur-3xl pointer-events-none" />
    </div>
  );
};

export default RansomShieldHomeVisual;
