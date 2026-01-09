import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const CloudSecurityDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={22}
      toolName="CloudSecurity"
      subdomain="cloudsecurity"
      color="#0EA5E9"
      description="Cloud infrastructure security monitoring. Secure your cloud environments across AWS, Azure, and GCP."
    />
  );
};

export default CloudSecurityDetail;
