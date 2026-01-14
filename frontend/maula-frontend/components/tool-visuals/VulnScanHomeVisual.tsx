import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { 
  Shield, 
  Wifi, 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  Globe, 
  Settings,
  Activity,
  Target,
  Clock
} from 'lucide-react';

const VulnScanHomeVisual: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeStage, setActiveStage] = useState(0);
  const [riskScore, setRiskScore] = useState(0);
  const [openPorts, setOpenPorts] = useState(0);
  const [vulnsFound, setVulnsFound] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Scan progress animation
      gsap.to({ progress: 0 }, {
        progress: 100,
        duration: 8,
        repeat: -1,
        ease: 'power1.inOut',
        onUpdate: function() {
          const p = Math.floor(this.targets()[0].progress);
          setScanProgress(p);
          setActiveStage(Math.floor(p / 20));
          setRiskScore(Math.min(85, Math.floor(p * 0.85)));
          setOpenPorts(Math.floor(p / 10));
          setVulnsFound(Math.floor(p / 15));
        }
      });

      // Floating animation
      gsap.to('[data-float]', {
        y: -4,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Pulse animation
      gsap.to('[data-pulse]', {
        scale: 1.05,
        opacity: 0.8,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const scanStages = [
    { name: 'Initialize Scanner', status: 'complete' },
    { name: 'Host Discovery', status: 'complete' },
    { name: 'Port Scanning', status: 'active' },
    { name: 'Service Detection', status: 'pending' },
    { name: 'OS Fingerprinting', status: 'pending' },
  ];

  const openPortsList = [
    { port: 21, service: 'FTP', version: 'vsftpd 3.0.3', cve: true },
    { port: 22, service: 'SSH', version: 'OpenSSH 8.4', cve: false },
    { port: 25, service: 'SMTP', version: 'Postfix', cve: true },
  ];

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 via-amber-900/20 to-slate-950 rounded-3xl p-5 border border-amber-500/30 shadow-2xl overflow-hidden">
      
      {/* Header */}
      <div className="mb-4 pb-3 border-b border-amber-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/40 border border-amber-400/40">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-black text-white">VulnScan</div>
              <div className="text-[10px] text-amber-300">Enterprise Scanner v6.0</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[9px] text-gray-400">Scans Today</div>
              <div className="text-sm font-black text-white">1,285</div>
            </div>
            <div className="px-2 py-1 bg-emerald-500/20 border border-emerald-400/50 rounded-lg">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-300">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Ports', value: '100', icon: Wifi, color: 'text-blue-400' },
          { label: 'Open', value: openPorts.toString(), icon: Server, color: 'text-emerald-400' },
          { label: 'Vulns', value: vulnsFound.toString(), icon: AlertTriangle, color: 'text-red-400' },
          { label: 'Avg Scan', value: '12.4s', icon: Clock, color: 'text-amber-400' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-slate-800/40 rounded-lg p-2 border border-slate-700/30">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3 h-3 ${stat.color}`} />
                <span className="text-[8px] text-gray-400 uppercase">{stat.label}</span>
              </div>
              <div className={`text-base font-black ${stat.color}`}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Main Content - 2 Columns */}
      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        
        {/* Left: Live Scan Progress */}
        <div data-float className="bg-slate-800/40 rounded-xl p-3 border border-amber-500/20 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-white">Live Scan</span>
            </div>
            <span className="text-[10px] text-amber-400 font-bold">{Math.floor(scanProgress / 20)}/5 stages</span>
          </div>

          {/* Open Ports List */}
          <div className="flex-1 space-y-1.5 overflow-hidden">
            <div className="text-[9px] text-gray-400 mb-1">Open Ports ({openPorts})</div>
            {openPortsList.slice(0, 3).map((port, i) => (
              <div key={i} className="flex items-center justify-between p-1.5 bg-slate-900/50 rounded-lg border border-slate-700/30">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-mono w-5">{port.port}</span>
                  <span className="px-1.5 py-0.5 bg-slate-700/50 rounded text-[8px] font-bold text-emerald-400">{port.service}</span>
                  <span className="text-[8px] text-gray-500">{port.version}</span>
                </div>
                {port.cve && (
                  <span className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/40 rounded text-[8px] font-bold text-red-400">1 CVE</span>
                )}
              </div>
            ))}
          </div>

          {/* Scan Stages */}
          <div className="mt-2 pt-2 border-t border-slate-700/30">
            <div className="text-[9px] text-gray-400 mb-1.5">Scan Stages</div>
            <div className="space-y-1">
              {scanStages.slice(0, 3).map((stage, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      i < activeStage ? 'bg-emerald-400' : 
                      i === activeStage ? 'bg-amber-400 animate-pulse' : 
                      'bg-slate-600'
                    }`} />
                    <span className={`text-[9px] ${i <= activeStage ? 'text-white' : 'text-gray-500'}`}>{stage.name}</span>
                  </div>
                  {i < activeStage && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Risk Assessment */}
        <div data-float className="bg-slate-800/40 rounded-xl p-3 border border-red-500/20 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-bold text-white">Risk Assessment</span>
            </div>
          </div>

          {/* Critical Risk Icon */}
          <div className="flex flex-col items-center justify-center py-2">
            <div data-pulse className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/50 mb-2">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div className="text-red-400 font-black text-sm">CRITICAL RISK</div>
            <div className="text-[9px] text-gray-400 text-center">Vulnerabilities found</div>
          </div>

          {/* Risk Score */}
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-gray-400">Risk Score</span>
              <span className="text-lg font-black text-red-400">{riskScore}<span className="text-[10px] text-gray-500">/100</span></span>
            </div>
            <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full transition-all duration-300"
                style={{width: `${riskScore}%`}}
              />
            </div>

            {/* Vulnerability Breakdown */}
            <div className="text-[9px] text-gray-400 mb-1.5">Vulnerability Breakdown</div>
            <div className="flex gap-1.5">
              {[
                { label: 'Critical', count: Math.max(1, Math.floor(vulnsFound / 3)), color: 'bg-red-500/30 text-red-400 border-red-500/40' },
                { label: 'High', count: Math.floor(vulnsFound / 4), color: 'bg-orange-500/30 text-orange-400 border-orange-500/40' },
                { label: 'Medium', count: Math.floor(vulnsFound / 5), color: 'bg-yellow-500/30 text-yellow-400 border-yellow-500/40' },
                { label: 'Low', count: Math.floor(vulnsFound / 6), color: 'bg-emerald-500/30 text-emerald-400 border-emerald-500/40' },
              ].map((item, i) => (
                <div key={i} className={`flex-1 px-1.5 py-1 rounded border ${item.color} text-center`}>
                  <div className="text-[10px] font-black">{item.count}</div>
                  <div className="text-[7px] opacity-80">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VulnScanHomeVisual;
