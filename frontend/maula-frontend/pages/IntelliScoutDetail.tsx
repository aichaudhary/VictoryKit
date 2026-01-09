import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const IntelliScoutDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={2}
      toolName="IntelliScout"
      subdomain="intelliscout"
      color="#10B981"
      description="Threat intelligence platform for proactive security. Gather, analyze, and act on threat data from multiple sources."
    />
  );
};

export default IntelliScoutDetail;
