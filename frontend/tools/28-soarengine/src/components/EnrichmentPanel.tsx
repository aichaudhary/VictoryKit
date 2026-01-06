import React, { useState } from 'react';
import { 
  Search, Shield, Globe, Hash, Mail, Server, 
  AlertTriangle, CheckCircle, Clock, RefreshCw, ExternalLink 
} from 'lucide-react';
import { EnrichmentSource, EnrichmentResult, CaseArtifact } from '../types';
import { ENRICHMENT_SOURCES } from '../constants';

interface EnrichmentPanelProps {
  sources: EnrichmentSource[];
  recentResults: EnrichmentResult[];
  onEnrich: (type: string, value: string) => Promise<void>;
}

const EnrichmentPanel: React.FC<EnrichmentPanelProps> = ({
  sources,
  recentResults,
  onEnrich,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [inputType, setInputType] = useState<CaseArtifact['type']>('ip');
  const [isEnriching, setIsEnriching] = useState(false);

  const handleEnrich = async () => {
    if (!inputValue.trim()) return;
    setIsEnriching(true);
    await onEnrich(inputType, inputValue);
    setIsEnriching(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ip': return <Server className="w-4 h-4" />;
      case 'domain': return <Globe className="w-4 h-4" />;
      case 'url': return <ExternalLink className="w-4 h-4" />;
      case 'hash_md5':
      case 'hash_sha1':
      case 'hash_sha256': return <Hash className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Enrich */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-purple-400" />
          IOC Enrichment
        </h3>
        
        <div className="flex gap-3">
          <select
            value={inputType}
            onChange={(e) => setInputType(e.target.value as CaseArtifact['type'])}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            title="Select artifact type"
          >
            <option value="ip">IP Address</option>
            <option value="domain">Domain</option>
            <option value="url">URL</option>
            <option value="hash_md5">MD5 Hash</option>
            <option value="hash_sha1">SHA1 Hash</option>
            <option value="hash_sha256">SHA256 Hash</option>
            <option value="email">Email</option>
          </select>
          <input
            type="text"
            placeholder={`Enter ${inputType} to enrich...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleEnrich}
            disabled={isEnriching || !inputValue.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-gray-500 rounded-lg text-white transition-colors"
          >
            {isEnriching ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Enrich
          </button>
        </div>
      </div>

      {/* Enrichment Sources */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Enrichment Sources</h3>
        <div className="grid grid-cols-4 gap-3">
          {sources.map(source => (
            <div
              key={source.id}
              className={`p-3 rounded-lg border ${
                source.is_enabled
                  ? 'bg-slate-800/50 border-slate-700'
                  : 'bg-slate-900/50 border-slate-800 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{source.name}</span>
                {source.is_enabled ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-gray-500" />
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {source.supported_types.map(type => (
                  <span key={type} className="text-xs px-1.5 py-0.5 bg-slate-900 text-gray-400 rounded">
                    {type}
                  </span>
                ))}
              </div>
              {source.last_used && (
                <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(source.last_used).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Enrichments */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Enrichments</h3>
        <div className="space-y-2">
          {recentResults.map(result => (
            <div
              key={result.id}
              className="bg-slate-800/50 rounded-lg border border-slate-700 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 rounded-lg">
                    {getTypeIcon(result.artifact_type)}
                  </div>
                  <div>
                    <code className="text-sm text-purple-400">{result.artifact_value}</code>
                    <div className="text-xs text-gray-500">
                      {result.artifact_type} • {result.source}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {result.is_malicious ? (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                      <AlertTriangle className="w-3 h-3" />
                      Malicious
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                      <Shield className="w-3 h-3" />
                      Clean
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {result.confidence}% confidence
                  </span>
                </div>
              </div>
              
              {/* Result Preview */}
              <div className="mt-2 p-2 bg-slate-900/50 rounded text-xs text-gray-400 font-mono overflow-hidden">
                {JSON.stringify(result.result, null, 2).substring(0, 200)}...
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnrichmentPanel;
