import React, { useEffect, useRef } from 'react';
import { Eye, Globe, AlertTriangle, Activity } from 'lucide-react';
import { gsap } from 'gsap';

const DarkWebMonitorHomeVisual: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Radar sweep animation
      gsap.to('.radar-sweep', {
        rotation: 360,
        duration: 4,
        repeat: -1,
        ease: 'none',
      });

      // Pulse threat markers
      gsap.to('.threat-marker', {
        scale: 1.3,
        opacity: 0.5,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
        stagger: 0.3,
      });

      // Scroll threat feed
      gsap.to('.threat-item', {
        y: '-=60',
        duration: 2,
        repeat: -1,
        ease: 'none',
        stagger: {
          each: 0.4,
          repeat: -1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Matrix Effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 font-mono text-[8px] leading-3 text-green-400">
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="whitespace-nowrap">
              {Math.random().toString(36).substring(2, 15).repeat(20)}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
              <Eye className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">DarkWebMonitor</div>
              <div className="text-gray-400 text-xs">Global Intelligence</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400 font-mono">SCANNING</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Sources', value: '50K+', color: 'purple' },
            { label: 'Threats', value: '1.2M', color: 'red' },
            { label: 'Monitored', value: '24/7', color: 'blue' },
          ].map((stat, i) => (
            <div key={i} className={`bg-slate-800/40 border border-${stat.color}-500/20 rounded-lg p-3 text-center`}>
              <div className={`text-2xl font-black text-${stat.color}-400 tabular-nums`}>
                {stat.value}
              </div>
              <div className="text-[9px] text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Radar Visualization */}
        <div className="relative w-full aspect-square max-h-[200px] mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
          <div className="absolute inset-[20%] rounded-full border border-purple-500/20" />
          <div className="absolute inset-[40%] rounded-full border border-purple-500/20" />
          
          {/* Radar Sweep */}
          <div className="radar-sweep absolute inset-0">
            <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-purple-500 to-transparent origin-left" />
          </div>

          {/* Threat Markers */}
          {[
            { x: '70%', y: '30%', severity: 'high' },
            { x: '40%', y: '60%', severity: 'medium' },
            { x: '80%', y: '70%', severity: 'critical' },
            { x: '25%', y: '40%', severity: 'low' },
          ].map((marker, i) => (
            <div
              key={i}
              className="threat-marker absolute w-3 h-3 rounded-full"
              style={{ left: marker.x, top: marker.y }}
            >
              <div className={`w-full h-full rounded-full ${
                marker.severity === 'critical' ? 'bg-red-500' :
                marker.severity === 'high' ? 'bg-orange-500' :
                marker.severity === 'medium' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`} />
              <div className={`absolute inset-0 rounded-full ${
                marker.severity === 'critical' ? 'bg-red-500/30' :
                marker.severity === 'high' ? 'bg-orange-500/30' :
                marker.severity === 'medium' ? 'bg-yellow-500/30' :
                'bg-blue-500/30'
              } animate-ping`} />
            </div>
          ))}
        </div>

        {/* Threat Feed */}
        <div className="flex-1 bg-slate-800/30 rounded-xl border border-slate-700/30 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white">Live Threat Feed</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>

          <div className="space-y-2 relative">
            {[
              { source: 'darkmarket.onion', type: 'Credentials', severity: 'CRIT', color: 'red' },
              { source: 'forum.deep', type: 'Data Breach', severity: 'HIGH', color: 'orange' },
              { source: 'market.tor', type: 'CC Dump', severity: 'MED', color: 'yellow' },
              { source: 'paste.dark', type: 'API Keys', severity: 'CRIT', color: 'red' },
              { source: 'chan.onion', type: 'Exploit', severity: 'HIGH', color: 'orange' },
            ].map((threat, i) => (
              <div
                key={i}
                className="threat-item flex items-center justify-between p-2 bg-slate-900/50 border border-slate-700/30 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-3 h-3 text-${threat.color}-400`} />
                  <div>
                    <div className="text-[10px] font-mono text-white">{threat.source}</div>
                    <div className="text-[9px] text-gray-500">{threat.type}</div>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded bg-${threat.color}-500/20 text-${threat.color}-400 border border-${threat.color}-500/30`}>
                  {threat.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-purple-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-pink-500/10 to-transparent blur-3xl pointer-events-none" />
    </div>
  );
};

export default DarkWebMonitorHomeVisual;
