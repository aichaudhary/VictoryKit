import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const BehaviorAnalyticsDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={19}
      toolName="RiskQuantify"
      subdomain="riskquantify"
      color="#8B5CF6"
      description="AI-powered risk quantification and assessment. Make data-driven security decisions."
    />
  );
};

export default BehaviorAnalyticsDetail;
