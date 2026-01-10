
import React, { useState, useRef, useEffect } from 'react';
import { Message, SettingsState, WorkspaceMode } from '../types';

// Inline SVG icons to avoid lucide-react compatibility issues with React 19
const SendIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
  </svg>
);

const UploadIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10,9 9,9 8,9"/>
  </svg>
);

const MicIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ExternalLinkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/>
  </svg>
);

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const MessageSquareIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const Edit3Icon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const MonitorIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>
  </svg>
);

const FileCodeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/><path d="m10 12-2 2 2 2"/><path d="m14 12 2 2-2 2"/>
  </svg>
);

const FileTextIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>
  </svg>
);

const LayoutIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/>
  </svg>
);

const ImageIconComponent = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);

const VideoIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m15 10 4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14v-4Z"/><rect width="14" height="12" x="3" y="6" rx="2"/>
  </svg>
);

const RadioIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4"/><path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/>
  </svg>
);

const MicOffIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 9a7 7 0 0 0-14 0"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a8 8 0 0 0 5.29 7.13"/>
  </svg>
);

const PaperclipIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
);

interface ChatBoxProps {
  messages: Message[];
  isThinking: boolean;
  isRecordingSTT: boolean;
  isLiveActive: boolean;
  onSend: (text: string) => void;
  onFileUpload: (file: File) => void;
  onToggleSTT: () => void;
  onToggleLive: () => void;
  agentSettings: SettingsState;
  onUpdateSettings: (settings: SettingsState) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ 
  messages, 
  isThinking, 
  isRecordingSTT,
  isLiveActive,
  onSend, 
  onFileUpload,
  onToggleSTT,
  onToggleLive,
  agentSettings, 
  onUpdateSettings 
}) => {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current && agentSettings.workspaceMode === 'CHAT') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking, agentSettings.workspaceMode]);

  const handleSend = () => {
    if (!inputText.trim() || isThinking) return;
    onSend(inputText.trim());
    setInputText("");
  };

  const setWorkspace = (mode: WorkspaceMode) => {
    onUpdateSettings({ ...agentSettings, workspaceMode: mode });
  };

  const mountPortal = (url: string) => {
    onUpdateSettings({ ...agentSettings, portalUrl: url, workspaceMode: 'PORTAL' });
  };

  const handleCanvasEdit = (content: string) => {
    onUpdateSettings({
      ...agentSettings,
      canvas: { ...agentSettings.canvas, content }
    });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const renderCanvasContent = () => {
    const { type, content } = agentSettings.canvas;

    switch (type) {
      case 'html':
        return (
          <div className="w-full h-full bg-white rounded shadow-2xl overflow-hidden border border-gray-300 ring-4 ring-black">
            <iframe srcDoc={content} className="w-full h-full border-none" title="Canvas Preview" />
          </div>
        );
      case 'video':
        return (
          <div className="w-full h-full bg-black rounded flex items-center justify-center overflow-hidden">
             {content.includes('youtube.com') || content.includes('vimeo.com') ? (
                <iframe src={content} className="w-full h-full aspect-video" allowFullScreen title="Neural Video Sync" />
             ) : (
                <video src={content} controls className="max-w-full max-h-full" />
             )}
          </div>
        );
      case 'image':
        return (
          <div className="w-full h-full flex items-center justify-center bg-[#050505] p-4">
            <img src={content} alt="Sync Asset" className="max-w-full max-h-full object-contain rounded shadow-[0_0_50px_rgba(34,211,238,0.2)]" />
          </div>
        );
      case 'code':
      case 'text':
      default:
        return (
          <textarea 
            value={content}
            onChange={(e) => handleCanvasEdit(e.target.value)}
            spellCheck="false"
            className={`w-full h-full bg-transparent outline-none resize-none leading-relaxed custom-scrollbar ${type === 'code' ? 'font-mono text-cyan-300/80 text-sm' : 'font-serif text-gray-400 text-lg'}`}
            placeholder="Start typing or let the agent synthesize content here..."
          />
        );
    }
  };

  return (
    <main className="relative flex-grow bg-black/20 flex flex-col overflow-hidden z-10 m-2 sm:m-4 rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.6)] border border-gray-800/40 backdrop-blur-md">
      {/* Workspace Tabs */}
      <div className="flex items-center justify-between bg-[#0d0d0d] border-b border-gray-800/60 p-1">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setWorkspace('CHAT')}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all rounded ${agentSettings.workspaceMode === 'CHAT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <MessageSquareIcon /> LINK_CHAT
          </button>
          <button 
            onClick={() => setWorkspace('PORTAL')}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all rounded ${agentSettings.workspaceMode === 'PORTAL' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <GlobeIcon /> NEURAL_PORTAL
          </button>
          <button 
            onClick={() => setWorkspace('CANVAS')}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-all rounded ${agentSettings.workspaceMode === 'CANVAS' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'text-gray-600 hover:text-gray-400'}`}
          >
            <Edit3Icon /> CANVAS_SYNC
          </button>
        </div>
        <div className="flex items-center gap-3 pr-4 text-[9px] text-gray-700 font-mono tracking-widest uppercase hidden lg:flex">
          <MonitorIcon className="text-emerald-900" /> STATUS: {agentSettings.workspaceMode}
        </div>
      </div>
      
      <div className="flex-grow flex flex-col relative overflow-hidden bg-black/10">
        {/* CHAT VIEW */}
        <div className={`absolute inset-0 flex flex-col p-4 sm:p-6 overflow-y-auto custom-scrollbar transition-opacity duration-300 ${agentSettings.workspaceMode === 'CHAT' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`} ref={scrollRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`group mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col ${msg.sender === 'YOU' ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-baseline gap-3 mb-1 ${msg.sender === 'YOU' ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className={`font-bold text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded-sm ${msg.sender === 'YOU' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`}>
                  {msg.sender === 'AGENT' ? agentSettings.agentName : msg.sender}:
                </span>
                <span className="text-[9px] text-gray-700 select-none tabular-nums">[{msg.timestamp}]</span>
              </div>
              
              <div className={`max-w-[85%] sm:max-w-[75%] px-4 border-l ${msg.sender === 'YOU' ? 'border-l-0 border-r text-right border-emerald-500/20' : 'border-l border-cyan-500/20'} mb-2`}>
                {msg.isImage ? (
                  <div className="relative group/img overflow-hidden rounded-lg border border-cyan-500/30 shadow-2xl cursor-pointer" onClick={() => onUpdateSettings({ ...agentSettings, canvas: { content: msg.text, type: 'image', title: 'Asset View' }, workspaceMode: 'CANVAS'})}>
                    <img src={msg.text} alt="Synth" className="max-w-full transition-transform duration-500 group-hover/img:scale-105" />
                  </div>
                ) : (
                  <div className="text-gray-300 whitespace-pre-wrap break-words text-xs sm:text-sm leading-relaxed">{msg.text}</div>
                )}
                {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {msg.groundingUrls.map((url, i) => (
                      <button key={i} onClick={() => mountPortal(url)} className="flex items-center gap-1.5 text-[9px] text-cyan-400 hover:text-white transition-all bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20 hover:border-cyan-400 shadow-sm">
                        <GlobeIcon /> OPEN_PORTAL_{i+1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isThinking && <div className="animate-pulse text-cyan-500/60 text-[10px] font-mono tracking-widest uppercase">Processing Neural Data...</div>}
        </div>

        {/* PORTAL VIEW */}
        <div className={`absolute inset-0 bg-[#050505] transition-opacity duration-300 ${agentSettings.workspaceMode === 'PORTAL' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}>
          <div className="h-full flex flex-col">
            <div className="bg-[#111] p-2 flex items-center gap-3 border-b border-gray-800">
              <div className="flex-grow bg-black/50 border border-gray-800 rounded px-3 py-1.5 flex items-center gap-3 overflow-hidden">
                <GlobeIcon className="text-cyan-600 flex-shrink-0" />
                <span className="text-[10px] text-gray-400 truncate font-mono uppercase tracking-widest">{agentSettings.portalUrl}</span>
              </div>
              <button onClick={() => window.open(agentSettings.portalUrl, '_blank')} className="text-gray-500 hover:text-cyan-400 p-1.5 transition-colors">
                <ExternalLinkIcon />
              </button>
            </div>
            <div className="flex-grow relative bg-[#0a0a0a]">
              <iframe src={agentSettings.portalUrl} className="w-full h-full border-none opacity-90 hover:opacity-100 transition-opacity" title="Neural Portal" />
            </div>
          </div>
        </div>

        {/* CANVAS VIEW */}
        <div className={`absolute inset-0 bg-[#080808] transition-opacity duration-300 ${agentSettings.workspaceMode === 'CANVAS' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}>
          <div className="h-full flex flex-col overflow-hidden">
            <div className="p-4 bg-[#111] border-b border-gray-800 flex justify-between items-center shadow-md">
              <div className="flex items-center gap-3">
                {agentSettings.canvas.type === 'code' ? <FileCodeIcon className="text-purple-400" /> : 
                 agentSettings.canvas.type === 'video' ? <VideoIcon className="text-red-400" /> :
                 agentSettings.canvas.type === 'image' ? <ImageIconComponent className="text-cyan-400" /> :
                 agentSettings.canvas.type === 'html' ? <LayoutIcon className="text-orange-400" /> : 
                 <FileTextIcon className="text-emerald-400" />}
                <span className="text-xs font-mono uppercase tracking-widest text-gray-400 font-bold">{agentSettings.canvas.title}</span>
              </div>
            </div>
            <div className="flex-grow relative p-6 sm:p-12 overflow-y-auto custom-scrollbar">
              <div className="max-w-5xl mx-auto w-full h-full">
                {renderCanvasContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Universal Input Bar - Redesigned with Send icon inside the typer */}
      <div className="relative z-40 p-4 border-t border-gray-800/50 bg-[#0a0a0a]/90 backdrop-blur-xl flex items-center gap-3">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileChange} 
          className="hidden" 
        />
        
        {/* typer / input field container */}
        <div className="flex-grow relative group">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className={`w-full bg-black/40 border border-gray-800 rounded px-4 py-3 pr-12 text-gray-200 placeholder:text-gray-700 font-mono text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 transition-all shadow-inner ${isRecordingSTT ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : ''}`} 
            placeholder={
              isRecordingSTT ? "Listening for neural broadcast..." :
              agentSettings.workspaceMode === 'PORTAL' ? "Send command to portal agent..." :
              agentSettings.workspaceMode === 'CANVAS' ? "Instruct workspace sync..." :
              "Enter neural directive..."
            } 
          />
          
          {/* Send Icon Inside Input */}
          <button 
            onClick={handleSend}
            disabled={isThinking || !inputText.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-400 disabled:text-gray-800 transition-colors p-1"
            title="Transmit Protocol"
          >
            <SendIcon className={!inputText.trim() ? "" : "glow-green"} />
          </button>

          {isRecordingSTT && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
            </div>
          )}
        </div>

        {/* Feature Icons Section */}
        <div className="flex items-center gap-1">
          {/* File Upload Icon */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-all border border-transparent hover:border-emerald-500/20"
            title="Upload Protocol Asset"
          >
            <PaperclipIcon />
          </button>

          {/* STS (Speech-to-Text) Mic Icon */}
          <button 
            onClick={onToggleSTT}
            className={`p-2.5 rounded transition-all border ${isRecordingSTT ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 border-transparent hover:border-cyan-500/20'}`}
            title="Neural Audio Transcribe"
          >
            {isRecordingSTT ? <MicOffIcon /> : <MicIcon />}
          </button>

          {/* Voice to Voice Conversation Icon */}
          <button 
            onClick={onToggleLive}
            className={`p-2.5 rounded transition-all border ${isLiveActive ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 border-transparent hover:border-purple-500/20'}`}
            title="Live Neural Uplink"
          >
            <RadioIcon className={isLiveActive ? 'animate-pulse' : ''} />
          </button>
        </div>
      </div>
    </main>
  );
};

export default ChatBox;
