
import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  Shield, LayoutDashboard, Grid, BarChart3, Receipt, Settings, 
  Terminal, LogOut, Search, MoreHorizontal, Power, Zap, 
  Activity, ArrowUpRight, TrendingUp, Bell, User, Key, Database,
  ShoppingCart, LayoutGrid, CheckCircle2, AlertCircle, RefreshCw,
  Wallet, History, CreditCard, ChevronRight
} from 'lucide-react';
import { useScroll } from '../context/ScrollContext';
import { tools } from '../data/tools';
import { SecurityTool } from '../types';

const Dashboard: React.FC = () => {
  const { setView } = useScroll();
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'fleet' | 'analytics' | 'billing' | 'logs' | 'profile'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Simulated State: Assume tools with ID 1, 3, 5, 12, 27 are already purchased
  const [purchasedIds, setPurchasedIds] = useState<number[]>([1, 3, 5, 12, 27]);
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(contentRef.current, 
      { opacity: 0, y: 15, filter: 'blur(10px)' }, 
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4, ease: 'expo.out' }
    );
  }, [activeTab]);

  const SidebarItem = ({ id, icon, label }: { id: typeof activeTab, icon: React.ReactNode, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group relative overflow-hidden ${activeTab === id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
    >
      {activeTab === id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 shadow-[0_0_15px_#a855f7]" />}
      <span className={`${activeTab === id ? 'text-purple-400' : 'text-white/40 group-hover:text-purple-400'}`}>{icon}</span>
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-[#02000a] text-white overflow-hidden font-sans selection:bg-purple-500/30">
      {/* Interactive Sidebar Navigation */}
      <aside className="w-80 border-r border-white/5 bg-[#040412]/80 backdrop-blur-3xl flex flex-col p-8 z-[100] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-16 cursor-pointer group" onClick={() => setView('home')}>
          <div className="bg-purple-600 p-2 rounded-xl group-hover:scale-110 transition-transform"><Shield className="w-6 h-6" /></div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter uppercase leading-none">MAULA<span className="text-purple-500">.AI</span></span>
            <span className="text-[8px] font-black tracking-[0.4em] uppercase text-white/30">Command Lattice</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2 relative z-10">
          <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 ml-6">Operation</div>
          <SidebarItem id="overview" icon={<LayoutDashboard className="w-5 h-5" />} label="Mission HUD" />
          <SidebarItem id="fleet" icon={<LayoutGrid className="w-5 h-5" />} label="My Active Fleet" />
          <SidebarItem id="marketplace" icon={<ShoppingCart className="w-5 h-5" />} label="Marketplace" />
          
          <div className="h-4" />
          <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 ml-6">Telemetry</div>
          <SidebarItem id="analytics" icon={<BarChart3 className="w-5 h-5" />} label="Neural Density" />
          <SidebarItem id="logs" icon={<Terminal className="w-5 h-5" />} label="Lattice Logs" />
          
          <div className="h-4" />
          <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 ml-6">Admin</div>
          <SidebarItem id="billing" icon={<Wallet className="w-5 h-5" />} label="Ledger" />
          <SidebarItem id="profile" icon={<Settings className="w-5 h-5" />} label="Lattice Config" />
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5 space-y-4 relative z-10">
          <div className="flex items-center gap-4 p-4 glass rounded-2xl border border-white/5 group cursor-pointer hover:bg-white/5 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-black shadow-lg">AD</div>
            <div className="flex-1 overflow-hidden">
               <div className="text-xs font-black truncate uppercase tracking-widest group-hover:text-purple-400 transition-colors">Admin_882</div>
               <div className="text-[8px] text-white/30 truncate flex items-center gap-1">
                 <div className="w-1 h-1 rounded-full bg-emerald-500" /> SECURE_ENCLAVE_READY
               </div>
            </div>
          </div>
          <button onClick={() => setView('home')} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500/40 hover:text-red-500 hover:bg-red-500/5 transition-all">
            <LogOut className="w-5 h-5" /> <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Command Center */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_50%_-20%,_#0d0d1a_0%,_#02000a_100%)]">
        {/* Top Intelligence Bar */}
        <header className="h-24 border-b border-white/5 px-12 flex items-center justify-between glass backdrop-blur-md z-40 relative">
           <div className="flex items-center gap-8">
             <div>
               <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                 {activeTab === 'overview' && 'Lattice Overview'}
                 {activeTab === 'marketplace' && 'Available Modules'}
                 {activeTab === 'fleet' && 'Active Node Fleet'}
                 {activeTab === 'analytics' && 'Neural Telemetry'}
                 {activeTab === 'logs' && 'System Syslogs'}
                 {activeTab === 'billing' && 'Node Ledger'}
                 {activeTab === 'profile' && 'Configuration'}
               </h1>
             </div>
             <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
             <div className="hidden md:flex gap-6 items-center">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Uptime</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">99.999%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Active Latency</span>
                  <span className="text-xs font-mono text-purple-400 font-bold">12ms</span>
                </div>
             </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="relative group hidden lg:block">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-purple-500 transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Search Lattice Modules..." 
                   className="bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-xs font-bold focus:outline-none focus:border-purple-500/50 w-64 transition-all focus:w-80"
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                 />
              </div>
              <div className="relative cursor-pointer hover:scale-110 transition-transform">
                <Bell className="w-5 h-5 text-white/40 hover:text-white transition-colors" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#02000a] animate-pulse" />
              </div>
              <button onClick={() => setView('home')} className="px-6 py-2 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/5 hover:border-white/20 transition-all">Exit HUD</button>
           </div>
        </header>

        {/* Dynamic Workspace */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-12 scrollbar-hide relative z-10">
          {activeTab === 'overview' && <OverviewTab toggleTab={setActiveTab} fleetCount={purchasedIds.length} />}
          {activeTab === 'marketplace' && <ModuleGrid type="available" purchasedIds={purchasedIds} setPurchased={setPurchasedIds} query={searchQuery} />}
          {activeTab === 'fleet' && <ModuleGrid type="purchased" purchasedIds={purchasedIds} setPurchased={setPurchasedIds} query={searchQuery} />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'logs' && <LogsTab />}
          {activeTab === 'billing' && <BillingTab />}
          {activeTab === 'profile' && <SettingsTab />}
        </div>

        {/* Global HUD Background Noise */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0" />
      </main>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const OverviewTab = ({ toggleTab, fleetCount }: { toggleTab: any, fleetCount: number }) => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
       <StatCard title="Lattice Health" value="98.2%" sub="System Optimal" icon={<Shield />} color="emerald-500" />
       <StatCard title="Owned Modules" value={fleetCount.toString()} sub="of 50 available" icon={<LayoutGrid />} color="purple-500" />
       <StatCard title="Threats Blocked" value="1,402" sub="Last 24 Hours" icon={<AlertCircle />} color="red-500" />
       <StatCard title="Active Ingest" value="12GB/s" sub="Organization-wide" icon={<Zap />} color="amber-500" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       <div className="glass p-10 rounded-[3rem] border border-white/5 group hover:bg-white/[0.02] transition-colors relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
          <div className="flex justify-between items-center mb-10 relative z-10">
             <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Neural Traffic Density</h3>
             <button onClick={() => toggleTab('analytics')} className="text-[9px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1">Expand Detail <ChevronRight className="w-3 h-3" /></button>
          </div>
          <div className="h-64 flex items-end gap-3 relative z-10">
             {[40, 70, 45, 90, 65, 80, 50, 95, 40, 60, 85, 30, 70, 55, 90].map((h, i) => (
               <div key={i} className="flex-1 bg-white/5 rounded-t-lg relative overflow-hidden group/bar">
                  <div 
                    className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-purple-600 to-pink-500 transition-all duration-1000 group-hover/bar:brightness-125"
                    style={{ height: `${h}%` }}
                  />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
               </div>
             ))}
          </div>
          <div className="flex justify-between mt-6 text-[8px] font-black text-white/20 uppercase tracking-[0.4em] relative z-10">
             <span>00:00</span><span>GLOBAL SYNC</span><span>23:59</span>
          </div>
       </div>

       <div className="glass p-10 rounded-[3rem] border border-white/5">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-10">Real-Time Threat Feed</h3>
          <div className="space-y-4">
             {[
               { node: "FraudGuard", msg: "Botnet attempt blocked at North PoP", level: "Critical", time: "2m ago" },
               { node: "NetDefender", msg: "Anomalous DNS tunnel detected", level: "Warning", time: "14m ago" },
               { node: "IAMControl", msg: "Admin MFA verification success", level: "Info", time: "1h ago" },
               { node: "SIEMCommander", msg: "Lattice baseline recalibrated", level: "Success", time: "3h ago" },
             ].map((log, i) => (
               <div key={i} className="flex items-center gap-6 p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all cursor-pointer group">
                  <div className={`w-2.5 h-2.5 rounded-full ${log.level === 'Critical' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : log.level === 'Warning' ? 'bg-amber-500' : log.level === 'Success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  <div className="flex-1">
                     <div className="text-[11px] font-bold text-white/80 group-hover:text-white transition-colors">{log.msg}</div>
                     <div className="text-[8px] uppercase font-black text-white/20 tracking-widest mt-1">{log.node} • {log.time}</div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-white/40 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
               </div>
             ))}
          </div>
          <button onClick={() => toggleTab('logs')} className="w-full mt-8 py-4 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-white/30 hover:bg-white/5 hover:text-white transition-all">Enter Log Terminal</button>
       </div>
    </div>
  </div>
);

const StatCard = ({ title, value, sub, icon, color }: any) => (
  <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between group hover:border-white/20 transition-all">
    <div className="flex justify-between items-start mb-8">
      <div className={`p-3 rounded-xl bg-${color}/10 text-${color} group-hover:scale-110 transition-transform`}>{icon}</div>
      <div className="text-[10px] font-black text-white/10 uppercase tracking-widest">Live Node</div>
    </div>
    <div>
      <div className="text-3xl font-black tracking-tighter mb-1 uppercase">{value}</div>
      <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{title}</div>
      <div className={`text-[8px] font-bold text-${color} mt-3 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity`}>{sub}</div>
    </div>
  </div>
);

const ModuleGrid = ({ type, purchasedIds, setPurchased, query }: { type: 'available' | 'purchased', purchasedIds: number[], setPurchased: any, query: string }) => {
  const { setView } = useScroll();
  const filtered = tools.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(query.toLowerCase()) || t.category.toLowerCase().includes(query.toLowerCase());
    const matchesType = type === 'purchased' ? purchasedIds.includes(t.id) : !purchasedIds.includes(t.id);
    return matchesSearch && matchesType;
  });

  const handleBuy = (id: number) => {
    setPurchased([...purchasedIds, id]);
  };

  const routeMap: Record<number, string> = {
    1: 'fraud-guard', 2: 'dark-web-monitor', 3: 'zero-day-detect', 4: 'malware-hunter',
    5: 'phish-guard', 6: 'vuln-scan', 7: 'pen-test-ai', 8: 'secure-code',
    9: 'compliance-check', 10: 'data-guardian', 11: 'crypto-shield',
    12: 'iam-control', 13: 'log-intel', 14: 'net-defender', 15: 'endpoint-shield',
    16: 'cloud-secure', 17: 'api-guardian', 18: 'container-watch', 19: 'devsecops',
    20: 'incident-command', 21: 'forensics-lab', 22: 'threat-intel', 23: 'behavior-watch',
    24: 'anomaly-detect', 25: 'red-team-ai', 26: 'blue-team-ai', 27: 'siem-commander',
    28: 'soar-engine', 29: 'risk-score-ai', 30: 'policy-engine', 31: 'audit-tracker',
    32: 'zero-trust-ai', 33: 'password-vault', 34: 'biometric-ai', 35: 'email-guard',
    36: 'web-filter', 37: 'dns-shield', 38: 'firewall-ai', 39: 'vpn-guardian',
    40: 'wireless-watch', 41: 'iot-secure', 42: 'mobile-defend', 43: 'backup-guard',
    44: 'dr-plan', 45: 'privacy-shield', 46: 'gdpr-compliance', 47: 'hipaa-guard',
    48: 'pcidss-guard', 49: 'bug-bounty-ai', 50: 'cyber-edu-ai'
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
         <div className="space-y-1">
            <h2 className="text-4xl font-black uppercase tracking-tighter">
              {type === 'available' ? 'Module Library' : 'My Command Fleet'}
            </h2>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">
              {filtered.length} Nodes Displayed
            </p>
         </div>
         {type === 'available' && (
           <div className="flex gap-4">
              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/10">Sort by Risk</span>
              <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-purple-500/20 text-purple-400">Featured</span>
           </div>
         )}
      </div>

      {filtered.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center text-center space-y-6 glass rounded-[4rem] border border-white/5 border-dashed">
           <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/20"><Search className="w-8 h-8" /></div>
           <div className="space-y-2">
             <h3 className="text-xl font-bold uppercase tracking-tight">No Modules Detected</h3>
             <p className="text-white/30 text-xs max-w-xs">Adjust your lattice search parameters or visit the marketplace to acquire new nodes.</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(tool => (
            <div key={tool.id} className={`glass p-8 rounded-[2.5rem] border transition-all group relative overflow-hidden flex flex-col h-full ${type === 'purchased' ? 'border-purple-500/20 shadow-2xl shadow-purple-950/20' : 'border-white/5 hover:border-white/20'}`}>
               
               <div className="flex justify-between items-start mb-8">
                  <div className={`p-4 rounded-2xl bg-${tool.theme.primary}/10 text-${tool.theme.primary} group-hover:scale-110 transition-transform duration-500`}>
                     <Shield className="w-6 h-6" />
                  </div>
                  {type === 'purchased' ? (
                    <div className="flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400/60">ACTIVE_LATTICE</span>
                    </div>
                  ) : (
                    <div className="text-lg font-black tracking-tighter text-white/40 font-mono">$249/mo</div>
                  )}
               </div>

               <div className="flex-1 space-y-3 mb-10">
                 <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-purple-400 transition-colors leading-none">{tool.name}</h3>
                 <p className="text-[11px] text-white/40 leading-relaxed line-clamp-3 font-medium">{tool.description}</p>
                 <div className="flex flex-wrap gap-2 pt-4">
                    <span className="px-2 py-1 bg-white/5 rounded-md text-[8px] font-black uppercase tracking-widest text-white/40">{tool.category}</span>
                    <span className="px-2 py-1 bg-white/5 rounded-md text-[8px] font-black uppercase tracking-widest text-white/40">{tool.stats.accuracy} Acc</span>
                 </div>
               </div>

               <div className="pt-8 border-t border-white/5 mt-auto">
                 {type === 'purchased' ? (
                   <button 
                     onClick={() => setView(routeMap[tool.id] as any)}
                     className="w-full py-4 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:brightness-125 transition-all flex items-center justify-center gap-3"
                   >
                     Launch Console <ChevronRight className="w-4 h-4" />
                   </button>
                 ) : (
                   <button 
                     onClick={() => handleBuy(tool.id)}
                     className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-purple-50 transition-all flex items-center justify-center gap-3"
                   >
                     Acquire Module <Zap className="w-4 h-4 fill-current" />
                   </button>
                 )}
               </div>

               {/* Grid Card Hover Visual */}
               <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                 <div className="text-[8px] font-mono text-white/10 uppercase leading-none">Node_ID: 0x{tool.id.toString(16).toUpperCase()}</div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AnalyticsTab = () => (
  <div className="space-y-12 animate-in fade-in duration-500">
    <div className="glass p-20 rounded-[4rem] border border-white/5 text-center space-y-12 relative overflow-hidden min-h-[600px] flex flex-col justify-center">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.1)_0%,_transparent_70%)]" />
       <div className="w-32 h-32 rounded-full border-4 border-dashed border-purple-500/20 animate-spin-slow flex items-center justify-center mx-auto relative z-10">
          <BarChart3 className="w-12 h-12 text-purple-500 animate-pulse" />
       </div>
       <div className="space-y-6 relative z-10">
         <h2 className="text-5xl font-black uppercase tracking-tighter">Calibrating Neural Flow</h2>
         <p className="text-white/40 max-w-lg mx-auto text-lg leading-relaxed font-medium">The Maula Deep-Learning engine is synthesizing terabytes of organizational telemetry. Global interception heatmaps will manifest upon 24-hour baseline verification.</p>
       </div>
       <div className="flex gap-4 justify-center relative z-10">
          <div className="px-6 py-3 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/20 border border-white/10 flex items-center gap-2"><RefreshCw className="w-3 h-3 animate-spin" /> Ingesting Data</div>
          <div className="px-6 py-3 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/20 border border-white/10 flex items-center gap-2"><RefreshCw className="w-3 h-3 animate-spin" /> Training Model_v4</div>
       </div>
    </div>
  </div>
);

const LogsTab = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
     <div className="flex justify-between items-center px-4">
        <div className="flex gap-4">
          <span className="px-4 py-1.5 bg-purple-500/20 border border-purple-500/40 rounded-full text-[9px] font-black uppercase tracking-widest text-purple-400">All Logs</span>
          <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors cursor-pointer">Critical Only</span>
        </div>
        <div className="text-[10px] font-mono text-white/20 uppercase">Stream: 120kb/s</div>
     </div>
     <div className="glass p-10 rounded-[3rem] border border-white/5 bg-black/60 font-mono text-[11px] leading-relaxed max-h-[70vh] overflow-y-auto scrollbar-hide shadow-inner border-t border-l border-white/10">
        {[...Array(40)].map((_, i) => (
          <div key={i} className="flex gap-6 py-2 border-b border-white/[0.02] last:border-0 opacity-50 hover:opacity-100 transition-opacity group">
            <span className="text-white/20 shrink-0 font-bold">[{new Date().toISOString().split('T')[1].split('Z')[0]}]</span>
            <span className="text-purple-400 font-black shrink-0 uppercase tracking-tighter">LATTICE_DAEMON</span>
            <span className="text-white/60 group-hover:text-white transition-colors">Module_0x{Math.floor(Math.random() * 50).toString(16)} status: OK. Pulse check completed. Verified secure.</span>
            <span className="ml-auto text-emerald-500 font-bold tracking-widest text-[9px] uppercase">SUCCESS</span>
          </div>
        ))}
        <div className="py-4 text-purple-500/40 animate-pulse italic font-black uppercase tracking-[0.4em] text-center pt-10">--- Waiting for Incoming Transmission Streams ---</div>
     </div>
  </div>
);

const BillingTab = () => (
  <div className="max-w-5xl space-y-12 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="glass p-12 rounded-[4rem] border border-emerald-500/20 relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent pointer-events-none" />
         <div className="flex justify-between items-center mb-10 relative z-10">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Current Node Balance</h3>
            <span className="px-4 py-2 rounded-full bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.4)]">Verified Active</span>
         </div>
         <div className="text-7xl font-black tracking-tighter mb-4 relative z-10">$0.00 <span className="text-lg text-white/30 font-normal tracking-normal ml-2 italic">Est. Charges</span></div>
         <p className="text-white/40 text-xs font-medium relative z-10 leading-relaxed">Enterprise plan subscription is active. Next cycle begins February 1, 2026. Billed to primary corporate terminal account.</p>
         <button className="mt-10 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Download Forecast</button>
      </div>

      <div className="space-y-6">
         <div className="flex justify-between items-center mb-2 px-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Transaction History</h4>
            <History className="w-4 h-4 text-white/10" />
         </div>
         {[
           { id: "INV_LATTICE_021", date: "JAN 01, 2026", amt: "$2,499.00", status: "Verified" },
           { id: "INV_LATTICE_019", date: "DEC 01, 2025", amt: "$2,499.00", status: "Verified" },
           { id: "INV_LATTICE_014", date: "NOV 01, 2025", amt: "$2,499.00", status: "Verified" },
         ].map((inv, i) => (
           <div key={i} className="flex items-center justify-between p-8 glass rounded-[2.5rem] border border-white/5 hover:bg-white/5 transition-all cursor-pointer group">
              <div className="flex items-center gap-6">
                 <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-all"><CreditCard className="w-6 h-6" /></div>
                 <div>
                    <div className="text-sm font-black tracking-tight">{inv.id}</div>
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">{inv.date}</div>
                 </div>
              </div>
              <div className="text-right">
                 <div className="text-sm font-black">{inv.amt}</div>
                 <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mt-1">{inv.status}</div>
              </div>
           </div>
         ))}
         <button className="w-full py-4 text-[9px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors">View All Invoices</button>
      </div>
    </div>
  </div>
);

const SettingsTab = () => {
  const { setView } = useScroll();
  
  return (
    <div className="max-w-5xl space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
         <div className="space-y-10">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/30 px-2 italic">Lattice Global Security</h3>
            <div className="space-y-4">
               <SettingsRow label="Neural Auto-Heal" desc="Allow lattice to autonomously remediate drift" active />
               <SettingsRow label="FIPS Encryption" desc="Enforce hardware-level encryption across nodes" active />
               <SettingsRow label="Biometric Access" desc="Require neural/biometric ID for node changes" />
               <SettingsRow label="Quantum Shield" desc="Activate post-quantum cryptographic wrappers" active />
            </div>
         </div>
         <div className="space-y-10">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/30 px-2 italic">Interface Parameters</h3>
            <div className="grid grid-cols-1 gap-6">
               <button 
                onClick={() => setView('dashboard-api-keys')}
                className="w-full flex items-center justify-between p-8 glass rounded-[2.5rem] border border-white/5 hover:border-purple-500/30 transition-all text-left group">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-white/5 rounded-2xl text-white/20 group-hover:text-purple-400 transition-colors"><Key className="w-6 h-6" /></div>
                    <div><div className="text-sm font-black uppercase tracking-tight">API Access Keys</div><div className="text-[10px] text-white/30 font-medium">Manage cross-origin node integrations</div></div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-white/10 group-hover:text-white transition-all" />
               </button>
               <button 
                onClick={() => setView('dashboard-admin-hierarchy')}
                className="w-full flex items-center justify-between p-8 glass rounded-[2.5rem] border border-white/5 hover:border-emerald-500/30 transition-all text-left group">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-white/5 rounded-2xl text-white/20 group-hover:text-emerald-400 transition-colors"><User className="w-6 h-6" /></div>
                    <div><div className="text-sm font-black uppercase tracking-tight">Admin Hierarchy</div><div className="text-[10px] text-white/30 font-medium">Define node-level operator permissions</div></div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-white/10 group-hover:text-white transition-all" />
               </button>
               <button 
                onClick={() => setView('dashboard-sovereignty')}
                className="w-full flex items-center justify-between p-8 glass rounded-[2.5rem] border border-white/5 hover:border-amber-500/30 transition-all text-left group">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-white/5 rounded-2xl text-white/20 group-hover:text-amber-400 transition-colors"><Database className="w-6 h-6" /></div>
                    <div><div className="text-sm font-black uppercase tracking-tight">Sovereignty Nodes</div><div className="text-[10px] text-white/30 font-medium">Configure geographic data residency perms</div></div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-white/10 group-hover:text-white transition-all" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

const SettingsRow = ({ label, desc, active }: { label: string, desc: string, active?: boolean }) => (
  <div className="flex items-center justify-between p-8 glass rounded-[2.5rem] border border-white/5 hover:bg-white/5 transition-all">
    <div className="space-y-1">
      <div className="text-sm font-black uppercase tracking-tight text-white/80">{label}</div>
      <div className="text-[10px] text-white/30 font-medium">{desc}</div>
    </div>
    <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${active ? 'bg-purple-600' : 'bg-white/10'}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${active ? 'left-7' : 'left-1 opacity-40'}`} />
    </div>
  </div>
);

export default Dashboard;
