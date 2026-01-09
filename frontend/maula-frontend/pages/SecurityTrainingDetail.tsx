import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const SecurityTrainingDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={39}
      toolName="SecurityTraining"
      subdomain="securitytraining"
      color="#3B82F6"
      description="Security awareness training. Educate your workforce with engaging security content."
    />
  );
};

export default SecurityTrainingDetail;
