import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const IntegrationHubDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={43}
      toolName="IntegrationHub"
      subdomain="integrationhub"
      color="#22C55E"
      description="Security tool integration. Connect all your security tools for unified operations."
    />
  );
};

export default IntegrationHubDetail;
