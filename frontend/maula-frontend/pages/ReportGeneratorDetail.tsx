import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const ReportGeneratorDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={40}
      toolName="ReportGenerator"
      subdomain="reportgenerator"
      color="#A855F7"
      description="Automated security reporting. Generate comprehensive reports for stakeholders and auditors."
    />
  );
};

export default ReportGeneratorDetail;
