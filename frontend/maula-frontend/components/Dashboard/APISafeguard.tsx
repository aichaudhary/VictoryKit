
import React from 'react';
import { Code, Wifi, ShieldAlert, BarChart } from 'lucide-react';

const APISafeguard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex gap-6 h-64">
        <div className="flex-1 glass p-8 rounded-[2rem] border border-white/10 flex flex-col justify-center">
           <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-4">API Request Rate</h3>
           <div className="text-5xl font-black">42.5k <span className="text-lg text-white/20">/min</span></div>
           <div className="text-[10px] text-emerald-500 font-bold mt-2 uppercase tracking-widest">Global Sync Active</div>
        </div>
        <div className="w-1/3 glass p-8 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center text-center">
           <div className="p-4 rounded-full bg-red-500/10 mb-4"><ShieldAlert className="w-8 h-8 text-red-500" /></div>
           <div className="text-2xl font-black">48</div>
           <div className="text-[10px] text-white/30 uppercase font-bold">Blocked Anomalies</div>
        </div>
      </div>

      <div className="glass p-8 rounded-[2rem] border border-white/10">
        <h3 className="font-bold text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
          <Code className="w-4 h-4 text-purple-500" /> Secured Endpoints
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {['/v1/auth/verify', '/v1/neural/sync', '/v1/billing/ledger', '/v1/identity/mfa'].map((endpoint, i) => (
            <div key={i} className="flex justify-between items-center p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-4">
                <Wifi className="w-4 h-4 text-white/20 group-hover:text-purple-500" />
                <span className="text-xs font-mono font-bold">{endpoint}</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="text-right">
                    <div className="text-[10px] font-bold text-emerald-500">200 OK</div>
                    <div className="text-[8px] text-white/30 font-mono">14ms</div>
                 </div>
                 <BarChart className="w-4 h-4 text-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default APISafeguard;
