
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import { ArrowLeft, Database, Globe, Zap, Shield, Server, CheckCircle2, AlertTriangle, MapPin, RefreshCw, Layers } from 'lucide-react';

const SovereigntyNodes: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const [syncProgress, setSyncProgress] = useState(99.1);
  const [isSyncing, setIsSyncing] = useState(false);

  // Real-time State: Active Nodes
  const [nodes, setNodes] = useState([
    { id: 1, region: 'US-East-1', location: 'Virginia, USA', status: 'Optimal', data: '4.2 PB', latency: '12ms', active: true },
    { id: 2, region: 'EU-Central-1', location: 'Frankfurt, GER', status: 'Optimal', data: '2.8 PB', latency: '24ms', active: true },
    { id: 3, region: 'AP-South-1', location: 'Mumbai, IND', status: 'Standby', data: '1.4 PB', latency: '42ms', active: false },
  ]);

  const [locks, setLocks] = useState({
    gdpr: true,
    fedramp: false,
    hipaa: true
  });

  // Sync Progress Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) return 99.1;
        return Number((prev + 0.01).toFixed(2));
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    gsap.from(containerRef.current?.children || [], {
      y: 20, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out'
    });
  }, []);

  const toggleNode = (id: number) => {
    setNodes(nodes.map(n => {
      if (n.id === id) {
        return { ...n, active: !n.active, status: !n.active ? 'Syncing' : 'Standby' };
      }
      return n;
    }));
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 3000);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0d0a02] text-white font-sans p-12 lg:p-24 selection:bg-amber-500/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,_rgba(245,158,11,0.08),_transparent_60%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <button onClick={() => setView('dashboard')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors mb-20">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Config
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-20">
          {/* Header & Stats */}
          <div className="lg:col-span-3 space-y-6">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-amber-500/20 backdrop-blur-3xl">
              <Globe className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-amber-500">Global Data Integrity Portal</span>
            </div>
            <h1 className="text-7xl font-black tracking-tighter leading-none uppercase">SOVEREIGNTY <span className="text-amber-500">NODES</span></h1>
            <p className="text-lg text-white/40 max-w-2xl font-medium">Coordinate regional data residency and physical sovereignty laws. Deploy neural edge enclaves to satisfy specific geographic compliance requirements.</p>
          </div>
          <div className="glass p-10 rounded-[3rem] border border-amber-500/20 flex flex-col justify-center">
             <div className="text-4xl font-black tracking-tighter text-amber-500">{syncProgress}%</div>
             <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mt-2">Lattice Integrity Sync</div>
             <div className="mt-6 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${syncProgress}%` }} />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
           {nodes.map((node) => (
             <div key={node.id} className={`glass p-10 rounded-[3rem] border transition-all group flex flex-col h-full ${node.active ? 'border-amber-500/30' : 'border-white/5 opacity-60'}`}>
                <div className="flex justify-between items-start mb-12">
                   <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center ${node.active ? 'text-amber-500' : 'text-white/20'}`}><MapPin className="w-8 h-8" /></div>
                   <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Status</div>
                      <div className={`text-xs font-black uppercase tracking-widest ${node.status === 'Optimal' ? 'text-emerald-500' : 'text-amber-500'}`}>{node.status}</div>
                   </div>
                </div>
                <div className="space-y-6 flex-1">
                   <h3 className="text-3xl font-black uppercase tracking-tight leading-none">{node.region}</h3>
                   <div className="text-white/40 text-xs font-bold uppercase tracking-widest">{node.location}</div>
                   <div className="grid grid-cols-2 gap-4 pt-6">
                      <div>
                         <div className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 mb-1">Stored Volume</div>
                         <div className="text-sm font-mono font-bold text-amber-500">{node.data}</div>
                      </div>
                      <div>
                         <div className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 mb-1">Global Latency</div>
                         <div className="text-sm font-mono font-bold text-white/60">{node.latency}</div>
                      </div>
                   </div>
                </div>
                <button 
                  onClick={() => toggleNode(node.id)}
                  className={`mt-10 py-4 w-full rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${node.active ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-amber-500 text-black hover:brightness-110'}`}
                >
                  {node.active ? 'Decommission Node' : 'Deploy Global Node'}
                </button>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <div className="glass p-12 rounded-[4rem] border border-white/5">
              <div className="flex items-center gap-3 mb-10">
                <Layers className="w-5 h-5 text-amber-500" />
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-white/40">Regional Compliance Locks</h4>
              </div>
              <div className="space-y-4">
                 {[
                   { id: 'gdpr', label: 'GDPR Enclave Lock', desc: 'Restricts personal data egress to EU borders.' },
                   { id: 'fedramp', label: 'FedRAMP Sovereignty', desc: 'Enforces US Govt security baseline.' },
                   { id: 'hipaa', label: 'HIPAA Health Vault', desc: 'Isolates medical records on physical HSMs.' }
                 ].map((lock) => (
                   <div key={lock.id} className="flex items-center justify-between p-8 glass rounded-[2.5rem] border border-white/5 hover:bg-white/[0.02] transition-all">
                      <div className="space-y-1">
                         <div className="text-sm font-black uppercase tracking-tight">{lock.label}</div>
                         <div className="text-[10px] text-white/30 font-medium">{lock.desc}</div>
                      </div>
                      <button 
                        onClick={() => setLocks(prev => ({ ...prev, [lock.id]: !prev[lock.id as keyof typeof locks] }))}
                        className={`w-12 h-6 rounded-full relative transition-colors ${locks[lock.id as keyof typeof locks] ? 'bg-amber-600' : 'bg-white/10'}`}
                      >
                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${locks[lock.id as keyof typeof locks] ? 'left-7' : 'left-1 opacity-40'}`} />
                      </button>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="glass p-12 rounded-[4rem] border border-white/5 flex flex-col justify-center items-center text-center space-y-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-amber-500/5 blur-3xl" />
              <div className="relative">
                <RefreshCw className={`w-24 h-24 text-amber-500 opacity-20 ${isSyncing ? 'animate-spin' : 'animate-spin-slow'}`} />
                <Shield className="w-10 h-10 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-4 relative z-10">
                 <h4 className="text-3xl font-black uppercase tracking-tighter leading-none">Global Sync Status</h4>
                 <p className="text-white/40 text-sm max-w-sm mx-auto font-medium leading-relaxed">Maula AI core sets are currently synchronizing across 24 global nodes. Consistency is verified at the hardware root level.</p>
              </div>
              <button 
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-12 py-5 bg-amber-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-2xl shadow-amber-950/40 flex items-center gap-4"
              >
                {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                {isSyncing ? 'Synchronizing Lattice...' : 'Force Global Re-Sync'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SovereigntyNodes;
