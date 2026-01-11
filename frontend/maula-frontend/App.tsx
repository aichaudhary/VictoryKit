
import React, { useEffect, useRef } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import OptimizedToolSection from './components/OptimizedToolSection';
import SideNavigation from './components/SideNavigation';
import Footer from './components/Footer';
import AIInterface from './components/AIInterface';
import AtmosphericTransition from './components/AtmosphericTransition';

// Auth Components
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';

// Tools 1-50 (names match official tool names from tools.ts)
import FraudGuardDetail from './pages/FraudGuardDetail';
import DarkWebMonitorDetail from './pages/DarkWebMonitorDetail';
import ZeroDayDetectDetail from './pages/ZeroDayDetectDetail';
import RansomShieldDetail from './pages/RansomShieldDetail';
import PhishNetAIDetail from './pages/PhishNetAIDetail';
import VulnScanDetail from './pages/VulnScanDetail';
import PenTestAIDetail from './pages/PenTestAIDetail';
import CodeSentinelDetail from './pages/CodeSentinelDetail';
import RuntimeGuardDetail from './pages/RuntimeGuardDetail';
import DataGuardianDetail from './pages/DataGuardianDetail';
import IncidentResponseDetail from './pages/IncidentResponseDetail';
import XDRPlatformDetail from './pages/XDRPlatformDetail';
import IdentityForgeDetail from './pages/IdentityForgeDetail';
import SecretVaultDetail from './pages/SecretVaultDetail';
import PrivilegeGuardDetail from './pages/PrivilegeGuardDetail';
import NetworkForensicsDetail from './pages/NetworkForensicsDetail';
import AuditTrailProDetail from './pages/AuditTrailProDetail';
import ThreatModelDetail from './pages/ThreatModelDetail';
import RiskQuantifyDetail from './pages/RiskQuantifyDetail';
import SecurityDashboardDetail from './pages/SecurityDashboardDetail';
import WAFManagerDetail from './pages/WAFManagerDetail';
import APIShieldDetail from './pages/APIShieldDetail';
import BotMitigationDetail from './pages/BotMitigationDetail';
import DDoSDefenderDetail from './pages/DDoSDefenderDetail';
import SSLMonitorDetail from './pages/SSLMonitorDetail';
import BlueTeamAIDetail from './pages/BlueTeamAIDetail';
import SIEMCommanderDetail from './pages/SIEMCommanderDetail';
import SOAREngineDetail from './pages/SOAREngineDetail';
import BehaviorAnalyticsDetail from './pages/BehaviorAnalyticsDetail';
import PolicyEngineDetail from './pages/PolicyEngineDetail';
import CloudPostureDetail from './pages/CloudPostureDetail';
import ZeroTrustDetail from './pages/ZeroTrustDetail';
import KubeArmorDetail from './pages/KubeArmorDetail';
import ContainerScanDetail from './pages/ContainerScanDetail';
import EmailDefenderDetail from './pages/EmailDefenderDetail';
import BrowserIsolationDetail from './pages/BrowserIsolationDetail';
import DNSFirewallDetail from './pages/DNSFirewallDetail';
import FirewallAIDetail from './pages/FirewallAIDetail';
import VPNAnalyzerDetail from './pages/VPNAnalyzerDetail';
import WirelessHunterDetail from './pages/WirelessHunterDetail';
import DLPAdvancedDetail from './pages/DLPAdvancedDetail';
import IoTSentinelDetail from './pages/IoTSentinelDetail';
import MobileShieldDetail from './pages/MobileShieldDetail';
import SupplyChainAIDetail from './pages/SupplyChainAIDetail';
import DRPlanDetail from './pages/DRPlanDetail';
import PrivacyShieldDetail from './pages/PrivacyShieldDetail';
import GDPRComplianceDetail from './pages/GDPRComplianceDetail';
import HIPAAGuardDetail from './pages/HIPAAGuardDetail';
import SOC2AutomatorDetail from './pages/SOC2AutomatorDetail';
import ISO27001Detail from './pages/ISO27001Detail';

// Organizational Pages
import ProductsPage from './pages/ProductsPage';
import SolutionsPage from './pages/SolutionsPage';
import DocsPage from './pages/DocsPage';
import PricingPage from './pages/PricingPage';
import { AboutUs, Careers, Contact, GlobalShieldDetail, LegalPage } from './pages/StaticDetailPages';

// Dashboard
import Dashboard from './pages/Dashboard';
import APIAccessKeys from './pages/APIAccessKeys';
import AdminHierarchy from './pages/AdminHierarchy';
import SovereigntyNodes from './pages/SovereigntyNodes';

import { ScrollProvider, useScroll } from './context/ScrollContext';
import { tools } from './data/tools';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MainContent: React.FC = () => {
  const { currentSection, view } = useScroll();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });
    gsap.defaults({ ease: 'power3.out', duration: 1.2 });
    window.onload = () => { ScrollTrigger.refresh(); };
  }, []);

  useEffect(() => {
    if (!mainRef.current) return;

    let nextColor = '#02000a';
    // Identity & Access themed views (purple)
    if (['identity-forge', 'zero-trust', 'kube-armor', 'container-scan', 'privilege-guard', 'secret-vault'].includes(view)) {
      nextColor = '#040412';
    // Incident Response themed views (orange)
    } else if (['incident-response', 'security-dashboard', 'waf-manager', 'behavior-analytics', 'ddos-defender', 'dr-plan', 'iso-27001'].includes(view)) {
      nextColor = '#0d0503';
    // Network Security themed views (green)
    } else if (['network-forensics', 'email-defender', 'browser-isolation', 'dns-firewall', 'firewall-ai', 'vpn-analyzer', 'wireless-hunter', 'mobile-shield'].includes(view)) {
      nextColor = '#040d0a';
    // Threat Detection themed views (red)
    } else if (['fraud-guard', 'dark-web-monitor', 'zero-day-detect', 'ransom-shield', 'phish-net-ai', 'xdr-platform', 'threat-model'].includes(view)) {
      nextColor = '#0d0404';
    // Cloud Security themed views (cyan)
    } else if (['cloud-posture', 'api-shield', 'bot-mitigation', 'supply-chain-ai', 'iot-sentinel', 'code-sentinel', 'runtime-guard'].includes(view)) {
      nextColor = '#040d12';
    // AI-Powered themed views (purple)
    } else if (['ssl-monitor', 'blue-team-ai', 'siem-commander', 'soar-engine', 'risk-quantify', 'soc2-automator', 'pen-test-ai'].includes(view)) {
      nextColor = '#08040d';
    // Compliance themed views (amber)
    } else if (['policy-engine', 'audit-trail-pro', 'gdpr-compliance', 'hipaa-guard', 'dlp-advanced', 'vuln-scan'].includes(view)) {
      nextColor = '#0d0a04';
    // Data Protection themed views (blue)
    } else if (['privacy-shield', 'data-guardian'].includes(view)) {
      nextColor = '#04080d';
    } else if (view === 'dashboard-api-keys') {
      nextColor = '#02001a';
    } else if (view === 'dashboard-admin-hierarchy') {
      nextColor = '#020a02';
    } else if (view === 'dashboard-sovereignty') {
      nextColor = '#0d0a02';
    } else if (view.startsWith('dashboard')) {
      nextColor = '#02000a';
    } else if (currentSection >= 0) {
      nextColor = tools[currentSection]?.theme?.bgStop || '#02000a';
    }

    gsap.to(mainRef.current, {
      backgroundColor: nextColor,
      duration: 1,
      ease: 'sine.inOut',
      overwrite: 'auto'
    });
  }, [currentSection, view]);

  // Unified View Routing
  const renderView = () => {
    switch (view) {
      case 'login':
        return <LoginView />;
      case 'signup':
        return <SignUpView />;
      case 'forgot':
        return <ForgotPasswordView />;
      case 'reset':
        return <ResetPasswordView />;
      case 'dashboard':
      case 'dashboard-marketplace':
      case 'dashboard-fleet':
      case 'dashboard-analytics':
      case 'dashboard-billing':
      case 'dashboard-settings':
      case 'dashboard-logs':
        return <Dashboard />;
      case 'dashboard-api-keys': return <APIAccessKeys />;
      case 'dashboard-admin-hierarchy': return <AdminHierarchy />;
      case 'dashboard-sovereignty': return <SovereigntyNodes />;
      case 'products': return <ProductsPage />;
      case 'solutions': return <SolutionsPage />;
      case 'docs': return <DocsPage />;
      case 'pricing': return <PricingPage />;
      case 'about-us': return <AboutUs />;
      case 'careers': return <Careers />;
      case 'press-kit': return <LegalPage title="Press Kit" />;
      case 'contact': return <Contact />;
      case 'privacy-policy': return <LegalPage title="Privacy Policy" />;
      case 'terms-of-service': return <LegalPage title="Terms of Service" />;
      case 'security-disclosure': return <LegalPage title="Security Disclosure" />;
      case 'global-shield-detail': return <GlobalShieldDetail />;
      case 'fraud-guard': return <FraudGuardDetail />;
      case 'dark-web-monitor': return <DarkWebMonitorDetail />;
      case 'zero-day-detect': return <ZeroDayDetectDetail />;
      case 'ransom-shield': return <RansomShieldDetail />;
      case 'phish-net-ai': return <PhishNetAIDetail />;
      case 'vuln-scan': return <VulnScanDetail />;
      case 'pen-test-ai': return <PenTestAIDetail />;
      case 'code-sentinel': return <CodeSentinelDetail />;
      case 'runtime-guard': return <RuntimeGuardDetail />;
      case 'data-guardian': return <DataGuardianDetail />;
      case 'incident-response': return <IncidentResponseDetail />;
      case 'xdr-platform': return <XDRPlatformDetail />;
      case 'identity-forge': return <IdentityForgeDetail />;
      case 'secret-vault': return <SecretVaultDetail />;
      case 'privilege-guard': return <PrivilegeGuardDetail />;
      case 'network-forensics': return <NetworkForensicsDetail />;
      case 'audit-trail-pro': return <AuditTrailProDetail />;
      case 'threat-model': return <ThreatModelDetail />;
      case 'risk-quantify': return <RiskQuantifyDetail />;
      case 'security-dashboard': return <SecurityDashboardDetail />;
      case 'waf-manager': return <WAFManagerDetail />;
      case 'api-shield': return <APIShieldDetail />;
      case 'bot-mitigation': return <BotMitigationDetail />;
      case 'ddos-defender': return <DDoSDefenderDetail />;
      case 'ssl-monitor': return <SSLMonitorDetail />;
      case 'blue-team-ai': return <BlueTeamAIDetail />;
      case 'siem-commander': return <SIEMCommanderDetail />;
      case 'soar-engine': return <SOAREngineDetail />;
      case 'behavior-analytics': return <BehaviorAnalyticsDetail />;
      case 'policy-engine': return <PolicyEngineDetail />;
      case 'cloud-posture': return <CloudPostureDetail />;
      case 'zero-trust': return <ZeroTrustDetail />;
      case 'kube-armor': return <KubeArmorDetail />;
      case 'container-scan': return <ContainerScanDetail />;
      case 'email-defender': return <EmailDefenderDetail />;
      case 'browser-isolation': return <BrowserIsolationDetail />;
      case 'dns-firewall': return <DNSFirewallDetail />;
      case 'firewall-ai': return <FirewallAIDetail />;
      case 'vpn-analyzer': return <VPNAnalyzerDetail />;
      case 'wireless-hunter': return <WirelessHunterDetail />;
      case 'dlp-advanced': return <DLPAdvancedDetail />;
      case 'iot-sentinel': return <IoTSentinelDetail />;
      case 'mobile-shield': return <MobileShieldDetail />;
      case 'supply-chain-ai': return <SupplyChainAIDetail />;
      case 'dr-plan': return <DRPlanDetail />;
      case 'privacy-shield': return <PrivacyShieldDetail />;
      case 'gdpr-compliance': return <GDPRComplianceDetail />;
      case 'hipaa-guard': return <HIPAAGuardDetail />;
      case 'soc2-automator': return <SOC2AutomatorDetail />;
      case 'iso-27001': return <ISO27001Detail />;
      default: return null;
    }
  };

  const activeView = renderView();
  if (activeView) return activeView;

  return (
    <div 
      ref={mainRef}
      className="text-white selection:bg-white/10 relative min-h-screen transition-none"
      style={{ backgroundColor: '#02000a' }}
    >
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-[999]" />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent via-[#02000a]/30 to-[#02000a]/90 z-0" />

      <Header />
      <SideNavigation />
      
      <AIInterface onUpdateImage={() => {}} />
      <AtmosphericTransition />
      
      <main className="relative z-10">
        <HeroSection />
        <div className="space-y-0">
          {tools.map((tool, index) => (
            <OptimizedToolSection 
              key={tool.id} 
              tool={tool} 
              index={index} 
            />
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Auth View Wrapper Components
const LoginView: React.FC = () => {
  const { view: authView } = useAuth();
  if (authView === 'signup') return <SignUp />;
  if (authView === 'forgot') return <ForgotPassword />;
  if (authView === 'reset') return <ResetPassword />;
  return <Login />;
};

const SignUpView: React.FC = () => {
  const { view: authView } = useAuth();
  if (authView === 'login') return <Login />;
  if (authView === 'forgot') return <ForgotPassword />;
  if (authView === 'reset') return <ResetPassword />;
  return <SignUp />;
};

const ForgotPasswordView: React.FC = () => {
  const { view: authView } = useAuth();
  if (authView === 'login') return <Login />;
  if (authView === 'signup') return <SignUp />;
  if (authView === 'reset') return <ResetPassword />;
  return <ForgotPassword />;
};

const ResetPasswordView: React.FC = () => {
  const { view: authView } = useAuth();
  if (authView === 'login') return <Login />;
  if (authView === 'signup') return <SignUp />;
  if (authView === 'forgot') return <ForgotPassword />;
  return <ResetPassword />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ScrollProvider>
        <MainContent />
      </ScrollProvider>
    </AuthProvider>
  );
};

export default App;
