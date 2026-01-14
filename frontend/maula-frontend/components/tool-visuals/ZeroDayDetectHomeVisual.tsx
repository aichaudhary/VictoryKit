import React, { useEffect, useRef } from 'react';
import { Target, Activity, AlertTriangle, Shield } from 'lucide-react';
import { gsap } from 'gsap';

const ZeroDayDetectHomeVisual: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate scan lines
      gsap.to('.scan-line', {
        y: '100%',
        duration: 2,
        repeat: -1,
        ease: 'none',
        stagger: {
          each: 0.3,
          repeat: -1,
        },
      });

      // Pulse vulnerability indicators
      gsap.to('.vuln-pulse', {
        scale: 1.2,
        opacity: 0.6,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
      });

      // Animate CVE feed
      gsap.to('.cve-item', {
        y: '-=50',
        duration: 2.5,
        repeat: -1,
        ease: 'none',
        stagger: {
          each: 0.5,
          repeat: -1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-gradient-to-br from-red-950/40 via-slate-900 to-orange-950/30 relative overflow-hidden">
      {/* Scan Line Grid */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="scan-line absolute w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"
            style={{ top: `${i * 10}%` }}
          />
        ))}
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500/30 to-orange-500/30 rounded-xl flex items-center justify-center border border-red-500/30">
              <Target className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">ZeroDayDetect</div>
              <div className="text-gray-400 text-xs">Threat Intelligence</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 vuln-pulse" />
            <span className="text-xs text-red-400 font-mono">MONITORING</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: 'Zero-Days', value: '20', color: 'red' },
            { label: 'Critical', value: '3', color: 'red' },
            { label: 'In Wild', value: '12', color: 'orange' },
            { label: 'Unpatched', value: '13', color: 'yellow' },
          ].map((stat, i) => (
            <div key={i} className={`bg-slate-800/40 border border-${stat.color}-500/20 rounded-lg p-2 text-center`}>
              <div className={`text-xl font-black text-${stat.color}-400 tabular-nums`}>
                {stat.value}
              </div>
              <div className="text-[8px] text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Vulnerability Map */}
        <div className="relative w-full h-[180px] mb-6 bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 border-2 border-red-500/30 rounded-full" />
              <div className="absolute inset-2 border border-red-500/20 rounded-full" />
              <div className="absolute inset-4 border border-red-500/10 rounded-full" />
              
              {/* Vulnerability Points */}
              {[
                { angle: 45, radius: 60, severity: 'critical' },
                { angle: 120, radius: 45, severity: 'high' },
                { angle: 200, radius: 55, severity: 'critical' },
                { angle: 300, radius: 40, severity: 'medium' },
                { angle: 340, radius: 50, severity: 'high' },
              ].map((point, i) => {
                const x = Math.cos((point.angle * Math.PI) / 180) * point.radius;
                const y = Math.sin((point.angle * Math.PI) / 180) * point.radius;
                return (
                  <div
                    key={i}
                    className="vuln-pulse absolute w-2 h-2 rounded-full"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className={`w-full h-full rounded-full ${
                      point.severity === 'critical' ? 'bg-red-500' :
                      point.severity === 'high' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10">
            <div className="text-xs font-bold text-white mb-2">Attack Surface Analysis</div>
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-gray-400">Coverage: <span className="text-green-400 font-bold">98.7%</span></span>
              <span className="text-gray-400">Threats: <span className="text-red-400 font-bold">Active</span></span>
            </div>
          </div>
        </div>

        {/* CVE Feed */}
        <div className="flex-1 bg-slate-800/30 rounded-xl border border-slate-700/30 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white">Zero-Day Feed</span>
            <Activity className="w-4 h-4 text-red-400" />
          </div>

          <div className="space-y-2 relative">
            {[
              { cve: 'CVE-2024-9680', title: 'Firefox RCE', score: '9.8', severity: 'CRIT', color: 'red' },
              { cve: 'CVE-2024-43451', title: 'Windows NTLM', score: '7.5', severity: 'HIGH', color: 'orange' },
              { cve: 'CVE-2024-8190', title: 'Ivanti Injection', score: '9.4', severity: 'CRIT', color: 'red' },
              { cve: 'CVE-2024-7264', title: 'Chrome Exploit', score: '8.8', severity: 'HIGH', color: 'orange' },
            ].map((vuln, i) => (
              <div
                key={i}
                className="cve-item flex items-center justify-between p-2 bg-slate-900/50 border border-slate-700/30 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-3 h-3 text-${vuln.color}-400`} />
                  <div>
                    <div className="text-[10px] font-mono font-bold text-blue-400">{vuln.cve}</div>
                    <div className="text-[9px] text-gray-500">{vuln.title}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded bg-${vuln.color}-500/20 text-${vuln.color}-400 border border-${vuln.color}-500/30`}>
                    {vuln.severity}
                  </span>
                  <span className={`text-xs font-black text-${vuln.color}-400 tabular-nums`}>
                    {vuln.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-green-400" />
            <span className="text-[9px] text-gray-400">Engine: <span className="text-green-400">Online</span></span>
          </div>
          <span className="text-[9px] text-gray-400">Last Scan: <span className="text-blue-400">2m ago</span></span>
        </div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-red-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-orange-500/10 to-transparent blur-3xl pointer-events-none" />
    </div>
  );
};

export default ZeroDayDetectHomeVisual;
