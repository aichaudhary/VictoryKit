
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SettingsPanel from './components/SettingsPanel';
import ChatBox from './components/ChatBox';
import NavigationDrawer from './components/NavigationDrawer';
import Overlay from './components/Overlay';
import Footer from './components/Footer';
import { ChatSession, Message, SettingsState, NavItem } from './types';
import { DEFAULT_SETTINGS, NEURAL_PRESETS } from './constants';
import { callGemini } from './services/geminiService';

const App: React.FC = () => {
  // UI State
  const [isOverlayActive, setIsOverlayActive] = useState(true);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // App Data State
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('neural_sessions');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: '1',
        name: "PROTOCOL_INITIAL_CONTACT",
        active: true,
        messages: [
          { 
            id: 'init-1', 
            sender: 'AGENT', 
            text: 'Uplink established. Secure line verified. Neural link at 100% capacity. Workspace synchronized.', 
            timestamp: new Date().toLocaleTimeString() 
          }
        ],
        settings: { ...DEFAULT_SETTINGS }
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('neural_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const activeSession = sessions.find(s => s.active) || sessions[0];

  const handleSend = async (text: string) => {
    if (isThinking) return;

    const timestamp = new Date().toLocaleTimeString();
    const userMsg: Message = { id: Date.now().toString(), sender: 'YOU', text, timestamp };

    setSessions(prev => prev.map(s => 
      s.active ? { ...s, messages: [...s.messages, userMsg] } : s
    ));

    setIsThinking(true);
    const result = await callGemini(text, activeSession.settings);
    setIsThinking(false);

    // Atomic setting updates for UI reactivity
    const settingsUpdate: Partial<SettingsState> = {};
    
    if (result.navigationUrl) {
      settingsUpdate.portalUrl = result.navigationUrl;
      settingsUpdate.workspaceMode = 'PORTAL';
    }

    if (result.canvasUpdate) {
      settingsUpdate.canvas = { ...activeSession.settings.canvas, ...result.canvasUpdate };
      settingsUpdate.workspaceMode = 'CANVAS';
    }

    if (Object.keys(settingsUpdate).length > 0) {
      updateActiveSettings({ ...activeSession.settings, ...settingsUpdate } as SettingsState);
    }

    const agentMsg: Message = { 
      id: (Date.now() + 1).toString(), 
      sender: 'AGENT', 
      text: result.text, 
      timestamp: new Date().toLocaleTimeString(),
      isImage: result.isImage,
      groundingUrls: result.urls
    };

    setSessions(prev => prev.map(s => 
      s.active ? { ...s, messages: [...s.messages, agentMsg] } : s
    ));
  };

  const deleteSession = (id: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) return [
        {
          id: Date.now().toString(),
          name: "NEW_PROTOCOL",
          active: true,
          messages: [],
          settings: { ...DEFAULT_SETTINGS }
        }
      ];
      if (prev.find(s => s.id === id)?.active) {
        filtered[0].active = true;
      }
      return filtered;
    });
  };

  const handleApplyPreset = (type: string) => {
    const preset = NEURAL_PRESETS[type];
    if (!preset) return;

    const newSettings: SettingsState = {
      ...activeSession.settings,
      customPrompt: preset.prompt,
      temperature: preset.temp
    };

    setSessions(prev => prev.map(s => 
      s.active ? { 
        ...s, 
        settings: newSettings,
        messages: [...s.messages, {
          id: `sys-${Date.now()}`,
          sender: 'SYSTEM',
          text: `NEURAL_OVERRIDE: Preset [${type.toUpperCase()}] applied successfully.`,
          timestamp: new Date().toLocaleTimeString()
        }]
      } : s
    ));
  };

  const createNewSession = () => {
    const id = Date.now().toString();
    const newSession: ChatSession = {
      id,
      name: `PROTOCOL_LOG_${id.slice(-4)}`,
      active: true,
      messages: [{ 
        id: `init-${id}`, 
        sender: 'AGENT', 
        text: 'New neural channel opened. Workspace ready.', 
        timestamp: new Date().toLocaleTimeString() 
      }],
      settings: { ...DEFAULT_SETTINGS }
    };
    setSessions(prev => prev.map(s => ({ ...s, active: false })).concat(newSession));
    setIsLeftPanelOpen(false);
  };

  const selectSession = (id: string) => {
    setSessions(prev => prev.map(s => ({ ...s, active: s.id === id })));
    setIsLeftPanelOpen(false);
  };

  const clearMessages = () => {
    if (confirm("Protocol Wipe: Clear current session logs?")) {
      setSessions(prev => prev.map(s => s.active ? { ...s, messages: [] } : s));
    }
  };

  const resetFactory = () => {
    if (confirm("CRITICAL: Revert all neural parameters to factory default?")) {
      setSessions(prev => prev.map(s => s.active ? { 
        ...s, 
        settings: { ...DEFAULT_SETTINGS },
        messages: [...s.messages, {
          id: `sys-${Date.now()}`,
          sender: 'SYSTEM',
          text: 'FACTORY_RESET: Default parameters restored.',
          timestamp: new Date().toLocaleTimeString()
        }]
      } : s));
      setIsRightPanelOpen(false);
    }
  };

  const updateActiveSettings = (settings: SettingsState) => {
    setSessions(prev => prev.map(s => s.active ? { ...s, settings } : s));
  };

  const closeAllPanels = useCallback(() => {
    setIsLeftPanelOpen(false);
    setIsRightPanelOpen(false);
    setIsNavDrawerOpen(false);
  }, []);

  return (
    <div className="matrix-bg text-gray-300 h-screen flex flex-col overflow-hidden relative selection:bg-green-500/30 selection:text-white font-mono">
      <Overlay active={isOverlayActive} onActivate={() => setIsOverlayActive(false)} />

      <div className={`flex flex-col h-full transition-opacity duration-300 ${isNavDrawerOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <Header 
          onToggleLeft={() => { setIsLeftPanelOpen(!isLeftPanelOpen); setIsRightPanelOpen(false); }}
          onToggleRight={() => { setIsRightPanelOpen(!isRightPanelOpen); setIsLeftPanelOpen(false); }}
          onToggleNav={() => setIsNavDrawerOpen(!isNavDrawerOpen)}
          onClear={clearMessages}
          onLock={() => setIsOverlayActive(true)}
          leftOpen={isLeftPanelOpen}
          rightOpen={isRightPanelOpen}
        />

        <div className="flex-grow flex relative overflow-hidden z-10">
          {(isLeftPanelOpen || isRightPanelOpen) && (
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-[50] transition-opacity animate-in fade-in duration-300"
              onClick={closeAllPanels}
            ></div>
          )}

          <Sidebar 
            sessions={sessions} 
            onSelect={selectSession} 
            onCreate={createNewSession} 
            onDelete={deleteSession}
            isOpen={isLeftPanelOpen} 
          />

          <ChatBox 
            messages={activeSession.messages}
            isThinking={isThinking}
            onSend={handleSend}
            agentSettings={activeSession.settings}
            onUpdateSettings={updateActiveSettings}
          />

          <SettingsPanel 
            settings={activeSession.settings}
            onChange={updateActiveSettings}
            onApplyPreset={handleApplyPreset}
            onReset={resetFactory}
            isOpen={isRightPanelOpen}
          />
        </div>

        <Footer />
      </div>

      <NavigationDrawer 
        isOpen={isNavDrawerOpen} 
        onClose={() => setIsNavDrawerOpen(false)}
        onModuleSelect={(item: NavItem) => {
          let instruction = DEFAULT_SETTINGS.customPrompt;
          let mode: SettingsState['workspaceMode'] = 'CHAT';
          
          switch(item.tool) {
            case 'browser': 
              instruction = "You are an advanced web portal agent. Help the user navigate sites. Use 'navigate_portal' for links."; 
              mode = 'PORTAL';
              break;
            case 'canvas': 
              instruction = "You are a creative collaborative editor. You have direct access to the Neural Canvas. Use 'update_canvas' to write stories, code, or layouts for the user."; 
              mode = 'CANVAS';
              break;
            case 'image_gen': instruction = "You are a visual artist. Synthesis module active."; break;
            case 'thinking': instruction = "Provide deep, step-by-step reasoning."; break;
            case 'deep_research': instruction = "Perform exhaustive analysis and provide reports."; break;
            case 'web_search': instruction = "Access real-time information with search grounding."; break;
            case 'shopping': instruction = "Find products and compare prices using the portal."; break;
            case 'study': instruction = "Break down complex topics using analogies."; break;
            case 'quizzes': instruction = "Evaluate user knowledge with interactive assessments."; break;
          }

          setSessions(prev => prev.map(s => s.active ? {
            ...s,
            settings: { 
              ...s.settings, 
              activeTool: item.tool,
              customPrompt: instruction,
              workspaceMode: mode
            },
            messages: [...s.messages, {
              id: `sys-${Date.now()}`,
              sender: 'SYSTEM',
              text: `NEURAL_WORKSPACE: Protocol [${item.label.toUpperCase()}] active. Mode: ${mode}.`,
              timestamp: new Date().toLocaleTimeString()
            }]
          } : s));
          setIsNavDrawerOpen(false);
        }}
      />
    </div>
  );
};

export default App;
