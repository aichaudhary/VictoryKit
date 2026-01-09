import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

// Tool configuration - 50 tools with their subdomains and names
const tools = [
  { id: 1, name: 'FraudGuard', subdomain: 'fraudguard', color: '#EF4444' },
  { id: 2, name: 'IntelliScout', subdomain: 'intelliscout', color: '#10B981' },
  { id: 3, name: 'ThreatRadar', subdomain: 'threatradar', color: '#F43F5E' },
  { id: 4, name: 'MalwareHunter', subdomain: 'malwarehunter', color: '#8B5CF6' },
  { id: 5, name: 'PhishGuard', subdomain: 'phishguard', color: '#0EA5E9' },
  { id: 6, name: 'VulnScan', subdomain: 'vulnscan', color: '#F59E0B' },
  { id: 7, name: 'PenTestAI', subdomain: 'pentestai', color: '#6366F1' },
  { id: 8, name: 'SecureCode', subdomain: 'securecode', color: '#3B82F6' },
  { id: 9, name: 'ComplianceCheck', subdomain: 'compliancecheck', color: '#14B8A6' },
  { id: 10, name: 'DataGuardian', subdomain: 'dataguardian', color: '#D946EF' },
  { id: 11, name: 'IncidentResponse', subdomain: 'incidentresponse', color: '#EF4444' },
  { id: 12, name: 'LogAnalyzer', subdomain: 'loganalyzer', color: '#22C55E' },
  { id: 13, name: 'AccessControl', subdomain: 'accesscontrol', color: '#6366F1' },
  { id: 14, name: 'EncryptionManager', subdomain: 'encryptionmanager', color: '#A855F7' },
  { id: 15, name: 'CryptoVault', subdomain: 'cryptovault', color: '#10B981' },
  { id: 16, name: 'NetworkMonitor', subdomain: 'networkmonitor', color: '#06B6D4' },
  { id: 17, name: 'AuditTrail', subdomain: 'audittrail', color: '#3B82F6' },
  { id: 18, name: 'ThreatModel', subdomain: 'threatmodel', color: '#F97316' },
  { id: 19, name: 'RiskAssess', subdomain: 'riskassess', color: '#8B5CF6' },
  { id: 20, name: 'SecurityScore', subdomain: 'securityscore', color: '#06B6D4' },
  { id: 21, name: 'WAFManager', subdomain: 'wafmanager', color: '#EC4899' },
  { id: 22, name: 'APIGuard', subdomain: 'apiguard', color: '#8B5CF6' },
  { id: 23, name: 'BotDefender', subdomain: 'botdefender', color: '#F59E0B' },
  { id: 24, name: 'DDoSShield', subdomain: 'ddosshield', color: '#EF4444' },
  { id: 25, name: 'SSLMonitor', subdomain: 'sslmonitor', color: '#10B981' },
  { id: 26, name: 'BlueTeamAI', subdomain: 'blueteamai', color: '#3B82F6' },
  { id: 27, name: 'SIEMCommander', subdomain: 'siemcommander', color: '#22C55E' },
  { id: 28, name: 'SOAREngine', subdomain: 'soarengine', color: '#A855F7' },
  { id: 29, name: 'RiskScoreAI', subdomain: 'riskscoreai', color: '#F97316' },
  { id: 30, name: 'PolicyEngine', subdomain: 'policyengine', color: '#6366F1' },
  { id: 31, name: 'AuditTracker', subdomain: 'audittracker', color: '#14B8A6' },
  { id: 32, name: 'ZeroTrustAI', subdomain: 'zerotrustai', color: '#8B5CF6' },
  { id: 33, name: 'PasswordVault', subdomain: 'passwordvault', color: '#EF4444' },
  { id: 34, name: 'BiometricAI', subdomain: 'biometricai', color: '#EC4899' },
  { id: 35, name: 'EmailGuard', subdomain: 'emailguard', color: '#0EA5E9' },
  { id: 36, name: 'WebFilter', subdomain: 'webfilter', color: '#F59E0B' },
  { id: 37, name: 'DNSShield', subdomain: 'dnsshield', color: '#22C55E' },
  { id: 38, name: 'FirewallAI', subdomain: 'firewallai', color: '#F97316' },
  { id: 39, name: 'VPNGuardian', subdomain: 'vpnguardian', color: '#6366F1' },
  { id: 40, name: 'WirelessWatch', subdomain: 'wirelesswatch', color: '#06B6D4' },
  { id: 41, name: 'DataLossPrevention', subdomain: 'dlp', color: '#D946EF' },
  { id: 42, name: 'IoTSecure', subdomain: 'iotsecure', color: '#10B981' },
  { id: 43, name: 'MobileDefend', subdomain: 'mobiledefend', color: '#3B82F6' },
  { id: 44, name: 'BackupGuard', subdomain: 'backupguard', color: '#22C55E' },
  { id: 45, name: 'DRPlan', subdomain: 'drplan', color: '#EF4444' },
  { id: 46, name: 'PrivacyShield', subdomain: 'privacyshield', color: '#8B5CF6' },
  { id: 47, name: 'GDPRCompliance', subdomain: 'gdprcompliance', color: '#14B8A6' },
  { id: 48, name: 'HIPAAGuard', subdomain: 'hipaaguard', color: '#EC4899' },
  { id: 49, name: 'PCIDSSCheck', subdomain: 'pcidsscheck', color: '#F59E0B' },
  { id: 50, name: 'BugBountyAI', subdomain: 'bugbountyai', color: '#6366F1' },
];

// Export tools for use in other components
export { tools };

// Tool Section Component for Homepage
interface ToolSectionProps {
  tool: typeof tools[0];
}

const ToolSection: React.FC<ToolSectionProps> = ({ tool }) => {
  const handleNavigate = () => {
    // In production, this would navigate to the subdomain
    // For dev, we use relative paths
    window.location.href = `https://${tool.subdomain}.maula.ai`;
  };

  return (
    <section 
      className="tool-section"
      style={{
        padding: '40px 20px',
        borderBottom: '1px solid #1e293b',
        background: `linear-gradient(135deg, ${tool.color}10 0%, transparent 50%)`,
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span style={{ color: tool.color, fontSize: '14px', fontWeight: 600 }}>
              TOOL {String(tool.id).padStart(2, '0')}
            </span>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: 'white',
              margin: '8px 0 0 0'
            }}>
              {tool.name}
            </h2>
          </div>
          <button
            onClick={handleNavigate}
            style={{
              padding: '12px 32px',
              background: `linear-gradient(135deg, ${tool.color} 0%, ${tool.color}cc 100%)`,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: `0 4px 14px ${tool.color}40`,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 6px 20px ${tool.color}60`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 14px ${tool.color}40`;
            }}
          >
            View {tool.name} →
          </button>
        </div>
      </div>
    </section>
  );
};

// Homepage Component
const HomePage: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        padding: '24px 20px',
        borderBottom: '1px solid #1e293b',
        position: 'sticky',
        top: 0,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
          }}>
            MAULA.AI
          </h1>
          <span style={{ color: '#64748b', fontSize: '14px' }}>
            50 Security Tools • One Platform
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '80px 20px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%)',
      }}>
        <h2 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          marginBottom: '16px',
          background: 'linear-gradient(135deg, white 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          VictoryKit Security Suite
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          Enterprise-grade AI-powered security tools. Click any tool below to explore.
        </p>
      </section>

      {/* 50 Tool Sections */}
      <main>
        {tools.map((tool) => (
          <ToolSection key={tool.id} tool={tool} />
        ))}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '40px 20px',
        textAlign: 'center',
        borderTop: '1px solid #1e293b',
        color: '#64748b',
      }}>
        <p>© 2026 Maula.AI - All Rights Reserved</p>
      </footer>
    </div>
  );
};

// Main App with Router
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
