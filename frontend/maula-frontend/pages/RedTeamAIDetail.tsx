import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const RedTeamAIDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={49}
      toolName="RedTeamAI"
      subdomain="redteamai"
      color="#DC2626"
      description="AI-powered red team simulation. Test your defenses with intelligent adversary emulation."
    />
  );
};

export default RedTeamAIDetail;
