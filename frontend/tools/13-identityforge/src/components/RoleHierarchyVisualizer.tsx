/**
 * Role Hierarchy Visualizer Component
 * Interactive tree showing role inheritance and permissions
 */

import React, { useState } from 'react';
import type { Role, RoleHierarchy } from '../types/iam.types';
import { mockRoles, buildRoleHierarchy } from '../api/iam.api';

const RoleHierarchyVisualizer: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set(['super-admin', 'admin', 'director', 'manager']));
  
  const hierarchy = buildRoleHierarchy();

  const toggleExpand = (roleId: string) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
  };

  const RoleNode: React.FC<{ node: RoleHierarchy; isLast?: boolean }> = ({ node, isLast = false }) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedRoles.has(node.role.id);
    const isSelected = selectedRole?.id === node.role.id;

    return (
      <div className="relative">
        {/* Connector Lines */}
        {node.level > 0 && (
          <>
            <div className="absolute -left-6 top-5 w-6 h-0.5 bg-gray-700" />
            {!isLast && <div className="absolute -left-6 top-5 w-0.5 h-full bg-gray-700" />}
          </>
        )}

        {/* Role Card */}
        <div
          onClick={() => setSelectedRole(node.role)}
          className={`relative p-4 rounded-lg border cursor-pointer transition-all mb-2 ${
            isSelected 
              ? 'bg-blue-900/30 border-blue-500 shadow-lg shadow-blue-500/20' 
              : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(node.role.id);
                  }}
                  className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-600 transition-colors"
                >
                  {isExpanded ? '−' : '+'}
                </button>
              )}
              {!hasChildren && <div className="w-6" />}
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {node.role.isPrivileged ? '👑' : node.role.isSystem ? '⚙️' : '🎭'}
                  </span>
                  <h4 className="font-semibold text-white">{node.role.displayName}</h4>
                  {node.role.isPrivileged && (
                    <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">Privileged</span>
                  )}
                  {node.role.isSystem && (
                    <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">System</span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">{node.role.description}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">{node.role.userCount} users</p>
              <p className="text-xs text-cyan-400">{node.totalPermissions.length} permissions</p>
            </div>
          </div>

          {/* Permission Preview */}
          <div className="mt-3 flex flex-wrap gap-1">
            {node.role.permissions.slice(0, 5).map((perm, idx) => (
              <span 
                key={idx}
                className="px-2 py-0.5 text-xs bg-gray-900 text-gray-400 rounded font-mono"
              >
                {perm}
              </span>
            ))}
            {node.role.permissions.length > 5 && (
              <span className="px-2 py-0.5 text-xs bg-gray-900 text-gray-500 rounded">
                +{node.role.permissions.length - 5} more
              </span>
            )}
          </div>

          {/* Inherited Indicator */}
          {node.inheritedPermissions.length > 0 && (
            <div className="mt-2 text-xs text-green-400">
              ↑ Inherits {node.inheritedPermissions.length} permissions from parent
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-8 border-l border-gray-700 pl-6">
            {node.children.map((child, idx) => (
              <RoleNode 
                key={child.role.id} 
                node={child} 
                isLast={idx === node.children.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/20">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <span className="text-2xl">🌳</span>
          Role Hierarchy
        </h2>
        <p className="text-gray-400">
          Visualize role inheritance and permission flow. Click on any role to see detailed information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hierarchy Tree */}
        <div className="lg:col-span-2 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Role Tree</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setExpandedRoles(new Set(mockRoles.map(r => r.id)))}
                className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={() => setExpandedRoles(new Set())}
                className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            {hierarchy.map((root, idx) => (
              <RoleNode key={root.role.id} node={root} isLast={idx === hierarchy.length - 1} />
            ))}
          </div>
        </div>

        {/* Role Details Panel */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Role Details</h3>
          
          {selectedRole ? (
            <div className="space-y-6">
              {/* Role Header */}
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">
                    {selectedRole.isPrivileged ? '👑' : selectedRole.isSystem ? '⚙️' : '🎭'}
                  </span>
                  <h4 className="text-xl font-bold text-white">{selectedRole.displayName}</h4>
                </div>
                <p className="text-gray-400 text-sm">{selectedRole.description}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                  <p className="text-2xl font-bold text-blue-400">{selectedRole.userCount}</p>
                  <p className="text-xs text-gray-400">Users</p>
                </div>
                <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                  <p className="text-2xl font-bold text-purple-400">{selectedRole.permissions.length}</p>
                  <p className="text-xs text-gray-400">Direct Permissions</p>
                </div>
              </div>

              {/* Properties */}
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Properties</h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-900/30 rounded">
                    <span className="text-gray-400">System Role</span>
                    <span className={selectedRole.isSystem ? 'text-green-400' : 'text-gray-500'}>{selectedRole.isSystem ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-900/30 rounded">
                    <span className="text-gray-400">Privileged</span>
                    <span className={selectedRole.isPrivileged ? 'text-red-400' : 'text-gray-500'}>{selectedRole.isPrivileged ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-900/30 rounded">
                    <span className="text-gray-400">Requires MFA</span>
                    <span className={selectedRole.requiresMFA ? 'text-yellow-400' : 'text-gray-500'}>{selectedRole.requiresMFA ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-900/30 rounded">
                    <span className="text-gray-400">Requires Approval</span>
                    <span className={selectedRole.requiresApproval ? 'text-orange-400' : 'text-gray-500'}>{selectedRole.requiresApproval ? 'Yes' : 'No'}</span>
                  </div>
                  {selectedRole.parentRole && (
                    <div className="flex justify-between items-center p-2 bg-gray-900/30 rounded">
                      <span className="text-gray-400">Parent Role</span>
                      <span className="text-cyan-400">{selectedRole.parentRole}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Direct Permissions</h5>
                <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                  {selectedRole.permissions.map((perm, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-gray-900/30 rounded"
                    >
                      <span className="text-green-400">✓</span>
                      <code className="text-sm text-cyan-400 font-mono">{perm}</code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approvers */}
              {selectedRole.approvers && selectedRole.approvers.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Approvers</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedRole.approvers.map((approver, idx) => (
                      <span key={idx} className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded text-sm">
                        {approver}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-4xl">🎭</span>
              <p className="text-gray-400 mt-4">Select a role from the tree to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span>👑</span>
            <span className="text-sm text-gray-400">Privileged Role</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚙️</span>
            <span className="text-sm text-gray-400">System Role</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🎭</span>
            <span className="text-sm text-gray-400">Custom Role</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-gray-700"></span>
            <span className="text-sm text-gray-400">Inheritance</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleHierarchyVisualizer;
