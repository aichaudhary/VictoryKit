import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle, AlertCircle, XCircle, ChevronRight,
  FileText, ExternalLink, Filter, BarChart3
} from 'lucide-react';

interface Policy {
  id: string;
  name: string;
  category: string;
  status: 'draft' | 'pending_approval' | 'active' | 'archived';
  complianceStatus: 'compliant' | 'non_compliant' | 'partial';
  framework: string;
  controls: string[];
}

interface Props {
  policies: Policy[];
}

const ComplianceMapping: React.FC<Props> = ({ policies }) => {
  const [selectedFramework, setSelectedFramework] = useState('nist');

  const frameworks = [
    { 
      id: 'nist', 
      name: 'NIST 800-53', 
      version: 'Rev. 5',
      coverage: 85,
      totalControls: 142,
      implementedControls: 121,
      categories: [
        { name: 'Access Control (AC)', controls: 25, implemented: 22 },
        { name: 'Audit & Accountability (AU)', controls: 16, implemented: 14 },
        { name: 'Configuration Management (CM)', controls: 14, implemented: 12 },
        { name: 'Identification & Authentication (IA)', controls: 12, implemented: 11 },
        { name: 'Incident Response (IR)', controls: 10, implemented: 8 },
        { name: 'System & Communications Protection (SC)', controls: 51, implemented: 42 },
      ]
    },
    { 
      id: 'iso', 
      name: 'ISO 27001', 
      version: '2022',
      coverage: 78,
      totalControls: 93,
      implementedControls: 73,
      categories: [
        { name: 'A.5 Information Security Policies', controls: 2, implemented: 2 },
        { name: 'A.6 Organization of Information Security', controls: 7, implemented: 6 },
        { name: 'A.7 Human Resource Security', controls: 6, implemented: 5 },
        { name: 'A.8 Asset Management', controls: 10, implemented: 8 },
        { name: 'A.9 Access Control', controls: 14, implemented: 12 },
        { name: 'A.12 Operations Security', controls: 14, implemented: 10 },
      ]
    },
    { 
      id: 'cis', 
      name: 'CIS Controls', 
      version: 'v8',
      coverage: 92,
      totalControls: 18,
      implementedControls: 17,
      categories: [
        { name: 'CIS 1: Inventory of Assets', controls: 1, implemented: 1 },
        { name: 'CIS 2: Inventory of Software', controls: 1, implemented: 1 },
        { name: 'CIS 3: Data Protection', controls: 1, implemented: 1 },
        { name: 'CIS 4: Secure Configuration', controls: 1, implemented: 1 },
        { name: 'CIS 5: Account Management', controls: 1, implemented: 1 },
        { name: 'CIS 6: Access Control Management', controls: 1, implemented: 1 },
      ]
    },
    { 
      id: 'gdpr', 
      name: 'GDPR', 
      version: '2018',
      coverage: 72,
      totalControls: 28,
      implementedControls: 20,
      categories: [
        { name: 'Article 5: Principles', controls: 6, implemented: 5 },
        { name: 'Article 6: Lawfulness', controls: 4, implemented: 3 },
        { name: 'Article 12-14: Transparency', controls: 6, implemented: 4 },
        { name: 'Article 15-22: Rights', controls: 8, implemented: 5 },
        { name: 'Article 32: Security', controls: 4, implemented: 3 },
      ]
    },
  ];

  const activeFramework = frameworks.find(f => f.id === selectedFramework) || frameworks[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compliance Mapping</h1>
          <p className="text-gray-400 mt-1">Map policies to regulatory frameworks</p>
        </div>
        <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Generate Report
        </button>
      </div>

      {/* Framework Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {frameworks.map((fw) => (
          <button
            key={fw.id}
            onClick={() => setSelectedFramework(fw.id)}
            className={`p-4 rounded-xl border transition-all ${
              selectedFramework === fw.id
                ? 'bg-violet-600 border-violet-500'
                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <ShieldCheck className={`w-5 h-5 ${selectedFramework === fw.id ? 'text-white' : 'text-violet-400'}`} />
              <span className={`text-xs ${selectedFramework === fw.id ? 'text-violet-200' : 'text-gray-500'}`}>
                {fw.version}
              </span>
            </div>
            <h3 className="font-semibold text-left">{fw.name}</h3>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${selectedFramework === fw.id ? 'bg-white' : 'bg-violet-500'}`}
                  style={{ width: `${fw.coverage}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${selectedFramework === fw.id ? 'text-white' : 'text-gray-400'}`}>
                {fw.coverage}%
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Framework Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">{activeFramework.name} Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Controls</span>
              <span className="font-semibold">{activeFramework.totalControls}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Implemented</span>
              <span className="font-semibold text-green-400">{activeFramework.implementedControls}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Gaps</span>
              <span className="font-semibold text-red-400">{activeFramework.totalControls - activeFramework.implementedControls}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Coverage</span>
              <span className={`font-semibold ${activeFramework.coverage >= 80 ? 'text-green-400' : activeFramework.coverage >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {activeFramework.coverage}%
              </span>
            </div>
            <div className="pt-4 border-t border-gray-700">
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${activeFramework.coverage >= 80 ? 'bg-green-500' : activeFramework.coverage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${activeFramework.coverage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Control Categories */}
        <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Control Categories</h2>
          <div className="space-y-3">
            {activeFramework.categories.map((cat, idx) => (
              <div key={idx} className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {cat.implemented}/{cat.controls} controls
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${(cat.implemented / cat.controls) >= 0.8 ? 'bg-green-500' : (cat.implemented / cat.controls) >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${(cat.implemented / cat.controls) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12 text-right">
                    {Math.round((cat.implemented / cat.controls) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mapped Policies */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Policies Mapped to {activeFramework.name}</h2>
        <div className="space-y-3">
          {policies.filter(p => p.status === 'active').map((policy) => (
            <div key={policy.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h4 className="font-medium">{policy.name}</h4>
                  <p className="text-sm text-gray-400">{policy.controls.length} controls mapped</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`flex items-center gap-1 text-sm ${
                  policy.complianceStatus === 'compliant' ? 'text-green-400' :
                  policy.complianceStatus === 'partial' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {policy.complianceStatus === 'compliant' ? <CheckCircle className="w-4 h-4" /> :
                   policy.complianceStatus === 'partial' ? <AlertCircle className="w-4 h-4" /> :
                   <XCircle className="w-4 h-4" />}
                  {policy.complianceStatus}
                </span>
                <button className="p-2 hover:bg-gray-600 rounded-lg">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplianceMapping;
