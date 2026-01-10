
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
  // Tools 1-50 (2026 Rebranded)
  | 'fraudguard' | 'darkwebmonitor' | 'zerodaydetect' | 'ransomshield' | 'phishnetai'
  | 'vulnscan' | 'pentestai' | 'codesentinel' | 'runtimeguard' | 'dataguardian'
  | 'incidentresponse' | 'xdrplatform' | 'identityforge' | 'secretvault' | 'privilegeguard'
  | 'networkforensics' | 'audittrailpro' | 'threatmodel' | 'riskquantify' | 'securitydashboard'
  | 'wafmanager' | 'apishield' | 'botmitigation' | 'ddosdefender' | 'sslmonitor'
  | 'blueteamai' | 'siemcommander' | 'soarengine' | 'behavioranalytics' | 'policyengine'
  | 'cloudposture' | 'zerotrust' | 'kubearmor' | 'containerscan' | 'emaildefender'
  | 'browserisolation' | 'dnsfirewall' | 'firewallai' | 'vpnanalyzer' | 'wirelesshunter'
  | 'dlpadvanced' | 'iotsentinel' | 'mobileshield' | 'supplychainai' | 'drplan'
  | 'privacyshield' | 'gdprcompliance' | 'hipaaguard' | 'soc2automator' | 'iso27001'
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
