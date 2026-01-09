import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const BugBountyAIDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={50}
      toolName="BugBountyAI"
      subdomain="bugbountyai"
      color="#0EA5E9"
      description="Bug bounty program management. Run and manage your vulnerability disclosure program efficiently."
    />
  );
};

export default BugBountyAIDetail;
