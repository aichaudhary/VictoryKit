import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const SecureCodeDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={8}
      toolName="SecureCode"
      subdomain="securecode"
      color="#3B82F6"
      description="Static and dynamic application security testing. Find and fix vulnerabilities in your source code before deployment."
    />
  );
};

export default SecureCodeDetail;
