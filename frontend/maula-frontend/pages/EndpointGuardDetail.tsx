import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const EndpointGuardDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={23}
      toolName="EndpointGuard"
      subdomain="endpointguard"
      color="#22C55E"
      description="Endpoint detection and response. Protect workstations and servers from advanced threats."
    />
  );
};

export default EndpointGuardDetail;
