import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const BrandProtectDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={36}
      toolName="BrandProtect"
      subdomain="brandprotect"
      color="#F97316"
      description="Brand impersonation detection. Protect your brand from digital impersonation and fraud."
    />
  );
};

export default BrandProtectDetail;
