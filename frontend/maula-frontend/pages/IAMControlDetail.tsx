import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const IAMControlDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={13}
      toolName="IdentityForge"
      subdomain="identityforge"
      color="#6366F1"
      description="Identity and access management. Control who has access to what with intelligent policy enforcement."
    />
  );
};

export default IAMControlDetail;
