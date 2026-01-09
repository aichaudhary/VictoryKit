import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const PrivacyGuardDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={46}
      toolName="PrivacyGuard"
      subdomain="privacyguard"
      color="#10B981"
      description="Data privacy compliance. Manage GDPR, CCPA, and other privacy regulations effectively."
    />
  );
};

export default PrivacyGuardDetail;
