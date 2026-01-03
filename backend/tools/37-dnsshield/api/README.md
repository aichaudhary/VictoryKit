# DNSShield API

Advanced DNS Security and Threat Analysis Platform with real-time monitoring, threat intelligence integration, and comprehensive domain protection.

## Features

### 🔍 Advanced DNS Threat Detection
- **Real-time DNS Query Analysis**: Monitor and analyze all DNS queries for malicious patterns
- **Domain Reputation Scoring**: Multi-source reputation checking with threat intelligence feeds
- **DNS Tunneling Detection**: Identify data exfiltration attempts through DNS channels
- **Malware Domain Blocking**: Automatic blocking of known malicious domains
- **Phishing Domain Detection**: Advanced phishing domain identification and prevention

### 🛡️ DNS Security Policies
- **Flexible Filtering Rules**: Domain-based, category-based, and custom policy enforcement
- **Time-based Restrictions**: Schedule-based DNS access controls
- **User/Group Policies**: Individual and group-based DNS filtering
- **Geographic Filtering**: Country and region-based domain restrictions
- **Content Category Blocking**: Block domains by content type (gambling, adult, etc.)

### 📊 Real-time DNS Monitoring
- **Live Query Monitoring**: Real-time DNS traffic analysis with WebSocket updates
- **Threat Intelligence Feeds**: Integration with 50+ threat intelligence sources
- **DNS Analytics Dashboard**: Comprehensive reporting and visualization
- **Alert System**: Automated notifications for suspicious DNS activity
- **Compliance Reporting**: Audit trails and regulatory compliance reports

### 🔗 Enterprise Integration
- **SIEM Integration**: Connect with Splunk, ELK, QRadar, LogRhythm
- **Firewall Integration**: Automatic rule updates in enterprise firewalls
- **SOAR Platforms**: Integration with Cortex XSOAR, IBM Resilient
- **Identity Management**: Okta, Active Directory integration
- **API Gateway Integration**: Kong, Cloudflare, Akamai compatibility

## Quick Start

### Prerequisites
- Node.js 16+
- MongoDB
- Redis (optional, for caching)

### Installation

1. **Navigate to the DNSShield API directory:**
   ```bash
   cd backend/tools/37-dnsshield/api
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

The API will be available at `http://localhost:4037`

## API Endpoints

### DNS Query Analysis

#### Analyze DNS Query
```http
POST /api/v1/dnsshield/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "domain": "malicious-domain.com",
  "queryType": "A",
  "sourceIP": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}
```

#### Batch Domain Analysis
```http
POST /api/v1/dnsshield/analyze/batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "domains": ["domain1.com", "domain2.com", "domain3.com"],
  "options": {
    "checkCache": true,
    "includeReputation": true
  }
}
```

### DNS Policies

#### Create DNS Policy
```http
POST /api/v1/dnsshield/policies
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Corporate DNS Policy",
  "type": "domain_filter",
  "rules": {
    "blockedDomains": ["facebook.com", "twitter.com"],
    "blockedCategories": ["social-media", "gambling"],
    "allowedDomains": ["company.com", "*.company.com"]
  },
  "scope": {
    "type": "group",
    "groupId": "employees"
  },
  "schedule": {
    "timezone": "America/New_York",
    "restrictions": [
      {
        "days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
        "startTime": "09:00",
        "endTime": "17:00"
      }
    ]
  },
  "enabled": true
}
```

#### Get DNS Policies
```http
GET /api/v1/dnsshield/policies?page=1&limit=20&type=domain_filter&enabled=true
Authorization: Bearer <token>
```

### DNS Monitoring

#### Get DNS Query Logs
```http
GET /api/v1/dnsshield/logs?page=1&limit=50&startDate=2024-01-01&endDate=2024-01-31&threatLevel=high
Authorization: Bearer <admin-token>
```

#### Get Real-time DNS Statistics
```http
GET /api/v1/dnsshield/stats/realtime?timeRange=24h&includeThreats=true
Authorization: Bearer <admin-token>
```

#### Get Domain Reputation
```http
GET /api/v1/dnsshield/reputation/{domain}
Authorization: Bearer <token>
```

### Threat Intelligence

#### Get Threat Intelligence Feeds
```http
GET /api/v1/dnsshield/threats/feeds?source=virustotal&limit=100
Authorization: Bearer <admin-token>
```

#### Update Threat Intelligence
```http
POST /api/v1/dnsshield/threats/update
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "sources": ["virustotal", "abuseipdb", "phishtank"],
  "forceUpdate": false
}
```

### DNS Analytics

#### Generate DNS Report
```http
POST /api/v1/dnsshield/reports/generate
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "type": "threat_summary",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "filters": {
    "threatLevel": ["high", "critical"],
    "categories": ["malware", "phishing"]
  }
}
```

#### Get DNS Analytics
```http
GET /api/v1/dnsshield/analytics?metric=queries_per_hour&timeRange=7d
Authorization: Bearer <admin-token>
```

## WebSocket Events

### Real-time DNS Monitoring
```javascript
// Connect to WebSocket
const socket = io('http://localhost:4037');

// Join monitoring room
socket.emit('join-dns-monitoring', userId);

// Listen for DNS queries
socket.on('dns-query', (data) => {
  console.log('New DNS query:', data);
  // data: { domain, queryType, sourceIP, threatLevel, timestamp }
});

// Listen for threats detected
socket.on('dns-threat-detected', (threat) => {
  console.log('Threat detected:', threat);
  // threat: { domain, threatType, severity, source, timestamp }
});

// Listen for policy violations
socket.on('dns-policy-violation', (violation) => {
  console.log('Policy violation:', violation);
  // violation: { domain, policyId, userId, action, timestamp }
});
```

### Real-time Statistics
```javascript
// Request statistics
socket.emit('request-dns-stats', {
  timeRange: '24h',
  metrics: ['queries', 'threats', 'blocks']
});

// Listen for updates
socket.on('dns-stats-update', (stats) => {
  console.log('DNS Statistics:', stats);
  // stats: { totalQueries, threatsDetected, domainsBlocked, topThreats }
});
```

## Configuration

### Environment Variables

#### Database & Core
```env
PORT=4037
MONGODB_URI=mongodb://localhost:27017/dnsshield_db
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

#### Authentication
```env
DNSSHIELD_JWT_SECRET=your-dnsshield-jwt-secret-key
JWT_EXPIRES_IN=24h
```

#### External APIs
```env
# Threat Intelligence
DNSSHIELD_VIRUSTOTAL_API_KEY=your-virustotal-api-key
DNSSHIELD_ABUSEIPDB_API_KEY=your-abuseipdb-api-key
DNSSHIELD_PHISHTANK_API_KEY=your-phishtank-api-key

# DNS Security
DNSSHIELD_OPENDNS_API_KEY=your-opendns-api-key
DNSSHIELD_QUAD9_API_KEY=your-quad9-api-key

# Enterprise Integration
DNSSHIELD_CLOUDFLARE_API_KEY=your-cloudflare-api-key
DNSSHIELD_CROWDSTRIKE_API_KEY=your-crowdstrike-api-key
```

#### DNS Configuration
```env
DNSSHIELD_DEFAULT_DNS_SERVERS=8.8.8.8,1.1.1.1
DNSSHIELD_CACHE_TTL_SECONDS=300
DNSSHIELD_MAX_QUERIES_PER_MINUTE=10000
DNSSHIELD_THREAT_DETECTION_ENABLED=true
DNSSHIELD_AUTO_BLOCK_ENABLED=true
```

## Security Features

### DNS Security
- **DNSSEC Validation**: Ensure DNS response integrity
- **DNS over HTTPS/TLS**: Encrypted DNS queries
- **Rate Limiting**: Prevent DNS amplification attacks
- **Query Logging**: Comprehensive audit trails

### Threat Detection
- **Machine Learning Models**: AI-powered threat detection
- **Behavioral Analysis**: Identify suspicious DNS patterns
- **Anomaly Detection**: Statistical analysis of DNS traffic
- **Zero-day Protection**: Unknown threat identification

### Access Control
- **Role-based Access**: Admin, analyst, user permissions
- **Multi-factor Authentication**: Enhanced security for admin access
- **API Key Management**: Secure external API integration
- **Audit Logging**: All actions and changes logged

## Integration Examples

### JavaScript Client
```javascript
const DNSShieldClient = {
  async analyzeDomain(domain, token) {
    const response = await fetch('/api/v1/dnsshield/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ domain })
    });
    return response.json();
  },

  async getPolicies(token) {
    const response = await fetch('/api/v1/dnsshield/policies', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  connectWebSocket(token) {
    const socket = io('http://localhost:4037', {
      auth: { token }
    });

    socket.on('dns-threat-detected', (threat) => {
      console.log('Threat detected:', threat);
    });

    return socket;
  }
};
```

### Python Client
```python
import requests
import socketio

class DNSShieldClient:
    def __init__(self, base_url="http://localhost:4037", token=None):
        self.base_url = base_url
        self.token = token
        self.headers = {'Authorization': f'Bearer {token}'} if token else {}

    def analyze_domain(self, domain):
        response = requests.post(
            f"{self.base_url}/api/v1/dnsshield/analyze",
            json={"domain": domain},
            headers=self.headers
        )
        return response.json()

    def get_realtime_stats(self):
        response = requests.get(
            f"{self.base_url}/api/v1/dnsshield/stats/realtime",
            headers=self.headers
        )
        return response.json()

    def connect_websocket(self):
        sio = socketio.Client()
        sio.connect(self.base_url, auth={'token': self.token})

        @sio.on('dns-threat-detected')
        def on_threat(threat):
            print(f"Threat detected: {threat}")

        return sio
```

## Monitoring & Health Checks

### Health Check Endpoint
```http
GET /health
```
Returns service health status, database connectivity, and external API status.

### Metrics
- DNS query throughput and latency
- Threat detection accuracy and false positives
- Cache hit rates and performance
- External API response times

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
EXPOSE 4037
CMD ["npm", "start"]
```

### Production Checklist
- [ ] Configure production MongoDB cluster
- [ ] Set up Redis for caching
- [ ] Configure external DNS resolvers
- [ ] Set up monitoring and alerting
- [ ] Configure SSL/TLS certificates
- [ ] Set up load balancer
- [ ] Configure firewall rules
- [ ] Enable DNSSEC validation

## DNS Security Best Practices

### Implementation Guidelines
1. **DNSSEC Deployment**: Always validate DNSSEC signatures
2. **Rate Limiting**: Implement query rate limiting to prevent abuse
3. **Monitoring**: Continuous monitoring of DNS traffic patterns
4. **Threat Intelligence**: Regular updates from multiple threat feeds
5. **Access Control**: Least privilege access to DNS management
6. **Logging**: Comprehensive logging of all DNS queries and responses

### Security Considerations
- **Data Exfiltration Prevention**: Monitor for DNS tunneling
- **Command and Control Detection**: Identify malware C2 over DNS
- **Phishing Prevention**: Block phishing domains proactively
- **DDoS Mitigation**: Rate limiting and traffic analysis
- **Compliance**: GDPR, HIPAA, PCI-DSS compliance features

## Troubleshooting

### Common Issues

1. **High False Positive Rate**
   - Adjust threat detection sensitivity
   - Update threat intelligence feeds
   - Review and tune policies

2. **Performance Issues**
   - Check Redis cache configuration
   - Optimize database queries
   - Review external API rate limits

3. **DNS Resolution Failures**
   - Verify DNS server configuration
   - Check network connectivity
   - Review firewall rules

### Logs
- Application logs: Console output with Winston
- DNS query logs: MongoDB collections
- Threat detection logs: Separate collection for analysis
- Use `NODE_ENV=development` for detailed logging

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