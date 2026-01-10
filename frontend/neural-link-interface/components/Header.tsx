
import React from 'react';

interface HeaderProps {
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onToggleNav: () => void;
  onClear: () => void;
  onLock: () => void;
  leftOpen: boolean;
  rightOpen: boolean;
}

// Simple SVG icons to avoid lucide-react compatibility issues with React 19
const ColumnsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="12" x2="12" y1="3" y2="21"/>
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

const Trash2Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const Header: React.FC<HeaderProps> = ({ 
  onToggleLeft, 
  onToggleRight, 
  onToggleNav, 
  onClear, 
  onLock,
  leftOpen,
  rightOpen
}) => {
  return (
    <header className="bg-[#111]/90 backdrop-blur-md border-b border-gray-700 p-3 flex items-center justify-between flex-shrink-0 z-50">
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={onToggleLeft}
          className={`text-gray-400 hover:text-white hover-glow p-1 transition-colors ${leftOpen ? 'text-green-400' : ''}`}
        >
          <ColumnsIcon />
        </button>

        <button 
          onClick={onToggleNav}
          className="text-green-400 hover:text-white p-1 transition-colors"
        >
          <MenuIcon />
        </button>

        <button 
          onClick={onClear}
          className="text-red-400 hover:text-red-300 p-1 transition-colors"
        >
          <Trash2Icon />
        </button>

        <button 
          onClick={() => window.open('https://ai.google.dev', '_blank')}
          className="text-cyan-400 hover:text-white p-1 transition-colors"
        >
          <ExternalLinkIcon />
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={onLock}
          className="bg-gray-800/80 hover:bg-gray-700/80 text-red-400 p-2 rounded-full transition-colors"
        >
          <LockIcon />
        </button>

        <button 
          onClick={onToggleRight}
          className={`text-gray-400 hover:text-white hover-glow p-1 transition-colors ${rightOpen ? 'text-cyan-400' : ''}`}
        >
          <ChevronRightIcon className={rightOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
      </div>
    </header>
  );
};

export default Header;
