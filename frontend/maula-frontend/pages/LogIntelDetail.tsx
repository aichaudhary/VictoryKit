import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const LogIntelDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={12}
      toolName="XDRPlatform"
      subdomain="xdrplatform"
      color="#22C55E"
      description="Intelligent log analysis and correlation. Transform raw logs into actionable security insights."
    />
  );
};

export default LogIntelDetail;
