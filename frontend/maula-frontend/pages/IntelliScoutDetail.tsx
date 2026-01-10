import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const DarkWebMonitorDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={2}
      toolName="DarkWebMonitor"
      subdomain="darkwebmonitor"
      color="#10B981"
      description="Threat intelligence platform for proactive security. Gather, analyze, and act on threat data from multiple sources."
    />
  );
};

export default DarkWebMonitorDetail;
