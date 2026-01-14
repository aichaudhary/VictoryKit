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

// Tools 1-50 (numbered for consistency with backend/frontend tool folders)
import FraudGuardDetail from './pages/01-FraudGuardDetail';
import DarkWebMonitorDetail from './pages/02-DarkWebMonitorDetail';
import ZeroDayDetectDetail from './pages/03-ZeroDayDetectDetail';
import RansomShieldDetail from './pages/04-RansomShieldDetail';
import PhishNetAIDetail from './pages/05-PhishNetAIDetail';
import VulnScanDetail from './pages/06-VulnScanDetail';
import PenTestAIDetail from './pages/07-PenTestAIDetail';
import CodeSentinelDetail from './pages/08-CodeSentinelDetail';
import RuntimeGuardDetail from './pages/09-RuntimeGuardDetail';
import DataGuardianDetail from './pages/10-DataGuardianDetail';
import IncidentResponseDetail from './pages/11-IncidentResponseDetail';
import XDRPlatformDetail from './pages/12-XDRPlatformDetail';
import IdentityForgeDetail from './pages/13-IdentityForgeDetail';
import SecretVaultDetail from './pages/14-SecretVaultDetail';
import PrivilegeGuardDetail from './pages/15-PrivilegeGuardDetail';
import NetworkForensicsDetail from './pages/16-NetworkForensicsDetail';
import AuditTrailProDetail from './pages/17-AuditTrailProDetail';
import ThreatModelDetail from './pages/18-ThreatModelDetail';
import RiskQuantifyDetail from './pages/19-RiskQuantifyDetail';
import SecurityDashboardDetail from './pages/20-SecurityDashboardDetail';
import WAFManagerDetail from './pages/21-WAFManagerDetail';
import APIShieldDetail from './pages/22-APIShieldDetail';
import BotMitigationDetail from './pages/23-BotMitigationDetail';
import DDoSDefenderDetail from './pages/24-DDoSDefenderDetail';
import SSLMonitorDetail from './pages/25-SSLMonitorDetail';
import BlueTeamAIDetail from './pages/26-BlueTeamAIDetail';
import SIEMCommanderDetail from './pages/27-SIEMCommanderDetail';
import SOAREngineDetail from './pages/28-SOAREngineDetail';
import BehaviorAnalyticsDetail from './pages/29-BehaviorAnalyticsDetail';
import PolicyEngineDetail from './pages/30-PolicyEngineDetail';
import CloudPostureDetail from './pages/31-CloudPostureDetail';
import ZeroTrustDetail from './pages/32-ZeroTrustDetail';
import KubeArmorDetail from './pages/33-KubeArmorDetail';
import ContainerScanDetail from './pages/34-ContainerScanDetail';
import EmailDefenderDetail from './pages/35-EmailDefenderDetail';
import BrowserIsolationDetail from './pages/36-BrowserIsolationDetail';
import DNSFirewallDetail from './pages/37-DNSFirewallDetail';
import FirewallAIDetail from './pages/38-FirewallAIDetail';
import VPNAnalyzerDetail from './pages/39-VPNAnalyzerDetail';
import WirelessHunterDetail from './pages/40-WirelessHunterDetail';
import DLPAdvancedDetail from './pages/41-DLPAdvancedDetail';
import IoTSentinelDetail from './pages/42-IoTSentinelDetail';
import MobileShieldDetail from './pages/43-MobileShieldDetail';
import SupplyChainAIDetail from './pages/44-SupplyChainAIDetail';
import DRPlanDetail from './pages/45-DRPlanDetail';
import PrivacyShieldDetail from './pages/46-PrivacyShieldDetail';
import GDPRComplianceDetail from './pages/47-GDPRComplianceDetail';
import HIPAAGuardDetail from './pages/48-HIPAAGuardDetail';
import SOC2AutomatorDetail from './pages/49-SOC2AutomatorDetail';
import ISO27001Detail from './pages/50-ISO27001Detail';

// Organizational Pages
import ProductsPage from './pages/ProductsPage';
import SolutionsPage from './pages/SolutionsPage';
import DocsPage from './pages/DocsPage';
import PricingPage from './pages/PricingPage';
import {
  AboutUs,
  Careers,
  Contact,
  GlobalShieldDetail,
  LegalPage,
} from './pages/StaticDetailPages';

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
    window.onload = () => {
      ScrollTrigger.refresh();
    };
  }, []);

  useEffect(() => {
    if (!mainRef.current) return;

    let nextColor = '#02000a';
    if (['iam-control', 'zero-trust-ai', 'password-vault', 'biometric-ai'].includes(view)) {
      nextColor = '#040412';
    } else if (
      [
        'log-intel',
        'incident-command',
        'forensics-lab',
        'behavior-watch',
        'anomaly-detect',
        'dr-plan',
        'cyber-edu-ai',
      ].includes(view)
    ) {
      nextColor = '#0d0503';
    } else if (
      [
        'net-defender',
        'email-guard',
        'browser-isolation',
        'dns-shield',
        'firewall-ai',
        'vpn-guardian',
        'wireless-watch',
        'mobile-defend',
      ].includes(view)
    ) {
      nextColor = '#040d0a';
    } else if (
      [
        'fraud-guard',
        'dark-web-monitor',
        'threat-radar',
        'malware-hunter',
        'phish-guard',
        'endpoint-shield',
        'threat-intel',
      ].includes(view)
    ) {
      nextColor = '#0d0404';
    } else if (
      [
        'cloud-secure',
        'api-guardian',
        'container-watch',
        'devsecops',
        'iot-secure',
        'secure-code',
      ].includes(view)
    ) {
      nextColor = '#040d12';
    } else if (
      [
        'red-team-ai',
        'blue-team-ai',
        'siem-commander',
        'soar-engine',
        'risk-score-ai',
        'bug-bounty-ai',
        'pen-test-ai',
      ].includes(view)
    ) {
      nextColor = '#08040d';
    } else if (
      [
        'policy-engine',
        'audit-tracker',
        'gdpr-compliance',
        'hipaa-guard',
        'pcidss-guard',
        'compliance-check',
        'vuln-scan',
      ].includes(view)
    ) {
      nextColor = '#0d0a04';
    } else if (
      ['backup-guard', 'privacy-shield', 'data-guardian', 'crypto-shield'].includes(view)
    ) {
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
      overwrite: 'auto',
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
      case 'dashboard-api-keys':
        return <APIAccessKeys />;
      case 'dashboard-admin-hierarchy':
        return <AdminHierarchy />;
      case 'dashboard-sovereignty':
        return <SovereigntyNodes />;
      case 'products':
        return <ProductsPage />;
      case 'solutions':
        return <SolutionsPage />;
      case 'docs':
        return <DocsPage />;
      case 'pricing':
        return <PricingPage />;
      case 'about-us':
        return <AboutUs />;
      case 'careers':
        return <Careers />;
      case 'press-kit':
        return <LegalPage title="Press Kit" />;
      case 'contact':
        return <Contact />;
      case 'privacy-policy':
        return <LegalPage title="Privacy Policy" />;
      case 'terms-of-service':
        return <LegalPage title="Terms of Service" />;
      case 'security-disclosure':
        return <LegalPage title="Security Disclosure" />;
      case 'global-shield-detail':
        return <GlobalShieldDetail />;
      case 'fraud-guard':
        return <FraudGuardDetail />;
      case 'dark-web-monitor':
        return <DarkWebMonitorDetail />;
      case 'threat-radar':
        return <ZeroDayDetectDetail />;
      case 'ransom-shield':
        return <RansomShieldDetail />;
      case 'phish-guard':
        return <PhishNetAIDetail />;
      case 'vuln-scan':
        return <VulnScanDetail />;
      case 'pen-test-ai':
        return <PenTestAIDetail />;
      case 'secure-code':
        return <CodeSentinelDetail />;
      case 'compliance-check':
        return <RuntimeGuardDetail />;
      case 'data-guardian':
        return <DataGuardianDetail />;
      case 'crypto-shield':
        return <IncidentResponseDetail />;
      case 'iam-control':
        return <XDRPlatformDetail />;
      case 'log-intel':
        return <IdentityForgeDetail />;
      case 'net-defender':
        return <SecretVaultDetail />;
      case 'endpoint-shield':
        return <PrivilegeGuardDetail />;
      case 'cloud-secure':
        return <NetworkForensicsDetail />;
      case 'api-guardian':
        return <AuditTrailProDetail />;
      case 'container-watch':
        return <ThreatModelDetail />;
      case 'devsecops':
        return <RiskQuantifyDetail />;
      case 'incident-command':
        return <SecurityDashboardDetail />;
      case 'waf-manager':
        return <WAFManagerDetail />;
      case 'threat-intel':
        return <APIShieldDetail />;
      case 'api-shield':
        return <APIShieldDetail />;
      case 'behavior-watch':
        return <BotMitigationDetail />;
      case 'bot-mitigation':
        return <BotMitigationDetail />;
      case 'anomaly-detect':
        return <DDoSDefenderDetail />;
      case 'ddos-defender':
        return <DDoSDefenderDetail />;
      case 'red-team-ai':
        return <SSLMonitorDetail />;
      case 'ssl-monitor':
        return <SSLMonitorDetail />;
      case 'blue-team-ai':
        return <BlueTeamAIDetail />;
      case 'siem-commander':
        return <SIEMCommanderDetail />;
      case 'soar-engine':
        return <SOAREngineDetail />;
      case 'risk-score-ai':
        return <BehaviorAnalyticsDetail />;
      case 'policy-engine':
        return <PolicyEngineDetail />;
      case 'audit-tracker':
        return <CloudPostureDetail />;
      case 'zero-trust-ai':
        return <ZeroTrustDetail />;
      case 'password-vault':
        return <KubeArmorDetail />;
      case 'biometric-ai':
        return <ContainerScanDetail />;
      case 'email-guard':
        return <EmailDefenderDetail />;
      case 'browser-isolation':
        return <BrowserIsolationDetail />;
      case 'dns-shield':
        return <DNSFirewallDetail />;
      case 'firewall-ai':
        return <FirewallAIDetail />;
      case 'vpn-guardian':
        return <VPNAnalyzerDetail />;
      case 'wireless-watch':
        return <WirelessHunterDetail />;
      case 'iot-secure':
        return <DLPAdvancedDetail />;
      case 'mobile-defend':
        return <IoTSentinelDetail />;
      case 'backup-guard':
        return <MobileShieldDetail />;
      case 'dr-plan':
        return <DRPlanDetail />;
      case 'privacy-shield':
        return <PrivacyShieldDetail />;
      case 'gdpr-compliance':
        return <GDPRComplianceDetail />;
      case 'hipaa-guard':
        return <HIPAAGuardDetail />;
      case 'pcidss-guard':
        return <SOC2AutomatorDetail />;
      case 'bug-bounty-ai':
        return <SOC2AutomatorDetail />;
      case 'cyber-edu-ai':
        return <ISO27001Detail />;
      default:
        return null;
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
            <OptimizedToolSection key={tool.id} tool={tool} index={index} />
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
