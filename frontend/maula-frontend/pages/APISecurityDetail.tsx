import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const APISecurityDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={25}
      toolName="APISecurity"
      subdomain="apisecurity"
      color="#8B5CF6"
      description="API security testing and monitoring. Protect your APIs from exploitation and abuse."
    />
  );
};

export default APISecurityDetail;
