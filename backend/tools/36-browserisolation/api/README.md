# BrowserIsolation API

Advanced web content filtering API with real-time threat detection, policy management, and comprehensive security analysis.

## Features

### 🔍 Advanced Threat Detection
- **Multi-API Integration**: Google Safe Browsing, VirusTotal, PhishTank, AbuseIPDB
- **Content Analysis**: IBM Watson, Microsoft Content Moderator, BrightCloud categorization
- **Real-time Analysis**: WebSocket-powered live threat assessment
- **Risk Scoring**: Dynamic risk calculation based on multiple threat vectors

### 🛡️ Policy Management
- **Flexible Policies**: URL filtering, domain blocking, keyword filtering, category-based rules
- **User Profiles**: Individual user preferences and parental controls
- **Time Restrictions**: Schedule-based access controls
- **Priority-based Rules**: Hierarchical policy enforcement

### 📊 Real-time Monitoring
- **Live Statistics**: Real-time dashboard with filtering metrics
- **Access Logging**: Comprehensive audit trails
- **Alert System**: Automated threat notifications
- **WebSocket Updates**: Live data streaming

### 🔗 Enterprise Integration
- **Security Stack**: Microsoft Sentinel, Cortex XSOAR, Defender integration
- **SIEM Integration**: Centralized security event management
- **API Gateways**: Kong, Cloudflare, Akamai compatibility
- **Identity Management**: Okta, Active Directory integration

## Quick Start

### Prerequisites
- Node.js 16+
- MongoDB
- Redis (optional, for caching)

### Installation

1. **Clone and navigate to the BrowserIsolation API directory:**
   ```bash
   cd backend/tools/36-browserisolation/api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

The API will be available at `http://localhost:4025`

## API Endpoints

### URL Analysis

#### Analyze Single URL
```http
POST /api/v1/browserisolation/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://example.com",
  "options": {
    "checkCache": true
  }
}
```

#### Batch URL Analysis
```http
POST /api/v1/browserisolation/analyze/batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "urls": ["https://example1.com", "https://example2.com"],
  "options": {
    "checkCache": true
  }
}
```

### Policy Management

#### Create Policy
```http
POST /api/v1/browserisolation/policies
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Corporate Web Filter",
  "type": "category_filter",
  "rules": {
    "blockedCategories": ["gambling", "adult", "social-media"]
  },
  "scope": {
    "type": "global"
  },
  "priority": 10,
  "enabled": true
}
```

#### Get Policies
```http
GET /api/v1/browserisolation/policies?page=1&limit=20&type=category_filter
Authorization: Bearer <token>
```

### User Profiles

#### Get User Profile
```http
GET /api/v1/browserisolation/profile
Authorization: Bearer <token>
```

#### Update User Profile
```http
PUT /api/v1/browserisolation/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "preferences": {
    "safeSearch": true,
    "blockAdultContent": true
  },
  "parentalControls": {
    "enabled": true,
    "ageRestriction": 13
  }
}
```

### Monitoring & Analytics

#### Get Access Logs
```http
GET /api/v1/browserisolation/logs?page=1&limit=50&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <admin-token>
```

#### Get Real-time Statistics
```http
GET /api/v1/browserisolation/stats/realtime?timeRange=24h
Authorization: Bearer <admin-token>
```

#### Generate Report
```http
POST /api/v1/browserisolation/reports/generate
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "type": "access_summary",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

## WebSocket Events

### Real-time Analysis
```javascript
// Connect to WebSocket
const socket = io('http://localhost:4025');

// Join user room
socket.emit('join-user-room', userId);

// Analyze URL in real-time
socket.emit('analyze-url', {
  url: 'https://example.com',
  userId: userId
});

// Listen for results
socket.on('analysis-result', (data) => {
  console.log('Analysis result:', data);
});

// Listen for errors
socket.on('analysis-error', (error) => {
  console.error('Analysis error:', error);
});
```

### Real-time Statistics
```javascript
// Request statistics
socket.emit('request-stats', {
  timeRange: '24h',
  userId: userId
});

// Listen for updates
socket.on('stats-update', (stats) => {
  console.log('Statistics:', stats);
});
```

## Configuration

### Environment Variables

#### Database
```env
MONGODB_URI=mongodb://localhost:27017/victorykit_browserisolation
REDIS_URL=redis://localhost:6379
```

#### Authentication
```env
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h
```

#### External APIs
```env
# Threat Intelligence
WEBFILTER_GOOGLE_SAFE_BROWSING_API_KEY=your-key
WEBFILTER_VIRUSTOTAL_DOMAIN_API_KEY=your-key
WEBFILTER_PHISHTANK_API_KEY=your-key

# Content Analysis
WEBFILTER_IBM_WATSON_API_KEY=your-key
WEBFILTER_MICROSOFT_CONTENT_MODERATOR_API_KEY=your-key

# Enterprise Integration
WEBFILTER_CLOUDFLARE_API_KEY=your-key
WEBFILTER_CROWDSTRIKE_API_KEY=your-key
```

#### Server Configuration
```env
PORT=4025
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (admin/user)
- API key management for external services

### Rate Limiting
- Configurable rate limits per endpoint
- User-based and IP-based limiting
- Admin bypass capabilities

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection via Helmet

### Audit & Compliance
- Comprehensive access logging
- Alert system for security events
- GDPR-compliant data handling

## Integration Examples

### JavaScript Client
```javascript
const BrowserIsolationClient = {
  async analyzeUrl(url, token) {
    const response = await fetch('/api/v1/browserisolation/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });
    return response.json();
  },

  async getUserProfile(token) {
    const response = await fetch('/api/v1/browserisolation/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  }
};
```

### cURL Examples
```bash
# Analyze URL
curl -X POST http://localhost:4025/api/v1/browserisolation/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Get statistics
curl http://localhost:4025/api/v1/browserisolation/stats/realtime \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Monitoring & Health Checks

### Health Check Endpoint
```http
GET /health
```
Returns service health status and uptime information.

### Metrics
- Request/response metrics
- Error rates and types
- Database connection status
- External API health

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Development Mode
```bash
npm run dev
```

## Deployment

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4025
CMD ["npm", "start"]
```

### Production Checklist
- [ ] Configure production environment variables
- [ ] Set up MongoDB replica set
- [ ] Configure Redis for caching
- [ ] Set up monitoring and alerting
- [ ] Configure SSL/TLS certificates
- [ ] Set up load balancer
- [ ] Configure firewall rules

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB URI in environment variables
   - Ensure MongoDB is running and accessible
   - Verify network connectivity

2. **External API Errors**
   - Verify API keys are valid and have sufficient credits
   - Check API rate limits
   - Review API documentation for changes

3. **WebSocket Connection Issues**
   - Check CORS configuration
   - Verify Socket.IO client version compatibility
   - Check firewall settings

### Logs
- Application logs are written to console
- Use `NODE_ENV=development` for detailed logging
- Check MongoDB logs for database issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting guide