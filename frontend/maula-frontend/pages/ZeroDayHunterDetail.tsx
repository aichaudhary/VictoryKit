import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const ZeroDayHunterDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={31}
      toolName="ZeroDayHunter"
      subdomain="zerodayhunter"
      color="#EF4444"
      description="Zero-day vulnerability detection. Identify unknown threats before they impact your organization."
    />
  );
};

export default ZeroDayHunterDetail;
