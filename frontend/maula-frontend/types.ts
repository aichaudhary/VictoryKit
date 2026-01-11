
export interface SecurityTool {
  id: number;
  name: string;
  description: string;
  category: string;
  stats: {
    threatsBlocked: string;
    uptime: string;
    accuracy: string;
  };
  imageUrl: string;
  theme: {
    primary: string;    // e.g., 'purple-500'
    secondary: string;  // e.g., 'pink-500'
    glow: string;       // hex or rgba for drop shadows
    bgStop: string;     // bg-color stop for gradient shifts
  };
}

// Routes match official tool names from tools.ts (ID 1-50)
export type ViewState = 
  | 'home' 
  // Tools 1-10
  | 'fraud-guard' | 'dark-web-monitor' | 'zero-day-detect' | 'ransom-shield' | 'phish-net-ai'
  | 'vuln-scan' | 'pen-test-ai' | 'code-sentinel' | 'runtime-guard' | 'data-guardian'
  // Tools 11-20
  | 'incident-response' | 'xdr-platform' | 'identity-forge' | 'secret-vault' | 'privilege-guard'
  | 'network-forensics' | 'audit-trail-pro' | 'threat-model' | 'risk-quantify' | 'security-dashboard'
  // Tools 21-30
  | 'waf-manager' | 'api-shield' | 'bot-mitigation' | 'ddos-defender' | 'ssl-monitor'
  | 'blue-team-ai' | 'siem-commander' | 'soar-engine' | 'behavior-analytics' | 'policy-engine'
  // Tools 31-40
  | 'cloud-posture' | 'zero-trust' | 'kube-armor' | 'container-scan' | 'email-defender'
  | 'browser-isolation' | 'dns-firewall' | 'firewall-ai' | 'vpn-analyzer' | 'wireless-hunter'
  // Tools 41-50
  | 'dlp-advanced' | 'iot-sentinel' | 'mobile-shield' | 'supply-chain-ai' | 'dr-plan'
  | 'privacy-shield' | 'gdpr-compliance' | 'hipaa-guard' | 'soc2-automator' | 'iso-27001'
  | 'products' | 'solutions' | 'docs' | 'pricing'
  | 'about-us' | 'careers' | 'press-kit' | 'contact'
  | 'privacy-policy' | 'terms-of-service' | 'security-disclosure' | 'global-shield-detail'
  | 'dashboard' | 'dashboard-marketplace' | 'dashboard-fleet' | 'dashboard-analytics' | 'dashboard-billing' | 'dashboard-settings' | 'dashboard-logs'
  | 'dashboard-api-keys' | 'dashboard-admin-hierarchy' | 'dashboard-sovereignty'
  | 'login' | 'signup' | 'forgot' | 'reset';

export interface ScrollContextType {
  currentSection: number;
  scrollProgress: number;
  isScrolling: boolean;
  totalSections: number;
  currentTheme: string;
  view: ViewState;
  activeToolId: number | null;
  setCurrentSection: (index: number) => void;
  setScrollProgress: (progress: number) => void;
  setIsScrolling: (status: boolean) => void;
  setView: (view: ViewState, toolId?: number) => void;
}
