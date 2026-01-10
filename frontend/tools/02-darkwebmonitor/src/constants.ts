import { SettingsState, NavItem } from "./types";

export const PROVIDER_CONFIG = [
  {
    id: "gemini",
    name: "Google Gemini",
    models: [
      "gemini-3-flash-preview",
      "gemini-3-pro-preview",
      "gemini-2.5-flash-lite-latest",
      "gemini-2.5-flash-native-audio-preview-09-2025",
      "gemini-2.5-flash-image",
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4-turbo", "o1-preview", "gpt-4o-mini"],
  },
];

export const DEFAULT_SETTINGS: SettingsState = {
  customPrompt:
    "You are DarkWebMonitor AI, an expert in cyber threat intelligence, OSINT analysis, and security research. You help users gather, analyze, and correlate threat intelligence from multiple sources including dark web monitoring, threat feeds, and open-source intelligence. You can identify indicators of compromise (IOCs), track threat actors, and provide actionable intelligence recommendations.",
  agentName: "DarkWebMonitor AI",
  temperature: 0.7,
  maxTokens: 2048,
  provider: "gemini",
  model: "gemini-3-flash-preview",
  activeTool: "none",
  workspaceMode: "CHAT",
  portalUrl: "https://www.google.com/search?igu=1",
  canvas: {
    content:
      "// AGENT_DIRECTIVE: Threat Intelligence Workspace Active.\n\nReady for intelligence gathering and analysis.",
    type: "text",
    title: "Intel_Canvas_01",
  },
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Create Image",
    icon: "🎨",
    tool: "image_gen",
    description: "Visual synthesis module",
  },
  {
    label: "Thinking",
    icon: "💡",
    tool: "thinking",
    description: "Chain-of-thought processing",
  },
  {
    label: "Deep Research",
    icon: "🔭",
    tool: "deep_research",
    description: "Multi-layer semantic analysis",
  },
  {
    label: "Web Portal",
    icon: "🌐",
    tool: "browser",
    description: "Interactive web integration",
  },
  {
    label: "Study and Learn",
    icon: "📚",
    tool: "study",
    description: "Pedagogical core enabled",
  },
  {
    label: "Web Search",
    icon: "🔍",
    tool: "web_search",
    description: "Real-time global grounding",
  },
  {
    label: "Canvas",
    icon: "🖌️",
    tool: "canvas",
    description: "Creative writing workspace",
  },
  {
    label: "Quizzes",
    icon: "📝",
    tool: "quizzes",
    description: "Knowledge testing protocol",
  },
];

export const API_ENDPOINTS = {
  // Production endpoints - use /api proxy for subdomain deployment
  DARKWEBMONITOR_API: "/api",
  ML_API: "/api/ml",
  AI_API: "/api/ai",
  WS_URL: typeof window !== 'undefined' 
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`
    : "ws://localhost:4002/ws",
};

export const NEURAL_PRESETS: Record<string, { prompt: string; temp: number }> =
  {
    analyst: {
      prompt:
        "You are a senior threat intelligence analyst. Provide detailed technical analysis with IOC correlations and MITRE ATT&CK mappings.",
      temp: 0.5,
    },
    researcher: {
      prompt:
        "You are a security researcher specializing in threat hunting. Focus on identifying patterns and emerging threats.",
      temp: 0.6,
    },
    executive: {
      prompt:
        "You are providing executive-level threat briefings. Summarize threats with business impact and strategic recommendations.",
      temp: 0.4,
    },
    osint: {
      prompt:
        "You are an OSINT specialist. Focus on open-source intelligence gathering techniques and source validation.",
      temp: 0.7,
    },
  };

export const THREAT_TYPES = [
  { value: "malware", label: "Malware", color: "red" },
  { value: "phishing", label: "Phishing", color: "orange" },
  { value: "ransomware", label: "Ransomware", color: "purple" },
  { value: "apt", label: "APT", color: "red" },
  { value: "botnet", label: "Botnet", color: "yellow" },
  { value: "exploit", label: "Exploit", color: "pink" },
  { value: "vulnerability", label: "Vulnerability", color: "blue" },
  { value: "data_leak", label: "Data Leak", color: "cyan" },
  { value: "other", label: "Other", color: "gray" },
];

export const SOURCE_TYPES = [
  { value: "osint", label: "OSINT", icon: "🌐" },
  { value: "darkweb", label: "Dark Web", icon: "🕸️" },
  { value: "social_media", label: "Social Media", icon: "📱" },
  { value: "threat_feed", label: "Threat Feed", icon: "📡" },
  { value: "honeypot", label: "Honeypot", icon: "🍯" },
  { value: "ioc", label: "IOC Feed", icon: "🎯" },
  { value: "other", label: "Other", icon: "📋" },
];

export const SEVERITY_COLORS = {
  CRITICAL: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/50",
  },
  HIGH: {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    border: "border-orange-500/50",
  },
  MEDIUM: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-400",
    border: "border-yellow-500/50",
  },
  LOW: {
    bg: "bg-green-500/20",
    text: "text-green-400",
    border: "border-green-500/50",
  },
};

export const MITRE_TACTICS = [
  "Reconnaissance",
  "Resource Development",
  "Initial Access",
  "Execution",
  "Persistence",
  "Privilege Escalation",
  "Defense Evasion",
  "Credential Access",
  "Discovery",
  "Lateral Movement",
  "Collection",
  "Command and Control",
  "Exfiltration",
  "Impact",
];
