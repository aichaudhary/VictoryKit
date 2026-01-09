import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const DataGuardianDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={10}
      toolName="DataGuardian"
      subdomain="dataguardian"
      color="#D946EF"
      description="Data loss prevention and protection. Monitor, detect, and prevent unauthorized data access and exfiltration."
    />
  );
};

export default DataGuardianDetail;
