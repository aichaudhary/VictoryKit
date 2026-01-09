import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const WAFManagerDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={21}
      toolName="WAFManager"
      subdomain="wafmanager"
      color="#EC4899"
      description="Web application firewall management. Protect your web applications from attacks and vulnerabilities."
    />
  );
};

export default WAFManagerDetail;
