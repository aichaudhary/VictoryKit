
import React from 'react';
import { Users, Key, Smartphone, ShieldAlert } from 'lucide-react';

const IdentityControl: React.FC = () => {
  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 fade-in duration-500">
      <div className="grid grid-cols-3 gap-6">
        <div className="glass p-8 rounded-[2rem] border border-white/10">
          <Users className="w-8 h-8 text-blue-500 mb-4" />
          <div className="text-3xl font-black">1,402</div>
          <div className="text-[10px] uppercase font-bold text-white/30">Managed Identities</div>
        </div>
        <div className="glass p-8 rounded-[2rem] border border-white/10">
          <Smartphone className="w-8 h-8 text-purple-500 mb-4" />
          <div className="text-3xl font-black">98.2%</div>
          <div className="text-[10px] uppercase font-bold text-white/30">MFA Enrollment</div>
        </div>
        <div className="glass p-8 rounded-[2rem] border border-white/10">
          <Key className="w-8 h-8 text-amber-500 mb-4" />
          <div className="text-3xl font-black">420</div>
          <div className="text-[10px] uppercase font-bold text-white/30">Active API Keys</div>
        </div>
      </div>

      <div className="glass rounded-[2rem] p-8 border border-white/10">
        <h3 className="font-bold text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-500" /> Active High-Risk Sessions
        </h3>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="flex justify-between items-center p-6 rounded-2xl bg-red-500/5 border border-red-500/10">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <div className="text-sm font-bold">Unknown Device - Tokyo, JP</div>
                  <div className="text-[10px] text-white/30 font-mono">Session ID: 0x9f22...00e</div>
                </div>
              </div>
              <button className="px-6 py-2 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all">
                TERMINATE
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IdentityControl;
