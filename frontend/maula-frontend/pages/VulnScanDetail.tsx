import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const VulnScanDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={6}
      toolName="VulnScan"
      subdomain="vulnscan"
      color="#F59E0B"
      description="Comprehensive vulnerability scanning and management. Identify, prioritize, and remediate security weaknesses."
    />
  );
};

export default VulnScanDetail;
