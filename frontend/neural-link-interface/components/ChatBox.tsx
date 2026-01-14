import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Radio, MicOff, Paperclip } from 'lucide-react';
import { Message, SettingsState } from '../types';

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
  onUpdateSettings,
}) => {
  const [inputText, setInputText] = useState('');
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
    setInputText('');
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <main className="relative flex-grow bg-black/20 flex flex-col overflow-hidden z-10 m-2 sm:m-4 rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.6)] border border-gray-800/40 backdrop-blur-md">
      <div className="flex-grow flex flex-col relative overflow-hidden bg-black/10">
        {/* CHAT VIEW */}
        <div
          className="absolute inset-0 flex flex-col p-4 sm:p-6 overflow-y-auto custom-scrollbar"
          ref={scrollRef}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`group mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col ${msg.sender === 'YOU' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`flex items-baseline gap-3 mb-1 ${msg.sender === 'YOU' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <span
                  className={`font-bold text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded-sm ${msg.sender === 'YOU' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`}
                >
                  {msg.sender === 'AGENT' ? agentSettings.agentName : msg.sender}:
                </span>
                <span className="text-[9px] text-gray-700 select-none tabular-nums">
                  [{msg.timestamp}]
                </span>
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] px-4 border-l ${msg.sender === 'YOU' ? 'border-l-0 border-r text-right border-emerald-500/20' : 'border-l border-cyan-500/20'} mb-2`}
              >
                {msg.isImage ? (
                  <div className="relative group/img overflow-hidden rounded-lg border border-cyan-500/30 shadow-2xl">
                    <img
                      src={msg.text}
                      alt="Synth"
                      className="max-w-full transition-transform duration-500 group-hover/img:scale-105"
                    />
                  </div>
                ) : (
                  <div className="text-gray-300 whitespace-pre-wrap break-words text-xs sm:text-sm leading-relaxed">
                    {msg.text}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="animate-pulse text-cyan-500/60 text-[10px] font-mono tracking-widest uppercase">
              Processing Neural Data...
            </div>
          )}
        </div>
      </div>

      {/* Universal Input Bar - Redesigned with Send icon inside the typer */}
      <div className="relative z-40 p-4 border-t border-gray-800/50 bg-[#0a0a0a]/90 backdrop-blur-xl flex items-center gap-3">
        <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" />

        {/* typer / input field container */}
        <div className="flex-grow relative group">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className={`w-full bg-black/40 border border-gray-800 rounded px-4 py-3 pr-12 text-gray-200 placeholder:text-gray-700 font-mono text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 transition-all shadow-inner ${isRecordingSTT ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : ''}`}
            placeholder={
              isRecordingSTT ? 'Listening for neural broadcast...' : 'Enter neural directive...'
            }
          />

          {/* Send Icon Inside Input */}
          <button
            onClick={handleSend}
            disabled={isThinking || !inputText.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-400 disabled:text-gray-800 transition-colors p-1"
            title="Transmit Protocol"
          >
            <Send size={18} className={!inputText.trim() ? '' : 'glow-green'} />
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
            <Paperclip size={20} />
          </button>

          {/* STS (Speech-to-Text) Mic Icon */}
          <button
            onClick={onToggleSTT}
            className={`p-2.5 rounded transition-all border ${isRecordingSTT ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 border-transparent hover:border-cyan-500/20'}`}
            title="Neural Audio Transcribe"
          >
            {isRecordingSTT ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Voice to Voice Conversation Icon */}
          <button
            onClick={onToggleLive}
            className={`p-2.5 rounded transition-all border ${isLiveActive ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 border-transparent hover:border-purple-500/20'}`}
            title="Live Neural Uplink"
          >
            <Radio size={20} className={isLiveActive ? 'animate-pulse' : ''} />
          </button>
        </div>
      </div>
    </main>
  );
};

export default ChatBox;
