import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const SecurityDashboardDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={20}
      toolName="SecurityDashboard"
      subdomain="securitydashboard"
      color="#06B6D4"
      description="Security posture measurement and benchmarking. Track your security score against industry standards."
    />
  );
};

export default SecurityDashboardDetail;
