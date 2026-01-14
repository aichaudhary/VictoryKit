import React from 'react';
import { Columns, Menu, Trash2, ExternalLink, Lock, ChevronRight, ArrowLeft } from 'lucide-react';
import { getToolBranding } from '../toolBranding';

interface HeaderProps {
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onToggleNav: () => void;
  onClear: () => void;
  onLock: () => void;
  leftOpen: boolean;
  rightOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onToggleLeft,
  onToggleRight,
  onToggleNav,
  onClear,
  onLock,
  leftOpen,
  rightOpen,
}) => {
  const branding = getToolBranding();

  const handleBackToTool = () => {
    // Go back to the tool's main page
    window.location.href = '/';
  };

  return (
    <header className="bg-[#111]/90 backdrop-blur-md border-b border-gray-700 p-3 flex items-center justify-between flex-shrink-0 z-50">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Back to Tool Button */}
        <button
          onClick={handleBackToTool}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          title={`Back to ${branding.name}`}
        >
          <ArrowLeft size={16} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-400 hidden sm:inline">Back</span>
        </button>

        {/* Tool Branding */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{
            backgroundColor: `${branding.primaryColor}15`,
            borderColor: `${branding.primaryColor}40`,
          }}
        >
          <span className="text-lg">{branding.icon}</span>
          <div className="hidden sm:block">
            <div className="text-sm font-bold" style={{ color: branding.primaryColor }}>
              {branding.name}
            </div>
            <div className="text-[10px] text-gray-500">AI Assistant</div>
          </div>
        </div>

        <button
          onClick={onToggleLeft}
          className={`text-gray-400 hover:text-white hover-glow p-1 transition-colors ${leftOpen ? 'text-green-400' : ''}`}
        >
          <Columns size={20} />
        </button>

        <button
          onClick={onToggleNav}
          style={{ color: branding.primaryColor }}
          className="hover:text-white p-1 transition-colors"
        >
          <Menu size={24} />
        </button>

        <button onClick={onClear} className="text-red-400 hover:text-red-300 p-1 transition-colors">
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={onLock}
          className="bg-gray-800/80 hover:bg-gray-700/80 text-red-400 p-2 rounded-full transition-colors"
        >
          <Lock size={18} />
        </button>

        <button
          onClick={onToggleRight}
          className={`text-gray-400 hover:text-white hover-glow p-1 transition-colors ${rightOpen ? 'text-cyan-400' : ''}`}
        >
          <ChevronRight
            size={24}
            className={rightOpen ? 'rotate-180 transition-transform' : 'transition-transform'}
          />
        </button>
      </div>
    </header>
  );
};

export default Header;
