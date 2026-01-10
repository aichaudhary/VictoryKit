
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

export type ViewState = 
  | 'home' 
  | 'fraud-guard' | 'intelli-scout' | 'threat-radar' | 'malware-hunter' | 'phish-guard'
  | 'vuln-scan' | 'pen-test-ai' | 'secure-code' | 'compliance-check' | 'data-guardian' | 'crypto-shield'
  | 'iam-control' | 'log-intel' | 'net-defender' | 'endpoint-shield' | 'cloud-secure'
  | 'api-guardian' | 'container-watch' | 'devsecops' | 'incident-command' | 'forensics-lab'
  | 'threat-intel' | 'behavior-watch' | 'anomaly-detect' | 'red-team-ai' | 'blue-team-ai'
  | 'siem-commander' | 'soar-engine' | 'risk-score-ai' | 'policy-engine' | 'audit-tracker'
  | 'zero-trust-ai' | 'password-vault' | 'biometric-ai' | 'email-guard' | 'web-filter'
  | 'dns-shield' | 'firewall-ai' | 'vpn-guardian' | 'wireless-watch' | 'iot-secure'
  | 'mobile-defend' | 'backup-guard' | 'dr-plan' | 'privacy-shield' | 'gdpr-compliance'
  | 'hipaa-guard' | 'pcidss-guard' | 'bug-bounty-ai' | 'cyber-edu-ai'
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
