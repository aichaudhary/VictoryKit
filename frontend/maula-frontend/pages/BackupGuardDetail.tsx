import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const BackupGuardDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={34}
      toolName="BackupGuard"
      subdomain="backupguard"
      color="#22C55E"
      description="Secure backup verification and testing. Ensure your backups are intact and recoverable."
    />
  );
};

export default BackupGuardDetail;
