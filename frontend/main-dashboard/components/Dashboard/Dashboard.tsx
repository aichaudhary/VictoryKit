
import React, { useState } from 'react';
import { 
  Shield, LayoutDashboard, Activity, CreditCard, Settings as SettingsIcon, 
  Search, Bell, LogOut, ShieldCheck, Cpu, Terminal, Home, 
  Users, Code, FileCheck, Radar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Import newly created pages
import Overview from './Overview';
import SecurityPosture from './SecurityPosture';
import ActivityLogs from './ActivityLogs';
import IdentityControl from './IdentityControl';
import CloudInfra from './CloudInfra';
import APISafeguard from './APISafeguard';
import Compliance from './Compliance';
import ThreatIntel from './ThreatIntel';
import Settings from './Settings';
import ToolsAnalytics from './ToolsAnalytics'; // Assumed existing from previous context or generic shield view
import { tools } from '../../data/tools';

type Tab = 'overview' | 'shields' | 'posture' | 'identity' | 'infra' | 'api' | 'compliance' | 'intel' | 'logs' | 'billing' | 'settings';

const Dashboard: React.FC = () => {
  const { user, logout, setView } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const SidebarItem = ({ icon: Icon, label, id }: { icon: any, label: string, id: Tab }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all ${
        activeTab === id ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'text-white/40 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[10px] font-black uppercase tracking-widest text-left">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#02000a] text-white flex">
      {/* Sidebar Navigation - Tactical Rail */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-6 sticky top-0 h-screen overflow-y-auto scrollbar-hide">
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => setView('landing')}>
          <div className="bg-purple-600 p-2 rounded-lg"><Shield className="w-5 h-5" /></div>
          <span className="text-lg font-black tracking-tighter">MAULA<span className="text-purple-500">.AI</span></span>
        </div>

        <nav className="flex-1 space-y-1">
          <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-3 ml-2">Main Core</div>
          <SidebarItem icon={LayoutDashboard} label="Overview" id="overview" />
          <SidebarItem icon={ShieldCheck} label="Shields (50)" id="shields" />
          <SidebarItem icon={Activity} label="Identity" id="identity" />
          
          <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-6 mb-3 ml-2">Defensive Layer</div>
          <SidebarItem icon={Terminal} label="Posture" id="posture" />
          <SidebarItem icon={Cpu} label="Cloud Infra" id="infra" />
          <SidebarItem icon={Code} label="API Safeguard" id="api" />
          
          <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-6 mb-3 ml-2">Intelligence</div>
          <SidebarItem icon={Radar} label="Threat Intel" id="intel" />
          <SidebarItem icon={FileCheck} label="Compliance" id="compliance" />
          <SidebarItem icon={Terminal} label="Audit Logs" id="logs" />
          
          <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-6 mb-3 ml-2">Enterprise</div>
          <SidebarItem icon={CreditCard} label="Billing" id="billing" />
          <SidebarItem icon={SettingsIcon} label="Settings" id="settings" />
        </nav>

        <div className="mt-8 space-y-2">
          <button onClick={() => setView('landing')} className="w-full flex items-center gap-4 px-4 py-2 text-white/40 hover:text-white transition-all"><Home className="w-4 h-4" /><span className="text-[10px] font-black uppercase">Home</span></button>
          <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-2 text-red-500/60 hover:text-red-500 transition-all"><LogOut className="w-4 h-4" /><span className="text-[10px] font-black uppercase">Disconnect</span></button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">
              {activeTab.replace(/([A-Z])/g, ' $1')}
            </h1>
            <p className="text-white/40 text-sm mt-1">Network: <span className="text-emerald-500 font-bold uppercase tracking-widest text-[10px]">Active Deployment</span></p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex -space-x-3">
               {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#02000a] bg-white/10" />)}
             </div>
             <div className="h-10 w-[1px] bg-white/10" />
             <div className="text-right">
                <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{user?.tier || 'Enterprise'}</div>
                <div className="text-xs font-bold text-white/60">{user?.email}</div>
             </div>
          </div>
        </header>

        {/* Panel Rendering Logic */}
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'posture' && <SecurityPosture />}
        {activeTab === 'logs' && <ActivityLogs />}
        {activeTab === 'identity' && <IdentityControl />}
        {activeTab === 'infra' && <CloudInfra />}
        {activeTab === 'api' && <APISafeguard />}
        {activeTab === 'compliance' && <Compliance />}
        {activeTab === 'intel' && <ThreatIntel />}
        {activeTab === 'settings' && <Settings />}
        
        {/* Fallbacks for simplified screens */}
        {activeTab === 'shields' && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <ShieldCheck className="w-20 h-20 mb-6" />
            <h2 className="text-xl font-bold uppercase">Shield Matrix v5</h2>
            <p className="max-w-xs text-sm mt-2">Access individual module analytics via the side navigation for specific neural metrics.</p>
          </div>
        )}
        
        {activeTab === 'billing' && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <CreditCard className="w-20 h-20 mb-6" />
            <h2 className="text-xl font-bold uppercase">Financial Ledger</h2>
            <p className="max-w-xs text-sm mt-2">Synchronizing with enterprise billing gateway...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
