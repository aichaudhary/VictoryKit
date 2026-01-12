/**
 * API Key Model
 * Manages API keys for authentication and rate limiting
 */

import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IAPIKey extends Document {
  key_hash: string;
  key_prefix: string;
  name: string;
  description?: string;
  user_id: string;
  permissions: string[];
  rate_limit: {
    requests_per_minute: number;
    requests_per_day: number;
  };
  allowed_ips?: string[];
  allowed_origins?: string[];
  status: 'active' | 'revoked' | 'expired';
  last_used: Date | null;
  usage_count: number;
  created_at: Date;
  updated_at: Date;
  expires_at: Date;
}

const APIKeySchema = new Schema<IAPIKey>({
  key_hash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  key_prefix: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  user_id: {
    type: String,
    required: true,
    index: true,
  },
  permissions: [{
    type: String,
  }],
  rate_limit: {
    requests_per_minute: {
      type: Number,
      default: 60,
    },
    requests_per_day: {
      type: Number,
      default: 10000,
    },
  },
  allowed_ips: [{
    type: String,
  }],
  allowed_origins: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active',
    index: true,
  },
  last_used: {
    type: Date,
    default: null,
  },
  usage_count: {
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

// Indexes
APIKeySchema.index({ key_hash: 1 });
APIKeySchema.index({ user_id: 1, status: 1 });
APIKeySchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Static method to generate a new API key
APIKeySchema.statics.generateKey = function(prefix: string = 'fg_live_'): { key: string; hash: string; prefix: string } {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const key = `${prefix}${randomBytes}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  
  return { key, hash, prefix };
};

// Static method to hash a key for lookup
APIKeySchema.statics.hashKey = function(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
};

// Method to check if key has permission
APIKeySchema.methods.hasPermission = function(permission: string): boolean {
  if (this.permissions.includes('*')) return true;
  return this.permissions.includes(permission);
};

// Method to record usage
APIKeySchema.methods.recordUsage = async function(): Promise<void> {
  this.last_used = new Date();
  this.usage_count += 1;
  await this.save();
};

// Method to check if expired
APIKeySchema.methods.isExpired = function(): boolean {
  return new Date() > this.expires_at;
};

// Method to check if valid
APIKeySchema.methods.isValid = function(): boolean {
  return this.status === 'active' && !this.isExpired();
};

export const APIKey = mongoose.model<IAPIKey>('APIKey', APIKeySchema);
export default APIKey;
