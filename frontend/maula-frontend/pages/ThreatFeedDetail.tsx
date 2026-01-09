import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const ThreatFeedDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={48}
      toolName="ThreatFeed"
      subdomain="threatfeed"
      color="#F97316"
      description="Threat intelligence aggregation. Consolidate and operationalize threat intel from multiple sources."
    />
  );
};

export default ThreatFeedDetail;
