import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  avatar?: string;
  subscription: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    startDate?: Date;
    endDate?: Date;
  };
  apiKeys: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  oauth?: {
    provider: 'google' | 'github' | 'microsoft';
    providerId: string;
  };
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: function(this: IUser) { return !this.oauth; },
    select: false
  },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  emailVerified: { type: Boolean, default: false },
  avatar: String,
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active'
    },
    startDate: Date,
    endDate: Date
  },
  apiKeys: [{ type: Schema.Types.ObjectId, ref: 'ApiKey' }],
  oauth: {
    provider: {
      type: String,
      enum: ['google', 'github', 'microsoft']
    },
    providerId: String
  },
  lastLogin: Date
}, { timestamps: true });

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ 'subscription.status': 1 });
UserSchema.index({ 'oauth.providerId': 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
