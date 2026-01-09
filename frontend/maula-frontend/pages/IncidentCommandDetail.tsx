import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const IncidentCommandDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={11}
      toolName="IncidentResponse"
      subdomain="incidentresponse"
      color="#EF4444"
      description="Incident response orchestration and automation. Streamline your security operations with AI-powered playbooks."
    />
  );
};

export default IncidentCommandDetail;
