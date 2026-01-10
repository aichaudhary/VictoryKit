import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const CloudPostureDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={17}
      toolName="AuditTrailPro"
      subdomain="audittrailpro"
      color="#3B82F6"
      description="Comprehensive audit logging and tracking. Maintain complete visibility into all system activities."
    />
  );
};

export default CloudPostureDetail;
