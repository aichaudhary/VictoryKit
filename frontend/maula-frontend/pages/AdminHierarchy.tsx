
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import { ArrowLeft, User, ShieldCheck, Users, Shield, ArrowUpRight, Lock, Eye, Settings, UserPlus, MoreVertical, Wifi } from 'lucide-react';

const AdminHierarchy: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const [sessions, setSessions] = useState<{id: number, user: string, ip: string, role: string}[]>([]);

  // Real-time State: Staff
  const [staff, setStaff] = useState([
    { id: 1, name: 'Alice Node', role: 'Lattice SuperAdmin', active: true, clearance: 'TOP_SECRET' },
    { id: 2, name: 'Bob Sync', role: 'Security Analyst', active: true, clearance: 'INTERNAL' },
    { id: 3, name: 'Charlie Audit', role: 'Compliance Auditor', active: false, clearance: 'READ_ONLY' },
  ]);

  // Simulate Live Sessions
  useEffect(() => {
    const firstNames = ['Dave', 'Eve', 'Frank', 'Grace', 'Heidi'];
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        const newSession = {
          id: Date.now(),
          user: `${firstNames[Math.floor(Math.random() * firstNames.length)]}_${Math.floor(Math.random() * 999)}`,
          ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          role: Math.random() > 0.7 ? 'SuperAdmin' : 'Analyst'
        };
        setSessions(prev => [newSession, ...prev].slice(0, 5));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    gsap.from(containerRef.current?.children || [], {
      y: 20, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out'
    });
  }, []);

  const handleAddStaff = () => {
    const name = prompt("Enter Operator Name:");
    if (name) {
      setStaff([...staff, { id: Date.now(), name, role: 'Security Analyst', active: true, clearance: 'INTERNAL' }]);
    }
  };

  const handleRoleChange = (id: number) => {
    setStaff(staff.map(s => {
      if (s.id === id) {
        return { ...s, role: s.role === 'Security Analyst' ? 'Lattice SuperAdmin' : 'Security Analyst' };
      }
      return s;
    }));
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#020a02] text-white font-sans p-12 lg:p-24 selection:bg-emerald-500/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,_rgba(16,185,129,0.1),_transparent_60%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <button onClick={() => setView('dashboard')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors mb-10 sm:mb-16 md:mb-20">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Config
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-emerald-500/20 backdrop-blur-3xl">
                <Users className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-emerald-500">Personnel Management</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none uppercase">ADMIN <span className="text-emerald-500">HIERARCHY</span></h1>
              <p className="text-lg text-white/40 max-w-xl font-medium">Orchestrate organizational access and clearance levels. Ensure least-privilege enforcement across the entire lattice.</p>
            </div>

            <button onClick={handleAddStaff} className="flex items-center gap-4 bg-emerald-600 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-2xl shadow-emerald-950/40 transition-all">
              <UserPlus className="w-4 h-4" /> Invite Operator
            </button>

            <div className="grid grid-cols-1 gap-4">
               {staff.map(member => (
                 <div key={member.id} className="glass p-8 rounded-[2rem] border border-white/5 hover:border-emerald-500/20 transition-all group flex items-center justify-between">
                    <div className="flex items-center gap-6">
                       <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black ${member.role.includes('Super') ? 'bg-emerald-500 text-black' : 'bg-white/5 text-emerald-500'}`}>
                          {member.name.charAt(0)}
                       </div>
                       <div>
                          <div className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                            {member.name}
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[8px] tracking-widest">{member.clearance}</span>
                          </div>
                          <div className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">{member.role}</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <button onClick={() => handleRoleChange(member.id)} className="px-6 py-2 glass rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Mutate Role</button>
                       <button className="p-3 text-white/20 hover:text-white transition-colors"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Right: Active Sessions Monitor */}
          <div className="space-y-8">
            <div className="glass p-10 rounded-[3rem] border border-white/5 h-full flex flex-col">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                    <Wifi className="w-3 h-3 text-emerald-500" /> Active Lattice Sessions
                  </h3>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
               </div>
               <div className="flex-1 space-y-4">
                  {sessions.map(session => (
                    <div key={session.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 animate-in fade-in zoom-in-95 duration-500">
                       <div className="flex justify-between items-start mb-1">
                          <span className="text-[11px] font-black text-white/80">{session.user}</span>
                          <span className="text-[8px] font-mono text-white/20">{session.ip}</span>
                       </div>
                       <div className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60">{session.role} LEVEL ACCESS</div>
                    </div>
                  ))}
                  {sessions.length === 0 && <div className="text-white/10 italic text-xs">Awaiting orbital connections...</div>}
               </div>
               <button className="mt-8 py-3 w-full border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-emerald-500 transition-colors">View Access Matrix</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHierarchy;
