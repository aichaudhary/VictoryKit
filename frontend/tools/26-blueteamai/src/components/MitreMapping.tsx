import React from 'react';
import { Grid, ExternalLink, AlertTriangle, ChevronRight } from 'lucide-react';
import { MitreTechnique } from '../types';
import { MITRE_TACTICS } from '../constants';

interface MitreMappingProps {
  techniques: MitreTechnique[];
  onSelectTechnique: (technique: MitreTechnique) => void;
  selectedTechniqueId?: string;
}

const MitreMapping: React.FC<MitreMappingProps> = ({
  techniques,
  onSelectTechnique,
  selectedTechniqueId
}) => {
  const [selectedTactic, setSelectedTactic] = React.useState<string | null>(null);

  // Group techniques by tactic
  const techniquesByTactic: Record<string, MitreTechnique[]> = {};
  techniques.forEach(tech => {
    if (!techniquesByTactic[tech.tactic]) {
      techniquesByTactic[tech.tactic] = [];
    }
    techniquesByTactic[tech.tactic].push(tech);
  });

  const selectedTechnique = techniques.find(t => t.id === selectedTechniqueId);

  return (
    <div className="h-full flex bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
      {/* Tactics Sidebar */}
      <div className="w-64 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Grid className="w-5 h-5 text-red-400" />
            MITRE ATT&CK
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {MITRE_TACTICS.map((tactic) => {
            const count = techniquesByTactic[tactic.id]?.length || 0;
            return (
              <button
                key={tactic.id}
                onClick={() => setSelectedTactic(selectedTactic === tactic.id ? null : tactic.id)}
                className={`w-full p-3 rounded-lg text-left transition-all mb-1 ${
                  selectedTactic === tactic.id 
                    ? 'bg-red-500/20 border border-red-500/30' 
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{tactic.name}</span>
                  {count > 0 && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-bold">
                      {count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{tactic.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Techniques List */}
      <div className="w-80 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-bold text-white">
            {selectedTactic 
              ? MITRE_TACTICS.find(t => t.id === selectedTactic)?.name 
              : 'All'} Techniques
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {(selectedTactic ? techniquesByTactic[selectedTactic] || [] : techniques).map((technique) => (
            <div
              key={technique.id}
              onClick={() => onSelectTechnique(technique)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedTechniqueId === technique.id 
                  ? 'bg-red-500/20 border-red-500/50' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-mono font-bold">
                  {technique.id}
                </span>
                <ChevronRight className="w-3 h-3 text-gray-500 ml-auto" />
              </div>
              <h4 className="text-sm font-medium text-white">{technique.name}</h4>
              <span className="text-xs text-purple-400">{technique.tactic}</span>
            </div>
          ))}

          {(selectedTactic ? techniquesByTactic[selectedTactic] || [] : techniques).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Grid className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No techniques found</p>
            </div>
          )}
        </div>
      </div>

      {/* Technique Details */}
      <div className="flex-1 flex flex-col">
        {selectedTechnique ? (
          <>
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm font-mono font-bold">
                  {selectedTechnique.id}
                </span>
                {selectedTechnique.sub_techniques && (
                  <span className="text-xs text-gray-500">
                    {selectedTechnique.sub_techniques.length} sub-techniques
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{selectedTechnique.name}</h2>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                {selectedTechnique.tactic}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedTechnique.description && (
                <div>
                  <h3 className="text-sm font-bold text-white mb-2">Description</h3>
                  <p className="text-sm text-gray-400">{selectedTechnique.description}</p>
                </div>
              )}

              {selectedTechnique.detection && (
                <div>
                  <h3 className="text-sm font-bold text-white mb-2">Detection</h3>
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-sm text-blue-300">{selectedTechnique.detection}</p>
                  </div>
                </div>
              )}

              {selectedTechnique.mitigation && (
                <div>
                  <h3 className="text-sm font-bold text-white mb-2">Mitigation</h3>
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-sm text-green-300">{selectedTechnique.mitigation}</p>
                  </div>
                </div>
              )}

              {selectedTechnique.sub_techniques && selectedTechnique.sub_techniques.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-white mb-2">Sub-Techniques</h3>
                  <div className="space-y-2">
                    {selectedTechnique.sub_techniques.map((sub) => (
                      <div key={sub} className="p-2 bg-white/5 rounded-lg border border-white/10">
                        <span className="text-sm text-white font-mono">{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <a 
                href={`https://attack.mitre.org/techniques/${selectedTechnique.id.replace('.', '/')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on MITRE ATT&CK
              </a>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Grid className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Select a Technique</p>
              <p className="text-sm">Choose a MITRE ATT&CK technique to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MitreMapping;
