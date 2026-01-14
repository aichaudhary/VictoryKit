/**
 * ThreatIntel Model
 * Caches threat intelligence data for faster lookups
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ISourceReport {
  source: string;
  category?: string;
  description?: string;
  confidence?: number;
  severity?: string;
  detected_at?: Date;
}

export interface IThreatIntel extends Document {
  indicator: string;
  indicator_type: 'url' | 'domain' | 'ip' | 'email' | 'hash' | 'phone';
  threat_data: {
    is_malicious: boolean;
    categories: string[];
    confidence: number;
    sources?: ISourceReport[];
    geolocation?: any;
    network_info?: any;
    threat_info?: any;
    abuse_reports?: any[];
    raw_data?: any;
  };
  first_seen: Date;
  last_updated: Date;
  ttl: number;
  hit_count: number;
}

const SourceReportSchema = new Schema<ISourceReport>({
  source: { type: String, required: true },
  category: { type: String },
  description: { type: String },
  confidence: { type: Number, min: 0, max: 100 },
  severity: { type: String },
  detected_at: { type: Date },
}, { _id: false });

const ThreatIntelSchema = new Schema<IThreatIntel>({
  indicator: {
    type: String,
    required: true,
    index: true,
  },
  indicator_type: {
    type: String,
    enum: ['url', 'domain', 'ip', 'email', 'hash', 'phone'],
    required: true,
    index: true,
  },
  threat_data: {
    is_malicious: {
      type: Boolean,
      required: true,
      default: false,
    },
    categories: [{
      type: String,
    }],
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    sources: [SourceReportSchema],
    geolocation: {
      type: Schema.Types.Mixed,
    },
    network_info: {
      type: Schema.Types.Mixed,
    },
    threat_info: {
      type: Schema.Types.Mixed,
    },
    abuse_reports: [{
      type: Schema.Types.Mixed,
    }],
    raw_data: {
      type: Schema.Types.Mixed,
    },
  },
  first_seen: {
    type: Date,
    required: true,
    default: Date.now,
  },
  last_updated: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  ttl: {
    type: Number,
    required: true,
    default: 3600, // 1 hour in seconds
  },
  hit_count: {
    type: Number,
    default: 0,
  },
});

// Compound index for efficient lookups
ThreatIntelSchema.index({ indicator: 1, indicator_type: 1 }, { unique: true });
ThreatIntelSchema.index({ 'threat_data.is_malicious': 1 });
ThreatIntelSchema.index({ 'threat_data.confidence': 1 });

// Pre-save hook to update last_updated
ThreatIntelSchema.pre('save', function(next) {
  this.last_updated = new Date();
  next();
});

// Pre-findOneAndUpdate hook
ThreatIntelSchema.pre('findOneAndUpdate', function(next) {
  this.set({ last_updated: new Date() });
  next();
});

// Static method to get or refresh cached data
ThreatIntelSchema.statics.getWithRefresh = async function(
  indicator: string,
  indicator_type: string,
  maxAge: number = 3600000 // 1 hour in ms
) {
  const result = await this.findOne({
    indicator,
    indicator_type,
  });
  
  if (!result) {
    return null;
  }
  
  // Check if cache is still valid
  const age = Date.now() - result.last_updated.getTime();
  if (age > maxAge) {
    return null; // Cache expired
  }
  
  // Increment hit count
  await this.updateOne(
    { _id: result._id },
    { $inc: { hit_count: 1 } }
  );
  
  return result;
};

// Static method to get malicious indicators
ThreatIntelSchema.statics.getMalicious = function(
  indicator_type?: string,
  limit: number = 100
) {
  const query: any = { 'threat_data.is_malicious': true };
  if (indicator_type) {
    query.indicator_type = indicator_type;
  }
  
  return this.find(query)
    .sort({ 'threat_data.confidence': -1, last_updated: -1 })
    .limit(limit);
};

// Static method to clean up old entries
ThreatIntelSchema.statics.cleanup = async function(maxAgeHours: number = 24) {
  const cutoff = new Date(Date.now() - maxAgeHours * 3600000);
  
  const result = await this.deleteMany({
    last_updated: { $lt: cutoff },
  });
  
  return result.deletedCount;
};

// Static method to get cache stats
ThreatIntelSchema.statics.getCacheStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$indicator_type',
        count: { $sum: 1 },
        malicious_count: {
          $sum: { $cond: ['$threat_data.is_malicious', 1, 0] },
        },
        total_hits: { $sum: '$hit_count' },
        avg_confidence: { $avg: '$threat_data.confidence' },
      },
    },
  ]);
  
  const totalStats = await this.aggregate([
    {
      $group: {
        _id: null,
        total_entries: { $sum: 1 },
        total_malicious: {
          $sum: { $cond: ['$threat_data.is_malicious', 1, 0] },
        },
        total_hits: { $sum: '$hit_count' },
      },
    },
  ]);
  
  return {
    by_type: stats,
    totals: totalStats[0] || { total_entries: 0, total_malicious: 0, total_hits: 0 },
  };
};

export const ThreatIntel = mongoose.model<IThreatIntel>('ThreatIntel', ThreatIntelSchema);

export default ThreatIntel;
