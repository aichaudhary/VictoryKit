import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const SocialEngineerDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={38}
      toolName="SocialEngineer"
      subdomain="socialengineer"
      color="#EC4899"
      description="Social engineering simulation. Test your employees against realistic attack scenarios."
    />
  );
};

export default SocialEngineerDetail;
