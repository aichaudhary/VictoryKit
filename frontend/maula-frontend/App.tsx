
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

// Tools 1-50 (2026 Rebranded Names)
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
import ZeroTrustEngineDetail from './pages/32-ZeroTrustEngineDetail';
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
import ISO27001ManagerDetail from './pages/50-ISO27001ManagerDetail';

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
    // Identity & Access (13-15)
    if (['identityforge', 'zerotrust', 'secretvault', 'privilegeguard'].includes(view)) {
      nextColor = '#040412';
    // Logging, Incident, Recovery (11, 16-17, 45, 36)
    } else if (['incidentresponse', 'networkforensics', 'audittrailpro', 'behavioranalytics', 'drplan', 'browserisolation'].includes(view)) {
      nextColor = '#0d0503';
    // Network Defense (24, 35, 21, 37-40)
    } else if (['ddosdefender', 'emaildefender', 'wafmanager', 'dnsfirewall', 'firewallai', 'vpnanalyzer', 'wirelesshunter', 'mobileshield'].includes(view)) {
      nextColor = '#040d0a';
    // Threat Intelligence (01-05, 41, 18)
    } else if (['fraudguard', 'darkwebmonitor', 'zerodaydetect', 'ransomshield', 'phishnetai', 'dlpadvanced', 'threatmodel'].includes(view)) {
      nextColor = '#0d0404';
    // Cloud & API (22, 31, 33-34, 42, 08-09)
    } else if (['cloudposture', 'apishield', 'kubearmor', 'containerscan', 'iotsentinel', 'codesentinel', 'runtimeguard'].includes(view)) {
      nextColor = '#040d12';
    // AI Ops & Testing (26-28, 19, 44, 07, 12)
    } else if (['blueteamai', 'siemcommander', 'soarengine', 'riskquantify', 'supplychainai', 'pentestai', 'xdrplatform'].includes(view)) {
      nextColor = '#08040d';
    // Compliance (30, 17, 47-50, 25, 06)
    } else if (['policyengine', 'audittrailpro', 'gdprcompliance', 'hipaaguard', 'soc2automator', 'iso27001', 'sslmonitor', 'vulnscan'].includes(view)) {
      nextColor = '#0d0a04';
    // Data Protection (10, 04, 46, 23, 20)
    } else if (['dataguardian', 'ransomshield', 'privacyshield', 'botmitigation', 'securitydashboard'].includes(view)) {
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
      // Tools 1-50 (2026 Rebranded)
      case 'fraudguard': return <FraudGuardDetail />;
      case 'darkwebmonitor': return <DarkWebMonitorDetail />;
      case 'zerodaydetect': return <ZeroDayDetectDetail />;
      case 'ransomshield': return <RansomShieldDetail />;
      case 'phishnetai': return <PhishNetAIDetail />;
      case 'vulnscan': return <VulnScanDetail />;
      case 'pentestai': return <PenTestAIDetail />;
      case 'codesentinel': return <CodeSentinelDetail />;
      case 'runtimeguard': return <RuntimeGuardDetail />;
      case 'dataguardian': return <DataGuardianDetail />;
      case 'incidentresponse': return <IncidentResponseDetail />;
      case 'xdrplatform': return <XDRPlatformDetail />;
      case 'identityforge': return <IdentityForgeDetail />;
      case 'secretvault': return <SecretVaultDetail />;
      case 'privilegeguard': return <PrivilegeGuardDetail />;
      case 'networkforensics': return <NetworkForensicsDetail />;
      case 'audittrailpro': return <AuditTrailProDetail />;
      case 'threatmodel': return <ThreatModelDetail />;
      case 'riskquantify': return <RiskQuantifyDetail />;
      case 'securitydashboard': return <SecurityDashboardDetail />;
      case 'wafmanager': return <WAFManagerDetail />;
      case 'apishield': return <APIShieldDetail />;
      case 'botmitigation': return <BotMitigationDetail />;
      case 'ddosdefender': return <DDoSDefenderDetail />;
      case 'sslmonitor': return <SSLMonitorDetail />;
      case 'blueteamai': return <BlueTeamAIDetail />;
      case 'siemcommander': return <SIEMCommanderDetail />;
      case 'soarengine': return <SOAREngineDetail />;
      case 'behavioranalytics': return <BehaviorAnalyticsDetail />;
      case 'policyengine': return <PolicyEngineDetail />;
      case 'cloudposture': return <CloudPostureDetail />;
      case 'zerotrust': return <ZeroTrustEngineDetail />;
      case 'kubearmor': return <KubeArmorDetail />;
      case 'containerscan': return <ContainerScanDetail />;
      case 'emaildefender': return <EmailDefenderDetail />;
      case 'browserisolation': return <BrowserIsolationDetail />;
      case 'dnsfirewall': return <DNSFirewallDetail />;
      case 'firewallai': return <FirewallAIDetail />;
      case 'vpnanalyzer': return <VPNAnalyzerDetail />;
      case 'wirelesshunter': return <WirelessHunterDetail />;
      case 'dlpadvanced': return <DLPAdvancedDetail />;
      case 'iotsentinel': return <IoTSentinelDetail />;
      case 'mobileshield': return <MobileShieldDetail />;
      case 'supplychainai': return <SupplyChainAIDetail />;
      case 'drplan': return <DRPlanDetail />;
      case 'privacyshield': return <PrivacyShieldDetail />;
      case 'gdprcompliance': return <GDPRComplianceDetail />;
      case 'hipaaguard': return <HIPAAGuardDetail />;
      case 'soc2automator': return <SOC2AutomatorDetail />;
      case 'iso27001': return <ISO27001ManagerDetail />;
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
