# 💾 Database Architecture - MAULA.AI

## 🏗️ Database Structure

```
DATABASE ARCHITECTURE
│
├─ 🔐 Shared Auth Database (MongoDB Atlas)
│   └─ Users, API Keys, Sessions
│
└─ 🛡️ 50 Tool Databases (Isolated)
    ├─ Each tool = Own database
    ├─ Tool-specific collections
    └─ Independent scaling
```

---

## 📊 MongoDB Atlas Organization

```
MongoDB Atlas Cluster
│
├─ maula-auth-db                     # Shared authentication
│   ├─ users
│   ├─ sessions
│   ├─ api_keys
│   ├─ subscriptions
│   └─ billing
│
├─ fraudguard-db                     # Tool 1 Database
│   ├─ transactions
│   ├─ fraud_scores
│   ├─ chat_history
│   ├─ webhooks
│   └─ api_logs
│
├─ smartscore-db                     # Tool 2 Database
│   ├─ scores
│   ├─ analyses
│   ├─ chat_history
│   ├─ webhooks
│   └─ api_logs
│
├─ checkoutshield-db                 # Tool 3
├─ fraudflow-db                      # Tool 4
├─ riskengine-db                     # Tool 5
├─ deviceprint-db                    # Tool 6
├─ trustdevice-db                    # Tool 7
├─ bioscan-db                        # Tool 8
├─ multiauth-db                      # Tool 9
├─ verifyme-db                       # Tool 10
├─ ipintel-db                        # Tool 11
├─ proxydetect-db                    # Tool 12
├─ georisk-db                        # Tool 13
├─ ipscore-db                        # Tool 14
├─ fraudcheck-db                     # Tool 15
├─ paymentshield-db                  # Tool 16
├─ transactguard-db                  # Tool 17
├─ revenuedefense-db                 # Tool 18
├─ smartpayment-db                   # Tool 19
├─ idverify-db                       # Tool 20
├─ globalkyc-db                      # Tool 21
├─ identityai-db                     # Tool 22
├─ agecheck-db                       # Tool 23
├─ botshield-db                      # Tool 24
├─ challengedefense-db               # Tool 25
├─ antibot-db                        # Tool 26
├─ humancheck-db                     # Tool 27
├─ iosattest-db                      # Tool 28
├─ androidverify-db                  # Tool 29
├─ captchaplus-db                    # Tool 30
├─ adaptivemfa-db                    # Tool 31
├─ accessmanager-db                  # Tool 32
├─ emaildefender-db                     # Tool 33
├─ phoneverify-db                    # Tool 34
├─ contactscore-db                   # Tool 35
├─ geofence-db                       # Tool 36
├─ travelrisk-db                     # Tool 37
├─ vpndetect-db                      # Tool 38
├─ socialverify-db                   # Tool 39
├─ digitalfootprint-db               # Tool 40
├─ accountage-db                     # Tool 41
├─ cryptorisk-db                     # Tool 42
├─ walletcheck-db                    # Tool 43
├─ chainanalytics-db                 # Tool 44
├─ docscan-db                        # Tool 45
├─ facematch-db                      # Tool 46
├─ livenesscheck-db                  # Tool 47
├─ multiaccountdetect-db             # Tool 48
├─ velocitycheck-db                  # Tool 49
└─ sessionguard-db                   # Tool 50
```

---

## 🔐 Shared Auth Database Schema

### Collection: `users`
```typescript
interface User {
  _id: ObjectId;
  email: string;                      // Unique
  password: string;                   // Bcrypt hashed
  name: string;
  avatar?: string;
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    startDate: Date;
    endDate?: Date;
    status: 'active' | 'cancelled' | 'expired';
  };
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  preferences: {
    defaultLLM: 'claude' | 'gpt' | 'grok' | 'mistral' | 'gemini';
    theme: 'dark' | 'light';
    notifications: boolean;
  };
}
```

### Collection: `sessions`
```typescript
interface Session {
  _id: ObjectId;
  userId: ObjectId;                   // Reference to users
  token: string;                      // JWT token
  device: {
    userAgent: string;
    ip: string;
    platform: string;
  };
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;
}
```

### Collection: `api_keys`
```typescript
interface APIKey {
  _id: ObjectId;
  userId: ObjectId;
  toolName: string;                   // e.g., 'ipintel'
  key: string;                        // Hashed API key
  name: string;                       // User-defined label
  permissions: string[];              // ['read', 'write']
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  usage: {
    totalRequests: number;
    lastRequest: Date;
  };
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}
```

### Collection: `subscriptions`
```typescript
interface Subscription {
  _id: ObjectId;
  userId: ObjectId;
  plan: 'free' | 'pro' | 'enterprise';
  billing: {
    amount: number;
    currency: string;
    interval: 'monthly' | 'yearly';
    nextBillingDate: Date;
  };
  features: {
    maxAPIRequests: number;
    maxTools: number;
    aiCredits: number;                // LLM API calls
    supportLevel: 'basic' | 'priority' | 'dedicated';
  };
  paymentMethod: {
    type: 'card' | 'paypal' | 'crypto';
    last4?: string;
  };
  status: 'active' | 'cancelled' | 'past_due' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}
```

### Collection: `billing`
```typescript
interface BillingRecord {
  _id: ObjectId;
  userId: ObjectId;
  subscriptionId: ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  invoice: {
    number: string;
    pdfUrl?: string;
  };
  paymentIntent: string;              // Stripe payment ID
  createdAt: Date;
  paidAt?: Date;
}
```

---

## 🛡️ Tool Database Schema (Standard Pattern)

### Example: IPIntel Tool Database

#### Collection: `analyses`
```typescript
interface IPAnalysis {
  _id: ObjectId;
  userId: ObjectId;
  ipAddress: string;
  result: {
    riskScore: number;                // 0-100
    isProxy: boolean;
    isVPN: boolean;
    isTor: boolean;
    isDatacenter: boolean;
    isBot: boolean;
    country: string;
    countryCode: string;
    city: string;
    region: string;
    latitude: number;
    longitude: number;
    timezone: string;
    isp: string;
    organization: string;
    asn: number;
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  metadata: {
    processingTime: number;           // Milliseconds
    modelVersion: string;
    confidence: number;
  };
  createdAt: Date;
  expiresAt: Date;                    // Auto-delete old records
}
```

#### Collection: `chat_history`
```typescript
interface ChatMessage {
  _id: ObjectId;
  userId: ObjectId;
  sessionId: string;                  // Group related messages
  provider: 'claude' | 'gpt' | 'grok' | 'mistral' | 'gemini';
  role: 'user' | 'assistant' | 'system';
  message: string;
  context: {
    toolData?: any;                   // Current IP analysis
    previousResults?: any[];
    userIntent?: string;
  };
  tokens: {
    input: number;
    output: number;
    cost: number;                     // USD
  };
  timestamp: Date;
}
```

#### Collection: `webhooks`
```typescript
interface Webhook {
  _id: ObjectId;
  userId: ObjectId;
  url: string;
  events: string[];                   // ['analysis.created', 'threshold.exceeded']
  isActive: boolean;
  secret: string;                     // For signature verification
  headers: Record<string, string>;    // Custom headers
  retryPolicy: {
    maxRetries: number;
    backoff: 'linear' | 'exponential';
  };
  stats: {
    totalSent: number;
    successCount: number;
    failureCount: number;
    lastSent: Date;
  };
  createdAt: Date;
}
```

#### Collection: `api_logs`
```typescript
interface APILog {
  _id: ObjectId;
  userId: ObjectId;
  apiKeyId: ObjectId;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  request: {
    headers: Record<string, string>;
    body?: any;
    params?: Record<string, string>;
  };
  response: {
    statusCode: number;
    body?: any;
    processingTime: number;
  };
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}
```

#### Collection: `analytics`
```typescript
interface Analytics {
  _id: ObjectId;
  userId: ObjectId;
  date: Date;                         // Daily aggregation
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageProcessingTime: number;
    highRiskDetections: number;
    uniqueIPs: number;
    topCountries: Array<{
      country: string;
      count: number;
    }>;
    topThreats: Array<{
      type: string;
      count: number;
    }>;
  };
  aiUsage: {
    totalMessages: number;
    totalTokens: number;
    totalCost: number;
    providerBreakdown: Record<string, number>;
  };
}
```

---

## 🔄 Data Flow Examples

### User Creates Account
```
1. POST /auth/register
2. Create document in maula-auth-db.users
3. Send verification email
4. Create session in maula-auth-db.sessions
5. Generate default API keys for each tool
   → Insert 50 documents in maula-auth-db.api_keys
```

### User Analyzes IP Address
```
1. POST /api/ipintel/analyze
2. Validate API key (maula-auth-db.api_keys)
3. Check rate limit (Redis cache)
4. Call ML engine for analysis
5. Save result in ipintel-db.analyses
6. Log request in ipintel-db.api_logs
7. Update analytics in ipintel-db.analytics
8. Trigger webhooks if configured (ipintel-db.webhooks)
```

### User Chats with AI
```
1. WS /ai/chat (WebSocket connection)
2. Validate session (maula-auth-db.sessions)
3. Get tool context (ipintel-db.analyses)
4. Get chat history (ipintel-db.chat_history)
5. Call LLM API (Claude/GPT/etc.)
6. Save message + response in ipintel-db.chat_history
7. Update AI usage stats (ipintel-db.analytics)
8. Deduct AI credits (maula-auth-db.subscriptions)
```

---

## 📈 Indexing Strategy

### Critical Indexes (All Tool DBs)
```javascript
// analyses collection
db.analyses.createIndex({ userId: 1, createdAt: -1 });
db.analyses.createIndex({ ipAddress: 1 });
db.analyses.createIndex({ "result.riskScore": -1 });
db.analyses.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL

// chat_history collection
db.chat_history.createIndex({ userId: 1, timestamp: -1 });
db.chat_history.createIndex({ sessionId: 1 });

// api_logs collection
db.api_logs.createIndex({ userId: 1, timestamp: -1 });
db.api_logs.createIndex({ apiKeyId: 1 });
db.api_logs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

// webhooks collection
db.webhooks.createIndex({ userId: 1, isActive: 1 });
```

---

## 🗄️ Redis Caching Layer

### Cache Strategy
```typescript
// Rate limiting
redis.set(`rate:${apiKeyId}:${minute}`, count, 'EX', 60);

// API response caching
redis.set(`cache:ipintel:${ipAddress}`, result, 'EX', 3600); // 1 hour

// Session storage
redis.set(`session:${token}`, userData, 'EX', 86400); // 24 hours

// Real-time analytics
redis.hincrby(`analytics:${userId}:${date}`, 'totalRequests', 1);
```

---

## 🔄 Data Retention Policy

### Auto-deletion (TTL Indexes)
```javascript
// API logs: Delete after 30 days
{ timestamp: 1 }, { expireAfterSeconds: 2592000 }

// Free tier analyses: Delete after 7 days
{ createdAt: 1 }, { expireAfterSeconds: 604800 }

// Chat history: Delete after 90 days
{ timestamp: 1 }, { expireAfterSeconds: 7776000 }

// Sessions: Delete after 24 hours of inactivity
{ lastActiveAt: 1 }, { expireAfterSeconds: 86400 }
```

---

## 📊 Backup Strategy

### MongoDB Atlas Automated Backups
- **Continuous backups**: Point-in-time recovery
- **Daily snapshots**: Retained for 30 days
- **Weekly snapshots**: Retained for 6 months
- **Monthly snapshots**: Retained for 1 year

### Critical Data Export
```bash
# Weekly export of auth database
mongodump --uri="mongodb+srv://..." --db=maula-auth-db --out=/backups/

# Daily export of analytics data
mongoexport --uri="mongodb+srv://..." --db=ipintel-db --collection=analytics
```

---

## 🔐 Security Measures

1. **Encryption at Rest**: MongoDB Atlas default
2. **Encryption in Transit**: TLS/SSL enforced
3. **Network Isolation**: VPC peering with AWS
4. **IP Whitelisting**: Only AWS EC2 IPs
5. **Role-Based Access**: Separate DB users per service
6. **Audit Logging**: Track all database access
7. **Secrets Management**: Store credentials in AWS Secrets Manager

---

## 📏 Scaling Strategy

### Vertical Scaling
- **Free Tier**: M0 (Shared, 512 MB)
- **Pro Tier**: M10 (2 GB RAM, 10 GB storage)
- **Enterprise**: M30+ (8+ GB RAM, auto-scaling)

### Horizontal Scaling (Sharding)
```javascript
// Shard key for analyses collection
sh.shardCollection("ipintel-db.analyses", { userId: "hashed" });

// Ensures even distribution across shards
```

---

**Next:** LLM Integration Architecture
