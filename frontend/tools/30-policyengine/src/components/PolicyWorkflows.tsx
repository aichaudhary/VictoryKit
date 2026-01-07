import React, { useState } from 'react';
import { 
  GitBranch, CheckCircle, Clock, XCircle, User, FileText,
  ChevronRight, MessageSquare, Check, X, AlertCircle
} from 'lucide-react';

interface Policy {
  id: string;
  name: string;
  category: string;
  status: 'draft' | 'pending_approval' | 'active' | 'archived';
  owner: string;
}

interface Props {
  policies: Policy[];
}

interface ApprovalRequest {
  id: string;
  policyId: string;
  policyName: string;
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvers: { name: string; status: 'pending' | 'approved' | 'rejected'; date?: Date }[];
  comments: { user: string; text: string; date: Date }[];
}

const PolicyWorkflows: React.FC<Props> = ({ policies }) => {
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);

  const pendingApprovals: ApprovalRequest[] = [
    {
      id: '1',
      policyId: '3',
      policyName: 'Incident Response Policy',
      requestedBy: 'John Smith',
      requestedAt: new Date(Date.now() - 86400000),
      status: 'pending',
      approvers: [
        { name: 'Security Lead', status: 'approved', date: new Date(Date.now() - 43200000) },
        { name: 'CISO', status: 'pending' },
        { name: 'Compliance Officer', status: 'pending' },
      ],
      comments: [
        { user: 'John Smith', text: 'Updated incident response procedures based on recent tabletop exercises.', date: new Date(Date.now() - 86400000) },
        { user: 'Security Lead', text: 'Approved. Good updates to escalation procedures.', date: new Date(Date.now() - 43200000) },
      ]
    },
    {
      id: '2',
      policyId: '4',
      policyName: 'Remote Work Security Policy',
      requestedBy: 'Sarah Johnson',
      requestedAt: new Date(Date.now() - 172800000),
      status: 'pending',
      approvers: [
        { name: 'IT Director', status: 'approved', date: new Date(Date.now() - 86400000) },
        { name: 'HR Lead', status: 'approved', date: new Date(Date.now() - 43200000) },
        { name: 'CISO', status: 'pending' },
      ],
      comments: [
        { user: 'Sarah Johnson', text: 'New policy to address security requirements for remote workforce.', date: new Date(Date.now() - 172800000) },
      ]
    },
  ];

  const recentWorkflows = [
    { id: '3', policyName: 'Data Classification Policy', action: 'Approved', user: 'CISO', date: new Date(Date.now() - 259200000) },
    { id: '4', policyName: 'Acceptable Use Policy', action: 'Rejected', user: 'Legal', date: new Date(Date.now() - 345600000) },
    { id: '5', policyName: 'Password Policy', action: 'Approved', user: 'Security Lead', date: new Date(Date.now() - 432000000) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Approval Workflows</h1>
          <p className="text-gray-400 mt-1">Manage policy review and approval processes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{pendingApprovals.length}</h3>
              <p className="text-gray-400 text-sm">Pending Approvals</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">12</h3>
              <p className="text-gray-400 text-sm">Approved This Month</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">3.2 days</h3>
              <p className="text-gray-400 text-sm">Avg. Approval Time</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Pending Approvals</h2>
          <div className="space-y-4">
            {pendingApprovals.map((request) => (
              <div 
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                className="p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">{request.policyName}</h4>
                      <p className="text-sm text-gray-400">Requested by {request.requestedBy}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
                
                {/* Approval Progress */}
                <div className="flex items-center gap-2">
                  {request.approvers.map((approver, idx) => (
                    <React.Fragment key={idx}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        approver.status === 'approved' ? 'bg-green-500/20' :
                        approver.status === 'rejected' ? 'bg-red-500/20' : 'bg-gray-600'
                      }`}>
                        {approver.status === 'approved' ? <Check className="w-4 h-4 text-green-400" /> :
                         approver.status === 'rejected' ? <X className="w-4 h-4 text-red-400" /> :
                         <Clock className="w-4 h-4 text-gray-400" />}
                      </div>
                      {idx < request.approvers.length - 1 && (
                        <div className={`flex-1 h-0.5 ${
                          approver.status === 'approved' ? 'bg-green-500' : 'bg-gray-600'
                        }`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  {request.approvers.map((approver, idx) => (
                    <span key={idx} className="truncate max-w-[80px]">{approver.name}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Details or Recent Activity */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          {selectedRequest ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Workflow Details</h2>
                <button onClick={() => setSelectedRequest(null)} className="p-1 hover:bg-gray-700 rounded">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                  <FileText className="w-5 h-5 text-violet-400" />
                  <div>
                    <h4 className="font-medium">{selectedRequest.policyName}</h4>
                    <p className="text-sm text-gray-400">
                      Requested {new Date(selectedRequest.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Approvers</h4>
                  <div className="space-y-2">
                    {selectedRequest.approvers.map((approver, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{approver.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          approver.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          approver.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-600 text-gray-400'
                        }`}>
                          {approver.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Comments</h4>
                  <div className="space-y-2 max-h-40 overflow-auto">
                    {selectedRequest.comments.map((comment, idx) => (
                      <div key={idx} className="p-2 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{comment.user}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-700">
                  <button className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center gap-2">
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentWorkflows.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      item.action === 'Approved' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {item.action === 'Approved' ? 
                        <CheckCircle className="w-5 h-5 text-green-400" /> :
                        <XCircle className="w-5 h-5 text-red-400" />
                      }
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.policyName}</p>
                      <p className="text-xs text-gray-400">{item.action} by {item.user}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyWorkflows;
