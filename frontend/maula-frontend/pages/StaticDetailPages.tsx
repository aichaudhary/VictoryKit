
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import { ArrowLeft, Shield, Target, Users, Zap, Mail, Globe, Lock, Code } from 'lucide-react';

const BaseStaticPage: React.FC<{ 
  title: string, 
  subtitle: string, 
  colorClass: string, 
  icon: React.ReactNode,
  children?: React.ReactNode 
}> = ({ title, subtitle, colorClass, icon, children }) => {
  const { setView } = useScroll();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.from(heroRef.current?.children || [], {
      y: 30, opacity: 0, stagger: 0.1, duration: 0.8
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#02000a] text-white font-sans p-6 md:p-24 selection:bg-purple-500/30">
      <button onClick={() => setView('home')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors mb-24">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
      </button>
      
      <div className="max-w-4xl mx-auto">
        <div ref={heroRef} className="space-y-8 mb-24">
          <div className={`inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-${colorClass}/20`}>
            {icon}
            <span className={`text-[10px] font-black tracking-[0.4em] uppercase text-${colorClass}`}>MAULA AI Platform</span>
          </div>
          <h1 className={`text-7xl font-black tracking-tighter uppercase leading-tight`}>
            {title}
          </h1>
          <p className="text-xl text-white/50 leading-relaxed max-w-2xl">{subtitle}</p>
        </div>
        
        <div className="glass p-12 md:p-20 rounded-[4rem] border border-white/5 leading-relaxed text-white/80 space-y-12">
           {children || <div className="h-64 flex items-center justify-center italic text-white/20">Detailed documentation coming soon in the v3.0 release.</div>}
        </div>
      </div>
    </div>
  );
};

export const AboutUs = () => (
  <BaseStaticPage title="About Our Mission" subtitle="Leading the charge in autonomous, decentralized cybersecurity infrastructure." colorClass="purple-500" icon={<Shield className="w-4 h-4 text-purple-500" />}>
    <p className="text-xl">Founded in 2024, Maula AI was born from the realization that human SOC analysts cannot keep pace with AI-powered adversaries. We built the world's first fully autonomous defense lattice.</p>
    <div className="grid grid-cols-2 gap-8 pt-8">
      <div className="glass p-8 rounded-3xl border border-white/5"><h4 className="font-bold text-white mb-2">Our Vision</h4><p className="text-sm opacity-60">A internet where security is invisible, proactive, and absolute.</p></div>
      <div className="glass p-8 rounded-3xl border border-white/5"><h4 className="font-bold text-white mb-2">Our Team</h4><p className="text-sm opacity-60">Cryptography experts and neural network engineers from across the globe.</p></div>
    </div>
  </BaseStaticPage>
);

export const Careers = () => (
  <BaseStaticPage title="Join the Force" subtitle="Help us build the next generation of autonomous security." colorClass="emerald-500" icon={<Users className="w-4 h-4 text-emerald-500" />}>
    <h3 className="text-3xl font-bold mb-8">Open Roles</h3>
    <ul className="space-y-4">
      {['Senior Neural Engineer', 'Lattice Architect', 'Offensive AI Researcher', 'Technical Product Manager'].map((role, i) => (
        <li key={i} className="flex justify-between items-center p-6 glass rounded-2xl border border-white/5 hover:bg-white/5 cursor-pointer transition-all">
          <span className="font-bold">{role}</span>
          <Zap className="w-4 h-4 text-emerald-500" />
        </li>
      ))}
    </ul>
  </BaseStaticPage>
);

export const Contact = () => (
  <BaseStaticPage title="Connect with Us" subtitle="Neural interface support and strategic partnership inquiries." colorClass="blue-500" icon={<Mail className="w-4 h-4 text-blue-500" />}>
    <div className="space-y-8">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Name" className="bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-blue-500" />
          <input type="email" placeholder="Email" className="bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-blue-500" />
       </div>
       <textarea placeholder="Message..." className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-blue-500" />
       <button className="bg-blue-500 text-white px-12 py-4 rounded-xl font-bold uppercase tracking-widest hover:brightness-110 transition-all">Send Transmission</button>
    </div>
  </BaseStaticPage>
);

export const GlobalShieldDetail = () => (
  <BaseStaticPage title="Global Shield" subtitle="The overarching umbrella covering every Maula module." colorClass="red-500" icon={<Globe className="w-4 h-4 text-red-500" />}>
    <p>Global Shield is our distributed ledger technology that ensures every tool in your ecosystem communicates securely and shares threat intelligence in real-time.</p>
  </BaseStaticPage>
);

export const LegalPage: React.FC<{title: string}> = ({ title }) => (
  <BaseStaticPage title={title} subtitle="Standard regulatory and legal documentation." colorClass="gray-400" icon={<Lock className="w-4 h-4 text-gray-400" />}>
    <p>Last updated: January 2, 2026. This document outlines our commitment to data integrity and user privacy within the Maula AI ecosystem.</p>
  </BaseStaticPage>
);
