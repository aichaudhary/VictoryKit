import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const SecurityAutomationDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={28}
      toolName="SecurityAutomation"
      subdomain="securityautomation"
      color="#3B82F6"
      description="Security workflow automation. Automate repetitive security tasks with intelligent playbooks."
    />
  );
};

export default SecurityAutomationDetail;
