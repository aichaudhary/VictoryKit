import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const IOCHunterDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={47}
      toolName="IOCHunter"
      subdomain="iochunter"
      color="#8B5CF6"
      description="Indicator of compromise detection. Hunt for threats using the latest threat intelligence."
    />
  );
};

export default IOCHunterDetail;
