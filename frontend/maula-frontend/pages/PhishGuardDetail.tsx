import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const PhishNetAIDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={5}
      toolName="PhishNetAI"
      subdomain="phishnetai"
      color="#0EA5E9"
      description="AI-powered phishing detection and prevention. Protect your organization from email-based attacks and social engineering."
    />
  );
};

export default PhishNetAIDetail;
