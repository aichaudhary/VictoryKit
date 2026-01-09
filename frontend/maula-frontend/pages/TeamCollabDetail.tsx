import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const TeamCollabDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={44}
      toolName="TeamCollab"
      subdomain="teamcollab"
      color="#6366F1"
      description="Security team collaboration. Work together seamlessly on security incidents and projects."
    />
  );
};

export default TeamCollabDetail;
