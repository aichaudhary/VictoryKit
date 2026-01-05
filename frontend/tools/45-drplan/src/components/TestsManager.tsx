import React, { useState } from 'react';
import { 
  FlaskConical, Plus, Play, CheckCircle, XCircle, 
  Clock, Calendar, Users, Trash2, BarChart3
} from 'lucide-react';
import { DRTest } from '../types';
import { formatDate, formatDateTime, TEST_TYPE_LABELS } from '../constants';

interface TestsManagerProps {
  tests: DRTest[];
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
}

const TestsManager: React.FC<TestsManagerProps> = ({ 
  tests, onStart, onComplete, onCancel, onDelete 
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredTests = tests.filter(test => 
    filterStatus === 'all' || test.status === filterStatus
  );

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-500',
    in_progress: 'bg-yellow-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
    cancelled: 'bg-slate-500',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">DR Tests</h2>
          <p className="text-slate-400">Schedule and manage disaster recovery tests</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
          <Plus className="w-4 h-4" />
          Schedule Test
        </button>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2">
        {['all', 'scheduled', 'in_progress', 'completed', 'failed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filterStatus === status 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {status === 'all' ? 'All Tests' : status.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tests Grid */}
      <div className="grid gap-4">
        {filteredTests.map((test) => (
          <div key={test._id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${statusColors[test.status]}`}>
                  <FlaskConical className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{test.name}</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300">
                      {TEST_TYPE_LABELS[test.type as keyof typeof TEST_TYPE_LABELS]}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      test.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      test.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                      test.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                      test.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {test.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6 mt-3 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Scheduled: {formatDateTime(test.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{test.participants.length} participants</span>
                    </div>
                    <span>{test.systems.length} systems</span>
                  </div>

                  {/* Results if completed */}
                  {test.results && (
                    <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                      <h4 className="text-sm font-semibold text-slate-300 mb-3">Test Results</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">RTO Achieved</p>
                          <p className="text-lg font-semibold text-white">{test.results.rtoAchieved}m</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">RPO Achieved</p>
                          <p className="text-lg font-semibold text-white">{test.results.rpoAchieved}m</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Success Rate</p>
                          <p className={`text-lg font-semibold ${
                            test.results.successRate >= 90 ? 'text-green-400' :
                            test.results.successRate >= 70 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {test.results.successRate}%
                          </p>
                        </div>
                      </div>
                      {test.results.issues.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-slate-500 mb-1">Issues Found:</p>
                          <ul className="text-sm text-red-400 list-disc list-inside">
                            {test.results.issues.slice(0, 3).map((issue, i) => (
                              <li key={i}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {test.status === 'scheduled' && (
                  <button 
                    onClick={() => onStart(test._id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                  >
                    <Play className="w-4 h-4" />
                    Start
                  </button>
                )}
                {test.status === 'in_progress' && (
                  <>
                    <button 
                      onClick={() => onComplete(test._id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </button>
                    <button 
                      onClick={() => onCancel(test._id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                )}
                {test.status === 'completed' && (
                  <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition">
                    <BarChart3 className="w-4 h-4" />
                    Report
                  </button>
                )}
                <button 
                  onClick={() => onDelete(test._id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No tests found</p>
        </div>
      )}
    </div>
  );
};

export default TestsManager;
