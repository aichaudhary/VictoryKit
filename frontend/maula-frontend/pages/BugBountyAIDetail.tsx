import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const ISO27001Detail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={50}
      toolName="ISO27001"
      subdomain="iso27001"
      color="#0EA5E9"
      description="Bug bounty program management. Run and manage your vulnerability disclosure program efficiently."
    />
  );
};

export default ISO27001Detail;
