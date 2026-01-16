// Tool Branding Configuration for Neural Link Interface
// Each tool gets its own branding when neural-link is accessed from their subdomain

export interface ToolBranding {
  id: string;
  name: string;
  tagline: string;
  primaryColor: string;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  icon: string; // emoji or icon name
  subdomain: string;
}

export const TOOL_BRANDINGS: Record<string, ToolBranding> = {
  fraudguard: {
    id: 'fraudguard',
    name: 'FraudGuard',
    tagline: 'AI-Powered Fraud Detection',
    primaryColor: '#ef4444',
    gradientFrom: 'from-red-600',
    gradientTo: 'to-orange-600',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30',
    bgColor: 'bg-red-500/10',
    icon: '🛡️',
    subdomain: 'fraudguard',
  },
  darkwebmonitor: {
    id: 'darkwebmonitor',
    name: 'DarkWebMonitor',
    tagline: 'Dark Web Intelligence',
    primaryColor: '#8b5cf6',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-violet-600',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10',
    icon: '🕵️',
    subdomain: 'darkwebmonitor',
  },
  zerodaydetect: {
    id: 'zerodaydetect',
    name: 'ZeroDayDetect',
    tagline: 'Zero-Day Vulnerability Detection',
    primaryColor: '#f59e0b',
    gradientFrom: 'from-amber-600',
    gradientTo: 'to-orange-600',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/10',
    icon: '⚠️',
    subdomain: 'zerodaydetect',
  },
  ransomshield: {
    id: 'ransomshield',
    name: 'RansomShield',
    tagline: 'Ransomware Protection',
    primaryColor: '#dc2626',
    gradientFrom: 'from-red-700',
    gradientTo: 'to-rose-600',
    textColor: 'text-red-500',
    borderColor: 'border-red-600/30',
    bgColor: 'bg-red-600/10',
    icon: '🔒',
    subdomain: 'ransomshield',
  },
  phishnetai: {
    id: 'phishnetai',
    name: 'PhishNetAI',
    tagline: 'AI Phishing Detection',
    primaryColor: '#06b6d4',
    gradientFrom: 'from-cyan-600',
    gradientTo: 'to-teal-600',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bgColor: 'bg-cyan-500/10',
    icon: '🎣',
    subdomain: 'phishnetai',
  },
  vulnscan: {
    id: 'vulnscan',
    name: 'VulnScan',
    tagline: 'Enterprise Vulnerability Scanner',
    primaryColor: '#f59e0b',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/10',
    icon: '🔍',
    subdomain: 'vulnscan',
  },
  // Default branding (fallback)
  default: {
    id: 'default',
    name: 'Neural Link',
    tagline: 'AI Security Assistant',
    primaryColor: '#22c55e',
    gradientFrom: 'from-green-600',
    gradientTo: 'to-emerald-600',
    textColor: 'text-green-400',
    borderColor: 'border-green-500/30',
    bgColor: 'bg-green-500/10',
    icon: '🧠',
    subdomain: 'maula',
  },
};

// Get branding based on current subdomain
export function getToolBranding(): ToolBranding {
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0].toLowerCase();

  // Check if we have branding for this subdomain
  if (TOOL_BRANDINGS[subdomain]) {
    return TOOL_BRANDINGS[subdomain];
  }

  // Check URL params as fallback (for testing)
  const params = new URLSearchParams(window.location.search);
  const toolParam = params.get('tool')?.toLowerCase();
  if (toolParam && TOOL_BRANDINGS[toolParam]) {
    return TOOL_BRANDINGS[toolParam];
  }

  return TOOL_BRANDINGS.default;
}
