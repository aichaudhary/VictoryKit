/**
 * ScanResult Model
 * Stores all scan results for history and analytics
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IThreat {
  type: string;
  description: string;
  confidence: number;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface IScanResult extends Document {
  scan_id: string;
  scan_type: 'url' | 'email' | 'phone' | 'ip' | 'password';
  input: string;
  result: {
    verdict: 'safe' | 'suspicious' | 'malicious';
    risk_score: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    threats: IThreat[];
    details: Record<string, any>;
    recommendations: string[];
  };
  sources: string[];
  client_ip: string;
  user_id?: string;
  created_at: Date;
  expires_at: Date;
}

const ThreatSchema = new Schema<IThreat>({
  type: { type: String, required: true },
  description: { type: String, required: true },
  confidence: { type: Number, required: true, min: 0, max: 100 },
  source: { type: String, required: true },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
  },
}, { _id: false });

const ScanResultSchema = new Schema<IScanResult>({
  scan_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  scan_type: {
    type: String,
    enum: ['url', 'email', 'phone', 'ip', 'password'],
    required: true,
    index: true,
  },
  input: {
    type: String,
    required: true,
    index: true,
  },
  result: {
    verdict: {
      type: String,
      enum: ['safe', 'suspicious', 'malicious'],
      required: true,
    },
    risk_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    risk_level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    threats: [ThreatSchema],
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    recommendations: [{
      type: String,
    }],
  },
  sources: [{
    type: String,
  }],
  client_ip: {
    type: String,
    required: true,
    index: true,
  },
  user_id: {
    type: String,
    index: true,
    sparse: true,
  },
  expires_at: {
    type: Date,
    required: true,
    index: true,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false },
});

// Indexes for common queries
ScanResultSchema.index({ client_ip: 1, created_at: -1 });
ScanResultSchema.index({ scan_type: 1, created_at: -1 });
ScanResultSchema.index({ 'result.verdict': 1 });
ScanResultSchema.index({ 'result.risk_level': 1 });
ScanResultSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Static method to get recent scans by client IP
ScanResultSchema.statics.getRecentByIP = function(clientIP: string, limit: number = 20) {
  return this.find({ client_ip: clientIP })
    .sort({ created_at: -1 })
    .limit(limit)
    .select('-client_ip');
};

// Static method to get scan statistics
ScanResultSchema.statics.getStats = async function(timeRange: string = '24h') {
  const now = new Date();
  let startDate: Date;
  
  switch (timeRange) {
    case '1h':
      startDate = new Date(now.getTime() - 3600000);
      break;
    case '24h':
      startDate = new Date(now.getTime() - 86400000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 604800000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 2592000000);
      break;
    default:
      startDate = new Date(now.getTime() - 86400000);
  }
  
  const stats = await this.aggregate([
    {
      $match: {
        created_at: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        total_scans: { $sum: 1 },
        url_scans: {
          $sum: { $cond: [{ $eq: ['$scan_type', 'url'] }, 1, 0] },
        },
        email_scans: {
          $sum: { $cond: [{ $eq: ['$scan_type', 'email'] }, 1, 0] },
        },
        phone_scans: {
          $sum: { $cond: [{ $eq: ['$scan_type', 'phone'] }, 1, 0] },
        },
        ip_scans: {
          $sum: { $cond: [{ $eq: ['$scan_type', 'ip'] }, 1, 0] },
        },
        malicious_count: {
          $sum: { $cond: [{ $eq: ['$result.verdict', 'malicious'] }, 1, 0] },
        },
        suspicious_count: {
          $sum: { $cond: [{ $eq: ['$result.verdict', 'suspicious'] }, 1, 0] },
        },
        safe_count: {
          $sum: { $cond: [{ $eq: ['$result.verdict', 'safe'] }, 1, 0] },
        },
        avg_risk_score: { $avg: '$result.risk_score' },
      },
    },
  ]);
  
  return stats[0] || {
    total_scans: 0,
    url_scans: 0,
    email_scans: 0,
    phone_scans: 0,
    ip_scans: 0,
    malicious_count: 0,
    suspicious_count: 0,
    safe_count: 0,
    avg_risk_score: 0,
  };
};

const ScanResult = mongoose.model<IScanResult>('ScanResult', ScanResultSchema);

export default ScanResult;
