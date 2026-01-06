
import React from 'react';
import { Cpu, Server, Database, Globe2 } from 'lucide-react';

const CloudInfra: React.FC = () => {
  const regions = [
    { name: 'US East (Virginia)', provider: 'AWS', status: 'Healthy', latency: '22ms' },
    { name: 'EU West (Dublin)', provider: 'GCP', status: 'Healthy', latency: '85ms' },
    { name: 'Asia South (Mumbai)', provider: 'Azure', status: 'Optimal', latency: '142ms' },
    { name: 'SA East (São Paulo)', provider: 'AWS', status: 'Congested', latency: '210ms' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 glass p-8 rounded-[2.5rem] border border-white/10">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-8">Resource Consumption</h3>
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-purple-500/10"><Cpu className="w-6 h-6 text-purple-500" /></div>
              <div className="flex-1">
                <div className="text-xs font-bold uppercase mb-1">Compute Load</div>
                <div className="text-2xl font-black">64.2%</div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-2xl bg-blue-500/10"><Database className="w-6 h-6 text-blue-500" /></div>
              <div className="flex-1">
                <div className="text-xs font-bold uppercase mb-1">Vector Storage</div>
                <div className="text-2xl font-black">12.8 TB</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-8 glass p-8 rounded-[2.5rem] border border-white/10">
           <div className="flex justify-between items-center mb-8">
             <h3 className="text-xs font-black uppercase tracking-widest text-white/30">Regional Performance</h3>
             <Globe2 className="w-5 h-5 text-white/10" />
           </div>
           <div className="space-y-3">
             {regions.map((r, i) => (
               <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                 <div className="flex items-center gap-4">
                   <Server className={`w-4 h-4 ${r.status === 'Healthy' ? 'text-emerald-500' : 'text-amber-500'}`} />
                   <div>
                     <div className="text-xs font-bold">{r.name}</div>
                     <div className="text-[9px] text-white/30 font-black uppercase">{r.provider} Infrastructure</div>
                   </div>
                 </div>
                 <div className="flex gap-8 items-center">
                    <div className="text-right">
                      <div className="text-xs font-bold">{r.latency}</div>
                      <div className="text-[8px] text-white/30 uppercase">Latency</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      r.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {r.status}
                    </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CloudInfra;
