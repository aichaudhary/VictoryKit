import React from 'react';
import ToolDetailTemplate from '../components/ToolDetailTemplate';

const AssetInventoryDetail: React.FC = () => {
  return (
    <ToolDetailTemplate
      toolId={30}
      toolName="AssetInventory"
      subdomain="assetinventory"
      color="#10B981"
      description="IT asset discovery and management. Know what you have to protect it effectively."
    />
  );
};

export default AssetInventoryDetail;
