import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const ZeroDayDetectDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={3}
      toolName="ZeroDayDetect"
      subdomain="zerodaydetect"
      color="#F43F5E"
      description="Real-time threat detection and monitoring. Scan your environment for active threats and neutralize them instantly."
    />
  );
};

export default ZeroDayDetectDetail;
