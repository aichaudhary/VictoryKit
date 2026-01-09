import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const DevSecOpsDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={27}
      toolName="DevSecOps"
      subdomain="devsecops"
      color="#F97316"
      description="Security pipeline integration. Shift security left with automated DevSecOps workflows."
    />
  );
};

export default DevSecOpsDetail;
