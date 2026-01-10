
import React, { useEffect, useState } from 'react';
import { NAV_ITEMS } from '../constants';
import { NavItem } from '../types';

// Inline SVG icons to avoid lucide-react compatibility issues with React 19
const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6L6 18"/><path d="M6 6l12 12"/>
  </svg>
);

const CpuIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>
  </svg>
);

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const ZapIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onModuleSelect: (item: NavItem) => void;
}

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ isOpen, onClose, onModuleSelect }) => {
  const [renderNodes, setRenderNodes] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setRenderNodes(true), 200);
      return () => clearTimeout(timer);
    } else {
      setRenderNodes(false);
    }
  }, [isOpen]);

  return (
    <div 
      className={`fixed inset-0 bg-[#050505]/98 backdrop-blur-3xl z-[200] transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col shadow-[0_-30px_100px_rgba(0,0,0,0.9)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
    >
      {/* Decorative Matrix Scan Line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
        <div className="w-full h-full bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[length:100%_4px] animate-[pulse_3s_infinite]"></div>
      </div>

      {/* Header Diagnostics - Minimal styling to avoid cluttering the screen edges */}
      <div className="flex items-start justify-between p-8 sm:p-12 relative z-10">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-500/10 rounded-sm border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <CpuIcon className="text-emerald-500 animate-pulse" />
            </div>
            <div>
              <h3 className="text-green-400 font-bold text-2xl sm:text-4xl glow-green tracking-[0.3em] font-mono leading-none">
                SYSTEM_DIAGNOSTICS
              </h3>
              <p className="text-[10px] sm:text-sm text-emerald-600/60 uppercase font-mono tracking-[0.5em] mt-2 font-bold flex items-center gap-4">
                UPLINK STATUS: <span className="text-emerald-400">OPTIMIZED</span> 
                <span className="text-gray-800">|</span> 
                LATENCY: <span className="text-emerald-400">24MS</span>
              </p>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-red-500 p-4 hover:bg-red-500/5 rounded-full border border-gray-800 hover:border-red-500/20 transition-all active:scale-95"
        >
          <XIcon />
        </button>
      </div>
      
      {/* Grid of Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-grow overflow-y-auto custom-scrollbar p-8 sm:p-12 relative z-10 pt-4">
        {NAV_ITEMS.map((item, idx) => (
          <button 
            key={item.label}
            onClick={() => onModuleSelect(item)}
            style={{ 
              animationDelay: `${idx * 60}ms`,
              display: renderNodes ? 'flex' : 'none'
            }}
            className="stagger-node relative group p-8 rounded-xl border border-gray-800/50 bg-black/40 hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-all flex flex-col items-start text-left overflow-hidden active:scale-[0.98] h-full"
          >
            {/* Background Data Stream (Visual Only) */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-[url('https://www.transparenttextures.com/patterns/3px-tile.png')]"></div>
            
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-500/30 group-hover:border-emerald-500 transition-colors"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-500/30 group-hover:border-emerald-500 transition-colors"></div>

            {/* Node ID Header */}
            <div className="w-full flex justify-between items-center mb-6">
              <div className="text-[10px] text-gray-700 font-mono tracking-[0.5em] group-hover:text-emerald-600 transition-colors uppercase font-bold">
                NODE_0{idx + 1}
              </div>
              <ChevronRightIcon className="text-gray-800 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </div>
            
            <div className="mb-6 text-5xl group-hover:scale-110 transition-transform duration-500 filter drop-shadow-[0_0_12px_rgba(16,185,129,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]">
              {item.icon}
            </div>
            
            <div className="flex flex-col gap-2 w-full">
              <span className="text-sm sm:text-base uppercase font-bold tracking-[0.3em] text-gray-400 group-hover:text-emerald-400 transition-colors">
                {item.label}
              </span>
              <p className="text-[10px] text-gray-600 group-hover:text-gray-400 transition-colors font-mono leading-relaxed max-w-[200px]">
                {item.description.toUpperCase()}
              </p>
              <div className="flex gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`w-3 h-1 ${i < 3 ? 'bg-emerald-900' : 'bg-gray-900'} group-hover:bg-emerald-500 transition-colors`}></div>
                ))}
              </div>
            </div>
            
            <div className="absolute bottom-4 left-8 text-[9px] text-gray-800 font-mono opacity-40 group-hover:opacity-100 group-hover:text-emerald-900 transition-all uppercase tracking-widest">
              Sec_lvl_0{idx + 2} // {item.tool.toUpperCase()}
            </div>
          </button>
        ))}
      </div>
      
      {/* Animated Scanning Footer - No top border for "clean" look */}
      <div className="p-8 pb-12 bg-[#080808]/50 flex justify-between items-center px-12 relative overflow-hidden">
        <div className="flex gap-10 items-center z-10">
          <div className="flex items-center gap-4">
            <ActivityIcon className="text-emerald-600 animate-[pulse_1s_infinite]" />
            <span className="text-xs text-emerald-500/70 font-mono uppercase tracking-[0.4em] font-bold">
              SCANNING SUB-SECTORS...
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 z-10">
          <div className="flex gap-1.5">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`w-1.5 h-4 border border-emerald-900/40 ${i < 8 ? 'bg-emerald-500/20' : 'bg-transparent'} animate-pulse`} style={{ animationDelay: `${i * 100}ms` }}></div>
            ))}
          </div>
          <ZapIcon className="text-emerald-900/30" />
        </div>
      </div>
    </div>
  );
};

export default NavigationDrawer;
