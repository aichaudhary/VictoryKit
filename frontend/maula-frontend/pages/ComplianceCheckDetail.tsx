import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const ComplianceCheckDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={9}
      toolName="ComplianceCheck"
      subdomain="compliancecheck"
      color="#14B8A6"
      description="Automated compliance auditing and reporting. Stay compliant with industry regulations and standards."
    />
  );
};

export default ComplianceCheckDetail;
