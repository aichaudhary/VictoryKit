import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const SecurityScoreDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={20}
      toolName="SecurityScore"
      subdomain="securityscore"
      color="#06B6D4"
      description="Security posture measurement and benchmarking. Track your security score against industry standards."
    />
  );
};

export default SecurityScoreDetail;
