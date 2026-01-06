
import React from 'react';
import { FileCheck, Shield, FileText, Download } from 'lucide-react';

const Compliance: React.FC = () => {
  const frameworks = [
    { name: 'SOC2 Type II', status: 'Compliant', score: 100, color: 'text-emerald-500' },
    { name: 'GDPR Privacy', status: 'Audit Mode', score: 85, color: 'text-blue-500' },
    { name: 'PCI-DSS v4.0', status: 'Review Needed', score: 92, color: 'text-amber-500' },
    { name: 'HIPAA Shield', status: 'Compliant', score: 100, color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-4 gap-6">
        {frameworks.map((f, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-white/10 text-center">
            <div className={`text-4xl font-black mb-2 ${f.color}`}>{f.score}%</div>
            <div className="text-[10px] uppercase font-black tracking-tighter mb-4">{f.name}</div>
            <div className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-white/5 ${f.color} border border-white/5`}>
              {f.status}
            </div>
          </div>
        ))}
      </div>

      <div className="glass p-8 rounded-[2.5rem] border border-white/10">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-8 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-purple-500" /> Certification Evidence Locker
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10"><FileText className="w-5 h-5 text-purple-500" /></div>
                <div>
                  <div className="text-sm font-bold">Annual Security Audit Log Q{i} 2026</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-widest">Signed & Verified by Maula Trust-Engine</div>
                </div>
              </div>
              <Download className="w-5 h-5 text-white/20 hover:text-white transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Compliance;
