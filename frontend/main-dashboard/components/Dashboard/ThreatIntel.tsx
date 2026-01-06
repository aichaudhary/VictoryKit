
import React from 'react';
import { Eye, Radar, Target, Radio } from 'lucide-react';

const ThreatIntel: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="glass p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <Radar className="w-48 h-48 animate-spin-slow" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-8 flex items-center gap-2">
          <Radio className="w-4 h-4 text-red-500 animate-pulse" /> Dark Web Pulse Monitoring
        </h3>
        <div className="grid grid-cols-2 gap-12 relative z-10">
           <div>
              <div className="text-5xl font-black text-red-500 mb-2">CRITICAL</div>
              <div className="text-sm font-bold uppercase tracking-widest text-white/60">Emerging Zero-Day Vector</div>
              <p className="mt-4 text-xs text-white/40 leading-relaxed">Maula Neural Nodes have detected signature patterns matching a new polymorphic ransomware variant circulating in private encrypted channels. Auto-blocking signatures deployed.</p>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                <Target className="w-5 h-5 text-amber-500 mb-2" />
                <div className="text-xl font-black">12.4k</div>
                <div className="text-[10px] text-white/30 uppercase font-bold">Targeted Assets</div>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                <Eye className="w-5 h-5 text-blue-500 mb-2" />
                <div className="text-xl font-black">Real-time</div>
                <div className="text-[10px] text-white/30 uppercase font-bold">Intel Latency</div>
              </div>
           </div>
        </div>
      </div>

      <div className="glass p-8 rounded-[2.5rem] border border-white/10">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6">Recent Tactical Alerts</h3>
        <div className="space-y-3">
          {[
            { tag: 'INTEL', title: 'New Cobalt Strike Teamserver Found', ip: '185.22.4.12' },
            { tag: 'LEAK', title: 'Potential Corporate Credential Dump', ip: 'Forum: Breached' },
            { tag: 'BOTNET', title: 'Mirai Variant Expansion Phase 2', ip: 'Global Scan' },
          ].map((alert, i) => (
            <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex gap-4 items-center">
                <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-black rounded-md">{alert.tag}</span>
                <span className="text-xs font-bold">{alert.title}</span>
              </div>
              <span className="text-[10px] font-mono text-white/30">{alert.ip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThreatIntel;
