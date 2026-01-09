import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const SOCAssistantDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={32}
      toolName="SOCAssistant"
      subdomain="socassistant"
      color="#6366F1"
      description="AI-powered SOC analyst assistant. Augment your security team with intelligent automation."
    />
  );
};

export default SOCAssistantDetail;
