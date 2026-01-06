
import React from 'react';
import { Lock, ShieldCheck, Fingerprint, Terminal } from 'lucide-react';

const SecurityPosture: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">Security Posture: EXCELLENT</h2>
          <p className="text-white/40 text-sm">Last audited: 12 minutes ago by Maula AI</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="glass p-8 rounded-[2rem] border border-white/10 space-y-6">
           <h3 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2">
             <Lock className="w-4 h-4 text-purple-500" /> Protocol Health
           </h3>
           <div className="space-y-4">
              {[
                { name: 'TLS 1.3 Encryption', status: 'Optimal', val: 100 },
                { name: 'HSTS Policy', status: 'Enabled', val: 100 },
                { name: 'DNSSEC Validation', status: 'Warning', val: 75 },
              ].map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-bold">{p.name}</span>
                    <span className={p.val === 100 ? 'text-emerald-500' : 'text-amber-500'}>{p.status}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${p.val}%` }} />
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="glass p-8 rounded-[2rem] border border-white/10">
           <h3 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-6">
             <Terminal className="w-4 h-4 text-emerald-500" /> Active Firewalls
           </h3>
           <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                  <Fingerprint className="w-5 h-5 text-white/20 group-hover:text-emerald-500 transition-colors" />
                  <div className="flex-1">
                    <div className="text-xs font-bold uppercase tracking-widest">WAF-NODE-0{i}</div>
                    <div className="text-[10px] text-white/30">Filtering us-east-1 traffic</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPosture;
