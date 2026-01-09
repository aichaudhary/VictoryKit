import React from 'react';

interface ToolDetailTemplateProps {
  toolId: number;
  toolName: string;
  subdomain: string;
  color: string;
  description?: string;
}

/**
 * Reusable Tool Detail Template
 * 
 * URL: https://[subdomain].maula.ai
 * 
 * Contains:
 * - Back to Home button → https://maula.ai
 * - Launch Tool button → https://[subdomain].maula.ai/maula (dedicated tool experience)
 */
const ToolDetailTemplate: React.FC<ToolDetailTemplateProps> = ({
  toolId,
  toolName,
  subdomain,
  color,
  description = 'AI-powered security tool for enterprise protection.',
}) => {
  const handleBackToHome = () => {
    window.location.href = 'https://maula.ai';
  };

  const handleLaunchTool = () => {
    // Navigate to the dedicated tool experience
    window.location.href = `https://${subdomain}.maula.ai/maula`;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              boxShadow: `0 4px 14px ${color}40`,
            }}
          >
            {String(toolId).padStart(2, '0')}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              {toolName}
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
              {subdomain}.maula.ai
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Button 1: Back to Home */}
          <button
            onClick={handleBackToHome}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#1e293b';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            ← Back to Home
          </button>

          {/* Button 2: Launch Tool */}
          <button
            onClick={handleLaunchTool}
            style={{
              padding: '12px 24px',
              background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: `0 4px 14px ${color}40`,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 6px 20px ${color}60`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 14px ${color}40`;
            }}
          >
            🚀 Launch Tool
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          {/* Tool Badge */}
          <div
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: `${color}20`,
              borderRadius: '20px',
              color: color,
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '24px',
            }}
          >
            TOOL {String(toolId).padStart(2, '0')}
          </div>

          {/* Tool Name */}
          <h2
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '16px',
              background: `linear-gradient(135deg, white 0%, ${color} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {toolName}
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: '18px',
              color: '#94a3b8',
              marginBottom: '40px',
              lineHeight: 1.6,
            }}
          >
            {description}
          </p>

          {/* Feature Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginTop: '40px',
            }}
          >
            {['AI-Powered Analysis', 'Real-Time Monitoring', 'Enterprise Ready'].map(
              (feature, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '24px',
                    background: '#0f172a',
                    borderRadius: '12px',
                    border: '1px solid #1e293b',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: `${color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      color: color,
                      fontSize: '18px',
                    }}
                  >
                    {['🤖', '📊', '🏢'][idx]}
                  </div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{feature}</p>
                </div>
              )
            )}
          </div>

          {/* CTA Section */}
          <div
            style={{
              marginTop: '60px',
              padding: '40px',
              background: `linear-gradient(135deg, ${color}10 0%, transparent 100%)`,
              borderRadius: '16px',
              border: `1px solid ${color}30`,
            }}
          >
            <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>
              Ready to get started?
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
              Launch the full {toolName} experience with AI-powered features.
            </p>
            <button
              onClick={handleLaunchTool}
              style={{
                padding: '16px 48px',
                background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '18px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: `0 4px 20px ${color}50`,
              }}
            >
              🚀 Launch {toolName}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '24px',
          borderTop: '1px solid #1e293b',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '14px',
        }}
      >
        <p style={{ margin: 0 }}>
          © 2026 Maula.AI • {toolName} • All Rights Reserved
        </p>
      </footer>
    </div>
  );
};

export default ToolDetailTemplate;
