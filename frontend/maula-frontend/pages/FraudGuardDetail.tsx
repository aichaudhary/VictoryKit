import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const FraudGuardDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={1}
      toolName="FraudGuard"
      subdomain="fraudguard"
      color="#EF4444"
      description="AI-powered fraud detection and prevention. Analyze transactions in real-time, detect anomalies, and protect your business from financial threats."
    />
  );
};

export default FraudGuardDetail;
