import React, { useState, useEffect } from "react";

// Import neural link components and logic from shared location
import Header from "../../../../neural-link-interface/components/Header";
import Sidebar from "../../../../neural-link-interface/components/Sidebar";
import SettingsPanel from "../../../../neural-link-interface/components/SettingsPanel";
import ChatBox from "../../../../neural-link-interface/components/ChatBox";
import NavigationDrawer from "../../../../neural-link-interface/components/NavigationDrawer";
import Overlay from "../../../../neural-link-interface/components/Overlay";
import Footer from "../../../../neural-link-interface/components/Footer";

import {
  ChatSession,
  Message,
  SettingsState,
} from "../../../../neural-link-interface/types";
import { DEFAULT_SETTINGS } from "../../../../neural-link-interface/constants";
import { callGemini } from "../../../../neural-link-interface/services/geminiService";

const NeuralLinkInterface: React.FC = () => {
  // UI State
  const [isOverlayActive, setIsOverlayActive] = useState(true);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecordingSTT, setIsRecordingSTT] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);

  // App Data State - Enhanced with IntelliScout context
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("intelliscout_neural_sessions");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "1",
        name: "INTELLISCOUT_NEURAL_LINK",
        active: true,
        messages: [
          {
            id: "init-1",
            sender: "AGENT",
            text: "🔍 IntelliScout Neural Link established. I have access to threat intelligence databases, OSINT tools, IOC correlation engines, and dark web monitoring systems. How can I assist with your intelligence gathering today?",
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
        settings: {
          ...DEFAULT_SETTINGS,
          customPrompt: `You are IntelliScout AI, an advanced threat intelligence assistant integrated with the IntelliScout platform. You have access to:

- Threat intelligence feeds and databases
- OSINT (Open Source Intelligence) gathering tools
- IOC (Indicators of Compromise) correlation engines
- Dark web monitoring and analysis
- MITRE ATT&CK framework mapping
- Threat actor profiling and tracking
- Campaign analysis and attribution
- Vulnerability intelligence databases

Help users gather and analyze threat intelligence, correlate indicators, identify threat actors, and provide actionable security recommendations. Always cite sources when possible and explain confidence levels in your analysis.`,
          agentName: "IntelliScout AI Assistant",
        },
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem(
      "intelliscout_neural_sessions",
      JSON.stringify(sessions)
    );
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
      text: result.text,
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
      name: `IntelliScout Session ${sessions.length + 1}`,
      active: true,
      messages: [
        {
          id: "init-" + Date.now(),
          sender: "AGENT",
          text: "New intelligence gathering session started. Ready to assist with threat intelligence analysis.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
      settings: {
        ...DEFAULT_SETTINGS,
        customPrompt: activeSession.settings.customPrompt,
        agentName: activeSession.settings.agentName,
      },
    };

    setSessions((prev) =>
      prev.map((s) => ({ ...s, active: false })).concat(newSession)
    );
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

  const handleToggleSTT = () => {
    if (isRecordingSTT) {
      handleSTTStop();
    } else {
      handleSTTStart();
    }
  };

  const handleToggleLive = () => {
    if (isLiveActive) {
      handleLiveStop();
    } else {
      handleLiveStart();
    }
  };

  const handleFileUpload = (file: File) => {
    // File upload implementation would go here
    console.log("File uploaded:", file.name);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Overlay */}
      {isOverlayActive && (
        <Overlay
          active={isOverlayActive}
          onActivate={() => setIsOverlayActive(false)}
        />
      )}

      {/* Header */}
      <Header
        onToggleLeft={() => setIsLeftPanelOpen(true)}
        onToggleRight={() => setIsRightPanelOpen(true)}
        onToggleNav={() => setIsNavDrawerOpen(true)}
        onClear={() => {
          // Clear current session messages
          setSessions((prev) =>
            prev.map((s) => (s.active ? { ...s, messages: [] } : s))
          );
        }}
        onLock={() => {
          // Lock/unlock functionality
          console.log("Lock toggled");
        }}
        leftOpen={isLeftPanelOpen}
        rightOpen={isRightPanelOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar
          sessions={sessions}
          onSelect={handleSessionSelect}
          onCreate={handleNewSession}
          onDelete={(sessionId) => {
            setSessions((prev) => prev.filter((s) => s.id !== sessionId));
          }}
          isOpen={isLeftPanelOpen}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <ChatBox
            messages={activeSession.messages}
            onSend={handleSend}
            isThinking={isThinking}
            isRecordingSTT={isRecordingSTT}
            isLiveActive={isLiveActive}
            onFileUpload={handleFileUpload}
            onToggleSTT={handleToggleSTT}
            onToggleLive={handleToggleLive}
            agentSettings={activeSession.settings}
            onUpdateSettings={handleSettingsUpdate}
          />
        </div>

        {/* Right Settings Panel */}
        <SettingsPanel
          settings={activeSession.settings}
          onChange={handleSettingsUpdate}
          onApplyPreset={(type) => {
            // Apply preset functionality
            console.log("Applying preset:", type);
          }}
          onReset={() => {
            // Reset settings
            handleSettingsUpdate(DEFAULT_SETTINGS);
          }}
          isOpen={isRightPanelOpen}
        />

        {/* Navigation Drawer */}
        <NavigationDrawer
          isOpen={isNavDrawerOpen}
          onClose={() => setIsNavDrawerOpen(false)}
          onModuleSelect={(item) => {
            // Handle module selection
            console.log("Module selected:", item);
          }}
        />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NeuralLinkInterface;
