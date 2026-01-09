import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const CryptoShieldDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={14}
      toolName="EncryptionManager"
      subdomain="encryptionmanager"
      color="#A855F7"
      description="Enterprise encryption key management. Secure your sensitive data with industry-standard encryption."
    />
  );
};

export default CryptoShieldDetail;
