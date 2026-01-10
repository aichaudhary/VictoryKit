import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const KubeArmorDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={15}
      toolName="PrivilegeGuard"
      subdomain="privilegeguard"
      color="#10B981"
      description="Secure secrets and credential management. Store, rotate, and manage sensitive credentials safely."
    />
  );
};

export default KubeArmorDetail;
