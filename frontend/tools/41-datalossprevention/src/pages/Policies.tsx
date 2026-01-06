/**
 * Policy Management Page
 * Create, edit, test, and manage DLP policies
 */

import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit, Trash2, TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getPolicies, createPolicy, updatePolicy, deletePolicy, testPolicy, getPolicyTemplates } from '../services/api';

const Policies: React.FC = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    loadPolicies();
    loadTemplates();
  }, []);

  const loadPolicies = async () => {
    try {
      const response = await getPolicies();
      setPolicies(response.data || []);
    } catch (error) {
      console.error('Failed to load policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await getPolicyTemplates();
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;
    
    try {
      await deletePolicy(id);
      loadPolicies();
    } catch (error) {
      console.error('Failed to delete policy:', error);
      alert('Failed to delete policy');
    }
  };

  const handleTestPolicy = async () => {
    if (!selectedPolicy || !testInput) return;
    
    try {
      const response = await testPolicy(selectedPolicy.policyId, testInput);
      setTestResult(response.data);
    } catch (error) {
      console.error('Failed to test policy:', error);
      alert('Failed to test policy');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getFrameworkColor = (framework: string) => {
    const colors: any = {
      GDPR: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      HIPAA: 'bg-green-500/20 text-green-400 border-green-500/30',
      'PCI-DSS': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      SOC2: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      ISO27001: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      CCPA: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      Custom: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[framework] || colors.Custom;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dlp-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dlp-darker via-dlp-dark to-dlp-darker p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Policy Management</h1>
            <p className="text-gray-400">Create and manage DLP policies across frameworks</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-dlp-primary to-dlp-accent rounded-lg hover:shadow-glow-blue transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Create Policy</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Total Policies</p>
          <p className="text-3xl font-bold text-white">{policies.length}</p>
        </div>
        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Active</p>
          <p className="text-3xl font-bold text-green-500">
            {policies.filter(p => p.enabled).length}
          </p>
        </div>
        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Total Violations</p>
          <p className="text-3xl font-bold text-red-500">
            {policies.reduce((sum, p) => sum + (p.statistics?.violations || 0), 0)}
          </p>
        </div>
        <div className="bg-dlp-dark/50 rounded-xl p-6 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Avg Effectiveness</p>
          <p className="text-3xl font-bold text-dlp-primary">
            {policies.length > 0
              ? Math.round(policies.reduce((sum, p) => sum + (p.statistics?.effectiveness || 0), 0) / policies.length)
              : 0}%
          </p>
        </div>
      </div>

      {/* Policies List */}
      <div className="bg-gradient-to-br from-dlp-dark to-gray-900 rounded-2xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">All Policies</h2>

        <div className="space-y-4">
          {policies.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No policies yet</p>
              <p className="text-sm">Create your first DLP policy to start protecting data</p>
            </div>
          ) : (
            policies.map((policy) => (
              <div
                key={policy.policyId}
                className="bg-dlp-darker/50 rounded-lg p-6 border border-gray-700/50 hover:border-dlp-primary/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-semibold text-white">{policy.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(policy.severity)}`}>
                        {policy.severity}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getFrameworkColor(policy.framework)}`}>
                        {policy.framework}
                      </span>
                      {policy.enabled ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
                          Disabled
                        </span>
                      )}
                    </div>

                    <p className="text-gray-400 mb-4">{policy.description}</p>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Violations</p>
                        <p className="text-lg font-semibold text-red-400">
                          {policy.statistics?.violations || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Blocked</p>
                        <p className="text-lg font-semibold text-orange-400">
                          {policy.statistics?.blocked || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Effectiveness</p>
                        <p className="text-lg font-semibold text-green-400">
                          {policy.statistics?.effectiveness || 0}%
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {policy.conditions?.dataTypes?.map((type: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-dlp-primary/10 text-dlp-primary text-xs rounded-md"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setShowTestModal(true);
                        setTestResult(null);
                      }}
                      className="p-2 bg-dlp-accent/20 text-dlp-accent rounded-lg hover:bg-dlp-accent/30 transition-all"
                      title="Test Policy"
                    >
                      <TestTube className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setShowCreateModal(true);
                      }}
                      className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                      title="Edit Policy"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeletePolicy(policy.policyId)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                      title="Delete Policy"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Test Policy Modal */}
      {showTestModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-dlp-dark rounded-2xl p-8 border border-gray-700 max-w-2xl w-full mx-4">
            <h3 className="text-2xl font-bold text-white mb-6">
              Test Policy: {selectedPolicy.name}
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Test Input
              </label>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="w-full px-4 py-3 bg-dlp-darker border border-gray-700 rounded-lg text-white focus:outline-none focus:border-dlp-primary"
                rows={6}
                placeholder="Enter text to test against this policy..."
              />
            </div>

            {testResult && (
              <div className={`p-4 rounded-lg border mb-6 ${
                testResult.matched 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-green-500/10 border-green-500/30'
              }`}>
                <div className="flex items-center space-x-3 mb-3">
                  {testResult.matched ? (
                    <>
                      <XCircle className="w-6 h-6 text-red-400" />
                      <span className="text-lg font-semibold text-red-400">Policy Violation Detected</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <span className="text-lg font-semibold text-green-400">No Violation</span>
                    </>
                  )}
                </div>
                {testResult.matched && testResult.matches && (
                  <div className="text-sm text-gray-300">
                    <p className="mb-2">Matched patterns:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {testResult.matches.map((match: any, idx: number) => (
                        <li key={idx}>{match.pattern} - {match.value}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowTestModal(false);
                  setSelectedPolicy(null);
                  setTestInput('');
                  setTestResult(null);
                }}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Close
              </button>
              <button
                onClick={handleTestPolicy}
                className="px-6 py-3 bg-gradient-to-r from-dlp-primary to-dlp-accent text-white rounded-lg hover:shadow-glow-blue transition-all"
              >
                Test Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Policies;
