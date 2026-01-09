import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const AlertManagerDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={42}
      toolName="AlertManager"
      subdomain="alertmanager"
      color="#EF4444"
      description="Intelligent alert management. Reduce noise and focus on what matters with AI-powered triage."
    />
  );
};

export default AlertManagerDetail;
