import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const PolicyEngineDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={29}
      toolName="PolicyEngine"
      subdomain="policyengine"
      color="#A855F7"
      description="Security policy management and enforcement. Create, deploy, and monitor security policies at scale."
    />
  );
};

export default PolicyEngineDetail;
