import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const ThreatIntelDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={18}
      toolName="ThreatModel"
      subdomain="threatmodel"
      color="#F97316"
      description="Attack surface analysis and threat modeling. Identify and prioritize security risks systematically."
    />
  );
};

export default ThreatIntelDetail;
