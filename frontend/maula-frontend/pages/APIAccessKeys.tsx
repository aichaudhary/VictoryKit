
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import { ArrowLeft, Key, Plus, Trash2, Shield, Search, RefreshCw, Copy, Check, Terminal, Activity, Zap } from 'lucide-react';

const APIAccessKeys: React.FC = () => {
  const { setView } = useScroll();
  const [copied, setCopied] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<{id: number, msg: string, time: string, status: string}[]>([]);
  
  // Real-time State: Keys
  const [keys, setKeys] = useState([
    { id: '1', name: 'Production Edge Mesh', key: 'maula_pk_live_8829...x9f2', status: 'Active', created: '2025-12-01' },
    { id: '2', name: 'Legacy SIEM Connector', key: 'maula_pk_live_1224...z3a8', status: 'Active', created: '2025-11-15' },
  ]);

  // Simulate Live Traffic Logs
  useEffect(() => {
    const endpoints = ['/v1/fraud/check', '/v1/auth/verify', '/v1/threat/sync', '/v1/node/pulse'];
    const interval = setInterval(() => {
      const newLog = {
        id: Date.now(),
        msg: `REQ [${endpoints[Math.floor(Math.random() * endpoints.length)]}]`,
        time: new Date().toLocaleTimeString(),
        status: Math.random() > 0.1 ? '200 OK' : '403 Forbidden'
      };
      setLogs(prev => [newLog, ...prev].slice(0, 15));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    gsap.from(containerRef.current?.children || [], {
      y: 20, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out'
    });
  }, []);

  const handleGenerate = () => {
    const id = (keys.length + 1).toString();
    const newKey = {
      id,
      name: `New Integration Node ${id}`,
      key: `maula_pk_test_${Math.random().toString(36).substring(7)}...${Math.random().toString(36).substring(7)}`,
      status: 'Active',
      created: new Date().toISOString().split('T')[0]
    };
    setKeys([newKey, ...keys]);
  };

  const handleRevoke = (id: string) => {
    setKeys(keys.filter(k => k.id !== id));
  };

  const handleCopy = (id: string, fullKey: string) => {
    navigator.clipboard.writeText(fullKey);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#02001a] text-white font-sans p-12 lg:p-24 selection:bg-blue-500/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,_rgba(59,130,246,0.1),_transparent_60%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <button onClick={() => setView('dashboard')} className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors mb-10 sm:mb-16 md:mb-20">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Config
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left: Key Management */}
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-blue-500/20 backdrop-blur-3xl">
                <Key className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-blue-500">Node Authentication</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none uppercase">API <span className="text-blue-500">KEYS</span></h1>
              <p className="text-lg text-white/40 max-w-xl font-medium">Manage and rotate cryptographic tokens for external service calls into the Maula AI lattice.</p>
            </div>

            <div className="flex gap-4">
              <button onClick={handleGenerate} className="flex items-center gap-4 bg-blue-600 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:brightness-110 shadow-2xl shadow-blue-950/40 transition-all">
                <Plus className="w-4 h-4" /> New Lattice Key
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {keys.map((k) => (
                <div key={k.id} className="glass p-8 rounded-[2rem] border border-white/5 hover:border-blue-500/20 transition-all group flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-blue-500"><Terminal className="w-6 h-6" /></div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight">{k.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{k.status} • {k.created}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-xl px-5 py-3 w-full md:w-auto">
                    <code className="text-xs font-mono text-blue-400/80 truncate max-w-[150px]">{k.key}</code>
                    <button onClick={() => handleCopy(k.id, k.key)} className="text-white/40 hover:text-white transition-colors">
                      {copied === k.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <button onClick={() => handleRevoke(k.id)} className="p-3 glass rounded-xl border border-white/5 hover:bg-red-500/10 transition-all text-white/40 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Live Connection Stream */}
          <div className="space-y-8">
            <div className="glass p-10 rounded-[3rem] border border-white/5 h-full flex flex-col">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                    <Activity className="w-3 h-3 text-blue-500" /> Live Connection Stream
                  </h3>
                  <span className="text-[9px] font-mono text-emerald-500">STABLE_TUNNEL</span>
               </div>
               <div className="flex-1 space-y-3 font-mono text-[10px] overflow-hidden">
                  {logs.map(log => (
                    <div key={log.id} className="flex justify-between items-center animate-in fade-in slide-in-from-left-2 duration-300">
                      <span className="text-white/20">[{log.time}]</span>
                      <span className="text-blue-400 font-bold">{log.msg}</span>
                      <span className={log.status.includes('200') ? 'text-emerald-500' : 'text-red-500'}>{log.status}</span>
                    </div>
                  ))}
                  {logs.length === 0 && <div className="text-white/10 italic">Initializing handshake...</div>}
               </div>
               <div className="mt-10 pt-8 border-t border-white/5 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">Active Hits (1m)</span>
                    <span className="text-lg font-black text-blue-500">142</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[60%] animate-pulse" />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Dynamic Telemetry Graph Simulation */}
        <div className="mt-24 pt-24 border-t border-white/5">
           <div className="flex justify-between items-end mb-6 sm:mb-8 md:mb-12">
              <h4 className="text-xs font-black uppercase tracking-[0.4em] text-white/20">Global Interface Latency</h4>
              <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest">
                 <span className="text-blue-500">Prod Cluster</span>
                 <span className="text-white/20">Dev Enclave</span>
              </div>
           </div>
           <div className="h-40 flex items-end gap-2 px-4">
              {[...Array(40)].map((_, i) => (
                <div key={i} className="flex-1 bg-blue-500/10 rounded-t-sm relative group overflow-hidden h-full">
                  <div 
                    className="absolute bottom-0 left-0 w-full bg-blue-600 transition-all duration-1000" 
                    style={{ height: `${20 + Math.random() * 80}%` }} 
                  />
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default APIAccessKeys;
