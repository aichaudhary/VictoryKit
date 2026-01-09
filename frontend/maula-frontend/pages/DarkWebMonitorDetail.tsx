import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const DarkWebMonitorDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={37}
      toolName="DarkWebMonitor"
      subdomain="darkwebmonitor"
      color="#1F2937"
      description="Dark web intelligence monitoring. Discover leaked credentials and data before attackers do."
    />
  );
};

export default DarkWebMonitorDetail;
