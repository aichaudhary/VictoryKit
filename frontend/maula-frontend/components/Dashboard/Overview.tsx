
import React from 'react';
import { Shield, Zap, Globe, AlertTriangle, ArrowUpRight } from 'lucide-react';

const Overview: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: 'Active Shields', value: '50/50', icon: Shield, color: 'text-purple-500' },
          { label: 'Neural Throughput', value: '1.2 TB/s', icon: Zap, color: 'text-amber-500' },
          { label: 'Global Nodes', value: '124', icon: Globe, color: 'text-blue-500' },
          { label: 'Threats Blocked', value: '14.2M', icon: AlertTriangle, color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
            <div className="flex justify-between items-start mb-4">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <div className="text-[10px] font-black text-emerald-500 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3" /> 12%
              </div>
            </div>
            <div className="text-2xl font-black">{stat.value}</div>
            <div className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 glass rounded-[2rem] p-8 border border-white/10 h-80 flex flex-col">
           <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6">Global Threat Distribution</h3>
           <div className="flex-1 bg-white/5 rounded-2xl relative overflow-hidden flex items-center justify-center border border-white/5">
              <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
              <div className="text-white/20 text-xs font-mono uppercase">Map Interface Initializing...</div>
              {/* Mock data points */}
              {[30, 60, 20, 80, 45].map((pos, i) => (
                <div key={i} className="absolute w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]" style={{ top: `${pos}%`, left: `${pos * 1.2}%` }} />
              ))}
           </div>
        </div>
        <div className="glass rounded-[2rem] p-8 border border-white/10 h-80">
           <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6">Recent Vectors</h3>
           <div className="space-y-4">
              {['SQL Injection', 'Brute Force', 'DDoS Sync', 'XSS Attempt'].map((v, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-xs font-bold">{v}</span>
                  <span className="text-[10px] font-mono text-white/30">ID: #882{i}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
