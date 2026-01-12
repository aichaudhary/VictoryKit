/**
 * Rate Limit Model
 * IP-based rate limiting with sliding window
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IRateLimit extends Document {
  key: string;  // Can be IP, user_id, api_key, etc.
  key_type: 'ip' | 'user' | 'api_key' | 'endpoint';
  endpoint?: string;
  requests: {
    timestamp: Date;
    weight: number;
  }[];
  total_requests: number;
  window_start: Date;
  blocked_until: Date | null;
  block_count: number;
  created_at: Date;
  updated_at: Date;
  expires_at: Date;
}

const RateLimitSchema = new Schema<IRateLimit>({
  key: {
    type: String,
    required: true,
    index: true,
  },
  key_type: {
    type: String,
    enum: ['ip', 'user', 'api_key', 'endpoint'],
    required: true,
    index: true,
  },
  endpoint: {
    type: String,
    index: true,
    sparse: true,
  },
  requests: [{
    timestamp: { type: Date, required: true },
    weight: { type: Number, default: 1 },
  }],
  total_requests: {
    type: Number,
    default: 0,
  },
  window_start: {
    type: Date,
    default: Date.now,
  },
  blocked_until: {
    type: Date,
    default: null,
    index: true,
  },
  block_count: {
    type: Number,
    default: 0,
  },
  expires_at: {
    type: Date,
    required: true,
    // Note: TTL index created separately below
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

// Compound index for efficient lookups
RateLimitSchema.index({ key: 1, key_type: 1, endpoint: 1 }, { unique: true });
RateLimitSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-cleanup

// Static method to check and record a request
RateLimitSchema.statics.checkAndRecord = async function(
  key: string,
  keyType: 'ip' | 'user' | 'api_key' | 'endpoint',
  options: {
    endpoint?: string;
    limit: number;
    windowMs: number;
    weight?: number;
  }
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - options.windowMs);
  const weight = options.weight || 1;
  
  // Find or create rate limit record
  let rateLimit = await this.findOne({
    key,
    key_type: keyType,
    endpoint: options.endpoint || null,
  });
  
  if (!rateLimit) {
    rateLimit = new this({
      key,
      key_type: keyType,
      endpoint: options.endpoint,
      requests: [],
      total_requests: 0,
      window_start: now,
      expires_at: new Date(now.getTime() + options.windowMs * 2),
    });
  }
  
  // Check if blocked
  if (rateLimit.blocked_until && rateLimit.blocked_until > now) {
    const retryAfter = Math.ceil((rateLimit.blocked_until.getTime() - now.getTime()) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: rateLimit.blocked_until,
      retryAfter,
    };
  }
  
  // Clean up old requests outside the window
  rateLimit.requests = rateLimit.requests.filter(
    (r: { timestamp: Date }) => r.timestamp > windowStart
  );
  
  // Calculate current request count (with weights)
  const currentCount = rateLimit.requests.reduce(
    (sum: number, r: { weight: number }) => sum + r.weight,
    0
  );
  
  // Check if within limit
  if (currentCount + weight > options.limit) {
    // Block for increasing duration based on block count
    const blockDuration = Math.min(
      60000 * Math.pow(2, rateLimit.block_count), // Exponential backoff
      3600000 // Max 1 hour
    );
    rateLimit.blocked_until = new Date(now.getTime() + blockDuration);
    rateLimit.block_count += 1;
    await rateLimit.save();
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: rateLimit.blocked_until,
      retryAfter: Math.ceil(blockDuration / 1000),
    };
  }
  
  // Record the request
  rateLimit.requests.push({ timestamp: now, weight });
  rateLimit.total_requests += weight;
  rateLimit.expires_at = new Date(now.getTime() + options.windowMs * 2);
  
  // Reset block count if successful request after block expired
  if (rateLimit.block_count > 0 && !rateLimit.blocked_until) {
    rateLimit.block_count = Math.max(0, rateLimit.block_count - 1);
  }
  
  await rateLimit.save();
  
  // Calculate reset time (when oldest request in window expires)
  const oldestRequest = rateLimit.requests[0];
  const resetTime = oldestRequest 
    ? new Date(oldestRequest.timestamp.getTime() + options.windowMs)
    : new Date(now.getTime() + options.windowMs);
  
  return {
    allowed: true,
    remaining: Math.max(0, options.limit - currentCount - weight),
    resetTime,
  };
};

// Static method to get current usage
RateLimitSchema.statics.getUsage = async function(
  key: string,
  keyType: 'ip' | 'user' | 'api_key' | 'endpoint',
  endpoint?: string
): Promise<{
  total_requests: number;
  current_window_requests: number;
  is_blocked: boolean;
  blocked_until: Date | null;
  block_count: number;
} | null> {
  const rateLimit = await this.findOne({
    key,
    key_type: keyType,
    endpoint: endpoint || null,
  });
  
  if (!rateLimit) return null;
  
  const now = new Date();
  return {
    total_requests: rateLimit.total_requests,
    current_window_requests: rateLimit.requests.length,
    is_blocked: rateLimit.blocked_until ? rateLimit.blocked_until > now : false,
    blocked_until: rateLimit.blocked_until,
    block_count: rateLimit.block_count,
  };
};

// Static method to unblock
RateLimitSchema.statics.unblock = async function(
  key: string,
  keyType: 'ip' | 'user' | 'api_key' | 'endpoint',
  endpoint?: string
): Promise<boolean> {
  const result = await this.updateOne(
    { key, key_type: keyType, endpoint: endpoint || null },
    { $set: { blocked_until: null, block_count: 0 } }
  );
  return result.modifiedCount > 0;
};

// Static method to clean up expired records
RateLimitSchema.statics.cleanup = async function(): Promise<number> {
  const result = await this.deleteMany({
    expires_at: { $lt: new Date() }
  });
  return result.deletedCount;
};

export const RateLimit = mongoose.model<IRateLimit>('RateLimit', RateLimitSchema);
export default RateLimit;
