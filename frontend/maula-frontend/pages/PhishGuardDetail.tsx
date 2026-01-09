import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const PhishGuardDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={5}
      toolName="PhishGuard"
      subdomain="phishguard"
      color="#0EA5E9"
      description="AI-powered phishing detection and prevention. Protect your organization from email-based attacks and social engineering."
    />
  );
};

export default PhishGuardDetail;
