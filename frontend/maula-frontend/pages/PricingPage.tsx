
import React from 'react';
import { useScroll } from '../context/ScrollContext';
import { ArrowLeft, Check, Zap } from 'lucide-react';

const PricingPage: React.FC = () => {
  const { setView } = useScroll();

  return (
    <div className="min-h-screen bg-[#02000a] text-white font-sans p-6 md:p-24">
      <button onClick={() => setView('home')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors mb-24">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
      </button>

      <div className="text-center space-y-8 mb-24">
        <h1 className="text-7xl font-black tracking-tighter uppercase">Transparent <span className="text-purple-500">Pricing</span></h1>
        <p className="text-white/40 text-xl max-w-2xl mx-auto leading-relaxed">Choose the defense tier that matches your scale. No hidden fees, just pure protection.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {[
          { name: "Starter", price: "$499", color: "blue-500", perks: ["5 Core Modules", "Community Docs", "Email Support", "100GB Ingest"] },
          { name: "Enterprise", price: "$2,499", color: "purple-500", perks: ["All 50 Modules", "API Access", "24/7 Shield Support", "5TB Ingest", "Custom AI Forge"], active: true },
          { name: "Custom", price: "Scale", color: "emerald-500", perks: ["Unlimited Nodes", "On-Prem Deployment", "White Glove Onboarding", "Dedicated Analyst"] }
        ].map((tier, i) => (
          <div key={i} className={`glass p-12 rounded-[4rem] border transition-all ${tier.active ? 'border-purple-500 scale-105 shadow-2xl shadow-purple-500/10' : 'border-white/5 hover:border-white/20'}`}>
            <h3 className="text-3xl font-black uppercase tracking-widest mb-2">{tier.name}</h3>
            <div className="flex items-baseline gap-2 mb-10">
               <span className={`text-6xl font-black text-${tier.color}`}>{tier.price}</span>
               {tier.price !== 'Scale' && <span className="text-white/30 font-bold">/mo</span>}
            </div>
            <ul className="space-y-6 mb-12">
              {tier.perks.map((p, j) => (
                <li key={j} className="flex items-center gap-4 text-white/60">
                  <Check className={`w-5 h-5 text-${tier.color}`} /> {p}
                </li>
              ))}
            </ul>
            <button className={`w-full py-6 rounded-2xl font-black uppercase text-sm tracking-[0.2em] transition-all ${tier.active ? 'bg-purple-500 hover:brightness-125' : 'bg-white/5 hover:bg-white/10'}`}>
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;
