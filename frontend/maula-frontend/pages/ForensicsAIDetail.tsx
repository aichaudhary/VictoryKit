import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const ForensicsAIDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={33}
      toolName="ForensicsAI"
      subdomain="forensicsai"
      color="#8B5CF6"
      description="Digital forensics and investigation. Analyze evidence and reconstruct security incidents."
    />
  );
};

export default ForensicsAIDetail;
