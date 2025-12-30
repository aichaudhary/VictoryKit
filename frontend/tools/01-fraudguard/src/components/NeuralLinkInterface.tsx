import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bot, Shield } from 'lucide-react';

// Import neural link components and logic
import Header from '../../neural-link-interface/components/Header';
import Sidebar from '../../neural-link-interface/components/Sidebar';
import SettingsPanel from '../../neural-link-interface/components/SettingsPanel';
import ChatBox from '../../neural-link-interface/components/ChatBox';
import NavigationDrawer from '../../neural-link-interface/components/NavigationDrawer';
import Overlay from '../../neural-link-interface/components/Overlay';
import Footer from '../../neural-link-interface/components/Footer';

import {
  ChatSession,
  Message,
  SettingsState,
  NavItem,
  CanvasState,
  WorkspaceMode,
} from '../../neural-link-interface/types';
import { DEFAULT_SETTINGS, NEURAL_PRESETS } from '../../neural-link-interface/constants';
import { callGemini } from '../../neural-link-interface/services/geminiService';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

const NeuralLinkInterface: React.FC = () => {
  // UI State
  const [isOverlayActive, setIsOverlayActive] = useState(true);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecordingSTT, setIsRecordingSTT] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);

  // Gemini Live & STT Refs
  const recognitionRef = useRef<any>(null);
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  // App Data State - Enhanced with FraudGuard context
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('fraudguard_neural_sessions');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: '1',
        name: "FRAUDGUARD_NEURAL_LINK",
        active: true,
        messages: [
          {
            id: 'init-1',
            sender: 'AGENT',
            text: '🔒 FraudGuard Neural Link established. I have access to your fraud detection data, transaction analysis, and risk assessment tools. How can I help you with fraud detection today?',
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
        settings: {
          ...DEFAULT_SETTINGS,
          customPrompt: `You are an AI assistant integrated with FraudGuard - an AI-powered fraud detection system. You have access to:

- Transaction analysis and fraud scoring
- Risk assessment tools and indicators
- Alert management and rule configuration
- Historical transaction data and patterns
- Real-time fraud detection capabilities

Help users analyze transactions, configure alerts, interpret risk scores, and optimize their fraud detection strategies. Always provide actionable insights and explain technical concepts clearly.`,
          agentName: "FraudGuard AI Assistant"
        },
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('fraudguard_neural_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const activeSession = sessions.find((s) => s.active) || sessions[0];

  const handleSend = async (text: string) => {
    if (isThinking) return;

    const timestamp = new Date().toLocaleTimeString();
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "YOU",
      text,
      timestamp,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.active ? { ...s, messages: [...s.messages, userMsg] } : s
      )
    );

    setIsThinking(true);
    const result = await callGemini(text, activeSession.settings);
    setIsThinking(false);

    const settingsUpdate: Partial<SettingsState> = {};
    if (result.navigationUrl) {
      settingsUpdate.portalUrl = result.navigationUrl;
      settingsUpdate.workspaceMode = "PORTAL";
    }
    if (result.canvasUpdate) {
      settingsUpdate.canvas = {
        ...activeSession.settings.canvas,
        ...result.canvasUpdate,
      };
      settingsUpdate.workspaceMode = "CANVAS";
    }
    if (Object.keys(settingsUpdate).length > 0) {
      setSessions((prev) =>
        prev.map((s) =>
          s.active
            ? { ...s, settings: { ...s.settings, ...settingsUpdate } }
            : s
        )
      );
    }

    const agentMsg: Message = {
      id: Date.now().toString(),
      sender: "AGENT",
      text: result.response,
      timestamp: new Date().toLocaleTimeString(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.active ? { ...s, messages: [...s.messages, agentMsg] } : s
      )
    );
  };

  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `FraudGuard Session ${sessions.length + 1}`,
      active: true,
      messages: [
        {
          id: "init-" + Date.now(),
          sender: "AGENT",
          text: "New FraudGuard analysis session started. Ready to help with fraud detection.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
      settings: {
        ...DEFAULT_SETTINGS,
        customPrompt: activeSession.settings.customPrompt,
        agentName: activeSession.settings.agentName
      },
    };

    setSessions((prev) => prev.map((s) => ({ ...s, active: false })).concat(newSession));
  };

  const handleSessionSelect = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => ({ ...s, active: s.id === sessionId }))
    );
  };

  const handleSettingsUpdate = (updates: Partial<SettingsState>) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.active ? { ...s, settings: { ...s.settings, ...updates } } : s
      )
    );
  };

  const handleLiveStart = async () => {
    try {
      setIsLiveActive(true);
      // Live session implementation would go here
    } catch (error) {
      console.error("Failed to start live session:", error);
      setIsLiveActive(false);
    }
  };

  const handleLiveStop = () => {
    setIsLiveActive(false);
    // Cleanup live session
  };

  const handleSTTStart = () => {
    setIsRecordingSTT(true);
    // STT implementation would go here
  };

  const handleSTTStop = () => {
    setIsRecordingSTT(false);
    // STT cleanup
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* FraudGuard Context Header */}
      <div className="bg-gradient-to-r from-red-900/50 to-purple-900/50 border-b border-red-500/30 p-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to FraudGuard</span>
            </Link>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">FraudGuard AI Assistant</h2>
              <p className="text-xs text-gray-400">Neural Link Active - Full Context Access</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-400">
            <Bot className="w-4 h-4" />
            <span>Connected to FraudGuard Data</span>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOverlayActive && <Overlay onClose={() => setIsOverlayActive(false)} />}

      {/* Header */}
      <Header
        onMenuClick={() => setIsLeftPanelOpen(true)}
        onSettingsClick={() => setIsRightPanelOpen(true)}
        onNavClick={() => setIsNavDrawerOpen(true)}
        isLiveActive={isLiveActive}
        onLiveStart={handleLiveStart}
        onLiveStop={handleLiveStop}
        isRecordingSTT={isRecordingSTT}
        onSTTStart={handleSTTStart}
        onSTTStop={handleSTTStop}
      />

      {/* Main Content Area */}
      <div className="flex">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isLeftPanelOpen}
          onClose={() => setIsLeftPanelOpen(false)}
          sessions={sessions}
          activeSession={activeSession}
          onSessionSelect={handleSessionSelect}
          onNewSession={handleNewSession}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatBox
            messages={activeSession.messages}
            onSend={handleSend}
            isThinking={isThinking}
            settings={activeSession.settings}
            onSettingsUpdate={handleSettingsUpdate}
          />
        </div>

        {/* Right Settings Panel */}
        <SettingsPanel
          isOpen={isRightPanelOpen}
          onClose={() => setIsRightPanelOpen(false)}
          settings={activeSession.settings}
          onUpdate={handleSettingsUpdate}
        />

        {/* Navigation Drawer */}
        <NavigationDrawer
          isOpen={isNavDrawerOpen}
          onClose={() => setIsNavDrawerOpen(false)}
        />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NeuralLinkInterface;