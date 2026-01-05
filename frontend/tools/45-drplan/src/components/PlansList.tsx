import React, { useState } from 'react';
import { 
  FileText, Plus, Edit2, Trash2, Copy, Download, 
  CheckCircle, Clock, Archive, Eye, Play
} from 'lucide-react';
import { RecoveryPlan } from '../types';
import { formatDate, formatMinutes, PLAN_STATUS_COLORS } from '../constants';

interface PlansListProps {
  plans: RecoveryPlan[];
  onActivate: (id: string) => void;
  onArchive: (id: string) => void;
  onClone: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
}

const PlansList: React.FC<PlansListProps> = ({ 
  plans, onActivate, onArchive, onClone, onDelete, onExport 
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredPlans = plans.filter(plan => 
    filter === 'all' || plan.status === filter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Recovery Plans</h2>
          <p className="text-slate-400">Manage disaster recovery plans and procedures</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          New Plan
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'active', 'draft', 'under_review', 'archived'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === status 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {status === 'all' ? 'All Plans' : status.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Plans Grid */}
      <div className="grid gap-4">
        {filteredPlans.map((plan) => (
          <div key={plan._id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${PLAN_STATUS_COLORS[plan.status]}`}>
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                    <span className="text-sm text-slate-400">v{plan.version}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      plan.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      plan.status === 'draft' ? 'bg-gray-500/20 text-gray-400' :
                      plan.status === 'under_review' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {plan.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1">{plan.description}</p>
                  
                  <div className="flex items-center gap-6 mt-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>RTO: {formatMinutes(plan.objectives.rto)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>RPO: {formatMinutes(plan.objectives.rpo)}</span>
                    </div>
                    <span className="text-slate-400">{plan.systems.length} systems</span>
                    <span className="text-slate-400">{plan.runbooks.length} runbooks</span>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                    <span>Owner: {plan.owner}</span>
                    <span>•</span>
                    <span>Updated: {formatDate(plan.updatedAt)}</span>
                    {plan.lastTestedAt && (
                      <>
                        <span>•</span>
                        <span>Last Test: {formatDate(plan.lastTestedAt)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onExport(plan._id)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                  title="Export"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onClone(plan._id)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                  title="Clone"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {plan.status === 'draft' && (
                  <button 
                    onClick={() => onActivate(plan._id)}
                    className="p-2 text-green-400 hover:text-green-300 hover:bg-slate-700 rounded-lg transition"
                    title="Activate"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                {plan.status === 'active' && (
                  <button 
                    onClick={() => onArchive(plan._id)}
                    className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-slate-700 rounded-lg transition"
                    title="Archive"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => onDelete(plan._id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No recovery plans found</p>
        </div>
      )}
    </div>
  );
};

export default PlansList;
