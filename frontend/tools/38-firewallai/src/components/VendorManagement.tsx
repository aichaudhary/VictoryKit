import React, { useState } from 'react';
import { Server, Plus, Edit, Trash2, Settings, Key, Wifi, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface VendorManagementProps {
  vendors: any[];
  onUpdateVendor: (vendorId: string, updates: any) => void;
  onCreateVendor: (vendor: any) => void;
  onDeleteVendor: (vendorId: string) => void;
}

const VendorManagement: React.FC<VendorManagementProps> = ({
  vendors,
  onUpdateVendor,
  onCreateVendor,
  onDeleteVendor
}) => {
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{[key: string]: 'connected' | 'disconnected' | 'error' | 'connecting'}>({});

  const vendorTypes = [
    { id: 'pfsense', name: 'pfSense', icon: Shield, color: 'blue' },
    { id: 'palo_alto', name: 'Palo Alto Networks', icon: Shield, color: 'red' },
    { id: 'fortinet', name: 'Fortinet', icon: Shield, color: 'green' },
    { id: 'checkpoint', name: 'Check Point', icon: Shield, color: 'orange' },
    { id: 'cisco_asa', name: 'Cisco ASA', icon: Shield, color: 'cyan' },
    { id: 'aws_firewall', name: 'AWS Network Firewall', icon: Server, color: 'yellow' },
    { id: 'azure_firewall', name: 'Azure Firewall', icon: Server, color: 'blue' },
    { id: 'gcp_armor', name: 'Google Cloud Armor', icon: Server, color: 'green' },
    { id: 'cloudflare', name: 'Cloudflare WAF', icon: Wifi, color: 'orange' },
    { id: 'akamai', name: 'Akamai Kona Site Defender', icon: Shield, color: 'purple' },
  ];

  const VendorForm: React.FC<{
    vendor?: any;
    onSubmit: (vendor: any) => void;
    onCancel: () => void;
  }> = ({ vendor, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(vendor || {
      name: '',
      type: '',
      host: '',
      port: '',
      username: '',
      password: '',
      apiKey: '',
      region: '',
      enabled: true,
      config: {}
    });

    const selectedVendorType = vendorTypes.find(v => v.id === formData.type);

    return (
      <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">
          {vendor ? 'Edit Vendor Configuration' : 'Add New Firewall Vendor'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Vendor Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
              placeholder="e.g., Production Firewall"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Vendor Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
            >
              <option value="">Select vendor type</option>
              {vendorTypes.map(vendor => (
                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
              ))}
            </select>
          </div>

          {selectedVendorType && (
            <div className="md:col-span-2 flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
              <selectedVendorType.icon className={`w-6 h-6 text-${selectedVendorType.color}-400`} />
              <div>
                <div className="font-medium text-white">{selectedVendorType.name}</div>
                <div className="text-sm text-gray-400">Firewall vendor selected</div>
              </div>
            </div>
          )}

          {/* Connection Details */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Host/IP Address</label>
            <input
              type="text"
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
              placeholder="192.168.1.1 or firewall.company.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Port</label>
            <input
              type="number"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
              placeholder="443"
            />
          </div>

          {/* Authentication */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
              placeholder="API username"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
              placeholder="API password"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">API Key (Optional)</label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
              placeholder="API key if required"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Region (Cloud vendors)</label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white"
              placeholder="us-east-1, eastus, etc."
            />
          </div>
        </div>

        {/* Advanced Configuration */}
        <div className="mt-4">
          <label className="block text-sm text-gray-400 mb-2">Advanced Configuration (JSON)</label>
          <textarea
            value={JSON.stringify(formData.config, null, 2)}
            onChange={(e) => {
              try {
                const config = JSON.parse(e.target.value);
                setFormData({ ...formData, config });
              } catch (err) {
                // Invalid JSON, keep as string for now
              }
            }}
            className="w-full bg-slate-900 border border-blue-500/30 rounded-lg px-3 py-2 text-white font-mono text-sm h-24"
            placeholder='{"timeout": 30, "ssl_verify": true, "retry_count": 3}'
          />
        </div>

        <div className="flex items-center justify-between mt-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="rounded border-blue-500/30"
            />
            <span className="text-sm text-gray-400">Enable vendor integration</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit(formData)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:opacity-90 transition-opacity"
            >
              {vendor ? 'Update' : 'Add'} Vendor
            </button>
          </div>
        </div>
      </div>
    );
  };

  const testConnection = async (vendorId: string) => {
    setConnectionStatus(prev => ({ ...prev, [vendorId]: 'connecting' }));

    // Simulate connection test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      setConnectionStatus(prev => ({
        ...prev,
        [vendorId]: success ? 'connected' : 'error'
      }));
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Vendor Management</h2>
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
            {vendors.length} vendors
          </span>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Vendor
        </button>
      </div>

      {/* Add Vendor Form */}
      {showAddForm && (
        <VendorForm
          onSubmit={(vendor) => {
            onCreateVendor(vendor);
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Edit Vendor Form */}
      {selectedVendor && !showAddForm && (
        <VendorForm
          vendor={selectedVendor}
          onSubmit={(vendor) => {
            onUpdateVendor(selectedVendor.id, vendor);
            setSelectedVendor(null);
          }}
          onCancel={() => setSelectedVendor(null)}
        />
      )}

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => {
          const vendorType = vendorTypes.find(v => v.id === vendor.type);
          const status = connectionStatus[vendor.id];

          return (
            <div
              key={vendor.id}
              className={`p-6 rounded-xl border backdrop-blur-sm cursor-pointer transition-all ${
                selectedVendor?.id === vendor.id
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/30'
              }`}
              onClick={() => setSelectedVendor(vendor)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    vendor.enabled
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-gray-500/10 border border-gray-500/30'
                  }`}>
                    {vendorType ? (
                      <vendorType.icon className={`w-5 h-5 text-${vendorType.color}-400`} />
                    ) : (
                      <Server className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{vendor.name}</h3>
                    <p className="text-xs text-gray-400 capitalize">
                      {vendor.type.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {status === 'connected' && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                  {status === 'error' && (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  {status === 'connecting' && (
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Host:</span>
                  <span className="text-white">{vendor.host || 'Not configured'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Port:</span>
                  <span className="text-white">{vendor.port || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Status:</span>
                  <span className={`font-medium ${
                    vendor.enabled ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {vendor.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      testConnection(vendor.id);
                    }}
                    className="p-1 hover:bg-blue-500/20 rounded"
                    title="Test connection"
                  >
                    <Wifi className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVendor(vendor);
                    }}
                    className="p-1 hover:bg-blue-500/20 rounded"
                    title="Edit vendor"
                  >
                    <Edit className="w-4 h-4 text-blue-400" />
                  </button>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteVendor(vendor.id);
                  }}
                  className="p-1 hover:bg-red-500/20 rounded"
                  title="Delete vendor"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          );
        })}

        {vendors.length === 0 && (
          <div className="col-span-full text-center py-12 bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl">
            <Server className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
            <p className="text-gray-400 mb-4">No firewall vendors configured</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:opacity-90 transition-opacity"
            >
              Add Your First Vendor
            </button>
          </div>
        )}
      </div>

      {/* Vendor Details Panel */}
      {selectedVendor && (
        <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Vendor Configuration
            </h3>
            <button
              onClick={() => setSelectedVendor(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Vendor Name</label>
                <p className="text-white font-medium">{selectedVendor.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Type</label>
                <p className="text-white capitalize">{selectedVendor.type.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Host</label>
                <p className="text-white">{selectedVendor.host || 'Not configured'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Port</label>
                <p className="text-white">{selectedVendor.port || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Status</label>
                <p className={`font-medium ${
                  selectedVendor.enabled ? 'text-green-400' : 'text-red-400'
                }`}>
                  {selectedVendor.enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Authentication</label>
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-gray-400" />
                  <p className="text-white">
                    {selectedVendor.username ? 'Username/Password' :
                     selectedVendor.apiKey ? 'API Key' : 'Not configured'}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400">Region</label>
                <p className="text-white">{selectedVendor.region || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Last Connected</label>
                <p className="text-white">
                  {selectedVendor.last_connected ? new Date(selectedVendor.last_connected).toLocaleString() : 'Never'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Connection Status</label>
                <div className="flex items-center gap-2">
                  {connectionStatus[selectedVendor.id] === 'connected' && (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Connected</span>
                    </>
                  )}
                  {connectionStatus[selectedVendor.id] === 'error' && (
                    <>
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400">Connection failed</span>
                    </>
                  )}
                  {connectionStatus[selectedVendor.id] === 'connecting' && (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-blue-400">Testing...</span>
                    </>
                  )}
                  {!connectionStatus[selectedVendor.id] && (
                    <>
                      <AlertTriangle className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Not tested</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {selectedVendor.config && Object.keys(selectedVendor.config).length > 0 && (
            <div className="mt-6">
              <label className="text-sm text-gray-400">Advanced Configuration</label>
              <div className="mt-2 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(selectedVendor.config, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => testConnection(selectedVendor.id)}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              Test Connection
            </button>
            <button
              onClick={() => setSelectedVendor(selectedVendor)}
              className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Edit Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;