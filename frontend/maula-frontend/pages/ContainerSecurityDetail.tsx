import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const ContainerSecurityDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={26}
      toolName="ContainerSecurity"
      subdomain="containersecurity"
      color="#06B6D4"
      description="Container and Kubernetes security. Scan and protect your containerized workloads."
    />
  );
};

export default ContainerSecurityDetail;
