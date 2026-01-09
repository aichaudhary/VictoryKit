import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const DashboardCentralDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={41}
      toolName="DashboardCentral"
      subdomain="dashboardcentral"
      color="#06B6D4"
      description="Unified security dashboard. Get a single pane of glass view across all your security tools."
    />
  );
};

export default DashboardCentralDetail;
