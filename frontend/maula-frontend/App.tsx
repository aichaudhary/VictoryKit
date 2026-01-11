
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

// Tools 1-50
import FraudGuardDetail from './pages/FraudGuardDetail';
import IntelliScoutDetail from './pages/IntelliScoutDetail';
import ThreatRadarDetail from './pages/ThreatRadarDetail';
import MalwareHunterDetail from './pages/MalwareHunterDetail';
import PhishGuardDetail from './pages/PhishGuardDetail';
import VulnScanDetail from './pages/VulnScanDetail';
import PenTestAIDetail from './pages/PenTestAIDetail';
import SecureCodeDetail from './pages/SecureCodeDetail';
import ComplianceCheckDetail from './pages/ComplianceCheckDetail';
import DataGuardianDetail from './pages/DataGuardianDetail';
import CryptoShieldDetail from './pages/CryptoShieldDetail';
import IAMControlDetail from './pages/IAMControlDetail';
import LogIntelDetail from './pages/LogIntelDetail';
import NetDefenderDetail from './pages/NetDefenderDetail';
import EndpointShieldDetail from './pages/EndpointShieldDetail';
import CloudSecureDetail from './pages/CloudSecureDetail';
import APIGuardianDetail from './pages/APIGuardianDetail';
import ContainerWatchDetail from './pages/ContainerWatchDetail';
import DevSecOpsDetail from './pages/DevSecOpsDetail';
import IncidentCommandDetail from './pages/IncidentCommandDetail';
import WAFManagerDetail from './pages/WAFManagerDetail';
import ThreatIntelDetail from './pages/ThreatIntelDetail';
import BehaviorWatchDetail from './pages/BehaviorWatchDetail';
import AnomalyDetectDetail from './pages/AnomalyDetectDetail';
import RedTeamAIDetail from './pages/RedTeamAIDetail';
import BlueTeamAIDetail from './pages/BlueTeamAIDetail';
import SIEMCommanderDetail from './pages/SIEMCommanderDetail';
import SOAREngineDetail from './pages/SOAREngineDetail';
import RiskScoreAIDetail from './pages/RiskScoreAIDetail';
import PolicyEngineDetail from './pages/PolicyEngineDetail';
import AuditTrackerDetail from './pages/AuditTrackerDetail';
import ZeroTrustAIDetail from './pages/ZeroTrustAIDetail';
import PasswordVaultDetail from './pages/PasswordVaultDetail';
import BiometricAIDetail from './pages/BiometricAIDetail';
import EmailGuardDetail from './pages/EmailGuardDetail';
import WebFilterDetail from './pages/WebFilterDetail';
import DNSShieldDetail from './pages/DNSShieldDetail';
import FirewallAIDetail from './pages/FirewallAIDetail';
import VPNGuardianDetail from './pages/VPNGuardianDetail';
import WirelessWatchDetail from './pages/WirelessWatchDetail';
import IoTSecureDetail from './pages/IoTSecureDetail';
import MobileDefendDetail from './pages/MobileDefendDetail';
import BackupGuardDetail from './pages/BackupGuardDetail';
import DRPlanDetail from './pages/DRPlanDetail';
import PrivacyShieldDetail from './pages/PrivacyShieldDetail';
import GDPRComplianceDetail from './pages/GDPRComplianceDetail';
import HIPAAGuardDetail from './pages/HIPAAGuardDetail';
import PCIDSSDetail from './pages/PCIDSSDetail';
import BugBountyAIDetail from './pages/BugBountyAIDetail';
import CyberEduAIDetail from './pages/CyberEduAIDetail';

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
    if (['iam-control', 'zero-trust-ai', 'password-vault', 'biometric-ai'].includes(view)) {
      nextColor = '#040412';
    } else if (['log-intel', 'incident-command', 'forensics-lab', 'behavior-watch', 'anomaly-detect', 'dr-plan', 'cyber-edu-ai'].includes(view)) {
      nextColor = '#0d0503';
    } else if (['net-defender', 'email-guard', 'web-filter', 'dns-shield', 'firewall-ai', 'vpn-guardian', 'wireless-watch', 'mobile-defend'].includes(view)) {
      nextColor = '#040d0a';
    } else if (['fraud-guard', 'intelli-scout', 'threat-radar', 'malware-hunter', 'phish-guard', 'endpoint-shield', 'threat-intel'].includes(view)) {
      nextColor = '#0d0404';
    } else if (['cloud-secure', 'api-guardian', 'container-watch', 'devsecops', 'iot-secure', 'secure-code'].includes(view)) {
      nextColor = '#040d12';
    } else if (['red-team-ai', 'blue-team-ai', 'siem-commander', 'soar-engine', 'risk-score-ai', 'bug-bounty-ai', 'pen-test-ai'].includes(view)) {
      nextColor = '#08040d';
    } else if (['policy-engine', 'audit-tracker', 'gdpr-compliance', 'hipaa-guard', 'pcidss-guard', 'compliance-check', 'vuln-scan'].includes(view)) {
      nextColor = '#0d0a04';
    } else if (['backup-guard', 'privacy-shield', 'data-guardian', 'crypto-shield'].includes(view)) {
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
      case 'intelli-scout': return <IntelliScoutDetail />;
      case 'threat-radar': return <ThreatRadarDetail />;
      case 'malware-hunter': return <MalwareHunterDetail />;
      case 'phish-guard': return <PhishGuardDetail />;
      case 'vuln-scan': return <VulnScanDetail />;
      case 'pen-test-ai': return <PenTestAIDetail />;
      case 'secure-code': return <SecureCodeDetail />;
      case 'compliance-check': return <ComplianceCheckDetail />;
      case 'data-guardian': return <DataGuardianDetail />;
      case 'crypto-shield': return <CryptoShieldDetail />;
      case 'iam-control': return <IAMControlDetail />;
      case 'log-intel': return <LogIntelDetail />;
      case 'net-defender': return <NetDefenderDetail />;
      case 'endpoint-shield': return <EndpointShieldDetail />;
      case 'cloud-secure': return <CloudSecureDetail />;
      case 'api-guardian': return <APIGuardianDetail />;
      case 'container-watch': return <ContainerWatchDetail />;
      case 'devsecops': return <DevSecOpsDetail />;
      case 'incident-command': return <IncidentCommandDetail />;
      case 'waf-manager': return <WAFManagerDetail />;
      case 'threat-intel': return <ThreatIntelDetail />;
      case 'api-shield': return <ThreatIntelDetail />;
      case 'behavior-watch': return <BehaviorWatchDetail />;
      case 'bot-mitigation': return <BehaviorWatchDetail />;
      case 'anomaly-detect': return <AnomalyDetectDetail />;
      case 'ddos-defender': return <AnomalyDetectDetail />;
      case 'red-team-ai': return <RedTeamAIDetail />;
      case 'ssl-monitor': return <RedTeamAIDetail />;
      case 'blue-team-ai': return <BlueTeamAIDetail />;
      case 'siem-commander': return <SIEMCommanderDetail />;
      case 'soar-engine': return <SOAREngineDetail />;
      case 'risk-score-ai': return <RiskScoreAIDetail />;
      case 'policy-engine': return <PolicyEngineDetail />;
      case 'audit-tracker': return <AuditTrackerDetail />;
      case 'zero-trust-ai': return <ZeroTrustAIDetail />;
      case 'password-vault': return <PasswordVaultDetail />;
      case 'biometric-ai': return <BiometricAIDetail />;
      case 'email-guard': return <EmailGuardDetail />;
      case 'web-filter': return <WebFilterDetail />;
      case 'dns-shield': return <DNSShieldDetail />;
      case 'firewall-ai': return <FirewallAIDetail />;
      case 'vpn-guardian': return <VPNGuardianDetail />;
      case 'wireless-watch': return <WirelessWatchDetail />;
      case 'iot-secure': return <IoTSecureDetail />;
      case 'mobile-defend': return <MobileDefendDetail />;
      case 'backup-guard': return <BackupGuardDetail />;
      case 'dr-plan': return <DRPlanDetail />;
      case 'privacy-shield': return <PrivacyShieldDetail />;
      case 'gdpr-compliance': return <GDPRComplianceDetail />;
      case 'hipaa-guard': return <HIPAAGuardDetail />;
      case 'pcidss-guard': return <PCIDSSDetail />;
      case 'bug-bounty-ai': return <BugBountyAIDetail />;
      case 'cyber-edu-ai': return <CyberEduAIDetail />;
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
