import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const DisasterRecoveryDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={35}
      toolName="DisasterRecovery"
      subdomain="disasterrecovery"
      color="#0EA5E9"
      description="Disaster recovery planning and testing. Be prepared for the worst with automated DR."
    />
  );
};

export default DisasterRecoveryDetail;
