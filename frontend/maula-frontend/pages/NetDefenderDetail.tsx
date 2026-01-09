import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const NetDefenderDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={16}
      toolName="NetworkMonitor"
      subdomain="networkmonitor"
      color="#06B6D4"
      description="Network traffic monitoring and analysis. Detect anomalies and threats in your network traffic."
    />
  );
};

export default NetDefenderDetail;
