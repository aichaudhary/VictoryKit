
import React from 'react';
import { SettingsState } from '../types';
import { NEURAL_PRESETS, PROVIDER_CONFIG } from '../constants';

// Inline SVG icons to avoid lucide-react compatibility issues with React 19
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const CpuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>
  </svg>
);

const RefreshCwIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
  </svg>
);

const Link2Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 0 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/>
  </svg>
);

const BoxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5,4.27 12,6.11 16.5,4.27"/><polyline points="7.5,9.73 7.5,14.27 12,16.11 16.5,14.27 16.5,9.73"/><polyline points="12,6.11 12,16.11"/>
  </svg>
);

const SlidersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/>
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/>
  </svg>
);

interface SettingsPanelProps {
  settings: SettingsState;
  onChange: (settings: SettingsState) => void;
  onApplyPreset: (type: string) => void;
  onReset: () => void;
  isOpen: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange, onApplyPreset, onReset, isOpen }) => {
  const currentProvider = PROVIDER_CONFIG.find(p => p.id === settings.provider) || PROVIDER_CONFIG[0];

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProviderId = e.target.value;
    const provider = PROVIDER_CONFIG.find(p => p.id === newProviderId) || PROVIDER_CONFIG[0];
    onChange({
      ...settings,
      provider: newProviderId,
      model: provider.models[0] // Reset to default model of new provider
    });
  };

  return (
    <aside className={`absolute top-0 right-0 h-full w-[85%] sm:w-72 md:w-80 bg-[#0a0a0a]/98 backdrop-blur-xl border-l border-gray-800/50 p-5 transition-transform duration-500 ease-out z-[55] flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.5)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-center gap-3 mb-6 border-b border-gray-900 pb-4">
        <SettingsIcon />
        <h2 className="text-cyan-400 font-bold glow-cyan uppercase tracking-tighter text-sm font-mono">
          NEURAL_CONFIG
        </h2>
      </div>
      
      <div className="flex-grow overflow-y-auto custom-scrollbar space-y-8 text-xs font-mono pr-1">
        {/* Runtime Overview */}
        <div className="p-4 bg-cyan-950/10 border border-cyan-500/20 rounded-lg space-y-3">
            <div className="flex items-center gap-2 mb-1">
                <CpuIcon />
                <h3 className="text-cyan-500 font-bold uppercase tracking-widest text-[9px]">Engine State</h3>
            </div>
          <div className="grid grid-cols-2 gap-y-2 text-[9px]">
            <span className="text-gray-600 uppercase">Co-Processor:</span> <span className="text-gray-300">ACTIVE</span>
            <span className="text-gray-600 uppercase">Context:</span> <span className="text-gray-300">{(settings.maxTokens / 1024).toFixed(1)}k PKTS</span>
            <span className="text-gray-600 uppercase">Precision:</span> <span className="text-gray-300">FP16</span>
          </div>
        </div>

        {/* LLM Engine Selection */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col space-y-2">
            <label className="text-gray-600 uppercase text-[9px] tracking-widest flex items-center gap-2">
                <Link2Icon /> PROVIDER_UPLINK
            </label>
            <select 
              value={settings.provider}
              onChange={handleProviderChange}
              className="bg-black border border-gray-800 rounded p-2.5 text-cyan-400 outline-none focus:border-cyan-500 shadow-inner text-[10px] font-bold appearance-none cursor-pointer hover:bg-white/5 transition-colors"
            >
              {PROVIDER_CONFIG.map(p => (
                <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-gray-600 uppercase text-[9px] tracking-widest flex items-center gap-2">
                <BoxIcon /> MODEL_IDENTIFIER
            </label>
            <select 
              value={settings.model}
              onChange={(e) => onChange({ ...settings, model: e.target.value })}
              className="bg-black border border-gray-800 rounded p-2.5 text-green-400 outline-none focus:border-green-500 shadow-inner text-[10px] font-bold appearance-none cursor-pointer hover:bg-white/5 transition-colors"
            >
              {currentProvider.models.map(m => (
                <option key={m} value={m}>{m.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Persona */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-green-500 font-bold uppercase text-[9px] tracking-widest">Directive Alpha</h3>
            <span className="text-[8px] text-gray-700">READ_ONLY: OFF</span>
          </div>
          <textarea 
            value={settings.customPrompt}
            onChange={(e) => onChange({ ...settings, customPrompt: e.target.value })}
            rows={5} 
            className="w-full bg-black/60 border border-gray-800 rounded-lg p-3 text-gray-400 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/10 resize-none text-[10px] leading-relaxed transition-all"
            placeholder="Input system instructions..."
          />
        </div>

        {/* Neural Presets */}
        <div className="space-y-3">
          <h3 className="text-yellow-500 font-bold uppercase text-[9px] tracking-widest">Core Presets</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(NEURAL_PRESETS).map(t => (
              <button 
                key={t}
                onClick={() => onApplyPreset(t)}
                className="text-[9px] uppercase p-2.5 rounded border border-gray-800 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-gray-600 hover:text-cyan-300 transition-all font-bold tracking-wider"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Precision Sliders */}
        <div className="space-y-6 pt-2">
          <div className="flex flex-col space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-gray-500 uppercase text-[9px] tracking-widest flex items-center gap-2">
                    <SlidersIcon /> Volatility
                </label>
                <span className="text-cyan-400 font-bold tabular-nums">{settings.temperature}</span>
            </div>
            <input 
              type="range" 
              min="0" max="2" step="0.1" 
              value={settings.temperature}
              onChange={(e) => onChange({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 h-1 bg-gray-900 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="flex flex-col space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-gray-500 uppercase text-[9px] tracking-widest flex items-center gap-2">
                    <SaveIcon /> Output Budget
                </label>
                <span className="text-cyan-400 font-bold tabular-nums">{settings.maxTokens}</span>
            </div>
            <input 
              type="range" 
              min="256" max="4096" step="128" 
              value={settings.maxTokens}
              onChange={(e) => onChange({ ...settings, maxTokens: parseInt(e.target.value) })}
              className="w-full accent-emerald-500 h-1 bg-gray-900 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Global Identifiers */}
        <div className="space-y-4 pt-4 border-t border-gray-900">
          <div className="flex flex-col space-y-2">
            <label className="text-gray-700 uppercase text-[9px] tracking-widest">Protocol ID</label>
            <input 
              type="text" 
              value={settings.agentName}
              onChange={(e) => onChange({ ...settings, agentName: e.target.value })}
              className="bg-black border border-gray-800 rounded p-2 text-gray-400 focus:border-green-500/50 outline-none text-[10px] uppercase font-bold tracking-widest"
            />
          </div>
        </div>
      </div>
      
      <button 
        onClick={onReset}
        className="mt-8 w-full p-4 rounded-lg border border-red-900/30 bg-red-950/10 hover:bg-red-900/20 text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
      >
        <RefreshCwIcon />
        Factory Wipe
      </button>
    </aside>
  );
};

export default SettingsPanel;
