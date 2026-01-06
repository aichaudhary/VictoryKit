
import React from 'react';
import { Cog, Bell, Key, Database, Save } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="glass rounded-[2rem] border border-white/10 overflow-hidden">
        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
           <h3 className="font-bold text-sm uppercase tracking-widest flex items-center gap-3">
             <Cog className="w-5 h-5 text-purple-500" /> Neural Node Configuration
           </h3>
           <button className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-purple-50 transition-all">
             <Save className="w-3 h-3" /> Save Changes
           </button>
        </div>
        <div className="p-8 space-y-10">
           <div className="grid grid-cols-2 gap-12">
              <div className="space-y-4">
                 <div className="text-xs font-bold uppercase tracking-widest text-white/40">Response Aggression</div>
                 <input type="range" className="w-full accent-purple-500 h-1 bg-white/10 rounded-full" />
                 <div className="flex justify-between text-[10px] font-mono text-white/20">
                    <span>PASSIVE</span>
                    <span>ADAPTIVE</span>
                    <span>COMBATIVE</span>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="text-xs font-bold uppercase tracking-widest text-white/40">Data Retention Proxy</div>
                 <select className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500">
                    <option>Standard (30 Days)</option>
                    <option>Extended (90 Days)</option>
                    <option>Infinite Ledger</option>
                 </select>
              </div>
           </div>

           <div className="space-y-6">
              <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5">
                 <div className="flex gap-4">
                    <Bell className="w-5 h-5 text-blue-500" />
                    <div>
                       <div className="text-sm font-bold">Threat Notification Webhooks</div>
                       <div className="text-[10px] text-white/30">Relay alerts to Slack, Discord, or custom URLs</div>
                    </div>
                 </div>
                 <div className="w-12 h-6 bg-purple-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                 </div>
              </div>
              <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5">
                 <div className="flex gap-4">
                    <Key className="w-5 h-5 text-amber-500" />
                    <div>
                       <div className="text-sm font-bold">Automated Key Rotation</div>
                       <div className="text-[10px] text-white/30">Cycle master security keys every 24 hours</div>
                    </div>
                 </div>
                 <div className="w-12 h-6 bg-white/10 rounded-full relative">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white/20 rounded-full" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
