/**
 * Audit Log Model
 * Immutable audit trail for all system actions
 */

import mongoose, { Schema, Document } from 'mongoose';

export type AuditAction = 
  | 'scan.url'
  | 'scan.email'
  | 'scan.phone'
  | 'scan.ip'
  | 'scan.password'
  | 'transaction.create'
  | 'transaction.analyze'
  | 'transaction.update'
  | 'transaction.delete'
  | 'alert.create'
  | 'alert.update'
  | 'alert.delete'
  | 'alert.trigger'
  | 'user.login'
  | 'user.logout'
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  | 'user.password_change'
  | 'user.password_reset'
  | 'apikey.create'
  | 'apikey.revoke'
  | 'apikey.use'
  | 'report.generate'
  | 'report.export'
  | 'settings.update'
  | 'threat_intel.add'
  | 'threat_intel.update'
  | 'threat_intel.delete'
  | 'system.startup'
  | 'system.shutdown'
  | 'system.error';

export type ResourceType = 
  | 'scan_result'
  | 'transaction'
  | 'fraud_score'
  | 'alert'
  | 'user'
  | 'api_key'
  | 'report'
  | 'threat_intel'
  | 'settings'
  | 'system';

export interface IAuditLog extends Document {
  action: AuditAction;
  resource_type: ResourceType;
  resource_id?: string;
  user_id?: string;
  user_email?: string;
  ip_address: string;
  user_agent?: string;
  request_id?: string;
  details: Record<string, any>;
  status: 'success' | 'failure';
  error_message?: string;
  duration_ms?: number;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  action: {
    type: String,
    required: true,
    index: true,
  },
  resource_type: {
    type: String,
    required: true,
    index: true,
  },
  resource_id: {
    type: String,
    index: true,
    sparse: true,
  },
  user_id: {
    type: String,
    index: true,
    sparse: true,
  },
  user_email: {
    type: String,
    index: true,
    sparse: true,
  },
  ip_address: {
    type: String,
    required: true,
    index: true,
  },
  user_agent: {
    type: String,
  },
  request_id: {
    type: String,
    index: true,
    sparse: true,
  },
  details: {
    type: Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    required: true,
    index: true,
  },
  error_message: {
    type: String,
  },
  duration_ms: {
    type: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  // Make collection capped for performance (auto-cleanup old logs)
  // In production, consider using TTL index instead for more control
  timestamps: false,
});

// Indexes for common queries
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ user_id: 1, timestamp: -1 });
AuditLogSchema.index({ resource_type: 1, resource_id: 1, timestamp: -1 });
AuditLogSchema.index({ ip_address: 1, timestamp: -1 });
AuditLogSchema.index({ status: 1, timestamp: -1 });

// Static method to log an action
AuditLogSchema.statics.logAction = async function(
  action: AuditAction,
  resourceType: ResourceType,
  data: {
    resourceId?: string;
    userId?: string;
    userEmail?: string;
    ipAddress: string;
    userAgent?: string;
    requestId?: string;
    details?: Record<string, any>;
    status: 'success' | 'failure';
    errorMessage?: string;
    durationMs?: number;
  }
): Promise<IAuditLog> {
  return this.create({
    action,
    resource_type: resourceType,
    resource_id: data.resourceId,
    user_id: data.userId,
    user_email: data.userEmail,
    ip_address: data.ipAddress,
    user_agent: data.userAgent,
    request_id: data.requestId,
    details: data.details || {},
    status: data.status,
    error_message: data.errorMessage,
    duration_ms: data.durationMs,
    timestamp: new Date(),
  });
};

// Static method to get logs by user
AuditLogSchema.statics.getByUser = function(userId: string, limit: number = 100) {
  return this.find({ user_id: userId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get logs by resource
AuditLogSchema.statics.getByResource = function(resourceType: ResourceType, resourceId: string, limit: number = 100) {
  return this.find({ resource_type: resourceType, resource_id: resourceId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get recent errors
AuditLogSchema.statics.getRecentErrors = function(limit: number = 100) {
  return this.find({ status: 'failure' })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get action counts by time period
AuditLogSchema.statics.getActionStats = async function(startDate: Date, endDate: Date) {
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        success_count: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        failure_count: {
          $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] }
        },
        avg_duration_ms: { $avg: '$duration_ms' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
