# BotDefender Backend API

## Overview

BotDefender is an advanced Bot Detection and Mitigation Platform that provides comprehensive protection against automated threats. The platform uses machine learning algorithms, behavioral analysis, and real-time monitoring to identify and block malicious bots while allowing legitimate automated traffic.

## Architecture

### Core Components

- **Bot Detection Engine**: Multi-layered bot identification using ML and heuristics
- **Behavioral Analysis**: Real-time traffic pattern analysis and anomaly detection
- **Challenge-Response System**: CAPTCHA and proof-of-work challenges
- **Rate Limiting**: Advanced rate limiting with bot-specific rules
- **IP Reputation**: Global IP reputation database integration
- **Traffic Analytics**: Comprehensive bot traffic analysis and reporting

### Technology Stack

- **Runtime**: Node.js 18+ with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis for session management and rate limiting
- **Message Queue**: Redis/RabbitMQ for async processing
- **ML Engine**: Python-based machine learning models
- **Monitoring**: Prometheus + Grafana stack

## Database Schema

### Collections

#### bot_detections
```javascript
{
  _id: ObjectId,
  sessionId: String,
  ipAddress: String,
  userAgent: String,
  fingerprint: {
    canvas: String,
    webgl: String,
    audio: String,
    fonts: [String],
    plugins: [String],
    timezone: String,
    language: String
  },
  behavior: {
    mouseMovements: [{
      x: Number,
      y: Number,
      timestamp: Number
    }],
    keystrokes: [{
      key: String,
      timestamp: Number,
      interval: Number
    }],
    scrollPatterns: [{
      direction: String,
      speed: Number,
      timestamp: Number
    }]
  },
  detection: {
    confidence: Number, // 0-1
    botType: String, // 'crawler', 'scraper', 'spam_bot', 'ddos_bot', etc.
    detectionMethod: String, // 'ml', 'heuristic', 'fingerprint', 'behavior'
    rules: [String] // Matched detection rules
  },
  response: {
    action: String, // 'block', 'challenge', 'allow', 'monitor'
    challengeType: String, // 'captcha', 'proof_of_work', 'javascript'
    blocked: Boolean,
    reason: String
  },
  metadata: {
    referrer: String,
    url: String,
    method: String,
    headers: Object,
    geoLocation: {
      country: String,
      city: String,
      asn: String,
      isp: String
    }
  },
  timestamp: Date
}
```

#### bot_rules
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  type: String, // 'fingerprint', 'behavior', 'heuristic', 'ml'
  conditions: [{
    field: String,
    operator: String, // 'equals', 'contains', 'regex', 'range'
    value: any,
    weight: Number // For scoring
  }],
  action: {
    type: String, // 'block', 'challenge', 'flag', 'log'
    severity: String, // 'low', 'medium', 'high', 'critical'
    duration: Number // Block duration in seconds
  },
  enabled: Boolean,
  priority: Number, // Execution order
  hits: Number, // Number of times triggered
  lastHit: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### ip_reputation
```javascript
{
  _id: ObjectId,
  ipAddress: String,
  reputation: {
    score: Number, // 0-100, higher is worse
    category: String, // 'clean', 'suspicious', 'malicious', 'botnet'
    sources: [{
      name: String, // 'abuseipdb', 'spamhaus', 'firehol', etc.
      score: Number,
      lastUpdated: Date
    }]
  },
  history: [{
    action: String,
    reason: String,
    timestamp: Date
  }],
  lastSeen: Date,
  firstSeen: Date,
  totalRequests: Number,
  blockedRequests: Number
}
```

#### challenges
```javascript
{
  _id: ObjectId,
  sessionId: String,
  type: String, // 'captcha', 'proof_of_work', 'javascript'
  difficulty: String, // 'easy', 'medium', 'hard'
  data: {
    // CAPTCHA specific
    image: String, // Base64 encoded image
    answer: String, // Hashed correct answer

    // Proof of work
    challenge: String,
    target: String,
    algorithm: String,

    // JavaScript challenge
    script: String,
    expectedResult: String
  },
  attempts: Number,
  maxAttempts: Number,
  expiresAt: Date,
  solved: Boolean,
  solvedAt: Date,
  createdAt: Date
}
```

#### traffic_patterns
```javascript
{
  _id: ObjectId,
  ipAddress: String,
  timeWindow: {
    start: Date,
    end: Date
  },
  metrics: {
    totalRequests: Number,
    uniqueUrls: Number,
    avgResponseTime: Number,
    errorRate: Number,
    botProbability: Number
  },
  patterns: {
    requestFrequency: Number, // requests per minute
    urlDistribution: Object, // URL access patterns
    userAgentConsistency: Number, // 0-1, how consistent UAs are
    timingPatterns: {
      isHumanLike: Boolean,
      avgInterval: Number,
      burstiness: Number
    }
  },
  classification: {
    isBot: Boolean,
    confidence: Number,
    botType: String
  }
}
```

#### whitelists
```javascript
{
  _id: ObjectId,
  type: String, // 'ip', 'user_agent', 'fingerprint', 'domain'
  value: String,
  reason: String,
  addedBy: String,
  expiresAt: Date,
  active: Boolean,
  hits: Number,
  createdAt: Date
}
```

## API Endpoints

### Bot Detection
- `GET /api/detection/stats` - Bot detection statistics
- `GET /api/detection/recent` - Recent bot detections
- `GET /api/detection/:id` - Detection details
- `POST /api/detection/analyze` - Manual traffic analysis

### Rules Management
- `GET /api/rules` - List detection rules
- `POST /api/rules` - Create new rule
- `GET /api/rules/:id` - Get rule details
- `PUT /api/rules/:id` - Update rule
- `DELETE /api/rules/:id` - Delete rule
- `POST /api/rules/:id/test` - Test rule against sample data

### IP Reputation
- `GET /api/reputation/:ip` - Get IP reputation
- `POST /api/reputation/update` - Update IP reputation
- `GET /api/reputation/blacklist` - Get blacklisted IPs
- `POST /api/reputation/blacklist` - Add IP to blacklist

### Challenges
- `POST /api/challenge/generate` - Generate challenge
- `POST /api/challenge/verify` - Verify challenge response
- `GET /api/challenge/stats` - Challenge statistics

### Analytics
- `GET /api/analytics/traffic` - Traffic analysis
- `GET /api/analytics/bots` - Bot activity analytics
- `GET /api/analytics/effectiveness` - Detection effectiveness metrics
- `GET /api/analytics/geography` - Geographic bot distribution

### Configuration
- `GET /api/config` - Get platform configuration
- `PUT /api/config` - Update configuration
- `GET /api/config/rules` - Get active rules configuration

## Detection Methods

### Machine Learning Detection
```javascript
const detectBotML = async (features) => {
  const response = await axios.post('http://ml-engine:5000/predict', {
    model: 'bot_detector_v2',
    features: {
      mouseEntropy: calculateMouseEntropy(features.mouseMovements),
      keystrokeDynamics: analyzeKeystrokePatterns(features.keystrokes),
      timingPatterns: extractTimingFeatures(features.requests),
      fingerprintConsistency: checkFingerprintConsistency(features.fingerprint),
      behavioralScore: calculateBehavioralScore(features.behavior)
    }
  });
  return response.data.prediction;
};
```

### Heuristic Detection
```javascript
const heuristicDetection = (request) => {
  let score = 0;

  // Check user agent
  if (isKnownBotUserAgent(request.userAgent)) score += 0.3;

  // Check request patterns
  if (hasUnusualRequestFrequency(request)) score += 0.2;

  // Check fingerprint anomalies
  if (hasFingerprintAnomalies(request.fingerprint)) score += 0.25;

  // Check behavioral patterns
  if (hasBotLikeBehavior(request.behavior)) score += 0.25;

  return {
    isBot: score > 0.5,
    confidence: score,
    reasons: getScoreReasons(score)
  };
};
```

### Fingerprint Analysis
```javascript
const analyzeFingerprint = (fingerprint) => {
  const anomalies = [];

  // Check canvas fingerprint
  if (isCanvasFingerprintSuspicious(fingerprint.canvas)) {
    anomalies.push('suspicious_canvas_fingerprint');
  }

  // Check WebGL fingerprint
  if (isWebGLFingerprintSuspicious(fingerprint.webgl)) {
    anomalies.push('suspicious_webgl_fingerprint');
  }

  // Check font list
  if (hasIncompleteFontList(fingerprint.fonts)) {
    anomalies.push('incomplete_font_list');
  }

  // Check plugin list
  if (hasUnusualPluginList(fingerprint.plugins)) {
    anomalies.push('unusual_plugin_list');
  }

  return {
    isSuspicious: anomalies.length > 0,
    anomalies,
    score: calculateFingerprintScore(anomalies)
  };
};
```

## Challenge-Response System

### CAPTCHA Generation
```javascript
const generateCaptcha = () => {
  const captcha = createCaptcha({
    size: 4,
    ignoreChars: '0o1i',
    noise: 2,
    color: true,
    background: 'white'
  });

  return {
    id: generateId(),
    image: captcha.image,
    hash: hashAnswer(captcha.text),
    expiresAt: Date.now() + 300000 // 5 minutes
  };
};
```

### Proof of Work
```javascript
const generateProofOfWork = (difficulty = 'medium') => {
  const challenge = crypto.randomBytes(32).toString('hex');
  const target = getTargetForDifficulty(difficulty);

  return {
    challenge,
    target,
    algorithm: 'sha256',
    difficulty
  };
};
```

## Configuration

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/botdefender
REDIS_URI=redis://localhost:6379

# ML Engine
ML_ENGINE_URL=http://localhost:5000

# Security
ENCRYPTION_KEY=your-encryption-key
CAPTCHA_SECRET=your-captcha-secret

# External Services
ABUSEIPDB_API_KEY=your-abuseipdb-key
SPAMHAUS_API_KEY=your-spamhaus-key

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
```

### Detection Configuration
```javascript
const detectionConfig = {
  ml: {
    enabled: true,
    modelVersion: 'v2.1',
    confidenceThreshold: 0.8,
    fallbackToHeuristics: true
  },
  heuristics: {
    enabled: true,
    rules: [
      'user_agent_check',
      'request_frequency_check',
      'fingerprint_analysis',
      'behavioral_analysis'
    ]
  },
  challenges: {
    captcha: {
      enabled: true,
      difficulty: 'medium',
      maxAttempts: 3
    },
    proofOfWork: {
      enabled: false,
      difficulty: 'easy'
    }
  },
  rateLimiting: {
    enabled: true,
    windowMs: 60000, // 1 minute
    maxRequests: 30
  }
};
```

## Deployment

### Docker Compose
```yaml
version: '3.8'
services:
  botdefender-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/botdefender
      - REDIS_URI=redis://redis:6379
    depends_on:
      - mongodb
      - redis

  ml-engine:
    build: ../ml-engine
    ports:
      - "5000:5000"
    environment:
      - MODEL_PATH=/models/bot_detector_v2.pkl

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"

  redis:
    image: redis:7.0
    ports:
      - "6379:6379"
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: botdefender-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: botdefender-api
  template:
    metadata:
      labels:
        app: botdefender-api
    spec:
      containers:
      - name: botdefender-api
        image: botdefender/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: MONGODB_URI
          value: "mongodb://mongodb-service:27017/botdefender"
        - name: REDIS_URI
          value: "redis://redis-service:6379"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

## Monitoring & Analytics

### Key Metrics
- Bot detection rate and accuracy
- False positive/negative rates
- Challenge completion rates
- Geographic bot distribution
- Bot type classification
- Response times and throughput

### Logging
```javascript
const logDetection = (detection) => {
  logger.info('Bot Detection', {
    sessionId: detection.sessionId,
    ipAddress: detection.ipAddress,
    botType: detection.detection.botType,
    confidence: detection.detection.confidence,
    action: detection.response.action,
    timestamp: detection.timestamp
  });
};
```

### Health Checks
- `GET /health` - Application health
- `GET /health/database` - Database connectivity
- `GET /health/redis` - Redis connectivity
- `GET /health/ml-engine` - ML engine availability

## Security Considerations

### Data Protection
- Encrypt sensitive detection data
- Implement proper data retention policies
- Anonymize IP addresses in logs
- Secure API endpoints with authentication

### Performance
- Use Redis for high-throughput operations
- Implement connection pooling
- Cache frequently accessed data
- Optimize database queries

### Scalability
- Horizontal scaling with load balancers
- Database sharding for large datasets
- Message queues for async processing
- CDN integration for static assets

## Development

### Local Setup
```bash
# Install dependencies
npm install

# Start services
docker-compose up -d mongodb redis

# Run ML engine
cd ../ml-engine && python app.py

# Start development server
npm run dev

# Run tests
npm test
```

### Testing
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Load testing
npm run test:load

# Bot simulation testing
npm run test:bot-simulation
```

## Contributing

1. Follow the established code style
2. Add tests for new detection methods
3. Update documentation for API changes
4. Ensure ML models are properly versioned
5. Test against known bot signatures

## License

This project is licensed under the MIT License.