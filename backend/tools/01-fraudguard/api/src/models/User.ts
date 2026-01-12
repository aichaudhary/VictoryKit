/**
 * User Model
 * Manages authenticated users with roles and permissions
 */

import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  password_hash: string;
  name: string;
  role: 'user' | 'analyst' | 'admin' | 'superadmin';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  permissions: string[];
  settings: {
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      sms: boolean;
      dashboard: boolean;
    };
    timezone: string;
  };
  last_login: Date | null;
  login_count: number;
  failed_login_attempts: number;
  locked_until: Date | null;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  created_at: Date;
  updated_at: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password_hash: {
    type: String,
    required: true,
    select: false, // Don't include by default in queries
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'analyst', 'admin', 'superadmin'],
    default: 'user',
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending',
    index: true,
  },
  permissions: [{
    type: String,
  }],
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark',
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      dashboard: { type: Boolean, default: true },
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
  },
  last_login: {
    type: Date,
    default: null,
  },
  login_count: {
    type: Number,
    default: 0,
  },
  failed_login_attempts: {
    type: Number,
    default: 0,
  },
  locked_until: {
    type: Date,
    default: null,
  },
  two_factor_enabled: {
    type: Boolean,
    default: false,
  },
  two_factor_secret: {
    type: String,
    select: false,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ created_at: -1 });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

// Increment failed login attempts
UserSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  this.failed_login_attempts += 1;
  
  // Lock account after 5 failed attempts for 30 minutes
  if (this.failed_login_attempts >= 5) {
    this.locked_until = new Date(Date.now() + 30 * 60 * 1000);
  }
  
  await this.save();
};

// Reset login attempts
UserSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  this.failed_login_attempts = 0;
  this.locked_until = null;
  this.last_login = new Date();
  this.login_count += 1;
  await this.save();
};

// Static method to find by email with password
UserSchema.statics.findByEmailWithPassword = function(email: string) {
  return this.findOne({ email }).select('+password_hash');
};

export const User = mongoose.model<IUser>('User', UserSchema);
export default User;
