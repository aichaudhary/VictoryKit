# APIGuard Backend API

## Overview

APIGuard is a comprehensive API Security & Governance Platform that provides enterprise-grade security, monitoring, and management capabilities for API ecosystems. The platform enables organizations to secure, monitor, and govern their API infrastructure with advanced threat detection, rate limiting, authentication, and compliance features.

## Architecture

### Core Components

- **API Gateway**: Central entry point for all API traffic with security enforcement
- **Authentication Service**: Multi-factor authentication and authorization management
- **Rate Limiting Engine**: Advanced rate limiting with burst control and quota management
- **Threat Detection**: Real-time anomaly detection and attack pattern recognition
- **Audit & Compliance**: Comprehensive logging and compliance reporting
- **API Analytics**: Real-time metrics and performance monitoring

### Technology Stack

- **Runtime**: Node.js 18+ with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis for session management and rate limiting
- **Message Queue**: Redis/RabbitMQ for async processing
- **Monitoring**: Prometheus + Grafana stack
- **Security**: JWT, OAuth2, API Keys, mTLS

## Database Schema

### Collections

#### api_keys
```javascript
{
  _id: ObjectId,
  key: String, // Hashed API key
  name: String,
  owner: ObjectId, // Reference to user
  permissions: [{
    resource: String,
    actions: [String] // ['read', 'write', 'delete']
  }],
  rateLimit: {
    requests: Number,
    period: String, // 'minute', 'hour', 'day'
    burst: Number
  },
  status: String, // 'active', 'suspended', 'expired'
  createdAt: Date,
  expiresAt: Date,
  lastUsed: Date,
  usage: {
    totalRequests: Number,
    last24h: Number,
    last7d: Number,
    last30d: Number
  }
}
```

#### api_endpoints
```javascript
{
  _id: ObjectId,
  path: String,
  method: String, // GET, POST, PUT, DELETE
  service: String, // Target service name
  authentication: {
    required: Boolean,
    type: String, // 'jwt', 'api_key', 'oauth2', 'mtls'
    scopes: [String]
  },
  rateLimit: {
    enabled: Boolean,
    global: Boolean,
    custom: {
      requests: Number,
      period: String
    }
  },
  security: {
    cors: Boolean,
    hsts: Boolean,
    csp: String,
    inputValidation: Boolean
  },
  monitoring: {
    enabled: Boolean,
    metrics: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### api_requests
```javascript
{
  _id: ObjectId,
  apiKey: ObjectId,
  endpoint: ObjectId,
  method: String,
  path: String,
  statusCode: Number,
  responseTime: Number, // in milliseconds
  userAgent: String,
  ipAddress: String,
  geoLocation: {
    country: String,
    city: String,
    coordinates: [Number, Number]
  },
  headers: Object,
  queryParams: Object,
  body: Object, // Sanitized
  response: {
    size: Number,
    contentType: String
  },
  security: {
    threats: [String],
    anomalies: [String],
    blocked: Boolean,
    reason: String
  },
  timestamp: Date
}
```

#### rate_limits
```javascript
{
  _id: ObjectId,
  identifier: String, // API key, IP, or user ID
  type: String, // 'api_key', 'ip', 'user'
  window: {
    start: Date,
    end: Date
  },
  requests: Number,
  limit: Number,
  burst: Number,
  blocked: Boolean,
  resetAt: Date
}
```

#### security_events
```javascript
{
  _id: ObjectId,
  type: String, // 'attack', 'anomaly', 'violation'
  severity: String, // 'low', 'medium', 'high', 'critical'
  source: {
    ip: String,
    userAgent: String,
    apiKey: ObjectId
  },
  details: {
    attackType: String,
    payload: String,
    matchedRules: [String]
  },
  response: {
    action: String, // 'block', 'log', 'alert'
    blocked: Boolean
  },
  timestamp: Date
}
```

#### users
```javascript
{
  _id: ObjectId,
  email: String,
  username: String,
  password: String, // Hashed
  role: String, // 'admin', 'developer', 'viewer'
  mfa: {
    enabled: Boolean,
    secret: String,
    backupCodes: [String]
  },
  apiKeys: [ObjectId],
  permissions: [String],
  lastLogin: Date,
  status: String // 'active', 'suspended'
}
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/mfa/verify` - MFA verification
- `GET /api/auth/me` - Current user info

### API Keys Management
- `GET /api/keys` - List API keys
- `POST /api/keys` - Create API key
- `GET /api/keys/:id` - Get API key details
- `PUT /api/keys/:id` - Update API key
- `DELETE /api/keys/:id` - Delete API key
- `POST /api/keys/:id/regenerate` - Regenerate API key

### API Gateway
- `GET /api/gateway/endpoints` - List endpoints
- `POST /api/gateway/endpoints` - Register endpoint
- `PUT /api/gateway/endpoints/:id` - Update endpoint
- `DELETE /api/gateway/endpoints/:id` - Remove endpoint
- `GET /api/gateway/routes` - Get routing configuration

### Rate Limiting
- `GET /api/ratelimit/status` - Current rate limit status
- `PUT /api/ratelimit/config` - Update rate limit configuration
- `GET /api/ratelimit/metrics` - Rate limiting metrics

### Monitoring & Analytics
- `GET /api/analytics/requests` - API request analytics
- `GET /api/analytics/errors` - Error rate analytics
- `GET /api/analytics/performance` - Performance metrics
- `GET /api/analytics/security` - Security event analytics

### Security
- `GET /api/security/threats` - Threat intelligence
- `GET /api/security/anomalies` - Anomaly detection results
- `POST /api/security/blocklist` - Manage IP blocklist
- `GET /api/security/audit` - Security audit logs

## Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Multi-factor authentication (MFA) support
- Role-based access control (RBAC)
- API key authentication with granular permissions
- OAuth2 integration for third-party access

### Threat Detection
- SQL injection detection
- XSS prevention
- CSRF protection
- Input validation and sanitization
- Rate limiting and DDoS protection
- Anomaly detection using ML algorithms

### Compliance & Audit
- GDPR compliance features
- HIPAA compliance support
- PCI DSS compliance tools
- Comprehensive audit logging
- Data retention policies
- Compliance reporting

## Machine Learning Integration

### Anomaly Detection
```javascript
// ML Engine API integration
const detectAnomalies = async (requestData) => {
  const response = await axios.post('http://ml-engine:5000/detect', {
    features: extractFeatures(requestData),
    model: 'api_anomaly_detector'
  });
  return response.data.anomalies;
};
```

### Threat Classification
```javascript
const classifyThreat = async (payload) => {
  const response = await axios.post('http://ml-engine:5000/classify', {
    payload: payload,
    model: 'threat_classifier'
  });
  return response.data.threat_type;
};
```

### Predictive Analytics
```javascript
const predictTraffic = async (historicalData) => {
  const response = await axios.post('http://ml-engine:5000/predict', {
    data: historicalData,
    model: 'traffic_predictor',
    horizon: 24 // hours
  });
  return response.data.predictions;
};
```

## Configuration

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/apiguard
REDIS_URI=redis://localhost:6379

# Security
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
API_KEY_SALT=your-api-key-salt

# ML Engine
ML_ENGINE_URL=http://localhost:5000

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000

# External Services
OAUTH2_CLIENT_ID=your-client-id
OAUTH2_CLIENT_SECRET=your-client-secret
```

### Rate Limiting Configuration
```javascript
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Redis store for distributed rate limiting
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
};
```

## Deployment

### Docker Compose
```yaml
version: '3.8'
services:
  apiguard-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/apiguard
      - REDIS_URI=redis://redis:6379
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"

  redis:
    image: redis:7.0
    ports:
      - "6379:6379"

  ml-engine:
    build: ../ml-engine
    ports:
      - "5000:5000"
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: apiguard-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: apiguard-api
  template:
    metadata:
      labels:
        app: apiguard-api
    spec:
      containers:
      - name: apiguard-api
        image: apiguard/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: MONGODB_URI
          value: "mongodb://mongodb-service:27017/apiguard"
        - name: REDIS_URI
          value: "redis://redis-service:6379"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## Monitoring & Observability

### Metrics
- Request rate and latency
- Error rates by endpoint
- Authentication success/failure rates
- Rate limiting events
- Security threat detections
- Database connection pool stats
- Cache hit/miss ratios

### Logging
```javascript
const logRequest = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('API Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });

  next();
};
```

### Health Checks
- `GET /health` - Application health status
- `GET /health/database` - Database connectivity
- `GET /health/redis` - Redis connectivity
- `GET /health/ml-engine` - ML engine availability

## Security Best Practices

### API Key Security
- Use strong hashing algorithms (bcrypt/scrypt)
- Implement key rotation policies
- Monitor key usage patterns
- Automatic key expiration

### Data Protection
- Encrypt sensitive data at rest
- Use TLS 1.3 for all communications
- Implement proper input validation
- Sanitize all user inputs

### Compliance
- Regular security audits
- Penetration testing
- Vulnerability scanning
- Incident response planning

## Development

### Local Setup
```bash
# Install dependencies
npm install

# Start MongoDB and Redis
docker-compose up -d mongodb redis

# Run development server
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
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.