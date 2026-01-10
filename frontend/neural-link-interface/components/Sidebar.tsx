
import React, { useState } from 'react';
import { ChatSession } from '../types';

// Inline SVG icons to avoid lucide-react compatibility issues with React 19
const SearchIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14"/><path d="M12 5v14"/>
  </svg>
);

const MoreVerticalIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>
);

const TerminalIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>
  </svg>
);

const Share2Icon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>
  </svg>
);

const CopyIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
);

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
  </svg>
);

const Trash2Icon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6L6 18"/><path d="M6 6l12 12"/>
  </svg>
);

interface SidebarProps {
  sessions: ChatSession[];
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ sessions, onSelect, onCreate, onDelete, isOpen }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleAction = (e: React.MouseEvent, id: string, action: string) => {
    e.stopPropagation();
    const session = sessions.find(s => s.id === id);
    if (!session) return;

    switch (action) {
      case 'share':
        navigator.clipboard.writeText(`NEURAL_PROTOCOL_UPLINK_${id}`);
        alert("Session Uplink ID copied to clipboard.");
        break;
      case 'copy':
        navigator.clipboard.writeText(JSON.stringify(session, null, 2));
        alert("Full Session Log (JSON) copied.");
        break;
      case 'download':
        const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${session.name}_DATA_BUNDLE.json`;
        a.click();
        break;
      case 'delete':
        if (confirm(`CRITICAL: Purge Session [${session.name}] from vault?`)) {
          onDelete(id);
        }
        break;
    }
    setActiveMenu(null);
  };

  return (
    <aside className={`absolute top-0 left-0 h-full w-[85%] sm:w-64 md:w-72 bg-[#0a0a0a]/98 backdrop-blur-xl border-r border-gray-800/50 p-4 sm:p-6 transition-transform duration-500 ease-out z-[100] flex flex-col shadow-[20px_0_60px_rgba(0,0,0,0.5)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center gap-3 mb-6">
        <TerminalIcon className="text-green-500" />
        <h2 className="text-green-400 font-bold glow-green uppercase tracking-tighter text-sm font-mono">
          SESSION_VAULT
        </h2>
      </div>
      
      <div className="flex space-x-2 mb-6">
        <button 
          onClick={onCreate}
          className="flex-shrink-0 bg-green-500/10 hover:bg-green-500/20 text-green-400 p-2 rounded border border-green-500/30 transition-all hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]"
        >
          <PlusIcon />
        </button>
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input 
            type="text" 
            placeholder="Search logs..." 
            className="w-full pl-9 pr-3 py-2 text-xs bg-black/60 text-gray-400 border border-gray-800 rounded focus:outline-none focus:border-green-500/50 font-mono transition-all"
          />
        </div>
      </div>

      <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar pr-1 relative">
        {sessions.map(s => (
          <div key={s.id} className="relative group">
            <button
              onClick={() => onSelect(s.id)}
              className={`w-full text-left flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${s.active ? 'bg-green-500/10 border-green-500/40 text-white shadow-[inset_0_0_20px_rgba(34,197,94,0.1)]' : 'border-gray-900 text-gray-600 hover:border-gray-800 hover:bg-gray-800/20 hover:text-gray-400'}`}
            >
              <div className="flex flex-col gap-1 overflow-hidden">
                <span className="text-[11px] font-bold font-mono truncate uppercase tracking-wider">{s.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`w-1 h-1 rounded-full ${s.active ? 'bg-green-500 animate-pulse' : 'bg-gray-800'}`}></span>
                  <span className="text-[8px] opacity-60 uppercase font-mono">{s.messages.length} pkts</span>
                </div>
              </div>
              <div 
                onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === s.id ? null : s.id); }}
                className="p-1 hover:bg-white/5 rounded transition-colors"
              >
                <MoreVerticalIcon className="text-gray-700 hover:text-gray-400" />
              </div>
            </button>

            {/* Session Actions Dropdown */}
            {activeMenu === s.id && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[#0d0d0d] border border-gray-800 rounded-md shadow-2xl z-[110] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2 border-b border-gray-800 flex justify-between items-center bg-black/40">
                  <span className="text-[8px] text-gray-500 font-mono tracking-widest uppercase">Protocol Actions</span>
                  <button onClick={() => setActiveMenu(null)} className="text-gray-600 hover:text-white"><XIcon /></button>
                </div>
                <div className="p-1">
                  <button onClick={(e) => handleAction(e, s.id, 'share')} className="w-full flex items-center gap-3 px-3 py-2 text-[10px] text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-400 rounded transition-colors uppercase font-mono">
                    <Share2Icon /> Share Uplink
                  </button>
                  <button onClick={(e) => handleAction(e, s.id, 'copy')} className="w-full flex items-center gap-3 px-3 py-2 text-[10px] text-gray-400 hover:bg-cyan-500/10 hover:text-cyan-400 rounded transition-colors uppercase font-mono">
                    <CopyIcon /> Copy Manifest
                  </button>
                  <button onClick={(e) => handleAction(e, s.id, 'download')} className="w-full flex items-center gap-3 px-3 py-2 text-[10px] text-gray-400 hover:bg-purple-500/10 hover:text-purple-400 rounded transition-colors uppercase font-mono">
                    <DownloadIcon /> Sync Bundle (ZIP)
                  </button>
                  <button onClick={(e) => handleAction(e, s.id, 'delete')} className="w-full flex items-center gap-3 px-3 py-2 text-[10px] text-red-900 hover:bg-red-500/10 hover:text-red-500 rounded transition-colors uppercase font-mono mt-1 border-t border-gray-800/50 pt-2">
                    <Trash2Icon /> Purge Protocol
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-900">
        <div className="flex justify-between items-center opacity-30">
            <span className="text-[8px] font-mono">SECURE_FS</span>
            <span className="text-[8px] font-mono uppercase">Node_Protocol_v3</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
