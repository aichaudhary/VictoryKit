import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const EmailSecurityDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={24}
      toolName="EmailSecurity"
      subdomain="emailsecurity"
      color="#EF4444"
      description="Email threat protection and analysis. Guard against phishing, malware, and email-borne attacks."
    />
  );
};

export default EmailSecurityDetail;
