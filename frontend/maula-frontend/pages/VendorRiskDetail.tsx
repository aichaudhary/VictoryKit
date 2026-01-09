import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const VendorRiskDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={45}
      toolName="VendorRisk"
      subdomain="vendorrisk"
      color="#F59E0B"
      description="Third-party risk management. Assess and monitor vendor security posture continuously."
    />
  );
};

export default VendorRiskDetail;
