# ⚙️ Backend Architecture - MAULA.AI

## 🏗️ Backend Structure

```
BACKEND ARCHITECTURE
│
├─ 🔐 Auth Service (Central Grid Station)
│   └─ User authentication, JWT, OAuth, SSO for all 50 subdomains
│
├─ 🌐 API Gateway (Central Grid Station)
│   └─ Route requests, rate limiting, API key validation
│
└─ 🛡️ 50 Independent Tool Backends (50 Buildings)
    ├─ Each tool = 3 microservices:
    │   ├─ API Service (Node.js) - REST endpoints
    │   ├─ ML Engine (Python) - Machine learning models
    │   └─ AI Assistant (Node.js) - Conversational AI + WebSocket
    ├─ Own database connection
    └─ Complete isolation (no code sharing)
```

**Total Microservices:** 152
- 1 Auth Service
- 1 API Gateway
- 50 Tools × 3 Services = 150 tool microservices

---

## 🤖 AI Assistant Integration (CRITICAL)

**Every tool backend MUST include AI Assistant endpoints** to support the Neural Link Interface on the frontend.

### AI Assistant Service Architecture

```
Tool AI Assistant Service
│
├─ WebSocket Server (Real-time chat)
│   ├─ Connection management
│   ├─ Message broadcasting
│   └─ Session persistence
│
├─ LLM Router (Multi-provider support)
│   ├─ Google Gemini API
│   ├─ Anthropic Claude API
│   ├─ OpenAI GPT API
│   ├─ xAI Grok API
│   ├─ Mistral AI API
│   └─ Meta Llama API (Together AI)
│
├─ Function Calling Engine
│   ├─ Tool-specific function declarations
│   ├─ Function execution handlers
│   └─ Response formatting
│
├─ Conversation Storage
│   ├─ Save chat sessions to MongoDB
│   ├─ Load previous conversations
│   └─ User preference persistence
│
└─ Context Management
    ├─ Tool-specific system prompts
    ├─ Conversation memory
    └─ Multi-turn dialogue handling
```

---

## 📂 Backend Directory Structure

```
backend/
│
├─ shared-services/                   # Only Auth & API Gateway
│   │
│   ├─ auth-service/                  # Authentication (Node.js)
│   │   ├─ src/
│   │   │   ├─ controllers/
│   │   │   │   ├─ authController.ts
│   │   │   │   └─ userController.ts
│   │   │   ├─ middleware/
│   │   │   │   ├─ authMiddleware.ts
│   │   │   │   └─ rateLimiter.ts
│   │   │   ├─ models/
│   │   │   │   └─ User.ts
│   │   │   ├─ routes/
│   │   │   │   ├─ auth.ts
│   │   │   │   └─ users.ts
│   │   │   ├─ services/
│   │   │   │   ├─ jwtService.ts
│   │   │   │   └─ oauthService.ts
│   │   │   ├─ utils/
│   │   │   └─ server.ts
│   │   ├─ package.json
│   │   ├─ tsconfig.json
│   │   └─ Dockerfile
│   │
│   └─ api-gateway/                   # API Gateway (Node.js)
│       ├─ src/
│       │   ├─ routes/
│       │   │   └─ index.ts           # Route to all 50 tools
│       │   ├─ middleware/
│       │   │   ├─ rateLimit.ts
│       │   │   └─ apiKeyAuth.ts
│       │   ├─ utils/
│       │   └─ server.ts
│       ├─ package.json
│       └─ Dockerfile
│
├─ tools/
│   ├─ 01-fraudguard/                 # Tool 1 Backend (Standalone)
│   │   ├─ api/                       # Node.js API
│   │   │   ├─ src/
│   │   │   │   ├─ controllers/
│   │   │   │   │   ├─ fraudController.ts
│   │   │   │   │   └─ aiController.ts
│   │   │   │   ├─ models/
│   │   │   │   │   ├─ Transaction.ts
│   │   │   │   │   └─ FraudScore.ts
│   │   │   │   ├─ routes/
│   │   │   │   │   ├─ fraud.ts
│   │   │   │   │   └─ ai.ts
│   │   │   │   ├─ services/
│   │   │   │   │   ├─ fraudService.ts
│   │   │   │   │   ├─ llmService.ts
│   │   │   │   │   └─ webhookService.ts
│   │   │   │   ├─ middleware/
│   │   │   │   ├─ utils/
│   │   │   │   └─ server.ts
│   │   │   ├─ package.json
│   │   │   ├─ tsconfig.json
│   │   │   └─ Dockerfile
│   │   │
│   │   ├─ ml-engine/                 # Python ML Engine
│   │   │   ├─ src/
│   │   │   │   ├─ models/
│   │   │   │   │   ├─ fraud_model.py
│   │   │   │   │   └─ risk_scorer.py
│   │   │   │   ├─ services/
│   │   │   │   │   ├─ prediction.py
│   │   │   │   │   └─ training.py
│   │   │   │   ├─ api/
│   │   │   │   │   └─ main.py       # FastAPI endpoints
│   │   │   │   └─ utils/
│   │   │   ├─ requirements.txt
│   │   │   └─ Dockerfile
│   │   │
│   │   └─ ai-assistant/              # AI Chat Service (Node.js)
│   │       ├─ src/
│   │       │   ├─ services/
│   │       │   │   ├─ claudeService.ts
│   │       │   │   ├─ gptService.ts
│   │       │   │   ├─ grokService.ts
│   │       │   │   ├─ mistralService.ts
│   │       │   │   └─ llmRouter.ts
│   │       │   ├─ websocket/
│   │       │   │   └─ chatHandler.ts
│   │       │   ├─ models/
│   │       │   │   └─ ChatHistory.ts
│   │       │   └─ server.ts
│   │       ├─ package.json
│   │       └─ Dockerfile
│   │
│   ├─ 02-smartscore/                 # Tool 2 (Same structure)
│   │   ├─ api/
│   │   ├─ ml-engine/
│   │   └─ ai-assistant/
│   │
│   ├─ 03-checkoutshield/             # Tool 3
│   ├─ 04-fraudflow/                  # Tool 4
│   ├─ 05-riskengine/                 # Tool 5
│   ├─ 06-deviceprint/                # Tool 6
│   ├─ 07-trustdevice/                # Tool 7
│   ├─ 08-bioscan/                    # Tool 8
│   ├─ 09-multiauth/                  # Tool 9
│   ├─ 10-verifyme/                   # Tool 10
│   ├─ 11-ipintel/                    # Tool 11
│   ├─ 12-proxydetect/                # Tool 12
│   ├─ 13-georisk/                    # Tool 13
│   ├─ 14-ipscore/                    # Tool 14
│   ├─ 15-fraudcheck/                 # Tool 15
│   ├─ 16-paymentshield/              # Tool 16
│   ├─ 17-transactguard/              # Tool 17
│   ├─ 18-revenuedefense/             # Tool 18
│   ├─ 19-smartpayment/               # Tool 19
│   ├─ 20-idverify/                   # Tool 20
│   ├─ 21-globalkyc/                  # Tool 21
│   ├─ 22-identityai/                 # Tool 22
│   ├─ 23-agecheck/                   # Tool 23
│   ├─ 24-botshield/                  # Tool 24
│   ├─ 25-challengedefense/           # Tool 25
│   ├─ 26-antibot/                    # Tool 26
│   ├─ 27-humancheck/                 # Tool 27
│   ├─ 28-iosattest/                  # Tool 28
│   ├─ 29-androidverify/              # Tool 29
│   ├─ 30-captchaplus/                # Tool 30
│   ├─ 31-adaptivemfa/                # Tool 31
│   ├─ 32-accessmanager/              # Tool 32
│   ├─ 33-emailguard/                 # Tool 33
│   ├─ 34-phoneverify/                # Tool 34
│   ├─ 35-contactscore/               # Tool 35
│   ├─ 36-geofence/                   # Tool 36
│   ├─ 37-travelrisk/                 # Tool 37
│   ├─ 38-vpndetect/                  # Tool 38
│   ├─ 39-socialverify/               # Tool 39
│   ├─ 40-digitalfootprint/           # Tool 40
│   ├─ 41-accountage/                 # Tool 41
│   ├─ 42-cryptorisk/                 # Tool 42
│   ├─ 43-walletcheck/                # Tool 43
│   ├─ 44-chainanalytics/             # Tool 44
│   ├─ 45-docscan/                    # Tool 45
│   ├─ 46-facematch/                  # Tool 46
│   ├─ 47-livenesscheck/              # Tool 47
│   ├─ 48-multiaccountdetect/         # Tool 48
│   ├─ 49-velocitycheck/              # Tool 49
│   └─ 50-sessionguard/               # Tool 50
│
└─ scripts/
    ├─ deploy.sh
    ├─ start-all.sh
    └─ stop-all.sh
```

---

## 🔧 Standard Tool Backend Structure

Every tool has 3 microservices:

### 1. API Service (Node.js + Express/Fastify)
```
api/
├─ src/
│   ├─ controllers/          # Request handlers
│   ├─ models/               # MongoDB schemas
│   ├─ routes/               # API endpoints
│   ├─ services/             # Business logic
│   ├─ middleware/           # Auth, validation
│   └─ server.ts             # Entry point
├─ package.json
├─ tsconfig.json
└─ Dockerfile
```

### 2. ML Engine (Python + FastAPI)
```
ml-engine/
├─ src/
│   ├─ models/               # ML models
│   ├─ services/             # Prediction logic
│   ├─ api/                  # FastAPI endpoints
│   ├─ training/             # Model training scripts
│   └─ utils/                # Helper functions
├─ requirements.txt
└─ Dockerfile
```

### 3. AI Assistant (Node.js + WebSocket)
```
ai-assistant/
├─ src/
│   ├─ services/
│   │   ├─ claudeService.ts   # Anthropic integration
│   │   ├─ gptService.ts      # OpenAI integration
│   │   ├─ grokService.ts     # xAI integration
│   │   ├─ mistralService.ts  # Mistral integration
│   │   ├─ geminiService.ts   # Google integration
│   │   └─ llmRouter.ts       # Route to selected LLM
│   ├─ websocket/
│   │   └─ chatHandler.ts     # WebSocket chat
│   ├─ models/
│   │   └─ ChatHistory.ts     # Chat logs
│   └─ server.ts
├─ package.json
└─ Dockerfile
```

---

## 🔄 API Endpoints (Example: IPIntel Tool)

### Tool API Endpoints
```typescript
// Node.js API (api/src/routes/ipintel.ts)

POST   /api/ipintel/analyze        # Analyze IP address
GET    /api/ipintel/history        # Get user's analysis history
GET    /api/ipintel/stats          # Get analytics
DELETE /api/ipintel/history/:id    # Delete history item
POST   /api/ipintel/webhook        # Webhook configuration
GET    /api/ipintel/api-key        # Get API key
POST   /api/ipintel/api-key        # Generate new API key
```

### ML Engine Endpoints
```python
# Python FastAPI (ml-engine/src/api/main.py)

POST   /ml/predict                 # Get IP risk score
POST   /ml/batch-predict           # Batch analysis
GET    /ml/model-info              # Model metadata
POST   /ml/retrain                 # Trigger retraining
```

### AI Assistant Endpoints
```typescript
// Node.js WebSocket (ai-assistant/src/websocket/)

WS     /ai/chat                    # WebSocket connection
POST   /ai/message                 # Send message (REST fallback)
GET    /ai/history                 # Get chat history
POST   /ai/provider                # Change LLM provider
GET    /ai/providers               # List available LLMs
```

---

## 🧠 LLM Integration Architecture

### Multi-Provider System
```typescript
// llmRouter.ts

interface LLMProvider {
  name: 'claude' | 'gpt' | 'grok' | 'mistral' | 'gemini';
  apiKey: string;
  model: string;
  maxTokens: number;
}

class LLMRouter {
  async sendMessage(
    provider: LLMProvider,
    message: string,
    context: any
  ): Promise<string> {
    switch (provider.name) {
      case 'claude':
        return await this.claudeService.chat(message, context);
      case 'gpt':
        return await this.gptService.chat(message, context);
      case 'grok':
        return await this.grokService.chat(message, context);
      case 'mistral':
        return await this.mistralService.chat(message, context);
      case 'gemini':
        return await this.geminiService.chat(message, context);
    }
  }
}
```

### Context Management
```typescript
// AI knows about the tool's current state

interface AIContext {
  toolName: string;
  userId: string;
  currentData: any;          // Current analysis results
  userHistory: any[];        // Previous interactions
  toolSettings: any;         // User's tool configuration
  recentQueries: string[];   // Last N queries
}
```

---

## 🔐 Authentication Flow

### JWT-based Auth
```typescript
// authMiddleware.ts

interface JWTPayload {
  userId: string;
  email: string;
  apiKeys: {
    [toolName: string]: string;
  };
  subscription: 'free' | 'pro' | 'enterprise';
  expiresAt: number;
}

// Verify token on each request
middleware.authenticate = async (req, res, next) => {
  const token = req.cookies.jwt || req.headers.authorization;
  const payload = jwt.verify(token, SECRET_KEY);
  req.user = payload;
  next();
};
```

---

## 📊 Database Integration

### MongoDB Collections (Per Tool)
```typescript
// Example: IPIntel Tool

// Collections:
// - ipintel_analyses (analysis results)
// - ipintel_chat_history (AI conversations)
// - ipintel_api_logs (API usage)
// - ipintel_webhooks (webhook configs)

interface IPAnalysis {
  _id: ObjectId;
  userId: string;
  ipAddress: string;
  riskScore: number;
  isProxy: boolean;
  isVPN: boolean;
  country: string;
  city: string;
  timestamp: Date;
}

interface ChatMessage {
  _id: ObjectId;
  userId: string;
  toolName: string;
  provider: string;
  message: string;
  response: string;
  context: any;
  timestamp: Date;
}
```

---

## ⚡ Real-time Communication

### WebSocket for AI Chat
```typescript
// chatHandler.ts

io.on('connection', (socket) => {
  socket.on('ai-message', async (data) => {
    const { message, provider, context } = data;
    
    // Stream response from LLM
    const stream = await llmRouter.streamMessage(provider, message, context);
    
    stream.on('data', (chunk) => {
      socket.emit('ai-response-chunk', chunk);
    });
    
    stream.on('end', () => {
      socket.emit('ai-response-complete');
    });
  });
});
```

---

## 🔄 Inter-Service Communication

### Tool API → ML Engine
```typescript
// fraudService.ts (Node.js API)

async analyzeFraud(transactionData: any): Promise<FraudScore> {
  // Call Python ML engine
  const response = await axios.post('http://ml-engine:8000/ml/predict', {
    data: transactionData
  });
  
  return response.data;
}
```

### Tool API → AI Assistant
```typescript
// aiController.ts

async chatWithAI(message: string, userId: string) {
  // Forward to AI assistant service
  const response = await axios.post('http://ai-assistant:3001/ai/message', {
    userId,
    message,
    context: await this.getToolContext(userId)
  });
  
  return response.data;
}
```

---

## 🛡️ Security Measures

1. **API Key Authentication**: Per-tool API keys
2. **Rate Limiting**: Redis-based throttling
3. **Input Validation**: Joi/Zod schemas
4. **SQL Injection Prevention**: MongoDB (NoSQL)
5. **XSS Protection**: Sanitize inputs
6. **CORS**: Whitelist domains
7. **Encryption**: Data at rest + in transit

---

## 📈 Monitoring & Logging

```typescript
// logger.ts

import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.MongoDB({
      db: MONGO_URI,
      collection: 'logs'
    })
  ]
});
```

---

**Next:** Database Architecture Design
