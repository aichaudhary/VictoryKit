import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const ThreatRadarDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={3}
      toolName="ThreatRadar"
      subdomain="threatradar"
      color="#F43F5E"
      description="Real-time threat detection and monitoring. Scan your environment for active threats and neutralize them instantly."
    />
  );
};

export default ThreatRadarDetail;
