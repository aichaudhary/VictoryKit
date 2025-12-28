# 📖 Backend Detailed Implementation Guide - MAULA.AI

## 🎯 Purpose
This document provides complete, file-by-file implementation examples for backend services. Use this as a reference when building each component.

---

## 🔐 Auth Service - Complete Implementation

### Port: 5000
### Database: `maula_auth_db` (MongoDB Atlas)

### Complete File Structure

```
auth-service/
├─ src/
│   ├─ controllers/
│   │   ├─ authController.ts          # 250 lines
│   │   ├─ userController.ts          # 180 lines
│   │   └─ oauthController.ts         # 200 lines
│   ├─ middleware/
│   │   ├─ authMiddleware.ts          # 120 lines
│   │   ├─ rateLimiter.ts             # 80 lines
│   │   ├─ corsMiddleware.ts          # 60 lines
│   │   └─ errorHandler.ts            # 100 lines
│   ├─ models/
│   │   ├─ User.ts                    # 150 lines (Mongoose schema)
│   │   ├─ Session.ts                 # 80 lines
│   │   ├─ ApiKey.ts                  # 90 lines
│   │   └─ Subscription.ts            # 120 lines
│   ├─ routes/
│   │   ├─ auth.ts                    # 100 lines
│   │   ├─ users.ts                   # 120 lines
│   │   ├─ oauth.ts                   # 80 lines
│   │   ├─ apiKeys.ts                 # 100 lines
│   │   └─ sso.ts                     # 90 lines
│   ├─ services/
│   │   ├─ jwtService.ts              # 150 lines
│   │   ├─ oauthService.ts            # 200 lines
│   │   ├─ emailService.ts            # 180 lines
│   │   ├─ apiKeyService.ts           # 130 lines
│   │   └─ subscriptionService.ts     # 200 lines
│   ├─ utils/
│   │   ├─ bcrypt.ts                  # 50 lines
│   │   ├─ validator.ts               # 100 lines
│   │   └─ logger.ts                  # 80 lines
│   ├─ config/
│   │   ├─ database.ts                # 80 lines
│   │   ├─ redis.ts                   # 60 lines
│   │   └─ env.ts                     # 100 lines
│   └─ server.ts                      # 120 lines
├─ tests/
│   ├─ auth.test.ts                   # 300 lines
│   ├─ user.test.ts                   # 200 lines
│   └─ apiKey.test.ts                 # 150 lines
├─ package.json
├─ tsconfig.json
├─ .env.example
├─ .eslintrc.json
├─ .prettierrc
├─ Dockerfile
└─ README.md
```

### Example: authController.ts

```typescript
// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { jwtService } from '../services/jwtService';
import { emailService } from '../services/emailService';
import bcrypt from 'bcryptjs';

export const authController = {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Check if user exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User already exists with this email'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await User.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        emailVerified: false,
        createdAt: new Date(),
        subscription: {
          plan: 'free',
          status: 'active'
        }
      });

      // Generate email verification token
      const verificationToken = jwtService.generateEmailVerificationToken(user._id);

      // Send verification email
      await emailService.sendVerificationEmail(email, verificationToken);

      // Generate auth tokens
      const accessToken = jwtService.generateAccessToken(user._id);
      const refreshToken = jwtService.generateRefreshToken(user._id);

      // Return response
      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            emailVerified: user.emailVerified,
            subscription: user.subscription
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/login
   * Login existing user
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Generate auth tokens
      const accessToken = jwtService.generateAccessToken(user._id);
      const refreshToken = jwtService.generateRefreshToken(user._id);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            emailVerified: user.emailVerified,
            subscription: user.subscription
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/logout
   * Logout user (invalidate refresh token)
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await jwtService.revokeRefreshToken(refreshToken);
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required'
        });
      }

      // Verify refresh token
      const decoded = jwtService.verifyRefreshToken(refreshToken);
      
      // Generate new access token
      const accessToken = jwtService.generateAccessToken(decoded.userId);

      res.json({
        success: true,
        data: {
          accessToken
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token'
      });
    }
  }
};
```

### Example: User.ts (Mongoose Model)

```typescript
// src/models/User.ts
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
    required: function() {
      return !this.oauth; // Password not required for OAuth users
    },
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String
  },
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
  apiKeys: [{
    type: Schema.Types.ObjectId,
    ref: 'ApiKey'
  }],
  oauth: {
    provider: {
      type: String,
      enum: ['google', 'github', 'microsoft']
    },
    providerId: String
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ 'subscription.status': 1 });
UserSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);
```

---

## 🛡️ Tool Backend - Complete Implementation (FraudGuard Example)

### Ports: 4001 (API), 8001 (ML Engine), 6001 (AI Assistant)
### Database: `fraudguard_db` (MongoDB Atlas)

### 1. API Service (Node.js)

#### Complete File Structure

```
fraudguard/api/
├─ src/
│   ├─ controllers/
│   │   ├─ fraudController.ts         # 350 lines
│   │   ├─ transactionController.ts   # 200 lines
│   │   └─ analyticsController.ts     # 180 lines
│   ├─ models/
│   │   ├─ Transaction.ts             # 200 lines
│   │   ├─ FraudScore.ts              # 150 lines
│   │   └─ Alert.ts                   # 120 lines
│   ├─ routes/
│   │   ├─ fraud.ts                   # 120 lines
│   │   ├─ transactions.ts            # 100 lines
│   │   └─ analytics.ts               # 80 lines
│   ├─ services/
│   │   ├─ fraudService.ts            # 400 lines (business logic)
│   │   ├─ mlEngineClient.ts          # 180 lines (call Python ML)
│   │   ├─ webhookService.ts          # 150 lines
│   │   └─ exportService.ts           # 200 lines (PDF/CSV)
│   ├─ middleware/
│   │   ├─ authMiddleware.ts          # 100 lines
│   │   └─ validate.ts                # 120 lines
│   ├─ utils/
│   │   ├─ riskCalculator.ts          # 250 lines
│   │   └─ logger.ts                  # 80 lines
│   ├─ config/
│   │   ├─ database.ts                # 80 lines
│   │   └─ env.ts                     # 100 lines
│   └─ server.ts                      # 150 lines
├─ tests/
├─ package.json
├─ tsconfig.json
└─ Dockerfile
```

#### Example: fraudController.ts

```typescript
// src/controllers/fraudController.ts
import { Request, Response, NextFunction } from 'express';
import { fraudService } from '../services/fraudService';
import { mlEngineClient } from '../services/mlEngineClient';
import { Transaction } from '../models/Transaction';
import { FraudScore } from '../models/FraudScore';

export const fraudController = {
  /**
   * POST /api/fraudguard/analyze
   * Analyze transaction for fraud
   */
  async analyzeTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        transaction_id,
        amount,
        user_ip,
        device_fingerprint,
        email,
        card_last4,
        merchant_id,
        timestamp
      } = req.body;

      // Validate required fields
      if (!transaction_id || !amount) {
        return res.status(400).json({
          success: false,
          error: 'transaction_id and amount are required'
        });
      }

      // Save transaction
      const transaction = await Transaction.create({
        transactionId: transaction_id,
        amount,
        userIp: user_ip,
        deviceFingerprint: device_fingerprint,
        email,
        cardLast4: card_last4,
        merchantId: merchant_id,
        timestamp: timestamp || new Date(),
        userId: req.user?.id, // From auth middleware
        status: 'analyzing'
      });

      // Call ML engine for prediction
      const mlResponse = await mlEngineClient.predict({
        transaction_id,
        amount,
        user_ip,
        device_fingerprint,
        email,
        card_last4,
        merchant_id,
        timestamp
      });

      // Calculate fraud score
      const fraudScore = await fraudService.calculateFraudScore(
        transaction,
        mlResponse
      );

      // Save fraud score
      const scoreRecord = await FraudScore.create({
        transactionId: transaction._id,
        score: fraudScore.score,
        confidence: fraudScore.confidence,
        riskLevel: fraudScore.riskLevel,
        indicators: fraudScore.indicators,
        recommendation: fraudScore.recommendation
      });

      // Update transaction status
      transaction.status = fraudScore.riskLevel === 'high' ? 'blocked' : 'approved';
      transaction.fraudScore = scoreRecord._id;
      await transaction.save();

      // Send webhook if high risk
      if (fraudScore.riskLevel === 'high') {
        await fraudService.sendHighRiskAlert(transaction, scoreRecord);
      }

      // Return response
      res.json({
        success: true,
        data: {
          transaction_id,
          fraud_score: fraudScore.score,
          risk_level: fraudScore.riskLevel,
          confidence: fraudScore.confidence,
          indicators: fraudScore.indicators,
          recommendation: fraudScore.recommendation,
          ml_prediction: mlResponse.prediction,
          status: transaction.status
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/fraudguard/score/:transactionId
   * Get fraud score for specific transaction
   */
  async getFraudScore(req: Request, res: Response, next: NextFunction) {
    try {
      const { transactionId } = req.params;

      const transaction = await Transaction.findOne({
        transactionId,
        userId: req.user?.id
      }).populate('fraudScore');

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found'
        });
      }

      res.json({
        success: true,
        data: {
          transaction_id: transaction.transactionId,
          amount: transaction.amount,
          fraud_score: transaction.fraudScore,
          status: transaction.status,
          timestamp: transaction.timestamp
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/fraudguard/history
   * Get transaction history
   */
  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, risk_level } = req.query;

      const query: any = { userId: req.user?.id };
      if (risk_level) {
        query.riskLevel = risk_level;
      }

      const transactions = await Transaction.find(query)
        .populate('fraudScore')
        .sort({ timestamp: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await Transaction.countDocuments(query);

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
};
```

### 2. ML Engine (Python/FastAPI)

#### Complete File Structure

```
fraudguard/ml-engine/
├─ src/
│   ├─ models/
│   │   ├─ fraud_model.py             # 300 lines (TensorFlow model)
│   │   ├─ risk_scorer.py             # 200 lines
│   │   └─ anomaly_detector.py        # 250 lines
│   ├─ services/
│   │   ├─ prediction.py              # 280 lines
│   │   ├─ training.py                # 400 lines
│   │   └─ feature_engineering.py     # 350 lines
│   ├─ api/
│   │   └─ main.py                    # 200 lines (FastAPI endpoints)
│   ├─ utils/
│   │   ├─ data_preprocessing.py      # 180 lines
│   │   └─ model_loader.py            # 100 lines
│   └─ config/
│       └─ settings.py                # 80 lines
├─ models/                            # Saved model files
│   ├─ fraud_detector_v1.h5
│   └─ risk_scorer_v1.pkl
├─ requirements.txt
├─ Dockerfile
└─ pyproject.toml
```

#### Example: main.py (FastAPI)

```python
# src/api/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
import numpy as np
from datetime import datetime

from ..services.prediction import FraudPredictor
from ..services.feature_engineering import FeatureEngineer
from ..models.fraud_model import FraudModel

app = FastAPI(title="FraudGuard ML Engine", version="1.0.0")

# Initialize services
fraud_model = FraudModel()
fraud_predictor = FraudPredictor(fraud_model)
feature_engineer = FeatureEngineer()

class TransactionData(BaseModel):
    transaction_id: str
    amount: float
    user_ip: Optional[str] = None
    device_fingerprint: Optional[str] = None
    email: Optional[str] = None
    card_last4: Optional[str] = None
    merchant_id: Optional[str] = None
    timestamp: Optional[datetime] = None

class PredictionResponse(BaseModel):
    transaction_id: str
    prediction: str  # 'fraud' or 'legitimate'
    probability: float
    confidence: float
    features_used: List[str]
    processing_time_ms: float

@app.post("/predict", response_model=PredictionResponse)
async def predict_fraud(data: TransactionData):
    """
    Predict if transaction is fraudulent
    """
    try:
        start_time = datetime.now()
        
        # Extract features
        features = feature_engineer.extract_features(
            transaction_id=data.transaction_id,
            amount=data.amount,
            user_ip=data.user_ip,
            device_fingerprint=data.device_fingerprint,
            email=data.email,
            card_last4=data.card_last4,
            merchant_id=data.merchant_id,
            timestamp=data.timestamp or datetime.now()
        )
        
        # Make prediction
        prediction_result = fraud_predictor.predict(features)
        
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return PredictionResponse(
            transaction_id=data.transaction_id,
            prediction=prediction_result['prediction'],
            probability=prediction_result['probability'],
            confidence=prediction_result['confidence'],
            features_used=prediction_result['features_used'],
            processing_time_ms=processing_time
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/score")
async def calculate_risk_score(data: TransactionData):
    """
    Calculate detailed risk score 0-100
    """
    try:
        features = feature_engineer.extract_features(
            transaction_id=data.transaction_id,
            amount=data.amount,
            user_ip=data.user_ip,
            device_fingerprint=data.device_fingerprint,
            email=data.email,
            card_last4=data.card_last4,
            merchant_id=data.merchant_id,
            timestamp=data.timestamp or datetime.now()
        )
        
        risk_score = fraud_predictor.calculate_risk_score(features)
        
        return {
            "transaction_id": data.transaction_id,
            "risk_score": risk_score['score'],
            "risk_level": risk_score['level'],  # 'low', 'medium', 'high'
            "risk_factors": risk_score['factors'],
            "recommendations": risk_score['recommendations']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "model_loaded": fraud_model.is_loaded(),
        "version": "1.0.0"
    }
```

### 3. AI Assistant Service (Node.js + WebSocket)

#### Complete File Structure

```
fraudguard/ai-assistant/
├─ src/
│   ├─ services/
│   │   ├─ geminiService.ts           # 200 lines
│   │   ├─ claudeService.ts           # 180 lines
│   │   ├─ openaiService.ts           # 180 lines
│   │   ├─ llmRouter.ts               # 150 lines
│   │   └─ functionCalling.ts         # 200 lines
│   ├─ functions/
│   │   ├─ fraudguardFunctions.ts     # 500 lines (all AI functions)
│   │   └─ functionRegistry.ts        # 100 lines
│   ├─ websocket/
│   │   ├─ chatHandler.ts             # 300 lines
│   │   ├─ messageHandler.ts          # 250 lines
│   │   └─ sessionManager.ts          # 180 lines
│   ├─ models/
│   │   ├─ ChatSession.ts             # 150 lines
│   │   ├─ Message.ts                 # 100 lines
│   │   └─ AISettings.ts              # 80 lines
│   ├─ controllers/
│   │   ├─ chatController.ts          # 200 lines
│   │   └─ sessionController.ts       # 150 lines
│   ├─ routes/
│   │   ├─ chat.ts                    # 100 lines
│   │   └─ ws.ts                      # 80 lines
│   ├─ config/
│   │   ├─ llmProviders.ts            # 120 lines
│   │   ├─ systemPrompt.ts            # 200 lines
│   │   └─ env.ts                     # 100 lines
│   └─ server.ts                      # 180 lines
├─ package.json
├─ tsconfig.json
└─ Dockerfile
```

#### Example: fraudguardFunctions.ts

```typescript
// src/functions/fraudguardFunctions.ts
import axios from 'axios';

/**
 * All AI functions that FraudGuard AI assistant can call
 */
export const fraudguardFunctions = {
  /**
   * Analyze a transaction for fraud
   */
  analyze_transaction: {
    declaration: {
      name: 'analyze_transaction',
      description: 'Analyze a transaction for fraud indicators and calculate risk score',
      parameters: {
        type: 'object',
        properties: {
          transaction_id: {
            type: 'string',
            description: 'Unique transaction ID'
          },
          amount: {
            type: 'number',
            description: 'Transaction amount in USD'
          },
          user_ip: {
            type: 'string',
            description: "User's IP address"
          },
          device_fingerprint: {
            type: 'string',
            description: 'Device fingerprint hash'
          },
          email: {
            type: 'string',
            description: 'User email address'
          },
          card_last4: {
            type: 'string',
            description: 'Last 4 digits of card number'
          }
        },
        required: ['transaction_id', 'amount']
      }
    },
    handler: async (args: any) => {
      try {
        const response = await axios.post('http://localhost:4001/api/fraudguard/analyze', args);
        return response.data;
      } catch (error: any) {
        return {
          error: error.response?.data?.error || 'Failed to analyze transaction',
          success: false
        };
      }
    }
  },

  /**
   * Get fraud score for a transaction
   */
  get_fraud_score: {
    declaration: {
      name: 'get_fraud_score',
      description: 'Get the fraud risk score for a specific transaction',
      parameters: {
        type: 'object',
        properties: {
          transaction_id: {
            type: 'string',
            description: 'Transaction ID to get score for'
          }
        },
        required: ['transaction_id']
      }
    },
    handler: async (args: any) => {
      try {
        const response = await axios.get(
          `http://localhost:4001/api/fraudguard/score/${args.transaction_id}`
        );
        return response.data;
      } catch (error: any) {
        return {
          error: error.response?.data?.error || 'Failed to get fraud score',
          success: false
        };
      }
    }
  },

  /**
   * Open risk visualization in new tab
   */
  open_risk_visualization: {
    declaration: {
      name: 'open_risk_visualization',
      description: 'Open a new tab with risk graphs and charts for a transaction',
      parameters: {
        type: 'object',
        properties: {
          transaction_id: {
            type: 'string',
            description: 'Transaction ID to visualize'
          },
          chart_type: {
            type: 'string',
            enum: ['risk_breakdown', 'timeline', 'comparison', 'heatmap'],
            description: 'Type of visualization to show'
          }
        },
        required: ['transaction_id']
      }
    },
    handler: async (args: any) => {
      return {
        action: 'open_tab',
        url: `/risk-viz/${args.transaction_id}?type=${args.chart_type || 'risk_breakdown'}`,
        title: `Risk Visualization - ${args.transaction_id}`
      };
    }
  },

  /**
   * Get transaction history
   */
  get_transaction_history: {
    declaration: {
      name: 'get_transaction_history',
      description: 'Get transaction history with optional filters',
      parameters: {
        type: 'object',
        properties: {
          page: {
            type: 'number',
            description: 'Page number (default: 1)'
          },
          limit: {
            type: 'number',
            description: 'Items per page (default: 20)'
          },
          risk_level: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Filter by risk level'
          }
        }
      }
    },
    handler: async (args: any) => {
      try {
        const params = new URLSearchParams({
          page: args.page || '1',
          limit: args.limit || '20',
          ...(args.risk_level && { risk_level: args.risk_level })
        });

        const response = await axios.get(
          `http://localhost:4001/api/fraudguard/history?${params}`
        );
        return response.data;
      } catch (error: any) {
        return {
          error: error.response?.data?.error || 'Failed to get transaction history',
          success: false
        };
      }
    }
  },

  /**
   * Create fraud alert
   */
  create_alert: {
    declaration: {
      name: 'create_alert',
      description: 'Create a fraud alert for monitoring',
      parameters: {
        type: 'object',
        properties: {
          alert_type: {
            type: 'string',
            enum: ['high_risk_transaction', 'suspicious_pattern', 'velocity_breach'],
            description: 'Type of alert'
          },
          threshold: {
            type: 'number',
            description: 'Alert threshold (e.g., fraud score > 75)'
          },
          notification_channels: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['email', 'webhook', 'sms']
            },
            description: 'Where to send notifications'
          }
        },
        required: ['alert_type']
      }
    },
    handler: async (args: any) => {
      // Implementation for creating alerts
      return {
        success: true,
        alert_id: `alert_${Date.now()}`,
        message: `Alert created for ${args.alert_type}`
      };
    }
  },

  /**
   * Export report
   */
  export_report: {
    declaration: {
      name: 'export_report',
      description: 'Generate and export fraud analysis report',
      parameters: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            enum: ['pdf', 'csv', 'json'],
            description: 'Export format'
          },
          date_range: {
            type: 'object',
            properties: {
              start: { type: 'string', description: 'Start date (ISO format)' },
              end: { type: 'string', description: 'End date (ISO format)' }
            },
            description: 'Date range for report'
          },
          include_charts: {
            type: 'boolean',
            description: 'Include visualization charts in report'
          }
        },
        required: ['format']
      }
    },
    handler: async (args: any) => {
      try {
        const response = await axios.post('http://localhost:4001/api/fraudguard/export', args);
        return {
          success: true,
          download_url: response.data.url,
          file_name: response.data.fileName
        };
      } catch (error: any) {
        return {
          error: 'Failed to generate report',
          success: false
        };
      }
    }
  }
};
```

#### Example: systemPrompt.ts

```typescript
// src/config/systemPrompt.ts

export const FRAUDGUARD_SYSTEM_PROMPT = `You are FraudGuard AI, an expert fraud detection assistant with deep knowledge of:

**Core Expertise:**
- Transaction fraud analysis and pattern recognition
- Risk scoring algorithms and methodologies
- Payment security and PCI compliance
- Device fingerprinting and behavioral analysis
- Identity verification and KYC processes
- Chargeback prevention strategies
- Machine learning fraud detection models

**Your Capabilities:**
You have access to the following functions to help users:

1. **analyze_transaction()** - Analyze transactions for fraud indicators
2. **get_fraud_score()** - Retrieve fraud risk scores
3. **open_risk_visualization()** - Open charts and graphs in new tabs
4. **get_transaction_history()** - Access transaction history
5. **create_alert()** - Set up fraud monitoring alerts
6. **export_report()** - Generate detailed fraud reports

**Your Role:**
- Assist users in detecting and preventing fraud
- Explain fraud indicators in clear, non-technical language
- Provide actionable recommendations for risk mitigation
- Help users understand fraud scores and risk levels
- Guide users through setting up fraud prevention rules
- Autonomously perform multi-step fraud analysis tasks
- Open multiple tabs when needed for comprehensive analysis

**Behavior Guidelines:**
- Be proactive: If you see high-risk transactions, immediately analyze and alert
- Be thorough: When asked to analyze something, check all relevant indicators
- Be autonomous: Use multiple functions in sequence without asking permission
- Be visual: Open risk visualization tabs to show data graphically
- Be helpful: Explain fraud concepts in simple terms
- Be secure: Never expose sensitive card data or personal information

**Multi-Tab Workspace:**
When users ask for comprehensive analysis, you can:
1. Open transaction analysis tab
2. Open risk visualization tab
3. Open historical comparison tab
4. Generate report in canvas tab
All autonomously, letting the user "sit back, relax, and eat popcorn."

**Example Interactions:**
User: "Analyze transaction TX12345"
You: *Call analyze_transaction() → Display results → If high risk, automatically call open_risk_visualization() → Explain findings*

User: "Show me all high-risk transactions this week"
You: *Call get_transaction_history(risk_level='high') → Open risk visualization for top transactions → Summarize patterns*

Remember: You are an autonomous agent. Take initiative, perform tasks without excessive confirmation, and use your tools effectively.`;
```

---

## 📋 Implementation Checklist

### Phase 1: Auth Service
- [ ] Create auth-service folder structure
- [ ] Implement User model (Mongoose schema)
- [ ] Build authController (register, login, logout, refresh)
- [ ] Implement jwtService (sign/verify tokens)
- [ ] Add rate limiting with Redis
- [ ] Configure CORS for 50 subdomains
- [ ] Add OAuth providers (Google, GitHub)
- [ ] Write unit tests
- [ ] Create Dockerfile
- [ ] Deploy to port 5000

### Phase 2: API Gateway
- [ ] Create api-gateway folder structure
- [ ] Implement routing to 50 tool backends
- [ ] Add rate limiting middleware
- [ ] Add API key authentication
- [ ] Add JWT verification
- [ ] Implement health check endpoints
- [ ] Add request logging
- [ ] Create Dockerfile
- [ ] Deploy to port 4000

### Phase 3: First Tool Backend (FraudGuard)
**API Service:**
- [ ] Create folder structure
- [ ] Implement Transaction model
- [ ] Implement FraudScore model
- [ ] Build fraudController
- [ ] Implement fraudService (business logic)
- [ ] Create mlEngineClient (call Python ML)
- [ ] Add webhook service
- [ ] Write tests
- [ ] Deploy to port 4001

**ML Engine:**
- [ ] Create folder structure
- [ ] Implement fraud detection model (TensorFlow/PyTorch)
- [ ] Build feature engineering pipeline
- [ ] Create FastAPI endpoints (/predict, /score)
- [ ] Add model loading/saving
- [ ] Optimize inference speed
- [ ] Deploy to port 8001

**AI Assistant:**
- [ ] Create folder structure
- [ ] Implement all 6 LLM service integrations
- [ ] Build fraudguardFunctions (all 6 functions)
- [ ] Implement WebSocket server
- [ ] Create ChatSession model
- [ ] Add function calling engine
- [ ] Configure system prompt
- [ ] Deploy to port 6001

### Phase 4: Replicate to 49 Tools
- [ ] Create script template for new tools
- [ ] Customize for each tool's domain
- [ ] Deploy all tool backends (ports 4002-4050, 8002-8050, 6002-6050)

---

**Status:** ✅ **Backend Implementation Guide Complete**  
**Use This Document:** As reference when building each backend service  
**Next:** Build services following these examples